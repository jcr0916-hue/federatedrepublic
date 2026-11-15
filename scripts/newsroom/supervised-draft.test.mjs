import assert from "node:assert/strict";
import test from "node:test";
import { createSupervisedDraft } from "./supervised-draft.mjs";
import { createGatewayPilot } from "./gateway-pilot.mjs";
import { createBudgetReservation } from "./budget-reservation.mjs";

const policyHead = "a".repeat(40);
const policyRevision = "b".repeat(40);
const slot = "2026-11-16T16:00:00Z";
const packet = { policyHead, sources: [
  { id: "synthetic/source-1", text: "Synthetic Council oversight reviews administrative conduct." },
] };
function fixture(id = "federal") {
  let calls = 0, reservations = 0;
  const stored = new Map();
  const budget = createBudgetReservation({
    dailyLimitCents: 5, slotLimitCents: 5, maxJobsPerSlot: 1,
    lookupJob: async (jobId, revision) => ({
      agentId: id, slot, policyRevision: revision,
    }),
    // Synthetic serial transaction, NOT production durable persistence.
    transact: async (day, mutate) => {
      const updated = mutate(stored.get(day) ?? null);
      stored.set(day, updated.state);
      reservations += Number(updated.result);
      return updated.result;
    },
  });
  let authorized = true;
  const gateway = createGatewayPilot({
    transport: async (_url, options) => {
      calls++;
      const request = JSON.parse(options.body);
      assert.equal(request.model, "synthetic/review-model");
      assert.ok(!options.body.includes("Synthetic private receipt"));
      assert.ok(options.body.includes("synthetic/source-1"));
      return { status: 200, json: async () => ({
        usage: { prompt_tokens: 300, completion_tokens: 40 },
        choices: [{ message: { content: "Proposed statement [synthetic/source-1]." } }],
      }) };
    },
    authorize: async () => authorized,
    reserve: budget,
    token: "synthetic-test-key-not-real",
    modelId: "synthetic/review-model",
    pricing: { inputCentsPerMillion: 100, outputCentsPerMillion: 500 },
    limits: { maxCalls: 1, maxInputTokens: 16000, maxOutputTokens: 4096, maxSeconds: 120, maxCostCents: 5 },
    policyRevision,
  });
  const editor = createSupervisedDraft({
    openDeskJob: async (_grant) => ({
      agentId: id,
      assignment: {
        receiptId: "10000000-0000-4000-8000-000000000001",
        decisionId: "20000000-0000-4000-8000-000000000001",
        task: "Describe the specific synthetic oversight rule.",
      },
    }),
    invokeGateway: gateway,
  });
  return { editor, get calls() { return calls; }, get reservations() { return reservations; },
    pause() { authorized = false; } };
}
const req = (id = "federal") => ({
  grant: "synthetic-offline-grant",
  jobId: `${id}/${slot}`, packet,
});

test("end-to-end offline composer reserves one call and produces only editor proposal", async () => {
  const f = fixture();
  const result = await f.editor(req());
  assert.equal(result.status, "PROPOSED");
  assert.equal(result.agentId, "federal");
  assert.equal(result.sourcePolicyHead, policyHead);
  assert.match(result.sourcePacketSha256, /^[0-9a-f]{64}$/);
  assert.match(result.draftText, /synthetic\/source-1/);
  assert.equal(f.calls, 1);
  assert.equal(f.reservations, 1);
  assert.ok(!("publish" in result) && !("saveNotes" in result));
  await assert.rejects(f.editor(req()), /already claimed/);
  assert.equal(f.calls, 1);
});

test("state desk receives only its matching draft claim", async () => {
  const f = fixture("korda");
  await assert.rejects(f.editor(req("federal")), /verified desk/);
  const result = await f.editor(req("korda"));
  assert.equal(result.agentId, "korda");
  assert.equal(f.calls, 1);
});

test("paused run cannot incur spend; invalid packets cannot reach model", async () => {
  const f = fixture();
  f.pause();
  await assert.rejects(f.editor(req()), /not authorized/);
  assert.equal(f.calls, 0);
  assert.equal(f.reservations, 0);

  const g = fixture();
  await assert.rejects(g.editor({ ...req(), packet: { ...packet, sources: [] } }), /bounded sources/);
  await assert.rejects(g.editor({ ...req(), packet: { ...packet, sources: [packet.sources[0], packet.sources[0]] } }),
    /unique/);
  await assert.rejects(g.editor({ ...req(), packet: { ...packet, policyHead: "main" } }), /immutable/);
  assert.equal(g.calls, 0);
});

test("does not permit extra private source fields", async () => {
  const f = fixture();
  await assert.rejects(f.editor({ ...req(), packet: { ...packet, sources: [{
    id: "synthetic/source-1", text: "Reviewed", privateReceipt: "do not expose",
  }] } }), /only source ID/);
  assert.equal(f.calls, 0);
});
