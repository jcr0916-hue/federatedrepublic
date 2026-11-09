/** Adversarial regression cases from the #304–#309 source review.
 * Synthetic local Workers/SQLite/R2 only; no connected services or live grants.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pairedRuntime, CLIENT, CLIENT_SECRET, VALIDATOR, VALIDATOR_SECRET, VERIFIER,
  REDIRECT, RESOURCE, basic } from "./candidate-harness.ts";

describe("security review regressions: credential lifecycle and availability", () => {
  for (const [path, limit, fields, auth, expected] of [
    ["/token", 240, { grant_type: "refresh_token", refresh_token: "invalid" }, basic(CLIENT, CLIENT_SECRET), 400],
    ["/introspect", 1200, { token: "invalid", token_type_hint: "access_token" }, basic(VALIDATOR, VALIDATOR_SECRET), 200],
    ["/revoke", 120, { token: "invalid" }, basic(CLIENT, CLIENT_SECRET), 200],
  ] as const) {
    it("does not let invalid client credentials exhaust the authenticated " + path + " budget", async () => {
      const f = await pairedRuntime();
      try {
        const statuses: number[] = [];
        for (let offset = 0; offset < limit + 1; offset += 20) {
          statuses.push(...await Promise.all(Array.from({ length: Math.min(20, limit + 1 - offset) }, async () => {
            const response = await f.clientPost(path, fields, basic(CLIENT, "incorrect-client-secret-01234567890123456789"));
            await response.arrayBuffer();
            return response.status;
          })));
        }
        assert.deepEqual([...new Set(statuses)], [401], "unauthenticated traffic must not spend the client quota");
        assert.equal((await f.clientPost(path, fields, auth)).status, expected);
      } finally { await f.mf.dispose(); }
    });
  }

  it("revokes the active successor family on a proven spent-refresh replay, including older generations", async () => {
    const f = await pairedRuntime();
    try {
      const original = await f.tokens(), other = await f.tokens();
      const rotate = async (refresh_token: string) => {
        const response = await f.clientPost("/token", { grant_type: "refresh_token", refresh_token });
        assert.equal(response.status, 200);
        return await response.json() as typeof original;
      };
      const first = await rotate(original.refresh_token), current = await rotate(first.refresh_token);
      const tampered = original.refresh_token.slice(0, -1) + (original.refresh_token.endsWith("f") ? "e" : "f");
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: tampered })).status, 400);
      assert.equal((await f.rpc(current.access_token, "ping")).status, 200, "a routing ID is not proof of replay");
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: original.refresh_token })).status, 400);
      assert.equal((await f.rpc(current.access_token, "ping")).status, 401, "the attacker's winning successor must be disabled");
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: current.refresh_token })).status, 400);
      assert.equal((await f.rpc(other.access_token, "ping")).status, 200, "another grant must stay independent");
    } finally { await f.mf.dispose(); }
  });

  it("invalidates the winner of a duplicate refresh race and permits a fresh authorization", async () => {
    const f = await pairedRuntime();
    try {
      const original = await f.tokens();
      const responses = await Promise.all([0, 1].map(() => f.clientPost("/token", {
        grant_type: "refresh_token", refresh_token: original.refresh_token,
      })));
      assert.deepEqual(responses.map(x => x.status).sort(), [200, 400]);
      const winner = await responses.find(x => x.status === 200)!.json() as typeof original;
      assert.equal((await f.rpc(winner.access_token, "ping")).status, 401);
      assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: winner.refresh_token })).status, 400);
      assert.equal((await f.rpc((await f.tokens()).access_token, "ping")).status, 200);
    } finally { await f.mf.dispose(); }
  });

  it("accepts an authentic spent refresh token for revocation after rotation", async () => {
    const f = await pairedRuntime();
    try {
      const original = await f.tokens();
      const rotated = await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: original.refresh_token });
      const current = await rotated.json() as typeof original;
      assert.equal(rotated.status, 200);
      const tampered = original.refresh_token.slice(0, -1) + (original.refresh_token.endsWith("f") ? "e" : "f");
      assert.equal((await f.clientPost("/revoke", { token: tampered })).status, 200);
      assert.equal((await f.rpc(current.access_token, "ping")).status, 200, "a forged spent credential must not revoke");
      assert.equal((await f.clientPost("/revoke", { token: original.refresh_token })).status, 200);
      assert.equal((await f.rpc(current.access_token, "ping")).status, 401, "disconnect racing a refresh must revoke the family");
    } finally { await f.mf.dispose(); }
  });

  it("revokes a redeemed-code family only when the replay also proves the original PKCE binding", async () => {
    const f = await pairedRuntime();
    try {
      const code = (await f.consent()).searchParams.get("code")!;
      const fields = { grant_type: "authorization_code", code, redirect_uri: REDIRECT, code_verifier: VERIFIER };
      const issued = await f.clientPost("/token", fields);
      const token = await issued.json() as { access_token: string };
      assert.equal(issued.status, 200);
      assert.equal((await f.clientPost("/token", { ...fields, code_verifier: "x".repeat(43) })).status, 400);
      assert.equal((await f.rpc(token.access_token, "ping")).status, 200, "a bad verifier must not revoke a grant");
      assert.equal((await f.clientPost("/token", fields)).status, 400);
      assert.equal((await f.rpc(token.access_token, "ping")).status, 401);
    } finally { await f.mf.dispose(); }
  });

  it("cannot leave a usable successor when revocation races refresh", async () => {
    const f = await pairedRuntime();
    try {
      const original = await f.tokens(), other = await f.tokens();
      const [rotated, revoked] = await Promise.all([
        f.clientPost("/token", { grant_type: "refresh_token", refresh_token: original.refresh_token }),
        f.clientPost("/revoke", { token: original.refresh_token }),
      ]);
      assert.equal(revoked.status, 200);
      assert.ok([200, 400].includes(rotated.status));
      if (rotated.status === 200) {
        const next = await rotated.json() as typeof original;
        assert.equal((await f.rpc(next.access_token, "ping")).status, 401);
        assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: next.refresh_token })).status, 400);
      }
      assert.equal((await f.rpc(original.access_token, "ping")).status, 401);
      assert.equal((await f.rpc(other.access_token, "ping")).status, 200);
    } finally { await f.mf.dispose(); }
  });

  it("retains redeemed-code replay proof across a runtime restart and refresh", async () => {
    const path = await mkdtemp(join(tmpdir(), "newsroom-code-replay-"));
    let f = await pairedRuntime({ persistencePath: path });
    try {
      const code = (await f.consent()).searchParams.get("code")!;
      const fields = { grant_type: "authorization_code", code, redirect_uri: REDIRECT, code_verifier: VERIFIER };
      const issued = await f.clientPost("/token", fields);
      const original = await issued.json() as { access_token: string; refresh_token: string };
      assert.equal(issued.status, 200);
      const rotated = await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: original.refresh_token });
      const current = await rotated.json() as typeof original;
      assert.equal(rotated.status, 200);
      await f.mf.dispose();
      f = await pairedRuntime({ persistencePath: path });
      assert.equal((await f.rpc(current.access_token, "ping")).status, 200);
      assert.equal((await f.clientPost("/token", fields)).status, 400);
      assert.equal((await f.rpc(current.access_token, "ping")).status, 401);
    } finally { await f.mf.dispose(); await rm(path, { recursive: true, force: true }); }
  });

  it("keeps the active read quota available after more than a full quota of forged bearer attempts", async () => {
    const f = await pairedRuntime();
    try {
      const token = await f.tokens();
      const forged = "nr1a." + "a".repeat(64) + "." + "b".repeat(64);
      // Unknown credentials still reach authoritative inspection, but they cannot
      // spend the active editor's quota. This tests admission isolation, not edge
      // throughput or resistance to a distributed request-cost attack.
      for (let count = 0; count < 1201; count++) {
        const response = await f.rpc(forged, "ping");
        assert.equal(response.status, 401);
        assert.deepEqual(await response.json(), { error: "invalid_token" });
      }
      assert.equal((await f.rpc(token.access_token, "ping")).status, 200);
      assert.equal((await f.clientPost("/revoke", { token: token.refresh_token })).status, 200, "revocation has its own quota");
    } finally { await f.mf.dispose(); }
  });
});

describe("security review regressions: MCP data and mutation boundaries", () => {
  it("keeps seeded submissions, status and review history unchanged across write and routing attacks", async () => {
    const f = await pairedRuntime();
    try {
      const id = "11111111-1111-4111-8111-111111111111";
      const key = "submissions/korda/2026-11-07/" + id + ".json";
      const records = {
        [key]: { id, key, desk: "korda", title: "Synthetic review fixture", status: "PROPOSED", nonCanonical: true },
        ["status/" + id + ".json"]: { status: "HOLD", note: "Preserve this synthetic editorial note" },
        ["reviews/" + id + "/synthetic.json"]: { status: "HOLD", note: "Preserve this history" },
      };
      for (const [name, value] of Object.entries(records)) await f.bucket.put(name, JSON.stringify(value));
      const snapshot = async () => {
        const entries = await f.bucket.list();
        return Promise.all(entries.objects.map(async object => ({ key: object.key, etag: object.etag,
          uploaded: object.uploaded.toISOString(), body: await (await f.bucket.get(object.key))!.text() })));
      };
      const before = await snapshot(), token = await f.tokens();
      for (const name of ["newsroom_submit", "newsroom_review", "publish", "delete", "constructor", "__proto__"])
        assert.equal((await f.rpc(token.access_token, "tools/call", { name, arguments: { key, status: "ACCEPTED", note: "attack" } })).status, 403);
      for (const method of ["resources/read", "resources/list", "prompts/list", "admin", "tools/call/../review"])
        assert.equal((await f.rpc(token.access_token, method)).status, 403);
      for (const path of ["/v1/submit", "/v1/review", "/v1/read", "/admin", "/issue"])
        assert.equal((await f.resource.fetch(new URL(RESOURCE).origin + path, { method: "POST",
          headers: { Authorization: "Bearer " + token.access_token }, body: JSON.stringify({ key }) })).status, 404);
      for (const arguments_ of [{ key: "status/" + id + ".json" }, { key, editor: true }, { key, role: "owner" }]) {
        const response = await f.rpc(token.access_token, "tools/call", { name: "newsroom_read", arguments: arguments_ });
        if (response.status === 200) assert.equal((await response.json() as { result: { isError: boolean } }).result.isError, true);
        else assert.equal(response.status, 400);
      }
      const read = await f.rpc(token.access_token, "tools/call", { name: "newsroom_read", arguments: { key } });
      assert.equal(read.status, 200);
      assert.equal(read.headers.get("Cache-Control"), "no-store");
      assert.equal((await f.rpc(token.access_token, "tools/call", { name: "newsroom_list", arguments: { desk: "all" } })).status, 200);
      assert.deepEqual(await snapshot(), before);
    } finally { await f.mf.dispose(); }
  });
});
