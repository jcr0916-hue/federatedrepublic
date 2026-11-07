import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";

const hash = (char: string) => char.repeat(64);
const NOW = 1_794_040_000;

describe("strict refresh SQLite Durable Object local integration (not in release bundle)", () => {
  it("serializes concurrent refreshes for one grant, then revokes it", async () => {
    const result = await build({
      entryPoints: ["prototype/strict-refresh-fixture.ts"],
      bundle: true, format: "esm", platform: "neutral", target: "es2023",
      mainFields: ["module", "main"], external: ["cloudflare:workers"],
      write: false, logLevel: "silent",
    });
    const mf = new Miniflare(convertV4MiniflareOptions({
      modules: true, script: result.outputFiles[0].text,
      compatibilityDate: "2026-10-01",
      durableObjects: { REFRESH_GRANTS: "StrictRefreshGrant" },
    }));
    try {
      const rpc = async (operation: string, fields: Record<string, unknown> = {}, grant = "editor-a") => {
        const response = await mf.dispatchFetch("https://fixture.example/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operation, grant, ...fields }),
        });
        assert.equal(response.status, 200, `Durable Object fixture failed: HTTP ${response.status} ${await response.clone().text()}`);
        return await response.json() as Record<string, any>;
      };

      assert.deepEqual(await rpc("init", {
        tokenHash: hash("a"), expiresAt: NOW + 3600, now: NOW,
      }), { initialized: true });
      assert.deepEqual(await rpc("init", {
        tokenHash: hash("x"), expiresAt: NOW + 3600, now: NOW,
      }), { initialized: false });

      const attempts = await Promise.all([
        rpc("rotate", { presentedHash: hash("a"), successorHash: hash("b"), now: NOW }),
        rpc("rotate", { presentedHash: hash("a"), successorHash: hash("c"), now: NOW }),
      ]);
      assert.deepEqual(attempts.map(x => x.ok).sort(), [false, true]);
      assert.equal(attempts.find(x => !x.ok)!.reason, "replay");

      const nextHash = attempts.find(x => x.ok)!.state.currentHash;
      const after = await rpc("rotate", {
        presentedHash: nextHash, successorHash: hash("d"), now: NOW + 1,
      });
      assert.equal(after.ok, true);
      assert.equal(after.state.generation, 2);

      assert.deepEqual(await rpc("revoke"), { revoked: true });
      const blocked = await rpc("rotate", {
        presentedHash: hash("d"), successorHash: hash("e"), now: NOW + 2,
      });
      assert.deepEqual(blocked, { ok: false, reason: "revoked" });

      // A different grant ID is a different Durable Object namespace instance.
      assert.deepEqual(await rpc("init", {
        tokenHash: hash("a"), expiresAt: NOW + 3600, now: NOW,
      }, "editor-b"), { initialized: true });
    } finally {
      await mf.dispose();
    }
  });
});
