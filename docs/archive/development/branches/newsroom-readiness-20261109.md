# Newsroom readiness continuation — permanent handoff

Branch: `feature/newsroom-readiness-20261109`. Parent: draft [PR #314](https://github.com/jcr0916-hue/federatedrepublic/pull/314), frozen head `420897a5127794dacf11324947bfcf1ca86ef8ce`. All draft dependencies #304–#314 and every head/base are retained. Continuation: draft [PR #315](https://github.com/jcr0916-hue/federatedrepublic/pull/315).

Purpose: prepare for Wednesday, November 11, 2026 subject to verified readiness; diagnose disposable `invalid_browser_session` without weakening security; review lifecycle, S3 architecture, distributed abuse/recovery, onboarding and operations.

## Experimental changes and actual validation

- Fix missing required issuer/resource ingress-limit bindings in the **local mocked browser harness**. No issuer/resource security implementation or original legacy bytes changed. Prepare an always-reporting `Newsroom readiness gate` for eventual main protection, with fail-closed path detection and full suite when relevant files change; no deployment permissions added.
- Add four callback-diagnosis runtime regressions and one full local HTTPS transport regression. Cookie loss/malformed/duplicate/replacement all fail before provider calls, valid state remains usable, same-grant nonce substitution and stored expiry fail at DO claim, and foreign Origin remains denied. Session rotation and Secure/HttpOnly/Lax/host-only/300s flags remain unchanged.
- Reproduced the harness defect against the parent source: new transport regression fails `500 != 302` at `/test/start`. Restoring the limiter binding fix passes. Full final local suite on supported Node **24.22.1**: **116/116**, zero failures/skips; TypeScript passes. All five builds pass (production implementation is unchanged). Initial real continuation CI on `9f8c84af`: pending final observation. The workflow-gate follow-up also requires its own real CI; do not substitute local tests for it.
- Fresh source/operations review, failure table, S3 least-privilege verdict and residual gates: [READINESS-REVIEW-20261109.md](../../../../workers/newsroom/READINESS-REVIEW-20261109.md). Desk mapping, acceptance negatives, intake/publication boundary and recovery procedure: [OPERATIONS-RUNBOOK.md](../../../../workers/newsroom/OPERATIONS-RUNBOOK.md).
- Non-secret Cloudflare/dependency evidence: [readiness-management-20261109.json](../../../../workers/newsroom/release/readiness-management-20261109.json). Production remains deployment `7a53aadb-d87e-46e5-b7b8-831970590373`, version `08a99769-3618-488e-adbd-30a8be38a788`; no credential changes or token operations performed.

## Verified observations and decisions

Read AGENTS.md, both requested #314 handoffs and prior review/index before work. #314 received a documentation-only operator Verification 04 read report during this review; incorporated it without overwriting the parent. Parent's latest real OAuth/publishing CI is green (runs `42655008608` / `42655008676`). Production/main remain unchanged; main ref `98430167c1c5130b41d329d0b99887c29f35ea4f`.

Disposable lifecycle issuer active version is `b4c618e5-8cc9-413a-b1be-fe6a9e7fd301`, from secret installation after initial source upload. Deployed source lacks currentEpoch/invalidateAll, so it cannot validate #314 containment. Resource for its configured audience is absent. Callback Worker only redirects to Mac loopback and cannot have caused the earlier issuer cookie rejection. Original browser cookie/request circumstances and local Mac receiver source are not established.

Safe retry must deliver `/authorize` and Set-Cookie to the same top-level browser, one flow/tab under five minutes, no server-side-fetch/GitHub-Location shortcut. No cookie copying or relaxed protections. Browser expiry may remove the cookie and cause `invalid_browser_session`; stored expiry with cookie still present produces `invalid_callback`. This corrects any implication that the observed error excludes expiry.

Both disposable lifecycle workers.dev and preview endpoints were **disabled** after inspection and their settings read back false; they can be reopened by the central Editor when a ready retry is scheduled. This is reversible idle-test closure, not grant revocation. No existing working endpoint/credential/grant was changed. Account custom-domain list is empty; all four zones have no newsroom Worker route; whole-account service-binding inventory finds no lifecycle callers. External HTTP probes returned Cloudflare 403/1010: denial from this runtime, not proof of which control denied. Managed endpoint settings are independently verified false. No test resources/branches were deleted.

S3 reader design is conditionally suitable: separate read-only bucket credential, no native R2/desk secrets, authoritative read-only introspection. It is not desk-agent OAuth, and does not replace legacy submission/review. No independent external audit or production credential permission proof is claimed. Older provider/KV Worker has unredacted invocation-query logging risk; no log contents were accessed and no working connection was altered.

## Remaining blockers / next work

**NO-GO for new OAuth production release.** Still required: current frozen candidate hosted with fresh auth namespaces; real GitHub consent and complete hosted lifecycle/S3 tests; distributed authorization-capacity and backend cost controls; safe monitoring/alerts; hosted internal containment, coordinated disposable rotation and multi-region recovery; final security/operations sign-off; main protection/archive workflow reconciliation; explicit Presidential integration/deployment approval. No date automatically clears these gates.

Mac-only dependency: operator's private receiver/client credential and browser consent. Remote code/CI/inventory and synthetic review are central Editor work, not tasks to shift to the operator. Group unavoidable operator sessions into (1) private receiver/browser consent; (2) repository-administrator main protection and sign-off ownership; (3) final concrete release approval once all gates pass. The protection connector lacks ruleset mutation tools; do not improvise a production policy or broad Actions bypass. Existing archival workflow directly pushes archive-only changes to main; reconcile it with PR requirements before enforcing.

## Preservation / rejected approaches / disposition

Shipped to main/production: **nothing**. Prepared: harness correction, synthetic tests and operational records. Historical inherited hosted evidence remains in #314 and parents; do not repeat S3 permission provisioning or the 149-check legacy test without a reason. Unresolved incident cause is not converted into a claimed fix. Rejected: cookie/CSRF/PKCE relaxation, copied credentials/HARs, editing working grants, synthetic mint/clock deployment, restoring pre-revocation state, marking local/self-review as hosted/external sign-off, and advancing canon/time.

Retain this unfinished branch and all open PR dependencies. No merge, branch deletion, production deploy, permission/credential change or canon operation is authorized/performed. Pending eventual branch-disposition check must follow AGENTS.md and lifecycle gates after reviewed integration; no cleanup eligibility is asserted.
