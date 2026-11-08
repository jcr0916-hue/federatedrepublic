import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { mintBoundCredential, routeBoundCredential, sha256Hex } from "../prototype/issuer-boundary.ts";
import type { IssuerGrant } from "../src/issuer-grant.ts";

const ORIGIN = "https://candidate.invalid";
const CLIENT = "synthetic-registered-editor";
const SECRET = "synthetic-only-candidate-secret-long-randomish-0123456789";
const GITHUB_SECRET = "synthetic-dedicated-github-secret";
const GITHUB_ISSUER = "https://github.com/login/oauth";
const RESOURCE_ID = "synthetic-resource-validator";
const RESOURCE_SECRET = "synthetic-resource-validator-secret-0123456789";
const RESOURCE_AUTH = "Basic " + Buffer.from(RESOURCE_ID + ":" + RESOURCE_SECRET).toString("base64");
const AUDIENCE = "https://resource.invalid/mcp";
const REDIRECT = "https://chatgpt.invalid/oauth/callback?registered=1";
const STATE = "opaque client state +/%&= keeps its original value";
const VERIFIER = "pkce-verifier-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefgh";
const hash = (raw: string) => createHash("sha256").update(raw).digest("hex");
const s256 = (raw: string) => createHash("sha256").update(raw).digest("base64url");
const AUTH = "Basic " + Buffer.from(CLIENT + ":" + SECRET).toString("base64");
const POST_HEADERS = { Authorization: AUTH, "Content-Type": "application/x-www-form-urlencoded" };
const EXPECTED = { clientId: CLIENT, editorId: "12345", audience: AUDIENCE };
const cookie = (response: { headers: { get(name: string): string | null } }) =>
  response.headers.get("set-cookie")!.split(";")[0];
const changeSecret = (raw: string) => raw.slice(0, -1) + (raw.endsWith("f") ? "e" : "f");

describe("standalone issuer browser + code lifecycle (mock GitHub, no live grants)", () => {
  let mf: Miniflare;
  let script: string;
  let tokenCalls = 0, userCalls = 0;
  const upstream = new Map<string, { scenario: string; challenge: string }>();
  const bindings = {
    ISSUER_ORIGIN: ORIGIN, ISSUER_CLIENT_ID: CLIENT, ISSUER_CLIENT_SECRET_SHA256: hash(SECRET),
    ISSUER_RESOURCE_ID: RESOURCE_ID, ISSUER_RESOURCE_SECRET_SHA256: hash(RESOURCE_SECRET),
    ISSUER_REDIRECT_URI: REDIRECT, ISSUER_AUDIENCE: AUDIENCE, ISSUER_EDITOR_ID: "12345",
    ISSUER_GITHUB_CLIENT_ID: "dedicated-test-github-app", ISSUER_GITHUB_CLIENT_SECRET: GITHUB_SECRET,
  };
  before(async () => {
    const built = await build({
      entryPoints: ["src/issuer-candidate.ts"], bundle: true, format: "esm", platform: "neutral",
      target: "es2023", mainFields: ["module", "main"], external: ["cloudflare:workers"],
      write: false, logLevel: "silent",
    });
    script = built.outputFiles[0].text;
    mf = new Miniflare(convertV4MiniflareOptions({
      modules: true, script, compatibilityDate: "2026-10-01", bindings,
      ratelimits: { ISSUER_INGRESS_LIMIT: { namespace_id: "10011", simple: { limit: 20000, period: 60 } } },
      durableObjects: { ISSUER_GRANTS: { className: "IssuerGrant", useSQLite: true },
        ISSUER_GUARD: { className: "IssuerGuard", useSQLite: true } },
      outboundService: async request => {
        const url = new URL(request.url);
        if (url.href === "https://github.com/login/oauth/access_token") {
          tokenCalls++;
          const form = new URLSearchParams(await request.text());
          assert.equal(form.get("client_id"), bindings.ISSUER_GITHUB_CLIENT_ID);
          assert.equal(form.get("client_secret"), GITHUB_SECRET);
          assert.equal(form.get("redirect_uri"), ORIGIN + "/oauth/callback");
          const entry = upstream.get(form.get("code")!);
          assert.ok(entry, "unexpected GitHub code");
          assert.equal(s256(form.get("code_verifier")!), entry.challenge);
          const scenario = entry.scenario;
          if (scenario === "token_timeout") throw new DOMException("test timeout", "TimeoutError");
          if (scenario === "token_status") return Response.json({ private: GITHUB_SECRET }, { status: 503 });
          if (scenario === "token_redirect") return new Response(null, { status: 302, headers: { Location: "https://evil.invalid" } });
          if (scenario === "token_json") return new Response("{");
          if (scenario === "token_large") return new Response(new ReadableStream({
            start(controller) { controller.enqueue(new TextEncoder().encode(" ".repeat(17_000))); controller.close(); },
          }));
          return Response.json({
            access_token: scenario === "token_missing" ? undefined : "gho_" + scenario,
            token_type: scenario === "token_type" ? "mac" : "bearer",
            scope: scenario === "scope_repo" ? "repo" : scenario === "scope_type" ? ["repo"] : "",
          });
        }
        if (url.href === "https://api.github.com/user") {
          userCalls++;
          assert.ok(request.headers.get("User-Agent"));
          const scenario = request.headers.get("Authorization")!.slice("Bearer gho_".length);
          if (scenario === "user_timeout") throw new DOMException("test timeout", "TimeoutError");
          if (scenario === "user_status") return Response.json({ private: GITHUB_SECRET }, { status: 503 });
          if (scenario === "user_json") return new Response("{");
          return Response.json({ id: scenario === "wrong_editor" ? 67890 : scenario === "string_editor" ? "12345" : 12345 });
        }
        assert.fail("Unexpected outbound request: " + url.origin + url.pathname);
      },
    }));
  });
  after(async () => { await mf?.dispose(); });

  const startParams = () => new URLSearchParams({
    response_type: "code", client_id: CLIENT, redirect_uri: REDIRECT, scope: "newsroom:read",
    resource: AUDIENCE, state: STATE, code_challenge: s256(VERIFIER), code_challenge_method: "S256",
  });
  const start = async () => {
    const response = await mf.dispatchFetch(ORIGIN + "/authorize?" + startParams(), { redirect: "manual" });
    assert.equal(response.status, 302, await response.clone().text());
    const github = new URL(response.headers.get("location")!);
    assert.equal(github.origin + github.pathname, "https://github.com/login/oauth/authorize");
    assert.equal(github.searchParams.get("client_id"), bindings.ISSUER_GITHUB_CLIENT_ID);
    assert.equal(github.searchParams.get("redirect_uri"), ORIGIN + "/oauth/callback");
    assert.equal(github.searchParams.get("scope"), "");
    assert.equal(github.searchParams.get("code_challenge_method"), "S256");
    assert.notEqual(github.searchParams.get("state"), STATE);
    assert.notEqual(github.searchParams.get("code_challenge"), s256(VERIFIER));
    assert.match(response.headers.get("set-cookie")!, /; Path=\/; Secure; HttpOnly; SameSite=Lax; Max-Age=300$/);
    return { cookie: cookie(response), state: github.searchParams.get("state")!,
      challenge: github.searchParams.get("code_challenge")! };
  };
  const callback = async (transaction: Awaited<ReturnType<typeof start>>, scenario = "good", githubIssuer?: string) => {
    const code = randomBytes(16).toString("hex");
    upstream.set(code, { scenario, challenge: transaction.challenge });
    const params = new URLSearchParams({ state: transaction.state, code });
    if (githubIssuer !== undefined) params.set("iss", githubIssuer);
    return mf.dispatchFetch(ORIGIN + "/oauth/callback?" + params, {
      redirect: "manual", headers: { Cookie: transaction.cookie },
    });
  };
  const login = async () => {
    const transaction = await start();
    const response = await callback(transaction);
    assert.equal(response.status, 200, await response.clone().text());
    const html = await response.text();
    const csrf = html.match(/name="csrf" value="([a-f0-9]{64})"/)?.[1];
    assert.ok(csrf);
    assert.notEqual(cookie(response), transaction.cookie, "rotate session after authenticating");
    assert.equal(response.headers.get("referrer-policy"), "origin");
    assert.ok(response.headers.get("content-security-policy")?.includes("https://chatgpt.invalid"));
    assert.ok(!html.includes(SECRET) && !html.includes(GITHUB_SECRET) && !html.includes(STATE));
    return { cookie: cookie(response), csrf, oldCookie: transaction.cookie };
  };
  const consent = (session: Awaited<ReturnType<typeof login>>, decision = "approve", extra: Record<string, string> = {}) =>
    mf.dispatchFetch(ORIGIN + "/consent", { method: "POST", redirect: "manual",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: ORIGIN, Cookie: session.cookie },
      body: new URLSearchParams({ csrf: session.csrf, decision, ...extra }),
    });
  const authorizeCode = async () => {
    const session = await login();
    const response = await consent(session);
    assert.equal(response.status, 302, await response.clone().text());
    const location = new URL(response.headers.get("location")!);
    assert.equal(location.origin + location.pathname, "https://chatgpt.invalid/oauth/callback");
    assert.equal(location.searchParams.get("registered"), "1");
    assert.equal(location.searchParams.get("state"), STATE);
    assert.equal(location.searchParams.get("iss"), ORIGIN);
    assert.match(response.headers.get("set-cookie")!, /Max-Age=0$/);
    return location.searchParams.get("code")!;
  };
  const post = async (path: string, fields: Record<string, string> | URLSearchParams,
    requestHeaders: Record<string, string> = POST_HEADERS) => {
    const response = await mf.dispatchFetch(ORIGIN + path, {
      method: "POST", redirect: "manual", headers: requestHeaders, body: new URLSearchParams(fields),
    });
    const raw = await response.text();
    assert.equal(response.headers.get("cache-control"), "no-store");
    return { status: response.status, body: (raw ? JSON.parse(raw) : {}) as Record<string, unknown>, response, raw };
  };
  const exchangeFields = (code: string) => ({
    grant_type: "authorization_code", code, code_verifier: VERIFIER, redirect_uri: REDIRECT, resource: AUDIENCE,
  });
  const tokens = async () => {
    const result = await post("/token", exchangeFields(await authorizeCode()));
    assert.equal(result.status, 200, result.raw);
    return { access: String(result.body.access_token), refresh: String(result.body.refresh_token) };
  };
  const introspect = async (token: string) => (await post("/introspect", { token, token_type_hint: "access_token" },
    { ...POST_HEADERS, Authorization: RESOURCE_AUTH })).body;

  it("fails closed with missing dedicated configuration and has no issuance/admin shortcuts", async () => {
    const unconfigured = new Miniflare(convertV4MiniflareOptions({
      modules: true, script, compatibilityDate: "2026-10-01",
      bindings: { ...bindings, ISSUER_GITHUB_CLIENT_SECRET: "" },
      durableObjects: { ISSUER_GRANTS: { className: "IssuerGrant", useSQLite: true },
        ISSUER_GUARD: { className: "IssuerGuard", useSQLite: true } },
    }));
    try {
      const response = await unconfigured.dispatchFetch(ORIGIN + "/authorize?" + startParams());
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { error: "issuer_not_configured" });
    } finally { await unconfigured.dispose(); }
    for (const path of ["/issue", "/admin", "/begin_code", "/consent_complete"])
      assert.equal((await post(path, {})).status, 404, path);
    assert.ok(!script.includes("SyntheticOAuthGrant"));
    const metadata = await mf.dispatchFetch(ORIGIN + "/.well-known/oauth-authorization-server");
    const data = await metadata.json() as Record<string, unknown>;
    assert.equal(data.issuer, ORIGIN);
    assert.equal(data.token_endpoint, ORIGIN + "/token");
    assert.deepEqual(data.grant_types_supported, ["authorization_code", "refresh_token"]);
    assert.deepEqual(data.token_endpoint_auth_methods_supported, ["client_secret_basic", "client_secret_post"]);
    assert.equal(data.authorization_response_iss_parameter_supported, true);
  });

  it("rejects changed/duplicate authorization inputs before redirecting or setting a cookie", async () => {
    for (const [key, value] of [
      ["client_id", "other"], ["response_type", "token"], ["redirect_uri", "https://evil.invalid/"],
      ["scope", "newsroom:read newsroom:review"], ["resource", "https://evil.invalid/mcp"],
      ["code_challenge_method", "plain"], ["code_challenge", "bad"], ["state", ""], ["grant", "chosen"],
    ]) {
      const params = startParams(); params.set(key, value);
      const response = await mf.dispatchFetch(ORIGIN + "/authorize?" + params, { redirect: "manual" });
      assert.equal(response.status, 400, key);
      assert.equal(response.headers.get("location"), null);
      assert.equal(response.headers.get("set-cookie"), null);
    }
    const params = startParams(); params.append("state", "duplicate");
    assert.equal((await mf.dispatchFetch(ORIGIN + "/authorize?" + params)).status, 400);
    assert.equal((await mf.dispatchFetch("https://other.invalid/authorize?" + startParams())).status, 421);
  });

  it("allows bounded optional ChatGPT ui_locales but rejects malformed or repeated hints", async () => {
    for (const locale of ["en-US", "en-US fr-CA"]) {
      const params = startParams(); params.set("ui_locales", locale);
      const response = await mf.dispatchFetch(ORIGIN + "/authorize?" + params, { redirect: "manual" });
      assert.equal(response.status, 302, locale);
    }
    for (const locale of ["", "en_US", "en-US/evil", "x".repeat(129)]) {
      const params = startParams(); params.set("ui_locales", locale);
      const response = await mf.dispatchFetch(ORIGIN + "/authorize?" + params, { redirect: "manual" });
      assert.equal(response.status, 400, locale);
    }
    const duplicate = startParams(); duplicate.append("ui_locales", "en-US"); duplicate.append("ui_locales", "fr-CA");
    assert.equal((await mf.dispatchFetch(ORIGIN + "/authorize?" + duplicate)).status, 400);
  });

  it("authenticates the editor before consent and exchanges a code for read-only tokens", async () => {
    const code = await authorizeCode();
    const result = await post("/token", exchangeFields(code));
    assert.equal(result.status, 200, result.raw);
    assert.equal(result.body.token_type, "Bearer");
    assert.equal(result.body.expires_in, 900);
    assert.equal(result.body.scope, "newsroom:read");
    assert.match(String(result.body.access_token), /^nr1a\.[a-f0-9]{64}\.[a-f0-9]{64}$/);
    assert.match(String(result.body.refresh_token), /^nr1r\.[a-f0-9]{64}\.[a-f0-9]{64}$/);
    const inspected = await introspect(String(result.body.access_token));
    assert.equal(inspected.active, true);
    assert.equal(inspected.scope, "newsroom:read");
    assert.equal(inspected.aud, AUDIENCE);
    assert.equal(inspected.iss, ORIGIN);
    assert.equal(inspected.client_id, CLIENT);
    assert.ok(Number(inspected.exp) > Date.now() / 1000);
    assert.deepEqual(await introspect(String(result.body.refresh_token)), { active: false });
    assert.equal((await post("/token", exchangeFields(code))).status, 400);
  });

  it("requires the rotated cookie, exact Origin and CSRF token; denial cannot issue a code", async () => {
    const pending = await start();
    assert.equal((await consent({ cookie: pending.cookie, oldCookie: "", csrf: "a".repeat(64) })).status, 403);
    const session = await login();
    assert.equal((await consent({ ...session, cookie: session.oldCookie })).status, 403);
    assert.equal((await consent({ ...session, csrf: "b".repeat(64) })).status, 403);
    assert.equal((await consent({ ...session, cookie: session.cookie + "; " + session.cookie })).status, 403);
    const other = await login();
    assert.equal((await consent({ ...session, cookie: other.cookie })).status, 403);
    for (const origin of ["null", "https://evil.invalid", ""]) {
      assert.equal((await mf.dispatchFetch(ORIGIN + "/consent", { method: "POST", headers: {
        "Content-Type": "application/x-www-form-urlencoded", Cookie: session.cookie,
        ...(origin ? { Origin: origin } : {}),
      }, body: new URLSearchParams({ csrf: session.csrf, decision: "approve" }) })).status, 403);
    }
    assert.equal((await consent(session, "approve", { grant: "chosen" })).status, 400);
    const denied = await consent(session, "deny");
    assert.equal(denied.status, 302);
    const location = new URL(denied.headers.get("location")!);
    assert.equal(location.searchParams.get("error"), "access_denied");
    assert.equal(location.searchParams.get("state"), STATE);
    assert.equal(location.searchParams.has("code"), false);
    assert.equal((await consent(session)).status, 403);
    const approvals = await Promise.all([consent(other), consent(other)]);
    assert.deepEqual(approvals.map(x => x.status).sort(), [302, 403]);
  });

  it("binds codes to client, S256 verifier, exact redirect/resource and one redemption", async () => {
    const code = await authorizeCode();
    const fields = exchangeFields(code);
    assert.equal((await post("/token", fields, { "Content-Type": POST_HEADERS["Content-Type"] })).status, 401);
    assert.equal((await post("/token", fields, { ...POST_HEADERS,
      Authorization: "Basic " + Buffer.from("other:" + SECRET).toString("base64") })).status, 401);
    const badFields: Record<string, string>[] = [
      { code_verifier: "x".repeat(43) }, { code_verifier: "bad" }, { redirect_uri: "https://evil.invalid/" },
      { resource: "https://evil.invalid/mcp" }, { code: changeSecret(code) }, { grant: "chosen" },
    ];
    for (const changes of badFields) assert.equal((await post("/token", { ...fields, ...changes })).status, 400);
    const duplicated = new URLSearchParams(fields); duplicated.append("code", code);
    assert.equal((await post("/token", duplicated)).status, 400);
    const attempts = await Promise.all([post("/token", fields), post("/token", fields)]);
    assert.deepEqual(attempts.map(x => x.status).sort(), [200, 400]);
    assert.equal((await post("/token", fields)).status, 400);
  });

  it("rotates refresh atomically and revokes access and refresh without affecting another grant", async () => {
    const first = await tokens(), other = await tokens();
    const fields = { grant_type: "refresh_token", refresh_token: first.refresh };
    assert.equal((await post("/token", { ...fields, scope: "newsroom:review" })).status, 400);
    assert.equal((await post("/token", { ...fields, resource: "https://evil.invalid/mcp" })).status, 400);
    // A second use now revokes the family; ordinary revocation is tested with
    // one rotation. Duplicate-race quarantine has its own adversarial case.
    const rotated = await post("/token", fields);
    assert.equal(rotated.status, 200);
    const current = rotated.body;
    assert.deepEqual(await introspect(first.access), { active: false });
    assert.equal((await introspect(String(current.access_token))).active, true);
    assert.deepEqual(await introspect(changeSecret(String(current.access_token))), { active: false });
    const crossGrant = String(current.access_token).split(".");
    crossGrant[1] = other.access.split(".")[1];
    assert.deepEqual(await introspect(crossGrant.join(".")), { active: false });
    await post("/revoke", { token: changeSecret(String(current.refresh_token)) });
    assert.equal((await introspect(String(current.access_token))).active, true);
    assert.equal((await post("/revoke", { token: String(current.refresh_token) }, {
      "Content-Type": POST_HEADERS["Content-Type"],
    })).status, 401);
    assert.equal((await post("/revoke", { token: String(current.refresh_token), token_type_hint: "access_token" })).status, 200);
    assert.deepEqual(await introspect(String(current.access_token)), { active: false });
    assert.equal((await post("/token", { grant_type: "refresh_token", refresh_token: String(current.refresh_token) })).status, 400);
    assert.equal((await introspect(other.access)).active, true);
    assert.equal((await post("/revoke", { token: "unknown" })).status, 200);
    await post("/revoke", { token: other.access });
    assert.deepEqual(await introspect(other.access), { active: false });
  });

  it("rejects ambiguous callbacks before GitHub calls, then consumes valid/cancelled state once", async () => {
    const transaction = await start();
    const beforeCalls = tokenCalls;
    for (const suffix of ["&code=one&code=two", "&code=one&error=access_denied", "&code=one&extra=x",
      "&code=one&state=duplicate", "&error=access_denied&code=one"]) {
      const response = await mf.dispatchFetch(ORIGIN + "/oauth/callback?state=" + transaction.state + suffix, {
        redirect: "manual", headers: { Cookie: transaction.cookie },
      });
      assert.equal(response.status, 400);
      assert.equal(response.headers.get("location"), null);
    }
    const other = await start();
    assert.equal((await callback({ ...transaction, cookie: other.cookie })).status, 403);
    assert.equal(tokenCalls, beforeCalls);
    assert.equal((await callback(transaction)).status, 200);
    const afterCalls = tokenCalls;
    assert.equal((await callback(transaction)).status, 403);
    assert.equal(tokenCalls, afterCalls);
    const cancelUrl = ORIGIN + "/oauth/callback?" + new URLSearchParams({ state: other.state, error: "access_denied" });
    const cancelled = await mf.dispatchFetch(cancelUrl, { redirect: "manual", headers: { Cookie: other.cookie } });
    assert.equal(cancelled.status, 302);
    assert.equal(new URL(cancelled.headers.get("location")!).searchParams.get("state"), STATE);
    assert.equal(tokenCalls, afterCalls);
    assert.equal((await callback(other)).status, 403);
  });

  it("accepts the pinned GitHub issuer and preserves the downstream issuer after consent", async () => {
    const transaction = await start();
    const response = await callback(transaction, "good", GITHUB_ISSUER);
    assert.equal(response.status, 200, await response.clone().text());
    const html = await response.text();
    const csrf = html.match(/name="csrf" value="([a-f0-9]{64})"/)?.[1];
    assert.ok(csrf);
    const approved = await consent({ cookie: cookie(response), csrf, oldCookie: transaction.cookie });
    assert.equal(approved.status, 302);
    const redirect = new URL(approved.headers.get("location")!);
    assert.equal(redirect.searchParams.get("iss"), ORIGIN);
    assert.equal(redirect.searchParams.get("state"), STATE);
    assert.ok(redirect.searchParams.get("code"));
    const beforeReplay = tokenCalls;
    assert.equal((await callback(transaction, "good", GITHUB_ISSUER)).status, 403);
    assert.equal(tokenCalls, beforeReplay);
  });

  it("rejects wrong or duplicate upstream issuer fields before consuming state or calling GitHub", async () => {
    const transaction = await start();
    const beforeCalls = tokenCalls;
    const bad: URLSearchParams[] = [];
    for (const iss of ["", "https://evil.invalid", "https://github.com.evil.invalid/login/oauth",
      GITHUB_ISSUER + "/", GITHUB_ISSUER + "?extra=1", GITHUB_ISSUER + "#fragment"]) {
      bad.push(new URLSearchParams({ state: transaction.state, code: "synthetic-only", iss }));
      bad.push(new URLSearchParams({ state: transaction.state, error: "access_denied", iss }));
    }
    for (const other of [GITHUB_ISSUER, "https://evil.invalid"]) {
      const params = new URLSearchParams({ state: transaction.state, code: "synthetic-only", iss: GITHUB_ISSUER });
      params.append("iss", other); bad.push(params);
    }
    for (const params of bad) {
      const response = await mf.dispatchFetch(ORIGIN + "/oauth/callback?" + params, {
        redirect: "manual", headers: { Cookie: transaction.cookie },
      });
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: "invalid_callback" });
      assert.equal(response.headers.get("location"), null);
      assert.equal(response.headers.get("set-cookie"), null);
    }
    assert.equal(tokenCalls, beforeCalls);
    assert.equal((await callback(transaction, "good", GITHUB_ISSUER)).status, 200);
    assert.equal(tokenCalls, beforeCalls + 1);
  });

  it("accepts cancellation with the pinned GitHub issuer without exchanging or issuing a code", async () => {
    const transaction = await start();
    const beforeCalls = tokenCalls;
    const params = new URLSearchParams({ state: transaction.state, error: "access_denied", iss: GITHUB_ISSUER });
    const response = await mf.dispatchFetch(ORIGIN + "/oauth/callback?" + params, {
      redirect: "manual", headers: { Cookie: transaction.cookie },
    });
    assert.equal(response.status, 302);
    const redirect = new URL(response.headers.get("location")!);
    assert.equal(redirect.searchParams.get("error"), "access_denied");
    assert.equal(redirect.searchParams.get("state"), STATE);
    assert.equal(redirect.searchParams.get("iss"), ORIGIN);
    assert.equal(redirect.searchParams.has("code"), false);
    assert.equal(tokenCalls, beforeCalls);
    assert.equal((await callback(transaction, "good", GITHUB_ISSUER)).status, 403);
    assert.equal(tokenCalls, beforeCalls);
  });

  it("fails closed on GitHub identity, scope, malformed/large responses, redirects and timeouts", async () => {
    for (const [scenario, status] of [
      ["wrong_editor", 403], ["string_editor", 403], ["scope_repo", 403], ["scope_type", 502],
      ["token_missing", 502], ["token_type", 502], ["token_status", 502], ["token_redirect", 502],
      ["token_json", 502], ["token_large", 502], ["token_timeout", 502],
      ["user_status", 502], ["user_json", 502], ["user_timeout", 502],
    ] as const) {
      const transaction = await start();
      const response = await callback(transaction, scenario);
      assert.equal(response.status, status, scenario + ": " + await response.clone().text());
      assert.equal(response.headers.get("location"), null);
      assert.equal(response.headers.get("set-cookie"), null);
      const raw = await response.text();
      assert.ok(!raw.includes(SECRET) && !raw.includes(GITHUB_SECRET) && !raw.includes("gho_"));
      const beforeCalls = tokenCalls;
      assert.equal((await callback(transaction)).status, 403, "no callback retry: " + scenario);
      assert.equal(tokenCalls, beforeCalls);
    }
    assert.ok(userCalls > 0);
    assert.equal((await callback(await start())).status, 200, "fresh authorization recovers");
  });

  it("enforces DO expiry and current editor/client/audience bindings without a public test clock", async () => {
    const namespace = await mf.getDurableObjectNamespace("ISSUER_GRANTS");
    const rpc = (grantId: string) => {
      const raw = namespace.get(namespace.idFromName(grantId));
      return raw as typeof raw & Pick<DurableObjectStub<IssuerGrant>, "claimUpstream" | "exchangeCode" | "authorize" | "refresh">;
    };
    const transaction = await start();
    const state = (await routeBoundCredential(transaction.state, "state"))!;
    const session = (await routeBoundCredential(transaction.cookie.split("=")[1], "browser"))!;
    const future = Math.floor(Date.now() / 1000) + 301;
    assert.equal(await rpc(state.grantId).claimUpstream({ browserHash: session.credentialHash,
      upstreamHash: state.credentialHash, expected: EXPECTED, now: future }), null);
    const code = (await routeBoundCredential(await authorizeCode(), "code"))!;
    assert.equal(await rpc(code.grantId).exchangeCode({ expected: EXPECTED, codeHash: code.credentialHash,
      challenge: s256(VERIFIER), redirectUri: REDIRECT, refreshHash: "a".repeat(64),
      accessHash: "b".repeat(64), now: future + 301 }), false);
    const issued = await tokens();
    const access = (await routeBoundCredential(issued.access, "access"))!;
    for (const expected of [ { ...EXPECTED, editorId: "67890" }, { ...EXPECTED, clientId: "other" },
      { ...EXPECTED, audience: "https://evil.invalid/mcp" } ]) {
      assert.equal(await rpc(access.grantId).authorize({ expected, accessHash: access.credentialHash,
        now: Math.floor(Date.now() / 1000) }), false);
    }
    assert.equal(await rpc(access.grantId).authorize({ expected: EXPECTED, accessHash: access.credentialHash,
      now: future + 901 }), false);
    assert.equal(await rpc(access.grantId).refresh({ expected: EXPECTED, presentedHash: await sha256Hex(issued.refresh),
      refreshHash: await sha256Hex(mintBoundCredential(access.grantId, "refresh")), accessHash: "c".repeat(64),
      now: future + 28801 }), false);
  });

  it("rejects malformed token requests, unsupported grants, hints and oversized streamed forms", async () => {
    const fields = { grant_type: "refresh_token", refresh_token: "invalid" };
    assert.equal((await post("/token", { grant_type: "client_credentials" })).status, 400);
    assert.equal((await post("/token", { ...fields, audience: "evil" })).status, 400);
    assert.equal((await post("/token", new URLSearchParams(
      "grant_type=refresh_token&grant_type=refresh_token&refresh_token=invalid"))).status, 400);
    assert.equal((await post("/token", fields, { Authorization: AUTH, "Content-Type": "application/json" })).status, 415);
    assert.equal((await post("/token?grant=chosen", fields)).status, 400);
    assert.equal((await post("/token", { ...fields, refresh_token: "x".repeat(5000) })).status, 413);
    assert.equal((await post("/introspect", { token: "invalid", token_type_hint: "refresh_token" }, {
      ...POST_HEADERS, Authorization: RESOURCE_AUTH,
    })).status, 400);
    assert.equal((await post("/introspect", { token: "invalid", token_type_hint: "access_token" }, {
      ...POST_HEADERS, Authorization: "Basic invalid",
    })).status, 401);
    const wrongClient = await post("/token", fields, { "Content-Type": POST_HEADERS["Content-Type"] });
    assert.equal(wrongClient.response.headers.get("www-authenticate"), 'Basic realm="newsroom-issuer"');
  });
});
