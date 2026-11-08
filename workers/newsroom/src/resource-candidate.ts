/** Independent read-only resource candidate. No cloud binding is provisioned.
 * Each operation is revalidated at the issuer. No cached allow decisions,
 * client secrets, legacy editor credentials, submission or publication path.
 */
import { mcp } from "./legacy.js";
import { boundedText, PolicyError } from "./policy.ts";

interface Env {
  RESOURCE_AUDIENCE: string;
  RESOURCE_ISSUER: string;
  RESOURCE_CLIENT_ID: string;
  RESOURCE_VALIDATOR_ID: string;
  RESOURCE_VALIDATOR_SECRET: string;
  ISSUER: Fetcher;
  NEWSROOM: R2Bucket;
}
const SCOPE = "newsroom:read";
const READ_TOOLS = new Set(["newsroom_list", "newsroom_read"]);
const h = () => new Headers({ "Cache-Control": "no-store", "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" });
function json(body: unknown, status = 200, headers = h()): Response {
  return new Response(JSON.stringify(body), { status, headers });
}
function configuration(env: Env) {
  try {
    const audience = new URL(env.RESOURCE_AUDIENCE), issuer = new URL(env.RESOURCE_ISSUER);
    if (audience.protocol !== "https:" || audience.pathname !== "/mcp" || audience.search || audience.hash ||
        audience.username || audience.password || issuer.protocol !== "https:" || issuer.origin !== env.RESOURCE_ISSUER ||
        typeof env.RESOURCE_CLIENT_ID !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(env.RESOURCE_CLIENT_ID) ||
        typeof env.RESOURCE_VALIDATOR_ID !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(env.RESOURCE_VALIDATOR_ID) ||
        env.RESOURCE_CLIENT_ID === env.RESOURCE_VALIDATOR_ID ||
        typeof env.RESOURCE_VALIDATOR_SECRET !== "string" || !/^[\x21-\x7e]{32,256}$/.test(env.RESOURCE_VALIDATOR_SECRET) ||
        !env.ISSUER || !env.NEWSROOM) throw new Error();
    return { audience: env.RESOURCE_AUDIENCE, issuer: issuer.origin, origin: audience.origin,
      metadata: audience.origin + "/.well-known/oauth-protected-resource/mcp" };
  } catch { throw new PolicyError(503, "resource_not_configured"); }
}
function unauthorized(metadata: string): Response {
  const headers = h();
  headers.set("WWW-Authenticate", `Bearer error="invalid_token", resource_metadata="${metadata}", scope="${SCOPE}"`);
  return json({ error: "invalid_token" }, 401, headers);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const config = configuration(env), url = new URL(request.url);
      if (url.origin !== config.origin) return json({ error: "wrong_origin" }, 421);
      if (url.search) return json({ error: "invalid_request" }, 400);
      if (request.method === "GET" && ["/.well-known/oauth-protected-resource",
        "/.well-known/oauth-protected-resource/mcp"].includes(url.pathname)) return json({
        resource: config.audience, authorization_servers: [config.issuer],
        scopes_supported: [SCOPE], bearer_methods_supported: ["header"],
      });
      if (url.pathname !== "/mcp") return json({ error: "not_found" }, 404);
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      const origin = request.headers.get("Origin");
      if (origin !== null && origin !== config.origin) return json({ error: "origin_not_allowed" }, 403);
      const bearer = request.headers.get("Authorization");
      if (!bearer || !/^Bearer nr1a\.[a-f0-9]{64}\.[a-f0-9]{64}$/.test(bearer)) return unauthorized(config.metadata);
      // Only a service binding can contact the configured issuer. The OAuth
      // client's secret never authenticates this resource-side inspection.
      let verified: Record<string, unknown>;
      try {
        const response = await env.ISSUER.fetch(new Request(config.issuer + "/introspect", {
          method: "POST", redirect: "manual", signal: AbortSignal.timeout(5000),
          headers: { "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(env.RESOURCE_VALIDATOR_ID + ":" + env.RESOURCE_VALIDATOR_SECRET) },
          body: new URLSearchParams({ token: bearer.slice(7), token_type_hint: "access_token" }),
        }));
        if (response.status !== 200) throw new Error();
        const value: unknown = JSON.parse(await boundedText(response.body, 4096));
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
        verified = value as Record<string, unknown>;
      } catch { return json({ error: "issuer_unavailable" }, 503); }
      if (verified.active !== true || verified.iss !== config.issuer || verified.aud !== config.audience ||
          verified.client_id !== env.RESOURCE_CLIENT_ID || verified.scope !== SCOPE ||
          !Number.isSafeInteger(verified.exp) || Number(verified.exp) <= Date.now() / 1000)
        return unauthorized(config.metadata);
      if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json")
        return json({ error: "unsupported_media_type" }, 415);
      let rpc: Record<string, unknown>;
      try {
        const value: unknown = JSON.parse(await boundedText(request.body, 65_536));
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
        rpc = value as Record<string, unknown>;
      } catch (error) {
        return json({ error: error instanceof PolicyError ? error.publicCode : "invalid_request" },
          error instanceof PolicyError ? error.status : 400);
      }
      if (rpc.jsonrpc !== "2.0" || typeof rpc.method !== "string" ||
          !["server/discover", "initialize", "ping", "notifications/initialized", "tools/list", "tools/call"].includes(rpc.method))
        return json({ error: "method_not_allowed" }, 403);
      // MCP 2026-07-28 capability discovery, required by current ChatGPT clients.
      // Respond only after checking the bearer token with the isolated issuer.
      // Advertise strictly read-only tools; no resources, prompts or write capabilities.
      if (rpc.method === "server/discover") return json({
        jsonrpc: "2.0", id: rpc.id,
        result: {
          resultType: "complete", supportedVersions: ["2026-07-28"],
          capabilities: { tools: {} }, ttlMs: 0, cacheScope: "private",
          _meta: { "io.modelcontextprotocol/serverInfo":
            { name: "torenthia-newsroom-readonly", version: "1.0.0" } },
        },
      });
      if (rpc.method === "tools/call") {
        const params = rpc.params;
        if (!params || typeof params !== "object" || Array.isArray(params)) return json({ error: "invalid_request" }, 400);
        const call = params as { name?: unknown; arguments?: unknown };
        if (typeof call.name !== "string" || !READ_TOOLS.has(call.name)) return json({ error: "tool_not_allowed" }, 403);
        const args = call.arguments ?? {};
        if (!args || typeof args !== "object" || Array.isArray(args) || Object.keys(args).some(key =>
          !(call.name === "newsroom_read" ? ["key"] : ["desk", "limit", "cursor"]).includes(key)))
          return json({ error: "invalid_arguments" }, 400);
      }
      const clean = new Request(config.audience, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rpc) });
      // Only the preserved read handlers can be reached after the allowlist.
      const result = await mcp(clean, { desk: "editorial", editor: true }, { NEWSROOM: env.NEWSROOM });
      if (rpc.method !== "tools/list" || !result.ok) return result;
      const data = await result.json() as { result: { tools: Record<string, unknown>[] } };
      data.result.tools = data.result.tools.filter(tool => READ_TOOLS.has(String(tool.name))).map(tool => {
        const securitySchemes = [{ type: "oauth2", scopes: [SCOPE] }];
        return { ...tool, securitySchemes, _meta: { securitySchemes },
          annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } };
      });
      return json(data);
    } catch (error) {
      return json({ error: error instanceof PolicyError ? error.publicCode : "resource_unavailable" },
        error instanceof PolicyError ? error.status : 503);
    }
  },
};
