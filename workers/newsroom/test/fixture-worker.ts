/** Synthetic adapter only. This is not an export or reconstruction of the live Worker. */
import { WorkerEntrypoint } from "cloudflare:workers";
import { createNewsroomOAuth, oauthHelpers, type LegacyAdapter } from "../src/oauth.ts";
import { type OAuthBindings, type LegacyPrincipal } from "../src/policy.ts";

interface FixtureEnv extends OAuthBindings {
  GITHUB: Fetcher;
}

const desks = ["corindal", "korda", "varek", "federal", "editorial"];
const principal = (request: Request): LegacyPrincipal | null => {
  const header = request.headers.get("authorization");
  const desk = desks.find(x => header === `Bearer synthetic-${x}-credential`);
  return desk ? { desk, editor: desk === "editorial" } : null;
};
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "Content-Type": "application/json", "X-Test-Fixture": "synthetic-adapter" },
});

const adapter: LegacyAdapter<FixtureEnv> = {
  principal,
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    if (path === "/health") return json({ ready: true });
    const who = principal(request);
    if (!who) return json({ error: "unauthorized" }, 401);
    if (path === "/mcp") return adapter.mcp(request, env, ctx, who);
    if (path === "/v1/read") return json({ route: path, principal: who });
    return json({ error: "not_found" }, 404);
  },
  async mcp(request, _env, _ctx, who) {
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    const rpc = await request.json() as { id?: number; method: string; params?: { name?: string } };
    if (!Object.hasOwn(rpc, "id")) return new Response(null, { status: 202 });
    if (rpc.method === "initialize") return json({ jsonrpc: "2.0", id: rpc.id, result: {
      protocolVersion: "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "synthetic-fixture", version: "1" },
    } });
    if (rpc.method === "tools/list") return json({ jsonrpc: "2.0", id: rpc.id, result: {
      tools: ["newsroom_submit", "newsroom_list", "newsroom_read", "newsroom_review", "newsroom_publish"].map(name => ({
        name, description: "Synthetic test tool", inputSchema: { type: "object", properties: {} },
      })),
    } });
    if (rpc.method === "tools/call") return json({ jsonrpc: "2.0", id: rpc.id, result: {
      content: [{ type: "text", text: JSON.stringify({ principal: who, tool: rpc.params?.name }) }],
    } });
    return json({ jsonrpc: "2.0", id: rpc.id, result: {} });
  },
};

const auth = createNewsroomOAuth(adapter, {
  githubTransport: (request, env) => env.GITHUB.fetch(request),
});

export default class FixtureWorker extends WorkerEntrypoint<FixtureEnv> {
  async fetch(request: Request) {
    const [clientId, editorId] = await Promise.all([
      this.env.OAUTH_KV.get("fixture:configured-client"), this.env.OAUTH_KV.get("fixture:editor-id"),
    ]);
    return auth.fetch(request, { ...this.env, CHATGPT_CLIENT_ID: clientId || this.env.CHATGPT_CLIENT_ID,
      EDITOR_GITHUB_USER_ID: editorId || this.env.EDITOR_GITHUB_USER_ID }, this.ctx);
  }
  async provision() {
    const helpers = oauthHelpers(this.env, adapter);
    const client = await helpers.createClient({
      clientName: "ChatGPT <test client>", redirectUris: [this.env.CHATGPT_REDIRECT_URI],
      grantTypes: ["authorization_code", "refresh_token"], responseTypes: ["code"],
      tokenEndpointAuthMethod: "client_secret_post",
    });
    await this.env.OAUTH_KV.put("fixture:configured-client", client.clientId);
    return client;
  }
  async changeEditor(id: string) { await this.env.OAUTH_KV.put("fixture:editor-id", id); }
}
