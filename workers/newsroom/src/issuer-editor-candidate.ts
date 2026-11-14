/** Independent, UNBOUND Editor-only authorization-server candidate. NOT APPROVED TO DEPLOY.
 * No release Worker, synthetic fixture, live storage or existing OAuth grant is used.
 * One explicitly registered confidential client and allowlisted GitHub editor only.
 */
export { IssuerGrant } from "./issuer-grant.ts";
export { IssuerGuard } from "./issuer-guard.ts";
import type { IssuerGuard, GuardBucket } from "./issuer-guard.ts";
import type { IssuerGrant, GrantBinding, AuthorizationBinding } from "./issuer-grant.ts";
import { issuerGitHubIdentity, type IssuerGitHubTransport } from "./issuer-github.ts";
import {
  mintGrantId, mintBoundCredential, routeBoundCredential, sha256Hex, verifyConfidentialClient,
} from "../prototype/issuer-boundary.ts";
import { accessContext, mintAdmittedCredential, verifyAccessAdmission, verifyCredentialAdmission } from "./access-admission.ts";
import { challengePage, verifyAuthorizationChallenge, type ChallengeConfig } from "./authorization-challenge.ts";
import { observeResponse, securityEvent } from "./security-events.ts";
import { boundedText, PolicyError, s256 } from "./policy.ts";
import { requireIngressBudget, type IngressRateLimiter } from "./ingress-rate-limit.ts";
import { observe, type PrivacyCounterSink } from "./privacy-telemetry.ts";
import { EDITOR_SCOPE as SCOPE, editorIssuerMetadata, ISSUER_METADATA_PATH } from "./editor-oauth-metadata.ts";
import {
  editorStageOne, isolatedEditor, stageOneClientAuth, stageOneClosed, stageOneContext, stageOneDeadline,
  stageOneEvent, type ClientAuthFailure, type ClientAuthMethod, type StageOneEnv,
} from "./editor-stage-one.ts";

interface Env extends ChallengeConfig, StageOneEnv {
  ISSUER_ADMISSION_KEY: string;
  ISSUER_SESSION_KEY: string;
  ISSUER_ORIGIN: string;
  ISSUER_CLIENT_ID: string;
  ISSUER_CLIENT_SECRET_SHA256: string;
  ISSUER_RESOURCE_ID: string;
  ISSUER_RESOURCE_SECRET_SHA256: string;
  ISSUER_REDIRECT_URI: string;
  ISSUER_AUDIENCE: string;
  ISSUER_EDITOR_ID: string;
  ISSUER_GITHUB_CLIENT_ID: string;
  ISSUER_GITHUB_CLIENT_SECRET: string;
  ISSUER_GRANTS: DurableObjectNamespace<IssuerGrant>;
  ISSUER_GUARD: DurableObjectNamespace<IssuerGuard>;
  ISSUER_INGRESS_LIMIT: IngressRateLimiter;
  NEWSROOM_METRICS?: PrivacyCounterSink;
}
interface Configuration extends Omit<GrantBinding, "epoch"> {
  issuer: string;
  secretHash: string;
  resourceId: string;
  resourceSecretHash: string;
  githubClientId: string;
  githubClientSecret: string;
}
const COOKIE = "__Host-newsroom-issuer";
const GITHUB_ISSUER = "https://github.com/login/oauth";
const CHATGPT_REDIRECT_URI = "https://chatgpt.com/connector_platform_oauth_redirect";
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

function configuration(env: Env, windowExpiresAt?: number): Configuration {
  try {
    const issuer = new URL(env.ISSUER_ORIGIN);
    const audience = new URL(env.ISSUER_AUDIENCE);
    if (issuer.protocol !== "https:" || issuer.origin !== env.ISSUER_ORIGIN ||
        env.ISSUER_REDIRECT_URI !== CHATGPT_REDIRECT_URI ||
        audience.protocol !== "https:" || audience.username || audience.password ||
        audience.search || audience.hash || audience.pathname !== "/mcp" ||
        typeof env.ISSUER_CLIENT_ID !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(env.ISSUER_CLIENT_ID) ||
        typeof env.ISSUER_CLIENT_SECRET_SHA256 !== "string" || !/^[a-f0-9]{64}$/.test(env.ISSUER_CLIENT_SECRET_SHA256) ||
        typeof env.ISSUER_RESOURCE_ID !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(env.ISSUER_RESOURCE_ID) ||
        env.ISSUER_RESOURCE_ID === env.ISSUER_CLIENT_ID ||
        typeof env.ISSUER_RESOURCE_SECRET_SHA256 !== "string" || !/^[a-f0-9]{64}$/.test(env.ISSUER_RESOURCE_SECRET_SHA256) ||
        env.ISSUER_RESOURCE_SECRET_SHA256 === env.ISSUER_CLIENT_SECRET_SHA256 || !env.ISSUER_GUARD ||
        typeof env.ISSUER_EDITOR_ID !== "string" || !/^[1-9][0-9]{0,19}$/.test(env.ISSUER_EDITOR_ID) ||
        typeof env.ISSUER_GITHUB_CLIENT_ID !== "string" || !env.ISSUER_GITHUB_CLIENT_ID ||
        env.ISSUER_GITHUB_CLIENT_ID.length > 256 ||
        typeof env.ISSUER_GITHUB_CLIENT_SECRET !== "string" || !env.ISSUER_GITHUB_CLIENT_SECRET ||
        env.ISSUER_GITHUB_CLIENT_SECRET.length > 4096 || !env.ISSUER_GRANTS || !/^[a-f0-9]{64}$/.test(env.ISSUER_ADMISSION_KEY) ||
        !/^[a-f0-9]{64}$/.test(env.ISSUER_SESSION_KEY) || env.ISSUER_SESSION_KEY === env.ISSUER_ADMISSION_KEY) throw new Error();
    return { issuer: issuer.origin, audience: env.ISSUER_AUDIENCE, clientId: env.ISSUER_CLIENT_ID, windowExpiresAt,
      editorId: env.ISSUER_EDITOR_ID, secretHash: env.ISSUER_CLIENT_SECRET_SHA256,
      resourceId: env.ISSUER_RESOURCE_ID, resourceSecretHash: env.ISSUER_RESOURCE_SECRET_SHA256,
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
const sessionContext = (config: Configuration) => stageOneContext("issuer-browser:v1\n" + config.issuer, config.windowExpiresAt);
async function browser(request: Request, env: Env, config: Configuration) {
  const values = (request.headers.get("Cookie") ?? "").split(";").map(x => x.trim())
    .filter(x => x.startsWith(COOKIE + "="));
  if (values.length !== 1) return null;
  const raw = values[0].slice(COOKIE.length + 1);
  return await verifyCredentialAdmission(raw, "nr1b", env.ISSUER_SESSION_KEY, sessionContext(config))
    ? routeBoundCredential(raw, "browser") : null;
}
function cookie(h: Headers, value: string, clear = false): void {
  h.set("Set-Cookie", COOKIE + "=" + value +
    "; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=" + (clear ? "0" : "300"));
}
function redirect(binding: AuthorizationBinding, key: "code" | "error", value: string, issuer: string): Response {
  if (binding.redirectUri !== CHATGPT_REDIRECT_URI) return fail(400, "invalid_authorization_request");
  const url = new URL(CHATGPT_REDIRECT_URI);
  url.searchParams.set(key, value);
  url.searchParams.set("state", binding.clientState);
  url.searchParams.set("iss", issuer);
  const h = headers(); cookie(h, "", true); h.set("Location", url.href);
  return new Response(null, { status: 302, headers: h });
}
function stub(env: Env, grantId: string) {
  return env.ISSUER_GRANTS.get(env.ISSUER_GRANTS.idFromName(grantId));
}
const guard = (env: Env, config: Configuration) =>
  env.ISSUER_GUARD.get(env.ISSUER_GUARD.idFromName(config.clientId));
async function grantBinding(env: Env, config: Configuration): Promise<GrantBinding> {
  const epoch = await guard(env, config).currentEpoch();
  if (!Number.isSafeInteger(epoch) || epoch < 0) return fail(503, "issuer_unavailable");
  return { clientId: config.clientId, editorId: config.editorId, audience: config.audience, epoch,
    windowExpiresAt: config.windowExpiresAt };
}
async function admit(env: Env, config: Configuration, bucket: GuardBucket, units = 1): Promise<void> {
  const id = bucket === "challenge" ? "anonymous-challenge:v1:" + config.clientId : config.clientId;
  const result = await env.ISSUER_GUARD.get(env.ISSUER_GUARD.idFromName(id)).admit(bucket, Date.now(), units);
  if (!result.allowed) {
    if (bucket !== "challenge") securityEvent("issuer", "rate_limit_exhausted",
      bucket === "storage" ? "introspect" : bucket, 429);
    if (bucket === "revoke") securityEvent("issuer", "revocation_failed", "revoke", 429);
    throw new RateLimitError(result.retryAfter);
  }
}
class RateLimitError extends Error {
  constructor(readonly retryAfter: number) { super("rate_limited"); }
}

async function authorize(request: Request, env: Env, config: Configuration): Promise<Response> {
  let challengeToken = "";
  let params = new URL(request.url).searchParams;
  if (request.method === "POST") {
    if (request.headers.get("Origin") !== config.issuer) return fail(403, "origin_not_allowed");
    const posted = await form(request);
    if (!parameters(posted, ["authorization", "cf-turnstile-response"])) return fail(400, "invalid_request");
    params = new URLSearchParams(posted.get("authorization")!);
    challengeToken = posted.get("cf-turnstile-response")!;
  }
  // A legacy read shorthand is not an Editor permission for this one
  // pre-registered client; supplied audiences and all broader scopes still fail.
  // ChatGPT sends RFC 8707 resource plus optional RFC 7591/OIDC-style UI locale hints.
  // UI hints are ignored for authorization and constrained to short language tags.
  const uiLocales = params.get("ui_locales");
  if ((uiLocales !== null && (uiLocales.length > 128 ||
      !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*(?: [A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*){0,4}$/.test(uiLocales))) ||
      !parameters(params, ["response_type", "client_id", "redirect_uri", "scope", "resource",
        "state", "code_challenge", "code_challenge_method"], ["ui_locales"]) ||
      params.get("response_type") !== "code" ||
      params.get("client_id") !== config.clientId || params.get("redirect_uri") !== CHATGPT_REDIRECT_URI ||
      params.get("scope") !== SCOPE || params.get("resource") !== config.audience ||
      !/^[\x20-\x7e]{1,1024}$/.test(params.get("state")!) ||
      !/^[A-Za-z0-9_-]{43}$/.test(params.get("code_challenge")!) ||
      params.get("code_challenge_method") !== "S256") return fail(400, "invalid_authorization_request");
  const ingressDenied = await requireIngressBudget(request, env.ISSUER_INGRESS_LIMIT, "authorize");
  if (ingressDenied) { observe(env, ingressDenied.status === 429 ? "rate_limit_denied" : "issuer_unavailable", "issuer"); return ingressDenied; }
  if (request.method === "GET") return challengePage(params, env);
  // Bound distributed Siteverify costs separately; this anonymous budget can
  // shed new sign-ins under attack without touching existing authenticated work.
  await admit(env, config, "challenge");
  await verifyAuthorizationChallenge(request, params, challengeToken, env);
  await admit(env, config, "authorize");
  const grantId = mintGrantId();
  const session = await mintAdmittedCredential(grantId, "browser", env.ISSUER_SESSION_KEY, sessionContext(config), config.windowExpiresAt);
  const upstream = await mintAdmittedCredential(grantId, "state", env.ISSUER_SESSION_KEY, sessionContext(config), config.windowExpiresAt);
  const verifier = mintGrantId();
  if (!(await stub(env, grantId).start({
    binding: { ...await grantBinding(env, config),
      redirectUri: CHATGPT_REDIRECT_URI, clientState: params.get("state")!, challenge: params.get("code_challenge")! },
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
  // One fixed upstream: accept legacy responses without iss, but validate any
  // supplied RFC 9207 issuer before claiming state or contacting GitHub.
  if (!(cancelled ? parameters(params, ["state", "error"], ["error_description", "error_uri", "iss"])
    : parameters(params, ["state", "code"], ["iss"])) ||
      (params.has("iss") && params.get("iss") !== GITHUB_ISSUER) ||
      (!cancelled && !/^[\x21-\x7e]{1,1024}$/.test(params.get("code")!))) return fail(400, "invalid_callback");
  const stateProof = await verifyCredentialAdmission(params.get("state")!, "nr1s", env.ISSUER_SESSION_KEY, sessionContext(config));
  const state = stateProof ? await routeBoundCredential(params.get("state")!, "state") : null;
  const session = await browser(request, env, config);
  if (!state || !session || state.grantId !== session.grantId) {
    observe(env, "authentication_denied", "issuer");
    return fail(403, "invalid_browser_session");
  }
  const callbackIngress = await requireIngressBudget(request, env.ISSUER_INGRESS_LIMIT, "callback");
  if (callbackIngress) { observe(env, callbackIngress.status === 429 ? "rate_limit_denied" : "issuer_unavailable", "issuer"); return callbackIngress; }
  const grant = stub(env, state.grantId);
  const claimed = await grant.claimUpstream({ browserHash: session.credentialHash,
    upstreamHash: state.credentialHash, expected: await grantBinding(env, config), now: now() });
  if (!claimed || claimed.binding.redirectUri !== CHATGPT_REDIRECT_URI) return fail(403, "invalid_callback");
  if (cancelled) return redirect(claimed.binding, "error", "access_denied", config.issuer);
  const editorId = await issuerGitHubIdentity(params.get("code")!, claimed.verifier, config, transport);
  const successorSession = await mintAdmittedCredential(state.grantId, "browser", env.ISSUER_SESSION_KEY, sessionContext(config), config.windowExpiresAt);
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
    new URL(CHATGPT_REDIRECT_URI).origin + "; frame-ancestors 'none'; base-uri 'none'");
  const permissions = editorStageOne
    ? "This temporary connection can list and read synthetic newsroom submissions."
    : "This connection can list and read newsroom submissions and record review decisions and notes.";
  const approval = editorStageOne ? "Approve read-only access" : "Approve Editor access";
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Connect the newsroom</title>
<h1>Connect ${escape(binding.clientId)} to the newsroom?</h1>
<p>Signed in as the approved GitHub editor. ${permissions}</p>
<p>Access returns to <strong>${new URL(CHATGPT_REDIRECT_URI).host}</strong>.</p>
<form method="post" action="/consent"><input type="hidden" name="csrf" value="${csrf}">
<button name="decision" value="approve">${approval}</button>
<button name="decision" value="deny">Cancel</button></form></html>`, { headers: h });
}

async function consent(request: Request, env: Env, config: Configuration): Promise<Response> {
  if (request.headers.get("Origin") !== config.issuer) return fail(403, "origin_not_allowed");
  const params = await form(request);
  if (!parameters(params, ["csrf", "decision"]) || !/^[a-f0-9]{64}$/.test(params.get("csrf")!) ||
      !["approve", "deny"].includes(params.get("decision")!)) return fail(400, "invalid_consent");
  const session = await browser(request, env, config);
  if (!session) return fail(403, "invalid_browser_session");
  const consentIngress = await requireIngressBudget(request, env.ISSUER_INGRESS_LIMIT, "consent");
  if (consentIngress) { observe(env, consentIngress.status === 429 ? "rate_limit_denied" : "issuer_unavailable", "issuer"); return consentIngress; }

  const code = mintBoundCredential(session.grantId, "code");
  const approve = params.get("decision") === "approve";
  const binding = await stub(env, session.grantId).finishConsent({
    browserHash: session.credentialHash, csrfHash: await sha256Hex(params.get("csrf")!),
    approve, codeHash: await sha256Hex(code), expected: await grantBinding(env, config), now: now(),
  });
  if (!binding) return fail(403, "invalid_consent");
  return redirect(binding, approve ? "code" : "error", approve ? code : "access_denied", config.issuer);
}

type ClientAuthentication =
  | { method: "basic" | "post"; authorization: string }
  | { method: ClientAuthMethod; reason: ClientAuthFailure };

function clientAuthentication(request: Request, params: URLSearchParams, resourceSide: boolean,
                              clientId: string): ClientAuthentication {
  const header = request.headers.get("Authorization");
  if (params.has("client_id") || params.has("client_secret")) {
    if (!header && !resourceSide) {
      const client = params.get("client_id"), secret = params.get("client_secret");
      params.delete("client_id");
      params.delete("client_secret");
      if (!client) return { method: "post", reason: "missing_client_id" };
      if (client !== clientId) return { method: "post", reason: "client_id_mismatch" };
      if (!secret) return { method: "post", reason: "missing_secret" };
      if (!/^[\x21-\x7e]{32,256}$/.test(secret)) return { method: "post", reason: "invalid_secret_format" };
      // URLSearchParams has already decoded the form once. Verify those exact bytes via the shared verifier.
      return { method: "post", authorization: "Basic " + btoa(client + ":" + secret) };
    }
    // Some clients repeat the public client ID alongside Basic credentials.
    // A body secret, an inconsistent ID, or body fields on introspection still fail.
    if (!editorStageOne || resourceSide || params.has("client_secret") || params.get("client_id") !== clientId)
      return { method: "multiple", reason: "multiple_methods" };
    params.delete("client_id");
  }
  if (!header) return { method: "missing", reason: "missing_credentials" };
  const basic = header.length <= 512 && /^Basic +([A-Za-z0-9+/]+={0,2})$/i.exec(header);
  if (!basic) return { method: "unsupported", reason: "invalid_authorization_header" };
  // HTTP authentication scheme names are case-insensitive. Pass a canonical header to the verifier.
  return { method: "basic", authorization: "Basic " + basic[1] };
}

async function clientEndpoint(request: Request, env: Env, config: Configuration, path: string): Promise<Response> {
  const params = await form(request);
  const names = [...params.keys()];
  if (names.length !== new Set(names).size) {
    if (path === "/token") stageOneClientAuth(400, "unclassified", "duplicate_parameters");
    return fail(400, "invalid_request");
  }
  const resourceSide = path === "/introspect";
  const clientId = resourceSide ? config.resourceId : config.clientId;
  const auth = clientAuthentication(request, params, resourceSide, clientId);
  if ("reason" in auth) {
    const status = auth.method === "multiple" ? 400 : 401;
    if (path === "/token") stageOneClientAuth(status, auth.method, auth.reason);
    return status === 400 ? fail(400, "invalid_request") : fail(401, "invalid_client");
  }
  const authenticated = await verifyConfidentialClient(auth.authorization, clientId,
    resourceSide ? config.resourceSecretHash : config.secretHash);
  if (path === "/token") {
    const reason = authenticated ? "accepted" : auth.method === "post" ? "secret_mismatch" : "basic_rejected";
    stageOneClientAuth(authenticated ? 200 : 401, auth.method, reason);
  }
  if (!authenticated) return fail(401, "invalid_client");
  // Edge-location budgets protect costly public authenticated token/revoke
  // operations. Introspection uses a separate service binding and must not
  // share a public IP bucket. Client authentication precedes admission.
  if (path === "/token" || path === "/revoke") {
    const denied = await requireIngressBudget(request, env.ISSUER_INGRESS_LIMIT,
      path === "/token" ? "token" : "revoke");
    if (denied) { observe(env, denied.status === 429 ? "rate_limit_denied" : "issuer_unavailable", "issuer"); return denied; }
  }
  // A failed client-authentication attempt cannot spend the legitimate client's
  // token, inspection or emergency revocation quota. Edge/source abuse controls
  // are still required, including at the resource's public MCP ingress.
  // Inactive public bearer guesses must not consume the active editor's shared
  // read quota. The authenticated validator still checks every token at its DO;
  // local ingress controls bound requests before that service call.
  if (!resourceSide) await admit(env, config, path.slice(1) as "token" | "revoke");
  const accessBinding = stageOneContext(accessContext(config.issuer, config.clientId, config.audience), config.windowExpiresAt);
  if (path === "/token") {
    const isCode = params.get("grant_type") === "authorization_code";
    if (!isCode && (editorStageOne || params.get("grant_type") !== "refresh_token")) return fail(400, "unsupported_grant_type");
    const optional = !isCode || editorStageOne ? ["resource", "scope"] : ["resource"];
    if (!parameters(params, isCode ? ["grant_type", "code", "redirect_uri", "code_verifier"] :
      ["grant_type", "refresh_token"], optional)) return fail(400, "invalid_request");
    if (params.has("resource") && params.get("resource") !== config.audience) return fail(400, "invalid_target");
    if (params.has("scope") && params.get("scope") !== SCOPE) return fail(400, "invalid_scope");
    const routed = await routeBoundCredential(params.get(isCode ? "code" : "refresh_token")!, isCode ? "code" : "refresh");
    if (!routed) return fail(400, "invalid_grant");
    const grant = stub(env, routed.grantId);
    const access = await mintAdmittedCredential(routed.grantId, "access", env.ISSUER_ADMISSION_KEY,
      accessBinding, config.windowExpiresAt);
    const refresh = mintBoundCredential(routed.grantId, "refresh");
    const issued = { expected: await grantBinding(env, config), refreshHash: await sha256Hex(refresh), accessHash: await sha256Hex(access), now: now() };
    let accepted: boolean;
    if (isCode) {
      if (!/^[A-Za-z0-9._~-]{43,128}$/.test(params.get("code_verifier")!)) return fail(400, "invalid_grant");
      // Also require the current registration, even if configuration changed since consent.
      if (params.get("redirect_uri") !== CHATGPT_REDIRECT_URI) return fail(400, "invalid_grant");
      accepted = await grant.exchangeCode({ ...issued, codeHash: routed.credentialHash,
        challenge: await s256(params.get("code_verifier")!), redirectUri: CHATGPT_REDIRECT_URI });
    } else accepted = await grant.refresh({ ...issued, presentedHash: routed.credentialHash });
    if (!isCode) securityEvent("issuer", accepted ? "refresh_succeeded" : "refresh_failed", "token", accepted ? 200 : 400);
    if (!accepted) { if (!isCode) observe(env, "refresh_denied", "issuer"); return fail(400, "invalid_grant"); }
    if (config.windowExpiresAt !== undefined) {
      const remaining = config.windowExpiresAt - now();
      if (remaining <= 0) return stageOneClosed();
      return json({ access_token: access, token_type: "Bearer", expires_in: remaining, scope: SCOPE });
    }
    return json({ access_token: access, refresh_token: refresh, token_type: "Bearer", expires_in: 900, scope: SCOPE });
  }
  if (path === "/introspect") {
    if (!parameters(params, ["token", "token_type_hint"], ["request_cost"]) || params.get("token_type_hint") !== "access_token")
      return fail(400, "invalid_request");
    const cost = params.get("request_cost") ?? "0";
    if (!/^(?:0|[1-9][0-9]{0,2})$/.test(cost) || Number(cost) > 201) return fail(400, "invalid_request");
    const token = params.get("token")!;
    const proof = await verifyAccessAdmission(token, env.ISSUER_ADMISSION_KEY, accessBinding);
    const routed = proof ? await routeBoundCredential(token, "access") : null;
    const active = routed && await stub(env, routed.grantId).inspect({ expected: await grantBinding(env, config),
      accessHash: routed.credentialHash, now: now() });
    if (active) {
      await admit(env, config, "introspect");
      if (Number(cost)) await admit(env, config, "storage", Number(cost));
    }
    return json(active ? { active: true, scope: SCOPE, aud: config.audience,
      iss: config.issuer, client_id: config.clientId, exp: active.expiresAt } : { active: false });
  }
  if (!parameters(params, ["token"], ["token_type_hint"])) return fail(400, "invalid_request");
  // A hint is advisory; search both supported credential kinds.
  for (const kind of ["access", "refresh"] as const) {
    const routed = await routeBoundCredential(params.get("token")!, kind);
    if (routed) await stub(env, routed.grantId).revoke({ expected: await grantBinding(env, config),
      credentialHash: routed.credentialHash, kind });
  }
  securityEvent("issuer", "revocation_succeeded", "revoke", 200);
  return new Response(null, { status: 200, headers: headers() });
}

export function createIssuerCandidate(dependencies: { githubTransport?: IssuerGitHubTransport } = {}) {
  const handler = {
    async fetch(request: Request, env: Env): Promise<Response> {
      try {
        const deadline = editorStageOne ? stageOneDeadline(env) : undefined;
        if (editorStageOne && (deadline === undefined || env.ISSUER_ORIGIN !== isolatedEditor.issuer ||
            env.ISSUER_AUDIENCE !== isolatedEditor.audience || env.ISSUER_CLIENT_ID !== isolatedEditor.clientId)) return stageOneClosed();
        const config = configuration(env, deadline);
        const url = new URL(request.url);
        if (url.origin !== config.issuer) return fail(421, "wrong_origin");
        if (request.url.length > 8192) return fail(414, "request_too_large");
        const origin = request.headers.get("Origin");
        if (origin !== null && origin !== config.issuer) return fail(403, "origin_not_allowed");
        if (["GET", "POST"].includes(request.method) && url.pathname === "/authorize" && (request.method === "GET" || !url.search))
          return await authorize(request, env, config);
        if (request.method === "GET" && url.pathname === "/oauth/callback")
          return await callback(request, env, config, dependencies.githubTransport);
        if (url.search) return fail(400, "invalid_request");
        if (request.method === "POST" && url.pathname === "/consent") return await consent(request, env, config);
        if (request.method === "POST" && ["/token", "/introspect", "/revoke"].includes(url.pathname))
          return await clientEndpoint(request, env, config, url.pathname);
        if (request.method === "GET" && url.pathname === ISSUER_METADATA_PATH)
          return json(editorIssuerMetadata(config.issuer, editorStageOne));
        return fail(404, "not_found");
      } catch (error) {
        if (error instanceof RateLimitError) {
          observe(env, "rate_limit_denied", "issuer");
          const response = json({ error: "rate_limited" }, 429);
          response.headers.set("Retry-After", String(error.retryAfter));
          return response;
        }
        if (error instanceof PolicyError && error.status === 401) observe(env, "authentication_denied", "issuer");
        if (new URL(request.url).pathname === "/revoke") observe(env, "revocation_failed", "issuer");
        if (!(error instanceof PolicyError) || error.status >= 500) observe(env, "issuer_unavailable", "issuer");
        return error instanceof PolicyError ? json({ error: error.publicCode }, error.status)
          : json({ error: "issuer_unavailable" }, 503);
      }
    },
  };
  return { async fetch(request: Request, env: Env): Promise<Response> {
    const response = await handler.fetch(request, env);
    const path = new URL(request.url).pathname;
    if (editorStageOne && stageOneDeadline(env) === undefined) return stageOneClosed();
    if (editorStageOne && request.method === "POST" && path === "/token") stageOneEvent("token", response.status);
    observeResponse("issuer", path, response.status);
    return response;
  } };
}
export default createIssuerCandidate();
