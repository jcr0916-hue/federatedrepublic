import assert from "node:assert/strict";
import test from "node:test";
import { createFederalInbox } from "./federal-inbox.mjs";
import { createFederalFixture, fixtureBase, fixtureHead, notesPath } from "./fixtures/federal-pilot.mjs";

test("verifies and projects one original receipt, then commits only the note and recognizes an exact replay", async () => {
  const { state, grant, openJob, change } = createFederalFixture();
  const job = await openJob(grant());
  const decision = state.ledger.decisions[0];
  assert.deepEqual(job.assignment, { receiptId: state.receipt.id, decisionId: decision.id, task: decision.followUp.task });
  assert.deepEqual(Object.keys(job).sort(), ["assignment", "saveNotes"]);
  assert.deepEqual(state.r2Reads, [state.receipt.key]);
  assert.equal(state.writeAttempts.length, 0);

  const first = await job.saveNotes(change);
  assert.equal(first.status, "committed");
  assert.equal(state.pr.draft, true);
  assert.equal(state.pr.state, "open");
  assert.equal(state.notes.get(first.head), change.content);
  assert.equal(state.writeAttempts[0].expectedHeadOid, fixtureHead);
  assert.deepEqual(await job.saveNotes(change), { status: "already-applied", head: first.head });
  await assert.rejects(job.saveNotes({ ...change, content: "Different notes" }), /draft head changed/);
  assert.equal(state.writeAttempts.length, 1);
});

test("rejects forged, expired, mistimed and cross-agent grants", async () => {
  const { state, claims, grant, openJob } = createFederalFixture();
  const signed = grant();
  const [payload, signature] = signed.split(".");
  const changedPayload = Buffer.from(JSON.stringify({ ...claims, pullRequest: 2 })).toString("base64url");
  await assert.rejects(openJob({ agentId: "federal" }), /signed Federal job grant/);
  await assert.rejects(openJob(`${changedPayload}.${signature}`), /Invalid Federal job signature/);
  await assert.rejects(openJob(grant({ agentId: "korda" })), /authenticated Federal job/);
  await assert.rejects(openJob(grant({ audience: "another-repository" })), /authenticated Federal job/);
  await assert.rejects(openJob(grant({ expiresAt: claims.issuedAt })), /expired or mistimed/);
  await assert.rejects(openJob(grant({ issuedAt: claims.issuedAt + 1 })), /expired or mistimed/);
  await assert.rejects(openJob(grant({ expiresAt: claims.issuedAt + 301 })), /expired or mistimed/);
  assert.equal(state.r2Reads.length, 0);
});

test("denies either parked switch and refuses stale or unprotected policy before reading R2", async () => {
  const scenarios = [
    [(state) => { state.roster.automationEnabled = false; }, /automation is off/],
    [(state) => { state.roster.agents.find(({ id }) => id === "federal").enabled = false; }, /disabled or unregistered/],
    [(state) => { state.base.commit.sha = "c".repeat(40); }, /Protected roster changed/],
    [(state) => { state.base.protected = false; }, /Protected main branch is unavailable/],
    [(state) => { state.rules[0].parameters.dismiss_stale_reviews_on_push = false; }, /Main must enforce PR review/],
    [(state) => { state.rules = state.rules.filter(({ type }) => type !== "required_status_checks"); }, /Main must enforce PR review/],
  ];
  for (const [change, error] of scenarios) {
    const { state, grant, openJob } = createFederalFixture();
    change(state);
    await assert.rejects(openJob(grant()), error);
    assert.equal(state.r2Reads.length, 0);
    assert.equal(state.writeAttempts.length, 0);
  }
});

test("matches the latest reviewed Federal assignment before fetching its exact key", async () => {
  const { state, grant, openJob } = createFederalFixture();
  await assert.rejects(openJob(grant({ decisionId: "20000000-0000-4000-8000-000000000002" })), /No current, reviewed Federal/);
  state.ledger.decisions[0].disposition = "HOLD";
  await assert.rejects(openJob(grant()), /No current, reviewed Federal/);
  assert.deepEqual(state.r2Reads, []);
});

test("rejects modified or legacy-overlay receipts without emitting their payloads", async () => {
  const { state, grant, openJob } = createFederalFixture();
  const original = state.receipt;
  state.receipt = { ...original, status: "HOLD" };
  await assert.rejects(openJob(grant()), /original version 1 noncanonical/);
  state.receipt = { ...original, body: "Changed fixture text" };
  await assert.rejects(openJob(grant()), /receipt metadata is immutable/);
  state.receipt = { ...original, desk: "korda" };
  await assert.rejects(openJob(grant()), /key does not match/);
  state.onReceiptRead = () => new Response("invalid json with private fixture text");
  await assert.rejects(openJob(grant()), { message: "Could not read the original Federal receipt" });
  assert.equal(state.writeAttempts.length, 0);
});

test("reads only a Federal submissions key and cancels oversized R2 streams", async () => {
  const { state } = createFederalFixture();
  let requested = 0;
  let cancelled = false;
  const inbox = createFederalInbox(async () => {
    requested++;
    return new Response(new ReadableStream({
      start(controller) { controller.enqueue(new Uint8Array(321 * 1024)); },
      cancel() { cancelled = true; },
    }));
  });
  await assert.rejects(inbox.readReceipt("status/federal/receipt.json"), /exact Federal submissions key/);
  await assert.rejects(inbox.readReceipt(state.receipt.key.replace("/federal/", "/korda/")), /exact Federal submissions key/);
  assert.equal(requested, 0);
  await assert.rejects(inbox.readReceipt(state.receipt.key), /Could not read the original Federal receipt/);
  assert.equal(requested, 1);
  assert.equal(cancelled, true);
});

test("checks the protected ref again after reading an inbox receipt", async () => {
  const { state, grant, openJob } = createFederalFixture();
  state.onReceiptRead = () => {
    state.base.commit.sha = "c".repeat(40);
    return Response.json(state.receipt);
  };
  await assert.rejects(openJob(grant()), /Protected roster changed/);
  assert.equal(state.r2Reads.length, 1);
});

test("rejects agent-supplied identity, authority fields, oversized notes and out-of-scope paths", async () => {
  const { state, grant, openJob, change } = createFederalFixture();
  const job = await openJob(grant());
  for (const field of ["agentId", "branch", "expectedHead", "pullRequest"]) {
    await assert.rejects(job.saveNotes({ ...change, [field]: "override" }), /unsupported fields/);
  }
  for (const path of [notesPath.replace("federal", "korda"), notesPath.replace("notes.md", "desk.md"),
    notesPath.replace("/notes", "/../workspace/notes"), notesPath.toUpperCase()]) {
    await assert.rejects(job.saveNotes({ ...change, path }), /outside this agent's write scope/);
  }
  await assert.rejects(job.saveNotes({ ...change, content: "ø".repeat(8193) }), /within 16 KiB/);
  assert.equal(state.writeAttempts.length, 0);
});

test("rejects a draft with the wrong review state, repository, base, head branch or diff", async () => {
  const { state, grant, openJob, change } = createFederalFixture();
  const job = await openJob(grant());
  const original = structuredClone(state.pr);
  const mutations = [
    () => { state.pr.draft = false; },
    () => { state.pr.state = "closed"; },
    () => { state.pr.auto_merge = {}; },
    () => { state.pr.head.repo.id = 10; },
    () => { state.pr.base.ref = "editorial/other"; },
    () => { state.pr.base.sha = "c".repeat(40); },
    () => { state.pr.head.ref = "main"; },
  ];
  for (const mutate of mutations) {
    state.pr = structuredClone(original);
    mutate();
    await assert.rejects(job.saveNotes(change), /pinned Federal draft must be open/);
  }
  state.pr = original;
  state.diff.files.push({ filename: "docs/constitution-current.md", status: "modified" });
  await assert.rejects(job.saveNotes(change), /diff must modify only/);
  state.diff.files.pop();
  state.diff.merge_base_commit.sha = "c".repeat(40);
  await assert.rejects(job.saveNotes(change), /diff must modify only/);
  assert.equal(state.writeAttempts.length, 0);
});

test("refuses missing, symlink and executable notes at a pinned commit", async () => {
  const { state, grant, openJob, change } = createFederalFixture();
  const job = await openJob(grant());
  for (const mode of [0o120000, 0o100755]) {
    state.notesMode = mode;
    await assert.rejects(job.saveNotes(change), /existing regular, nonexecutable Git file/);
  }
  state.notesMode = 0o100644;
  state.notes.delete(fixtureHead);
  await assert.rejects(job.saveNotes(change), /existing regular, nonexecutable Git file/);
  assert.equal(state.writeAttempts.length, 0);
});

test("an unchanged note is a no-op only at the pinned head", async () => {
  const { state, grant, openJob, change } = createFederalFixture();
  const job = await openJob(grant());
  state.notes.set(fixtureHead, change.content);
  assert.deepEqual(await job.saveNotes(change), { status: "unchanged", head: fixtureHead });
  state.pr.head.sha = "c".repeat(40);
  state.notes.set(state.pr.head.sha, change.content);
  await assert.rejects(job.saveNotes(change), /draft head changed/);
  assert.equal(state.writeAttempts.length, 0);
});

test("no write starts after the grant expires or protected main moves during preflight", async () => {
  const { state, grant, openJob, change, claims } = createFederalFixture();
  const job = await openJob(grant());
  state.onDraftRead = () => { state.now = claims.expiresAt * 1000; };
  await assert.rejects(job.saveNotes(change), /expired or mistimed/);
  state.now = claims.issuedAt * 1000;
  state.onDraftRead = () => { state.base.commit.sha = "c".repeat(40); };
  await assert.rejects(job.saveNotes(change), /Protected roster changed/);
  assert.equal(state.writeAttempts.length, 0);
});

test("server-side expected-head check stops a write racing another update", async () => {
  const { state, grant, openJob, change } = createFederalFixture();
  const job = await openJob(grant());
  state.beforeCommit = () => { state.pr.head.sha = "c".repeat(40); };
  await assert.rejects(job.saveNotes(change), /GitHub note commit failed/);
  assert.equal(state.commits.size, 0);
  assert.equal(state.writeAttempts[0].expectedHeadOid, fixtureHead);
});

test("recovers an ambiguous successful write via readback without a duplicate commit", async () => {
  const { state, grant, openJob, change } = createFederalFixture();
  const signed = grant();
  const job = await openJob(signed);
  state.afterCommit = () => { throw new Error("Lost synthetic response"); };
  await assert.rejects(job.saveNotes(change), /GitHub note commit failed/);
  const restarted = await openJob(signed);
  assert.deepEqual(await restarted.saveNotes(change), { status: "already-applied", head: state.pr.head.sha });
  assert.equal(state.writeAttempts.length, 1);
  assert.equal(state.commits.size, 1);
});

test("blocks success reporting if the draft changes during commit", async () => {
  const { state, grant, openJob, change } = createFederalFixture();
  const job = await openJob(grant());
  state.afterCommit = () => { state.pr.draft = false; };
  await assert.rejects(job.saveNotes(change), /pinned Federal draft must be open/);
  assert.equal(state.commits.size, 1);
  assert.equal(state.pr.base.sha, fixtureBase);
});
