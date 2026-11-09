import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { pairedRuntime, CLIENT, ISSUER, REDIRECT, VERIFIER, type PairedRuntime } from "./candidate-harness.ts";
import type { IssuerGuard } from "../src/issuer-guard.ts";

async function control(f: PairedRuntime, client = CLIENT) {
  const ns = await f.mf.getDurableObjectNamespace("ISSUER_GUARD", "issuer");
  const raw = ns.get(ns.idFromName(client));
  return raw as typeof raw & Pick<DurableObjectStub<IssuerGuard>, "currentEpoch" | "invalidateAll" | "admit">;
}

describe("internal durable account-wide grant invalidation", () => {
  it("invalidates every prior grant, pending login and issued code while permitting fresh authorization", async () => {
    const f = await pairedRuntime();
    try {
      const a = await f.tokens(), b = await f.tokens();
      const pending = await f.start();
      const code = (await f.consent()).searchParams.get("code")!;
      const guard = await control(f);
      assert.equal(await guard.currentEpoch(), 0);
      const attempts = await Promise.all(Array.from({ length: 8 }, () => guard.invalidateAll(0)));
      assert.equal(attempts.filter(x => x.changed).length, 1, "compare-and-swap makes operator retries safe");
      assert.ok(attempts.every(x => x.epoch === 1));
      for (const token of [a, b]) {
        assert.equal((await f.rpc(token.access_token, "ping")).status, 401);
        assert.equal((await f.clientPost("/token", { grant_type: "refresh_token", refresh_token: token.refresh_token })).status, 400);
      }
      assert.equal((await f.issuer.fetch(ISSUER + "/oauth/callback?" + new URLSearchParams({
        state: pending.state, code: "unused-code",
      }), { headers: { Cookie: pending.cookie }, redirect: "manual" })).status, 403);
      assert.equal((await f.clientPost("/token", { grant_type: "authorization_code", code,
        redirect_uri: REDIRECT, code_verifier: VERIFIER })).status, 400);
      const recovered = await f.tokens();
      assert.equal((await f.rpc(recovered.access_token, "ping")).status, 200);
      const stale = await guard.invalidateAll(0);
      assert.equal(stale.changed, false); assert.equal(stale.epoch, 1);
      assert.equal((await f.rpc(recovered.access_token, "ping")).status, 200, "stale retry cannot invalidate a new generation");
      assert.equal(await (await control(f, "other-registered-client")).currentEpoch(), 0);
    } finally { await f.mf.dispose(); }
  });

  it("retains invalidation after quota cleanup and a runtime restart", async () => {
    const path = await mkdtemp(join(tmpdir(), "newsroom-epoch-"));
    let f = await pairedRuntime({ persistencePath: path });
    try {
      const token = await f.tokens();
      const guard = await control(f);
      assert.equal((await guard.invalidateAll(0)).changed, true);
      // Use a separate guard with no live quota windows, so its actual alarm
      // reaches cleanup rather than rescheduling around the test login quota.
      const cleanup = await control(f, "cleanup-only");
      assert.equal((await cleanup.invalidateAll(0)).changed, true);
      const past = Date.now() - 61_000;
      assert.equal((await cleanup.admit("introspect", past)).allowed, true);
      let cleaned = false;
      for (let i = 0; i < 30 && !cleaned; i++) {
        await delay(50);
        // A backwards timestamp is denied while the old window exists. It is
        // admitted only after the real alarm removes that window.
        cleaned = (await cleanup.admit("introspect", past - 1)).allowed;
      }
      assert.equal(cleaned, true, "the actual alarm removed the expired quota");
      assert.equal(await cleanup.currentEpoch(), 1, "quota cleanup must not erase invalidation");
      await f.mf.dispose();
      f = await pairedRuntime({ persistencePath: path });
      assert.equal(await (await control(f)).currentEpoch(), 1);
      assert.equal(await (await control(f, "cleanup-only")).currentEpoch(), 1);
      assert.equal((await f.rpc(token.access_token, "ping")).status, 401);
      assert.equal((await f.rpc((await f.tokens()).access_token, "ping")).status, 200);
    } finally { await f.mf.dispose(); await rm(path, { recursive: true, force: true }); }
  });

  it("rejects invalid operator epochs and exposes no HTTP invalidation or inventory route", async () => {
    const f = await pairedRuntime();
    try {
      const guard = await control(f);
      for (const epoch of [-1, NaN, Infinity, 0.5, 1]) {
        const denied = await guard.invalidateAll(epoch);
        assert.equal(denied.changed, false); assert.equal(denied.epoch, 0);
      }
      const token = await f.tokens();
      for (const path of ["/invalidateAll", "/admin/revoke-all", "/grants", "/epoch"]) {
        assert.equal((await f.clientPost(path, {})).status, 404);
      }
      assert.equal((await f.rpc(token.access_token, "ping")).status, 200);
    } finally { await f.mf.dispose(); }
  });
});
