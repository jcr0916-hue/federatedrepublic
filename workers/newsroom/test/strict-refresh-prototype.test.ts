import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  initialRefreshState, revokeRefreshState, rotateRefreshState,
} from "../prototype/refresh-state.ts";

const hash = (c: string) => c.repeat(64);
const NOW = 1_794_040_000;

describe("strict refresh lineage prototype (not wired to OAuth)", () => {
  it("initializes a bounded, hashed grant", () => {
    const s = initialRefreshState(hash("a"), NOW + 3600, NOW);
    assert.deepEqual(s, { generation: 0, currentHash: hash("a"), expiresAt: NOW + 3600, revoked: false });
    assert.throws(() => initialRefreshState("raw-token", NOW + 3600, NOW));
    assert.throws(() => initialRefreshState(hash("a"), NOW, NOW));
  });

  it("consumes the current token exactly once under serialized state transitions", () => {
    const initial = initialRefreshState(hash("a"), NOW + 3600, NOW);
    const first = rotateRefreshState(initial, hash("a"), hash("b"), NOW);
    assert.equal(first.ok, true);
    if (!first.ok) return;
    const replay = rotateRefreshState(first.state, hash("a"), hash("c"), NOW);
    assert.deepEqual(replay, { ok: false, reason: "replay" });
    const second = rotateRefreshState(first.state, hash("b"), hash("c"), NOW + 1);
    assert.equal(second.ok, true);
    if (second.ok) assert.equal(second.state.generation, 2);
    assert.equal(initial.generation, 0); // source remains immutable
  });

  it("disallows extending a token with itself or malformed hashes", () => {
    const s = initialRefreshState(hash("a"), NOW + 3600, NOW);
    assert.deepEqual(rotateRefreshState(s, hash("a"), hash("a"), NOW),
      { ok: false, reason: "invalid" });
    assert.deepEqual(rotateRefreshState(s, "raw-token", hash("b"), NOW),
      { ok: false, reason: "invalid" });
    assert.deepEqual(rotateRefreshState(s, hash("a"), "raw-token", NOW),
      { ok: false, reason: "invalid" });
  });

  it("rejects expired, absent and revoked grant lineages", () => {
    const s = initialRefreshState(hash("a"), NOW + 10, NOW);
    assert.deepEqual(rotateRefreshState(null, hash("a"), hash("b"), NOW),
      { ok: false, reason: "missing" });
    assert.deepEqual(rotateRefreshState(s, hash("a"), hash("b"), NOW + 10),
      { ok: false, reason: "expired" });
    const revoked = revokeRefreshState(s)!;
    assert.equal(revoked.revoked, true);
    assert.deepEqual(rotateRefreshState(revoked, hash("a"), hash("b"), NOW),
      { ok: false, reason: "revoked" });
    assert.equal(revokeRefreshState(null), null);
  });

  it("never returns a successor token, only the successor hash and generation", () => {
    const s = initialRefreshState(hash("a"), NOW + 3600, NOW);
    const next = rotateRefreshState(s, hash("a"), hash("b"), NOW);
    assert.equal(next.ok, true);
    assert.equal(JSON.stringify(next).includes("raw-token"), false);
  });
});
