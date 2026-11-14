import assert from "node:assert/strict";
import { EventEmitter, once } from "node:events";
import { after, before, describe, it } from "node:test";
import { build } from "esbuild";
import { Miniflare, convertV4MiniflareOptions, type V4WorkerOptions } from "miniflare";
import configuration from "../release/editor-isolated-configuration.json" with { type: "json" };
import { basic, challenge, hash } from "./candidate-harness.ts";
import { ADMISSION_KEY, CHALLENGE_BINDINGS, mockSiteverify, solveChallenge } from "./challenge-fixture.ts";
import { accessContext, mintAdmittedAccess, verifyAccessAdmission } from "../src/access-admission.ts";
import { isolatedEditor, stageOneDeadline } from "../src/editor-stage-one.ts";

const { chatgpt, issuer, gateway } = configuration;
const CALLBACK = issuer.bindings.ISSUER_REDIRECT_URI.text;
const CLIENT_SECRET = hash("synthetic-only-editor-oauth-client-secret");
const VALIDATOR = "synthetic-editor-validator";
const VALIDATOR_SECRET = "synthetic-only-editor-validator-secret";
const GITHUB_ID = "synthetic-github-app";
const GITHUB_SECRET = "synthetic-only-github-app-secret";
const UPSTREAM_KEY = "synthetic-only-editor-upstream-bearer";
const KEY = "submissions/federal/2026-11-11/11111111-1111-4111-8111-111111111111.json";
const VERIFIER = "synthetic-editor-pkce-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const STATE = "synthetic editor state +/%&=";
const formHeaders = { "Content-Type": "application/x-www-form-urlencoded" };

const cookie = (response: { headers: { get(name: string): string | null } }) =>
  response.headers.get("Set-Cookie")!.split(";")[0];

async function bundle(entry: string, stageOne: boolean) {
  const result = await build({ entryPoints: [entry], bundle: true, format: "esm", platform: "neutral",
    target: "es2023", mainFields: ["module", "main"], external: ["cloudflare:workers"], write: false,
    define: { EDITOR_STAGE_ONE_BUILD: String(stageOne) } });
  return result.outputFiles[0].text;
}

function rateLimit({ namespace_id, simple }: typeof issuer.bindings.ISSUER_INGRESS_LIMIT):
  NonNullable<V4WorkerOptions["ratelimits"]>[string] {
  const { limit, period } = simple;
  assert.ok(period === 10 || period === 60);
  return { namespace_id, simple: { limit, period } };
}

for (const stageOne of [false, true]) describe(stageOne ? "read-only Stage 1 OAuth" : "isolated ChatGPT Editor OAuth candidate", () => {
  const ISSUER = stageOne ? isolatedEditor.issuer : `https://${issuer.name}.invalid`;
  const AUDIENCE = stageOne ? isolatedEditor.audience : `https://${gateway.name}.invalid/mcp`;
  const upstream = stageOne ? isolatedEditor.upstream : "https://federated-republic-newsroom.jcr0916.workers.dev/mcp";
  let runtime: Miniflare;
  let deadline: number;
  let githubChallenge: string;
  const usedChallenges = new Set<string>();
  const exchanges = new EventEmitter();
  const clientAuthEvents: unknown[] = [];
  const review = { key: KEY, status: "HOLD", note: "Synthetic review only" };
  const upstreamCalls: string[] = [];
  let receipt: typeof review | undefined;

  before(async () => {
    const [issuerScript, gatewayScript] = await Promise.all([
      bundle("src/issuer-editor-candidate.ts", stageOne), bundle("src/editor-gateway-candidate.ts", stageOne),
    ]);
    deadline = Math.floor(Date.now() / 1000) + 90;
    const window: Record<string, string> = stageOne ? { EDITOR_STAGE_ONE_EXPIRES_AT: String(deadline * 1000) } : {};
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
          ...CHALLENGE_BINDINGS, ...window, ISSUER_ADMISSION_KEY: ADMISSION_KEY, ISSUER_ORIGIN: ISSUER,
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
          ...window, RESOURCE_ADMISSION_KEY: ADMISSION_KEY, RESOURCE_AUDIENCE: AUDIENCE, RESOURCE_ISSUER: ISSUER,
          RESOURCE_CLIENT_ID: chatgpt.client_id, RESOURCE_VALIDATOR_ID: VALIDATOR,
          RESOURCE_VALIDATOR_SECRET: VALIDATOR_SECRET, NEWSROOM_UPSTREAM_URL: upstream,
          NEWSROOM_EDITOR_KEY: UPSTREAM_KEY,
        },
        serviceBindings: {
          ISSUER: gateway.bindings.ISSUER.service,
          NEWSROOM_UPSTREAM: async request => {
            // Miniflare delivers this URL only to the synthetic service binding.
            assert.equal(request.url, upstream);
            assert.equal(request.headers.get("Authorization"), `Bearer ${UPSTREAM_KEY}`);
            const rpc = await request.json() as { id: number; params: { name: string; arguments: unknown } };
            const { name, arguments: args } = rpc.params;
            upstreamCalls.push(name);
            if (stageOne) {
              const data = name === "newsroom_list" ? { keys: [KEY] } : { key: KEY };
              assert.deepEqual([name, args], name === "newsroom_list"
                ? ["newsroom_list", { desk: "federal", limit: 1 }] : ["newsroom_read", { key: KEY }]);
              return Response.json({ jsonrpc: "2.0", id: rpc.id,
                result: { content: [{ type: "text", text: JSON.stringify(data) }], isError: false } });
            }
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
    ], handleStructuredLogs({ message }) {
      if (!message.startsWith('{"schema":"newsroom.editor.stage-one.v1"')) return;
      const event = JSON.parse(message) as { step: string };
      if (event.step === "token_client_auth") clientAuthEvents.push(event);
      if (event.step === "token") exchanges.emit("token", [...clientAuthEvents.splice(0), event]);
    } }));
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
  const rpc = (token: string, method: string, params: Record<string, unknown> = {}, modern = false,
               headers: Record<string, string> = {}) => runtime.dispatchFetch(AUDIENCE, {
    method: "POST", headers: {
      "Content-Type": "application/json", Authorization: `Bearer ${token}`,
      ...(modern ? { "MCP-Protocol-Version": "2026-07-28", "Mcp-Method": method,
        ...(typeof params.name === "string" ? { "Mcp-Name": params.name } : {}) } : {}), ...headers,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: modern ? { ...params, _meta: {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientCapabilities": {},
    } } : params }),
  });
  const call = (token: string, name: string, args: Record<string, unknown>, modern = false) =>
    rpc(token, "tools/call", { name, arguments: args }, modern);

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
    assert.deepEqual(auth.grant_types_supported, stageOne ? ["authorization_code"] : ["authorization_code", "refresh_token"]);
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

  const approve = async () => {
    const { state, session } = await begin();
    const login = await runtime.dispatchFetch(ISSUER + "/oauth/callback?" + new URLSearchParams({
      state, code: "synthetic-github-code",
    }), { redirect: "manual", headers: { Cookie: session } });
    assert.equal(login.status, 200, await login.clone().text());
    const consent = await login.text();
    assert.match(consent, stageOne ? /Approve read-only access/ : /record review decisions and notes/);
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

    return { grant_type: "authorization_code", code, code_verifier: VERIFIER, resource: AUDIENCE, redirect_uri: CALLBACK };
  };

  if (stageOne) it("replays POST client authentication with fixed, private diagnostics", async () => {
    const tokenFields = await approve();
    const schema = "newsroom.editor.stage-one.v1";
    const formWith = (fields: Record<string, string> = {}) => new URLSearchParams({ ...tokenFields, ...fields });
    const post = async (body: URLSearchParams | string, headers: Record<string, string> = formHeaders) => {
      const [response, [events]] = await Promise.all([
        runtime.dispatchFetch(ISSUER + "/token", { method: "POST", headers, body }),
        once(exchanges, "token", { signal: AbortSignal.timeout(3000) }),
      ]);
      return { response, events };
    };
    const validBody = { client_id: chatgpt.client_id, client_secret: CLIENT_SECRET };
    const onlyId = { client_id: chatgpt.client_id };
    const form = formWith(onlyId).toString();
    const basicHeaders = { ...formHeaders, Authorization: basic(chatgpt.client_id, CLIENT_SECRET) };
    const firstByte = CLIENT_SECRET.charCodeAt(0).toString(16);
    const scenarios = [
      { name: "both missing", body: formWith(), method: "missing", reason: "missing_credentials", status: 401 },
      { name: "ID only", body: formWith(onlyId), method: "post", reason: "missing_secret", status: 401 },
      { name: "empty secret", body: form + "&client_secret=", method: "post", reason: "missing_secret", status: 401 },
      { name: "secret only", body: formWith({ client_secret: CLIENT_SECRET }), method: "post",
        reason: "missing_client_id", status: 401 },
      { name: "different client", body: formWith({ ...validBody, client_id: "synthetic-other-client" }), method: "post",
        reason: "client_id_mismatch", status: 401 },
      { name: "padded client ID", body: formWith({ ...validBody, client_id: chatgpt.client_id + " " }), method: "post",
        reason: "client_id_mismatch", status: 401 },
      { name: "short secret", body: formWith({ ...onlyId, client_secret: "synthetic-short" }), method: "post",
        reason: "invalid_secret_format", status: 401 },
      { name: "form plus decoded as space", body: form + "&client_secret=+" + CLIENT_SECRET, method: "post",
        reason: "invalid_secret_format", status: 401 },
      { name: "line break", body: form + "&client_secret=" + CLIENT_SECRET + "%0A", method: "post",
        reason: "invalid_secret_format", status: 401 },
      { name: "wrong secret", body: formWith({ ...onlyId, client_secret: hash("different synthetic secret") }), method: "post",
        reason: "secret_mismatch", status: 401 },
      { name: "double encoded secret", body: form + "&client_secret=%25" + firstByte + CLIENT_SECRET.slice(1), method: "post",
        reason: "secret_mismatch", status: 401 },
      { name: "duplicate secret", body: formWith(validBody) + "&client%5Fsecret=" + CLIENT_SECRET, method: "unclassified",
        reason: "duplicate_parameters", status: 400 },
      { name: "mixed methods", body: formWith(validBody), headers: basicHeaders, method: "multiple",
        reason: "multiple_methods", status: 400 },
      { name: "unsupported authorization header", body: formWith(), headers: { ...formHeaders, Authorization: "Bearer synthetic" },
        method: "unsupported", reason: "invalid_authorization_header", status: 401 },
      { name: "wrong Basic secret", body: formWith(),
        headers: { ...formHeaders, Authorization: basic(chatgpt.client_id, hash("wrong synthetic Basic secret")) },
        method: "basic", reason: "basic_rejected", status: 401 },
    ];
    for (const { name, body, headers, method, reason, status } of scenarios) {
      const { response, events } = await post(body, headers);
      assert.equal(response.status, status, name);
      assert.deepEqual(await response.json(), { error: status === 401 ? "invalid_client" : "invalid_request" }, name);
      assert.deepEqual(events, [
        { schema, step: "token_client_auth", status, method, reason },
        { schema, step: "token", status },
      ], name);
    }

    for (const [field, value, error] of [
      ["resource", AUDIENCE + "/", "invalid_target"],
      ["scope", "newsroom:read", "invalid_scope"],
      ["redirect_uri", CALLBACK + "/", "invalid_grant"],
      ["code_verifier", "a".repeat(64), "invalid_grant"],
    ]) {
      const { response, events } = await post(formWith({ ...validBody, [field]: value }));
      assert.equal(response.status, 400, field);
      assert.deepEqual(await response.json(), { error }, field);
      assert.deepEqual(events, [
        { schema, step: "token_client_auth", status: 200, method: "post", reason: "accepted" },
        { schema, step: "token", status: 400 },
      ], field);
    }

    const { response, events } = await post(form + "&client_secret=%" + firstByte + CLIENT_SECRET.slice(1));
    assert.equal(response.status, 200);
    const token = await response.json() as { access_token: string; scope: string; refresh_token?: string };
    assert.ok(token.access_token);
    assert.equal(token.scope, chatgpt.scope);
    assert.equal(token.refresh_token, undefined);
    assert.deepEqual(events, [
      { schema, step: "token_client_auth", status: 200, method: "post", reason: "accepted" },
      { schema, step: "token", status: 200 },
    ]);
  });

  it("binds the code to the registered redirect and requires the configured confidential client", async () => {
    const tokenFields = await approve();
    const mismatched = await clientPost("/token", { ...tokenFields, redirect_uri: CALLBACK + "/" });
    assert.equal(mismatched.status, 400);
    const wrongResource = await clientPost("/token", { ...tokenFields, resource: "https://other.invalid/mcp" });
    assert.deepEqual(await wrongResource.json(), { error: "invalid_target" });
    const wrongPkce = await clientPost("/token", { ...tokenFields, code_verifier: "a".repeat(64) });
    assert.deepEqual(await wrongPkce.json(), { error: "invalid_grant" });
    for (const headers of [
      formHeaders,
      { ...formHeaders, Authorization: basic(chatgpt.client_id, "0".repeat(64)) },
      { ...formHeaders, Authorization: basic(VALIDATOR, VALIDATOR_SECRET) },
    ]) {
      const rejected = await runtime.dispatchFetch(ISSUER + "/token", {
        method: "POST", headers, body: new URLSearchParams(tokenFields),
      });
      assert.equal(rejected.status, 401);
      assert.deepEqual(await rejected.json(), { error: "invalid_client" });
    }
    const basicHeader = basic(chatgpt.client_id, CLIENT_SECRET);
    const postToken = (authorization: string | null, fields: Record<string, string> = {}) =>
      runtime.dispatchFetch(ISSUER + "/token", {
        method: "POST", headers: authorization ? { ...formHeaders, Authorization: authorization } : formHeaders,
        body: new URLSearchParams({ ...tokenFields, ...fields }),
      });
    const mixed = await postToken(basicHeader, { client_id: chatgpt.client_id, client_secret: CLIENT_SECRET });
    assert.equal(mixed.status, 400);
    const differentClient = await postToken(basicHeader, { client_id: "wrong-client" });
    assert.equal(differentClient.status, 400);
    const bodyIdOnly = await postToken(null, { client_id: chatgpt.client_id });
    assert.equal(bodyIdOnly.status, 401);
    const token = await postToken(basicHeader.replace(/^Basic /, "bAsIc "), stageOne
      ? { client_id: chatgpt.client_id, scope: chatgpt.scope } : {});
    assert.equal(token.status, 200, await token.clone().text());
    const { access_token, scope, refresh_token, expires_in } = await token.json() as {
      access_token: string; scope: string; refresh_token?: string; expires_in: number;
    };
    assert.equal(scope, chatgpt.scope);
    const accessBinding = accessContext(ISSUER, chatgpt.client_id, AUDIENCE);
    if (stageOne) {
      assert.equal(refresh_token, undefined);
      assert.equal(Number(access_token.split(".")[3]), deadline);
      assert.ok(expires_in > 0 && expires_in <= 90);
      assert.equal(await verifyAccessAdmission(access_token, ADMISSION_KEY, accessBinding), false);
      const normalToken = await mintAdmittedAccess("a".repeat(64), ADMISSION_KEY, accessBinding);
      assert.equal((await rpc(normalToken, "tools/list")).status, 401);
      assert.equal((await runtime.dispatchFetch(AUDIENCE)).status, 401);
      const sse = await runtime.dispatchFetch(AUDIENCE, { headers: { Authorization: "Bearer " + access_token } });
      assert.equal(sse.status, 405);
      assert.equal(sse.headers.get("Allow"), "POST");
      const refresh = await clientPost("/token", { grant_type: "refresh_token", refresh_token: "synthetic-unused" });
      assert.deepEqual(await refresh.json(), { error: "unsupported_grant_type" });

      const legacy = await rpc(access_token, "initialize", { protocolVersion: "2025-11-25" });
      assert.equal((await legacy.json() as { result: { protocolVersion: string } }).result.protocolVersion, "2025-11-25");
      const modern = await rpc(access_token, "server/discover", {}, true);
      assert.deepEqual((await modern.json() as { result: { supportedVersions: string[] } }).result.supportedVersions, ["2026-07-28"]);
      for (const modern of [false, true]) {
        const tools = await rpc(access_token, "tools/list", {}, modern);
        const { result } = await tools.json() as { result: { resultType?: string;
          tools: { name: string; annotations: { readOnlyHint: boolean } }[] } };
        assert.equal(result.resultType, modern ? "complete" : undefined);
        assert.deepEqual(result.tools.map(t => [t.name, t.annotations.readOnlyHint]), [["newsroom_list", true], ["newsroom_read", true]]);
      }
      const forbidden = await call(access_token, "newsroom_review", { ...review, confirm: "CONFIRM_EDITORIAL_WRITE" }, true);
      assert.equal(forbidden.status, 403);
      const mismatch = await rpc(access_token, "tools/call", { name: "newsroom_read", arguments: { key: KEY } },
        true, { "Mcp-Name": "newsroom_list" });
      assert.equal(mismatch.status, 400);
      assert.deepEqual(upstreamCalls, []);
      for (const [tool, args, data] of [
        ["newsroom_list", { desk: "federal", limit: 1 }, { keys: [KEY] }],
        ["newsroom_read", { key: KEY }, { key: KEY }],
      ] as const) {
        const response = await call(access_token, tool, args, true);
        assert.deepEqual(await response.json(), { jsonrpc: "2.0", id: 1, result: {
          resultType: "complete", content: [{ type: "text", text: JSON.stringify(data) }], isError: false,
          _meta: { "io.modelcontextprotocol/serverInfo": { name: "torenthia-isolated-editor-read-only", version: "0.1.0" } },
        } });
      }
      assert.deepEqual(upstreamCalls, ["newsroom_list", "newsroom_read"]);
    } else {
      assert.ok(refresh_token);
      assert.equal((await call(access_token, "newsroom_review", review)).status, 400);
      assert.deepEqual(upstreamCalls, []);
      const write = await call(access_token, "newsroom_review", { ...review, confirm: "CONFIRM_EDITORIAL_WRITE" });
      assert.equal(write.status, 200, await write.clone().text());
      const read = await call(access_token, "newsroom_read", { key: KEY });
      assert.deepEqual(await read.json(), { jsonrpc: "2.0", id: 1, result: { receipt: review } });
      assert.deepEqual(upstreamCalls, ["newsroom_review", "newsroom_read"]);
    }

    assert.equal((await clientPost("/revoke", { token: access_token })).status, 200);
    assert.equal((await call(access_token, "newsroom_read", { key: KEY })).status, 401);
    assert.equal((await clientPost("/token", tokenFields)).status, 400);
  });
});

it("closes both Stage 1 bundles without a valid window and rejects configuration for other Workers", async () => {
  const now = Date.now();
  for (const value of [undefined, "invalid", String(now), String(now + 300_001)]) {
    assert.equal(stageOneDeadline({ EDITOR_STAGE_ONE_EXPIRES_AT: value }, now), undefined);
  }
  assert.equal(stageOneDeadline({ EDITOR_STAGE_ONE_EXPIRES_AT: String(now + 300_000) }, now), Math.floor(now / 1000) + 300);
  const [issuerScript, gatewayScript] = await Promise.all([
    bundle("src/issuer-editor-candidate.ts", true), bundle("src/editor-gateway-candidate.ts", true),
  ]);
  const fixture = new Miniflare(convertV4MiniflareOptions({ workers: [
    { name: "issuer-closed", modules: true, script: issuerScript, compatibilityDate: issuer.compatibility_date,
      routes: [new URL(isolatedEditor.issuer).hostname + "/*"] },
    { name: "gateway-closed", modules: true, script: gatewayScript, compatibilityDate: gateway.compatibility_date,
      routes: [new URL(isolatedEditor.audience).hostname + "/*"],
      bindings: { EDITOR_STAGE_ONE_EXPIRES_AT: String(now - 1000) } },
    { name: "issuer-wrong-origin", modules: true, script: issuerScript, compatibilityDate: issuer.compatibility_date,
      routes: ["wrong.invalid/*"], bindings: {
        EDITOR_STAGE_ONE_EXPIRES_AT: String(now + 60_000), ISSUER_ORIGIN: "https://wrong.invalid",
        ISSUER_CLIENT_ID: isolatedEditor.clientId, ISSUER_AUDIENCE: isolatedEditor.audience,
      } },
  ] }));
  try {
    assert.equal((await fixture.dispatchFetch(isolatedEditor.issuer + "/token", { method: "POST" })).status, 404);
    assert.equal((await fixture.dispatchFetch(isolatedEditor.audience)).status, 404);
    assert.equal((await fixture.dispatchFetch("https://wrong.invalid/authorize")).status, 404);
  } finally { await fixture.dispose(); }
});
