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

## CI repair after pagination tests — 2026-11-08

The first post-patch [Newsroom OAuth checks run 42538177891](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538177891) **failed at TypeScript** before tests: the new test attempted `second.cursor` on the Cloudflare R2 `R2Objects` branch narrowed to `truncated:false` (TS2339, test line 96). Source adapter correctness was **not** evaluated by that run. Corrected the test assertion to verify absence using `'cursor' in second` in commit `76227fcbbb0a0b4f256202172d2da660890eb9b7`; its [Newsroom OAuth checks run 42538393393](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538393393) was in progress when recorded. Do not claim tests passing until completed. World publishing was successful at the earlier failing commit; latest run also requires result verification.

## CI pagination regression follow-up — 2026-11-08

[Newsroom OAuth run 42538393393](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538393393) passed TypeScript but failed **one new pagination assertion**: the adapter returned `cursor: undefined` even when `truncated:false`; the test incorrectly expected that the property would be absent. The run reported **102 pass / 1 fail out of 103 tests**, unrelated suites passing. Corrected the test to assert the terminal `truncated:false` state, not the presence/absence of the optional property (commit `61d756a0459ce0fb8e4c784d6a298d86a7d39a5e`). [Follow-up newsroom run 42538507015](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538507015) was in progress as recorded. Do not call latest tests passing until GitHub returns completed success. This is a test contract correction, not a change to the adapter's runtime behavior.

## Latest pagination fix CI verification — 2026-11-08

[Newsroom OAuth checks run 42538507015](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538507015) completed **success** for source commit `61d756a0459ce0fb8e4c784d6a298d86a7d39a5e`: Node/TypeScript checks, full test command, legacy and candidate builds, and artifact uploads all succeeded. [World publishing run 42538507016](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538507016) also completed **success**. PR #313 copied this PR's verified adapter and pagination test files into its own branch (commits `d866ac2cff68489fa4b13d3391b16eada30fbe6d` and `1e1a6d01ea75ae039001747da51a8eb5b60aeda0`), with separate downstream checks pending. No deployment, merge, or canon changes.

## Hosted R2 error-code confirmation and follow-up — 2026-11-08

After PR #313's isolated S3 resource redeploy to version `5e7c1dee-bb8d-41a0-bc36-9307404cb995`, a fabricated continuation cursor still returned `r2_list_unavailable`. An independent operator AWS CLI `s3api list-objects-v2` using the existing bucket-scoped **read-only** R2 account profile, `--continuation-token definitely-not-a-valid-cursor`, exited **254** with R2 service error **`InvalidContinuation`** and message `Continuation token is not valid`. This establishes the R2 error code but not the HTTP status captured at the Worker boundary. In this branch, the list adapter now also recognizes `InvalidContinuation` within bounded S3 HTTP 400 XML error handling (code commit `3bcfd4c1b3e08cc05deaaf3643aa7e167acebdf3`) and its mocked negative regression test (test commit `7c56a6bfff978e0c210eefbc542f286e57b7c878`). The tested change is also copied into dependent draft PR #313 (commits `2f84486f59c386d0302d7bda2e12a21d467fd751` and `6768226d0fd1bfb6741074c6b709c28eeca9f8ce`). CI for these new commits was pending when recorded; no re-deployment after this latest correction, and no change to production, issuer, or Verification 04.
