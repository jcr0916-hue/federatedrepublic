# Torenthia newsroom — November 16, 2026 launch decision

**Status: NO-GO for unattended production as of November 15, 2026.** A staffed, unscheduled Federal pilot may become eligible only after the explicit gates below are evidenced and the President approves the specific pilot. This is an operational assessment, not an authorization to merge, deploy, access secrets or enable agents.

## Confirmed preparation

| Item | Evidence | Current disposition |
| --- | --- | --- |
| Newsroom roster, workspaces and editorial ledger | Draft [#323](https://github.com/jcr0916-hue/federatedrepublic/pull/323) | Proposed; not merged |
| Synthetic Federal assignment | Draft [#324](https://github.com/jcr0916-hue/federatedrepublic/pull/324) | Proposed; not merged |
| Signed Federal writer / R2 read-only fixture | Draft [#325](https://github.com/jcr0916-hue/federatedrepublic/pull/325) | Synthetic exercise only |
| Vercel Gateway contract | Draft [#326](https://github.com/jcr0916-hue/federatedrepublic/pull/326) | Specification only |
| Single-attempt Gateway adapter | Draft [#327](https://github.com/jcr0916-hue/federatedrepublic/pull/327) | Offline adapter, unwired |
| Durable reservation *policy* | Draft [#328](https://github.com/jcr0916-hue/federatedrepublic/pull/328) | No deployed durable transaction store |
| Desk-scoped verified assignment reader | Draft [#329](https://github.com/jcr0916-hue/federatedrepublic/pull/329) | Read-only/offline, no state desk writer |

On Nov 15, the GitHub **Newsroom workspace check** (including `node --test --test-timeout=10000 scripts/newsroom/*.test.mjs`) and **World publishing** workflows both passed for the last observed heads of #328 and #329. Those successful fixtures do **not** verify production providers, credentials, branch rules, durable writes or live cost control.

The authenticated Vercel account lists the existing `federatedrepublic` project with `AI_GATEWAY_API_KEY` configured for website production and preview. Its secret value has **not** been accessed. This does not establish that a separately scoped trusted agent runtime can use it.

## Release blockers — each requires positive evidence

1. **Dependency and protected-main review.** All draft PRs #323–#329 need reviewed dependency order and scope; effective `main` rules must be checked by a repository admin, including required approvals, stale approval dismissal, source of required World publishing check, force-push/deletion restrictions and App bypass actors. Do not merge merely because CI is green.
2. **Trusted runtime and budget persistence.** Deployable runner with isolated identity, cancellation and stable slot claims; atomic durable reservation storage across workers/restarts; per-slot/day budget; robust reconciliation of uncertain provider responses; verified one-attempt behavior. Current `budget-reservation.mjs` defines a transaction interface, **not** a durable backend.
3. **Identity and inbox least privilege.** Review/approve dedicated repository-scoped GitHub App (Contents write only where policy permits; Pull requests read; Metadata read), independent grant-signing key, and bucket-scoped R2 Object Read Only connection. Demonstrate the managed roster cannot be bypassed via legacy TypingMind credentials.
4. **Gateway model and spending gate.** Select/benchmark actual model IDs and attest current per-token rates and account/provider routing; check maximum generated tokens, hidden reasoning tokens, retries, upstream behavior and per-job/daily provider exposure. An existing website Gateway key is not a dedicated agent budget. Vercel's catalog as checked Nov 15 lists candidate `google/gemini-2.5-flash` at $0.30/$2.50 per million input/output tokens and `anthropic/claude-haiku-4.5` at $1/$5; these are **reference prices**, not selected models or quality validation. The nominal 16,000-input/4,096-output envelope would be $0.01504 or $0.03648 respectively before unmodeled fees/tokens.
5. **End-to-end supervised acceptance.** Verify pinned authoritative source packet, original receipt hash, editor decision and exact PR, auth grant revocation/pause, model output provenance, one draft notes write, duplicate replay, loss-of-response reconciliation, telemetry and incident rollback. Run the no-network Ashbridge Federal/state-desk fixture after establishing the **actual** state jurisdiction; do not invent it.
6. **Editorial/publication separation.** All outputs remain proposed; Central Editor reviews. Publication and autonomous scheduling are individually authorized later, not implied by a successful technical pilot.

## Tomorrow's safe decision ladder

**A. Default:** retain every managed switch off, keep existing TypingMind operations unchanged; run read-only checks and fixtures. No paid calls.

**B. Optional staffed Federal pilot:** only after all applicable blockers above are evidenced, the President explicitly approves a precise spending cap, assigned model, scope, installed permissions, one review draft and a limited execution window. Enable only Federal for that window. Stop and park the roster at its end; review the exact diff, usage/charges, receipt, policy ref and operator audit. The Federal job is not a newsroom publication.

**C. State desk or unattended production:** *separate approval* only after desk-generic writer isolation, Ashbridge acceptance, durable claims and scheduled-pause/recovery evidence. Do not describe the offline desk reader as sufficient for state-agent production.

## Go/no-go protocol and rollback

At release review, Central Editor and operator record a dated matrix of every blocker as **PASS** (with immutable PR/commit/log or configuration attestation), **FAIL**, or **NOT VERIFIED**. Any FAIL/NOT VERIFIED is **NO-GO for that launch scope**. President decides whether to approve an eligible pilot.

If a pilot fails: immediately stop dispatcher, prevent new signed grants, pause managed global and desk switches in protected policy, terminate in-flight work, revoke compromised scoped credentials if necessary, reconcile pending provider charges and ambiguous GitHub/R2 results, verify no canon/publication changes, and append an incident/handoff in GitHub. Do not delete original R2 receipts or overwrite audit history. Legacy TypingMind credentials and Worker ingress require separate review; the managed roster does not disable them.

## Next implementation assignment

Complete a genuine transactional persistence adapter (not a map), build a trusted dispatcher with cancellation and cost reconciliation, and connect the guarded Gateway and existing Federal writer. Follow with an actual staging end-to-end test. Publish no automatic schedule until the pilot is accepted.
