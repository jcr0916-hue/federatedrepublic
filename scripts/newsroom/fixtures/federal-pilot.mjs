import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { readFileSync } from "node:fs";
import { createFederalInbox } from "../federal-inbox.mjs";
import { createGitHubWriter } from "../github-writer.mjs";
import { ledgerPath, prepareLedgerChange } from "../ledger.mjs";
import { createManagedFederalPilot, FEDERAL_JOB_AUDIENCE } from "../managed-federal.mjs";
import { ROSTER_PATH } from "../roster.mjs";

export const fixtureBase = "a".repeat(40);
export const fixtureHead = "b".repeat(40);
export const notesPath = "docs/torenthia/agents/federal/workspace/notes.md";
const repositoryId = 1221166219;
const repositoryPath = "/repos/jcr0916-hue/federatedrepublic/";

export function createFederalFixture() {
  const roster = JSON.parse(readFileSync(new URL(`../../../${ROSTER_PATH}`, import.meta.url)));
  roster.automationEnabled = true;
  for (const agent of roster.agents) agent.enabled = agent.id === "federal";

  const receipt = {
    schemaVersion: 1,
    id: "10000000-0000-4000-8000-000000000001",
    key: "submissions/federal/2026-11-14/10000000-0000-4000-8000-000000000001.json",
    desk: "federal",
    kind: "report",
    title: "Synthetic private title",
    summary: "Synthetic private summary",
    body: "Synthetic private receipt body",
    sourceRefs: ["Synthetic private source"],
    submittedAt: "2026-11-14T19:00:00Z",
    status: "PROPOSED",
    nonCanonical: true,
  };
  const decision = {
    id: "20000000-0000-4000-8000-000000000001",
    previousId: null,
    recordedAt: "2026-11-14T19:01:00Z",
    editor: "fixture-editor",
    disposition: "REVISION_REQUESTED",
    note: "Synthetic decision note",
    followUp: { agentId: "federal", task: "Add the public citation in the synthetic revision." },
  };
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const issuedAt = Date.parse("2026-11-14T19:05:00Z") / 1000;
  const claims = {
    audience: FEDERAL_JOB_AUDIENCE, agentId: "federal", issuedAt, expiresAt: issuedAt + 120,
    policyHead: fixtureBase, expectedHead: fixtureHead, pullRequest: 1, receiptId: receipt.id, decisionId: decision.id,
  };
  const state = {
    roster,
    receipt,
    ledger: prepareLedgerChange(roster, receipt, undefined, decision).entry,
    now: issuedAt * 1000,
    base: { name: "main", protected: true, commit: { sha: fixtureBase } },
    rules: [
      { type: "pull_request", parameters: { required_approving_review_count: 1, dismiss_stale_reviews_on_push: true } },
      { type: "required_status_checks", parameters: { required_status_checks: [{ context: "Newsroom workspace check" }] } },
      { type: "non_fast_forward" },
      { type: "deletion" },
    ],
    pr: {
      number: 1, state: "open", draft: true, merged: false, auto_merge: null,
      base: { ref: "main", sha: fixtureBase, repo: { id: repositoryId } },
      head: { ref: "agent-notes/federal", sha: fixtureHead, repo: { id: repositoryId } },
    },
    diff: { status: "ahead", merge_base_commit: { sha: fixtureBase }, files: [{ filename: notesPath, status: "modified" }] },
    notesMode: 0o100644,
    notes: new Map([[fixtureBase, "# Federal notes\n"], [fixtureHead, "# Federal notes\n\nSynthetic opening note.\n"]]),
    commits: new Map(),
    writeAttempts: [],
    r2Reads: [],
  };
  const blobs = new Map();

  const fetchImpl = async (url, request) => {
    const { origin, pathname } = new URL(url);
    assert.equal(origin, "https://api.github.com");
    assert.equal(request.headers.authorization, "Bearer fixture-auth");
    assert.equal(request.redirect, "error");
    if (pathname === "/graphql") {
      assert.equal(request.method, "POST");
      const { query, variables } = JSON.parse(request.body);
      if (query.includes("query ReadTree")) {
        const [commit, dir] = variables.expression.split(":");
        const files = new Map();
        if (commit === fixtureBase) {
          files.set(ROSTER_PATH, { content: JSON.stringify(state.roster), mode: 0o100644 });
          files.set(ledgerPath(receipt.id), { content: JSON.stringify(state.ledger), mode: 0o100644 });
        }
        if (state.notes.has(commit)) files.set(notesPath, { content: state.notes.get(commit), mode: state.notesMode });

        const entries = [];
        for (const [path, { content, mode }] of files) {
          if (path.slice(0, path.lastIndexOf("/")) !== dir) continue;
          const bytes = Buffer.from(content);
          const oid = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
          entries.push({ name: path.split("/").at(-1), mode, type: "blob", oid });
          blobs.set(oid, { sha: oid, size: bytes.length, encoding: "base64", content: bytes.toString("base64") });
        }
        return Response.json({ data: { repository: { object: { entries } } } });
      }
      assert.match(query, /mutation SaveNotes/);
      const input = variables.input;
      state.writeAttempts.push(input);
      state.beforeCommit?.();
      if (input.expectedHeadOid !== state.pr.head.sha) {
        return Response.json({ errors: [{ message: "Simulated stale expected head" }] });
      }
      assert.deepEqual(input.branch, { repositoryNameWithOwner: "jcr0916-hue/federatedrepublic", branchName: "agent-notes/federal" });
      assert.deepEqual(Object.keys(input.fileChanges), ["additions"]);
      assert.equal(input.fileChanges.additions.length, 1);
      const [file] = input.fileChanges.additions;
      assert.equal(file.path, notesPath);
      const content = Buffer.from(file.contents, "base64").toString("utf8");
      const oid = createHash("sha1").update(JSON.stringify(input)).digest("hex");
      state.notes.set(oid, content);
      state.commits.set(oid, {
        sha: oid,
        message: `${input.message.headline}\n\n${input.message.body}`,
        parents: [{ sha: input.expectedHeadOid }],
      });
      state.pr.head.sha = oid;
      state.afterCommit?.();
      return Response.json({ data: { createCommitOnBranch: { commit: { oid } } } });
    }

    assert.equal(request.method, "GET");
    assert.ok(pathname.startsWith(repositoryPath));
    const path = pathname.slice(repositoryPath.length);
    if (path === "branches/main") {
      state.onProtectedRead?.();
      return Response.json(state.base);
    }
    if (path === "rules/branches/main") return Response.json(state.rules);
    if (path === "pulls/1") {
      state.onDraftRead?.();
      return Response.json(state.pr);
    }
    if (path.startsWith(`compare/${fixtureBase}...`)) return Response.json(state.diff);
    if (path.startsWith("git/blobs/")) return Response.json(blobs.get(path.split("/").at(-1)));
    if (path.startsWith("git/commits/")) return Response.json(state.commits.get(path.split("/").at(-1)) ?? {});
    throw new Error("Unexpected fixture GitHub request");
  };
  const inbox = createFederalInbox(async (key) => {
    state.r2Reads.push(key);
    return state.onReceiptRead ? state.onReceiptRead() : Response.json(state.receipt);
  });
  const github = createGitHubWriter({ installationToken: "fixture-auth", fetchImpl });
  const openJob = createManagedFederalPilot({ github, inbox, jobPublicKey: publicKey, now: () => state.now });
  function grant(overrides = {}) {
    const payload = Buffer.from(JSON.stringify({ ...claims, ...overrides })).toString("base64url");
    return `${payload}.${sign(null, Buffer.from(payload, "ascii"), privateKey).toString("base64url")}`;
  }
  return { state, claims, grant, openJob, change: { path: notesPath, content: "# Federal notes\n\nSynthetic source check staged.\n" } };
}
