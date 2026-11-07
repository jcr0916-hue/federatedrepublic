import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";

const CLIENT = "synthetic-newsroom-editor";
const SECRET = "synthetic-local-fixture-client-secret";
const RESOURCE = "https://synthetic.newsroom.invalid/mcp";
const REDIRECT = "https://chatgpt.invalid/oauth/callback";
const VERIFIER = "pkce-verifier-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefgh";
const CHALLENGE = createHash("sha256").update(VERIFIER).digest("base64url");
const NOW = 1_794_040_000;
type Reply = Record<string, any>;

describe("synthetic authorization code + S256 grant exchange (local only)", () => {
  it("exchanges a valid code once, disallows wrong PKCE and parallel replay", async () => {
    const built = await build({
      entryPoints: ["prototype/synthetic-oauth-fixture.ts"],
      bundle: true, format: "esm", platform: "neutral", target: "es2023",
      mainFields: ["module", "main"], external: ["cloudflare:workers"],
      write: false, logLevel: "silent",
    });
    const mf = new Miniflare(convertV4MiniflareOptions({
      modules: true, script: built.outputFiles[0].text, compatibilityDate: "2026-10-01",
      durableObjects: { SYNTHETIC_GRANTS: { className: "SyntheticOAuthGrant", useSQLite: true } },
    }));
    try {
      const call = async (action: string, fields: Record<string, unknown> = {}, grant = "code-test") => {
        const response = await mf.dispatchFetch("https://fixture.example/", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action, grant, clientId: CLIENT, clientSecret: SECRET,
            audience: RESOURCE, redirectUri: REDIRECT, now: NOW, ...fields,
          }),
        });
        return { status: response.status, body: await response.json() as Reply };
      };
      const begin = (grant: string, fields: Record<string, unknown> = {}) =>
        call("begin_code", { scope: "newsroom:read", codeChallenge: CHALLENGE, ...fields }, grant);
      const exchange = (grant: string, code: string, fields: Record<string, unknown> = {}) =>
        call("exchange_code", { code, codeVerifier: VERIFIER, ...fields }, grant);

      const started = await begin("happy");
      assert.equal(started.status, 200, JSON.stringify(started.body));
      assert.match(started.body.code, /^[0-9a-f]{64}$/);
      assert.equal((await begin("happy")).status, 400);
      const first = await exchange("happy", started.body.code);
      assert.equal(first.status, 200, JSON.stringify(first.body));
      assert.match(first.body.refresh_token, /^[0-9a-f]{64}$/);
      assert.equal((await exchange("happy", started.body.code)).status, 400);
      assert.deepEqual((await call("authorize", {
        accessToken: first.body.access_token, requestedScope: "newsroom:read",
      }, "happy")).body, { authorized: true });
      assert.deepEqual((await call("authorize", {
        accessToken: first.body.access_token, requestedScope: "newsroom:review",
      }, "happy")).body, { authorized: false });

      const wrong = await begin("wrong");
      assert.equal((await exchange("wrong", wrong.body.code, { codeVerifier: "x".repeat(43) })).status, 400);
      assert.equal((await exchange("wrong", wrong.body.code, { redirectUri: "https://attacker.invalid" })).status, 400);
      assert.equal((await exchange("wrong", wrong.body.code)).status, 200);

      const concurrent = await begin("concurrent");
      const both = await Promise.all([
        exchange("concurrent", concurrent.body.code),
        exchange("concurrent", concurrent.body.code),
      ]);
      assert.deepEqual(both.map(x => x.status).sort(), [200, 400]);

      const expiring = await begin("expired");
      assert.equal((await exchange("expired", expiring.body.code, { now: NOW + 300 })).status, 400);
      assert.equal((await exchange("expired", expiring.body.code, { now: NOW + 299 })).status, 200);

      assert.equal((await begin("bad-scope", { scope: "newsroom:read newsroom:review" })).status, 400);
      assert.equal((await begin("bad-audience", { audience: "https://attacker.invalid/mcp" })).status, 400);
      assert.equal((await begin("bad-redirect", { redirectUri: "https://attacker.invalid/callback" })).status, 400);
      assert.equal((await begin("bad-pkce", { codeChallenge: "plain" })).status, 400);
      assert.equal((await exchange("happy", "not-a-code")).status, 400);
    } finally {
      await mf.dispose();
    }
  });
});
