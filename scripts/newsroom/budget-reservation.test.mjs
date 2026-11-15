import assert from "node:assert/strict";
import test from "node:test";
import { createBudgetReservation } from "./budget-reservation.mjs";

const policyRevision = "b".repeat(40);
const monday = "2026-11-16T16:00:00Z";
const tuesday = "2026-11-17T16:00:00Z";
const job = (agentId = "federal", slot = monday) =>
  ({ jobId: `${agentId}/${slot}`, policyRevision, worstCents: 3, maxCalls: 1 });

// Synthetic transaction queue simulates one serializable day's storage.
// It is explicitly NOT a persistent production implementation.
function fixture(overrides = {}) {
  const records = new Map();
  let last = Promise.resolve();
  const events = [];
  const transact = (day, mutate) => {
    const next = last.then(() => {
      const saved = records.get(day) ?? null;
      const { state, result } = mutate(saved === null ? null : structuredClone(saved));
      records.set(day, structuredClone(state));
      events.push({ day, result });
      return result;
    });
    last = next.then(() => undefined, () => undefined);
    return next;
  };
  const lookupJob = async (jobId, revision) => {
    const [agentId, slot] = jobId.split("/");
    return { agentId, slot, policyRevision: revision };
  };
  const reserve = createBudgetReservation({
    transact, lookupJob, dailyLimitCents: 8, slotLimitCents: 5, maxJobsPerSlot: 2, ...overrides,
  });
  return { records, reserve, events };
}

test("reserves once per authenticated agent and slot, and refuses exact replay", async () => {
  const { reserve, records } = fixture();
  assert.equal(await reserve(job()), true);
  assert.equal(await reserve(job()), false);
  assert.equal(records.get("2026-11-16").totalCents, 3);
  assert.equal(records.get("2026-11-16").slots[monday].count, 1);
});

test("simultaneous duplicate claims cannot double-charge or double-dispatch", async () => {
  const { reserve, records } = fixture();
  const attempts = await Promise.all(Array.from({ length: 24 }, () => reserve(job())));
  assert.equal(attempts.filter(Boolean).length, 1);
  assert.equal(records.get("2026-11-16").totalCents, 3);
});

test("enforces per-slot, per-day and max-agent ceilings", async () => {
  const { reserve, records } = fixture();
  assert.equal(await reserve(job("federal")), true);
  assert.equal(await reserve(job("korda")), false); // Would exceed five cents in slot
  assert.equal(await reserve(job("korda", "2026-11-16T17:00:00Z")), true);
  assert.equal(await reserve(job("varek", "2026-11-16T18:00:00Z")), false); // Day cap
  assert.equal(records.get("2026-11-16").totalCents, 6);

  const max = fixture({ slotLimitCents: 8, maxJobsPerSlot: 1 });
  assert.equal(await max.reserve(job()), true);
  assert.equal(await max.reserve(job("korda")), false);
});

test("separate UTC day can reserve independently", async () => {
  const { reserve, records } = fixture();
  assert.equal(await reserve(job()), true);
  assert.equal(await reserve(job("federal", tuesday)), true);
  assert.equal(records.size, 2);
});

test("rejects mismatched signed identity, invalid revision and corrupted stored totals", async () => {
  const badIdentity = fixture({ lookupJob: async () => ({
    agentId: "korda", slot: monday, policyRevision,
  }) });
  await assert.rejects(badIdentity.reserve(job()), /must match its trusted slot/);
  const badRevision = fixture({ lookupJob: async () => ({
    agentId: "federal", slot: monday, policyRevision: "c".repeat(40),
  }) });
  await assert.rejects(badRevision.reserve(job()), /policy revision is not trusted/);
  const stored = fixture();
  await stored.reserve(job());
  stored.records.get("2026-11-16").totalCents = 0;
  await assert.rejects(stored.reserve(job("korda")), /totals are inconsistent/);
});

test("refuses malformed or unverified budget claims", async () => {
  const { reserve } = fixture();
  await assert.rejects(reserve({ ...job(), worstCents: 0 }), /Invalid single-attempt/);
  await assert.rejects(reserve({ ...job(), maxCalls: 2 }), /Invalid single-attempt/);
  const missing = fixture({ lookupJob: async () => null });
  await assert.rejects(missing.reserve(job()), /grant unavailable/);
});
