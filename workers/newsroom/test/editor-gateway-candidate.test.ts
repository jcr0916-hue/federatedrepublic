import { describe, it } from "node:test";
import assert from "node:assert/strict";
import gateway, { type EditorGatewayEnv } from "../src/editor-gateway-candidate.ts";
import { mintAdmittedAccess, accessContext } from "../src/access-admission.ts";

const ISSUER = "https://editor-issuer.example";
const RESOURCE = "https://editor-gateway.example/mcp";
const LIVE = "https://federated-republic-newsroom.jcr0916.workers.dev/mcp";
const ADMISSION = "a".repeat(64);
const VALIDATOR_SECRET = "v".repeat(64);
const EDITOR_KEY = "p".repeat(64);
const KEY = "submissions/federal/2026-11-11/0adf4937-2af4-48b7-b19c-aa5682d9e5b4.json";
type UpstreamCapture = { url: string; authorization: string | null; body: unknown };
const baseEnv = (overrides: Partial<EditorGatewayEnv> = {}, history: { upstream: UpstreamCapture[] } = { upstream: [] }): EditorGatewayEnv => ({
  RESOURCE_ADMISSION_KEY: ADMISSION,
  RESOURCE_AUDIENCE: RESOURCE,
  RESOURCE_ISSUER: ISSUER,
  RESOURCE_CLIENT_ID: "editor-chatgpt",
  RESOURCE_VALIDATOR_ID: "resource-validator",
  RESOURCE_VALIDATOR_SECRET: VALIDATOR_SECRET,
  NEWSROOM_EDITOR_KEY: EDITOR_KEY,
  NEWSROOM_UPSTREAM_URL: LIVE,
  RESOURCE_INGRESS_LIMIT: { async limit() { return { success: true }; } },
  ISSUER: { async fetch() { return Response.json({
    active: true, iss: ISSUER, aud: RESOURCE, client_id: "editor-chatgpt",
    scope: "newsroom:editor", exp: Math.floor(Date.now()/1000) + 400,
  }); } } as unknown as Fetcher,
  NEWSROOM_UPSTREAM: { async fetch(request: Request) {
    history.upstream.push({ url: request.url, authorization: request.headers.get("Authorization"), body: await request.clone().json() });
    const body = await request.json() as { id: number; params: { name: string; arguments: Record<string, unknown> } };
    return Response.json({ jsonrpc: "2.0", id: body.id,
      result: { content: [{ type: "text", text: JSON.stringify({ ok: true, tool: body.params.name }) }],
        isError: false } });
  } } as unknown as Fetcher,
  ...overrides,
});
async function token() { return mintAdmittedAccess("a".repeat(64), ADMISSION,
  accessContext(ISSUER, "editor-chatgpt", RESOURCE)); }
async function rpc(env: EditorGatewayEnv, method: string, params: unknown = undefined, auth?: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (auth) headers.set("Authorization", "Bearer " + auth);
  return gateway.fetch(new Request(RESOURCE, { method: "POST", headers,
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) }), env);
}
describe("Editor-only OAuth live newsroom gateway, entirely synthetic and undeployed", () => {
  it("advertises a distinct Editor scope and denies unauthenticated tools", async () => {
    const env = baseEnv();
    const metadata = await gateway.fetch(new Request("https://editor-gateway.example/.well-known/oauth-protected-resource/mcp"), env);
    assert.equal(metadata.status, 200);
    assert.deepEqual((await metadata.json() as { scopes_supported: string[] }).scopes_supported, ["newsroom:editor"]);
    const missing = await rpc(env, "tools/list");
    assert.equal(missing.status, 401);
    assert.match(missing.headers.get("WWW-Authenticate") ?? "", /resource_metadata/);
    assert.equal((await rpc(env, "tools/list", undefined, "fake")).status, 401);
  });
  it("exposes exactly list/read/review with review marked destructive and not read-only", async () => {
    const result = await rpc(baseEnv(), "tools/list", undefined, await token());
    assert.equal(result.status, 200);
    const body = await result.json() as { result: { tools: { name: string;
      annotations: { readOnlyHint: boolean; destructiveHint: boolean };
      securitySchemes: { scopes: string[] }[] }[] } };
    assert.deepEqual(body.result.tools.map(t => t.name), ["newsroom_list", "newsroom_read", "newsroom_review"]);
    assert.deepEqual(body.result.tools.map(t => t.annotations.readOnlyHint), [true, true, false]);
    assert.equal(body.result.tools[2].annotations.destructiveHint, true);
    assert.deepEqual(body.result.tools[2].securitySchemes[0].scopes, ["newsroom:editor"]);
  });
  it("never forwards forbidden tools or forged scope/role/argument flags", async () => {
    const history = { upstream: [] as UpstreamCapture[] }, env = baseEnv({}, history);
    const auth = await token();
    for (const name of ["newsroom_submit", "publish", "admin", "delete", "unknown"]) {
      const response = await rpc(env, "tools/call", { name, arguments: {} }, auth);
      assert.equal(response.status, 403);
    }
    for (const params of [
      { name: "newsroom_list", arguments: { editor: true } },
      { name: "newsroom_read", arguments: { key: KEY, extra: "forged" } },
      { name: "newsroom_review", arguments: { key: KEY, status: "ACCEPTED", note: "test" } },
      { name: "newsroom_review", arguments: { key: KEY, status: "PUBLISHED", note: "test", confirm: "CONFIRM_EDITORIAL_WRITE" } },
    ]) assert.equal((await rpc(env, "tools/call", params, auth)).status, 400);
    assert.equal((await rpc(env, "resources/list", {}, auth)).status, 403);
    assert.equal(history.upstream.length, 0);
  });
  it("forwards a confirmed review only to the fixed upstream, with Editor key invisible to clients", async () => {
    const history = { upstream: [] as UpstreamCapture[] }, env = baseEnv({}, history);
    const result = await rpc(env, "tools/call", { name: "newsroom_review", arguments: {
      key: KEY, status: "HOLD", note: "Synthetic editorial decision",
      confirm: "CONFIRM_EDITORIAL_WRITE",
    } }, await token());
    assert.equal(result.status, 200);
    assert.equal(history.upstream.length, 1);
    const request = history.upstream[0];
    assert.equal(request.url, LIVE);
    assert.equal(request.authorization, "Bearer " + EDITOR_KEY);
    const body = request.body as { params: { name: string; arguments: Record<string, unknown> } };
    assert.equal(body.params.name, "newsroom_review");
    assert.deepEqual(body.params.arguments, {
      key: KEY, status: "HOLD", note: "Synthetic editorial decision",
    });
    assert.ok(!(await result.text()).includes(EDITOR_KEY), "no upstream Editor secret in result");
  });
  it("rejects wrong OAuth scope, audience, and missing upstream with no forwarded requests", async () => {
    const history = { upstream: [] as UpstreamCapture[] };
    const badIssuer = { async fetch() { return Response.json({
      active: true, iss: ISSUER, aud: RESOURCE, client_id: "editor-chatgpt",
      scope: "newsroom:read", exp: Math.floor(Date.now()/1000) + 400,
    }); } } as unknown as Fetcher;
    const auth = await token();
    assert.equal((await rpc(baseEnv({ ISSUER: badIssuer }, history), "tools/list", undefined, auth)).status, 401);
    assert.equal((await rpc(baseEnv({ NEWSROOM_EDITOR_KEY: "" }, history), "tools/list", undefined, auth)).status, 503);
    assert.equal(history.upstream.length, 0);
  });
  it("fails closed without revealing upstream errors or credentials", async () => {
    const env = baseEnv({ NEWSROOM_UPSTREAM: { async fetch() {
      return new Response("SENSITIVE_KEY_INTERNAL_ERROR", { status: 500 });
    } } as unknown as Fetcher });
    const result = await rpc(env, "tools/call", { name: "newsroom_read", arguments: { key: KEY } }, await token());
    assert.equal(result.status, 503);
    assert.ok(!(await result.text()).includes("SENSITIVE_KEY_INTERNAL_ERROR"));
    assert.ok(!(await result.text()).includes(EDITOR_KEY));
  });
});
