# Newsroom security completion — permanent branch handoff

Original branch: `feature/newsroom-abuse-recovery-20261109`. Parent: draft [PR #317](https://github.com/jcr0916-hue/federatedrepublic/pull/317), frozen `7cab06439c285e92f8d8d6d3bab7bcd8834cf7a5` (above #315). This continuation is experimental and unmerged. Retain the complete #304–#315 stack. Editorial draft [#316](https://github.com/jcr0916-hue/federatedrepublic/pull/316) remains independent on main at `80ce22335dcc3dec5b37e9eb2cb1632eef2a378d`; no editorial files are edited here.

Purpose: implement distributed abuse/cost controls, redacted monitoring, isolated hosted emergency containment/recovery, and a concrete unapproved release/protection package. Read repository AGENTS.md, #314/#315/#316 metadata and permanent handoffs before work. Synced project sources remain read-only.

## Dependency reconciliation

A pre-existing parallel security draft #317 was discovered when its branch name collided during creation. Its actual handoff/source was read, its `7cab0643` head fetched, and this continuation moved into a fresh `feature/newsroom-abuse-recovery-20261109` worktree above it. Preserve #317's route-local limits, fixed Analytics Engine counters/tests, original handoff and release plan. Overlaps were reconciled; signed browser proof now precedes callback/consent source quotas, so fabricated cookies cannot spend legitimate admission. Its historical handoff is unchanged; this is a distinct permanent continuation note.

## Changes and verification

- `src/access-admission.ts`: short-lived MAC envelopes for access and issuer-only browser/state credentials. Fabricated or expired credentials fail before source quotas, issuer calls or DO routing. MAC admission never authorizes data; each admitted MCP request still receives authoritative introspection. A separate issuer-only session key prevents a resource from signing browser sessions.
- `src/authorization-challenge.ts`: Turnstile browser form; strict server-side success/hostname/action/request-cookie cdata validation, one-use provider proof, bounded responses and deadline. A separately named anonymous guard caps Siteverify at 300/min; successful logins remain capped at 60/min. Anonymous traffic cannot queue on the authenticated epoch/control guard. A real widget/browser deployment is NOT established.
- Weighted authoritative storage budget (3,600 operations/min), maximum 201 calls/list, per-operation call allowance and a 10-second deadline for starting further storage operations. The S3 adapter retains its own six-second fetch deadline; this is not a hard ten-second end-to-end timeout. Resource propagates issuer 429/Retry-After. Control quotas remain separate.
- `src/security-events.ts`: fixed-schema structured events; no request URLs, headers, exception strings, credential/token digests, subjects or submission content. Anonymous denials are sampled at 1%; emergency events and operational failures are recorded explicitly. Storage wrappers cover deferred JSON failures and sanitize client errors.
- `acceptance/hosted-recovery.ts`: disposable scheduled, deny-all-HTTP harness, synthetic state only. Uses separate Workers, SQLite namespaces, KV result store and R2 bucket. Not the production S3 entrypoint; no real GitHub/Turnstile test or regional failover is implied.
- Release artifacts: [SECURITY-COMPLETION-20261109.md](../../../../workers/newsroom/SECURITY-COMPLETION-20261109.md), [RELEASE-PACKAGE-20261109.md](../../../../workers/newsroom/RELEASE-PACKAGE-20261109.md), review-only configuration and hosted evidence under `workers/newsroom/release/`.

Supported Node 24.22.2 local suite passes 125/125 before the final anonymous-guard separation and acceptance-runner assertion refinement; these final changes require their own validation and real CI before readiness claims. Initial full run caught a frozen S3-object Proxy invariant violation; the corrected empty-target forwarding wrapper passes the S3 regression. This was fixed, not treated as flaky. No dependency upgrade. Hosted results and final CI will be appended after actual observation.

## Independent source review and limits

A separate read-only review agent examined actual implementation and inherited boundaries. It found callback/consent lookup amplification, uncapped Siteverify calls, browser form-action redirect exclusion, full-rate anonymous revocation logging, deferred storage errors, and the anonymous/shared guard bottleneck. All received code fixes and focused regressions; short proof expiry bounds retired-credential cost capabilities. This is agent-assisted review, not external audit or release approval. Final human security/operations ownership remains required.

New sign-in availability can still be shed during a distributed challenge flood; Worker/edge costs and an unexpired stolen proof remain residual risks. The release requires production edge policy, real legitimate-client burst measurements, real challenge/browser acceptance, real hosted S3 lifecycle and independent sign-off. No automatic November 11 release.

## Decisions, rejected approaches and preservation

Reuse inherited S3 permission proof and 149-check four-desk evidence; do not repeat completed qualification/provisioning. Reject relaxed PKCE/cookies/CSRF, reusing working OAuth grants, real credential rotation/revocation, restoring pre-invalidation auth storage, unsafe downgrade, native production R2 binding, or interpreting successful synthetic HTTP 200 alone as a successful MCP read.

Shipped to main/production: nothing. Existing Worker/grant/secret configurations are not modified. Newly created isolated test Workers use synthetic, non-working credentials only. No canon, chronology or editorial status changes. No branches deleted.

Branch disposition: unfinished active dependency; retain this branch, its base and every open head/base. Handoff stays in the same draft PR. At eventual approved integration perform the AGENTS.md dependency/protection/history gates and record actual retention separately; no cleanup attestation or merge approval is implied. Exact final CI/head/hosted cleanup evidence is required below before handoff completion.

## Verified engineering checkpoint

After reconciliation, supported Node 24.22.2 passes **130/130 tests in 29 suites**, zero failures/skips; typecheck passes. Actual hosted synthetic seed/containment 33/33, outage 4/4, recovery 15/15 pass, including preserved epoch after immediate code replacement and exact MCP fixture content. Total **52/52**. Cron is removed; all new public/preview flags read false; privileged runner bindings are removed and active code only denies requests. Production baseline remains unchanged. See `workers/newsroom/release/security-hosted-recovery-20261109.json` for final IDs/hashes/limits. Real CI still must be observed on the saved PR head.
