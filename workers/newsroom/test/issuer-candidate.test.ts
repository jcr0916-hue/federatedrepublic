import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { mintBoundCredential, sha256Hex } from "../prototype/issuer-boundary.ts";

const SECRET = "synthetic-only-candidate-secret-long-randomish-0123456789";
const CLIENT = "synthetic-registered-editor";
const AUDIENCE = "https://candidate.invalid/mcp";
const AUTH = "Basic " + Buffer.from(CLIENT + ":" + SECRET).toString("base64");
const POST_HEADERS = { Authorization: AUTH, "Content-Type": "application/x-www-form-urlencoded" };

describe("standalone fail-closed issuer candidate (not deployed)", () => {
  it("has no public issuance and authenticates refresh / introspection", async () => {
    const built = await build({
      entryPoints: ["src/issuer-candidate.ts"], bundle: true, format: "esm",
      platform: "neutral", target: "es2023", mainFields: ["module", "main"],
      external: ["cloudflare:workers"], write: false, logLevel: "silent",
    });
    const mf = new Miniflare(convertV4MiniflareOptions({
      modules: true, script: built.outputFiles[0].text,
      compatibilityDate: "2026-10-01",
      bindings: {
        ISSUER_CLIENT_ID: CLIENT, ISSUER_CLIENT_SECRET_SHA256:
          createHash("sha256").update(SECRET).digest("hex"),
        ISSUER_AUDIENCE: AUDIENCE, ISSUER_EDITOR_ID: "12345",
      },
      durableObjects: { ISSUER_GRANTS: { className: "SyntheticOAuthGrant", useSQLite: true } },
      outboundService: () => new Response(null, { status: 502 }),
    }));
    try {
      const call = async (path: string, body: URLSearchParams = new URLSearchParams(),
        headers: Record<string, string> = POST_HEADERS) => {
        const response = await mf.dispatchFetch("https://candidate.invalid" + path, {
          method: "POST", headers, body, redirect: "manual",
        });
        const raw = await response.text();
        return { status: response.status, body: JSON.parse(raw) as Record<string, any>, raw };
      };
      for (const path of ["/issue", "/authorize", "/consent", "/oauth/callback", "/admin", "/revoke"]) {
        assert.equal((await call(path)).status, 404, path);
      }
      assert.equal((await call("/token", new URLSearchParams({
        grant_type: "refresh_token", refresh_token: "invalid",
      }), { "Content-Type": "application/x-www-form-urlencoded" })).status, 401);
      assert.equal((await call("/token", new URLSearchParams({
        grant_type: "client_credentials",
      }))).status, 400);
      assert.equal((await call("/token", new URLSearchParams({
        grant_type: "refresh_token", refresh_token: "invalid",
      }))).status, 400);
      assert.equal((await call("/introspect", new URLSearchParams({
        token_type_hint: "access_token", token: "invalid",
      }))).body.active, false);
      assert.equal((await call("/token", new URLSearchParams({
        grant_type: "refresh_token", refresh_token: "invalid", audience: "evil",
      }))).status, 400);
      const duplicated = await call("/token", new URLSearchParams(
        "grant_type=refresh_token&grant_type=refresh_token&refresh_token=invalid"));
      assert.equal(duplicated.status, 400);
      assert.equal((await call("/introspect", new URLSearchParams({
        token_type_hint: "refresh_token", token: "invalid",
      }))).status, 400);
      assert.equal((await call("/introspect", new URLSearchParams({
        token_type_hint: "access_token", token: "invalid",
      }), { Authorization: "Basic invalid", "Content-Type": "application/x-www-form-urlencoded" })).status, 401);

      // Test-only internal Miniflare access: no HTTP grant creation endpoint.
      // The candidate can only operate on preauthorized, independently seeded
      // DO state and cannot initialize it via an untrusted API request.
      const grant = randomBytes(32).toString("hex");
      const access = mintBoundCredential(grant, "access");
      const refresh = mintBoundCredential(grant, "refresh");
      const namespace = await mf.getDurableObjectNamespace("ISSUER_GRANTS");
      const stub = namespace.get(namespace.idFromName(grant)) as unknown as {
        issue(input: Record<string, unknown>): Promise<{ ok: boolean }>;
      };
      const seeded = await stub.issue({
        clientId: CLIENT, editorId: "12345", audience: AUDIENCE,
        scopes: ["newsroom:read"], accessHash: await sha256Hex(access),
        refreshHash: await sha256Hex(refresh),
        now: Math.floor(Date.now() / 1000), refreshTTL: 7200, accessTTL: 900,
      });
      assert.equal(seeded.ok, true);
      assert.equal((await call("/introspect", new URLSearchParams({
        token_type_hint: "access_token", token: access,
      }))).body.active, true);
      const attempts = await Promise.all([
        call("/token", new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh })),
        call("/token", new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh })),
      ]);
      assert.deepEqual(attempts.map(x => x.status).sort(), [200, 400]);
      const successor = attempts.find(x => x.status === 200)!.body;
      assert.equal((await call("/introspect", new URLSearchParams({
        token_type_hint: "access_token", token: access,
      }))).body.active, false);
      assert.equal((await call("/introspect", new URLSearchParams({
        token_type_hint: "access_token", token: successor.access_token,
      }))).body.active, true);
      assert.equal((await call("/token", new URLSearchParams({
        grant_type: "refresh_token", refresh_token: refresh,
      }))).status, 400);
    } finally { await mf.dispose(); }
  });
});
