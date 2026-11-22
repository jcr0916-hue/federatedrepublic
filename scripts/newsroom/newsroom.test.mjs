import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { appendDecision, checkAppendOnly, ledgerPath, prepareLedgerChange, validateEntry } from "./ledger.mjs";
import {
  authorizeSubmission, checkRegisteredDesks, planSlot, prepareNoteChange, ROSTER_PATH, validateRoster,
} from "./roster.mjs";
import { test } from "node:test";

const root = fileURLToPath(new URL("../../", import.meta.url));
const initialRoster = JSON.parse(readFileSync(join(root, ROSTER_PATH)));
const slot = "2026-11-16T16:00:00Z";
const head = "a".repeat(40);
const receiptId = "10000000-0000-4000-8000-000000000001";
const decisionId = "20000000-0000-4000-8000-000000000001";
const receipt = {
  schemaVersion: 1,
  id: receiptId,
  key: `submissions/federal/2026-11-16/${receiptId}.json`,
  desk: "federal",
  title: "Synthetic report",
  kind: "report",
  summary: "",
  body: "Synthetic material for the test.",
  sourceRefs: ["", "torenthia-news-138"],
  submittedAt: "2026-11-16T16:00:05.000Z",
  status: "PROPOSED",
  nonCanonical: true,
};
const decision = {
  id: decisionId,
  previousId: null,
  recordedAt: "2026-11-16T16:30:00Z",
  editor: "test-editor",
  disposition: "REVISION_REQUESTED",
  note: "Add the published source.",
  followUp: { agentId: "federal", task: "Cite the record." },
};

function enabledRoster(...ids) {
  const roster = structuredClone(initialRoster);
  roster.automationEnabled = true;
  for (const agent of roster.agents) agent.enabled = ids.includes(agent.id);
  return validateRoster(roster);
}

test("the checked-in roster parks all four desks and both write paths", () => {
  const roster = validateRoster(initialRoster);
  assert.deepEqual(roster.agents.map(({ id }) => id), ["federal", "korda", "varek", "corindal"]);
  assert.ok(roster.agents.every(({ enabled }) => !enabled));
  assert.deepEqual(planSlot(roster, slot), { slot, automationEnabled: false, runs: [], deferred: [], maxCostCents: 0 });
  assert.throws(() => authorizeSubmission(roster, "federal"), /automation is off/);
  const perAgentOn = enabledRoster("federal");
  perAgentOn.automationEnabled = false;
  assert.deepEqual(planSlot(perAgentOn, slot).runs, []);
  assert.throws(() => authorizeSubmission(perAgentOn, "federal"), /automation is off/);
  assert.throws(() => prepareNoteChange(perAgentOn, "federal", head, {}), /automation is off/);
});

test("enabled and disabled desks are evaluated independently for scheduling and submission", () => {
  const roster = enabledRoster("federal", "varek");
  assert.deepEqual(planSlot(roster, "2026-11-16T16:55:00.100Z").runs,
    [{ agentId: "federal", runId: `federal/${slot}`, budget: roster.agents[0].budget }]);
  assert.deepEqual(planSlot(roster, "2026-11-17T16:00:00Z").runs, []);
  assert.deepEqual(planSlot(roster, "2026-11-18T16:00:00Z").runs.map(({ agentId }) => agentId), ["varek"]);
  assert.equal(authorizeSubmission(roster, "varek"), "varek");
  for (const id of ["korda", "unregistered"]) {
    assert.throws(() => authorizeSubmission(roster, id), /disabled or unregistered/);
    assert.throws(() => prepareNoteChange(roster, id, head, {}), /disabled or unregistered/);
  }
});

test("dry-run dispatch bounds the number and total reserved spend of due agents", () => {
  const roster = enabledRoster("federal", "korda", "varek");
  for (const agent of roster.agents) agent.cadence = { ...roster.agents[0].cadence };
  roster.dispatchLimits.maxAgentsPerSlot = 3;
  const first = planSlot(validateRoster(roster), slot);
  assert.equal(first.maxCostCents, 5);
  assert.deepEqual(first.runs.map(({ agentId }) => agentId), ["federal"]);
  assert.deepEqual(first.deferred, ["korda", "varek"]);
  roster.dispatchLimits = { maxAgentsPerSlot: 2, maxCostCentsPerSlot: 50 };
  const second = planSlot(validateRoster(roster), slot);
  assert.equal(second.maxCostCents, 10);
  assert.deepEqual(second.runs.map(({ agentId }) => agentId), ["federal", "korda"]);
  assert.deepEqual(second.deferred, ["varek"]);
  assert.throws(() => planSlot(roster, "2026-02-30T16:00:00Z"), /Invalid UTC/);
});

test("additional jurisdictions and specialist agent ids use the same schema", () => {
  const roster = enabledRoster("federal");
  for (const id of ["orath", "partisan-media", ...Array.from({ length: 20 }, (_, i) => `desk-${i}`)]) {
    const workspacePath = `docs/torenthia/agents/${id}/workspace`;
    roster.agents.push({ ...roster.agents[0], id, workspacePath, allowedWrites: [`${workspacePath}/notes.md`],
      inboxDesk: null, jurisdiction: id, enabled: false });
  }
  assert.equal(validateRoster(roster).agents.length, 26);
  assert.deepEqual(planSlot(roster, slot).runs.map(({ agentId }) => agentId), ["federal"]);
  roster.agents.at(-1).enabled = true;
  assert.throws(() => validateRoster(roster), /registered inbox desk/);
  assert.throws(() => authorizeSubmission(roster, "desk-19"), /no registered R2 inbox desk/);
});

test("the roster rejects duplicate identities, broad write scopes and invalid limits", () => {
  const cases = [
    [{ id: "federal" }, /listed twice/],
    [{ inboxDesk: "federal" }, /shares another/],
    [{ allowedWrites: ["docs/torenthia/agents"] }, /own notes.md/],
    [{ workspacePath: "../federal" }, /invalid workspace/],
    [{ enabled: "true" }, /must be a boolean/],
    [{ cadence: { dayUtc: "mon", hourUtc: 24 } }, /UTC weekday and hour/],
    [{ budget: { ...initialRoster.agents[0].budget, maxCostCents: 6 } }, /within the dispatch budget/],
    [{ model: { providerRef: "litellm", aliasRefs: ["not an alias reference"] } }, /named model aliases/],
  ];
  for (const [patch, error] of cases) {
    const roster = structuredClone(initialRoster);
    Object.assign(roster.agents[1], patch);
    assert.throws(() => validateRoster(roster), error);
  }
  const changed = structuredClone(initialRoster);
  changed.agents[0].inboxDesk = "federal-office";
  assert.throws(() => checkRegisteredDesks(initialRoster, validateRoster(changed)), /registered inbox identity/);
});

test("a note change uses the authenticated identity, exact file and observed branch head", () => {
  const roster = enabledRoster("korda");
  const path = "docs/torenthia/agents/korda/workspace/notes.md";
  const content = "A public editorial checkpoint.";
  assert.deepEqual(prepareNoteChange(roster, "korda", head, { path, content }),
    { branch: "agent-notes/korda", expectedHead: head, path, content });
  for (const badPath of [
    path.replace("korda", "federal"), path.replace("workspace/notes", "workspace/desk"),
    path.replace("notes", "../workspace/notes"), path.replace("notes", "NOTES"),
    path.replace("notes.md", "notes.md/extra"), ".github/workflows/newsroom-workspaces.yml",
    "torenthia/news/torenthia-news-138.html",
  ]) {
    assert.throws(() => prepareNoteChange(roster, "korda", head, { path: badPath, content }), /write scope/);
  }
  assert.throws(() => prepareNoteChange(roster, "korda", head, { path, content, branch: "main" }), /unsupported fields/);
  assert.throws(() => prepareNoteChange(roster, "korda", "main", { path, content }), /verified Git branch head/);
  assert.throws(() => prepareNoteChange(roster, "korda", head, { path, content: "é".repeat(8193) }), /16 KiB/);
});

test("one original R2 id yields one ledger entry without copying source text", () => {
  const first = prepareLedgerChange(initialRoster, receipt);
  assert.equal(first.path, ledgerPath(receiptId));
  assert.equal(first.changed, true);
  assert.equal(first.entry.agentId, "federal");
  assert.equal(first.entry.body, undefined);
  assert.equal(first.entry.title, undefined);
  assert.match(first.entry.receiptSha256, /^[a-f0-9]{64}$/);
  const reordered = Object.fromEntries(Object.entries(receipt).reverse());
  assert.deepEqual(prepareLedgerChange(initialRoster, reordered, first.entry),
    { path: first.path, entry: first.entry, changed: false });
  assert.throws(() => prepareLedgerChange(initialRoster, { ...receipt, body: "Different." }, first.entry), /immutable/);
});

test("ledger intake validates the original Worker record and exact desk, date and id", () => {
  assert.throws(() => prepareLedgerChange(initialRoster, { ...receipt, key: receipt.key.replace("federal", "korda") }),
    /key does not match/);
  assert.throws(() => prepareLedgerChange(initialRoster, { ...receipt, submittedAt: "2026-11-17T16:00:05Z" }), /key does not match/);
  assert.throws(() => prepareLedgerChange(initialRoster, { ...receipt, desk: "orath" }), /no registered agent/);
  assert.throws(() => prepareLedgerChange(initialRoster, { ...receipt, status: "HOLD" }), /original version 1/);
  assert.throws(() => prepareLedgerChange(initialRoster, { ...receipt, nonCanonical: false }), /noncanonical/);
  assert.throws(() => ledgerPath("../../receipt"), /Invalid R2 submission id/);
  const legacyBoundary = { ...receipt, title: "A".repeat(179) + String.fromCharCode(0xd83d) };
  assert.equal(prepareLedgerChange(initialRoster, legacyBoundary).changed, true);
});

test("decision retries are safe and stale edits cannot overwrite concurrent decisions", () => {
  const first = prepareLedgerChange(initialRoster, receipt, undefined, decision);
  const final = { ...decision, id: "20000000-0000-4000-8000-000000000002", previousId: decisionId,
    disposition: "ACCEPTED", publication: { pullRequest: 987 } };
  const { entry } = appendDecision(initialRoster, first.entry, final);
  assert.equal(appendDecision(initialRoster, entry, decision).changed, false);
  assert.equal(appendDecision(initialRoster, entry, final).changed, false);
  assert.throws(() => appendDecision(initialRoster, entry, { ...decision, note: "Overwritten." }), /different content/);
  assert.throws(() => appendDecision(initialRoster, first.entry, { ...final, previousId: null }), /stale/);
  assert.throws(() => appendDecision(initialRoster, entry, {
    ...decision, id: "20000000-0000-4000-8000-000000000003", previousId: decisionId,
  }), /stale/);
  assert.doesNotThrow(() => checkAppendOnly(first.entry, entry));
  assert.throws(() => checkAppendOnly(entry, first.entry), /Preserve existing ledger decisions/);
  assert.throws(() => checkAppendOnly(entry, undefined), /Keep the existing ledger entry/);
});

test("the ledger validates follow-ups and keeps archive and publication as references", () => {
  const badDecision = [
    [{ publication: { pullRequest: 987, mergeCommit: head } }, /live record URL/],
    [{ followUp: { agentId: "unknown", task: "Review this." } }, /roster agent/],
    [{ relatedReceiptId: receiptId }, /cannot reference itself/],
    [{ archive: { repository: "project/archive", commit: head, path: "records/report.json" } }, /ARCHIVED decision/],
    [{ recordedAt: "2026-11-16T15:00:00Z" }, /must follow/],
  ];
  for (const [patch, error] of badDecision) {
    assert.throws(() => prepareLedgerChange(initialRoster, receipt, undefined, { ...decision, ...patch }), error);
  }
  const { entry } = prepareLedgerChange(initialRoster, receipt, undefined, {
    ...decision, disposition: "ARCHIVED",
    publication: { pullRequest: 987, mergeCommit: head, url: "https://thefederatedrepublic.org/torenthia-news-987.html" },
    archive: { repository: "project/archive", commit: head, path: "records/report.json" },
  });
  assert.doesNotThrow(() => validateEntry(initialRoster, entry, `${receiptId}.json`));
  assert.throws(() => validateEntry(initialRoster, entry, "duplicate.json"), /filename must match/);
  assert.equal(entry.decisions[0].archive.commit, head);
});

test("the editor CLI prepares a serializable decision without writing to the checkout", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "torenthia-newsroom-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const original = join(dir, "source.json");
  const draft = join(dir, "decision.json");
  writeFileSync(original, JSON.stringify(receipt));
  writeFileSync(draft, JSON.stringify(decision));
  const status = () => execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], { cwd: root, encoding: "utf8" });
  const before = status();
  const output = execFileSync(process.execPath, [join(root, "scripts/newsroom/cli.mjs"), "record", original, draft],
    { cwd: dir, encoding: "utf8" });
  const { entry, changed } = JSON.parse(output);
  assert.equal(changed, true);
  assert.deepEqual(entry.decisions, [decision]);
  assert.ok(!output.includes(receipt.body));
  assert.equal(status(), before);
});

test("the PR validator accepts a Git-tracked append and rejects rewrites, dangling links and removal", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "torenthia-ledger-history-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const files = [ROSTER_PATH, "scripts/newsroom/cli.mjs", "scripts/newsroom/roster.mjs", "scripts/newsroom/ledger.mjs"];
  for (const { workspacePath } of initialRoster.agents) {
    files.push(`${workspacePath}/desk.md`, `${workspacePath}/notes.md`);
  }
  for (const file of files) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    copyFileSync(join(root, file), join(dir, file));
  }

  const first = prepareLedgerChange(initialRoster, receipt, undefined, decision);
  const ledgerFile = join(dir, first.path);
  mkdirSync(dirname(ledgerFile), { recursive: true });
  writeFileSync(ledgerFile, JSON.stringify(first.entry));
  const git = (...args) => execFileSync("git", args, { cwd: dir, encoding: "utf8" });
  git("init", "--quiet");
  git("add", ".");
  git("-c", "user.name=Newsroom test", "-c", "user.email=fixture@example.invalid", "-c", "commit.gpgsign=false",
    "commit", "--quiet", "-m", "First decision");
  const base = git("rev-parse", "HEAD").trim();
  const validate = () => execFileSync(process.execPath, ["scripts/newsroom/cli.mjs", "validate", base], {
    cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  });

  const followUp = { ...decision, id: "20000000-0000-4000-8000-000000000002", previousId: decisionId,
    disposition: "ACCEPTED" };
  const updated = appendDecision(initialRoster, first.entry, followUp).entry;
  writeFileSync(ledgerFile, JSON.stringify(updated));
  assert.match(validate(), /4 agent workspaces and 1 ledger entries/);

  updated.decisions[1].relatedReceiptId = "10000000-0000-4000-8000-000000000002";
  writeFileSync(ledgerFile, JSON.stringify(updated));
  assert.throws(validate, (error) => error.status === 1 && /unknown related receipt/.test(error.stderr));

  delete updated.decisions[1].relatedReceiptId;
  updated.decisions[0] = { ...decision, note: "Altered history." };
  writeFileSync(ledgerFile, JSON.stringify(updated));
  assert.throws(validate, (error) => error.status === 1 && /Preserve existing ledger decisions/.test(error.stderr));

  rmSync(ledgerFile);
  assert.throws(validate, (error) => error.status === 1 && /Keep the existing ledger entry/.test(error.stderr));
});
