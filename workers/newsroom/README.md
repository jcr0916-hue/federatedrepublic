# Newsroom OAuth adapter — integration pending

This branch contains a locally tested OAuth adapter, **not a deployable replacement for the newsroom Worker**. The original Worker source has not been imported. `cloudflare.config.ts` intentionally defines no Worker entrypoint or remote bindings. There is no deploy script.

The user approved branch-only development, local testing and a draft PR. Main, the live Worker, existing credentials, R2 data, identity apps and OAuth clients remain unchanged.

## Local checks

Use Node 24.22 or later in the supported Node 24 release line:

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build:test
```

Tests start Miniflare on loopback and use its Workers runtime at compatibility date `2026-10-01`. GitHub responses and bearer credentials are synthetic. Outbound network access from the simulated Worker is blocked. The fixture's administrative RPC methods exist only in `test/fixture-worker.ts`; never use that fixture as a production entrypoint.

The stable Miniflare 4 runtime available during implementation did not support October's compatibility date. The test harness pins Miniflare `5.20261104.0-beta` and uses its documented V4-options conversion helper. This package includes patched `sharp` and `undici` dependencies. This is a local tooling choice; it does not change the live Worker's compatibility date or runtime.

## Intended integration

`createNewsroomOAuth(adapter)` needs three ports from the actual Worker:

- `principal(request, env)`: the original five-secret bearer validation and principal mapping.
- `fetch(request, env, ctx)`: the original REST, health and legacy MCP entrypoint.
- `mcp(request, env, ctx, principal)`: the original authenticated MCP handler, using the passed principal rather than re-reading a bearer credential.

For a valid legacy credential, the adapter delegates to the original fetch path. This path does not need OAuth configuration, KV or GitHub. Other existing REST paths also stay on the original fetch path. The existing legacy Origin policy is preserved; the added Origin policy applies to the new OAuth path.

On `/mcp`, other credentials must pass the OAuth provider's token validation and the application's fixed-client, fixed-editor, resource, expiry and scope checks. Only then does the adapter call the original MCP handler with `{desk: "editorial", editor: true}`. This editor label was confirmed by constrained inspection; the full original shape and semantics still need source-level verification.

OAuth clients can list/read with `newsroom:read`; review additionally needs `newsroom:review`. Submission, publishing and unknown tools are denied to the initial OAuth connection, even if an underlying handler exposes them. Existing agent behavior is delegated, not recreated.

`tools/list` responses for OAuth are filtered and receive `securitySchemes`, a compatibility `_meta.securitySchemes` mirror, and read/write annotations. Annotations do not enforce permission; calls are checked separately.

## Configuration contract — not provisioned

`OAuthBindings` describes the new adapter inputs; it is not a generated deployment environment. Generate the final environment types from the completed Cloudflare configuration after source integration.

- `OAUTH_KV`: separate OAuth storage, never the newsroom R2 bucket.
- `OAUTH_ISSUER`: exact canonical HTTPS origin with no trailing slash. Resource is this origin plus `/mcp`.
- `CHATGPT_CLIENT_ID`: the **actual generated ID** returned by administrative pre-registration.
- `CHATGPT_REDIRECT_URI`: the exact callback shown by ChatGPT, registered exactly with the client.
- `EDITOR_GITHUB_USER_ID`: the separately confirmed immutable numeric ID. There is no default identity.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`: a dedicated sign-in OAuth app, without repository scopes.
- `MCP_ALLOWED_ORIGINS`: optional comma-separated exact HTTPS origins. Missing Origin is supported for remote MCP clients; arbitrary supplied origins are denied on the OAuth path.

Only exact discovery endpoints, `/authorize`, `/oauth/callback` and `/oauth/token` are public. The provider publishes authorization-server and protected-resource metadata. Its token endpoint also handles revocation. DCR, CIMD and token-exchange grants are disabled. Administrative `oauthHelpers()` is a code API, not an HTTP endpoint or MCP tool; keep it private.

Future pre-registration must use the helper's returned client ID and secret, then configure the exact ID in the Worker and enter the secret directly into ChatGPT's OAuth settings. `createClient()` generates the ID; passing a preferred ID does not establish it. A temporary administrative configuration is not a completed live connection. No client has been registered by this branch.

Human authorization includes explicit consent, browser-bound state, S256 PKCE on both OAuth legs, exact callback validation, and fixed GitHub endpoints with redirects rejected by response status. The upstream GitHub token is used only to read the numeric identity, then discarded. Extra upstream scopes are rejected. User-provided role, desk and consent scope fields cannot elevate a grant.

Access tokens last 15 minutes; refresh grants have an eight-hour fixed maximum lifetime. The editor ID is rechecked on calls and token exchange. Refresh/revocation use the provider implementation. Since the upstream GitHub token is discarded, upstream revocation is not continuously observed; local grant revocation is required. The default implementation does not log credentials, request bodies or callback query strings.

## Evidence and limits

- Local tests prove OAuth discovery, sign-in, token/scoping/lifecycle behavior, and delegation to a **synthetic adapter**.
- They do **not** prove the live Worker's R2 key validation, cursor isolation, record schema or review semantics. Those require the original source and real baseline regression fixtures.
- A successful simultaneous-code test in one local runtime does not certify cross-colocation KV consistency.
- The actual ChatGPT callback, approved editor ID and GitHub app are not provisioned. No hosted ChatGPT linking was attempted.
- Public probes from the assessment environment returned Cloudflare 403 even on health. The denying layer and actual ChatGPT reachability remain unresolved.
- `baseline-provenance.json` records the inspected baseline and the user's setup note. The setup note contains configuration information, not Worker code.

## Remaining integration gate

Obtain the original JavaScript/module source through a secret-safe local file handoff. Automatic approval review rejected returning the live source through the connector, including after a preflight. Do not work around that rejection by encoding or indirectly returning it. No original source or tokens were copied into this branch.

After a source-only file is supplied: scan before committing, record its hash, preserve the baseline unchanged, compare the principal and MCP signatures, wire these ports, and run all four desk isolation/record tests against the actual handlers. Verify that review cannot publish or clear noncanonical protection. Complete real configuration and any hosted tests only with separate authorization. Main and production remain later approval gates.

References: [OpenAI authentication](https://developers.openai.com/plugins/build/auth), [Cloudflare OAuth Provider](https://github.com/cloudflare/workers-oauth-provider/tree/v1.2.4), [Cloudflare configuration](https://developers.cloudflare.com/cf/projects/cloudflare-config/).
