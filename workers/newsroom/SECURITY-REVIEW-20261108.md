# Newsroom OAuth security review — November 8, 2026

**Decision: keep production release blocked.** This is an agent-assisted source review with local adversarial testing and proposed fixes. It is **not an independent external audit**, a penetration test of the hosted service, or approval to merge/deploy. Production and Torenthia OAuth Verification 04 were not accessed or changed by this review.

## Source and scope

New branch: `feature/newsroom-oauth-security-review-20261108`, based exactly on [PR #309](https://github.com/jcr0916-hue/federatedrepublic/pull/309) at `afc95cc362f6e25d9c5b60dd9d287b8ea381daf1`.

The reviewed draft chain was #304 (`9e42c3f7`) → #305 (`4fda7e34`) → #306 (`9069f1b4`) → #307 (`9e498326`) → #308 (`4553f729`) → #309 (`afc95cc3`). Current #307 includes a handoff-only commit after #308's frozen #307 base `b26673e0`; that extra handoff was read without changing the dependency branches. Source inspection covered both OAuth architectures, preserved handlers, candidate entrypoints, grant/guard state, GitHub transport, tests, lockfiles, build scripts, CI and release/rollback records. The production candidate is the separate issuer/resource pair; #304's provider/KV adapter remains historical compatibility work, not the hardened release target.

Trust assumptions: deployment administrators and internal DO/service bindings are trusted; the configured numeric GitHub editor and single confidential client are intentional. Internet callers, browser state, RPC arguments and bearer strings are untrusted. Read access spans all desks and includes editorial status/notes; it is not publication authority. No real secret values were requested. Prior hosted success is historical evidence, not a fresh verification of this branch.

## Reproduced findings and branch-only mitigations

### F1 — High: spent refresh replay left the winning successor active — mitigated locally

At #309, one concurrent refresh succeeds and the other fails, but the losing/replayed credential does not invalidate the successful successor. A client compromise that includes the confidential-client credential and refresh token can win the race and keep reading despite subsequent evidence of reuse. This is not an anonymous token-minting bypass.

`src/issuer-grant.ts` now persists consumed refresh digests in the same SQLite transaction as rotation. A proven spent-token replay revokes the complete successor family, including older generations. A random nonce with a known routing ID cannot revoke anything. Proof is removed by the existing grant expiry/revocation cleanup; no raw refresh tokens are stored. Two refresh attempts still yield one 200 and one 400, but the returned winner is then invalid. Fresh authorization is required.

This adopts the replay response described by [RFC 9700 §4.14.2](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14.2). Its mandatory replay-detection rule for *public* clients must not be misrepresented as a finding that this confidential client violates that rule.

### F2 — High: failed client authentication could consume emergency and normal quotas — mitigated for direct issuer calls

At #309, the shared client budget is charged before client authentication. Invalid credentials can consume all 240 token, 1,200 introspection or 120 revocation requests per minute, preventing the real client from refreshing or revoking. Tests exceeded each limit with synthetic bad credentials and reproduced 429s.

`src/issuer-candidate.ts` now authenticates before charging the registered-client quota. Tests verify that the invalid attempts remain 401 and a subsequent authenticated operation still proceeds. Authenticated attempts remain capped. This does **not** rate-limit the public secret-verification work and does **not** fix F5.

### F3 — High: revocation with a just-consumed refresh token silently missed its successor — mitigated locally

At #309, `/revoke` returns 200 for the spent credential while the newly rotated access token still works. This can strand an active grant during a refresh/disconnect race or loss of a refresh response. The new spent-token proof permits a genuine consumed refresh token to revoke its family. Tests cover sequential rotation, forged proof, concurrent revoke/refresh and grant isolation. An old access token alone remains insufficient once replaced; callers should retain and use the refresh credential for disconnect. [RFC 7009](https://www.rfc-editor.org/rfc/rfc7009.html) explains grant-related revocation semantics; a 200 response alone does not establish that an unrelated or unknown token identified a grant.

### F4 — Medium: authorization-code reuse did not revoke issued credentials — mitigated locally

At #309, a duplicate code exchange is denied, but previously issued access continues. The grant now retains the redeemed code digest, redirect and PKCE challenge until cleanup. Reuse with the original authenticated client, exact redirect and correct verifier revokes that family. Wrong-verifier or forged-code attempts cannot revoke it. Tests include replay after refresh and a runtime restart. [RFC 6749 §4.1.2](https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.2) recommends revoking tokens issued from a reused code.

## Unresolved production blockers

### F5 — High: public resource traffic can still exhaust trusted introspection

A syntactically valid forged `nr1a` token reaches the resource's validator-authenticated service call. An attacker does not need either secret. The local test sends 1,200 such requests; each is correctly rejected with 401, but the next legitimate read fails with 503 because the shared introspection budget is exhausted. Revocation has a separate quota and remains callable. Valid-looking public `/authorize` traffic can likewise exhaust its 60/minute shared budget and prevent editor sign-in.

Required: design and test edge/source abuse controls on **both** public Workers, retain authoritative shared budgets, cap expensive read/list workloads, preserve emergency revocation, define retry/backpressure behavior and measure legitimate ChatGPT bursts. Source identity must come from a trusted edge, not a caller-selected header. Cloudflare's [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) is approximate and local to a location; it cannot replace the strict cross-region DO budget. No WAF or rate-limit setting was provisioned during this task.

### F6 — High residual privilege: the resource's R2 binding can write

No remote MCP write bypass was found in the inspected candidate. Tests seed real local submissions, status and review history, attempt write tools, unknown methods, forged arguments and REST routes, then verify every object's contents, ETag and timestamp remain unchanged.

The resource now hands preserved handlers a frozen `get`/`list` façade (`src/readonly-storage.ts`), with no put/delete/multipart capability. This limits accidental handler escalation. The resource process still receives the original full bucket binding, and the bundled preserved dispatcher still contains legacy write implementations. The façade does **not** isolate malicious code in that process or make the storage credential read-only. The [R2 binding API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) includes mutators.

Before attaching production storage, approve and validate a true least-privilege boundary: for example a reviewed read service isolated from this process, a read-only storage credential path, or a separate approved snapshot bucket. Those are design alternatives, not implementations delivered here. Any intermediary that retains a write-capable binding needs its own threat review. No production R2 binding was attached or permission changed.

### F7 — High operational gate: revocation inventory, containment and rollback are incomplete

Fresh authorization creates a separate grant and does not supersede older grants. There is no account-wide grant inventory or tested global invalidation control. Client-secret rotation alone does not invalidate already issued access tokens. Before release, define ownership, grant enumeration/supersession, approved global invalidation, coordinated client/validator/GitHub secret rotation, reconnect handling, redacted monitoring, alert thresholds and incident escalation. Raw tokens, secrets, authorization codes and callback/state queries must stay out of logs/traces/exports. Safe event visibility is still needed; blanket tracing is not a substitute for redaction.

The release document previously described closing Workers.dev alone. Its rollback guidance now requires an inventory and closure of **all** resource ingress, including custom routes/domains, version/preview URLs and service-binding callers. Prove denial at each path before recovery. Code rollback does not restore attached storage; see [Cloudflare rollback behavior](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/). Reverting SQLite/PITR to before revocation can resurrect tokens. Do not restore an old authentication checkpoint as ordinary rollback.

The new proof keys are additive and use the existing `revoked` flag. Earlier code can read that flag but ignores replay proof. A downgrade loses the new detection for still-active grants; keep ingress closed and prefer a reviewed forward fix. Existing grants lack proof for credentials consumed before the mitigation. New production namespaces remain mandatory. No hosted rotation, rollback, recovery or multi-region rehearsal was performed.

### F8 — High: excluded #304 provider/KV path can redeem a code twice — reproduced, not fixed

The first [OAuth CI run for this review](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42500808335) failed an inherited assertion that concurrent code exchanges produce one 200 and one 400: the actual result was two 200s. The hardened issuer and all new security regressions passed in that run (93/94 tests overall). This was not dismissed as runner noise or retried until green.

The pinned provider reads a pending grant from KV and later clears its wrapped authorization-code key; those operations are not a compare-and-swap. The test-only fixture now holds two already-read pending-code snapshots until both requests arrive, forcing that valid interleaving. The provider produces two distinct access tokens and both reach the authenticated resource successfully. This requires the correct client credential, code and PKCE verifier; it is not an anonymous bypass.

The inherited test was replaced with an explicit deterministic **defect characterization**, not a claim that duplicate issuance is safe or repaired. The hardened SQLite issuer retains strict concurrency and family-revocation tests. Only test fixtures changed for this finding; the pinned provider, original adapter and legacy source were not patched. F8 reinforces the existing release decision to exclude the default provider/KV bundle. Reconsidering that adapter for OAuth would require its own coordinated state fix and acceptance; this PR does not provide one.

## Authorization, browser and MCP assessment

- **Authorization:** fail-closed configuration; exact registered client/callback/audience; one read scope; explicit numeric GitHub identity allowlist; independent high-entropy routing IDs and credential secrets; no caller-selected authority or public issue/admin shortcut. The narrow historical `read` alias only fills the configured audience. No new authorization bypass was demonstrated.
- **Browser:** S256 on both legs; one-use upstream state claimed before network I/O; Secure/HttpOnly/host-only/Lax cookie rotated after authentication; origin plus CSRF checks on consent; frame/base restrictions and bounded form-action CSP; fixed GitHub endpoints with manual redirects, response bounds and deadlines; no repository scope; GitHub token discarded. Tests cover duplicate/mismatched callback issuer, state/cookie substitution, denial, malformed/oversized responses, foreign origins and failure recovery. Missing upstream `iss` remains a deliberate single-provider compatibility policy; a supplied issuer must match the pinned GitHub issuer. Prior browser/ChatGPT success is not current-branch acceptance. No browser or live OAuth sign-in was initiated here.
- **Resource:** every MCP operation performs authoritative introspection and requires exact issuer, audience, client, scope and unexpired access. OAuth-client credentials cannot introspect, and validator credentials cannot issue/revoke. No cached allow survives refresh/revocation on the next request. An already authorized in-flight read can still complete. Only discovery, initialize, ping, initialized notification, tool listing and the two read tools are accepted; tool hints supplement server-side allowlists. Query tokens, arbitrary REST operations and write tools are not authorization paths. Draft content returned to a model remains untrusted content.
- **Release selection:** the default `dist/worker.js` still builds #304's provider/KV adapter, including a different review-scope policy. It must never be substituted for the paired candidate. The non-deployable contract still has `releaseApproved: false`, `productionReady: false` and unassigned targets. Static checks are guardrails, not a Cloudflare access-control policy.

## Validation and evidence limits

Supported local Node **24.22.2**, pinned Miniflare/workerd and synthetic GitHub/R2/SQLite only:

- Frozen #309 baseline: **82 tests passed**, zero failures.
- Initial adversarial set against unchanged #309: **7 failures, 2 passes**. Failures reproduce F1–F4; the passing availability test demonstrates unresolved F5. Two additional lifecycle cases and the storage capability case were added afterward.
- Final mitigated suite: **94 tests passed**, zero failures/skips; TypeScript and all four builds passed. This includes persistence, forced child-runtime/process-group crash, atomic admission/rotation, replay/revocation, forged tokens and seeded-object preservation. A passing test that demonstrates F5 is evidence of a blocker, not clearance.
- First Linux CI: 93/94 tests passed, with the inherited provider/KV code-race assertion failing; World publishing passed. The deterministic local characterization then passed all 22 tests in `oauth.test.ts`. F8 and its test replace an unsupported serialization claim, without weakening the hardened issuer's assertions. Follow-up CI results are recorded in the handoff.
- Repository `world:publish-check` passed, including local site generation and link/consistency checks. This did not publish or deploy the site.
- Online `npm audit --json` of the newsroom lockfile reported zero advisories. This is a registry snapshot, not a supply-chain audit. Lockfiles and dependencies were not changed.
- Local runtime compatibility is `2026-10-01`. Historical isolated deployment records name `2026-11-07`; current hosted settings and behavior, exact production compatibility, secret entropy, WAF coverage and deployed bundle equivalence were **not established** in this review.

Local build SHA-256 values (not deployed artifacts):

- Legacy/default: `e62ba0c0ccb9e89faf22a63672161f7a70792b0e886013c4bb76f1f7020bb6b3`.
- Issuer candidate: `6d41742b28bc849c20c9dec8c7913ed3ba46b9eccb6b421123626949e799fca7`.
- Resource candidate: `1033dc773f870e12040097b41d7db962531c6d7d16260ecaa45d0ad5411f5439`.

The new regression cases are in `test/security-review.test.ts` and `test/readonly-storage.test.ts`; the existing browser, resource and lifecycle suites provide the remaining coverage. CI evidence for the eventual draft PR is recorded in the permanent branch handoff when available. Independent external review, hosted abuse/recovery acceptance, storage least privilege, operational ownership and explicit release approval remain open.
