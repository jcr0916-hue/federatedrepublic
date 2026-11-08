# Branch history — newsroom R2 read-only S3 proof of concept

**Original branch:** `feature/newsroom-r2-readonly-s3-20261108`
**Parent:** `feature/newsroom-ingress-rate-boundary-20261108`, draft PR #311 at `4f08ffe4f05ecf5f2ab02b00879e5ff35c5e0833`
**PR:** https://github.com/jcr0916-hue/federatedrepublic/pull/312 (draft)
**Status:** experimental, unmerged, not deployable.

## Purpose
Explore true bucket-scoped S3 Object Read only credentials for the OAuth read resource, avoiding the native full-access R2 binding. Work on separate branch, without touching production or the currently connected Verification 04.

## Artifacts
- `workers/newsroom/src/readonly-s3-storage.ts`: experimental SigV4 read/list-only storage adapter, bounded object and XML responses, endpoint and key allowlists.
- `workers/newsroom/test/readonly-s3-storage.test.ts`: synthetic mocked-network tests.
- `workers/newsroom/R2-READONLY-S3-PROTOTYPE.md`: boundary design, validation limitations, separate integration and hosted test gates.

## Verification
Initial CI at the first branch head failed a TypeScript Web Crypto BufferSource type mismatch in the prototype; corrected with an owned ArrayBuffer in commit `f12bcc342704152bdddd5fda49728e0011db3121`. At that exact source commit, [Newsroom OAuth checks run 42512917853](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42512917853) passed **101 tests / 21 suites / zero failures**, clean TypeScript and four builds. [World publishing run 42512917753](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42512917753) passed. This evidence does not establish hosted S3 interoperability or permission-scoped live credentials; final handoff-only commit requires its own checks. No credential was created, no R2 API called, and no resource Worker was modified. This is a local mock-only prototype, **not** a complete independent security audit.

## Key decision and remaining blockers
Cloudflare's Object Read only S3 token must be enforced by the R2 service; GET-only code is insufficient if the credentials have excess privilege. Need deterministic SigV4 test vectors, actual R2 endpoint hosted validation, XML/continuation compatibility, negative Put/Delete credential tests against synthetic storage, then resource integration removing native R2 binding. Prior #310 F5, F7 and F8 remain open. No production deployment approval.

## Branch disposition
Retain active PR branch, all bases and permanent records; no main merge or cleanup. Re-evaluate after independent review, reproducible tests, actual deployment dependencies and AGENTS.md guarded branch lifecycle.
