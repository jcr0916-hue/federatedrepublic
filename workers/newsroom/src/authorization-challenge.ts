/** Turnstile admission before any login quota/state allocation. Siteverify is
 * authoritative and one-use; the challenge binds the exact request to a host
 * cookie using cdata. No per-visitor backend state or sensitive logging. */
import { mintGrantId, sha256Hex } from "../prototype/issuer-boundary.ts";
import { boundedText, PolicyError } from "./policy.ts";
import { securityEvent } from "./security-events.ts";
const COOKIE = "__Host-newsroom-admission";
const ACTION = "newsroom_login";
export const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export interface ChallengeConfig { ISSUER_TURNSTILE_SITE_KEY: string; ISSUER_TURNSTILE_SECRET: string }
const escape = (value: string) => value.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
function configured(env: ChallengeConfig) {
  if (typeof env.ISSUER_TURNSTILE_SITE_KEY !== "string" || !/^[A-Za-z0-9_-]{3,128}$/.test(env.ISSUER_TURNSTILE_SITE_KEY) ||
      typeof env.ISSUER_TURNSTILE_SECRET !== "string" || env.ISSUER_TURNSTILE_SECRET.length < 20 || env.ISSUER_TURNSTILE_SECRET.length > 256)
    throw new PolicyError(503, "challenge_not_configured");
}
export async function challengePage(params: URLSearchParams, env: ChallengeConfig): Promise<Response> {
  configured(env);
  const session = mintGrantId(), authorization = params.toString();
  const cdata = await sha256Hex(session + "\n" + authorization);
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Newsroom sign-in</title>
<h1>Continue to newsroom sign-in</h1><p>Complete the browser check, then continue to GitHub.</p>
<form method="post" action="/authorize"><input type="hidden" name="authorization" value="${escape(authorization)}">
<div class="cf-turnstile" data-sitekey="${env.ISSUER_TURNSTILE_SITE_KEY}" data-action="${ACTION}" data-cdata="${cdata}"></div>
<button type="submit">Continue</button></form><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script></html>`, {
    // The form needs its same-origin Origin header. Cross-origin requests still omit Referer.
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; script-src https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; style-src 'unsafe-inline'; form-action 'self' https://github.com; frame-ancestors 'none'; base-uri 'none'",
      "Set-Cookie": `${COOKIE}=${session}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=300` },
  });
}
export async function verifyAuthorizationChallenge(request: Request, params: URLSearchParams, token: string, env: ChallengeConfig): Promise<void> {
  configured(env);
  const cookies = (request.headers.get("Cookie") ?? "").split(";").map(s => s.trim()).filter(s => s.startsWith(COOKIE + "="));
  const session = cookies.length === 1 ? cookies[0].slice(COOKIE.length + 1) : "";
  if (!/^[a-f0-9]{64}$/.test(session) || !token || token.length > 2048) throw new PolicyError(403, "challenge_rejected");
  let accepted = false;
  try {
    const response = await fetch(SITEVERIFY, { method: "POST", redirect: "manual", signal: AbortSignal.timeout(5000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: env.ISSUER_TURNSTILE_SECRET, response: token }) });
    const result = JSON.parse(await boundedText(response.body, 4096));
    accepted = response.status === 200 && result?.success === true && result.action === ACTION &&
      result.hostname === new URL(request.url).hostname && result.cdata === await sha256Hex(session + "\n" + params.toString());
  } catch { /* Upstream exceptions/bodies are deliberately discarded. */ }
  if (!accepted) {
    securityEvent("issuer", "challenge_rejected", "authorize", 403, 0.01);
    throw new PolicyError(403, "challenge_rejected");
  }
}
