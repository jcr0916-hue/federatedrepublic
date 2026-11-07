# Branch handoff — feature/newsroom-strict-refresh-prototype

**Branch:** `feature/newsroom-strict-refresh-prototype`
**Base:** `feature/newsroom-chatgpt-oauth` (draft PR #304), originating from branch head `9e42c3f78c894fda93837165dea80ebf37fbafb0`.
**Status:** EXPERIMENTAL / isolated source only. No deployed code, no production release, no canonical content.

## Purpose

Explore a stricter alternative to Cloudflare OAuth provider's deliberate previous-refresh-token grace behavior without altering the working ChatGPT editor connection or existing bearer desks.

## Changes

- `workers/newsroom/prototype/refresh-state.ts`: deterministic hash-only refresh lineage transition policy; accepts only the current token hash, rejects replay, expiry and revocation.
- `workers/newsroom/prototype/strict-refresh-grant.ts`: unbound SQLite-backed Durable Object candidate; serializes initialization, rotation and revocation through `ctx.storage.transactionSync` and `ctx.storage.kv`. Intended one-instance-per-editor-grant. There is NO public handler or release entrypoint import.
- `workers/newsroom/test/strict-refresh-prototype.test.ts`: standalone policy-unit tests for creation, transition, replay, expiry, revocation and malformed hashes.

## Results and known limitations

- **Not yet established at initial handoff:** CI TypeScript, local tests, hosted invocation, DO migration config and cross-region concurrency behavior. Record actual workflow outcomes as they arrive.
- This does **not** replace `@cloudflare/workers-oauth-provider`. There is no integration with its grants, token issuance, signature validation, refresh or revocation flows, no credential hashing boundary, and no generated client credentials. Do **not** deploy as a drop-in fix or claim production readiness.
- The pure transition policy by itself is not a concurrency guarantee. Serialization depends on actual SQLite Durable Object storage and a single authoritative instance per grant. Real DO runtime tests and across-location tests are still required.
- DO RPC methods are intended to be **binding-only**; caller authentication and scope verification belong to the not-yet-written OAuth integration. Do not expose `initialize` or `rotate` as public HTTP/MCP endpoints.

## Decisions

Use a separate branch based on PR #304 rather than modifying its deployed source. Keep the authenticated read-only ChatGPT editor untouched; do not copy live credentials, KV, R2, or GitHub identity data into the prototype.

## Follow-ups and disposition

1. Run/typecheck tests in CI (draft PR targeting `feature/newsroom-chatgpt-oauth`); correct any compile/test errors.
2. Add a Miniflare/local Durable Object integration test verifying atomic concurrent RPC rotations and restart persistence. Confirm SQLite DO API against current Cloudflare docs.
3. Verify whether OAuth provider 1.2.4 supports replacing storage/refresh lifecycle safely. If not, prototype an explicit adapter/server on a **separate isolated Worker** with synthetic-only credentials, and obtain authorization before provisioning.
4. Validate strict replay, revocation/reconnect, audience/scope, cross-region consistency and rollback.
5. Retain branch while open; never merge into PR #304 or `main`, deploy production, or advance Torenthia canon without explicit Presidential approval. Final branch cleanup follows AGENTS.md and the branch lifecycle policy.

Historical provenance: `workers/newsroom/HOSTED-TEST.md`, `workers/newsroom/OAUTH-SECURITY-DECISION.md`, draft PR #304. Maintain separation from Constitution-Lab.

## Initial CI verification — 2026-11-07

- Opened **draft PR [#305](https://github.com/jcr0916-hue/federatedrepublic/pull/305)** targeting `feature/newsroom-chatgpt-oauth` (NOT `main`).
- GitHub Actions `Newsroom OAuth checks` run **42356794969**, job **128356529028**, **passed**: `npm run typecheck && npm test && npm run build && npm run build:test`.
- Exactly **34 tests passed; zero failed**, including the five `strict refresh lineage prototype (not wired to OAuth)` state-machine cases.
- The experimental Durable Object module itself was **typechecked**, but **was not instantiated in a Miniflare Durable Object runtime or deployed**. Its transaction behavior remains unverified in a live DO. Build success does not imply provider integration, cross-region isolation or strict token replay protection.
- The release entrypoint `src/index.ts` was not changed. No R2/KV/DO provisioning, credential changes, connected ChatGPT plugin disruption, production deployment or merge occurred.

## SQLite Durable Object integration proof — 2026-11-07

- Added a **local-only** HTTP fixture `prototype/strict-refresh-fixture.ts` that invokes internal DO RPC; the fixture is NEVER imported by `src/index.ts` or configured for deployment.
- Added `test/strict-refresh-runtime.test.ts`: creates a Miniflare Durable Object instance, initializes a hashed grant, dispatches **two concurrent rotations** of the same token, verifies **one success and one replay rejection**, verifies successor rotation and revocation, and confirms a separate grant name is independent.
- Initial run `42356942706` failed HTTP 500. Diagnostic run `42357013701` identified missing SQLite namespace configuration in Miniflare: synchronous `storage.kv` requires `useSQLite:true`; this was a test fixture configuration defect, NOT an OAuth provider failure.
- Corrected fixture to `durableObjects: { REFRESH_GRANTS: { className: "StrictRefreshGrant", useSQLite: true } }` on commit `1279de77d64ee4286f61d42d498963828f640b8e`.
- GitHub Actions `Newsroom OAuth checks` run **42357083595**, job **128357414735**, **passed**: typecheck, tests, release build and fixture build. **35 tests passed / 0 failed**, including live-in-Miniflare SQLite DO serialization. This validates *local* atomicity in the same DO namespace, **not cross-region hosted execution**.
- Remaining: inspect provider 1.2.4 API to determine integration point; connect to an isolated synthetic-only OAuth server; test an actual hosted SQLite Durable Object under concurrent requests from different regions; design credential issuance and reauthorization semantics; capture rollback. Existing test ChatGPT connection, production Worker, R2, KV, main, and canon have not changed.

## Pinned OAuth-provider integration assessment — 2026-11-07

Reviewed the exact `@cloudflare/workers-oauth-provider@1.2.4` source and documentation. The `tokenExchangeCallback` has grant/client/scope information but no presented refresh-token value/hash or successor token, while the provider owns issuance and KV grant persistence. It is **not a supported strict compare-and-swap integration point**. We must not patch its KV internals or claim a Durable Object callback supplies replay protection. Detailed design and source references: `workers/newsroom/prototype/PROVIDER-INTEGRATION-ASSESSMENT.md`, commit `c9b8282`.

Recommended experimental next phase: a separate, synthetic-only authorization server that owns the complete refresh issuance/consume/revoke lifecycle, with DO as the authoritative state, leaving the existing OAuth test client and four desk principals untouched. Alternative policy: keep current OAuth read-only and use the legacy editor credential for review. **No new issuer implementation or hosted test has been completed.** Added a regression asserting the experimental DO remains unbound and unimported from the release entrypoint, commit `926461e`.

## Synthetic issuer token lifecycle prototype — 2026-11-07

- New `prototype/synthetic-oauth-grant.ts`: a separate SQLite-backed Durable Object for an **experimental synthetic** grant; stores SHA-256 token digests and fixed client, user, audience and scope ceiling, rotates refresh and access hashes in the same synchronous transaction, authorizes scoped access only if unrevoked/unexpired, and revokes access/refresh together. These primitives are NOT a complete OAuth provider.
- New `prototype/synthetic-oauth-fixture.ts`: **LOCAL TEST ONLY**. Issues cryptographically random opaque tokens and hashes their values before Durable Object RPC. Fixed synthetic client credentials, synthetic editor identity and test-invalid audience; test-only `issue` bypasses GitHub login/consent/PKCE and accepts a test-selected grant ID and clock. It is intentionally unsafe to deploy as a public server; never use real identities/credentials in it.
- New `test/synthetic-oauth-runtime.test.ts`: Miniflare SQLite Durable Object integration verifies initial token issuance, audience and read-only scope enforcement, expiry checks, duplicate-grant denial, concurrent same-token refresh (one 200, one 400), old refresh/access invalidation, full revocation and independent test grants.
- GitHub `Newsroom OAuth checks` run **42357693028**, job **128359293011**, **passed** on commit `16fd3c06326d1a18df23990979be2f120a0bf76b`: typecheck, tests, both builds; **37 tests / 37 passes / 0 failures**.
- Added release-namespace isolation assertions on commit `ded685a1dfe6581d58e633eb8a27de2af4d9e576` (follow-up CI must be checked separately). No prototype code is imported into `src/index.ts`, no production or test Worker deployment, and no existing ChatGPT authorization or grants were changed.

### Still required before a deployable authorization server

A legitimate test-only OAuth server must validate GitHub identity, maintain browser-bound consent/state, implement RFC-compatible authorization code + PKCE, fixed redirect/client registration, proper access/refresh/token/revocation endpoint semantics, origin and audience checks, introspection or token validation by MCP resource, logging/abuse prevention, crash recovery for lost successful refresh responses, and independent security review. The current locally successful test-only `issue` action bypasses these entirely and MUST remain unbound and undeployed. Cross-region hosted Durable Object consistency is not yet verified. Branch remains under draft PR #305 targeting #304's feature branch; no release approved.

## Synthetic PKCE authorization-code stage — 2026-11-07

- `prototype/synthetic-oauth-grant.ts` now stores hashed, short-lived authorization code and fixed PKCE S256 challenge, client, redirect, audience, read scope in SQLite Durable Object state. Code consumption and initial access/refresh hash issuance commit atomically in a **single DO transaction**. Code cannot be exchanged twice or after expiry.
- `prototype/synthetic-oauth-fixture.ts` adds **local-test-only** `begin_code` and `exchange_code` actions that generate random synthetic codes, calculate S256, and return synthetic credentials only after DO validation. Its fake pre-approved consent/editor context, hardcoded synthetic client secret and test-selected grant ID are **NOT secure production endpoints**. This remains a protocol fragment, not a complete OAuth server.
- `test/synthetic-code-exchange.test.ts` verifies good S256 exchange, wrong verifier, wrong callback, wrong scope/audience, expiry, duplicate issue, single successful redemption under simultaneous exchanges, read-only scope and replay denial.
- Initial CI failure `42357959019` traced through diagnostic run `42358039897` to malformed regex serialization in the PKCE base64url conversion (`ReferenceError: g is not defined`). Fixed with an unambiguous `split/join` conversion at commit `b1ff768e1a4ee868c69b0c8e2d29889661c35683`.
- GitHub `Newsroom OAuth checks` run **42358114175**, job **128360531133**, passed with **38 tests, 0 failures**, plus typecheck and both builds. This tests **local synthetic code redemption**, not GitHub sign-in, browser consent, hosted use, client interoperability or full OAuth conformance.
- Existing test ChatGPT connection, live Worker, production Worker, `main` and Torenthia canon unchanged; draft PR #305 remains open against #304 feature branch. Next stage is browser/session-bound consent and verified identity, followed by carefully isolated hosted tests and review.

## Simulated consent and mock identity stage — 2026-11-07

- Added `startConsent` and `finishConsent` to experimental `prototype/synthetic-oauth-grant.ts`: the SQLite DO stores SHA-256 hashes of a synthetic browser-session marker and OAuth state plus a fixed PKCE S256 challenge, client ID, redirect, audience, scopes and expiry. A transaction consumes the pending consent and creates the one-time code together; rejected session/state/identity attempts do not consume it. A denial consumes the pending consent without creating an authorization code.
- `prototype/synthetic-oauth-fixture.ts` has **local-only** `consent_start`/`consent_complete` actions. A deterministic *mock* GitHub identity check accepts the predeclared synthetic approved identity and rejects a distinct synthetic user or unknown code. This is **NOT real GitHub OAuth**, and it is **NOT a browser-bound HTTP cookie flow**: the test passes session and state in a JSON body. The fixture has insecure test-administration actions and must never be publicly deployed or exposed through the release entrypoint.
- `test/synthetic-consent.test.ts` exercises the nominal simulated consent + code exchange, wrong browser marker, wrong state, unapproved identity, unknown identity, duplicate approval, denial, expiration and fixed scope/redirect/audience refusal.
- GitHub Actions `Newsroom OAuth checks` run **42358322208**, job **128361156332**, completed successfully: **39 tests passed, zero failures**, including all earlier original Worker compatibility/desk isolation/SQLite DO checks. Typecheck and both build targets also passed.
- **Not established:** real GitHub token exchange, callback integrity with browser cookies, CSRF-resistant browser form submission, OAuth authorization-server conformance, hosted identity verification, cross-region consistency, genuine login/consent, production readiness. Do not call the simulated fixture deployable; later work must replace the synthetic identity gate and JSON-supplied session marker with a genuine browser-bound protocol.

No deployment, merge, test OAuth grant interruption, production modification, or fictional publication occurred. Draft PR #305 remains an experiment targeting PR #304's feature branch.

## Cookie-bound browser consent fixture — 2026-11-07

- Added `prototype/synthetic-browser-fixture.ts` (**LOCAL ONLY, NEVER DEPLOY**), exposing simulated browser `GET /authorize`, `POST /consent`, and `GET /oauth/callback` paths against the existing SQLite synthetic grant. Issues a random `__Host-newsroom-consent` cookie with `Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=300`, sets an origin-preserving referrer policy for the consent form, restricts form actions with CSP, enforces same-origin POST, and clears the browser cookie upon successful callback.
- Browser session and OAuth state are hashed before storing in the DO. The new `verifyConsent` preflight checks pending/unused browser-session and state hashes before GitHub redirect and before any mocked GitHub service call; actual `finishConsent` still atomically consumes the consent and creates the code. The callback verifies a fixed synthetic GitHub editor identity through an injected **mock** `GITHUB` service binding, then redirects solely to the fixed synthetic redirect URI. No real GitHub network request or client data is used.
- `test/synthetic-browser.test.ts` exercises same-origin consent, cookie security attributes, no cookie or substituted cookie, wrong OAuth state, wrong GitHub identity, refusal/replay, denial, and cross-grant cookie isolation; external GitHub transport is fully mocked and arbitrary outbound traffic blocked.
- Early CI attempts failed during changes to session checks and test expectations; corrected the pre-redirect session check and browser form's `Referrer-Policy: origin` to avoid the previously encountered browser `Origin: null` behavior. Latest test commit `f72130c4f3d60a83bf7c7334f410422d1603cd60` passed GitHub Actions **run 42358676428**, job **128362209016**: **40 tests passed, 0 failed**, with typecheck and both builds.
- Limitations: this is a **simulated** browser flow, not a browser automation test; synthetic GitHub transport is deterministic and does not prove real upstream consent/callback integrity, GitHub PKCE or code reuse behavior. Test-only authorization and grant selectors remain present in sibling fixtures and the browser fixture has fixed test identity/clock. Do NOT deploy any `prototype/*fixture.ts`. A complete OAuth provider, independent security review and hosted proof are still outstanding. Existing ChatGPT OAuth plugin, isolated live Worker, production Worker, R2/KV, `main`, and Torenthia canon remain unchanged.
