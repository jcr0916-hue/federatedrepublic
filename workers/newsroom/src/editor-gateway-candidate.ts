/** UNDEPLOYED ChatGPT Central Editor gateway candidate.
 * Separate OAuth issuer authenticates the single approved Editor identity.
 * This resource holds only a private live-upstream Editor key, and forwards
 * EXACTLY three allowed MCP tools. No GitHub, R2 or agent desk bindings.
 */
import { accessContext, verifyAccessAdmission } from "./access-admission.ts";
import { boundedText, PolicyError } from "./policy.ts";
import { requireIngressBudget, type IngressRateLimiter } from "./ingress-rate-limit.ts";

export interface EditorGatewayEnv {
  RESOURCE_ADMISSION_KEY: string;
  RESOURCE_AUDIENCE: string;
  RESOURCE_ISSUER: string;
  RESOURCE_CLIENT_ID: string;
  RESOURCE_VALIDATOR_ID: string;
  RESOURCE_VALIDATOR_SECRET: string;
  ISSUER: Fetcher;
  RESOURCE_INGRESS_LIMIT: IngressRateLimiter;
  NEWSROOM_EDITOR_KEY: string;
  NEWSROOM_UPSTREAM_URL: string;
}
const SCOPE = "newsroom:editor";
const TOOLS = ["newsroom_list", "newsroom_read", "newsroom_review"] as const;
type ToolName = typeof TOOLS[number];
const STATUSES = new Set(["UNDER_REVIEW", "REVISION_REQUESTED", "ASSIGN", "ACCEPTED", "WATCH", "HOLD", "ARCHIVED", "REJECTED"]);
const LIVE_MCP = "https://federated-republic-newsroom.jcr0916.workers.dev/mcp";
const cleanHeaders = () => new Headers({
  "Content-Type": "application/json", "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
});
const json = (body: unknown, status = 200, headers = cleanHeaders()) =>
  new Response(JSON.stringify(body), { status, headers });
function config(env: EditorGatewayEnv) {
  try {
    const u = new URL(env.RESOURCE_AUDIENCE), issuer = new URL(env.RESOURCE_ISSUER);
    if (u.protocol !== "https:" || u.pathname !== "/mcp" || u.search || u.hash || u.username || u.password ||
        issuer.protocol !== "https:" || issuer.origin !== env.RESOURCE_ISSUER || issuer.pathname !== "/" ||
        !/^[A-Za-z0-9_-]{1,100}$/.test(env.RESOURCE_CLIENT_ID) ||
        !/^[A-Za-z0-9_-]{1,100}$/.test(env.RESOURCE_VALIDATOR_ID) ||
        env.RESOURCE_CLIENT_ID === env.RESOURCE_VALIDATOR_ID ||
        !/^[\x21-\x7e]{32,256}$/.test(env.RESOURCE_VALIDATOR_SECRET) ||
        !/^[a-f0-9]{64}$/.test(env.RESOURCE_ADMISSION_KEY) ||
        env.NEWSROOM_UPSTREAM_URL !== LIVE_MCP ||
        typeof env.NEWSROOM_EDITOR_KEY !== "string" || env.NEWSROOM_EDITOR_KEY.length < 32 ||
        env.NEWSROOM_EDITOR_KEY.length > 1024 || !env.ISSUER || !env.RESOURCE_INGRESS_LIMIT) throw Error();
    return { audience: u.href, origin: u.origin, issuer: issuer.origin,
      metadata: u.origin + "/.well-known/oauth-protected-resource/mcp" };
  } catch { throw new PolicyError(503, "gateway_not_configured"); }
}
function unauthorized(metadata: string) {
  const h = cleanHeaders();
  h.set("WWW-Authenticate", 'Bearer error="invalid_token", resource_metadata="' + metadata + '", scope="' + SCOPE + '"');
  return json({ error: "invalid_token" }, 401, h);
}
const definitions = [
  { name: "newsroom_list", description: "EDITOR: List unpublished submissions from the live Torenthia newsroom.",
    inputSchema: { type: "object", properties: { desk: { type: "string" },
      limit: { type: "integer" }, cursor: { type: "string" } } } },
  { name: "newsroom_read", description: "EDITOR: Read one existing unpublished submission.",
    inputSchema: { type: "object", properties: { key: { type: "string" } }, required: ["key"] } },
  { name: "newsroom_review", description: "EDITOR WRITE: Record a status and permanent editorial note. Requires explicit user confirmation before use; never publishes canon.",
    inputSchema: { type: "object", properties: { key: { type: "string" },
      status: { type: "string", enum: [...STATUSES] },
      note: { type: "string" },
      confirm: { type: "string", enum: ["CONFIRM_EDITORIAL_WRITE"] } },
      required: ["key", "status", "note", "confirm"] } },
] as const;

function validatedCall(rpc: Record<string, unknown>): { name: ToolName; arguments: Record<string, unknown>; cost: number } | null {
  if (rpc.method !== "tools/call") return null;
  const params = rpc.params;
  if (!params || typeof params !== "object" || Array.isArray(params)) throw new PolicyError(400, "invalid_arguments");
  const { name, arguments: raw } = params as { name?: unknown; arguments?: unknown };
  if (typeof name !== "string" || !TOOLS.includes(name as ToolName))
    throw new PolicyError(403, "tool_not_allowed");
  const args: Record<string, unknown> = raw === undefined ? {} :
    raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> :
    (() => { throw new PolicyError(400, "invalid_arguments"); })();
  const allowed = name === "newsroom_list" ? ["desk", "limit", "cursor"] :
    name === "newsroom_read" ? ["key"] : ["key", "status", "note", "confirm"];
  if (Object.keys(args).some(k => !allowed.includes(k))) throw new PolicyError(400, "invalid_arguments");
  if (name === "newsroom_list") {
    if (args.desk !== undefined && (typeof args.desk !== "string" ||
        !/^(all|federal|korda|varek|corindal)$/.test(args.desk))) throw new PolicyError(400, "invalid_arguments");
    if (args.limit !== undefined && (!Number.isSafeInteger(args.limit) || Number(args.limit) < 1 ||
        Number(args.limit) > 30)) throw new PolicyError(400, "invalid_arguments");
    if (args.cursor !== undefined && (typeof args.cursor !== "string" || args.cursor.length > 2048))
      throw new PolicyError(400, "invalid_arguments");
    return { name: name as ToolName, arguments: args, cost: 1 + 2 * Number(args.limit ?? 10) };
  }
  if (typeof args.key !== "string" || args.key.length > 300 ||
      !/^submissions\/(federal|korda|varek|corindal)\/\d{4}-\d\d-\d\d\/[a-f\d-]{36}\.json$/.test(args.key))
    throw new PolicyError(400, "invalid_arguments");
  if (name === "newsroom_read") return { name: name as ToolName, arguments: args, cost: 2 };
  if (typeof args.status !== "string" || !STATUSES.has(args.status) ||
      typeof args.note !== "string" || args.note.trim().length === 0 || args.note.length > 2000 ||
      args.confirm !== "CONFIRM_EDITORIAL_WRITE") throw new PolicyError(400, "confirmation_required");
  // confirm is a request-level fail-closed guard, not independent evidence of human
  // authorization: ChatGPT plugin permissions MUST also ask before each write.
  return { name: name as ToolName, arguments: { key: args.key, status: args.status, note: args.note }, cost: 4 };
}
async function verifyIssuer(env: EditorGatewayEnv, c: ReturnType<typeof config>, token: string, cost: number) {
  let body: Record<string, unknown>;
  try {
    const response = await env.ISSUER.fetch(new Request(c.issuer + "/introspect", {
      method: "POST", redirect: "manual", signal: AbortSignal.timeout(5000),
      headers: { "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(env.RESOURCE_VALIDATOR_ID + ":" + env.RESOURCE_VALIDATOR_SECRET) },
      body: new URLSearchParams({ token, token_type_hint: "access_token", request_cost: String(cost) }),
    }));
    if (response.status === 429) throw new PolicyError(429, "rate_limited");
    if (response.status !== 200) throw Error();
    const result: unknown = JSON.parse(await boundedText(response.body, 4096));
    if (!result || typeof result !== "object" || Array.isArray(result)) throw Error();
    body = result as Record<string, unknown>;
  } catch (e) {
    if (e instanceof PolicyError) throw e;
    throw new PolicyError(503, "issuer_unavailable");
  }
  return body.active === true && body.iss === c.issuer && body.aud === c.audience &&
    body.client_id === env.RESOURCE_CLIENT_ID && body.scope === SCOPE &&
    Number.isSafeInteger(body.exp) && Number(body.exp) > Date.now()/1000;
}
async function proxy(env: EditorGatewayEnv, rpc: Record<string, unknown>,
                     call: NonNullable<ReturnType<typeof validatedCall>>) {
  // No browser-accessible request carries NEWSROOM_EDITOR_KEY. The fixed upstream
  // destination is validated in config(); redirects are rejected.
  let response: Response;
  try {
    response = await fetch(LIVE_MCP, { method: "POST", redirect: "manual",
      signal: AbortSignal.timeout(8000),
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.NEWSROOM_EDITOR_KEY },
      body: JSON.stringify({ jsonrpc: "2.0", id: rpc.id, method: "tools/call",
        params: { name: call.name, arguments: call.arguments } }),
    });
    if (response.status !== 200 || response.headers.get("Content-Type")?.split(";")[0].trim() !== "application/json")
      throw Error();
    const raw = await boundedText(response.body, 65536);
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw Error();
    const parsed = value as Record<string, unknown>;
    if (parsed.jsonrpc !== "2.0" || parsed.id !== rpc.id || !parsed.result ||
        typeof parsed.result !== "object" || Array.isArray(parsed.result)) throw Error();
    return json(parsed);
  } catch { return json({ error: "upstream_unavailable" }, 503); }
}

const handler = {
  async fetch(request: Request, env: EditorGatewayEnv): Promise<Response> {
    try {
      const c = config(env), url = new URL(request.url);
      if (url.origin !== c.origin) return json({ error: "wrong_origin" }, 421);
      if (url.search) return json({ error: "invalid_request" }, 400);
      if (request.method === "GET" &&
          ["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp"].includes(url.pathname))
        return json({ resource: c.audience, authorization_servers: [c.issuer],
          scopes_supported: [SCOPE], bearer_methods_supported: ["header"] });
      if (url.pathname !== "/mcp") return json({ error: "not_found" }, 404);
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      const origin = request.headers.get("Origin");
      if (origin !== null && origin !== c.origin) return json({ error: "origin_not_allowed" }, 403);
      const bearer = request.headers.get("Authorization");
      if (!bearer || !/^Bearer nr1a\.[a-f0-9]{64}\.[a-f0-9]{64}\.[0-9]{1,12}\.[a-f0-9]{64}$/.test(bearer))
        return unauthorized(c.metadata);
      const token = bearer.slice(7);
      if (!await verifyAccessAdmission(token, env.RESOURCE_ADMISSION_KEY,
            accessContext(c.issuer, env.RESOURCE_CLIENT_ID, c.audience))) return unauthorized(c.metadata);
      const denied = await requireIngressBudget(request, env.RESOURCE_INGRESS_LIMIT, "mcp");
      if (denied) return denied;
      if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json")
        return json({ error: "unsupported_media_type" }, 415);
      let rpc: Record<string, unknown>;
      try {
        const value: unknown = JSON.parse(await boundedText(request.body, 65536));
        if (!value || typeof value !== "object" || Array.isArray(value)) throw Error();
        rpc = value as Record<string, unknown>;
      } catch { return json({ error: "invalid_request" }, 400); }
      if (rpc.jsonrpc !== "2.0" || typeof rpc.method !== "string" ||
          !["server/discover", "initialize", "ping", "notifications/initialized",
            "tools/list", "tools/call"].includes(rpc.method))
        return json({ error: "method_not_allowed" }, 403);
      const call = validatedCall(rpc);
      if (!await verifyIssuer(env, c, token, call?.cost ?? 0)) return unauthorized(c.metadata);
      if (rpc.method === "server/discover") return json({ jsonrpc: "2.0", id: rpc.id,
        result: { resultType: "complete", supportedVersions: ["2026-07-28"],
          capabilities: { tools: {} }, ttlMs: 0, cacheScope: "private",
          _meta: { "io.modelcontextprotocol/serverInfo":
            { name: "torenthia-live-editor-gateway", version: "0.1.0" } } } });
      if (rpc.method === "initialize") return json({ jsonrpc: "2.0", id: rpc.id,
        result: { protocolVersion: "2025-03-26", capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "torenthia-live-editor-gateway", version: "0.1.0" } } });
      if (rpc.method === "ping") return json({ jsonrpc: "2.0", id: rpc.id, result: {} });
      if (rpc.method === "notifications/initialized") return new Response(null, { status: 202 });
      if (rpc.method === "tools/list") return json({ jsonrpc: "2.0", id: rpc.id,
        result: { tools: definitions.map(t => ({
          ...t, securitySchemes: [{ type: "oauth2", scopes: [SCOPE] }],
          _meta: { securitySchemes: [{ type: "oauth2", scopes: [SCOPE] }] },
          annotations: { readOnlyHint: t.name !== "newsroom_review",
            destructiveHint: t.name === "newsroom_review",
            idempotentHint: t.name !== "newsroom_review", openWorldHint: false },
        })) } });
      return await proxy(env, rpc, call!);
    } catch (e) {
      return json({ error: e instanceof PolicyError ? e.publicCode : "gateway_unavailable" },
        e instanceof PolicyError ? e.status : 503);
    }
  },
};
export default handler;
