# Newsroom security completion — permanent feature-branch handoff

**Original branch:** `feature/newsroom-security-completion-20261109`  
**Parent:** draft PR [#315](https://github.com/jcr0916-hue/federatedrepublic/pull/315), frozen starting head `b466ecfc81e1efe99b3b57ed584744cd03f82e14`. Draft PRs #304–#315, and editorial draft [#316](https://github.com/jcr0916-hue/federatedrepublic/pull/316), remain distinct and must be retained.  
**Status:** experimental, NO-GO for production. No merges or deployments.

## Purpose and significant files

Address additional security readiness gaps through actual implementation and synthetic regressions, while preserving legacy newsroom connections and canon. Source change: `workers/newsroom/src/ingress-rate-limit.ts` adds distinct callback/consent/token/revoke categories; `issuer-candidate.ts` requires ingress budget before callback durable grant, consent, authenticated token and revoke work; `resource-candidate.ts` and issuer emit only bounded categorical operational counters via new `privacy-telemetry.ts`. New tests: `test/public-ingress-isolation.test.ts` and `test/privacy-telemetry.test.ts`. Review-only release contract adds required monitoring bindings; `SECURITY-COMPLETION-RELEASE-20261109.md` records exact names/bindings, operational checks, risks, incident and rollback plan. This handoff satisfies AGENTS.md; no files from editorial PR #316 were touched.

## Actual verification

Source documents and real prior PR heads/handoffs (#314, #315 and #316), AGENTS.md, issuer/grant/guard, GitHub provider transport, S3 storage adapter, resource read allowlist and rate-limit implementation were inspected directly. Historic hosted 149-check four-desk acceptance and existing 116-test #315 CI are **inherited predecessor evidence**, not rerun here. New code/tests are committed to this branch for real GitHub CI; final results and exact URL **pending**. Container network could not resolve github.com; use connected GitHub writes and CI checks, not an invented local test result. New tests use simulated Miniflare/DO/R2 only and do not interact with any real credential or production endpoint.

## Decisions and rejected approaches

- Use distinct route-local approximate counters on callback/consent/authenticated token/revoke; keep introspection independent of public per-IP bucket. Invalid confidential-client auth never charges valid-client token budget. Preserve unchanged secure cookie/CSRF/PKCE and original grant state machine.
- Fixed telemetry categories are allowed, never raw request context, IP, code/token/digest, browser state or confidential submission contents. Binding/alert provisioning and complete error mapping remain outstanding; synthetic counter behavior is not proof of installed observability.
- **Do not claim** this fixes distributed many-source authorization capacity abuse. Public 60/min shared grant budget remains vulnerable to exhaustion and requires compatible edge admission/fairness + hosted multi-region acceptance. Low per-IP limits can affect NAT/shared user egress.
- Rejected production/connected OAuth operations; changing existing release bindings; inventing successful Github consent, token invalidation, emergency hosted exercise, external reviewer sign-off, or CI result; altering main, published World, production grant, archived branches or agent credentials.

## Unresolved

Real GitHub CI, full hosted synthetic OAuth lifecycle, legitimate-rate capacity reserve, backend cost mitigation, operational monitoring/alerts ownership, multi-region emergency containment and rotation rehearsal, audit of logging settings, independent security approval, ruleset/archive-bot compatibility, exact Presidential permission for merge/deploy. Release plan is **NOT APPROVED FOR DEPLOYMENT**; environment owner must separately approve all new Worker names/bindings and secrets. Existing #315 callback browser failure still lacks the original browser/cookie observation. Source review is implementer-led, not external independent sign-off.

## History and disposition

Source origin, frozen parent HEAD, PR links and historical handoffs are retained. **Shipped to main or production: none.** Retain this unfinished feature branch and all active PR dependency branches; no deletion. Once reviewed, perform a read-only branch dependency/protection check, preserve original tip history and complete the rolling cleanup ledger per AGENTS.md. `main`, `archive/legacy-project-material`, all original production grants and draft #316 are untouched. Exact final SHA / CI evidence must be attached to the draft PR before eventual merge review.
