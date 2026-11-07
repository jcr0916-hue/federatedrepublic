# Standalone issuer and resource candidates — experimental, not deployed

Draft [PR #305](https://github.com/jcr0916-hue/federatedrepublic/pull/305) now contains independent authorization and read-only resource entrypoints. Neither is selected by the release build or attached to cloud bindings. The release Worker, original JavaScript handlers, existing ChatGPT grant and deployed resources remain unchanged.

## Current protocol

- The issuer validates the pre-registered client, exact redirect/resource, read-only scope, downstream state and S256. Only the historical `scope=read` alias may omit `resource`; that alias is normalized to the one configured audience. Other omitted, supplied or broadened resources/scopes fail closed.
- A server-generated grant ID and independently random typed browser/state credentials bind the browser to a single SQLite `IssuerGrant`. GitHub gets a distinct S256 verifier/state and no downstream state or repository scopes. Its callback is claimed before fixed-endpoint, bounded-response GitHub token/identity requests.
- Only the allowlisted positive numeric GitHub editor reaches consent. The cookie is rotated at authentication. Same-origin Origin, a random CSRF token and the rotated Secure/HttpOnly/SameSite=Lax host cookie protect approval/denial. Approval produces a hashed five-minute code; denial produces no code. Registered callback responses always include the original client state and exact `iss`; discovery advertises issuer-response identification.
- Code redemption checks the registered client, current redirect, resource and S256. Code consumption, initial access/refresh digests and an expiration alarm commit together in a SQLite storage transaction. No test issuance/identity shortcut is exposed; the low-level state writer uses JavaScript `#private` and cannot be invoked over RPC.
- `/token` and `/revoke` support the pre-registered confidential client's Basic or form-body credentials. Mixed methods and duplicate fields are rejected. There is no public registration, public-client flow, CIMD, DCR, client-credentials grant or trust in request-selected grant IDs.
- Refresh accepts only the current refresh digest, commits its successor with the new access digest, and rejects replay even after restart. Access lasts 900 seconds; refresh has a fixed eight-hour lifetime. Losing a committed successful refresh response requires fresh authorization, without a previous-token grace period.
- `/introspect` requires separate resource-side Basic credentials. It does not accept the OAuth client's credentials, and the resource credentials cannot mint or revoke client tokens. Active results contain exact issuer, audience, client, read scope and expiry. The actual editor identity and inspected token are never returned.
- A current access or refresh credential can revoke the grant. Unknown/tampered credentials return the same 200 revocation response. Revoked/closed records are reclaimed by alarms; expired pending/code/grant records are reclaimed too. Cleanup gates contain only storage I/O and cannot delete a concurrent live transition. No real grant cleanup was performed.

The issuer's `IssuerGuard` enforces a shared per-registered-client, sixty-second budget: 60 valid authorization starts, 240 token attempts, 1,200 introspections and 120 revocations. The budgets serialize in a separate SQLite object, include bad token credentials, return 429/Retry-After when exhausted, and reset only after the window. This is a coarse storage/issuance cap, not per-user bot protection: an attacker can exhaust a shared budget and cause temporary denial. Edge/WAF and per-source controls still need a hosted design.

Secret verification uses Workers' native timing-safe digest comparison when available, with a standard Web Crypto HMAC verification fallback for offline Node tests. Raw configuration secrets are never placed in grant RPC payloads, grant state, errors or logs. Routing IDs are untrusted hints; full-credential digests authorize operations.

## Read-only resource

`src/resource-candidate.ts` publishes protected-resource metadata and an OAuth challenge. Its `/mcp` route checks every bearer against the issuer over a configured service binding, using its independent validation credentials. It checks `active`, exact `iss`/audience/client/read scope and unexpired integer `exp` before reaching the original read handlers. No allow decision is cached. Issuer errors, redirects, malformed/oversized responses or credential mismatch fail closed.

Only initialize, ping, initialized notification, tools/list and the two read tools are accepted. `tools/list` exposes `newsroom_list` and `newsroom_read` with OAuth metadata/read-only annotations. Calls reject submit, review, publish, unknown methods/tools and forged argument names before touching storage. The unchanged original handlers receive only the configured R2 binding and fixed editorial read principal; no legacy editor secret is needed. `legacy.d.ts` was narrowed to describe the read handler's actual R2-only dependency; original `legacy.js` bytes are unchanged.

Tests seed only an isolated local R2 bucket. They establish immediate denial on the first new resource request after refresh/revocation. An already-authorized in-flight request may complete; there is no claim to cancel operations retroactively. No production bucket has been bound to this candidate.

## Configuration contract — not provisioned

Issuer bindings:

- `ISSUER_ORIGIN`: exact canonical HTTPS issuer origin.
- `ISSUER_CLIENT_ID` and `ISSUER_CLIENT_SECRET_SHA256`: one registered confidential client and high-entropy secret digest.
- `ISSUER_RESOURCE_ID` and `ISSUER_RESOURCE_SECRET_SHA256`: distinct resource-validation identity/digest. They must differ from the OAuth client's ID/digest.
- `ISSUER_REDIRECT_URI`, `ISSUER_AUDIENCE`, `ISSUER_EDITOR_ID`: exact registered HTTPS callback, HTTPS `/mcp` audience and approved numeric GitHub editor.
- `ISSUER_GITHUB_CLIENT_ID` / `ISSUER_GITHUB_CLIENT_SECRET`: a new dedicated no-scope sign-in app, never the working connection's app/grant.
- `ISSUER_GRANTS` / `ISSUER_GUARD`: new dedicated SQLite namespaces for `IssuerGrant` / `IssuerGuard`.

Resource bindings:

- `RESOURCE_AUDIENCE`, `RESOURCE_ISSUER`, `RESOURCE_CLIENT_ID`: exact resource, issuer and registered OAuth-client identity.
- `RESOURCE_VALIDATOR_ID` / `RESOURCE_VALIDATOR_SECRET`: the matching independent resource-validation identity and secret.
- `ISSUER`: service binding to the separate candidate issuer, never an arbitrary user-selected URL.
- `NEWSROOM`: a dedicated synthetic test R2 bucket during isolated evaluation.

No configuration fallback or cloud migration is supplied. Secret rotation must update the matching sides together; the tests verify that a mismatch denies access, not a live rotation operation.

## Verification and reproducibility

Run `npm run typecheck && npm test && npm run build && npm run build:test && npm run build:issuer-candidate && npm run build:resource-candidate`. Four builds preserve separate release, fixture, issuer and resource outputs. The PR workflow runs these checks and retains separately named issuer/resource review artifacts for seven days; it never deploys them.

The paired HTTP tests use actual local Worker/SQLite/R2 runtimes and mocked GitHub. They cover real local reads, no writes, independent resource authentication, exact token trust, immediate revocation, consent/code/refresh concurrency, compatibility inputs, expired state cleanup, rate budgets and lost-response recovery. Persistence tests restart the runtime at pending login/code/refresh/revocation checkpoints. A detached child process group, including native workerd, is forcibly killed after a successful grant checkpoint; a new runtime recovers that committed grant and still permits only one concurrent refresh. Another test exercises a real ten-second abort signal with a hanging mock transport. These do not prove real GitHub network cancellation or hosted cross-region execution.

`npm run browser:candidate` creates an ephemeral loopback HTTPS harness with fully mocked GitHub, a foreign-host callback, actual consent form, code exchange and resource revocation check. It never deploys or uses a live identity. The attempted computer-use run stopped at `ERR_CERT_AUTHORITY_INVALID` **before consent was reached**. The Computer Use Confirmation Policy requires a human for bypassing browser security warnings, including self-signed certificates. The test server was stopped and its temporary TLS files removed. Browser cookie/CSP behavior remains unverified until that human step is completed; the prepared harness is reproducible.

Local Node is 24.15.0, below the pinned supported engine range. A clean install in GitHub CI remains the authoritative supported-environment check. Historical previous-stage evidence: [56-test CI run 42363718849](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42363718849), implementation `9174c785`. Current-stage CI results are recorded separately in the permanent handoff after completion.

## Remaining gates and next checkpoint

1. Human-assisted browser certificate/real consent and an independently configured GitHub sign-in app; actual ChatGPT connection compatibility is not yet tested. Static-client protocol tests are not proof of real client interoperability.
2. Hosted isolated issuer/resource evaluation with new namespaces, test bucket and credentials; multiple-region concurrency, safe observability, transport deadlines and rollback. No existing Worker, grant or production resource may be reused for this test. See [the prepared hosted test plan](ISOLATED-ISSUER-TEST-PLAN.md).
3. Independent security review. This source self-review found and removed a TypeScript-only private writer exposure by using runtime `#private`, and replaced the JS digest-comparison loop with native cryptographic verification. It is not an independent audit.
4. Hosted operational hardening, broader abuse controls, secret-rotation procedure and deployment/monitoring ownership. Coarse shared rate limits trade availability for bounded issuance and need tuning.

The user's later instruction authorizes unattended work available through existing tools; no repeated approval is needed for routine branch work. This checkpoint stops at verified source/CI and the concrete human browser gate. Neither PR has been merged, no host resources were provisioned, no production/`main` change occurred, and the working ChatGPT grant remains untouched.

Design sources: [OpenAI authentication](https://developers.openai.com/plugins/build/auth), [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps), [Cloudflare SQLite storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/), [alarms](https://developers.cloudflare.com/durable-objects/api/alarms/), and [native crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/). The [permanent branch handoff](../../docs/archive/development/branches/feature-newsroom-strict-refresh-prototype.md) retains historical results and disposition.
