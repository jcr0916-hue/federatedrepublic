# Newsroom readiness review — November 9, 2026

Target: operational newsroom beginning **Wednesday, November 11, 2026**, only after verified readiness. Current decision: **NO-GO for the new OAuth production release**. Existing legacy service is preserved; no new production pilot or publication was performed. This is a fresh assistant source/operations review, not independent external security sign-off.

## Evidence and scope

Read repository AGENTS.md, PR #314, its permanent handoff and INFRASTRUCTURE-COMPLETION.md before work. Base advanced during analysis by a documentation-only operator report; work incorporates #314 head `420897a5127794dacf11324947bfcf1ca86ef8ce`. That head has successful real GitHub [OAuth CI](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42655008608) and [publishing CI](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42655008676). No parent branch was updated by this work. All open newsroom PRs #304–#314 remain draft, open, and retained in their existing dependency order.

Reviewed issuer routing, grant/guard SQLite transitions, GitHub transport, resource allowlists/introspection, S3 signing/parser/bounds, release contract, CI and harness. New tests are synthetic only. The four-desk 149-check hosted result and earlier S3 permission tests remain inherited evidence, not newly repeated tests.

Cloudflare read-only management inspection established:

- Production remains deployment `7a53aadb-d87e-46e5-b7b8-831970590373`, version `08a99769-3618-488e-adbd-30a8be38a788`, native bucket and original five bearer-secret names. No production changes.
- Disposable lifecycle issuer's actual active version is `b4c618e5-8cc9-413a-b1be-fe6a9e7fd301`, deployment `1d7ebaa2-9ce0-48db-8f95-e67814a5185f`. The earlier `44945ca8...` is the preceding upload; installation of secrets produced the newer active version. Source inspection finds **neither currentEpoch nor invalidateAll**. It is an older candidate, not the containment implementation in #314. Its namespace IDs are preserved; no lifecycle credential operations were performed.
- Disposable client callback version `5ff79fad-7880-475f-9ce1-5cd75ea9b9e7` only forwards callback fields to `http://127.0.0.1:8765/callback`; it cannot set the issuer host's cookie and is reached after the failing issuer callback. It cannot explain the pre-consent error by itself. Mac receiver source is unavailable here.
- No lifecycle resource Worker exists in the enumerated account inventory. The audience configuration alone is not a deployed/tested resource.
- Existing S3 resource has a service binding to `newsroom-s3-issuer-acceptance`, S3 credential bindings, and **no native R2 binding**. No new permissions audit or production credential proof is claimed.
- Account Worker custom-domain list is empty. Every listed newsroom public endpoint has previews disabled and no Cron schedules. Existing legacy/provider, strict candidate, S3 acceptance and lifecycle endpoints initially have workers.dev enabled. Whole-account script settings show only the expected strict-resource→strict-issuer and S3-resource→S3-issuer service bindings; no caller of either lifecycle Worker was found. All four account zones were then enumerated (one page, four results); none has a newsroom Worker route. Unrelated zone configuration was read only to identify potential ingress, and was not modified.
- The old `newsroom-oauth-isolated-test` has invocation logs enabled and `redact_query_string:false`; this is a **logging-risk finding**, not evidence of actual secret exposure. Logs were deliberately not retrieved. It must not be promoted or used for new OAuth diagnostics. Existing working connections were not reconfigured.
- Lifecycle and S3 settings do not establish redacted operational monitoring. Blanket request tracing must not be enabled to diagnose OAuth. Query/code/state/cookie/header/body logging is prohibited.

## Callback failure: exact diagnosis and safe correction

`invalid_browser_session` is emitted before GitHub token exchange when state routing fails, the expected cookie is absent/malformed/duplicated, or its embedded grant ID differs from callback state. Wrong secret material with a valid same-grant routing ID reaches the DO and returns `invalid_callback`. Stored expiry also returns `invalid_callback` **if the cookie is still presented**. Browser expiry removes the cookie and can therefore produce `invalid_browser_session` instead. This refines the earlier handoff; expiry is not excluded.

| Scenario | Reproducible result | Interpretation |
|---|---|---|
| No cookie; malformed cookie; duplicate named cookies | 403 `invalid_browser_session`, no provider request | Browser did not deliver one usable session |
| Start A, start B in same cookie jar, return callback A with B cookie | 403 `invalid_browser_session`, no provider request | One fixed host cookie is replaced by a second authorization |
| Correct grant ID, wrong cookie nonce | 403 `invalid_callback`, no provider request | DO hash binding rejects substitution |
| Expired stored authorization with syntactically correct cookie | 403 `invalid_callback`, no provider request | Server-side five-minute expiry remains enforced |
| Foreign Origin | 403 `origin_not_allowed`, no provider request | Origin protection remains intact |
| Correct original cookie after an early rejected substitution | Consent succeeds | Rejected pre-claim attempts do not consume valid state |

The failed real browser request's cookie presence, age and navigation history are **not established**. Two concrete hypotheses require checking: a helper fetched `/authorize` server-side then opened only GitHub's Location (cookie stayed in helper); or a retry/second tab replaced the single cookie. Cross-app/private-browser handoff and browser cookie expiry remain plausible. Do not identify one as the confirmed incident cause without the request observations.

Safe corrective approach: the **same browser** must top-level navigate to the issuer's original `/authorize` URL, receive its Set-Cookie, visit GitHub, return to the exact issuer origin, and approve once. If a loopback helper starts the flow, it should 302 the browser to `/authorize`, not fetch that URL itself and forward only GitHub's redirect. Keep one flow/tab; finish within 300 seconds; restart from the beginning on failure. Never inject a cookie from a script, copy one between browsers, accept an unbound callback, loosen SameSite/Secure/HttpOnly/host-only flags, extend expiry to hide the problem, or reset/skip CSRF/PKCE.

Inspect only booleans: cookie stored, cookie sent, single cookie, same browser, same issuer host, under five minutes, no second start. Never share a HAR, callback URL, cookie value, code, state or token. The browser network panel itself contains credentials. Do not publish screenshots of it.

The local browser harness had a separate reproducible defect: both required limiter bindings were missing, making `/test/start` fail once ingress enforcement was added. This branch supplies isolated limiter bindings to both mocked Workers. Its HTTPS transport test covers Set-Cookie, mocked cross-host navigation, session rotation, Origin+CSRF consent, exchange, exact read tool list, and immediate denial after revocation. It is **not** a real browser cookie-policy or GitHub test. The failure reproduces against the unmodified parent harness and passes after correction. No production issuer/browser policy changed.

## OAuth lifecycle assessment

| Control | Source/local assurance | Remaining hosted proof |
|---|---|---|
| Authorization | Exact client/redirect/audience/read scope; numeric editor allowlist; S256 both legs; one-use state before provider I/O | Fresh GitHub consent on frozen current candidate and actual confidential client |
| Code exchange | Atomic SQLite issuance; correct verifier and redirect; proven reuse invalidates family | Hosted concurrent exchange, lost response and fresh recovery |
| Refresh | 900-second access; fixed 28,800-second family deadline; strict rotation and spent-token replay revocation | Real refresh race, successor denial on replay, exact refresh/client interaction |
| Expiry | Pending/code 300s, access 900s, refresh 28,800s; boundary and persistence tests | Actual-runtime expiry; no test clock or mint endpoint in deployed source |
| Individual revocation | Current/spent refresh proof revokes family; separate grants remain isolated; resource rechecks each request | Only disposable grant revoke and next-request denial at hosted S3 resource |
| Emergency invalidation | Persistent per-registered-client epoch, CAS retries, pending/code/access/refresh denial; cleanup/restart regression | Trusted internal operator binding, hosted new/fresh grant proof, coordinated recovery |
| Recovery | Restart/crash/lost-response local regressions; no authorization cache | Region diversity, outage, secret rotation, all-ingress closure and forward recovery |

The epoch is scoped by **registered client**, not a Cloudflare-wide kill switch. The current one-client design covers all Editor grants for that issuer registration. Future multiple-client registrations require an explicit coordinated issuer-wide procedure. Configuring a new client ID also selects a new guard; do not mistake that for invalidation of old registrations. Already in-flight authorized operations may complete.

Do not overwrite the working issuers or transplant their pre-epoch records. Freeze the reviewed bundle and use fresh grant/guard namespaces for current-candidate acceptance. The old lifecycle deployment cannot prove #314's epoch or forged-quota fixes. No hosted containment success is claimed here. Temporary endpoint closure is not token revocation or a containment rehearsal.

## Independent S3-only architecture assessment

**Design verdict: suitable least-privilege direction; conditional approval of the design only, production NO-GO.** Issuer has no storage data path; the read resource gets only bucket-scoped Object Read only S3 credentials and independently authenticated introspection. The legacy writer remains a distinct process with its existing bearer mapping. No native bucket, desk bearer, Editor bearer or GitHub/client secret belongs on the read resource. The frozen contract chooses `resource-s3-candidate.js`, not the native-R2 resource or historical provider/KV default bundle.

S3 adapter pins R2 account hostname, HTTPS and bucket; signs GET/List with SigV4, denies redirects, bounds object/list streams, constrains keys/prefix/limits/cursors, and fails on malformed pagination. The caller still validates issuer/audience/client/scope/expiry on every MCP request and admits only list/read. Historical #313 tests establish acceptance-bucket read/list and write denial; they are not proof about a future production credential. Require explicit negative Put/Delete/other-bucket checks on a **disposable credential** matching the proposed permission policy before granting production access. Do not send mutation probes to production.

Residual risks: a compromised read resource can exfiltrate every object that its credential can read, including editorial notes; bucket-wide read is appropriate only for the central Editor. It is not a desk-restricted agent architecture. S3 cost/availability and secret rotation are now operational dependencies. Regex XML parsing is constrained to a trusted TLS storage service with bounded input, not a general-purpose XML parser; no external entity expansion is performed. Storage writes and publication are intentionally outside this architecture. S3-only means the new reader uses S3, **not** that existing agents gain write access through it or that the legacy writer disappears.

## Distributed abuse, monitoring and recovery release blockers

Local approximate rate binding + strict shared DO quota is defense in depth, not distributed availability proof. Cloudflare confirms local counts are approximate and separate per location: [rate-limit documentation](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/). Per-IP budgets can affect mobile/NAT users; forwarded headers are not identity, and Worker/service subrequests require a trusted caller inventory.

A distributed caller can consume the public 60/minute authorize quota and starve legitimate login. Random well-shaped bearer routing IDs can cause per-grant DO work/storage lookup even though they cannot authorize and no longer spend the active introspection quota. Invalid Basic client traffic also incurs secret-verification work. Discovery and rejected routes still incur invocation cost. Raising quotas is not a correction.

Required acceptance: select a gated browser-start/edge challenge or another compatible authorization admission design; prove unauthenticated distributed traffic cannot consume the Editor's reserved login capacity; define source validation for workers.dev/routes/service bindings; measure actual ChatGPT and shared-IP bursts; bound expensive unauthenticated backend work and resource List traffic; test fail-closed errors, backoff and separate emergency-control capacity. No new public admin/mint route is acceptable. Any nonce/MAC admission redesign needs its own key lifecycle and protocol tests; it is not silently introduced in this review.

Operational owner: President authorizes incidents/releases; central Editor coordinates tests and handoffs. Proposed telemetry is an allowlist of event type, HTTP status class, route name (no query), rate-limit bucket, duration bucket, deployment ID and aggregated counts. No user ID, IP, key, token digest, raw URL/header/body, exception stack containing a request, or submission content. Verify log exports and traces by synthetic canary before enabling collection. Configure alerts for legitimate 429/503 bursts, provider failures, replay revocations, operator epoch changes, S3 errors and unexpected binding/deployment changes. Alert thresholds and destinations are **unassigned/unprovisioned**.

Recovery rehearsal must inventory workers.dev, previews/version URLs, custom domains, zone routes and internal service callers; close and externally prove denial at all paths; invalidate only disposable client epochs; rotate only disposable credentials in coordinated client/validator pairs; verify old access/refresh fail, stale retries cannot invalidate fresh grants, and unrelated grants remain untouched; reopen after frozen forward fix and fresh consent. Never restore pre-invalidation grant/guard/PITR state. Region tests must record non-secret colo identifiers and include at least two independently located clients; a single tool region does not qualify. No hosted rotation, regional recovery or independent external sign-off is asserted.

## Wednesday release gate

Proceed only with: frozen-source CI and hosted OAuth+S3 acceptance; abuse/monitoring/recovery gates cleared; administrative main protection reconciled with archive automation; complete onboarding negatives; explicit Presidential merge/deployment approval. Target date alone waives no gate. A limited use of already-existing legacy agents is a separate editorial/pilot decision and does not make the new OAuth architecture production-ready.

Follow [OPERATIONS-RUNBOOK.md](OPERATIONS-RUNBOOK.md). The non-secret Cloudflare/dependency snapshot is [readiness-management-20261109.json](release/readiness-management-20261109.json). Latest actual validation and branch disposition belong in the [permanent branch handoff](../../docs/archive/development/branches/newsroom-readiness-20261109.md).
