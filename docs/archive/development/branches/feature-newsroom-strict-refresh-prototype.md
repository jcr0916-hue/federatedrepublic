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

## Upstream GitHub S256 and callback-state separation — 2026-11-07

- `prototype/synthetic-oauth-grant.ts` now binds an independent upstream GitHub state hash and PKCE verifier to the existing hashed browser-session consent in the SQLite Durable Object. Its `beginUpstream` records the state once, while `claimUpstream` atomically marks the upstream callback state claimed before any token exchange, denying callback replay. Its return value is internal-only and contains the upstream verifier plus the **original downstream client state**. No production storage or credential access was added.
- `prototype/synthetic-browser-fixture.ts` creates independent random upstream state and S256 challenge and sends `code_challenge_method=S256` in the simulated GitHub authorization redirect. The mocked token request now includes `code_verifier` and the exact fixed callback. Callback claims the hashed GitHub state under the correct browser cookie, verifies the upstream test identity, then consumes consent against the *original downstream state* and returns that state only to the fixed ChatGPT test callback. The browser consent form still requires the matching cookie and Origin.
- `test/synthetic-browser.test.ts` verifies distinct upstream/downstream states, S256 challenge, fixed upstream callback, one-time upstream code redemption by the mock transport, cross-browser/invalid-state refusal, unapproved GitHub identity and callback replay. During development, CI caught misordered test references and an upstream-versus-downstream state mapping defect. Both were corrected before marking successful.
- GitHub Actions `Newsroom OAuth checks` **run 42359137420**, job **128363571616**, on commit `a965a27cac835e53ff1ee06b1d107c51e481bb8a` **passed**: TypeScript, tests, release and fixture builds; **40 tests passed, zero failed**. Earlier failed experiments are retained as historical debugging evidence; the verified checkpoint is the above run.
- The simulation does **not** establish true GitHub PKCE support, real browser cross-site behavior, real GitHub OAuth callback error handling, actual upstream authorization-code single-use, or security of a deployable issuer. The fixture uses synthetic fixed identities and a synthetic clock and **must never be deployed**. No test OAuth grant interruption, production deployment, `main` merge, or Torenthia canon change occurred.

**Next tests:** robust GitHub error/cancellation and upstream transport failures, callback ambiguity (duplicate code/state), malformed token/user payloads, and timeout behavior; then independently reviewed hosted staging architecture. Keep the existing live ChatGPT read-only editor intact.

## GitHub error/cancellation and callback ambiguity checks — 2026-11-07

- Hardened the **local-only, nondeployable** `prototype/synthetic-browser-fixture.ts` against GitHub error and cancellation callback parameters, duplicates of `state`, `code`, or `grant`, and unrecognized callback fields. Invalid callback requests now fail **before** claiming the one-time upstream state or contacting GitHub.
- Hardened the mock upstream exchange to bound token/user JSON payloads (16,384-character maximum), enforce successful HTTP status, validate expected token type and absence of unexpected GitHub authorization scopes, and fail closed on missing or invalid access token or GitHub user ID. Upstream transport/HTTP/JSON failures produce a generic `identity_provider_unavailable` response without leaking token contents; rejected identity/credentials remain unauthorized.
- New `test/synthetic-github-failures.test.ts` sends cancellation, duplicate/malformed fields, rejected upstream codes and identity, invalid token JSON, missing access token, unexpected scopes/token types, malformed user JSON and service failures through the actual Miniflare SQLite-DO fixture with a deterministic mock GitHub transport. Invalid callback syntax does not consume a still-valid pending flow; a callback claimed before a failed upstream response cannot be replayed to contact GitHub a second time.
- Initial test CI run **42360005669** failed TypeScript on test-local counter inference; corrected. CI run **42360060146** exposed that upstream HTTP failure was incorrectly mapped to editor denial; corrected implementation and expectations.
- GitHub Actions `Newsroom OAuth checks` **run 42360134629**, job **128366567290**, on source commit `8846d84d68e85f4ab80ccbb9ccada37639859cb1` **passed** with **41 tests / 41 passes / 0 failures**, plus typecheck and both builds. These are local simulated failure-path tests only. Actual GitHub cancellation interoperability, timeout behavior, browser integration, and cross-region hosted guarantees remain **not established**.
- PR #305 remains an open draft based on feature branch for draft #304. The synthetic fixture remains unbound and not deployed. No production, `main`, existing ChatGPT editor authorization, or Torenthia canon changes.

## GitHub timeout and recovery policy; security readiness review — 2026-11-07

- `prototype/synthetic-browser-fixture.ts` now sets a **1,500 ms AbortSignal deadline** for each mocked upstream GitHub token and user request. Callback translates transport exceptions to a generic `identity_provider_unavailable` response; the upstream state was already atomically claimed, preventing retry with the same state.
- Extended `test/synthetic-github-failures.test.ts` with synthetic token/user timeout exceptions and a lost-response case: callback retry fails without another GitHub request, whereas a new distinct synthetic authorization grant succeeds. Test mocks simulate the exception; **actual timed request cancellation, browser/client recovery, and real GitHub latency are NOT established**.
- CI **run 42360554131**, job **128367835380**, on commit `9f19e15cfc98a9d559f3cfc67acbe567986d3f7b` passed: **41 tests passed / 0 failures**, TypeScript and both builds. Earlier source-only timeout-deadline CI `42360534275` also passed.
- Created `workers/newsroom/prototype/SECURITY-READINESS-REVIEW.md` as a **source-level self-review**, not an independent audit (commit `91c0c35814f408484e9c48bfc2bbd1f61fd5baec`). Marked prototype **NOT READY FOR HOSTED DEPLOYMENT**. P0 blockers: test administration actions and hardcoded synthetic identity/clock and absence of complete OAuth server endpoints. P1 blockers: loss-of-response reauth policy, server-owned grant routing, real GitHub identity integration/streamed response bounds, authoritative resource validation. Also pending abuse controls, monitoring, hosted concurrency tests and rollback.
- No real GitHub API call, deployment, new cloud binding or grant interruption occurred. Working ChatGPT editor and both existing Workers, `main`, and Torenthia canon remain untouched. PR #305 is still draft against PR #304 feature branch.

**Future work:** Design the production-shaped issuer as a distinct test-only build **without importing synthetic fixture endpoints**. A strict replay policy may force explicit reauthorization after a response-loss event; weigh usability versus stronger security before authorizing any hosted test.

## Server-issued grant routing and registered synthetic client — 2026-11-07

- Added `prototype/issuer-boundary.ts` (commit `32e6e64`): creates 256-bit random grant identifiers and independently random opaque refresh/access secrets; parses grant routing metadata without granting authority; checks a high-entropy synthetic confidential-client secret against a trusted registered hash.
- Added test-only `prototype/issuer-boundary-fixture.ts` (commit `1cb41b6`): client must authenticate before grant issuance, refresh, read or revoke; each grant DO ID is created by the server and no request-supplied grant ID is accepted. This fixture bypasses real login and carries known synthetic credentials, so **must never be publicly deployed**.
- Added unit and local SQLite DO tests `test/issuer-boundary.test.ts` and `test/issuer-boundary-runtime.test.ts`, including altered token/ID, client mismatch, isolated grants, concurrent refresh replay, and revocation. GitHub Actions `Newsroom OAuth checks` run **42360937260** (job **128368988727**, commit `d0611c3`) **passed 45 tests, zero failures**, plus typecheck and both builds.
- Updated `prototype/SECURITY-READINESS-REVIEW.md` (commit `e27b293`) to distinguish the **local routing proof** from unfinished genuine OAuth security/registration and protected server resource access. P0 test administration and mock identity issues remain; no deployment, merge or production/environment changes authorized or performed.

**Next scope:** remove local test shortcuts from a separately built authorization server; integrate issuer-owned grants with real browser/callback identity, OAuth token endpoints and resource verification, then independent review and isolated hosted evaluation. The current test fixture and both draft PRs remain non-production.

## Fail-closed standalone issuer candidate — 2026-11-07

- Added **`workers/newsroom/src/issuer-candidate.ts`** on commit `b8a3182`: independent, deliberately nondeployable candidate entrypoint that does not import synthetic HTTP fixture or existing release entrypoint. It has no `/issue`, `/authorize`, `/consent`, callback, admin, or revoke HTTP surface. Only authenticated `POST /token` for `refresh_token` and `POST /introspect` are recognized.
- The candidate requires a trusted registered client ID, SHA-256 secret digest, numeric editor ID, configured resource audience and a DO binding; invalid/missing config fails closed. It uses a real clock, per-request confidential-client validation, type-specific opaque token routing and authoritative DO checks. No caller-selected grant ID, synthetic identity, or hardcoded client secret is accepted. It does **not** itself validate a new editor login, bind a fresh grant to that login, or implement OAuth discovery and code exchange. The editor ID config is currently only validated syntactically; a future integration must enforce it on grant provisioning. This code is an **incomplete candidate**, not a release.
- New `workers/newsroom/test/issuer-candidate.test.ts` on commit `3b964f6`: verifies absent public issue/admin surface, bad client, extra/duplicate form fields, token-type and scope restrictions, direct internal Miniflare DO seeding (test-only, **not** an exposed HTTP API), read-token introspection, one-success/one-failure concurrent refresh, old credential invalidation.
- `Newsroom OAuth checks` CI **run 42361164985**, job **128369669132**, **passed**: **46 tests passed, zero failed**, TypeScript and both builds successful.
- No production source `src/index.ts` or binding config changed. This candidate is unreferenced by release build `scripts/build.mjs`; no Worker or credential was deployed or provisioned. Existing live ChatGPT editor, isolated Worker and production Worker untouched.

**Next gate:** design/implement authenticated authorization-code issuance and secure browser consent, then review token endpoint OAuth interoperability and resource trust model. Keep the new candidate unbound until all P0/P1 security and compatibility issues are addressed. Do not merge PR #305 or parent draft #304 without approval.

## Standalone authenticated consent and authorization-code integration — 2026-11-07

**Status: EXPERIMENTAL, not shipped or deployed.** This section supersedes the preceding candidate's missing-authorization milestone; earlier entries are historically preserved, not rewritten.

- `src/issuer-candidate.ts` now validates fixed client/redirect/resource/read scope/S256, generates all grant IDs server-side, redirects to a separately configured GitHub sign-in app, claims cookie-bound upstream state before network I/O and verifies the approved numeric editor. Only then does it rotate the browser cookie and show consent. Same-origin Origin, CSRF and cookie checks protect approve/deny. Original downstream state is preserved only to the registered callback.
- New `src/issuer-grant.ts` is a separate SQLite `IssuerGrant` state machine with no synthetic issuance/identity shortcuts. Consent-to-code, one-time code-to-grant and strict refresh transitions are atomic. Access/refresh/code/browser/state credentials have distinct type prefixes and full-credential digests; DO routing IDs grant no authority. Current client/editor/audience bindings and expiry are checked, and authenticated revocation of a current credential immediately invalidates local access introspection and refresh.
- New `src/issuer-github.ts` uses configured app credentials, PKCE, fixed GitHub endpoints, bounded streamed bodies, request deadlines and numeric identity verification. Upstream credentials are never retained in grant state. Transport is fully mocked in tests; no real GitHub call or live OAuth grant was used.
- `test/issuer-candidate.test.ts` now exercises the complete candidate HTTP sequence without privileged grant seeding, concurrent consent/code/refresh attempts, replay, denial, session rotation/CSRF, client/redirect/resource restrictions, identity/scope/upstream failures and internal expiry/binding checks. Typed credential substitution is covered in `test/issuer-boundary.test.ts`.
- `npm run typecheck && npm test && npm run build && npm run build:test && npm run build:issuer-candidate` **passed locally: 56 tests, 0 failures**, with the final configuration-type guards subsequently typechecked/retested before commit. Local Node 24.15.0 is below the declared engine range; dependencies were reused from an identical-lockfile checkout after network-restricted `npm ci` could not finish. Clean-install GitHub CI is **pending at this checkpoint**, not assumed.
- Added a separate local candidate build and a separately named CI review artifact. The release entrypoint, release build configuration and existing runtime bindings remain unchanged. No deploy step or target was added.
- Detailed contract, decisions, sources, local verification limits and remaining release gates: [`workers/newsroom/ISSUER-CANDIDATE.md`](../../../../workers/newsroom/ISSUER-CANDIDATE.md). Reuse the authenticated state machine and typed routing; never deploy synthetic fixtures or migrate/copy the working ChatGPT grant. Deliberately rejected anonymous pre-login consent, caller-selected grant IDs and synthetic `issue`/`beginCode` provisioning for the candidate.

**Unresolved:** actual GitHub/browser interoperability and timed cancellation; ChatGPT narrow-scope/resource/Basic compatibility; resource-side credential/trust integration; process restart/cross-region hosted proof; expired-state cleanup and abuse controls; independent review and migration/rollback. Authoritative introspection revocation is proven locally, not in a connected MCP resource. Lost committed callback/refresh responses require fresh authorization.

**Preservation/disposition:** all source, tests and this handoff remain on the existing open draft PR #305, still based on #304's feature branch. Retain both unfinished PR head/base branches under AGENTS.md; no branch was deleted. Content merge: none. Deployment: none. `main`, production, existing ChatGPT OAuth grant and published Torenthia content were not touched. Final dependency/protection/deletion review remains pending until explicitly approved completion; do not assert an unchecked dependency absence.

### CI verification of authenticated issuer milestone — 2026-11-07

- Implementation commit [`9174c7852c737852e087b9abcbec5e7b6b1aa7c6`](https://github.com/jcr0916-hue/federatedrepublic/commit/9174c7852c737852e087b9abcbec5e7b6b1aa7c6).
- GitHub [Newsroom OAuth checks run **42363718849**](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42363718849), job **128377233303**, **passed**. Read the job log: Node **24.22.2**, clean `npm ci --ignore-scripts`, TypeScript, **56 tests passed / zero failures**, release/fixture/candidate builds all successful.
- Both `newsroom-oauth-pr-bundle` and separate `newsroom-issuer-candidate-pr-bundle` artifacts were uploaded for seven-day review retention. The permanent source/contract/archive retain the evidence after artifact expiry. The artifact upload is not a deployment.
- [World publishing run **42363718821**](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42363718821) also passed for the same head. No real GitHub login, browser/ChatGPT interoperability, actual timed cancellation, resource integration, process restart or hosted consistency was established by these CI runs.
- PR #305 remains a draft against `feature/newsroom-chatgpt-oauth`; the branch stays retained as unfinished work. No merge, deploy, production or existing grant operation occurred.
