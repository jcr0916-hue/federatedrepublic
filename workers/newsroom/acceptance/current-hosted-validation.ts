/** DISPOSABLE binding-only scheduled validation for frozen PR318 source.
 * Synthetic DO transitions are explicitly not GitHub/browser consent evidence.
 * No HTTP administration; raw credentials/tokens never enter results or logs.
 */
import { DurableObject } from "cloudflare:workers";
import type { IssuerGrant } from "../src/issuer-grant.ts";
import type { IssuerGuard } from "../src/issuer-guard.ts";
import { mintBoundCredential, mintGrantId, sha256Hex } from "../prototype/issuer-boundary.ts";
import { mintAdmittedCredential } from "../src/access-admission.ts";
import { s256 } from "../src/policy.ts";
interface Env {
  RUN: DurableObjectNamespace<CurrentValidation>;
  ISSUER_GRANTS: DurableObjectNamespace<IssuerGrant>;
  ISSUER_GUARD: DurableObjectNamespace<IssuerGuard>;
  ISSUER: Fetcher; RESOURCE: Fetcher; RESULTS: KVNamespace;
  CLIENT_SECRET: string; VALIDATOR_SECRET: string; SESSION_KEY: string; TURNSTILE_SECRET: string;
}
const ISSUER = "https://newsroom-current-issuer-20261109.jcr0916.workers.dev";
const AUDIENCE = "https://newsroom-current-resource-20261109.jcr0916.workers.dev/mcp";
const CLIENT = "newsroom-current-client-20261109", VALIDATOR = "newsroom-current-validator-20261109";
const REDIRECT = "https://newsroom-current-client-20261109.jcr0916.workers.dev/callback";
const VERIFIER = "current-candidate-private-synthetic-verifier-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
type Tokens = { access_token: string; refresh_token: string; expires_in: number };
export class CurrentValidation extends DurableObject<Env> {
  async run() {
    if (this.ctx.storage.kv.get("started")) return;
    this.ctx.storage.kv.put("started", true);
    await this.ctx.storage.setAlarm(Date.now() + 3600_000);
    const checks: { check: string; pass: boolean }[] = [];
    const check = (name: string, pass: boolean) => { checks.push({ check: name, pass }); };
    const env = this.env, guard = env.ISSUER_GUARD.getByName(CLIENT);
    const post = (path: string, fields: Record<string, string>, validator = false) => env.ISSUER.fetch(ISSUER + path, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa((validator ? VALIDATOR : CLIENT) + ":" + (validator ? env.VALIDATOR_SECRET : env.CLIENT_SECRET)) },
      body: new URLSearchParams(fields),
    });
    const rpc = (access: string, method = "server/discover", params?: unknown) => env.RESOURCE.fetch(AUDIENCE, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + access },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, ...(params ? { params } : {}) }),
    });
    const active = async (token: string) => {
      const r = await post("/introspect", { token, token_type_hint: "access_token" }, true);
      const j = await r.json() as { active: boolean; aud?: string; scope?: string };
      return r.status === 200 && j.active === true && j.aud === AUDIENCE && j.scope === "newsroom:read";
    };
    const freshCode = async () => {
      const id = mintGrantId(), grant = env.ISSUER_GRANTS.getByName(id), time = Math.floor(Date.now() / 1000);
      const expected = { clientId: CLIENT, editorId: "279336870", audience: AUDIENCE, epoch: await guard.currentEpoch(),
        redirectUri: REDIRECT, clientState: "synthetic-state-not-browser-proof", challenge: await s256(VERIFIER) };
      const context = "issuer-browser:v1\n" + ISSUER;
      const browser = await mintAdmittedCredential(id, "browser", env.SESSION_KEY, context);
      const state = await mintAdmittedCredential(id, "state", env.SESSION_KEY, context);
      if (!await grant.start({ binding: expected, browserHash: await sha256Hex(browser), upstreamHash: await sha256Hex(state),
        verifier: mintGrantId(), now: time })) throw new Error("synthetic_start");
      if (!await grant.claimUpstream({ browserHash: await sha256Hex(browser), upstreamHash: await sha256Hex(state), expected, now: time }))
        throw new Error("synthetic_claim");
      const successor = mintBoundCredential(id, "browser"), csrf = mintGrantId();
      if (!await grant.authenticate({ browserHash: await sha256Hex(browser), verifiedEditorId: "279336870",
        successorBrowserHash: await sha256Hex(successor), csrfHash: await sha256Hex(csrf), now: time })) throw new Error("synthetic_identity");
      const code = mintBoundCredential(id, "code");
      if (!await grant.finishConsent({ browserHash: await sha256Hex(successor), csrfHash: await sha256Hex(csrf),
        approve: true, codeHash: await sha256Hex(code), expected, now: time })) throw new Error("synthetic_consent");
      return code;
    };
    const exchange = (code: string) => post("/token", { grant_type: "authorization_code", code, redirect_uri: REDIRECT,
      code_verifier: VERIFIER, resource: AUDIENCE });
    const fresh = async () => { const r = await exchange(await freshCode());
      if (r.status !== 200) throw new Error("exchange_failed"); return await r.json() as Tokens; };
    const refresh = (token: string) => post("/token", { grant_type: "refresh_token", refresh_token: token, resource: AUDIENCE });
    try {
      const discovery = await env.ISSUER.fetch(ISSUER + "/.well-known/oauth-authorization-server");
      const dm = await discovery.json() as { issuer?: string; code_challenge_methods_supported?: string[] };
      check("current-issuer-discovery", discovery.status === 200 && dm.issuer === ISSUER && !!dm.code_challenge_methods_supported?.includes("S256"));
      const metadata = await env.RESOURCE.fetch(new URL("/.well-known/oauth-protected-resource/mcp", AUDIENCE));
      check("current-resource-discovery", metadata.status === 200 && (await metadata.json() as { resource?: string }).resource === AUDIENCE);
      check("wrong-issuer-origin-denied", (await env.ISSUER.fetch("https://outside.invalid/.well-known/oauth-authorization-server")).status === 421);
      check("forged-bearer-denied", (await rpc("invalid-test-token")).status === 401);
      const p = new URLSearchParams({ response_type: "code", client_id: CLIENT, redirect_uri: REDIRECT, scope: "newsroom:read",
        resource: AUDIENCE, state: "synthetic-browser-probe", code_challenge: await s256(VERIFIER), code_challenge_method: "S256" });
      const page = await env.ISSUER.fetch(ISSUER + "/authorize?" + p);
      const html = await page.text(), cookie = page.headers.get("Set-Cookie") ?? "";
      check("real-widget-interstitial", page.status === 200 && html.includes("0x4AAAAAAF6ssiEhk1gj8QlU") && html.includes("newsroom_login"));
      check("admission-cookie-preserved", cookie.includes("__Host-newsroom-admission=") && cookie.includes("Secure") && cookie.includes("HttpOnly") && cookie.includes("SameSite=Lax") && cookie.includes("Max-Age=300"));
      check("challenge-csp-preserved", !!page.headers.get("Content-Security-Policy")?.includes("frame-ancestors 'none'"));
      const rejected = await env.ISSUER.fetch(ISSUER + "/authorize", { method: "POST", headers: {
        "Content-Type": "application/x-www-form-urlencoded", Origin: ISSUER, Cookie: cookie.split(";")[0] },
        body: new URLSearchParams({ authorization: p.toString(), "cf-turnstile-response": "XXXX.DUMMY.TOKEN.XXXX" }) });
      check("current-backend-dummy-turnstile-denied", rejected.status === 403 && (await rejected.json() as { error?: string }).error === "challenge_rejected");
      const site = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", redirect: "manual",
        signal: AbortSignal.timeout(10_000), body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: "XXXX.DUMMY.TOKEN.XXXX" }) });
      const sj = await site.json() as { success: boolean; "error-codes"?: string[] };
      check("real-siteverify-secret-valid-dummy-invalid", site.status === 200 && sj.success === false && !!sj["error-codes"]?.includes("invalid-input-response") && !sj["error-codes"]?.includes("invalid-input-secret"));
      check("client-cannot-introspect", (await post("/introspect", { token: "invalid-test-token" })).status === 401);
      check("validator-cannot-issue", (await post("/token", { grant_type: "refresh_token", refresh_token: "invalid-test-token" }, true)).status === 401);
      const a = await fresh();
      check("synthetic-code-current-issuer-issues", a.expires_in === 900 && !!a.access_token && !!a.refresh_token);
      check("synthetic-access-current-validator-active", await active(a.access_token));
      check("synthetic-resource-admission-and-introspection", (await rpc(a.access_token)).status === 200);
      check("resource-submit-denied", (await rpc(a.access_token, "tools/call", { name: "newsroom_submit", arguments: {} })).status === 403);
      const s3 = await rpc(a.access_token, "tools/call", { name: "newsroom_list", arguments: { desk: "korda", limit: 1 } });
      check("missing-s3-credentials-fail-closed", s3.status === 503 && (await s3.json() as { error?: string }).error === "resource_unavailable");
      const rotation = await refresh(a.refresh_token), b = await rotation.json() as Tokens;
      check("synthetic-refresh-rotation", rotation.status === 200 && b.access_token !== a.access_token && b.refresh_token !== a.refresh_token);
      check("rotated-predecessor-access-inactive", !await active(a.access_token));
      check("rotated-successor-active", await active(b.access_token));
      check("spent-refresh-rejected", (await refresh(a.refresh_token)).status === 400);
      check("replay-invalidates-successor-access", !await active(b.access_token));
      check("replay-invalidates-successor-refresh", (await refresh(b.refresh_token)).status === 400);
      const c = await fresh();
      check("voluntary-revoke-accepted", (await post("/revoke", { token: c.refresh_token })).status === 200);
      check("revoked-access-inactive", !await active(c.access_token));
      check("revoked-refresh-denied", (await refresh(c.refresh_token)).status === 400);
      const raw = await freshCode(), issued = await exchange(raw);
      check("first-code-redemption-succeeds", issued.status === 200);
      const it = await issued.json() as Tokens;
      check("code-replay-denied", (await exchange(raw)).status === 400);
      check("code-replay-revokes-family", !await active(it.access_token));
      const d = await fresh(), epoch = await guard.currentEpoch();
      const results = await Promise.all([guard.invalidateAll(epoch), guard.invalidateAll(epoch)]);
      check("containment-single-cas-winner", results.filter(r => r.changed).length === 1);
      check("containment-access-denied", !await active(d.access_token));
      check("containment-refresh-denied", (await refresh(d.refresh_token)).status === 400);
      const e = await fresh();
      check("fresh-grant-after-containment", await active(e.access_token));
      check("stale-containment-no-change", !(await guard.invalidateAll(epoch)).changed);
      check("stale-containment-preserves-new-grant", await active(e.access_token));
      await guard.invalidateAll(await guard.currentEpoch());
    } catch { check("unexpected-failure-redacted", false); }
    await env.RESULTS.put("current-validation", JSON.stringify({ schemaVersion: 1, sourceCommit: "d7c65bea969be9bebe541a7bb1e069928e12c60c",
      success: checks.length > 0 && checks.every(c => c.pass), checks, syntheticGrantTransitions: true,
      limitations: ["GitHub App not configured; no real GitHub/browser consent", "positive Turnstile and replay pending human browser",
        "S3 token creation denied by connector permissions; no successful hosted S3 read asserted", "not regional recovery or external security approval"] }), { expirationTtl: 604800 });
  }
  async alarm() { await this.ctx.storage.deleteAll(); }
}
export default {
  fetch() { return new Response(null, { status: 404 }); },
  scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) { ctx.waitUntil(env.RUN.getByName("current-20261109-v1").run()); },
};
