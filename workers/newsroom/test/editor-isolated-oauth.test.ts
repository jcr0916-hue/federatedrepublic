import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions, type V4WorkerOptions } from "miniflare";
import configuration from "../release/editor-isolated-configuration.json" with { type: "json" };
import { basic, challenge, hash } from "./candidate-harness.ts";
import { ADMISSION_KEY, CHALLENGE_BINDINGS, mockSiteverify, solveChallenge } from "./challenge-fixture.ts";

const { chatgpt, issuer, gateway } = configuration;
const ISSUER = `https://${issuer.name}.invalid`;
const AUDIENCE = `https://${gateway.name}.invalid/mcp`;
const CALLBACK = issuer.bindings.ISSUER_REDIRECT_URI.text;
const CLIENT_SECRET = "synthetic-only-editor-oauth-client-secret";
const VALIDATOR = "synthetic-editor-validator";
const VALIDATOR_SECRET = "synthetic-only-editor-validator-secret";
const GITHUB_ID = "synthetic-github-app";
const GITHUB_SECRET = "synthetic-only-github-app-secret";
const UPSTREAM_KEY = "synthetic-only-editor-upstream-bearer";
const UPSTREAM_URL = "https://federated-republic-newsroom.jcr0916.workers.dev/mcp";
const KEY = "submissions/federal/2026-11-11/11111111-1111-4111-8111-111111111111.json";
const VERIFIER = "synthetic-editor-pkce-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const STATE = "synthetic editor state +/%&=";
const formHeaders = { "Content-Type": "application/x-www-form-urlencoded" };

const cookie = (response: { headers: { get(name: string): string | null } }) =>
  response.headers.get("Set-Cookie")!.split(";")[0];

async function bundle(entry: string) {
  const result = await build({ entryPoints: [entry], bundle: true, format: "esm", platform: "neutral",
    target: "es2023", mainFields: ["module", "main"], external: ["cloudflare:workers"], write: false });
  return result.outputFiles[0].text;
}

function rateLimit({ namespace_id, simple }: typeof issuer.bindings.ISSUER_INGRESS_LIMIT):
  NonNullable<V4WorkerOptions["ratelimits"]>[string] {
  const { limit, period } = simple;
  assert.ok(period === 10 || period === 60);
  return { namespace_id, simple: { limit, period } };
}

describe("isolated ChatGPT Editor OAuth (local Workers and synthetic services)", () => {
  let runtime: Miniflare;
  let githubChallenge: string;
  const usedChallenges = new Set<string>();
  const review = { key: KEY, status: "HOLD", note: "Synthetic review only" };
  const upstreamCalls: string[] = [];
  let receipt: typeof review | undefined;

  before(async () => {
    const [issuerScript, gatewayScript] = await Promise.all([
      bundle("src/issuer-editor-candidate.ts"), bundle("src/editor-gateway-candidate.ts"),
    ]);
    const { ISSUER_GRANTS, ISSUER_GUARD } = issuer.bindings;
    const durableObjects = Object.fromEntries(Object.entries({ ISSUER_GRANTS, ISSUER_GUARD }).map(([binding, { class_name }]) => {
      const { storage } = issuer.exports[class_name as keyof typeof issuer.exports];
      return [binding, { className: class_name, useSQLite: storage === "sqlite" }];
    }));
    runtime = new Miniflare(convertV4MiniflareOptions({ workers: [
      {
        name: issuer.name, modules: true, script: issuerScript, compatibilityDate: issuer.compatibility_date,
        routes: [`${new URL(ISSUER).hostname}/*`], durableObjects,
        ratelimits: { ISSUER_INGRESS_LIMIT: rateLimit(issuer.bindings.ISSUER_INGRESS_LIMIT) },
        bindings: {
          ...CHALLENGE_BINDINGS, ISSUER_ADMISSION_KEY: ADMISSION_KEY, ISSUER_ORIGIN: ISSUER,
          ISSUER_AUDIENCE: AUDIENCE, ISSUER_CLIENT_ID: chatgpt.client_id, ISSUER_REDIRECT_URI: CALLBACK,
          ISSUER_CLIENT_SECRET_SHA256: hash(CLIENT_SECRET), ISSUER_RESOURCE_ID: VALIDATOR,
          ISSUER_RESOURCE_SECRET_SHA256: hash(VALIDATOR_SECRET), ISSUER_EDITOR_ID: "12345",
          ISSUER_GITHUB_CLIENT_ID: GITHUB_ID, ISSUER_GITHUB_CLIENT_SECRET: GITHUB_SECRET,
        },
        outboundService: async request => {
          if (request.url === "https://challenges.cloudflare.com/turnstile/v0/siteverify")
            return mockSiteverify(request, new URL(ISSUER).hostname, usedChallenges);
          if (request.url === "https://github.com/login/oauth/access_token") {
            const form = new URLSearchParams(await request.text());
            assert.equal(form.get("client_id"), GITHUB_ID);
            assert.equal(form.get("client_secret"), GITHUB_SECRET);
            assert.equal(form.get("code"), "synthetic-github-code");
            assert.equal(form.get("redirect_uri"), ISSUER + "/oauth/callback");
            assert.equal(challenge(form.get("code_verifier")!), githubChallenge);
            return Response.json({ access_token: "synthetic_github_token", token_type: "bearer", scope: "" });
          }
          if (request.url === "https://api.github.com/user") {
            assert.equal(request.headers.get("Authorization"), "Bearer synthetic_github_token");
            return Response.json({ id: 12345 });
          }
          assert.fail("Unexpected issuer egress");
        },
      },
      {
        name: gateway.name, modules: true, script: gatewayScript, compatibilityDate: gateway.compatibility_date,
        routes: [`${new URL(AUDIENCE).hostname}/*`],
        ratelimits: { RESOURCE_INGRESS_LIMIT: rateLimit(gateway.bindings.RESOURCE_INGRESS_LIMIT) },
        bindings: {
          RESOURCE_ADMISSION_KEY: ADMISSION_KEY, RESOURCE_AUDIENCE: AUDIENCE, RESOURCE_ISSUER: ISSUER,
          RESOURCE_CLIENT_ID: chatgpt.client_id, RESOURCE_VALIDATOR_ID: VALIDATOR,
          RESOURCE_VALIDATOR_SECRET: VALIDATOR_SECRET, NEWSROOM_UPSTREAM_URL: UPSTREAM_URL,
          NEWSROOM_EDITOR_KEY: UPSTREAM_KEY,
        },
        serviceBindings: {
          ISSUER: gateway.bindings.ISSUER.service,
          NEWSROOM_UPSTREAM: async request => {
            // Miniflare delivers this URL only to the synthetic service binding.
            assert.equal(request.url, UPSTREAM_URL);
            assert.equal(request.headers.get("Authorization"), `Bearer ${UPSTREAM_KEY}`);
            const rpc = await request.json() as { id: number; params: { name: string; arguments: unknown } };
            const { name, arguments: args } = rpc.params;
            upstreamCalls.push(name);
            if (name === "newsroom_review") {
              assert.deepEqual(args, review);
              receipt = review;
            } else {
              assert.equal(name, "newsroom_read");
              assert.deepEqual(args, { key: KEY });
            }
            return Response.json({ jsonrpc: "2.0", id: rpc.id, result: { receipt } });
          },
        },
        outboundService: () => assert.fail("Unexpected gateway egress"),
      },
    ] }));
  });
  after(async () => { await runtime?.dispose(); });

  const authorizeUrl = (redirectUri = CALLBACK) => ISSUER + "/authorize?" + new URLSearchParams({
    response_type: "code", client_id: chatgpt.client_id, redirect_uri: redirectUri, scope: chatgpt.scope,
    resource: AUDIENCE, state: STATE, code_challenge: challenge(VERIFIER), code_challenge_method: "S256",
  });
  const begin = async () => {
    const response = await solveChallenge(runtime.dispatchFetch.bind(runtime), authorizeUrl());
    assert.equal(response.status, 302, await response.clone().text());
    const github = new URL(response.headers.get("Location")!);
    assert.equal(github.origin + github.pathname, "https://github.com/login/oauth/authorize");
    assert.equal(github.searchParams.get("redirect_uri"), ISSUER + "/oauth/callback");
    githubChallenge = github.searchParams.get("code_challenge")!;
    return { session: cookie(response), state: github.searchParams.get("state")! };
  };
  const chatgptRedirect = (location: string | null) => {
    assert.ok(location);
    const url = new URL(location);
    assert.equal(url.origin + url.pathname, CALLBACK);
    assert.equal(url.searchParams.get("iss"), ISSUER);
    assert.equal(url.searchParams.get("state"), STATE);
    return url.searchParams;
  };
  const clientPost = (path: string, fields: Record<string, string>) => runtime.dispatchFetch(ISSUER + path, {
    method: "POST", headers: { ...formHeaders, Authorization: basic(chatgpt.client_id, CLIENT_SECRET) },
    body: new URLSearchParams(fields),
  });
  const call = (token: string, name: string, args: Record<string, string>) => runtime.dispatchFetch(AUDIENCE, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
  });

  it("stages two issuer-owned SQLite namespaces and keeps both Workers closed", async () => {
    for (const worker of [issuer, gateway]) {
      assert.equal(worker.workers_dev, false);
      assert.equal(worker.preview_urls, false);
    }
    assert.deepEqual(issuer.exports, {
      IssuerGrant: { type: "durable-object", storage: "sqlite" },
      IssuerGuard: { type: "durable-object", storage: "sqlite" },
    });
    assert.deepEqual(issuer.bindings.ISSUER_GRANTS, { type: "durable_object_namespace", class_name: "IssuerGrant" });
    assert.deepEqual(issuer.bindings.ISSUER_GUARD, { type: "durable_object_namespace", class_name: "IssuerGuard" });
    assert.deepEqual(Object.keys(gateway.bindings).sort(), ["ISSUER", "RESOURCE_INGRESS_LIMIT"]);
    const [grants, guard] = await Promise.all([
      runtime.getDurableObjectNamespace("ISSUER_GRANTS", issuer.name),
      runtime.getDurableObjectNamespace("ISSUER_GUARD", issuer.name),
    ]);
    assert.notEqual(grants.idFromName("same-name").toString(), guard.idFromName("same-name").toString());
  });

  it("advertises the same issuer on both Workers and accepts only the exact ChatGPT callback", async () => {
    const metadata = await runtime.dispatchFetch(ISSUER + "/.well-known/oauth-authorization-server");
    const auth = await metadata.json() as Record<string, unknown>;
    assert.equal(auth.issuer, ISSUER);
    assert.equal(auth.authorization_response_iss_parameter_supported, true);
    assert.deepEqual(auth.code_challenge_methods_supported, ["S256"]);
    assert.ok(Array.isArray(auth.token_endpoint_auth_methods_supported) &&
      auth.token_endpoint_auth_methods_supported.includes(chatgpt.token_endpoint_auth_method));
    const resource = await runtime.dispatchFetch(new URL("/.well-known/oauth-protected-resource/mcp", AUDIENCE));
    assert.deepEqual(await resource.json(), { resource: AUDIENCE, authorization_servers: [ISSUER],
      scopes_supported: [chatgpt.scope], bearer_methods_supported: ["header"] });

    assert.equal(CALLBACK, "https://chatgpt.com/connector_platform_oauth_redirect");
    assert.equal((await runtime.dispatchFetch(authorizeUrl())).status, 200);
    for (const uri of [CALLBACK + "/", CALLBACK + "?extra=1", "https://other.invalid/oauth/callback"]) {
      const response = await runtime.dispatchFetch(authorizeUrl(uri), { redirect: "manual" });
      assert.equal(response.status, 400);
      assert.equal(response.headers.get("Location"), null);
      assert.equal(response.headers.get("Set-Cookie"), null);
    }
  });

  it("returns issuer identity and state when GitHub sign-in is cancelled", async () => {
    const { state, session } = await begin();
    const response = await runtime.dispatchFetch(ISSUER + "/oauth/callback?" + new URLSearchParams({
      state, error: "access_denied",
    }), { redirect: "manual", headers: { Cookie: session } });
    assert.equal(response.status, 302);
    const params = chatgptRedirect(response.headers.get("Location"));
    assert.equal(params.get("error"), "access_denied");
    assert.equal(params.has("code"), false);
  });

  it("binds the code to the callback and revokes gateway access after a synthetic review", async () => {
    const { state, session } = await begin();
    const login = await runtime.dispatchFetch(ISSUER + "/oauth/callback?" + new URLSearchParams({
      state, code: "synthetic-github-code",
    }), { redirect: "manual", headers: { Cookie: session } });
    assert.equal(login.status, 200, await login.clone().text());
    const consent = await login.text();
    assert.match(consent, /record review decisions and notes/);
    const csrf = consent.match(/name="csrf" value="([a-f0-9]{64})"/)?.[1];
    assert.ok(csrf);
    const approval = await runtime.dispatchFetch(ISSUER + "/consent", {
      method: "POST", redirect: "manual", headers: { ...formHeaders, Origin: ISSUER, Cookie: cookie(login) },
      body: new URLSearchParams({ csrf, decision: "approve" }),
    });
    assert.equal(approval.status, 302);
    const params = chatgptRedirect(approval.headers.get("Location"));
    const code = params.get("code");
    assert.ok(code);
    assert.equal(params.has("error"), false);

    const exchange = { grant_type: "authorization_code", code, code_verifier: VERIFIER, resource: AUDIENCE };
    const mismatched = await clientPost("/token", { ...exchange, redirect_uri: CALLBACK + "/" });
    assert.equal(mismatched.status, 400);
    const token = await clientPost("/token", { ...exchange, redirect_uri: CALLBACK });
    assert.equal(token.status, 200, await token.clone().text());
    const { access_token, scope } = await token.json() as { access_token: string; scope: string };
    assert.equal(scope, chatgpt.scope);

    assert.equal((await call(access_token, "newsroom_review", review)).status, 400);
    assert.deepEqual(upstreamCalls, []);
    const write = await call(access_token, "newsroom_review", { ...review, confirm: "CONFIRM_EDITORIAL_WRITE" });
    assert.equal(write.status, 200, await write.clone().text());
    const read = await call(access_token, "newsroom_read", { key: KEY });
    assert.deepEqual(await read.json(), { jsonrpc: "2.0", id: 1, result: { receipt: review } });

    assert.equal((await clientPost("/revoke", { token: access_token })).status, 200);
    assert.equal((await call(access_token, "newsroom_read", { key: KEY })).status, 401);
    assert.equal((await clientPost("/token", { ...exchange, redirect_uri: CALLBACK })).status, 400);
    assert.deepEqual(upstreamCalls, ["newsroom_review", "newsroom_read"]);
  });
});
