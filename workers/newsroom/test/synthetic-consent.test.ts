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
const MOCK_GOOD = "synthetic-approved-github-code";

describe("synthetic consent + verified mock identity (LOCAL TEST ONLY)", () => {
  it("binds consent to session/state, checks identity, and exchanges only once", async () => {
    const bundled = await build({
      entryPoints: ["prototype/synthetic-oauth-fixture.ts"], bundle: true,
      format: "esm", platform: "neutral", target: "es2023",
      mainFields: ["module", "main"], external: ["cloudflare:workers"],
      write: false, logLevel: "silent",
    });
    const mf = new Miniflare(convertV4MiniflareOptions({
      modules: true, script: bundled.outputFiles[0].text,
      compatibilityDate: "2026-10-01",
      durableObjects: { SYNTHETIC_GRANTS: { className: "SyntheticOAuthGrant", useSQLite: true } },
    }));
    try {
      const call = async (grant: string, action: string, fields: Record<string, unknown> = {}) => {
        const r = await mf.dispatchFetch("https://fixture.example/", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grant, action, clientId: CLIENT, clientSecret: SECRET, now: NOW,
            audience: RESOURCE, redirectUri: REDIRECT, ...fields,
          }),
        });
        const raw = await r.text();
        let body: Record<string, any>;
        try { body = JSON.parse(raw) as Record<string, any>; }
        catch { throw new Error(`Unexpected fixture HTTP ${r.status}: ${raw.slice(0, 1200)}`); }
        return { status: r.status, body };
      };
      const start = (grant: string, fields: Record<string, unknown> = {}) =>
        call(grant, "consent_start", { codeChallenge: CHALLENGE, scope: "newsroom:read", ...fields });
      const finish = (grant: string, browserSession: string, state: string,
        fields: Record<string, unknown> = {}) => call(grant, "consent_complete", {
          browserSession, state, githubCode: MOCK_GOOD, decision: "approve", ...fields,
        });
      const happy = await start("approved");
      assert.equal(happy.status, 200, JSON.stringify(happy.body));
      assert.match(happy.body.browserSession, /^[0-9a-f]{64}$/);
      assert.match(happy.body.state, /^[0-9a-f]{64}$/);
      assert.notEqual(happy.body.state, happy.body.browserSession);
      assert.equal((await start("approved")).status, 400);
      assert.equal((await finish("approved", "f".repeat(64), happy.body.state)).status, 403);
      assert.equal((await finish("approved", happy.body.browserSession, "f".repeat(64))).status, 403);
      assert.equal((await finish("approved", happy.body.browserSession, happy.body.state,
        { githubCode: "synthetic-other-user-code" })).status, 403);
      assert.equal((await finish("approved", happy.body.browserSession, happy.body.state,
        { githubCode: "not-a-valid-code" })).status, 403);

      const accepted = await finish("approved", happy.body.browserSession, happy.body.state);
      assert.equal(accepted.status, 200, JSON.stringify(accepted.body));
      assert.match(accepted.body.code, /^[0-9a-f]{64}$/);
      assert.equal((await finish("approved", happy.body.browserSession, happy.body.state)).status, 403);
      const exchanged = await call("approved", "exchange_code", {
        code: accepted.body.code, codeVerifier: VERIFIER,
      });
      assert.equal(exchanged.status, 200, JSON.stringify(exchanged.body));
      assert.equal((await call("approved", "exchange_code", {
        code: accepted.body.code, codeVerifier: VERIFIER,
      })).status, 400);
      assert.deepEqual((await call("approved", "authorize", {
        accessToken: exchanged.body.access_token, requestedScope: "newsroom:read",
      })).body, { authorized: true });

      const denied = await start("denied");
      assert.equal((await finish("denied", denied.body.browserSession, denied.body.state,
        { decision: "deny" })).status, 403);
      assert.equal((await finish("denied", denied.body.browserSession, denied.body.state)).status, 403);

      const expired = await start("expired");
      assert.equal((await finish("expired", expired.body.browserSession, expired.body.state,
        { now: NOW + 300 })).status, 403);
      assert.equal((await finish("expired", expired.body.browserSession, expired.body.state,
        { now: NOW + 299 })).status, 200);

      assert.equal((await start("wrong-scope", { scope: "newsroom:read newsroom:review" })).status, 400);
      assert.equal((await start("wrong-redirect", { redirectUri: "https://attacker.invalid" })).status, 400);
      assert.equal((await start("wrong-audience", { audience: "https://attacker.invalid/mcp" })).status, 400);
    } finally {
      await mf.dispose();
    }
  });
});
