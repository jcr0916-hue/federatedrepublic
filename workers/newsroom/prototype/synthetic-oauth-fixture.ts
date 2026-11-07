/**
 * SYNTHETIC TEST FIXTURE — NEVER DEPLOY.
 * The test-only /issue bypasses GitHub login, consent and PKCE. It is not an
 * OAuth authorization server. No real credentials or production bindings.
 */
export { SyntheticOAuthGrant } from "./synthetic-oauth-grant.ts";
import type { SyntheticOAuthGrant } from "./synthetic-oauth-grant.ts";

interface FixtureEnv {
  SYNTHETIC_GRANTS: DurableObjectNamespace<SyntheticOAuthGrant>;
}

const CLIENT = "synthetic-newsroom-editor";
const SECRET = "synthetic-local-fixture-client-secret";
const EDITOR = "synthetic-editor-12345";
const AUDIENCE = "https://synthetic.newsroom.invalid/mcp";
const REDIRECT = "https://chatgpt.invalid/oauth/callback";
const ACCESS_TTL = 900;
const REFRESH_TTL = 7200;

const token = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte =>
  byte.toString(16).padStart(2, "0")).join("");
const digest = async (raw: string) => Array.from(new Uint8Array(
  await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw)),
), byte => byte.toString(16).padStart(2, "0")).join("");

type RequestBody = {
  action?: string; grant?: string; clientId?: string; clientSecret?: string;
  refreshToken?: string; accessToken?: string; scope?: string;
  audience?: string; now?: number; requestedScope?: string;
  redirectUri?: string; codeChallenge?: string; code?: string; codeVerifier?: string;
};

export default {
  async fetch(request: Request, env: FixtureEnv): Promise<Response> {
    if (request.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405 });
    let params: RequestBody;
    try { params = await request.json() as RequestBody; }
    catch { return Response.json({ error: "invalid_request" }, { status: 400 }); }
    if (typeof params.grant !== "string" || !/^[a-z0-9-]{1,64}$/.test(params.grant)) {
      return Response.json({ error: "invalid_grant" }, { status: 400 });
    }
    if (params.clientId !== CLIENT || params.clientSecret !== SECRET) {
      return Response.json({ error: "invalid_client" }, { status: 401 });
    }
    const now = params.now;
    if (!Number.isSafeInteger(now) || (now as number) < 0) {
      return Response.json({ error: "invalid_request" }, { status: 400 });
    }
    const stub = env.SYNTHETIC_GRANTS.get(env.SYNTHETIC_GRANTS.idFromName(params.grant));
    // These test-only actions model pre-approved identity + consent. They are
    // deliberately NOT browser OAuth endpoints, and must never be deployed.
    if (params.action === "begin_code") {
      if (params.audience !== AUDIENCE || params.redirectUri !== REDIRECT ||
          params.scope !== "newsroom:read" ||
          typeof params.codeChallenge !== "string" ||
          !/^[A-Za-z0-9_-]{43}$/.test(params.codeChallenge)) {
        return Response.json({ error: "invalid_authorization_request" }, { status: 400 });
      }
      const code = token();
      const started = await stub.beginCode({
        codeHash: await digest(code), challenge: params.codeChallenge,
        clientId: CLIENT, audience: AUDIENCE, redirectUri: REDIRECT,
        scopes: ["newsroom:read"], now: now as number, ttl: 300,
      });
      return Response.json(started ? { code, expires_in: 300 } : { error: "invalid_grant" },
        { status: started ? 200 : 400 });
    }
    if (params.action === "exchange_code") {
      if (typeof params.code !== "string" || !/^[0-9a-f]{64}$/.test(params.code) ||
          typeof params.codeVerifier !== "string" ||
          !/^[A-Za-z0-9_-]{43,128}$/.test(params.codeVerifier) ||
          params.redirectUri !== REDIRECT || params.audience !== AUDIENCE) {
        return Response.json({ error: "invalid_grant" }, { status: 400 });
      }
      const pkceDigest = new Uint8Array(await crypto.subtle.digest(
        "SHA-256", new TextEncoder().encode(params.codeVerifier),
      ));
      const computedChallenge = btoa(Array.from(pkceDigest, byte =>
        String.fromCharCode(byte)).join("")).replace(/\\+/g, "-").replace(/\\//g, "_").replace(/=+$/, "");
      const refreshToken = token(), accessToken = token();
      const result = await stub.exchangeCode({
        codeHash: await digest(params.code), computedChallenge,
        clientId: CLIENT, audience: AUDIENCE, redirectUri: REDIRECT,
        editorId: EDITOR, refreshHash: await digest(refreshToken),
        accessHash: await digest(accessToken), now: now as number,
        refreshTTL: REFRESH_TTL, accessTTL: ACCESS_TTL,
      });
      return Response.json(result.ok ? {
        token_type: "Bearer", scope: "newsroom:read", expires_in: ACCESS_TTL,
        access_token: accessToken, refresh_token: refreshToken, generation: result.generation,
      } : { error: result.error }, { status: result.ok ? 200 : 400 });
    }
    if (params.action === "issue") {
      if (params.audience !== AUDIENCE || params.scope !== "newsroom:read") {
        return Response.json({ error: "invalid_scope_or_audience" }, { status: 400 });
      }
      const refreshToken = token(), accessToken = token();
      const result = await stub.issue({
        clientId: CLIENT, editorId: EDITOR, audience: AUDIENCE,
        scopes: ["newsroom:read"], refreshHash: await digest(refreshToken),
        accessHash: await digest(accessToken), now: now as number,
        refreshTTL: REFRESH_TTL, accessTTL: ACCESS_TTL,
      });
      return Response.json(result.ok ? {
        token_type: "Bearer", scope: "newsroom:read", expires_in: ACCESS_TTL,
        access_token: accessToken, refresh_token: refreshToken, generation: result.generation,
      } : { error: result.error }, { status: result.ok ? 200 : 400 });
    }
    if (params.action === "refresh") {
      if (typeof params.refreshToken !== "string" || !/^[0-9a-f]{64}$/.test(params.refreshToken)) {
        return Response.json({ error: "invalid_grant" }, { status: 400 });
      }
      const refreshToken = token(), accessToken = token();
      const result = await stub.refresh({
        clientId: CLIENT, presentedHash: await digest(params.refreshToken),
        successorHash: await digest(refreshToken), accessHash: await digest(accessToken),
        now: now as number, accessTTL: ACCESS_TTL,
      });
      return Response.json(result.ok ? {
        token_type: "Bearer", scope: "newsroom:read", expires_in: ACCESS_TTL,
        access_token: accessToken, refresh_token: refreshToken, generation: result.generation,
      } : { error: result.error === "replay" ? "invalid_grant" : result.error },
      { status: result.ok ? 200 : 400 });
    }
    if (params.action === "authorize") {
      if (typeof params.accessToken !== "string" || !/^[0-9a-f]{64}$/.test(params.accessToken)) {
        return Response.json({ authorized: false });
      }
      return Response.json({ authorized: await stub.authorize({
        clientId: CLIENT, accessHash: await digest(params.accessToken),
        audience: params.audience ?? "", requiredScope: params.requestedScope ?? "",
        now: now as number,
      }) });
    }
    if (params.action === "revoke") return Response.json({ revoked: await stub.revoke() });
    return Response.json({ error: "unknown_action" }, { status: 400 });
  },
};
