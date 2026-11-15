// Reservation policy logic for an atomic, durable budget store.
// This module DOES NOT supply persistence or authorize paid calls.
// The trusted transaction implementation MUST serialize/commit the whole UTC-day
// record atomically across all workers and survive restarts.
import { check, isInteger, utcDate } from "./roster.mjs";

const agentIdPattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const policyShaPattern = /^[a-f0-9]{40}$/;
const slotPattern = /^\d{4}-\d\d-\d\dT\d\d:00:00Z$/;

function validateClaim({ agentId, slot, policyRevision }, jobId, requestedRevision) {
  check(agentIdPattern.test(agentId ?? "") && typeof slot === "string"
    && slotPattern.test(slot), "Trusted job identity and hourly UTC slot required");
  utcDate(slot);
  check(jobId === `${agentId}/${slot}`, "Job identity must match its trusted slot");
  check(policyRevision === requestedRevision && policyShaPattern.test(requestedRevision),
    "Job model-policy revision is not trusted");
}

function validateState(state, day) {
  if (state === null) return { version: 1, day, claims: {}, slots: {}, totalCents: 0 };
  check(state && !Array.isArray(state) && state.version === 1 && state.day === day
    && state.claims && typeof state.claims === "object" && !Array.isArray(state.claims)
    && state.slots && typeof state.slots === "object" && !Array.isArray(state.slots)
    && isInteger(state.totalCents, 0), "Invalid durable daily budget record");
  // A corrupt record must never permit another paid reservation.
  let total = 0;
  const computedSlots = {};
  for (const [jobId, claim] of Object.entries(state.claims)) {
    check(claim && isInteger(claim.cents, 1)
      && typeof claim.slot === "string" && slotPattern.test(claim.slot)
      && claim.slot.startsWith(day) && jobId.endsWith(`/${claim.slot}`),
    "Invalid durable job reservation");
    total += claim.cents;
    const slot = computedSlots[claim.slot] ?? { count: 0, cents: 0 };
    slot.count++;
    slot.cents += claim.cents;
    computedSlots[claim.slot] = slot;
  }
  check(total === state.totalCents
    && Object.keys(state.slots).length === Object.keys(computedSlots).length,
  "Durable reservation totals are inconsistent");
  for (const [slot, data] of Object.entries(computedSlots)) {
    check(state.slots[slot]?.count === data.count && state.slots[slot]?.cents === data.cents,
      "Durable slot reservations are inconsistent");
  }
  return state;
}

/**
 * @param {Object} options
 * @param {Function} options.transact async (day, synchronousMutation) => boolean
 *   MUST run mutation with current committed day record (or null), and durably
 *   commit returned {state,result} atomically BEFORE resolving result.
 *   Its implementation must provide serializable isolation across processes,
 *   not merely a JavaScript Map or a read/then/write sequence.
 * @param {Function} options.lookupJob trusted, authenticated lookup of a signed
 *   job grant; never trust values copied from the model request.
 */
export function createBudgetReservation({ transact, lookupJob, dailyLimitCents, slotLimitCents, maxJobsPerSlot }) {
  check(typeof transact === "function" && typeof lookupJob === "function",
    "Trusted transaction store and job lookup required");
  check(isInteger(dailyLimitCents, 1) && isInteger(slotLimitCents, 1, dailyLimitCents)
    && isInteger(maxJobsPerSlot, 1), "Invalid budget reservation limits");

  return async function reserve({ jobId, policyRevision, worstCents, maxCalls }) {
    check(typeof jobId === "string" && jobId.length <= 160
      && policyShaPattern.test(policyRevision ?? "") && isInteger(worstCents, 1)
      && maxCalls === 1, "Invalid single-attempt reservation request");
    const identity = await lookupJob(jobId, policyRevision);
    check(identity, "Verified job grant unavailable");
    validateClaim(identity, jobId, policyRevision);
    const day = identity.slot.slice(0, 10);
    return transact(day, (current) => {
      const state = validateState(current, day);
      if (Object.hasOwn(state.claims, jobId)) return { state, result: false };
      const slot = state.slots[identity.slot] ?? { count: 0, cents: 0 };
      if (state.totalCents + worstCents > dailyLimitCents
        || slot.cents + worstCents > slotLimitCents || slot.count >= maxJobsPerSlot) {
        return { state, result: false };
      }
      // Immutable result snapshot: never mutate the transaction store's input record.
      const next = {
        version: 1, day,
        claims: { ...state.claims, [jobId]: { cents: worstCents, slot: identity.slot } },
        slots: { ...state.slots, [identity.slot]: {
          count: slot.count + 1, cents: slot.cents + worstCents,
        } },
        totalCents: state.totalCents + worstCents,
      };
      return { state: next, result: true };
    });
  };
}
