export const EDITOR_SCOPE = "newsroom:editor";
export const ISSUER_METADATA_PATH = "/.well-known/oauth-authorization-server";
export const RESOURCE_METADATA_PATH = "/.well-known/oauth-protected-resource";

export function editorIssuerMetadata(issuer: string) {
  return {
    issuer,
    authorization_endpoint: issuer + "/authorize",
    token_endpoint: issuer + "/token",
    introspection_endpoint: issuer + "/introspect",
    revocation_endpoint: issuer + "/revoke",
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    scopes_supported: [EDITOR_SCOPE],
    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
    introspection_endpoint_auth_methods_supported: ["client_secret_basic"],
    revocation_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
    code_challenge_methods_supported: ["S256"],
    authorization_response_iss_parameter_supported: true,
  };
}

export function editorResourceMetadata(resource: string, issuer: string) {
  return {
    resource,
    authorization_servers: [issuer],
    scopes_supported: [EDITOR_SCOPE],
    bearer_methods_supported: ["header"],
  };
}

export function editorBearerChallenge(metadata: string): string {
  return `Bearer error="invalid_token", resource_metadata="${metadata}", scope="${EDITOR_SCOPE}"`;
}
