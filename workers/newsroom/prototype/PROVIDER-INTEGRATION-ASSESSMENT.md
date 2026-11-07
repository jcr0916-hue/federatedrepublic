# Prototype architecture decision — strict OAuth refresh rotation

**Date:** 2026-11-07
**Status:** Experimental / design confirmed; implementation incomplete
**Parent:** draft #304, pinned `@cloudflare/workers-oauth-provider@1.2.4`
**Prototype:** draft #305

## Question

Can we connect the existing provider directly to the SQLite-backed `StrictRefreshGrant` Durable Object to guarantee exactly-once rotation and cross-region revocation of OAuth refresh credentials?

## Verified finding: no supported direct integration point

At pinned provider version **1.2.4**:

1. `OAuthProvider` / `OAuthAuthorizationServer` owns the token endpoint, including issuance, refresh-token rotation, grant persistence and revocation.
2. The provider assumes a bound `OAUTH_KV` for grants, codes and access-token records. It does not expose a general transaction/refresh-storage adapter through its documented `OAuthProviderOptions`.
3. The public `tokenExchangeCallback` receives `grantType`, client IDs, user ID, grant ID, scope, resource, props and environment. **It does not receive the raw presented refresh token, refresh-token hash or the provider-generated successor token.**
4. The provider deliberately permits the immediately previous refresh token for lost-response recovery. Concurrent refreshes may both succeed by design.

Therefore a Durable Object invoked *from `tokenExchangeCallback`* cannot safely verify and atomically consume the exact credential being refreshed. A gate based solely on grant ID or a request counter is not a secure substitute. Wrapping the token endpoint with a second preflight check also risks splitting replay decisions from the provider's issuance/commit step; no strict claim may be made without a validated end-to-end transaction protocol.

**Sources for the exact pinned tag:**
- https://github.com/cloudflare/workers-oauth-provider/blob/v1.2.4/src/oauth-provider.ts (provider env, callback option fields, token endpoint)
- https://github.com/cloudflare/workers-oauth-provider/blob/v1.2.4/docs/authorization-server.md (token lifecycle and intentional previous-token grace)
- https://github.com/cloudflare/workers-oauth-provider/blob/v1.2.4/storage-schema.md (KV grant/token storage)

## Recommended direction — split authorization roles

Create a **separate experimental OAuth authorization server**, with entirely synthetic credentials, in a later phase/branch. It will own code exchange, hashed refresh token issuance, and revocation through a single authoritative Durable Object per grant. Preserve the MCP resource server, the four legacy desk credentials, and the working read-only OAuth connection unchanged until the new issuer passes tests.

The server must implement and test the full protocol; the existing `StrictRefreshGrant` is only a state-transition primitive, **not an OAuth implementation**.

Design requirements:

- **Identity and clients:** pre-registered fixed client, allowlisted numeric GitHub editor ID, fixed allowed redirect, PKCE S256, state/consent/browser binding. No public registration by default.
- **Grant ownership:** a server-issued unguessable ID maps to one DO instance. Only an authenticated internal server call may initialize/rotate/revoke; DO IDs must not be client-selectable. Exact client ID, editor ID, resource and scope ceiling bind every grant.
- **Token format:** use high-entropy opaque refresh tokens; digest token contents before writing durable state; never log tokens, wrapped keys or client secrets. Store generation, TTL, revocation and replay policy transactionally.
- **Atomic issuance:** ensure the **same transaction** that consumes a refresh token commits the successor's authoritative identity and replay state. If responses can be retried, specify deterministic identical-response recovery or explicit client reauthorization. Never produce two distinct valid successors from the same credential.
- **Access tokens:** independently enforce short expiry, issuer, fixed audience and user/client/scope checks on every request; revoking a grant must invalidate associated access immediately at the authoritative validator, not merely eventually in KV. Ensure the MCP tool allowlist still prohibits submit and publish.
- **Operations:** no public administrative DO endpoint; no test fixture in the production entrypoint; no migration of the existing ChatGPT connection. Separate issuer/test client and storage from existing isolated `newsroom-oauth-isolated-test`.
- **Release gate:** exact protocol conformance, miniflare and hosted multi-instance tests, independent security review, deployment/rollback plan, and explicit Presidential approval for production.

## Alternative

If the additional OAuth server is too complex, keep OAuth permissions limited to `newsroom:read`, accept and explicitly document the provider's recovery window, and keep editorial reviews on the existing separately authenticated legacy editor path. This is a **policy alternative**, not equivalent strict replay protection.

## Evidence and what has not been built

Local Miniflare SQLite Durable Object concurrency and revocation test **passed** on `1279de77`, 35 tests in GitHub run `42357083595`. Those tests do not validate OAuth token issuance, end-to-end revocation, hosted cross-region behavior, or client compatibility. The production release Worker and connected ChatGPT editor remain unchanged.

**Next implementation gate:** design a synthetic-only server protocol and test-first acceptance harness. Do not integrate the current provider by unsupported storage monkey-patching, by reading encrypted grant internals, or by intercepting provider token responses without end-to-end consistency guarantees.
