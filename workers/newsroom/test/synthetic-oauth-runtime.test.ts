import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";

const CLIENT = "synthetic-newsroom-editor";
const SECRET = "synthetic-local-fixture-client-secret";
const RESOURCE = "https://synthetic.newsroom.invalid/mcp";
const NOW = 1_794_040_000;
type Reply = Record<string, any>;

describe("synthetic token endpoint with SQLite DO (local-only, NOT OAuth)", () => {
  it("issues, authenticates, rotates once under concurrency, and revokes", async () => {
    const result = await build({
      entryPoints: ["prototype/synthetic-oauth-fixture.ts"],
      bundle: true, format: "esm", platform: "neutral", target: "es2023",
      mainFields: ["module", "main"], external: ["cloudflare:workers"],
      write: false, logLevel: "silent",
    });
    const mf = new Miniflare(convertV4MiniflareOptions({
      modules: true, script: result.outputFiles[0].text,
      compatibilityDate: "2026-10-01",
      durableObjects: { SYNTHETIC_GRANTS: { className: "SyntheticOAuthGrant", useSQLite: true } },
    }));
    try {
      const call = async (
        action: string, fields: Record<string, unknown> = {}, grant = "synthetic-editor-1",
      ): Promise<{ status: number; body: Reply }> => {
        const response = await mf.dispatchFetch("https://fixture.example/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, grant, clientId: CLIENT, clientSecret: SECRET, now: NOW, ...fields }),
        });
        return { status: response.status, body: await response.json() as Reply };
      };
      const issued = await call("issue", { audience: RESOURCE, scope: "newsroom:read" });
      assert.equal(issued.status, 200, JSON.stringify(issued.body));
      assert.match(issued.body.access_token, /^[0-9a-f]{64}$/);
      assert.match(issued.body.refresh_token, /^[0-9a-f]{64}$/);
      assert.notEqual(issued.body.access_token, issued.body.refresh_token);
      assert.equal(issued.body.generation, 0);
      assert.equal((await call("issue", { audience: RESOURCE, scope: "newsroom:read" })).status, 400);
      assert.deepEqual((await call("authorize", {
        accessToken: issued.body.access_token, audience: RESOURCE, requestedScope: "newsroom:read",
      })).body, { authorized: true });
      assert.deepEqual((await call("authorize", {
        accessToken: issued.body.access_token, audience: RESOURCE, requestedScope: "newsroom:review",
      })).body, { authorized: false });
      assert.deepEqual((await call("authorize", {
        accessToken: issued.body.access_token, audience: "https://wrong.invalid/mcp", requestedScope: "newsroom:read",
      })).body, { authorized: false });
      assert.deepEqual((await call("authorize", {
        accessToken: issued.body.access_token, audience: RESOURCE, requestedScope: "newsroom:read",
        now: NOW + 900,
      })).body, { authorized: false });

      const attempts = await Promise.all([
        call("refresh", { refreshToken: issued.body.refresh_token }),
        call("refresh", { refreshToken: issued.body.refresh_token }),
      ]);
      assert.deepEqual(attempts.map(x => x.status).sort(), [200, 400]);
      assert.equal(attempts.find(x => x.status === 400)!.body.error, "invalid_grant");
      const next = attempts.find(x => x.status === 200)!.body;
      assert.equal(next.generation, 1);
      assert.notEqual(next.refresh_token, issued.body.refresh_token);
      assert.deepEqual((await call("authorize", {
        accessToken: issued.body.access_token, audience: RESOURCE, requestedScope: "newsroom:read",
      })).body, { authorized: false });
      assert.deepEqual((await call("authorize", {
        accessToken: next.access_token, audience: RESOURCE, requestedScope: "newsroom:read",
      })).body, { authorized: true });
      assert.deepEqual((await call("refresh", { refreshToken: issued.body.refresh_token })).body,
        { error: "invalid_grant" });

      assert.deepEqual((await call("revoke")).body, { revoked: true });
      assert.deepEqual((await call("authorize", {
        accessToken: next.access_token, audience: RESOURCE, requestedScope: "newsroom:read",
      })).body, { authorized: false });
      assert.deepEqual((await call("refresh", { refreshToken: next.refresh_token })).body,
        { error: "revoked" });

      const separate = await call("issue", { audience: RESOURCE, scope: "newsroom:read" }, "another-grant");
      assert.equal(separate.status, 200);
      assert.deepEqual((await call("authorize", {
        accessToken: separate.body.access_token, audience: RESOURCE, requestedScope: "newsroom:read",
      }, "another-grant")).body, { authorized: true });
      assert.equal((await call("refresh", { refreshToken: next.refresh_token }, "another-grant")).status, 400);
      assert.deepEqual((await call("issue", {
        audience: RESOURCE, scope: "newsroom:review",
      }, "ungranted-review")).body, { error: "invalid_scope_or_audience" });
      assert.equal((await call("issue", {
        audience: RESOURCE, scope: "newsroom:read", clientSecret: "bad",
      }, "bad-client")).status, 401);
    } finally {
      await mf.dispose();
    }
  });
});
