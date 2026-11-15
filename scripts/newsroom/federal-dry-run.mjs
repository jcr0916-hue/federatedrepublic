import assert from "node:assert/strict";
import { createFederalFixture, fixtureHead } from "./fixtures/federal-pilot.mjs";

const { state, openJob, grant, change } = createFederalFixture();
const job = await openJob(grant());
const first = await job.saveNotes(change);
const replay = await job.saveNotes(change);
assert.equal(first.status, "committed");
assert.deepEqual(replay, { status: "already-applied", head: first.head });
assert.equal(state.commits.size, 1);
assert.equal(state.writeAttempts.length, 1);
assert.equal(state.r2Reads.length, 1);
assert.equal(state.pr.draft, true);
assert.equal(state.pr.state, "open");

const federal = state.roster.agents.find(({ id }) => id === "federal");
console.log(JSON.stringify({
  mode: "synthetic",
  agentId: federal.id,
  assignment: job.assignment,
  proposedBudget: federal.budget,
  modelAliasPlaceholders: federal.model.aliasRefs,
  simulatedNoteUpdate: { path: change.path, expectedHead: fixtureHead, ...first, replay: replay.status, draft: true },
  simulatedReceiptReads: state.r2Reads.length,
  simulatedCommits: state.commits.size,
  externalRequests: 0,
  modelCalls: 0,
  spendCents: 0,
}, null, 2));
