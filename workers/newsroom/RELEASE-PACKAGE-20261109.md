# Newsroom production release package — November 9, 2026

**NOT APPROVED FOR DEPLOYMENT. NO-GO until every gate below is satisfied.**

This is a review package, not permission to merge, publish, rotate credentials or deploy. The existing `federated-republic-newsroom` Worker, bucket and working OAuth connections remain in service unchanged. The candidate adds an independent central-Editor **read-only** OAuth service; it does not replace legacy desk submission/review or provision TypingMind identities.

## Frozen source and dependency order

Review this feature branch above draft #317 (`7cab06439c285e92f8d8d6d3bab7bcd8834cf7a5`) above #315 (`b466ecfc81e1efe99b3b57ed584744cd03f82e14`) and #314 and the retained #304–#313 chain. Integrate only after explicit Presidential authorization, in dependency order, preserving history. Do not substitute the provider/KV default bundle or skip parents. Editorial #316 is independent on main; reconcile its activation gates with this package without rebasing or editing its head here.

Build issuer from `src/issuer-candidate.ts` to `dist/issuer-candidate.js`; build the production read resource from `src/resource-s3-candidate.ts` to `dist/resource-s3-candidate.js`. `dist/worker.js` is **excluded** as the new OAuth target. `acceptance/hosted-recovery.ts` and its private minting capability are disposable test infrastructure and must never be in a release bundle or production binding inventory.

`release/security-production-configuration.json` contains the exact review-only API metadata shape, binding names, separate services and namespace migration definitions. Invalid/unassigned target names deliberately prevent treating it as a ready deployment. Target account is `5fa1569f8ddb79c8fcf2138a2ae3f090`; approved Worker names, final HTTPS issuer/resource/callback origins, fresh DO namespace IDs and Turnstile sitekey remain operator selections. Record their exact values and frozen bundle hashes in the final approved manifest; do not guess them from disposable infrastructure.

## Credentials and least privilege

Provision only after approval, through private stores, without passing values through chat, source or command arguments:

- Issuer `ISSUER_CLIENT_SECRET_SHA256`: SHA-256 of a fresh independent confidential-client secret (at least 256 random bits). The raw secret belongs only in the approved client's private authentication store. Registration is one client ID, exact downstream HTTPS redirect, numeric GitHub Editor identity and one exact audience `/mcp`.
- Issuer `ISSUER_RESOURCE_SECRET_SHA256` and resource `RESOURCE_VALIDATOR_SECRET`: independent high-entropy validator credential; validator ID differs from client ID. Client credentials cannot introspect; validator credentials cannot issue/revoke. Coordinate peer installation while ingress is closed.
- Issuer `ISSUER_SESSION_KEY`: independent 32-byte random hex key, issuer-only, for five-minute browser/state admission proofs. It must differ from `ISSUER_ADMISSION_KEY`.
- Issuer `ISSUER_ADMISSION_KEY` and resource `RESOURCE_ADMISSION_KEY`: same independent 32-byte random hex key for fifteen-minute access admission proofs. The MAC does not replace authoritative token introspection or epoch invalidation. A proof retained after revocation can still cause bounded inspection traffic until its local expiry.
- Dedicated GitHub OAuth App ID/secret, exact issuer `/oauth/callback`, no repository scope, approved numeric Editor only. Existing working Apps/grants are not migration test subjects.
- `ISSUER_TURNSTILE_SITE_KEY` and issuer-only `ISSUER_TURNSTILE_SECRET`: separately approved widget restricted to the actual issuer host. The backend enforces exact hostname, action `newsroom_login`, request-cookie cdata and one-use Siteverify. Do not use the synthetic/test keys on a release. Secret/widget creation was not performed here.
- Resource-only R2 S3 access ID/secret: **Object Read only**, one approved newsroom bucket, correct account/jurisdiction endpoint. Preserve inherited isolated Put/Delete-denial proof; obtain actual production policy evidence before release without production mutation probes. No native `NEWSROOM` binding, desk `KEY_*`, GitHub secret, client secret, OAuth KV or issuer session key on the production resource.

Secret/hash rotation is not equivalent to invalidating every access grant. Close all ingress, increment the registered-client epoch first, verify denial, then coordinate client/validator/admission/session/GitHub/S3 rotation as appropriate. Do not retrieve or change existing working secret values as part of preparation.

## Deployment and ingress boundaries

1. Capture current production version/deployment, route/domain/preview/version URL inventory, service callers and resource policies. Existing baseline: deployment `7a53aadb-d87e-46e5-b7b8-831970590373`, version `08a99769-3618-488e-adbd-30a8be38a788`; re-read immediately before an approved release.
2. Provision **new** issuer/grant/guard namespaces. Use `IssuerGrant` and `IssuerGuard` SQLite classes. Bind the resource's `ISSUER` service only to the approved issuer. Preserve current authentication stores and legacy desk Writer service. Do not attach production data until least-privilege review passes.
3. Keep public ingress closed during provisioning. Configure chosen domains/routes, every workers.dev/version/preview path and all service-binding callers explicitly. Workers.dev closure alone is insufficient. Public issuer endpoints must remain capable of real browser consent; no public admin, clock, seed, test-mint or invalidation endpoint exists.
4. Install reviewed rate bindings: issuer and resource have distinct namespace IDs; proposed source limits are 120/minute for authorization and 600/minute MCP, subject to legitimate ChatGPT burst measurement. Trusted edge source identity and upstream Worker restrictions require edge/WAF review. These per-location approximate limits are supplementary, not distributed quota guarantees.
5. Strict global budgets: successful authorization 60/minute; token 240; active introspection 1,200; revoke 120; storage 3,600 weighted calls. Anonymous Siteverify gets a separate `anonymous-challenge:v1:<clientId>` guard, 300/minute, so overload cannot share the authenticated epoch/control coordination instance. One list reserves `1 + 2*limit` calls, maximum 201; one read reserves 2. Fresh sign-ins can be shed under challenge flood; authenticated budgets stay separate. A stolen unexpired legitimate proof can still spend its source/read budget.
6. Enable allowlisted custom logs with invocation logs off, query redaction on, no logpush/export destinations or tail consumers without privacy review. Automatic traces are deliberately off: outbound S3 URLs identify submission keys and OAuth URLs/headers are sensitive. Enabling traces requires a separate demonstrated redaction policy; generic tracing advice does not override this privacy boundary.
7. Validate closed-ingress configuration, signed admission, real browser challenge/GitHub/consent, private token delivery, S3 list/read, strict refresh/replay/revoke, account-wide invalidation, outage/restore and no-write/cross-desk negatives on disposable resources. Freeze exact final SHA and real CI results. Production burst/CPU/subrequest measurements and regional rehearsal must be recorded; no result is inferred from unit tests.
8. Obtain independent security/operations sign-off, branch-protection/archive-automation readiness and Presidential integration/deployment authorization. Only then execute the reviewed manifest and supervised one-client pilot. A calendar target is not authorization.

The inherited #317 fixed-category Analytics Engine counters and mandatory `NEWSROOM_METRICS` binding remain in the review contract, with distinct issuer/resource datasets. They complement the new structured logs. Hosted Analytics Engine ingestion and alert delivery remain unverified; no dataset or destination was provisioned.

## Privacy-preserving monitoring and alert acceptance

Application events have exactly `schema`, `service`, `event`, `route`, `status`, `sampleRate`. Do not add request identifiers, user names/IPs, URL paths/queries, token/code/state digests, auth headers, errors, editorial notes or content. Source IP is used only inside the local limiter; it is not logged. Anonymous 4xx/429 events are sampled at 1%; counts are estimates and cannot prove absence of abuse. Service/storage/containment events and authenticated refresh/revoke outcomes are explicit. Platform metrics provide unsampled aggregate request/error/CPU counts without app contents.

Before release, the operations owner must configure and receive a test of each alarm at the approved destination (none configured or notified by this task):

- Immediate high-priority containment alert on any `containment_changed`; investigate unexpected `containment_stale` bursts.
- Critical on any authenticated revocation failure, or three issuer/resource/storage failures within five minutes. Distinguish infrastructure failure from sampled anonymous invalid-auth noise.
- Warning on three refresh failures in five minutes; page on sustained failure with no successful refresh for five minutes during known active operations. Never retry a spent refresh token: fresh authorization is required.
- Warning on weighted storage/rate exhaustion in two consecutive one-minute windows or service-binding 503s; inspect platform aggregate error/CPU and challenge-denial trends. Do not alert on a raw-query log search.
- Privacy canary: send unique synthetic bearer/code/refresh/client-secret/fixture strings only to isolated tests, then verify they are absent from retained logs/exports/traces. Current fixed-schema unit tests and sanitized hosted results are evidence for code, not proof of all platform exports or successful notification delivery.

Alert recipient, owner/escalation, retention (proposed seven days for security-event logs), access controls and provider deletion behavior require explicit operational acceptance. Do not claim monitoring is operational merely because code emits events.

## Emergency containment and rollback

Stop onboarding/scheduled clients; inventory and close all affected public and internal ingress, including service-binding callers. Retain deployment IDs, timestamps and non-secret event evidence. Rehearse against a separately named namespace; never use a working connection for destructive tests.

A trusted operator-only binding addresses the **registered client's** `IssuerGuard`, reads `currentEpoch()`, calls `invalidateAll(observedEpoch)`, and records changed/epoch. There is no global HTTP admin endpoint. With this single-client design it invalidates all grants for the configured Editor account/client; it does not revoke other issuers or Cloudflare-account credentials. If registration expands, every configured client must be enumerated and invalidated separately. The anonymous guard is not the containment target.

Verify all pre-event pending sessions, issued codes, access and refresh credentials deny on the next newly admitted operation. An already admitted in-flight read may finish. Create a fresh synthetic authorization and prove a stale CAS retry cannot invalidate it. Epoch changes survive quota alarms and service code replacement. Do not restore SQLite/PITR or change namespace bindings to a pre-invalidation snapshot: that can resurrect credentials.

Rollback keeps ingress closed, preserves the monotonic current authentication store and S3/legacy data, and restores only a reviewed compatible code version or a forward fix. Never downgrade to epoch/MAC-unaware code, reattach an old namespace, roll back secrets independently or enable old version URLs. Cloudflare code rollback does not roll back attached storage. After secret coordination and synthetic lifecycle acceptance, reopen only explicitly approved ingress and reconnect the affected client. Log every step without raw credentials. Regional service loss and manual provider recovery remain a separate unverified rehearsal.

## Main protection and archive automation plan

Live read-only GitHub inspection on November 9 reports main `98430167c1c5130b41d329d0b99887c29f35ea4f`, `protected:false`, and no rulesets. No protection setting is changed by this PR.

Proposed rule for `refs/heads/main`: PRs required, at least one independent approval, stale approvals dismissed, conversation resolution required, checks required with latest target branch, block force pushes and deletion, apply to administrators, no broad actor/Actions bypass. Preserve merge commits for original stacked history; do not require linear history while the permanent-preservation policy relies on merge ancestry. Required checks after their main-target proof: **Newsroom readiness gate**, **World publishing check**, **Constitution archival check**. The first two run on every PR; archival check runs on all main PRs. Do not globally require path-filtered historical audit checks. Gate names/App IDs must be read from actual final main-target runs, not guessed.

The current Constitution recovery workflow has `contents:write` and directly pushes archive-only changes to main. Enforcing PR-only protection immediately would break it. Before activating the rule, prepare and review a separate workflow change that opens/updates a dedicated archive recovery PR, limits its staged paths to `docs/archive/constitution`, retains reconcile tests, serializes recovery, and never self-merges. Use a narrowly scoped GitHub App to open the PR and trigger ordinary required workflows; GITHUB_TOKEN-created/updated PRs now create approval-required workflow runs; a write-access human must approve them. A dedicated scoped App supports automatic required-check runs without that extra prompt. Avoid a generic Actions bypass. Verify a synthetic no-canon fixture in an isolated repository or reviewed main-target test; normal archivist PRs must receive the same publishing/archival checks and independent merge authority.

Sequence: approve/integrate the always-reporting gate and reviewed archive-PR conversion; prove an unrelated PR and a relevant newsroom PR report the required gate; prove archive recovery creates a reviewable PR with checks; export current policy; administrator applies proposed rules; read them back and verify ordinary direct pushes/force pushes/deletion are denied while reviewed PR integration succeeds. Record expected status and rollback policy. Administrative protection changes are a separate approval step, not executed here.

## Measurable release gates and exact owners

- Engineering: all latest-head real GitHub jobs succeed; supported Node suite, typecheck and every bundle; no content/canon/legacy-byte changes. Parent/parallel branch refs retained.
- Engineering + holder: current-candidate real hosted browser challenge and GitHub consent, private receiver, end-to-end S3 list/read, refresh race/replay/revoke/expiry and fresh reconnect all pass. No working grant is used. A real browser must verify CSP/navigation, not just HTTP redirects.
- Engineering + operations: synthetic hosted containment/outage/code replacement results archived; separate regional rehearsal and coordinated credential-rotation rehearsal pass. Test HTTP/version/preview endpoints and cron disabled, test-only bindings detached after evidence.
- Operations/security owner: production S3 read-only policy proven, edge policy and legitimate burst/CPU budgets accepted, privacy canary/export review and test alert delivery pass, remaining risks explicitly accepted or fixed.
- Repository administrator: archive PR automation verified, exact required checks observed on main-target PRs, rules applied/read back and bypass denied.
- President: assign/accept security and operations approvers, approve final production target/credential provisioning and final concrete integration/deployment manifest. No approval requested for routine engineering; no deployment until every preceding gate passes.

Agent activation then follows #316's qualified roster and correction list. Corindal/Korda/Varek/Federal server mappings do not establish installed TypingMind credentials. Additional desks need explicit supported mappings and isolation tests. `ACCEPTED` remains unpublished; no schedule, story, canon or fictional time is advanced by this package.

## Primary platform references

- [Cloudflare rate-limit locality and approximation](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
- [Cloudflare logs and invocation controls](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).
- [GitHub protected-branch settings](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
- [GitHub automation token and workflow approval behavior](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).
