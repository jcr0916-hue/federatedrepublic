# Independent security-readiness review — synthetic newsroom OAuth prototype

**Date:** 2026-11-07  
**Branch/PR:** `feature/newsroom-strict-refresh-prototype` / draft #305 (base: draft #304 feature branch)  
**Disposition:** **NOT READY FOR HOSTED DEPLOYMENT**. This is a source-level self-review, **not** an independent external audit.

## Verified local properties

- Durable Object (DO) SQLite transaction serializes refresh rotation and authorization-code exchange; local concurrent tests reject replay.
- Synthetic scope and audience restrictions prevent review scope from being inferred from a read-only grant; revoked grants fail access validation.
- Cookie-bound consent fixture uses a Secure, HttpOnly, SameSite=Lax, host-only cookie and distinct downstream/upstream state; hashed browser session is checked before GitHub redirect and callback; PKCE S256 is simulated for both legs.
- Upstream state is claimed in the DO **before** token exchange. Replays after a failure cannot contact GitHub again. A successful callback is redirected only to the fixed synthetic client URI.
- Test identity/user responses are mocked with the GITHUB service binding; no real identity secrets or production tokens are used.

## Release-blocking findings

**P0 — Unsafe prototype/test endpoints and identity assumptions.** `synthetic-oauth-fixture.ts` exposes test-only `issue`, `begin_code`, `consent_complete`, `revoke` and test-selected grant operations. `synthetic-browser-fixture.ts` uses a fixed synthetic clock, test-origin, synthetic client, synthetic GitHub ID and no true authentication of a registered GitHub app. **Never deploy these entrypoints, even on a public test hostname, unchanged.** Remove test administration surfaces from any eventual hosted issuer entrypoint.

**P0 — Not a complete OAuth authorization server.** OAuth discovery, authorized client registration, true GitHub authentication, client-bound authorization code, RFC-compliant token endpoint and resource-server integration are not end-to-end implemented. The fixed client IDs and secrets in fixtures are public synthetic values only. The deployed read-only ChatGPT editor uses a *different* implementation.

**P1 — Loss-of-response recovery policy.** Rotation consumes the refresh token in the authoritative DO transaction. If the new credential response is lost, retrying the old token fails by design; client reauthorization is required. Callback state is similarly consumed prior to GitHub token exchange; timeout or upstream failure requires a fresh authorization transaction/grant. Document that ChatGPT reconnect behavior is not yet tested, and do not claim transparent recovery.

**P1 — Grant routing and subject binding.** The local fixture accepts a caller-supplied grant name and uses it in `idFromName`. The future issuer must create unguessable, server-owned grant IDs, validate OAuth client/editor/resource binding, protect its DO RPC access, and map bearer tokens to the correct DO without exposing a public grant selector. Storing only hashes in a DO is not sufficient authentication.

**P1 — Upstream hardening incomplete.** Real GitHub numeric user IDs, client secret/PKCE enforcement by GitHub, redirect/callback behavior, timeout propagation, 429/5xx response behavior, scope handling, JSON/content-length limits on streamed bodies, and user-agent requirements must be validated against the real GitHub contract. Test mocks are not a substitute. The fixture currently bounds responses only *after* reading them into memory, so it needs bounded streaming for an actual hosted service.

**P1 — Resource-side validation and immediate revocation.** The synthetic access token is a random opaque value stored hashed per DO, not a production OAuth bearer usable by ChatGPT. A future MCP resource server must validate issuer, audience, exact scopes, client and expiry against authoritative state for every operation; avoid cached allow decisions that outlive revocation. Never grant submit or publish through OAuth.

**P2 — Operational limits.** No per-client rate limits, distributed hosted tests, durable storage migration/rollback plan, automated secret rotation, out-of-band audit events, threat-model review or independently verified deploy architecture. No production releases or canon changes are authorized.

## Timeout and retry policy

- Bound both upstream token and user requests to a deadline in the local browser fixture; return only `identity_provider_unavailable` on transport timeout. Do not leak upstream tokens or exception details.
- Since the upstream state is claimed before the request, **do not automatically retry a timed-out GitHub code**. Require a fresh consent/sign-in transaction with a distinct grant ID. A successor credential lost after a successful refresh also requires new authorization under this strict policy.
- The test must demonstrate that a timed-out callback cannot be replayed and a fresh synthetic grant can authorize successfully. This is a *local simulation*, not a browser or hosted reliability guarantee.

## Proposed release gates

1. Prototype local TypeScript/build/tests green, with timestamped workflow evidence.
2. Build separate, **non-fixture** isolated issuer that owns the complete OAuth lifecycle. It must not import old test administration endpoints, use fixed clocks, accept caller-provided grant IDs or use test identities.
3. Protocol and security test suite: real browser cookie behavior, registered client, OAuth discovery/authorization code/token and refresh endpoints, PKCE/CSRF, GitHub numeric allowlist, redirect/error handling, token resource/scope, reauth, replay and revocation.
4. Independent security review plus fresh hosted tests on new synthetic client credentials, separate DO storage and no existing live editor grant access; verify multi-location behavior and rollback.
5. Separate Presidential approvals for any production bindings, merge or deployment. Keep PRs #304/#305 draft until explicitly approved.

**Preservation:** `workers/newsroom/HOSTED-TEST.md` and this branch's permanent note in `docs/archive/development/branches/` record historical results; do not re-run completed investigations without a changed hypothesis.
