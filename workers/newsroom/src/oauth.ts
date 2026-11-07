import {
  AuthorizationError, OAuthError, OAuthProvider, authorizationErrorRedirect,
  getOAuthApi, insufficientScope, type AuthRequest, type OAuthHelpers,
  type OAuthProviderOptions, type OAuthResourceContext,
} from "@cloudflare/workers-oauth-provider";
import { githubIdentity, type GitHubTransport } from "./github.ts";
import {
  base64url, boundedText, checkOrigin, configuration, EDITOR_PRINCIPAL, errorResponse,
  isEditorGrant, PolicyError, READ_SCOPE, REVIEW_SCOPE, s256, SCOPES, validScopes,
  type EditorGrant, type LegacyPrincipal, type OAuthBindings, type OAuthConfiguration,
} from "./policy.ts";

/** Ports to the preserved original source; test fixtures can inject isolated handlers. */
export interface LegacyAdapter<Env> {
  principal(request: Request, env: Env): LegacyPrincipal | null | Promise<LegacyPrincipal | null>;
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response>;
  mcp(request: Request, env: Env, ctx: ExecutionContext, principal: LegacyPrincipal): Response | Promise<Response>;
}

export interface OAuthDependencies<Env> {
  githubTransport?: GitHubTransport<Env>;
}

const PUBLIC_PATHS = new Set([
  "/authorize", "/oauth/callback", "/oauth/token",
  "/.well-known/oauth-authorization-server",
  "/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp",
]);
const READ_TOOLS = new Set(["newsroom_list", "newsroom_read"]);

function validateAuth(request: AuthRequest, config: OAuthConfiguration): void {
  if (request.clientId !== config.clientId || request.redirectUri !== config.redirectUri ||
      request.resource !== config.resource || request.issuer !== config.issuer ||
      request.responseType !== "code" || !request.state || request.state.length > 1024 ||
      !request.codeChallenge || !/^[A-Za-z0-9_-]{43}$/.test(request.codeChallenge) ||
      request.codeChallengeMethod !== "S256" || !validScopes(request.scope)) {
    // Do not redirect unvalidated request data, or reflect query strings or credentials.
    throw new PolicyError(400, "authorization_request_not_allowed");
  }
}

const escape = (value: string): string => value.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

async function authorize<Env extends OAuthBindings>(
  request: Request, env: Env, helpers: OAuthHelpers, config: OAuthConfiguration,
): Promise<Response> {
  if (request.method === "GET") {
    const auth = await helpers.parseAuthRequest(request);
    validateAuth(auth, config);
    const details = await helpers.describeConsent(auth);
    const transaction = await helpers.beginConsent(auth);
    transaction.headers.set("Content-Type", "text/html; charset=utf-8");
    transaction.headers.set("Referrer-Policy", "no-referrer");
    transaction.headers.set("Content-Security-Policy", "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
    const permissions = auth.scope.filter(x => x !== "offline_access").map(scope =>
      `<li>${scope === READ_SCOPE ? "List and read submissions across newsroom desks" : "Record editorial review decisions"}</li>`,
    ).join("");
    return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Connect the newsroom</title>
<h1>Connect ${escape(details.clientName)} to the newsroom?</h1>
<p>Access returns to <strong>${escape(details.redirectHost)}</strong>.</p><ul>${permissions}</ul>
<p>Only the approved editor can complete sign-in. Editorial review does not publish content.</p>
<form method="post" action="/authorize"><input type="hidden" name="handle" value="${escape(transaction.handle)}">
<button name="decision" value="approve">Continue to GitHub sign-in</button>
<button name="decision" value="deny">Cancel</button></form></html>`, { headers: transaction.headers });
  }
  if (request.method !== "POST") return errorResponse(405, "method_not_allowed", { Allow: "GET, POST" });
  if (request.headers.get("Origin") !== config.issuer) throw new PolicyError(403, "origin_not_allowed");
  const media = request.headers.get("Content-Type")?.split(";")[0].trim();
  if (media !== "application/x-www-form-urlencoded") throw new PolicyError(415, "unsupported_media_type");
  const form = new URLSearchParams(await boundedText(request.body, 8192));
  if ([...form.keys()].some(x => !["handle", "decision"].includes(x)) ||
      form.getAll("handle").length !== 1 || form.getAll("decision").length !== 1) {
    throw new PolicyError(400, "invalid_consent");
  }
  const handle = form.get("handle") || "";
  if (form.get("decision") !== "approve") {
    const denied = await helpers.denyConsent(request, handle);
    return new Response(null, { status: 302, headers: denied.headers });
  }
  const approved = await helpers.approveConsent(request, handle);
  validateAuth(approved.request, config);
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const upstream = await helpers.beginUpstream(approved.request, { data: { verifier }, headers: approved.headers });
  const location = new URL("https://github.com/login/oauth/authorize");
  location.search = new URLSearchParams({
    client_id: config.githubClientId, redirect_uri: config.issuer + "/oauth/callback",
    scope: "", allow_signup: "false", state: upstream.state,
    code_challenge: await s256(verifier), code_challenge_method: "S256",
  }).toString();
  upstream.headers.set("Location", location.toString());
  upstream.headers.set("Referrer-Policy", "no-referrer");
  return new Response(null, { status: 302, headers: upstream.headers });
}

async function callback<Env extends OAuthBindings>(
  request: Request, env: Env, helpers: OAuthHelpers, config: OAuthConfiguration, dependencies: OAuthDependencies<Env>,
): Promise<Response> {
  if (request.method !== "GET") return errorResponse(405, "method_not_allowed", { Allow: "GET" });
  const resumed = await helpers.finishUpstream<{ verifier?: unknown }>(request);
  validateAuth(resumed.request, config);
  const url = new URL(request.url);
  resumed.headers.set("Referrer-Policy", "no-referrer");
  if (url.searchParams.has("error")) {
    resumed.headers.set("Location", authorizationErrorRedirect(resumed.request, "access_denied"));
    return new Response(null, { status: 302, headers: resumed.headers });
  }
  const code = url.searchParams.get("code");
  if (!code || code.length > 1024 || url.searchParams.getAll("code").length !== 1 ||
      typeof resumed.data.verifier !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(resumed.data.verifier)) {
    throw new PolicyError(400, "invalid_callback");
  }
  const id = await githubIdentity(code, resumed.data.verifier, config, env, dependencies.githubTransport);
  const props: EditorGrant = { schema: 1, githubUserId: id };
  const result = await helpers.completeAuthorization({
    request: resumed.request, userId: "github-" + id, metadata: {},
    scope: resumed.request.scope, props,
  });
  resumed.headers.set("Location", result.redirectTo);
  resumed.headers.set("Cache-Control", "no-store");
  return new Response(null, { status: 302, headers: resumed.headers });
}

async function oauthMcp<Env extends OAuthBindings>(
  request: Request, env: Env, ctx: OAuthResourceContext<EditorGrant>,
  adapter: LegacyAdapter<Env>, config: OAuthConfiguration,
): Promise<Response> {
  const auth = ctx.auth;
  if (!isEditorGrant(ctx.props, config) || auth.userId !== "github-" + config.editorId ||
      auth.clientId !== config.clientId || auth.audience !== config.resource ||
      !auth.expiresAt || auth.expiresAt <= Date.now() / 1000) {
    return errorResponse(401, "invalid_token", {
      "WWW-Authenticate": `Bearer error="invalid_token", resource_metadata="${config.issuer}/.well-known/oauth-protected-resource/mcp"`,
    });
  }
  if (!auth.scope.includes(READ_SCOPE)) return insufficientScope(auth, [READ_SCOPE]);
  if (request.method !== "POST") return errorResponse(405, "method_not_allowed", { Allow: "POST" });
  if (request.headers.get("Content-Type")?.split(";")[0].trim() !== "application/json") {
    return errorResponse(415, "unsupported_media_type");
  }
  let rpc: { method?: unknown; params?: { name?: unknown } };
  try {
    rpc = JSON.parse(await boundedText(request.clone().body, 65_536));
    if (!rpc || typeof rpc !== "object" || Array.isArray(rpc)) throw new Error();
  } catch (error) {
    if (error instanceof PolicyError) throw error;
    return errorResponse(400, "invalid_request");
  }
  if (rpc.method === "tools/call") {
    const tool = rpc.params?.name;
    if (tool === "newsroom_review") {
      if (!auth.scope.includes(REVIEW_SCOPE)) return insufficientScope(auth, [READ_SCOPE, REVIEW_SCOPE]);
    } else if (typeof tool !== "string" || !READ_TOOLS.has(tool)) {
      return errorResponse(403, "tool_not_allowed");
    }
  }
  const response = await adapter.mcp(request, env, ctx, { ...EDITOR_PRINCIPAL });
  if (rpc.method !== "tools/list" || !response.ok) return response;
  const data = await response.json() as { result?: { tools?: Record<string, unknown>[] } };
  if (!data.result || !Array.isArray(data.result.tools)) return errorResponse(502, "invalid_mcp_response");
  data.result.tools = data.result.tools.filter(tool => READ_TOOLS.has(String(tool.name)) ||
    (tool.name === "newsroom_review" && auth.scope.includes(REVIEW_SCOPE))).map(tool => {
      const readOnly = READ_TOOLS.has(String(tool.name));
      const securitySchemes = [{ type: "oauth2", scopes: readOnly ? [READ_SCOPE] : [READ_SCOPE, REVIEW_SCOPE] }];
      return { ...tool, securitySchemes,
        _meta: { ...(tool._meta as Record<string, unknown> || {}), securitySchemes },
        annotations: { ...(tool.annotations as Record<string, unknown> || {}),
          readOnlyHint: readOnly, destructiveHint: !readOnly, idempotentHint: readOnly, openWorldHint: false },
      };
    });
  const headers = new Headers(response.headers);
  headers.delete("Content-Length");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { status: response.status, headers });
}

export function providerOptions<Env extends OAuthBindings>(
  env: Env, adapter: LegacyAdapter<Env>, dependencies: OAuthDependencies<Env> = {},
): OAuthProviderOptions<Env> {
  const config = configuration(env);
  return {
    apiRoute: "/mcp", authorizeEndpoint: "/authorize", tokenEndpoint: "/oauth/token",
    resourceMetadata: { resource: config.resource, authorization_servers: [config.issuer] },
    requiredScopes: [READ_SCOPE], scopesSupported: SCOPES,
    clientIdMetadataDocumentEnabled: false, disallowPublicClientRegistration: true,
    allowTokenExchangeGrant: false, accessTokenTTL: 15 * 60, refreshTokenTTL: 8 * 60 * 60,
    onError: () => undefined,
    tokenExchangeCallback(options) {
      const current = configuration(options.env);
      if (options.clientId !== current.clientId || options.subjectClientId !== current.clientId ||
          options.userId !== "github-" + current.editorId || options.resource !== current.resource ||
          !isEditorGrant(options.props, current) || !validScopes(options.requestedScope)) {
        throw new OAuthError("invalid_grant", { description: "Editor authorization is no longer available." });
      }
    },
    apiHandler: {
      fetch(request, bindings, context) {
        return oauthMcp(request, bindings, context as OAuthResourceContext<EditorGrant>, adapter, config);
      },
    },
    defaultHandler: {
      fetch(request, bindings) {
        const helpers = (bindings as Env & { OAUTH_PROVIDER: OAuthHelpers }).OAUTH_PROVIDER;
        return new URL(request.url).pathname === "/authorize"
          ? authorize(request, bindings, helpers, config)
          : callback(request, bindings, helpers, config, dependencies);
      },
    },
  };
}

/** Add OAuth at /mcp while retaining the original bearer and REST paths. */
export function createNewsroomOAuth<Env extends OAuthBindings>(
  adapter: LegacyAdapter<Env>, dependencies: OAuthDependencies<Env> = {},
): { fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> } {
  return {
    async fetch(request, env, ctx) {
      try {
        const path = new URL(request.url).pathname;
        // Keep every existing REST and health route on the original implementation.
        if (path !== "/mcp" && !PUBLIC_PATHS.has(path)) return await adapter.fetch(request, env, ctx);
        // A valid legacy token never depends on OAuth configuration, KV or an upstream IdP.
        if (path === "/mcp" && await adapter.principal(request, env)) return await adapter.fetch(request, env, ctx);
        const config = configuration(env);
        if (new URL(request.url).origin !== config.issuer) return errorResponse(421, "wrong_origin");
        checkOrigin(request, config);
        const provider = new OAuthProvider(providerOptions(env, adapter, dependencies));
        return await provider.fetch(request, env, ctx);
      } catch (error) {
        if (error instanceof PolicyError) return errorResponse(error.status, error.publicCode);
        // The library distinguishes valid redirect targets; keep all local failures opaque.
        if (error instanceof AuthorizationError) return errorResponse(400, "invalid_authorization_request");
        return errorResponse(503, "oauth_unavailable");
      }
    },
  };
}

/** Administrative helper only. Never expose it through HTTP or an MCP tool. */
export function oauthHelpers<Env extends OAuthBindings>(env: Env, adapter: LegacyAdapter<Env>): OAuthHelpers {
  return getOAuthApi(providerOptions(env, adapter), env);
}
