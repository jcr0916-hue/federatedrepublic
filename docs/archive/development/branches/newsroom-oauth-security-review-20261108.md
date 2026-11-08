# Branch history — newsroom OAuth security review

**Original branch:** `feature/newsroom-oauth-security-review-20261108`

**PR:** [draft #310](https://github.com/jcr0916-hue/federatedrepublic/pull/310); based on [draft #309](https://github.com/jcr0916-hue/federatedrepublic/pull/309) at `afc95cc362f6e25d9c5b60dd9d287b8ea381daf1`

**Implementation checkpoint:** `8e961ad37f97fc8767c405a72b456ff260e96a4b`; subsequent defect-characterization/evidence commits are tracked in PR #310. No final merge/cleanup attestation is issued.

**Status:** experimental, release blocked; nothing shipped or deployed

## Purpose

Review draft #304–#309's hardened issuer/read-only resource and add safe branch-only regressions/mitigations. This agent-assisted source review is **not an independent external audit** and does not clear the independent-review release gate. Preserve all dependency branches, main, production, canon and Verification 04.

## Changes and artifacts

- [Security review](../../../../workers/newsroom/SECURITY-REVIEW-20261108.md): evidence, severity, prerequisites, fixes, residual risks, source/bundle pins and open release gates.
- `issuer-candidate.ts`: authenticate before charging the registered-client budget.
- `issuer-grant.ts`: transactional hash-only spent-refresh and redeemed-code proof; proven replay revokes successors; a spent refresh can revoke after a refresh/disconnect race.
- `readonly-storage.ts`, resource call site and declaration: frozen get/list-only capability for preserved read handlers. Raw R2 binding remains write-capable.
- New adversarial/storage tests and updated lifecycle assertions. Production release guidance now inventories all ingress and forbids restoring pre-revocation authentication state as rollback.
- The first CI exposed a further code-redemption race in the excluded provider/KV path. Test-only scheduling in `fixture-worker.ts`/`runtime.ts` forces two pending-code reads; `oauth.test.ts` proves two distinct tokens are active. This replaces an unreliable assertion of KV serialization with an explicit defect characterization, while retaining the hardened issuer's strict concurrency assertions. No provider/legacy runtime code was changed for that finding.

## Results and verification

- Supported local Node 24.22.2. Frozen #309: 82/82 tests pass. Initial nine adversarial cases: seven fail on frozen code, reproducing the recorded lifecycle/quota defects; two pass, including a demonstration of unresolved resource-mediated exhaustion.
- Final local suite: **94/94 tests pass**, zero failures/skips. TypeScript, release/fixture/issuer/resource builds and complete `world:publish-check` pass. Online newsroom dependency advisory lookup reports zero advisories; lockfiles unchanged.
- Existing tests retain process-group crash/restart and expiry coverage. New tests cover multi-generation refresh replay, duplicate-race quarantine, revocation/refresh races, redeemed-code proof after restart, invalid-client quota isolation and nonempty R2 object/metadata preservation.
- Initial Linux CI at `8e961ad3`: [Newsroom OAuth run 42500808335](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42500808335) failed the inherited provider/KV concurrency assertion (93/94 tests pass); [World publishing run 42500808328](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42500808328) passed. The deterministic local provider-race characterization passes all 22 OAuth adapter tests. Follow-up CI remains pending until recorded below; this defect is not fixed by changing its characterization test.
- One follow-up local run encountered an already-consumed response body while retaining a batch of native-runtime quota-probe responses. The probe now consumes each request/response sequentially and checks the JSON denial as well as its status; all 1,200 forged-token denials and the following legitimate-read failure remain required. The complete local suite then passed 94/94 again, with TypeScript and all four builds. This is quota evidence, not a throughput benchmark.
- Current hosted state, regional behavior, production storage permissions, secret rotation and rollback rehearsal: **not established**. Verification 04 and all Cloudflare/plugin runtime connections were left untouched. Do not infer hosted security clearance from local or GitHub checks.

## Decisions and lessons

- Reuse existing candidate architecture and synthetic harness. Do not promote the provider/KV default bundle as the hardened pair or repeat historical interoperability debugging.
- A detected replay revokes the family, even if a legitimate retry caused it. Losing a committed response or duplicate racing now requires fresh authorization; retain this explicit availability tradeoff.
- Proof keys are additive and removed with whole-grant cleanup. They cannot recover proof of tokens consumed by older code. Existing revoked flags remain readable by earlier code, but downgrading loses replay detection for active grants. No live migration was attempted.
- Rejected: revoking on a bare routing ID, adding a refresh grace window, storing raw tokens, inventing a global-grant policy, or calling a read-only façade a storage permission boundary.

## Open follow-ups

See findings F5–F8: public resource/authorize quota exhaustion, edge/source controls, true production R2 least privilege, inventory/supersession/global invalidation, redacted monitoring and ownership, fresh production bindings/credentials, exact compatibility/hosted multi-region tests, and all-ingress rollback/secret-rotation rehearsal. The excluded KV adapter's duplicate code issuance is reproduced, not fixed. Independent external audit and explicit merge/deployment authorization remain required.

## Preservation and branch disposition

- **Shipped:** nothing. **Experimental:** fixes and tests on this new feature branch only. **Historically preserved:** #304–#309 and their handoffs; #307's later handoff-only commit was reviewed separately. **Unresolved:** release gates above.
- Keep this new branch and draft PR plus all open PR heads/bases. They are unfinished dependencies, outside the completed three-branch rotation buffer. No merge or deletion is requested or performed; closure remains pending.
- Results live on this branch/PR, not main. Preserve original history through the eventual reviewed integration; a squash needs separate history preservation before cleanup.
- Source workflows were read; newsroom CI is read-only test/build/artifact upload, and World publishing performs local checks/builds. Live deployment settings, external automation and branch protection were **not checked** for deletion clearance. No cleanup attestation is issued. After an authorized final integration, recheck the exact head, live dependencies and protections under the [lifecycle policy](../BRANCH-LIFECYCLE.md) before any SHA-leased cleanup.
