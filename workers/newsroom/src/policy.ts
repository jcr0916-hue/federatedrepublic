/** Application policy; legacy authorization remains the existing Worker's responsibility. */
export const READ_SCOPE = "newsroom:read";
export const REVIEW_SCOPE = "newsroom:review";
export const SCOPES = [READ_SCOPE, REVIEW_SCOPE, "offline_access"];
export const EDITOR_PRINCIPAL = Object.freeze({ desk: "editorial", editor: true });

export interface LegacyPrincipal {
  desk: string;
  editor: boolean;
}

export interface OAuthBindings {
  OAUTH_KV: KVNamespace;
  OAUTH_ISSUER: string;
  CHATGPT_CLIENT_ID: string;
  CHATGPT_REDIRECT_URI: string;
  EDITOR_GITHUB_USER_ID: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  MCP_ALLOWED_ORIGINS?: string;
}

export interface EditorGrant {
  schema: 1;
  githubUserId: string;
}

export interface OAuthConfiguration {
  issuer: string;
  resource: string;
  clientId: string;
  redirectUri: string;
  editorId: string;
  githubClientId: string;
  githubClientSecret: string;
  allowedOrigins: ReadonlySet<string>;
}

export class PolicyError extends Error {
  constructor(readonly status: number, readonly publicCode: string) {
    super(publicCode);
  }
}

function origin(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" || value !== url.origin || url.username || url.password) {
    throw new PolicyError(503, "oauth_not_configured");
  }
  return url.origin;
}

/** There are no production defaults for identity, client, redirect, or upstream secrets. */
export function configuration(env: OAuthBindings): OAuthConfiguration {
  try {
    const issuer = origin(env.OAUTH_ISSUER);
    const redirect = new URL(env.CHATGPT_REDIRECT_URI);
    if (redirect.protocol !== "https:" || redirect.username || redirect.password || redirect.hash ||
        !env.CHATGPT_CLIENT_ID || env.CHATGPT_CLIENT_ID.length > 256 ||
        !/^[1-9][0-9]{0,19}$/.test(env.EDITOR_GITHUB_USER_ID) ||
        !env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.OAUTH_KV) {
      throw new PolicyError(503, "oauth_not_configured");
    }
    const additional = (env.MCP_ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
    return {
      issuer, resource: issuer + "/mcp", clientId: env.CHATGPT_CLIENT_ID,
      redirectUri: env.CHATGPT_REDIRECT_URI, editorId: env.EDITOR_GITHUB_USER_ID,
      githubClientId: env.GITHUB_CLIENT_ID, githubClientSecret: env.GITHUB_CLIENT_SECRET,
      allowedOrigins: new Set([issuer, ...additional.map(origin)]),
    };
  } catch {
    throw new PolicyError(503, "oauth_not_configured");
  }
}

export function isEditorGrant(value: unknown, config: OAuthConfiguration): value is EditorGrant {
  if (!value || typeof value !== "object") return false;
  const grant = value as Partial<EditorGrant>;
  return grant.schema === 1 && grant.githubUserId === config.editorId;
}

export function validScopes(scopes: string[]): boolean {
  return scopes.includes(READ_SCOPE) && scopes.every(scope => SCOPES.includes(scope));
}

export function errorResponse(status: number, code: string, headers?: HeadersInit): Response {
  const resultHeaders = new Headers(headers);
  resultHeaders.set("Content-Type", "application/json; charset=utf-8");
  resultHeaders.set("Cache-Control", "no-store");
  resultHeaders.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify({ error: code }), { status, headers: resultHeaders });
}

/** Accept missing Origin for remote MCP clients, but never trust an arbitrary supplied one. */
export function checkOrigin(request: Request, config: OAuthConfiguration): void {
  const supplied = request.headers.get("Origin");
  if (supplied !== null && !config.allowedOrigins.has(supplied)) {
    throw new PolicyError(403, "origin_not_allowed");
  }
}

/** Read a bounded body without buffering an unbounded upstream response or MCP request. */
export async function boundedText(body: ReadableStream<Uint8Array> | null, maximum: number): Promise<string> {
  if (!body) return "";
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let text = "", size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > maximum) {
        void reader.cancel();
        throw new PolicyError(413, "request_too_large");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

export function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function s256(value: string): Promise<string> {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}
