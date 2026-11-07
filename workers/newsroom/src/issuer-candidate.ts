/**
 * NONDEPLOYABLE AUTHORIZATION-SERVER CANDIDATE — deliberately incomplete.
 *
 * This independent entrypoint does not import any test fixture or alter the
 * release Worker. No authorize/consent/code issuance endpoints exist here.
 * It supports confidential-client refresh and resource-token inspection only
 * after explicit trusted configuration, and returns 404 for everything else.
 *
 * IMPORTANT: Requires a separately provisioned and authenticated grant.
 * It is NOT a full OAuth server and MUST NOT be publicly deployed.
 */
export { SyntheticOAuthGrant } from "../prototype/synthetic-oauth-grant.ts";
import type { SyntheticOAuthGrant } from "../prototype/synthetic-oauth-grant.ts";
import {
  mintBoundCredential, routeBoundCredential, sha256Hex, verifyConfidentialClient,
} from "../prototype/issuer-boundary.ts";

interface Env {
  ISSUER_CLIENT_ID: string;
  ISSUER_CLIENT_SECRET_SHA256: string;
  ISSUER_AUDIENCE: string;
  ISSUER_EDITOR_ID: string;
  ISSUER_GRANTS: DurableObjectNamespace<SyntheticOAuthGrant>;
}
const HEADERS = { "Cache-Control": "no-store", "Content-Type": "application/json" };
const deny = (status: number, error: string): Response =>
  new Response(JSON.stringify({ error }), { status, headers: HEADERS });
const exactly = (record: Record<string, unknown>, name: string): string | null => {
  const keys = Object.keys(record);
  return keys.length === 1 && keys[0] === name && typeof record[name] === "string"
    ? record[name] as string : null;
};
function configured(env: Env): boolean {
  return !!env && /^[A-Za-z0-9_-]{1,100}$/.test(env.ISSUER_CLIENT_ID) &&
    /^[a-f0-9]{64}$/.test(env.ISSUER_CLIENT_SECRET_SHA256) &&
    typeof env.ISSUER_EDITOR_ID === "string" && /^[0-9]{1,20}$/.test(env.ISSUER_EDITOR_ID) &&
    typeof env.ISSUER_AUDIENCE === "string" &&
    /^https:\/\/[a-z0-9.-]+\/mcp$/.test(env.ISSUER_AUDIENCE) &&
    !!env.ISSUER_GRANTS;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Fail closed until a separately approved issuer and authenticated browser
    // consent flow have provisioned an actual editor grant.
    if (!configured(env)) return deny(503, "issuer_not_configured");
    const url = new URL(request.url);
    if (url.search || request.method !== "POST" ||
        !["/token", "/introspect"].includes(url.pathname)) return deny(404, "not_found");
    if (!(await verifyConfidentialClient(
      request.headers.get("authorization"),
      env.ISSUER_CLIENT_ID,
      env.ISSUER_CLIENT_SECRET_SHA256,
    ))) return deny(401, "invalid_client");
    const ctype = request.headers.get("content-type")?.split(";")[0].toLowerCase();
    if (ctype !== "application/x-www-form-urlencoded") return deny(415, "unsupported_media_type");
    const bytes = await request.text();
    if (bytes.length > 4096) return deny(413, "request_too_large");
    const params = new URLSearchParams(bytes);
    const names = [...params.keys()];
    if (names.length !== new Set(names).size) return deny(400, "invalid_request");
    if (url.pathname === "/token") {
      if (names.length !== 2 || params.get("grant_type") !== "refresh_token" ||
          names.some(k => k !== "grant_type" && k !== "refresh_token")) {
        return deny(400, "unsupported_grant_type");
      }
      const presented = params.get("refresh_token");
      const routed = presented && await routeBoundCredential(presented, "refresh");
      if (!routed) return deny(400, "invalid_grant");
      const stub = env.ISSUER_GRANTS.get(env.ISSUER_GRANTS.idFromName(routed.grantId));
      const accessToken = mintBoundCredential(routed.grantId, "access");
      const refreshToken = mintBoundCredential(routed.grantId, "refresh");
      const now = Math.floor(Date.now() / 1000);
      const result = await stub.refresh({
        clientId: env.ISSUER_CLIENT_ID, presentedHash: routed.credentialHash,
        successorHash: await sha256Hex(refreshToken), accessHash: await sha256Hex(accessToken),
        now, accessTTL: 900,
      });
      return result.ok ? new Response(JSON.stringify({
        access_token: accessToken, refresh_token: refreshToken,
        token_type: "Bearer", expires_in: 900, scope: "newsroom:read",
      }), { headers: HEADERS }) : deny(400, "invalid_grant");
    }
    // Only trusted, authenticated resource-side clients may inspect access
    // credentials. The response never includes editor identity or raw token.
    if (names.length !== 2 || params.get("token_type_hint") !== "access_token" ||
        names.some(k => k !== "token_type_hint" && k !== "token")) {
      return deny(400, "invalid_request");
    }
    const token = params.get("token");
    const routed = token && await routeBoundCredential(token, "access");
    if (!routed) return new Response(JSON.stringify({ active: false }), { headers: HEADERS });
    const stub = env.ISSUER_GRANTS.get(env.ISSUER_GRANTS.idFromName(routed.grantId));
    const active = await stub.authorize({
      clientId: env.ISSUER_CLIENT_ID, accessHash: routed.credentialHash,
      audience: env.ISSUER_AUDIENCE, requiredScope: "newsroom:read",
      now: Math.floor(Date.now() / 1000),
    });
    return new Response(JSON.stringify(active
      ? { active: true, scope: "newsroom:read", aud: env.ISSUER_AUDIENCE }
      : { active: false }), { headers: HEADERS });
  },
};
