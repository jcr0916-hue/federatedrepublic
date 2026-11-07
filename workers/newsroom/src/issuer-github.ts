import { boundedText, PolicyError } from "./policy.ts";

export type IssuerGitHubTransport = (request: Request) => Promise<Response>;
export interface IssuerGitHubConfig {
  issuer: string;
  githubClientId: string;
  githubClientSecret: string;
  editorId: string;
}

async function json(response: Response): Promise<Record<string, unknown>> {
  if (response.status !== 200) throw new PolicyError(502, "identity_provider_unavailable");
  try {
    const value: unknown = JSON.parse(await boundedText(response.body, 16_384));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch { throw new PolicyError(502, "identity_provider_unavailable"); }
}

/** Fixed endpoints, bounded streamed responses, no redirects, no token persistence.
 * This dedicated configuration must never reuse the live newsroom sign-in app. */
export async function issuerGitHubIdentity(
  code: string, verifier: string, config: IssuerGitHubConfig,
  transport: IssuerGitHubTransport = request => fetch(request),
): Promise<string> {
  try {
    const token = await json(await transport(new Request("https://github.com/login/oauth/access_token", {
      method: "POST", redirect: "manual", signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.githubClientId, client_secret: config.githubClientSecret,
        code, code_verifier: verifier, redirect_uri: config.issuer + "/oauth/callback",
      }),
    })));
    if (token.error !== undefined || typeof token.access_token !== "string" ||
        !/^[A-Za-z0-9_]{1,4096}$/.test(token.access_token) ||
        typeof token.token_type !== "string" || token.token_type.toLowerCase() !== "bearer" ||
        typeof token.scope !== "string") throw new PolicyError(502, "identity_provider_unavailable");
    if (token.scope.trim() !== "") throw new PolicyError(403, "unexpected_identity_permissions");
    const identity = await json(await transport(new Request("https://api.github.com/user", {
      redirect: "manual", signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/vnd.github+json", "User-Agent": "Federated-Republic-Newsroom-Issuer",
        Authorization: "Bearer " + token.access_token },
    })));
    if (!Number.isSafeInteger(identity.id) || Number(identity.id) < 1 ||
        String(identity.id) !== config.editorId) throw new PolicyError(403, "editor_not_allowed");
    return String(identity.id);
  } catch (error) {
    if (error instanceof PolicyError) throw error;
    throw new PolicyError(502, "identity_provider_unavailable");
  }
}
