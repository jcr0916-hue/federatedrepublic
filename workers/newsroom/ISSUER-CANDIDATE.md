# Standalone issuer candidate — experimental, unbound, not approved for deployment

This is the next source-only stage of [draft PR #305](https://github.com/jcr0916-hue/federatedrepublic/pull/305). `src/issuer-candidate.ts` is independent of `src/index.ts`, the existing OAuth provider, legacy newsroom handlers and all synthetic HTTP fixtures. Nothing in this milestone provisions a client, sign-in app, Worker, storage, domain or migration. The existing ChatGPT OAuth grant is never read, refreshed, migrated or revoked.

## Implemented protocol

1. `GET /authorize` validates the configured client, exact HTTPS callback and audience, `response_type=code`, `scope=newsroom:read`, nonempty opaque ASCII client state (up to 1,024 characters) and S256 challenge. Duplicate/extra parameters, supplied grant selectors and broader scopes fail locally without a redirect. The server generates a new grant ID, browser secret, independent upstream state and GitHub PKCE verifier.
2. The browser receives a host-only `__Host-newsroom-issuer` cookie (`Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=300`) and a redirect to the fixed GitHub authorization endpoint. The dedicated sign-in app requests no GitHub scopes. Downstream client state and the upstream PKCE verifier are never placed in that redirect.
3. `GET /oauth/callback` checks the typed upstream state and matching browser cookie against the grant's SQLite Durable Object. It atomically claims the upstream state **before** calling GitHub's token and user endpoints. Both requests reject redirects, have ten-second deadlines and read at most 16 KiB of streamed response data. Only the configured positive numeric GitHub user ID with empty GitHub scopes may continue. The GitHub token is discarded after identity verification.
4. **After identity verification**, the browser cookie is rotated and an explicit read-access consent page appears. `POST /consent` requires the rotated cookie, exact same-origin Origin, random CSRF token and one approve/deny decision. CSP limits forms to the issuer and the registered callback origin. Denial returns `access_denied`; approval atomically replaces pending consent with a hashed code. Both preserve the original client state and clear the cookie. Consent and callback claims cannot be replayed.
5. `POST /token` requires HTTP Basic authentication against the registered high-entropy secret's SHA-256 digest. `authorization_code` requires the typed code, exact current registered redirect and valid S256 verifier; optional `resource` must equal the configured audience. Code consumption and initial access/refresh hash creation are one synchronous SQLite transaction. A code expires after five minutes and cannot mint two token pairs, including under concurrent redemption.
6. `refresh_token` accepts only the current refresh digest and atomically commits successor access/refresh digests. Two concurrent uses have one success. Old access and refresh tokens become invalid immediately. Access tokens last 900 seconds; refresh lifetime is an absolute eight hours from code redemption. Optional refresh `scope` must remain exactly `newsroom:read`; optional `resource` must match the audience.
7. Authenticated `POST /introspect` with `token` and `token_type_hint=access_token` checks current client, editor, audience, expiry and revocation at the authoritative DO. Authenticated `POST /revoke` requires a current access or refresh credential, revokes both, and returns 200 for unknown tokens. A grant routing ID or altered secret cannot revoke another grant. The issuer never returns editor identity or the raw inspected token.
8. `GET /.well-known/oauth-authorization-server` advertises these endpoints, S256, code/refresh grants, Basic client authentication and the read-only scope. `/issue`, synthetic consent completion and administration shortcuts remain absent. There is no public registration or grant-selection API.

Opaque credentials use separate access, refresh, code, browser and upstream-state prefixes. Each combines an untrusted 256-bit routing ID with an independent 256-bit secret; the full credential's digest must match the authoritative DO. The routing ID alone grants nothing. All HTTP responses prohibit caching; errors omit upstream bodies, codes, tokens and secrets. Configuration secrets remain in the request-local configuration, not in grant RPC payloads or stored grant state.

## Dedicated configuration contract — not provisioned

- `ISSUER_ORIGIN`: exact issuer HTTPS origin, no trailing slash.
- `ISSUER_CLIENT_ID` and `ISSUER_CLIENT_SECRET_SHA256`: one separately registered confidential client, using the existing restricted ID syntax and a SHA-256 digest of a high-entropy secret.
- `ISSUER_REDIRECT_URI`: exact registered HTTPS client callback, including any fixed query.
- `ISSUER_AUDIENCE`: exact HTTPS resource URL whose path is `/mcp`.
- `ISSUER_EDITOR_ID`: explicitly approved immutable positive numeric GitHub ID.
- `ISSUER_GITHUB_CLIENT_ID` and `ISSUER_GITHUB_CLIENT_SECRET`: a **separate** no-scope GitHub sign-in app. Do not reuse the working ChatGPT connection's app or grant.
- `ISSUER_GRANTS`: a new, dedicated SQLite `IssuerGrant` namespace, with no existing namespace or storage attached. The class has no synthetic `issue` or `beginCode` shortcut. No binding or migration is configured by this PR.

Missing/invalid configuration fails closed. Current client/editor/audience configuration is rechecked at consent, code exchange, refresh and introspection. No fallback identity or secret exists.

## Verification and boundaries

Local checks: `npm run typecheck && npm test && npm run build && npm run build:test && npm run build:issuer-candidate`. The third build emits only `dist/issuer-candidate.js`; the unchanged release build continues to emit `dist/worker.js`. The PR workflow runs the same checks and retains a separately named review artifact. It has no deployment step.

The candidate tests use Miniflare SQLite objects, real wall-clock validation and a fully mocked outbound GitHub transport. They exercise the HTTP login → authenticated consent → code → token → refresh/introspection/revoke sequence, not pre-seeded grants. Internal RPC tests additionally check expiry and changed identity/client/audience binding. Timeout cases simulate transport exceptions; actual deadline cancellation and real browser navigation are **not established**. Local dependencies were reused from a checkout with an identical lockfile; local Node 24.15.0 is below the declared engine range, so clean-install GitHub CI is required before claiming that environment verified.

## Remaining release gates

- **Client interoperability:** this deliberately narrow candidate requires `scope=newsroom:read`, an explicit authorization `resource` and Basic authentication. It does not yet accept the existing adapter's ChatGPT `scope=read` shorthand, omitted-resource compatibility path or other client-auth methods. No actual ChatGPT client has been connected or modified, and no full OAuth conformance is claimed.
- **Resource integration:** the candidate has no `/mcp` handler. Immediate revocation is established at local authoritative introspection only. A separate resource must authenticate independently, validate issuer/audience/scope on every operation and avoid cached allow decisions; it must never expose submit or publish through these grants. Resource-side credentials and trust model remain to be designed.
- **Recovery:** a claimed GitHub callback cannot be retried after upstream timeout/failure; start a fresh authorization. A refresh successor lost after committed rotation also requires fresh authorization. No previous-token grace is introduced. Successful client reconnect/recovery behavior is unverified.
- **Hosted and operational proof:** real GitHub PKCE/consent/cancellation, browser cookie/CSP behavior, cross-region concurrency, process restart/crash recovery, expired pending-record cleanup, rate/abuse controls, secret rotation, safe audit events and migration/rollback are unverified or unfinished.
- **Security and authorization:** source self-review is not an independent audit. Keep both PRs draft and the issuer unbound. Separate explicit approval is still required for any hosted provisioning/deployment, merge or production work. No content or canon changes are part of this milestone.

Reuse the server-owned typed routing, separate upstream state/PKCE and transactional grant lifecycle. Do not expose or deploy any `prototype/*fixture.ts`, copy the existing live OAuth grant, patch the provider's private KV format or treat mock GitHub results as hosted interoperability evidence.

## Design references

- [GitHub OAuth web application flow and PKCE](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps).
- [OAuth authorization code and token protocol, RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) and [token revocation, RFC 7009](https://www.rfc-editor.org/rfc/rfc7009).
- [Cloudflare SQLite storage and synchronous transactions](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).

Historical findings and CI results remain in the [permanent branch handoff](../../docs/archive/development/branches/feature-newsroom-strict-refresh-prototype.md) and [security-readiness review](prototype/SECURITY-READINESS-REVIEW.md).
