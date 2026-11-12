import {
  editorBearerChallenge,
  editorIssuerMetadata,
  editorResourceMetadata,
  ISSUER_METADATA_PATH,
  RESOURCE_METADATA_PATH,
} from "./editor-oauth-metadata.ts";

const ISSUER = "https://newsroom-editor-isolated-issuer-20261111.jcr0916.workers.dev";
const GATEWAY = "https://newsroom-editor-isolated-gateway-20261111.jcr0916.workers.dev";
const MAX_WINDOW_MS = 5 * 60_000;

interface DiscoveryEnv {
  EDITOR_DISCOVERY_EXPIRES_AT?: string;
}

const headers = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function discoveryPath(request: Request, env: DiscoveryEnv, origin: string): string | null {
  const expiry = env.EDITOR_DISCOVERY_EXPIRES_AT;
  if (typeof expiry !== "string" || !/^\d{13}$/.test(expiry)) return null;
  const remaining = Number(expiry) - Date.now();
  if (remaining <= 0 || remaining > MAX_WINDOW_MS) return null;
  const url = new URL(request.url);
  return url.origin === origin && !url.search ? url.pathname : null;
}

export const issuerDiscovery = {
  fetch(request: Request, env: DiscoveryEnv): Response {
    if (request.method === "GET" && discoveryPath(request, env, ISSUER) === ISSUER_METADATA_PATH) {
      return Response.json(editorIssuerMetadata(ISSUER), { headers });
    }
    return new Response(null, { status: 404, headers });
  },
};

export const gatewayDiscovery = {
  fetch(request: Request, env: DiscoveryEnv): Response {
    const path = discoveryPath(request, env, GATEWAY);
    if (request.method === "GET" &&
        (path === RESOURCE_METADATA_PATH || path === RESOURCE_METADATA_PATH + "/mcp")) {
      return Response.json(editorResourceMetadata(GATEWAY + "/mcp", ISSUER), { headers });
    }
    if (path === "/mcp" && (request.method === "GET" || request.method === "POST")) {
      // The challenge is the only response at /mcp, regardless of credentials or the request body.
      return Response.json({ error: "invalid_token" }, {
        status: 401,
        headers: {
          ...headers,
          "WWW-Authenticate": editorBearerChallenge(GATEWAY + RESOURCE_METADATA_PATH + "/mcp"),
        },
      });
    }
    return new Response(null, { status: 404, headers });
  },
};
