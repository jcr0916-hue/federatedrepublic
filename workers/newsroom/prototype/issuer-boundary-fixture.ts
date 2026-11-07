/**
 * LOCAL-ONLY grant-routing proof — NEVER DEPLOY.
 * Simulates an ALREADY verified editor; there is no GitHub login, PKCE or
 * OAuth token endpoint. No public/admin grant selector is accepted.
 * Synthetic client credential is intentionally test-only and NOT secret.
 */
export { SyntheticOAuthGrant } from "./synthetic-oauth-grant.ts";
import type { SyntheticOAuthGrant } from "./synthetic-oauth-grant.ts";
import {
  mintGrantId, mintBoundCredential, routeBoundCredential, sha256Hex,
  verifyConfidentialClient,
} from "./issuer-boundary.ts";

interface Env {
  SYNTHETIC_GRANTS: DurableObjectNamespace<SyntheticOAuthGrant>;
}
const CLIENT = "synthetic-editor";
const SECRET = "synthetic-only-client-secret-minimum-entropy-1234567890";
const AUDIENCE = "https://synthetic.newsroom.invalid/mcp";
const now = 1794040000;
const REFRESH_TTL = 7200, ACCESS_TTL = 900;
const invalid = (status = 401) => Response.json({ error: "unauthorized" },
  { status, headers: { "Cache-Control": "no-store" } });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST" || new URL(request.url).search) return invalid(400);
    const path = new URL(request.url).pathname;
    if (!["/issue", "/refresh", "/read", "/revoke"].includes(path)) return invalid(404);
    if (!await verifyConfidentialClient(
      request.headers.get("authorization"), CLIENT, await sha256Hex(SECRET),
    )) return invalid();
    let input: Record<string, unknown>;
    try { input = await request.json() as Record<string, unknown>; }
    catch { return invalid(400); }
    if (!input || typeof input !== "object" || Array.isArray(input) ||
        "grant" in input || "grantId" in input || "clientId" in input ||
        "editorId" in input || "scopes" in input) return invalid(400);
    if (path === "/issue") {
      if (Object.keys(input).length) return invalid(400);
      const grantId = mintGrantId();
      const accessToken = mintBoundCredential(grantId, "access");
      const refreshToken = mintBoundCredential(grantId, "refresh");
      const stub = env.SYNTHETIC_GRANTS.get(env.SYNTHETIC_GRANTS.idFromName(grantId));
      const accepted = await stub.issue({
        clientId: CLIENT, editorId: "synthetic-verified-editor",
        audience: AUDIENCE, scopes: ["newsroom:read"],
        accessHash: await sha256Hex(accessToken),
        refreshHash: await sha256Hex(refreshToken),
        now, accessTTL: ACCESS_TTL, refreshTTL: REFRESH_TTL,
      });
      return accepted.ok ? Response.json({
        access_token: accessToken, refresh_token: refreshToken,
        token_type: "Bearer", scope: "newsroom:read",
      }) : invalid(400);
    }
    if (path === "/refresh") {
      if (Object.keys(input).join() !== "refresh_token" ||
          typeof input.refresh_token !== "string") return invalid(400);
      const routed = await routeBoundCredential(input.refresh_token, "refresh");
      if (!routed) return invalid();
      const stub = env.SYNTHETIC_GRANTS.get(env.SYNTHETIC_GRANTS.idFromName(routed.grantId));
      const accessToken = mintBoundCredential(routed.grantId, "access");
      const refreshToken = mintBoundCredential(routed.grantId, "refresh");
      const accepted = await stub.refresh({
        clientId: CLIENT, presentedHash: routed.credentialHash,
        successorHash: await sha256Hex(refreshToken),
        accessHash: await sha256Hex(accessToken), now,
        accessTTL: ACCESS_TTL,
      });
      return accepted.ok ? Response.json({
        access_token: accessToken, refresh_token: refreshToken,
        token_type: "Bearer", scope: "newsroom:read",
      }) : invalid();
    }
    if (path === "/read" || path === "/revoke") {
      if (Object.keys(input).join() !== "access_token" ||
          typeof input.access_token !== "string") return invalid(400);
      const routed = await routeBoundCredential(input.access_token, "access");
      if (!routed) return invalid();
      const stub = env.SYNTHETIC_GRANTS.get(env.SYNTHETIC_GRANTS.idFromName(routed.grantId));
      const authorized = await stub.authorize({
        clientId: CLIENT, accessHash: routed.credentialHash,
        audience: AUDIENCE, requiredScope: "newsroom:read", now,
      });
      if (!authorized) return invalid();
      if (path === "/read") return Response.json({ authorized: true, scope: "newsroom:read" });
      return Response.json({ revoked: await stub.revoke() });
    }
    return invalid(404);
  },
};
