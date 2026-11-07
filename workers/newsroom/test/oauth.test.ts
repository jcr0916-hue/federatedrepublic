import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { configuration, isEditorGrant, PolicyError } from "../src/policy.ts";
import {
  ORIGIN, RESOURCE, REDIRECT, VERIFIER, syntheticEnv, upstreamToken, instance, call, cookies,
  authorizeUrl, consent, code, exchange, tokens, rpc, type Tokens, type Provision,
} from "./runtime.ts";

describe("authentication adapter in local Workers runtime", () => {
  it("publishes resource discovery and S256 metadata without granting anonymous MCP access", async () => {
    const f = await instance();
    const metadata = await call(f, "/.well-known/oauth-protected-resource/mcp");
    assert.equal(metadata.status, 200);
    const resource = await metadata.json() as { resource: string; authorization_servers: string[] };
    assert.equal(resource.resource, RESOURCE);
    assert.deepEqual(resource.authorization_servers, [ORIGIN]);
    const as = await (await call(f, "/.well-known/oauth-authorization-server")).json() as Record<string, unknown>;
    assert.deepEqual(as.code_challenge_methods_supported, ["S256"]);
    assert.equal(as.issuer, ORIGIN);
    assert.equal(as.authorization_response_iss_parameter_supported, true);
    assert.equal(as.registration_endpoint, undefined);
    assert.notEqual(as.client_id_metadata_document_supported, true);
    const denied = await rpc(f, null);
    assert.equal(denied.status, 401);
    assert.match(denied.headers.get("www-authenticate") || "", /resource_metadata=/);
    assert.equal((await call(f, "/oauth/register", { method: "POST", body: "{}" })).status, 401);
  });

  it("routes each legacy principal unchanged, even without valid OAuth configuration", async () => {
    const f = await instance({ env: { GITHUB_CLIENT_SECRET: "" } });
    for (const desk of ["corindal", "korda", "varek", "federal", "editorial"]) {
      const response = await rpc(f, `synthetic-${desk}-credential`, "tools/call", "newsroom_read");
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-test-fixture"), "synthetic-adapter");
      const body = await response.json() as { result: { content: { text: string }[] } };
      assert.deepEqual(JSON.parse(body.result.content[0].text).principal, { desk, editor: desk === "editorial" });
    }
    assert.equal((await rpc(f, null)).status, 503);
    assert.equal((await call(f, "/health")).status, 200);
  });

  it("keeps REST routes on their existing bearer path", async () => {
    const f = await instance();
    const token = await tokens(f);
    assert.equal((await call(f, "/v1/read", { headers: { Authorization: "Bearer " + token.access_token } })).status, 401);
    assert.equal((await call(f, "/v1/read", { headers: { Authorization: "Bearer synthetic-corindal-credential" } })).status, 200);
  });

  it("requires exact client, callback, resource, known scopes and S256 even for a confidential client", async () => {
    const f = await instance();
    for (const change of [
      { client_id: "another-client" }, { redirect_uri: "https://attacker.example/callback" },
      { resource: "https://attacker.example/mcp" }, { code_challenge: null, code_challenge_method: null },
      { code_challenge_method: "plain" }, { scope: "newsroom:publish" }, { state: "" },
    ]) assert.equal((await call(f, authorizeUrl(f, "newsroom:read", change))).status, 400);
    assert.deepEqual(f.calls, { token: 0, identity: 0 });
  });

  it("escapes client metadata and binds consent to its browser and origin", async () => {
    const f = await instance();
    const started = await call(f, authorizeUrl(f));
    const html = await started.text();
    assert.ok(!html.includes("ChatGPT <test client>"));
    assert.ok(html.includes("ChatGPT &#60;test client&#62;"));
    assert.match(started.headers.get("content-security-policy")!, /frame-ancestors 'none'/);
    assert.match(started.headers.get("set-cookie")!, /HttpOnly/);
    assert.match(started.headers.get("set-cookie")!, /Secure/);
    const handle = /name="handle" value="([^"]+)"/.exec(html)![1];
    const post = (origin: string, cookie: string) => call(f, "/authorize", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: origin, Cookie: cookie },
      body: new URLSearchParams({ handle, decision: "approve" }),
    });
    assert.equal((await post("https://attacker.example", cookies(started))).status, 403);
    assert.equal((await post(ORIGIN, "")).status, 400);
    assert.deepEqual(f.calls, { token: 0, identity: 0 });
  });

  it("rejects a forged consent role/scope field and handles explicit refusal", async () => {
    const f = await instance();
    const started = await call(f, authorizeUrl(f));
    const handle = /name="handle" value="([^"]+)"/.exec(await started.text())![1];
    const response = await call(f, "/authorize", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: ORIGIN, Cookie: cookies(started) },
      body: new URLSearchParams({ handle, decision: "approve", scope: "newsroom:review", editor: "true" }),
    });
    assert.equal(response.status, 400);
    const denied = await call(f, "/authorize", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: ORIGIN, Cookie: cookies(started) },
      body: new URLSearchParams({ handle, decision: "deny" }),
    });
    assert.equal(denied.status, 302);
    const location = new URL(denied.headers.get("location")!);
    assert.equal(location.searchParams.get("error"), "access_denied");
    assert.equal(location.searchParams.get("iss"), ORIGIN);
  });

  it("uses GitHub PKCE and accepts only the approved immutable user ID", async () => {
    const allowed = await instance();
    const accepted = await code(allowed);
    assert.equal(accepted.location.origin, "https://github.com");
    assert.equal(accepted.location.searchParams.get("code_challenge_method"), "S256");
    assert.equal(accepted.location.searchParams.get("scope"), "");
    assert.equal(accepted.completed.status, 302);
    assert.deepEqual(allowed.calls, { token: 1, identity: 1 });
    const denied = await instance({ identity: 99999 });
    const rejected = await code(denied);
    assert.equal(rejected.completed.status, 403);
    assert.deepEqual(await rejected.completed.json(), { error: "editor_not_allowed" });
  });

  it("rejects a callback in a different browser before contacting GitHub", async () => {
    const f = await instance();
    const start = await consent(f);
    const response = await call(f, "/oauth/callback?" + new URLSearchParams({
      state: start.location.searchParams.get("state")!, code: "synthetic-github-code",
    }));
    assert.equal(response.status, 400);
    assert.deepEqual(f.calls, { token: 0, identity: 0 });
  });

  it("issues a 15-minute audience-bound token and refuses sequential code reuse", async () => {
    const f = await instance();
    const authorized = await code(f);
    const value = new URL(authorized.completed.headers.get("location")!).searchParams.get("code")!;
    const response = await exchange(f, value);
    assert.equal(response.status, 200);
    const token = await response.json() as Tokens;
    assert.equal(token.expires_in, 900);
    assert.equal((await rpc(f, token.access_token, "initialize")).status, 200);
    assert.equal((await exchange(f, value)).status, 400);
  });

  it("rejects the wrong downstream verifier and resource", async () => {
    const f = await instance();
    for (const change of [{ code_verifier: VERIFIER + "wrong" }, { resource: "https://wrong.example/mcp" }]) {
      const authorized = await code(f);
      const value = new URL(authorized.completed.headers.get("location")!).searchParams.get("code")!;
      assert.equal((await exchange(f, value, change)).status, 400);
    }
  });

  it("restricts discovery and direct calls to granted tools and enforces review scope", async () => {
    const f = await instance();
    const token = await tokens(f);
    const listing = await (await rpc(f, token.access_token)).json() as { result: { tools: Record<string, any>[] } };
    assert.deepEqual(listing.result.tools.map(x => x.name), ["newsroom_list", "newsroom_read"]);
    for (const tool of listing.result.tools) {
      assert.equal(tool.annotations.readOnlyHint, true);
      assert.deepEqual(tool.securitySchemes, [{ type: "oauth2", scopes: ["newsroom:read"] }]);
    }
    const read = await rpc(f, token.access_token, "tools/call", "newsroom_read");
    const content = await read.json() as { result: { content: { text: string }[] } };
    assert.deepEqual(JSON.parse(content.result.content[0].text).principal, { desk: "editorial", editor: true });
    const review = await rpc(f, token.access_token, "tools/call", "newsroom_review");
    assert.equal(review.status, 403);
    assert.match(review.headers.get("www-authenticate")!, /insufficient_scope/);
    for (const name of ["newsroom_submit", "newsroom_publish", "unknown_tool"]) {
      assert.equal((await rpc(f, token.access_token, "tools/call", name)).status, 403);
    }
    const reviewer = await tokens(f, "newsroom:read newsroom:review");
    assert.equal((await rpc(f, reviewer.access_token, "tools/call", "newsroom_review")).status, 200);
  });

  it("rejects untrusted Origins and keeps malformed/oversized OAuth calls outside the legacy handler", async () => {
    const f = await instance();
    const token = await tokens(f);
    const response = await call(f, "/mcp", { method: "POST", headers: { Origin: "https://attacker.example" }, body: "{}" });
    assert.equal(response.status, 403);
    for (const body of ["not json", "[]", "null"]) {
      assert.equal((await call(f, "/mcp", { method: "POST", headers: { Authorization: "Bearer " + token.access_token,
        "Content-Type": "application/json" }, body })).status, 400);
    }
    assert.equal((await call(f, "/mcp", { method: "POST", headers: { Authorization: "Bearer " + token.access_token,
      "Content-Type": "application/json" }, body: JSON.stringify({ padding: "x".repeat(70_000) }) })).status, 413);
    assert.equal((await call(f, "/mcp", { headers: { Authorization: "Bearer " + token.access_token } })).status, 405);
    assert.equal((await call(f, "/mcp", { method: "POST", headers: { Authorization: "Bearer " + token.access_token,
      "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) })).status, 202);
  });

  it("never stores the upstream token in OAuth KV or returns it from tools/errors", async () => {
    const f = await instance();
    const token = await tokens(f);
    const namespace = await f.mf.getKVNamespace("OAUTH_KV");
    const keys = await namespace.list();
    for (const key of keys.keys) assert.ok(!(await namespace.get(key.name))?.includes(upstreamToken));
    const output = await (await rpc(f, token.access_token, "tools/call", "newsroom_read")).text();
    for (const secret of [upstreamToken, syntheticEnv.GITHUB_CLIENT_SECRET, f.client.clientSecret, token.access_token, token.refresh_token]) {
      assert.ok(!output.includes(secret));
    }
  });

  it("rotates refresh tokens and rejects a previous token after its replacement is used", async () => {
    const f = await instance();
    const initial = await tokens(f, "newsroom:read offline_access");
    const refresh = (value: string) => call(f, "/oauth/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", client_id: f.client.clientId,
        client_secret: f.client.clientSecret, refresh_token: value, resource: RESOURCE }),
    });
    const first = await refresh(initial.refresh_token);
    assert.equal(first.status, 200);
    const replacement = await first.json() as Tokens;
    assert.notEqual(replacement.refresh_token, initial.refresh_token);
    const second = await refresh(replacement.refresh_token);
    assert.equal(second.status, 200);
    assert.equal((await refresh(initial.refresh_token)).status, 400);
  });

  it("refuses expired access tokens and locally revoked refresh grants", async () => {
    const f = await instance();
    const token = await tokens(f, "newsroom:read offline_access");
    const namespace = await f.mf.getKVNamespace("OAUTH_KV");
    const keys = await namespace.list();
    let changed = 0;
    for (const key of keys.keys.filter(key => key.name.startsWith("token:"))) {
      const record = JSON.parse((await namespace.get(key.name))!);
      record.expiresAt = Math.floor(Date.now() / 1000) - 1;
      await namespace.put(key.name, JSON.stringify(record));
      changed++;
    }
    assert.ok(changed > 0);
    assert.equal((await rpc(f, token.access_token)).status, 401);
    const revoked = await call(f, "/oauth/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: f.client.clientId, client_secret: f.client.clientSecret,
        token: token.refresh_token, token_type_hint: "refresh_token" }),
    });
    assert.equal(revoked.status, 200);
    const refresh = await call(f, "/oauth/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", client_id: f.client.clientId,
        client_secret: f.client.clientSecret, refresh_token: token.refresh_token, resource: RESOURCE }),
    });
    assert.equal(refresh.status, 400);
  });

  it("rechecks the editor allowlist on both access and refresh", async () => {
    const f = await instance();
    const token = await tokens(f, "newsroom:read offline_access");
    const worker = await f.mf.getWorker();
    await (worker as unknown as Provision).changeEditor("54321");
    assert.equal((await rpc(f, token.access_token)).status, 401);
    const refresh = await call(f, "/oauth/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", client_id: f.client.clientId,
        client_secret: f.client.clientSecret, refresh_token: token.refresh_token, resource: RESOURCE }),
    });
    assert.equal(refresh.status, 400);
  });

  it("does not let an invalid bearer fall back to editor or an identity-provider call", async () => {
    const f = await instance();
    const result = await rpc(f, "invalid-synthetic-bearer", "tools/call", "newsroom_review");
    assert.equal(result.status, 401);
    assert.deepEqual(f.calls, { token: 0, identity: 0 });
    assert.ok(!(await result.text()).includes("invalid-synthetic-bearer"));
  });

  it("accepts only one of two simultaneous authorization-code exchanges", async () => {
    const f = await instance();
    const authorized = await code(f);
    const value = new URL(authorized.completed.headers.get("location")!).searchParams.get("code")!;
    const attempts = await Promise.all([exchange(f, value), exchange(f, value)]);
    assert.deepEqual(attempts.map(response => response.status).sort(), [200, 400]);
  });
});

describe("release policy", () => {
  it("has no fallback identity or role supplied by the client", () => {
    const env = { ...syntheticEnv, OAUTH_KV: {} } as unknown as Parameters<typeof configuration>[0];
    const config = configuration(env);
    assert.ok(isEditorGrant({ schema: 1, githubUserId: "12345" }, config));
    for (const value of [{ schema: 1, githubUserId: "99999", editor: true }, { editor: true }, null]) {
      assert.equal(isEditorGrant(value, config), false);
    }
    for (const change of [{ OAUTH_ISSUER: "http://newsroom.example" }, { EDITOR_GITHUB_USER_ID: "" },
      { CHATGPT_REDIRECT_URI: "https://chatgpt.com/callback#fragment" }, { GITHUB_CLIENT_SECRET: "" }]) {
      assert.throws(() => configuration({ ...env, ...change }), PolicyError);
    }
  });

  it("keeps release configuration free of production targets and bindings", async () => {
    const config = await readFile("cloudflare.config.ts", "utf8");
    assert.match(config, /defineConfig\(\{\}\)/);
    assert.ok(!config.includes("federated-republic-newsroom.jcr0916"));
  });
});
