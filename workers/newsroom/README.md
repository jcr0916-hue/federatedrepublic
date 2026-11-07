# Newsroom OAuth integration — branch review

The supplied newsroom Worker is now connected to the OAuth adapter and tested locally. `src/index.ts` is the integrated entrypoint; `npm run build` creates a local bundle. Nothing has been deployed or merged. Release configuration, remote resources, real identity apps and OAuth clients remain unprovisioned. `cloudflare.config.ts` deliberately defines no deployment target or bindings, and there is no deploy script.

## Baseline and preserved behavior

The user supplied `newsroom-worker.txt`. A credential preflight parsed its authentication literals and checked for common credential markers before import. The five credentials are environment bindings; no real credential values were supplied or copied. `src/legacy.js` preserves the original 7,808 bytes, followed only by named exports for `principal` and `mcp`. The provenance test verifies the original SHA-256 recorded in `baseline-provenance.json`.

`src/adapter.ts` calls the original functions with their original argument order. Valid legacy bearer credentials use the original fetch path before OAuth configuration is inspected. REST and health routes retain the original implementation. No agent token is exchanged, embedded in an OAuth grant or passed to GitHub.

The actual handlers establish these boundaries:

- Corindal, Korda, Varek and Federal submit/list/read within their authenticated desk. Supplied desk or editor fields cannot change that identity. List cursors are passed with the server-selected desk prefix; reads validate the submission key and desk prefix.
- The legacy editor can list/read all desks, submit as editorial, and append reviews. All eight existing review statuses remain available.
- Submissions are stored as `PROPOSED` with `nonCanonical: true`. Review appends a history record and updates the separate latest-status object; it does not rewrite the submission or publish anything.
- Only editors receive the latest-status overlay when reading/listing. Agents continue to see the submission's original status. This existing behavior is preserved.

The source supplied by the user is the regression baseline. Byte-for-byte equivalence with the deployed Cloudflare module has **not** been independently established; no further full-source connector export was attempted. Live deployment metadata still identifies the inspected version recorded in the provenance file.

## OAuth policy

The smallest addition uses the same Worker and original MCP handler, plus separate OAuth KV storage. A dedicated GitHub sign-in app establishes the editor's numeric immutable identity. The initial ChatGPT client is pre-registered; public registration, CIMD and token exchange are disabled.

For `/mcp`, a credential that is not a valid legacy bearer must pass the OAuth provider and the fixed-client, fixed-editor, audience, expiry and scope checks. Only then is the original MCP handler called with `{desk: "editorial", editor: true}`. OAuth grants do not apply to REST routes.

OAuth clients can list/read with `newsroom:read`; review additionally requires `newsroom:review`. Submission, publishing and unknown tools are denied to the initial OAuth connection. `tools/list` is filtered to the granted operations and receives `securitySchemes`, a compatibility `_meta.securitySchemes` mirror and read/write annotations. Calls enforce permissions independently of those annotations.

Authorization requires explicit consent, browser-bound state, S256 PKCE on both OAuth legs, exact callbacks and an allowlisted immutable GitHub ID. GitHub requests use fixed endpoints and reject redirects. The upstream token is used only to check identity, then discarded. Unexpected upstream scopes and client-supplied role/desk/consent-scope overrides are rejected.

Access tokens last 15 minutes; refresh grants have an eight-hour fixed maximum lifetime. Editor authorization is rechecked on calls and exchanges. Refresh rotation and revocation use the provider. Explicitly reconnecting replaces the editor's previous grant for this client/resource. Upstream GitHub revocation is not continuously observed after its token is discarded; revoke the local grant as well. The application does not log credentials, request bodies or callback query strings.

Only the exact discovery endpoints, `/authorize`, `/oauth/callback` and `/oauth/token` are public additions. The token endpoint also handles revocation. Administrative `oauthHelpers()` is a code API, never an HTTP endpoint or MCP tool.

## Configuration contract — not provisioned

`NewsroomEnv` describes the required bindings, not an existing deployment environment. Preserve the original `NEWSROOM` R2 binding and five `KEY_*` secret bindings. Generate final environment types from the completed release configuration later.

- `OAUTH_KV`: separate OAuth storage, never the newsroom R2 bucket.
- `OAUTH_ISSUER`: exact canonical HTTPS origin, without a trailing slash. Resource is this origin plus `/mcp`.
- `CHATGPT_CLIENT_ID`: the actual generated ID returned by administrative pre-registration.
- `CHATGPT_REDIRECT_URI`: the exact callback shown by ChatGPT and registered with the client.
- `EDITOR_GITHUB_USER_ID`: the separately confirmed immutable numeric ID. There is no default identity.
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`: a dedicated sign-in OAuth app without repository scopes.
- `MCP_ALLOWED_ORIGINS`: optional comma-separated exact HTTPS origins. Missing Origin is supported; arbitrary supplied origins are denied on the OAuth path. The original legacy Origin behavior remains unchanged.

Future client pre-registration must use the helper's returned ID and secret. Enter the secret directly into ChatGPT's OAuth settings. `createClient()` generates the ID; requesting a preferred ID does not establish it. No live client has been registered by this branch.

## Local verification

Use Node 24.22 or later in the supported Node 24 release line:

```sh
npm ci --ignore-scripts
npm run typecheck
npm test
npm run build
npm run build:test
```

The 27 tests run in local workerd at compatibility date `2026-10-01`. GitHub responses and all bearer/client credentials are synthetic. R2 and KV are local and isolated; outbound access is blocked. Test-only administrative RPC methods exist in `test/fixture-worker.ts`; the release entrypoint imports none of that fixture.

Tests cover OAuth discovery, exact client/callback/resource/PKCE, consent/CSRF/browser binding, editor identity, scopes, malformed calls, expiry, refresh rotation, revocation, allowlist removal, code reuse and one-runtime concurrent exchange. A synthetic adapter additionally checks filtering of hypothetical extra tools. Actual-handler tests cover legacy response parity through `src/index.ts`, all four desks, forged fields, cross-desk and malformed keys, pagination/foreign cursors, all eight review statuses, review history and unpublished protection. OAuth reads/reviews are also exercised through the actual R2 handlers.

Stable Miniflare 4 available during implementation supported only dates through August 6. The harness pins Miniflare `5.20261104.0-beta` and uses its V4-options conversion helper to preserve the October 1 target. This local tooling choice does not change the live runtime. The pinned dependency tree had zero reported vulnerabilities when installed/audited.

The PR-only GitHub workflow runs typecheck, tests and both local builds. It has no Cloudflare credentials or deployment step. Eleventy excludes `workers/**`, so neither source nor fixtures enter the public site build.

## Remaining approval and release gates

1. Review the branch implementation and confirm the approved immutable editor ID and exact ChatGPT callback. No production identity/client values have defaults.
2. Separately authorize any dedicated identity app, client and OAuth-storage provisioning, then configure an isolated hosted test with separate R2 data and synthetic legacy credentials.
3. Verify the real ChatGPT OAuth round trip, scopes, reconnect/revocation and continued desk isolation there. Resolve the assessment environment's Cloudflare 403: the denying layer and actual ChatGPT reachability remain unestablished.
4. Review KV consistency for code redemption/refresh across locations; a successful simultaneous-code test in one local runtime is not a cross-colocation guarantee. Use coordinated storage if the release requires atomic global single-use enforcement.
5. Confirm the deployed source baseline, complete release configuration and rollback review, and obtain separate Presidential approval before any merge or production deployment. Main and production remain unchanged.

Hosted ChatGPT linking and deployment parity are not claimed by local tests.

References: [OpenAI authentication](https://developers.openai.com/plugins/build/auth), [Cloudflare OAuth Provider](https://github.com/cloudflare/workers-oauth-provider/tree/v1.2.4), [Cloudflare configuration](https://developers.cloudflare.com/cf/projects/cloudflare-config/).
