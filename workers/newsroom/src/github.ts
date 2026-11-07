import { boundedText, PolicyError, type OAuthConfiguration } from "./policy.ts";

export type GitHubTransport<Env> = (request: Request, env: Env) => Promise<Response>;

async function json(response: Response): Promise<Record<string, unknown>> {
  if (!response.ok) throw new PolicyError(502, "identity_provider_unavailable");
  try {
    const value: unknown = JSON.parse(await boundedText(response.body, 16_384));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new PolicyError(502, "identity_provider_unavailable");
  }
}

/** The token goes only to fixed GitHub endpoints, and is never retained in an editor grant. */
export async function githubIdentity<Env>(
  code: string, verifier: string, config: OAuthConfiguration, env: Env,
  transport: GitHubTransport<Env> = request => fetch(request),
): Promise<string> {
  const callback = config.issuer + "/oauth/callback";
  const tokenRequest = new Request("https://github.com/login/oauth/access_token", {
    method: "POST", redirect: "manual", signal: AbortSignal.timeout(10_000),
    headers: { "Accept": "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.githubClientId, client_secret: config.githubClientSecret,
      code, redirect_uri: callback, code_verifier: verifier,
    }),
  });
  const token = await json(await transport(tokenRequest, env));
  if (typeof token.access_token !== "string" || !token.access_token || token.access_token.length > 4096 ||
      (token.token_type !== undefined && String(token.token_type).toLowerCase() !== "bearer")) {
    throw new PolicyError(502, "identity_provider_unavailable");
  }
  // A dedicated sign-in app should never acquire repository access from an older authorization.
  if (typeof token.scope === "string" && token.scope.trim()) {
    throw new PolicyError(403, "unexpected_identity_permissions");
  }
  const identity = await json(await transport(new Request("https://api.github.com/user", {
    redirect: "manual", signal: AbortSignal.timeout(10_000),
    headers: {
      "Accept": "application/vnd.github+json", "User-Agent": "Federated-Republic-Newsroom",
      "Authorization": "Bearer " + token.access_token,
    },
  }), env));
  if (!Number.isSafeInteger(identity.id) || Number(identity.id) < 1) {
    throw new PolicyError(403, "editor_not_allowed");
  }
  const id = String(identity.id);
  if (id !== config.editorId) throw new PolicyError(403, "editor_not_allowed");
  return id;
}
