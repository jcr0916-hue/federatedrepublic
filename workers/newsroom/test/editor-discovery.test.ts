import assert from "node:assert/strict";
import { it } from "node:test";
import { gatewayDiscovery as gateway, issuerDiscovery as issuer } from "../src/editor-discovery.ts";

const ISSUER = "https://newsroom-editor-isolated-issuer-20261111.jcr0916.workers.dev";
const GATEWAY = "https://newsroom-editor-isolated-gateway-20261111.jcr0916.workers.dev";
const ISSUER_METADATA = ISSUER + "/.well-known/oauth-authorization-server";
const RESOURCE_METADATA = GATEWAY + "/.well-known/oauth-protected-resource";
const liveWindow = () => new Proxy({ EDITOR_DISCOVERY_EXPIRES_AT: String(Date.now() + 60_000) }, {
  get(env, binding) {
    assert.equal(binding, "EDITOR_DISCOVERY_EXPIRES_AT");
    return env.EDITOR_DISCOVERY_EXPIRES_AT;
  },
});

it("publishes matching issuer and protected resource metadata within the discovery window", async () => {
  const env = liveWindow();
  const authorization = issuer.fetch(new Request(ISSUER_METADATA), env);
  assert.equal(authorization.status, 200);
  assert.equal(authorization.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await authorization.json(), {
    issuer: ISSUER,
    authorization_endpoint: ISSUER + "/authorize",
    token_endpoint: ISSUER + "/token",
    introspection_endpoint: ISSUER + "/introspect",
    revocation_endpoint: ISSUER + "/revoke",
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    scopes_supported: ["newsroom:editor"],
    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
    introspection_endpoint_auth_methods_supported: ["client_secret_basic"],
    revocation_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
    code_challenge_methods_supported: ["S256"],
    authorization_response_iss_parameter_supported: true,
  });
  for (const url of [RESOURCE_METADATA, RESOURCE_METADATA + "/mcp"]) {
    const response = gateway.fetch(new Request(url), env);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), {
      resource: GATEWAY + "/mcp",
      authorization_servers: [ISSUER],
      scopes_supported: ["newsroom:editor"],
      bearer_methods_supported: ["header"],
    });
  }
});

it("denies issuer operations without consuming request bodies or setting browser sessions", () => {
  const env = liveWindow();
  for (const [method, path] of [
    ["GET", "/authorize"], ["POST", "/authorize"], ["GET", "/oauth/callback"],
    ["POST", "/consent"], ["POST", "/token"], ["POST", "/introspect"], ["POST", "/revoke"],
    ["POST", "/register"],
  ]) {
    const request = new Request(ISSUER + path, {
      method, headers: { Authorization: "Basic dGVzdDp0ZXN0", Cookie: "__Host-newsroom-issuer=test" },
      body: method === "POST" ? "example=synthetic" : undefined,
    });
    const response = issuer.fetch(request, env);
    assert.equal(response.status, 404, method + " " + path);
    assert.equal(response.headers.get("Location"), null);
    assert.equal(response.headers.get("Set-Cookie"), null);
    assert.equal(request.bodyUsed, false);
  }
});

it("returns only the discovery challenge for all MCP requests, including tool calls", async () => {
  const env = liveWindow();
  assert.equal(gateway.fetch(new Request(GATEWAY + "/mcp"), env).status, 401);
  for (const method of ["server/discover", "initialize", "tools/list", "tools/call"]) {
    const request = new Request(GATEWAY + "/mcp", {
      method: "POST",
      headers: { Authorization: "Bearer synthetic-test", "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: { name: "newsroom_review" } }),
    });
    const response = gateway.fetch(request, env);
    assert.equal(response.status, 401, method);
    assert.equal(response.headers.get("WWW-Authenticate"),
      `Bearer error="invalid_token", resource_metadata="${RESOURCE_METADATA}/mcp", scope="newsroom:editor"`);
    assert.deepEqual(await response.json(), { error: "invalid_token" });
    assert.equal(request.bodyUsed, false);
  }
});

it("closes discovery for other origins, paths, methods, or invalid windows", () => {
  for (const [worker, url] of [[issuer, ISSUER_METADATA], [gateway, RESOURCE_METADATA]] as const) {
    for (const candidate of [url + "/", url + "?example=1", "https://elsewhere.example" + new URL(url).pathname]) {
      assert.equal(worker.fetch(new Request(candidate), liveWindow()).status, 404);
    }
    assert.equal(worker.fetch(new Request(url, { method: "POST" }), liveWindow()).status, 404);
    for (const expiry of [undefined, "", "not-a-timestamp", String(Date.now() - 1), String(Date.now() + 3600_000)]) {
      assert.equal(worker.fetch(new Request(url), { EDITOR_DISCOVERY_EXPIRES_AT: expiry }).status, 404);
    }
  }
  assert.equal(gateway.fetch(new Request(GATEWAY + "/mcp"), {}).headers.get("WWW-Authenticate"), null);
});
