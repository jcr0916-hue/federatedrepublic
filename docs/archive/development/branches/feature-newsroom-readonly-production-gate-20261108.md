# Branch history — feature/newsroom-readonly-production-gate-20261108

**Original branch:** `feature/newsroom-readonly-production-gate-20261108`  
**PR:** https://github.com/jcr0916-hue/federatedrepublic/pull/309 (draft, based on PR #308)  
**Head commit at initial CI validation:** `939f86f6bbe150e7153ef62d87997c7d9997a0e2` (documentation-update SHA pending revalidation)  
**Status:** EXPERIMENTAL, UNMERGED. NO production deployment approval.

## Purpose
Reconcile the earlier KV-based newsroom OAuth integration in PR #304 with the separate hardened read-only issuer/resource implementation in draft PRs #305–#308. Define a safe production architecture without selecting any actual deployment target, credential or production R2 permission.

## Changes and artifacts
- `workers/newsroom/PRODUCTION-READONLY-RELEASE.md`: architecture decision, exact issuer/resource/legacy separation, source entrypoints, binding invariants, risk register, ordered preflight/rollout gates, explicit presidential approval checkpoints, incident recovery and rollback. Production R2 write-capable binding risk and refresh-loss reauthorization are noted.
- `workers/newsroom/release/readonly-production-boundary.json`: machine-readable **non-deployable** contract (no real production names, secrets, endpoints, buckets or automatic actions).
- `workers/newsroom/test/readonly-production-boundary.test.ts`: regression checks for no deployment approval, separate build entrypoints, two-tool read scope, binding isolation, and forbidden legacy keys in the OAuth resource.
- No edit to `src/index.ts`, issuer/resource runtime code, existing Worker deployment settings, production R2, secrets or canon.

## Verification and findings
- Read-only Cloudflare settings: production `federated-republic-newsroom` has five `KEY_*` secrets and `NEWSROOM`, with compatibility date `2026-10-01`. Isolated issuer has 12 bindings; isolated resource has 7; both have compatibility date `2026-11-07`. Actual secret values were not accessed. No resource was modified.
- Source review: `scripts/build.mjs` still targets `src/index.ts` (provider/KV path); candidate build scripts separately target `src/issuer-candidate.ts` and `src/resource-candidate.ts`; the existing `cloudflare.config.ts` is empty and has no production deployment target.
- Previous real ChatGPT read/list/discovery success is retained in PR #307/#308 handoff notes. Current branch is a release plan with static CI assertions, **not** an independent security audit or proof of production R2 least privilege.
- **Verified CI:** on commit `939f86f6bbe150e7153ef62d87997c7d9997a0e2`, GitHub Actions `Newsroom OAuth checks` run [42498242777](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42498242777) passed; `World publishing` run [42498242806](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42498242806) passed. The follow-up handoff-only commit requires its own green status before any approval review.

## Decisions and rejected alternatives
- Selected: preserve original live bearer-based newsroom unchanged, add two separate OAuth Workers (issuer and read-only resource) if independently approved.
- Rejected for initial release: shipping original #304 `dist/worker.js` as the hardened OAuth architecture; merging token systems; adding review/submit/publish scopes; reusing candidate test credentials/DOs/R2; modifying existing production Worker to accommodate OAuth.
- Reuse: the working Verification 04 isolated client, tested source bundles, existing local security regressions and branch handoff findings; do not replay previously solved client-secret or `ui_locales` debugging.

## Open follow-ups / release blockers
Independent security review; production R2 binding write capability/least privilege; operational logging, per-source rate limiting and shared budgets; hosted multi-region replay; grant supersession policy; selected NEW production Worker names and production-only secrets; production R2 attachment approval; monitoring, failure handling and rollback rehearsal; final Presidential merge/deployment approval.

## Preservation and branch disposition
All work is retained in this draft PR and is not shipped to `main`. Preserve the entire open PR dependency chain #304 → #305 → #306 → #307 → #308 → this branch. Do not delete or rename branches while dependencies exist.

**Branch disposition:** RETAIN (open work and active dependency). Later cleanup requires frozen tip SHA, merge history reachability, protection checks, live deployment and automation references, seven-day branch cleanup review and SHA-leased deletion per `AGENTS.md`. Live deployment/automation references checked only at the read-only configuration level; final deletion dependency check is NOT ESTABLISHED.
