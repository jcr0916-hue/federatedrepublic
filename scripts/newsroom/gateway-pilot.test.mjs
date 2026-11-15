import assert from "node:assert/strict";
import test from "node:test";
import { createGatewayPilot } from "./gateway-pilot.mjs";

const policyRevision = "a".repeat(40);
const limits = { maxInputTokens: 16000, maxOutputTokens: 4096, maxCostCents: 5, maxSeconds: 120, maxCalls: 1 };
const pricing = { inputCentsPerMillion: 100, outputCentsPerMillion: 500 };
const messages = [{ role: "user", content: "Summarize the approved assignment only." }];
const result = { usage: { prompt_tokens: 200, completion_tokens: 80 }, choices: [{ message: { content: "Proposed summary." } }] };
function fixture(transport = async () => ({ status: 200, json: async () => result })) {
  const events = [];
  const claimed = new Set();
  const pilot = createGatewayPilot({
    transport: async (...args) => { events.push(["transport", ...args]); return transport(...args); },
    authorize: async () => { events.push(["authorize"]); return true; },
    reserve: async ({ jobId, worstCents }) => {
      events.push(["reserve", worstCents]);
      if (claimed.has(jobId)) return false;
      claimed.add(jobId);
      return true;
    },
    token: "synthetic-test-token-never-live",
    modelId: "approved/model-fixture", pricing, limits, policyRevision,
  });
  return { events, pilot };
}
const job = { jobId: "federal/fixture-001", messages };

test("single authorized reserved request with redacted result and exact duplicate refusal", async () => {
  const { events, pilot } = fixture();
  const out = await pilot(job);
  assert.equal(out.content, "Proposed summary.");
  assert.ok(out.billingCeilingCents <= limits.maxCostCents);
  assert.equal(out.usage.inputTokens, 200);
  assert.deepEqual(events.map(e => e[0]), ["authorize", "reserve", "authorize", "transport"]);
  assert.equal(events[3][1], "https://ai-gateway.vercel.sh/v1/chat/completions");
  assert.equal(JSON.parse(events[3][2].body).max_completion_tokens, 4096);
  await assert.rejects(pilot(job), /already claimed/);
  assert.equal(events.filter(e => e[0] === "transport").length, 1);
});

test("rejects unauthorized, post-reservation pause, unverified pricing and oversized input before networking", async () => {
  let calls = 0;
  const baseline = { transport: async () => { calls++; return { status: 200, json: async () => result }; },
    reserve: async () => true, authorize: async () => false, token: "synthetic-test-token-never-live",
    modelId: "approved/model-fixture", pricing, limits, policyRevision };
  const denied = createGatewayPilot(baseline);
  await assert.rejects(denied(job), /not authorized/);
  let checks = 0;
  const paused = createGatewayPilot({ ...baseline, authorize: async () => ++checks === 1 });
  await assert.rejects(paused(job), /paused/);
  assert.throws(() => createGatewayPilot({ ...baseline, pricing: { ...pricing, inputCentsPerMillion: 0 } }),
    /Verified positive/);
  const big = createGatewayPilot({ ...baseline, authorize: async () => true });
  await assert.rejects(big({ ...job, messages: [{ role: "user", content: "x".repeat(16000) }] }),
    /Input exceeds/);
  assert.equal(calls, 0);
});

test("402, 429, timeout and opaque upstream failures never retry automatically", async () => {
  for (const [response, pattern] of [
    [{ status: 402 }, /budget exhausted/],
    [{ status: 429 }, /rate limited/],
    [{ status: 503 }, /request failed/],
  ]) {
    let calls = 0;
    const { pilot } = fixture(async () => { calls++; return response; });
    await assert.rejects(pilot(job), pattern);
    assert.equal(calls, 1);
  }
  let calls = 0;
  const { pilot } = fixture(async () => { calls++; throw new Error("secret internal text"); });
  await assert.rejects(pilot(job), { message: "Gateway transport failed; reconcile before any new request" });
  assert.equal(calls, 1);
});

test("missing or excessive usage and bad response body fail closed", async () => {
  for (const data of [
    { ...result, usage: undefined },
    { ...result, usage: { prompt_tokens: 16001, completion_tokens: 2 } },
    { ...result, usage: { prompt_tokens: 1, completion_tokens: 4097 } },
    { ...result, choices: [] },
  ]) {
    const { pilot } = fixture(async () => ({ status: 200, json: async () => data }));
    await assert.rejects(pilot(job), /missing or exceeds/);
  }
  const { pilot } = fixture(async () => ({ status: 200, json: async () => { throw Error("private"); } }));
  await assert.rejects(pilot(job), /cannot be validated/);
});

test("cost reservation refuses models whose maximum exposure exceeds the ceiling", async () => {
  let calls = 0;
  const pilot = createGatewayPilot({
    transport: async () => { calls++; }, authorize: async () => true, reserve: async () => true,
    token: "synthetic-test-token-never-live", modelId: "approved/model-fixture",
    pricing: { inputCentsPerMillion: 30000, outputCentsPerMillion: 30000 },
    limits, policyRevision,
  });
  await assert.rejects(pilot(job), /Worst-case model cost/);
  assert.equal(calls, 0);
});
