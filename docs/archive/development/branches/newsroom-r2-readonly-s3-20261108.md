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

## Follow-up: pagination cursor classification and two-page tests — 2026-11-08

After live hosted S3-backed MCP acceptance on the dependent [draft PR #313](https://github.com/jcr0916-hue/federatedrepublic/pull/313), a fabricated `newsroom_list` cursor was observed to yield `r2_list_unavailable`. Source inspection traced this to a blanket non-200 ListObjectsV2 error mapping in this adapter. The exact upstream R2 response status/code for that live request was not captured; do not infer it was a particular S3 code.

**Experimental fix on this PR #312 branch:** `src/readonly-s3-storage.ts` now, only when a cursor is present and the signed ListObjectsV2 response is HTTP 400, reads a *bounded* 4096-byte XML error body and maps S3 `InvalidArgument` or `InvalidToken` to `r2_invalid_cursor`; all other non-200 statuses and malformed/unbounded error bodies still map to `r2_list_unavailable`. No changes to endpoint restrictions, read-only GET methods, production entrypoints, secret handling or native R2 binding. `test/readonly-s3-storage.test.ts` adds mocked two-page continuation-token handoff and explicit invalid-cursor vs missing-cursor, denied-access and unrelated-error differentiation. **Tests/CI results for this latest patch are pending independent confirmation**; don't claim the live hosted Worker changed, because it still runs the earlier deployed artifact.

**Dependency coordination:** PR #313 was branched from the earlier #312 implementation, so it will need to incorporate the reviewed #312 correction before any rebuild/redeploy; avoid duplicate conflicting changes. To confirm the specific live case, capture the S3 response classification safely (without logging tokens/keys or sensitive XML), then test with hosted R2 and real two-page synthetic listing. Independent security review and F5–F8 remain open. Both PRs stay draft/unmerged; retain dependency refs and archive.
