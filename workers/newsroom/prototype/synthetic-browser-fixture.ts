/**
 * LOCAL-ONLY BROWSER SECURITY FIXTURE. NEVER DEPLOY.
 *
 * Models cookie-bound consent, GitHub redirects and identity callbacks.
 * GitHub transport is supplied by the local test runtime; it never calls
 * real GitHub or registers an OAuth client. No test administration actions.
 */
export { SyntheticOAuthGrant } from "./synthetic-oauth-grant.ts";
import type { SyntheticOAuthGrant } from "./synthetic-oauth-grant.ts";

interface BrowserEnv {
  SYNTHETIC_GRANTS: DurableObjectNamespace<SyntheticOAuthGrant>;
  GITHUB: Fetcher;
}
const ORIGIN = "https://synthetic.newsroom.invalid";
const CLIENT = "synthetic-newsroom-editor";
const EDITOR = "synthetic-editor-12345";
const AUDIENCE = ORIGIN + "/mcp";
const REDIRECT = "https://chatgpt.invalid/oauth/callback";
const COOKIE = "__Host-newsroom-consent";
const PKCE = /^[A-Za-z0-9_-]{43}$/;
const GRANT = /^[a-z0-9-]{1,64}$/;
const SESSION = /^[a-f0-9]{64}$/;
const code = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), x =>
  x.toString(16).padStart(2, "0")).join("");
const digest = async (v: string) => Array.from(new Uint8Array(await crypto.subtle.digest(
  "SHA-256", new TextEncoder().encode(v),
)), x => x.toString(16).padStart(2, "0")).join("");
const fail = (status: number, error: string) => Response.json({ error }, {
  status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
});
function cookieValue(request: Request): string | null {
  const pairs = (request.headers.get("Cookie") ?? "").split(";").map(x => x.trim());
  const matches = pairs.filter(x => x.startsWith(COOKIE + "="));
  if (matches.length !== 1) return null;
  const value = matches[0].slice(COOKIE.length + 1);
  return SESSION.test(value) ? value : null;
}
function responseHeaders(clear = false): Headers {
  const h = new Headers({
    "Cache-Control": "no-store", "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  if (clear) h.set("Set-Cookie", COOKIE + "=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0");
  return h;
}
function stubFor(env: BrowserEnv, grant: string) {
  return env.SYNTHETIC_GRANTS.get(env.SYNTHETIC_GRANTS.idFromName(grant));
}
async function githubId(env: BrowserEnv, authCode: string): Promise<string | null> {
  // The local transport only recognizes synthetic codes. Fixed endpoints and
  // manual redirects protect the fixture from accidental external egress.
  if (!/^[a-z0-9-]{1,80}$/.test(authCode)) return null;
  const tokenResponse = await env.GITHUB.fetch(new Request("https://github.com/login/oauth/access_token", {
    method: "POST", redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body: new URLSearchParams({ code: authCode, client_id: "synthetic-github-client" }),
  }));
  if (!tokenResponse.ok) return null;
  const token: unknown = await tokenResponse.json();
  if (!token || typeof token !== "object" || Array.isArray(token)) return null;
  const access = (token as { access_token?: unknown }).access_token;
  if (typeof access !== "string" || !/^[a-z0-9-]{1,128}$/.test(access)) return null;
  const userResponse = await env.GITHUB.fetch(new Request("https://api.github.com/user", {
    redirect: "manual", headers: { Authorization: "Bearer " + access, Accept: "application/json" },
  }));
  if (!userResponse.ok) return null;
  const user: unknown = await userResponse.json();
  if (!user || typeof user !== "object" || Array.isArray(user)) return null;
  const id = (user as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
}
export default {
  async fetch(request: Request, env: BrowserEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.origin !== ORIGIN) return fail(421, "wrong_origin");
    const grant = url.searchParams.get("grant");
    if (!grant || !GRANT.test(grant)) return fail(400, "invalid_grant");
    const now = 1794040000; // fixed synthetic clock; NOT real time validation
    const stub = stubFor(env, grant);
    if (url.pathname === "/authorize" && request.method === "GET") {
      const client = url.searchParams.get("client_id");
      const challenge = url.searchParams.get("code_challenge");
      if (client !== CLIENT || url.searchParams.get("scope") !== "newsroom:read" ||
          url.searchParams.get("resource") !== AUDIENCE ||
          url.searchParams.get("redirect_uri") !== REDIRECT ||
          !challenge || !PKCE.test(challenge) ||
          url.searchParams.get("code_challenge_method") !== "S256" ||
          url.searchParams.getAll("state").length !== 1 ||
          !SESSION.test(url.searchParams.get("state") ?? "")) {
        return fail(400, "invalid_authorization_request");
      }
      // Distinct random browser cookie, not exposed in HTML or returned to OAuth client.
      const browser = code();
      const state = url.searchParams.get("state")!;
      const started = await stub.startConsent({
        browserHash: await digest(browser), stateHash: await digest(state),
        challenge, clientId: CLIENT, audience: AUDIENCE,
        redirectUri: REDIRECT, scopes: ["newsroom:read"], now, ttl: 300,
      });
      if (!started) return fail(400, "authorization_in_progress");
      const h = responseHeaders();
      h.set("Content-Type", "text/html; charset=utf-8");
      h.set("Content-Security-Policy",
        "default-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
      h.set("Set-Cookie", COOKIE + "=" + browser +
        "; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=300");
      const form = new URLSearchParams({ grant });
      return new Response('<!doctype html><html><form method="post" action="/consent?' +
        form.toString() + '"><button name="decision" value="approve">Approve</button>' +
        '<button name="decision" value="deny">Deny</button></form></html>',
        { headers: h });
    }
    if (url.pathname === "/consent" && request.method === "POST") {
      if (request.headers.get("Origin") !== ORIGIN) return fail(403, "origin_not_allowed");
      const browser = cookieValue(request);
      if (!browser) return fail(403, "browser_session_required");
      if (request.headers.get("Content-Type")?.split(";")[0] !== "application/x-www-form-urlencoded")
        return fail(415, "unsupported_media_type");
      const raw = await request.text();
      if (raw.length > 1024) return fail(413, "body_too_large");
      const form = new URLSearchParams(raw);
      if (form.getAll("decision").length !== 1 ||
          [...form.keys()].some(x => x !== "decision")) return fail(400, "invalid_consent");
      const decision = form.get("decision");
      if (decision !== "approve" && decision !== "deny") return fail(400, "invalid_consent");
      if (decision === "deny") {
        // Explicit denial consumes pending consent, without issuing a code.
        // The callback uses the browser cookie + original OAuth state.
        const state = url.searchParams.get("state");
        if (!state || !SESSION.test(state)) return fail(400, "missing_state");
        await stub.finishConsent({
          browserHash: await digest(browser), stateHash: await digest(state),
          verifiedEditorId: EDITOR, expectedEditorId: EDITOR, decision: "deny",
          codeHash: await digest(code()), now,
        });
        return new Response(null, { status: 403, headers: responseHeaders(true) });
      }
      // Simulated redirect to GitHub; state is client-generated, not yet verified
      // by an actual GitHub upstream PKCE transaction.
      const state = url.searchParams.get("state");
      if (!state || !SESSION.test(state)) return fail(400, "missing_state");
      const location = new URL("https://github.com/login/oauth/authorize");
      location.search = new URLSearchParams({
        client_id: "synthetic-github-client", state,
        redirect_uri: ORIGIN + "/oauth/callback?grant=" + encodeURIComponent(grant),
      }).toString();
      const h = responseHeaders(); h.set("Location", location.toString());
      return new Response(null, { status: 302, headers: h });
    }
    if (url.pathname === "/oauth/callback" && request.method === "GET") {
      const browser = cookieValue(request), state = url.searchParams.get("state");
      const upstreamCode = url.searchParams.get("code");
      if (!browser || !state || !SESSION.test(state) || !upstreamCode ||
          url.searchParams.getAll("state").length !== 1 ||
          url.searchParams.getAll("code").length !== 1)
        return fail(403, "callback_invalid");
      const id = await githubId(env, upstreamCode);
      if (id !== EDITOR) return fail(403, "editor_not_allowed");
      const authCode = code();
      const ok = await stub.finishConsent({
        browserHash: await digest(browser), stateHash: await digest(state),
        verifiedEditorId: id, expectedEditorId: EDITOR, decision: "approve",
        codeHash: await digest(authCode), now,
      });
      if (!ok) return fail(403, "callback_invalid");
      const destination = new URL(REDIRECT);
      destination.search = new URLSearchParams({ code: authCode, state }).toString();
      const h = responseHeaders(true); h.set("Location", destination.toString());
      return new Response(null, { status: 302, headers: h });
    }
    return fail(404, "not_found");
  },
};
