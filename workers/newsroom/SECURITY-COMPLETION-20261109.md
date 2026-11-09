# Security completion — November 9, 2026

**INCOMPLETE / NO-GO. NOT APPROVED FOR DEPLOYMENT.** This branch stacks on draft #317 (`7cab0643`) above #315; #304–#315 and #317 are retained. Editorial #316 remains independent and unchanged. The concrete configuration, release gates, rollback and branch-protection sequence are in [RELEASE-PACKAGE-20261109.md](RELEASE-PACKAGE-20261109.md).

## Implementation

Signed, expiring access envelopes reject forged credentials before source quotas or issuer calls. Separately keyed signed browser/state envelopes reject fabricated callback/consent routing before DO access. Every admitted MCP operation still needs authoritative issuer/client/audience/scope/expiry/epoch/grant validation. Changed candidate credential formats require paired frozen bundles and fresh namespaces; existing working services are not upgraded here.

A Turnstile interstitial binds exact authorization parameters to the browser cookie via cdata. Siteverify requires true success, exact issuer hostname/action/cdata, bounded responses and timeout. A separate `anonymous-challenge:v1:<client>` guard caps verification at 300/minute without queueing on authenticated epoch/quota/control state. Solved login allocation remains 60/minute; failed challenges leave normal read/refresh/revoke quotas intact. Real widget provisioning/browser compatibility is unverified.

Authenticated weighted storage admission caps work at 3,600 calls/minute: list reserves `1 + 2*limit` (max 201), read reserves 2. The facade also enforces per-request calls and a ten-second deadline for starting more calls. S3 retains six-second per-fetch timeout; this is not a hard ten-second end-to-end deadline. Resource preserves 429/Retry-After. Real legitimate-client burst/CPU sizing remains unverified.

Fixed-schema events cover authentication/denial/rate failures, issuer/resource failures, refresh/revoke outcomes, storage/deferred JSON failures and containment. No URLs, headers, error text, tokens/digests, identities, notes or content enter event fields. Anonymous denials are sampled at 1%. Prepared metadata disables invocation logs/automatic traces and enables query redaction. Alert destination/delivery, retention and export-wide privacy certification are not yet established.

## Review and tests

A separate read-only review agent examined actual implementation and inherited authorization/storage/recovery boundaries. Findings prompted fixes to callback/consent amplification, uncapped Siteverify, redirect CSP, revocation log amplification, deferred JSON errors, indefinite proof admission, anonymous/authenticated guard congestion, and an HTTP-200-only hosted-read assertion. The hosted read now checks MCP success and exact noncanonical fixture content. A cleanup alarm is armed before external I/O.

This is independent agent-assisted source review, not an external security audit or production approval. No new authorization, desk-isolation or storage-write bypass was established. The inherited provider/KV code-race finding remains excluded from the release. Supported local Node 24.22.2 passes **130/130 tests** after reconciliation with #317, with typecheck and candidate/test bundle builds. Latest real CI is recorded in the handoff only after observation.

## Hosted scope and evidence

Separately named `newsroom-security-*-20261109` issuer/resource/runner Workers, fresh SQLite namespaces, KV result store and R2 bucket contain synthetic data only. Runner HTTP always denies; workers.dev/previews are disabled. No test mint/clock/invalidation route exists on the production candidate. Scheduled private bindings exercise real deployed state and HTTP handlers; exported results contain fixed labels and booleans, never synthetic token values.

The sequence tests two active grants plus pending login/code, one-winner CAS invalidation, old-token denial, fresh authorization/stale-retry safety, issuer outage, immediate compatible code replacement with preserved epoch, refresh replay family revocation and fresh-read recovery. It does not prove real GitHub/Turnstile acceptance, production S3 permissions or regional failover. The hosted resource uses only a new synthetic native bucket; release remains S3-only. All **52 hosted checks pass** (33 containment/seed, 4 outage, 15 recovery). Cron is removed, runner bindings are detached and its active code is deny-only; public/preview endpoints are disabled. Management readback and exact deployment IDs are archived in `release/security-hosted-recovery-20261109.json`. A lost running phase needs a fresh isolated run; never reset real auth state.

## Remaining exact unblockers

1. Holder + engineering: dedicated current-candidate widget/private credentials and receiver, real browser challenge/GitHub/consent, then complete hosted S3 lifecycle/refresh/replay/revoke/expiry tests. Do not reuse working grants. The original browser-cookie incident remains unobserved.
2. Security/operations owner: production S3 read-only scope, edge policy, legitimate burst/CPU measurements, coordinated disposable rotation and regional recovery rehearsal, export privacy canary and actual test alert delivery; accountable recipient and independent final sign-off.
3. Repository administrator: reviewed archive-recovery PR conversion, required-check proof on main-target PRs, then apply/read back main protection. Fresh public API reports main unprotected and zero rulesets; no setting was changed here.
4. President: approve final production targets/credential provisioning, frozen integration/deployment only after all preceding gates pass. November 11 is conditional.

Current management inspection reports older lifecycle endpoints enabled despite the previous handoff's closure claim. Only this assignment's new resources are changed; reconcile older lifecycle ownership before retrying its real browser flow. No main merge, production deployment, existing-secret change, working-grant revocation, canon/chronology edit or branch deletion is performed.
