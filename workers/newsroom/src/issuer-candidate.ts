/** Independent, UNBOUND authorization-server candidate. NOT APPROVED TO DEPLOY.
 * No release Worker, synthetic fixture, live storage or existing OAuth grant is used.
 * One explicitly registered confidential client and allowlisted GitHub editor only.
 */
export { IssuerGrant } from "./issuer-grant.ts";
import type { IssuerGrant, GrantBinding, AuthorizationBinding } from "./issuer-grant.ts";
import { issuerGitHubIdentity, type IssuerGitHubTransport } from "./issuer-github.ts";
import {
  mintGrantId, mintBoundCredential, routeBoundCredential, sha256Hex, verifyConfidentialClient,
} from "../prototype/issuer-boundary.ts";
import { boundedText, PolicyError, s256 } from "./policy.ts";

interface Env {
  ISSUER_ORIGIN: string;
  ISSUER_CLIENT_ID: string;
  ISSUER_CLIENT_SECRET_SHA256: string;
  ISSUER_REDIRECT_URI: string;
  ISSUER_AUDIENCE: string;
  ISSUER_EDITOR_ID: string;
  ISSUER_GITHUB_CLIENT_ID: string;
  ISSUER_GITHUB_CLIENT_SECRET: string;
  ISSUER_GRANTS: DurableObjectNamespace<IssuerGrant>;
}
interface Configuration extends GrantBinding {
  issuer: string;
  redirectUri: string;
  secretHash: string;
  githubClientId: string;
  githubClientSecret: string;
}
const COOKIE = "__Host-newsroom-issuer";
const SCOPE = "newsroom:read";
const now = () => Math.floor(Date.now() / 1000);
const headers = () => new Headers({
  "Cache-Control": "no-store", Pragma: "no-cache", "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
});
const json = (body: unknown, status = 200) => {
  const h = headers(); h.set("Content-Type", "application/json");
  if (status === 401) h.set("WWW-Authenticate", 'Basic realm="newsroom-issuer"');
  return new Response(JSON.stringify(body), { status, headers: h });
};
const fail = (status: number, code: string): never => { throw new PolicyError(status, code); };
const escape = (value: string) => value.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

function configuration(env: Env): Configuration {
  try {
    const issuer = new URL(env.ISSUER_ORIGIN);
    const redirect = new URL(env.ISSUER_REDIRECT_URI);
    const audience = new URL(env.ISSUER_AUDIENCE);
    if (issuer.protocol !== "https:" || issuer.origin !== env.ISSUER_ORIGIN ||
        redirect.protocol !== "https:" || redirect.username || redirect.password || redirect.hash ||
        audience.protocol !== "https:" || audience.username || audience.password ||
        audience.search || audience.hash || audience.pathname !== "/mcp" ||
        typeof env.ISSUER_CLIENT_ID !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(env.ISSUER_CLIENT_ID) ||
        typeof env.ISSUER_CLIENT_SECRET_SHA256 !== "string" || !/^[a-f0-9]{64}$/.test(env.ISSUER_CLIENT_SECRET_SHA256) ||
        typeof env.ISSUER_EDITOR_ID !== "string" || !/^[1-9][0-9]{0,19}$/.test(env.ISSUER_EDITOR_ID) ||
        typeof env.ISSUER_GITHUB_CLIENT_ID !== "string" || !env.ISSUER_GITHUB_CLIENT_ID ||
        env.ISSUER_GITHUB_CLIENT_ID.length > 256 ||
        typeof env.ISSUER_GITHUB_CLIENT_SECRET !== "string" || !env.ISSUER_GITHUB_CLIENT_SECRET ||
        env.ISSUER_GITHUB_CLIENT_SECRET.length > 4096 || !env.ISSUER_GRANTS) throw new Error();
    return { issuer: issuer.origin, redirectUri: env.ISSUER_REDIRECT_URI,
      audience: env.ISSUER_AUDIENCE, clientId: env.ISSUER_CLIENT_ID,
      editorId: env.ISSUER_EDITOR_ID, secretHash: env.ISSUER_CLIENT_SECRET_SHA256,
      githubClientId: env.ISSUER_GITHUB_CLIENT_ID, githubClientSecret: env.ISSUER_GITHUB_CLIENT_SECRET };
  } catch { return fail(503, "issuer_not_configured"); }
}
function parameters(params: URLSearchParams, required: string[], optional: string[] = []): boolean {
  const names = [...params.keys()];
  return names.length === new Set(names).size && required.every(k => !!params.get(k)) &&
    names.every(k => required.includes(k) || optional.includes(k));
}
async function form(request: Request): Promise<URLSearchParams> {
  if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !==
      "application/x-www-form-urlencoded") return fail(415, "unsupported_media_type");
  try { return new URLSearchParams(await boundedText(request.body, 4096)); }
  catch (error) {
    if (error instanceof PolicyError) throw error;
    return fail(400, "invalid_request");
  }
}
async function browser(request: Request) {
  const values = (request.headers.get("Cookie") ?? "").split(";").map(x => x.trim())
    .filter(x => x.startsWith(COOKIE + "="));
  return values.length === 1 ? routeBoundCredential(values[0].slice(COOKIE.length + 1), "browser") : null;
}
function cookie(h: Headers, value: string, clear = false): void {
  h.set("Set-Cookie", COOKIE + "=" + value +
    "; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=" + (clear ? "0" : "300"));
}
function redirect(binding: AuthorizationBinding, key: "code" | "error", value: string): Response {
  const url = new URL(binding.redirectUri);
  url.searchParams.set(key, value);
  url.searchParams.set("state", binding.clientState);
  const h = headers(); cookie(h, "", true); h.set("Location", url.href);
  return new Response(null, { status: 302, headers: h });
}
function stub(env: Env, grantId: string) {
  return env.ISSUER_GRANTS.get(env.ISSUER_GRANTS.idFromName(grantId));
}
const grantBinding = (config: Configuration): GrantBinding => ({
  clientId: config.clientId, editorId: config.editorId, audience: config.audience,
});

async function authorize(request: Request, env: Env, config: Configuration): Promise<Response> {
  const params = new URL(request.url).searchParams;
  if (!parameters(params, ["response_type", "client_id", "redirect_uri", "scope", "resource",
    "state", "code_challenge", "code_challenge_method"]) || params.get("response_type") !== "code" ||
      params.get("client_id") !== config.clientId || params.get("redirect_uri") !== config.redirectUri ||
      params.get("scope") !== SCOPE || params.get("resource") !== config.audience ||
      !/^[\x20-\x7e]{1,1024}$/.test(params.get("state")!) ||
      !/^[A-Za-z0-9_-]{43}$/.test(params.get("code_challenge")!) ||
      params.get("code_challenge_method") !== "S256") return fail(400, "invalid_authorization_request");
  const grantId = mintGrantId();
  const session = mintBoundCredential(grantId, "browser");
  const upstream = mintBoundCredential(grantId, "state");
  const verifier = mintGrantId();
  if (!(await stub(env, grantId).start({
    binding: { clientId: config.clientId, editorId: config.editorId, audience: config.audience,
      redirectUri: config.redirectUri, clientState: params.get("state")!, challenge: params.get("code_challenge")! },
    browserHash: await sha256Hex(session), upstreamHash: await sha256Hex(upstream), verifier, now: now(),
  }))) return fail(503, "authorization_unavailable");
  const location = new URL("https://github.com/login/oauth/authorize");
  location.search = new URLSearchParams({ client_id: config.githubClientId,
    redirect_uri: config.issuer + "/oauth/callback", scope: "", allow_signup: "false",
    state: upstream, code_challenge: await s256(verifier), code_challenge_method: "S256" }).toString();
  const h = headers(); cookie(h, session); h.set("Location", location.href);
  return new Response(null, { status: 302, headers: h });
}

async function callback(
  request: Request, env: Env, config: Configuration, transport?: IssuerGitHubTransport,
): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const cancelled = params.has("error");
  if (!(cancelled ? parameters(params, ["state", "error"], ["error_description", "error_uri"])
    : parameters(params, ["state", "code"])) ||
      (!cancelled && !/^[\x21-\x7e]{1,1024}$/.test(params.get("code")!))) return fail(400, "invalid_callback");
  const state = await routeBoundCredential(params.get("state")!, "state");
  const session = await browser(request);
  if (!state || !session || state.grantId !== session.grantId) return fail(403, "invalid_browser_session");
  const grant = stub(env, state.grantId);
  const claimed = await grant.claimUpstream({ browserHash: session.credentialHash,
    upstreamHash: state.credentialHash, expected: grantBinding(config), now: now() });
  if (!claimed) return fail(403, "invalid_callback");
  if (cancelled) return redirect(claimed.binding, "error", "access_denied");
  const editorId = await issuerGitHubIdentity(params.get("code")!, claimed.verifier, config, transport);
  const successorSession = mintBoundCredential(state.grantId, "browser");
  const csrf = mintGrantId();
  const binding = await grant.authenticate({ browserHash: session.credentialHash,
    verifiedEditorId: editorId, successorBrowserHash: await sha256Hex(successorSession),
    csrfHash: await sha256Hex(csrf), now: now() });
  if (!binding) return fail(403, "authorization_expired");
  const h = headers(); cookie(h, successorSession);
  h.set("Content-Type", "text/html; charset=utf-8");
  h.set("Referrer-Policy", "origin");
  // Browsers may apply form-action to the registered client's final redirect.
  h.set("Content-Security-Policy", "default-src 'none'; form-action 'self' " +
    new URL(binding.redirectUri).origin + "; frame-ancestors 'none'; base-uri 'none'");
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Connect the newsroom</title>
<h1>Connect ${escape(binding.clientId)} to the newsroom?</h1>
<p>Signed in as the approved GitHub editor. This connection can list and read newsroom submissions.</p>
<p>Access returns to <strong>${escape(new URL(binding.redirectUri).host)}</strong>.</p>
<form method="post" action="/consent"><input type="hidden" name="csrf" value="${csrf}">
<button name="decision" value="approve">Approve read access</button>
<button name="decision" value="deny">Cancel</button></form></html>`, { headers: h });
}

async function consent(request: Request, env: Env, config: Configuration): Promise<Response> {
  if (request.headers.get("Origin") !== config.issuer) return fail(403, "origin_not_allowed");
  const params = await form(request);
  if (!parameters(params, ["csrf", "decision"]) || !/^[a-f0-9]{64}$/.test(params.get("csrf")!) ||
      !["approve", "deny"].includes(params.get("decision")!)) return fail(400, "invalid_consent");
  const session = await browser(request);
  if (!session) return fail(403, "invalid_browser_session");
  const code = mintBoundCredential(session.grantId, "code");
  const approve = params.get("decision") === "approve";
  const binding = await stub(env, session.grantId).finishConsent({
    browserHash: session.credentialHash, csrfHash: await sha256Hex(params.get("csrf")!),
    approve, codeHash: await sha256Hex(code), expected: grantBinding(config), now: now(),
  });
  if (!binding) return fail(403, "invalid_consent");
  return redirect(binding, approve ? "code" : "error", approve ? code : "access_denied");
}

async function clientEndpoint(request: Request, env: Env, config: Configuration): Promise<Response> {
  if (!(await verifyConfidentialClient(request.headers.get("Authorization"), config.clientId, config.secretHash)))
    return fail(401, "invalid_client");
  const params = await form(request);
  const path = new URL(request.url).pathname;
  if (path === "/token") {
    const isCode = params.get("grant_type") === "authorization_code";
    if (!isCode && params.get("grant_type") !== "refresh_token") return fail(400, "unsupported_grant_type");
    if (!parameters(params, isCode ? ["grant_type", "code", "redirect_uri", "code_verifier"] :
      ["grant_type", "refresh_token"], isCode ? ["resource"] : ["resource", "scope"])) return fail(400, "invalid_request");
    if (params.has("resource") && params.get("resource") !== config.audience) return fail(400, "invalid_target");
    if (params.has("scope") && params.get("scope") !== SCOPE) return fail(400, "invalid_scope");
    const routed = await routeBoundCredential(params.get(isCode ? "code" : "refresh_token")!, isCode ? "code" : "refresh");
    if (!routed) return fail(400, "invalid_grant");
    const grant = stub(env, routed.grantId);
    const access = mintBoundCredential(routed.grantId, "access");
    const refresh = mintBoundCredential(routed.grantId, "refresh");
    const issued = { expected: grantBinding(config), refreshHash: await sha256Hex(refresh), accessHash: await sha256Hex(access), now: now() };
    let accepted: boolean;
    if (isCode) {
      if (!/^[A-Za-z0-9._~-]{43,128}$/.test(params.get("code_verifier")!)) return fail(400, "invalid_grant");
      // Also require the current registration, even if configuration changed since consent.
      if (params.get("redirect_uri") !== config.redirectUri) return fail(400, "invalid_grant");
      accepted = await grant.exchangeCode({ ...issued, codeHash: routed.credentialHash,
        challenge: await s256(params.get("code_verifier")!), redirectUri: config.redirectUri });
    } else accepted = await grant.refresh({ ...issued, presentedHash: routed.credentialHash });
    if (!accepted) return fail(400, "invalid_grant");
    return json({ access_token: access, refresh_token: refresh, token_type: "Bearer", expires_in: 900, scope: SCOPE });
  }
  if (path === "/introspect") {
    if (!parameters(params, ["token", "token_type_hint"]) || params.get("token_type_hint") !== "access_token")
      return fail(400, "invalid_request");
    const routed = await routeBoundCredential(params.get("token")!, "access");
    const active = !!routed && await stub(env, routed.grantId).authorize({ expected: grantBinding(config),
      accessHash: routed.credentialHash, now: now() });
    return json(active ? { active: true, scope: SCOPE, aud: config.audience } : { active: false });
  }
  if (!parameters(params, ["token"], ["token_type_hint"])) return fail(400, "invalid_request");
  // A hint is advisory; search both supported credential kinds.
  for (const kind of ["access", "refresh"] as const) {
    const routed = await routeBoundCredential(params.get("token")!, kind);
    if (routed) await stub(env, routed.grantId).revoke({ expected: grantBinding(config),
      credentialHash: routed.credentialHash, kind });
  }
  return new Response(null, { status: 200, headers: headers() });
}

export function createIssuerCandidate(dependencies: { githubTransport?: IssuerGitHubTransport } = {}) {
  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      try {
        const config = configuration(env);
        const url = new URL(request.url);
        if (url.origin !== config.issuer) return fail(421, "wrong_origin");
        if (request.url.length > 8192) return fail(414, "request_too_large");
        const origin = request.headers.get("Origin");
        if (origin !== null && origin !== config.issuer) return fail(403, "origin_not_allowed");
        if (request.method === "GET" && url.pathname === "/authorize") return await authorize(request, env, config);
        if (request.method === "GET" && url.pathname === "/oauth/callback")
          return await callback(request, env, config, dependencies.githubTransport);
        if (url.search) return fail(400, "invalid_request");
        if (request.method === "POST" && url.pathname === "/consent") return await consent(request, env, config);
        if (request.method === "POST" && ["/token", "/introspect", "/revoke"].includes(url.pathname))
          return await clientEndpoint(request, env, config);
        if (request.method === "GET" && url.pathname === "/.well-known/oauth-authorization-server") return json({
          issuer: config.issuer, authorization_endpoint: config.issuer + "/authorize",
          token_endpoint: config.issuer + "/token", introspection_endpoint: config.issuer + "/introspect",
          revocation_endpoint: config.issuer + "/revoke", response_types_supported: ["code"],
          grant_types_supported: ["authorization_code", "refresh_token"], scopes_supported: [SCOPE],
          token_endpoint_auth_methods_supported: ["client_secret_basic"],
          introspection_endpoint_auth_methods_supported: ["client_secret_basic"],
          revocation_endpoint_auth_methods_supported: ["client_secret_basic"], code_challenge_methods_supported: ["S256"],
        });
        return fail(404, "not_found");
      } catch (error) {
        return error instanceof PolicyError ? json({ error: error.publicCode }, error.status)
          : json({ error: "issuer_unavailable" }, 503);
      }
    },
  };
}
export default createIssuerCandidate();
