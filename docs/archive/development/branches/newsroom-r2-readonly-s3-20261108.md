# Branch history — newsroom R2 read-only S3 proof of concept

**Original branch:** `feature/newsroom-r2-readonly-s3-20261108`
**Parent:** `feature/newsroom-ingress-rate-boundary-20261108`, draft PR #311 at `4f08ffe4f05ecf5f2ab02b00879e5ff35c5e0833`
**PR:** pending draft creation
**Status:** experimental, unmerged, not deployable.

## Purpose
Explore true bucket-scoped S3 Object Read only credentials for the OAuth read resource, avoiding the native full-access R2 binding. Work on separate branch, without touching production or the currently connected Verification 04.

## Artifacts
- `workers/newsroom/src/readonly-s3-storage.ts`: experimental SigV4 read/list-only storage adapter, bounded object and XML responses, endpoint and key allowlists.
- `workers/newsroom/test/readonly-s3-storage.test.ts`: synthetic mocked-network tests.
- `workers/newsroom/R2-READONLY-S3-PROTOTYPE.md`: boundary design, validation limitations, separate integration and hosted test gates.

## Verification
Initial CI pending; do not claim passing results before the current branch run. No credential was created, no R2 API called, and no resource Worker was modified. This is a local mock-only prototype, **not** a complete independent security audit.

## Key decision and remaining blockers
Cloudflare's Object Read only S3 token must be enforced by the R2 service; GET-only code is insufficient if the credentials have excess privilege. Need deterministic SigV4 test vectors, actual R2 endpoint hosted validation, XML/continuation compatibility, negative Put/Delete credential tests against synthetic storage, then resource integration removing native R2 binding. Prior #310 F5, F7 and F8 remain open. No production deployment approval.

## Branch disposition
Retain active PR branch, all bases and permanent records; no main merge or cleanup. Re-evaluate after independent review, reproducible tests, actual deployment dependencies and AGENTS.md guarded branch lifecycle.
