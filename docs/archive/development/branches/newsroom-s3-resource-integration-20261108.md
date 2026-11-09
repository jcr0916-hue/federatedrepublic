# Branch history — S3 read-only MCP candidate integration

**Original branch:** `feature/newsroom-s3-resource-integration-20261108`
**Base:** `feature/newsroom-r2-readonly-s3-20261108` at `aaa971852752e8f6da94a57871d37748aafb8ef5`, draft PR #312
**PR:** https://github.com/jcr0916-hue/federatedrepublic/pull/313 (draft)
**Status:** experimental; unmerged/unshipped; no deployment

## Purpose
Integrate the previously unbound S3 Get/List credential prototype into a separate full MCP resource candidate without altering Verification 04 or the existing release artifact. A new resource candidate must have **no native R2Bucket binding** and must use a bucket-scoped **Object Read only** S3 credential in a future approved isolated hosted test.

## Changes
- `src/resource-candidate.ts`: dependency-injected read storage factory; preserves existing default binding and authentication behavior.
- `src/resource-s3-candidate.ts`: new separate S3-only resource composition.
- `scripts/build-resource-s3-candidate.mjs`, package scripts, CI: fifth unbound build and review artifact, no deploy.
- `test/resource-s3-candidate.test.ts`: simulated issuer/S3 HTTP, legacy MCP list/read/status overlay, denied write tools, no native R2 binding.
- `R2-S3-RESOURCE-INTEGRATION.md`: exact contract, tests and remaining hosted/production gates.

## Evidence
**Verified implementation CI:** at commit `3250f375c4c3382e780856ee4f6a25dac40d2503`, [Newsroom OAuth checks run 42513466833](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42513466833) passed: **102 tests / 22 suites / zero failures**, TypeScript, legacy and hardened issuer/resource and S3 resource builds; all review artifacts, including separate S3 build, uploaded. [World publishing run 42513466814](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42513466814) status must be rechecked before release review. The following handoff-only commit must pass its own CI. Tests are synthetic local Miniflare and mocked HTTP only, not actual R2 S3 access or storage privilege proof. No real R2 credentials created and no Cloudflare Worker configuration changed. Do not represent successful source tests as a production security clearance.

## Decisions / blockers
Keep the original `resource-candidate.ts` entrypoint built separately and unchanged for the existing test deployment. Do not select S3 build as a release until actual hosted S3 interoperability and permission denial on isolated synthetic storage are proven. R2 Object Read only token scoping enforced by Cloudflare remains a required provisioning check. F5/F6/F7/F8 and independent security review remain unresolved.

## Branch disposition
Retain as active draft dependency. Preserve all open PR bases and handoffs, including #304–#312; no merge, deployment, canon edits, credential rotation or branch deletion. Later archival/cleanup follows AGENTS.md and checks live deployment/automation references and original history.

## Isolated R2 provisioning update

On 2026-11-08 a **new test-only** R2 bucket `newsroom-s3-readonly-acceptance` was created, containing exactly two synthetic objects (Korda submission and editorial-status overlay, UUID `22222222-2222-4222-8222-222222222222`). Cloudflare object list confirmed both. No original test bucket or production data was accessed or altered. No S3 API token or read-only secret was generated, no Worker deployed, and no real signed S3 request was made. A bucket-scoped Object Read only token and hosted S3 integration test are the next external dependencies. Older "no real R2" statements in this note describe source-only work before this addendum, not the latest provisioning checkpoint.

## Cloudflare R2 S3 credential acceptance — 2026-11-08 (later checkpoint)

**VERIFIED, isolated synthetic bucket only; operator-reported AWS CLI results.** A dedicated Cloudflare R2 account API token with Object Read only permissions scoped to `newsroom-s3-readonly-acceptance` was created and configured locally as AWS profile `torenthia-r2-acceptance`. Using the actual R2 S3 endpoint and AWS CLI 2.39.6 on macOS, the operator observed:

- `ListObjectsV2`: success; returned exactly the known synthetic Korda submission and status-overlay objects.
- `HeadObject` on `status/22222222-2222-4222-8222-222222222222.json`: success, 113-byte JSON object.
- `GetObject` on the same status object: success; downloaded to a local temporary file.
- `PutObject` using a separate `security-tests/readonly-denial-test.json` key: `AccessDenied`.
- `DeleteObject` on the synthetic status object: `AccessDenied`.
- `ListObjectsV2` on a distinct bucket (`newsroom-oauth-isolated-test`) with the same profile: `AccessDenied`.

**Conclusion:** Credential-based R2 S3 Get/List interoperability and read-only/bucket-scope enforcement passed these tested requests. The initial source-only and “no token generated” statements above are **historical, superseded** by this checkpoint; retain them to explain the progression. The credentials and Cloudflare Account ID were not recorded in repository documentation. No production bucket, Worker, OAuth integration, or canon was modified by these acceptance commands.

**Still OPEN:** This does not test SigV4 signing by the S3-backed Worker, hosted MCP end-to-end `newsroom_list`/`newsroom_read`, Worker bindings/ingress, XML pagination/error behavior, token lifecycle, independent security review, or F5–F8 clearance. PR #313 remains draft/unmerged and no deployment or release is authorized. The next task is a separately approved isolated Worker test using secret bindings and *no native R2Bucket binding*, then review of these remaining gates.


## Isolated hosted S3-backed MCP acceptance — 2026-11-08 (latest checkpoint)

**VERIFIED HOSTED TEST, experimental only; not production release.** Two newly named Cloudflare Workers were created without public targets initially, then their dedicated `workers.dev` endpoints were enabled specifically for controlled acceptance testing:

- OAuth issuer `newsroom-s3-issuer-acceptance`, initial version `7ce5d472-f58e-40cf-aa55-7577ea81f0f9`; Cloudflare settings confirmed both issuer Durable Objects, rate limiting and three secret bindings.
- S3-backed MCP resource `newsroom-s3-readonly-acceptance`, version `d42778d4-febe-4215-b034-0189c664ad83`; Cloudflare settings confirmed `ISSUER` service binding to the dedicated issuer, three secret bindings, rate limiter namespace `1002`, and **no native `NEWSROOM` R2Bucket binding**.
- Both `workers.dev` endpoints are **currently enabled** for tests, while preview endpoints remain disabled. Their public discovery endpoints are reachable; this must not be mistaken for privately isolated networking. No production or Verification 04 Workers were targeted.
- Issuer `/.well-known/oauth-authorization-server`: live HTTP **200**; authorization, token, introspection and revocation metadata, `newsroom:read` scope, PKCE S256.
- Resource `/.well-known/oauth-protected-resource/mcp`: live HTTP **200**; advertises the dedicated issuer, `newsroom:read`, bearer-header method.
- POST `/mcp` without bearer token: live HTTP **401**, `invalid_token`, proper `WWW-Authenticate` challenge.
- Separate ChatGPT plugin **Torenthia S3 Acceptance Test** authorized using the dedicated OAuth client; authenticated `newsroom_list` returned exactly **one** synthetic Korda `HOLD` report, with no next page.
- Authenticated `newsroom_read` on `submissions/korda/2026-11-08/22222222-2222-4222-8222-222222222222.json` returned the complete expected synthetic report, including body, editorial note and `nonCanonical: true`. This constitutes a successful **live S3-backed MCP read** rather than only mocked SigV4.
- Temporary issuer/resource secrets JSON and temporary validator-secret file under `/tmp` were removed after uploading the Cloudflare secrets. The dedicated AWS CLI profile remains local; no secret values are committed.

**Still OPEN:** deeper credential/desk isolation and cross-bucket denial through Worker, malformed or expired/revoked token lifecycle, XML pagination/error mapping under real service conditions, load/ingress and resilience, independent security and operations review, F5–F8 gate disposition, and release approval. The successful two-record-fixture read does **not** establish all security gates or production readiness. PR #313 stays **draft and unmerged**; retain its dependency chain and branch until reviewed. Reassess whether to disable the publicly reachable acceptance endpoints when active testing concludes. No fictional time progression, canon publication, or production rollout.

## Authenticated negative-read checks — 2026-11-08

Using the separate authorized **Torenthia S3 Acceptance Test** plugin, `newsroom_read` on a syntactically valid but nonexistent UUID path under `submissions/korda/2026-11-08/` returned `not found`. A read with a `../newsroom-oauth-isolated-test/...` path was rejected as `invalid or unauthorized submission key`. No document content was returned in either case. These are narrow, tested negatives only; they do not prove complete path traversal prevention or that alternate-bucket S3 requests cannot be constructed. Existing OAuth grant was not revoked; token expiry/revocation, missing/invalid bearer, cross-desk permission boundary and other negative authorization cases remain open.

## Forged bearer denial — 2026-11-08

Operator ran an unauthenticated MCP `tools/list` POST against the isolated S3 acceptance resource with header `Authorization: Bearer invalid-test-token`. Live response: HTTP/2 **401**, JSON `{"error":"invalid_token"}`, and `WWW-Authenticate: Bearer error="invalid_token"` with the correct OAuth protected-resource metadata and `newsroom:read` scope. This verifies rejection of this fabricated token without affecting the existing authorized ChatGPT client. This is not an expiry, refresh or revocation test; those remain open.

## Unauthenticated revocation request — 2026-11-08

Operator invoked `POST /revoke` on the isolated issuer with a dummy `token=invalid-test-token` and **no OAuth client authentication**. The response body was `{"error":"invalid_client"}`. The HTTP status was **not provided** in the returned excerpt and must be verified separately before asserting a 401. No valid token was supplied, and no existing ChatGPT grant was deliberately revoked. This only demonstrates denial/error response for an unauthenticated revocation attempt; successful valid-token revocation, introspection before/after, and refresh-token lifecycle remain open.

## Revocation authentication HTTP status confirmation — 2026-11-08

A follow-up operator request repeated `POST /revoke` without client authentication, using only the fabricated token string `invalid-test-token` and suppressing the response body. The observed status was **HTTP 401**. Together with the earlier observed `{"error":"invalid_client"}` response body, this confirms rejection of the tested unauthenticated revocation request. It does **not** test authenticated revocation of a valid token, grant invalidation, or refresh-token invalidation; those remain open and the working ChatGPT grant was preserved.

## Introspection endpoint client-authentication denial — 2026-11-08

Operator invoked unauthenticated `POST /introspect` on the isolated issuer with fabricated `token=invalid-test-token` and `token_type_hint=access_token`. Observed live HTTP/2 **401**, `{"error":"invalid_client"}`, and `WWW-Authenticate: Basic realm="newsroom-issuer"`; `Cache-Control: no-store` and `Pragma: no-cache` present. This passes the specific missing-client-credentials denial test. It does not prove successful valid-client introspection, expired-token handling, or revoked-token inactivity. The working ChatGPT OAuth grant remained untouched.

## Token endpoint missing-client denial — 2026-11-08

Operator invoked `POST /token` on isolated issuer with `grant_type=refresh_token` and a fabricated `refresh_token=invalid-test-token`, without any client authentication. Observed HTTP/2 **401**; JSON `{"error":"invalid_client"}`; `WWW-Authenticate: Basic realm="newsroom-issuer"`; `Cache-Control: no-store` and `Pragma: no-cache`. The three separately exercised missing-client-authentication cases for `/token`, `/introspect`, and `/revoke` each returned HTTP 401. This does not establish valid-client token refresh, token expiry/revocation semantics or negative grant isolation. No real token was used or revoked, and the working ChatGPT plugin grant was unaffected.

## Invalid OAuth scope request — 2026-11-08

Operator confirmed live HTTP **400** for a GET `/authorize` request with the unsupported `scope=newsroom:write` and no other required authorization parameters. This confirms the tested malformed/broader-scope request was rejected; **it does not isolate scope enforcement** because the request also omitted required authorization parameters. A complete otherwise-valid authorization request carrying only an unauthorized scope must be tested separately before claiming independent scope rejection. Existing OAuth grants and production Workers unchanged.

## Complete OAuth unauthorized-scope acceptance — 2026-11-08

A properly formed GET `/authorize` request (all required response_type, registered client ID, exact redirect URI, resource audience, state and PKCE S256 challenge parameters present) requesting the unsupported **`newsroom:write`** scope was sent using macOS `curl`. The isolated issuer returned live **HTTP/2 400** and `{"error":"invalid_authorization_request"}`. This replaces the earlier scope-test ambiguity caused by missing required parameters and supports independent rejection of this disallowed scope. A preceding attempt to send the same request using Python `urllib` received **HTTP 403 / Cloudflare Error 1010**, an edge denial rather than an OAuth application result; retry with curl reached the issuer successfully. No legitimate OAuth grant was modified or revoked; source code and production Workers remain unchanged.

## OAuth resource-audience mismatch denial — 2026-11-08

Operator ran a complete GET `/authorize` request against the S3 acceptance issuer with the registered OAuth client ID, correct ChatGPT callback, `newsroom:read` scope, state, and PKCE S256 parameters, but requested `resource=https://newsroom-oauth-isolated-test.jcr0916.workers.dev/mcp` rather than the configured S3 acceptance MCP audience. Observed live HTTP/2 **400** with `{"error":"invalid_authorization_request"}`. This verifies that the issuer rejects the tested alternate-resource audience at authorization time, without contacting or changing the other Worker or existing ChatGPT authorization. It does not replace comprehensive audience isolation tests of issued tokens or introspection.

## Incorrect registered-client secret rejected — 2026-11-08

Operator tested live `POST /token` for `grant_type=refresh_token` and fabricated `refresh_token=invalid-test-token` using HTTP Basic with the **registered S3 acceptance client ID** and a deliberately incorrect client secret. The isolated issuer returned HTTP/2 **401**, JSON `{"error":"invalid_client"}`, `WWW-Authenticate: Basic realm="newsroom-issuer"`, and no-store/no-cache headers. This verifies incorrect-secret rejection in this test, but does not establish valid-client refresh behavior, token expiry/revocation, or OAuth grant isolation. No genuine credential or token was sent, and the working ChatGPT authorization was preserved.

## Valid OAuth client, fabricated refresh token — 2026-11-08

Operator invoked live `POST /token` at the isolated issuer with the registered S3 acceptance client ID, the authentic client secret entered privately in local Terminal, `grant_type=refresh_token`, and a fabricated `refresh_token=invalid-test-token`. Observed HTTP/2 **400** and JSON `{"error":"invalid_grant"}`. The test shows the correctly authenticated client cannot exchange this invalid refresh credential for a new token; it does not prove positive refresh, token expiry, replay, or revocation behavior. Operator's command included `unset S3_TEST_SECRET` after curl; secret content was not posted to chat or GitHub. Existing ChatGPT OAuth grant remained intact.

## Authenticated S3 desk-filter and limit observations — 2026-11-08

Through the existing authorized S3 Acceptance Test ChatGPT plugin, `newsroom_list({desk:"korda",limit:10})` returned exactly one known synthetic Korda `HOLD` fixture, `cursor:null`, `more:false`. `newsroom_list({desk:"orath",limit:10})` returned `items:[]`, `cursor:null`, `more:false`, as expected for the bucket's known fixture. `newsroom_list({limit:0})` **returned the Korda fixture rather than rejecting the request**. This records how the current interface handles zero limit and is not an isolated permission test; no assertion about cross-desk agent enforcement follows from the Orath filter result. All requests were read-only; no current grant or production data was changed. Cross-desk role-auth testing, malformed cursor testing, and real pagination remain open.

## Malformed pagination cursor — 2026-11-08 (review item)

Authenticated `newsroom_list({limit:1,cursor:"definitely-not-a-valid-cursor"})` through the isolated S3 Acceptance Test connector returned the MCP error text **`r2_list_unavailable`**. No data was returned or modified. This proves that the provided cursor did not produce a valid listing; it does **not** establish whether the error arose in cursor validation, S3 transport/parsing, or backend handling. Treat as an **error-classification review item**, not a successful cursor-validation security test. Investigate mapping for malformed cursors versus genuine S3 outages and test real multi-page pagination before production release.

## Pagination and zero-limit root-cause review — 2026-11-08

**Source inspected on PR #313 head** (`workers/newsroom/src/readonly-s3-storage.ts`, `src/resource-candidate.ts`, `src/legacy.js`). The malformed-cursor test's `r2_list_unavailable` result is explained by a source-level error mapping: `readonlyS3Storage.list()` accepts any cursor up to 2048 bytes without control characters, passes it as S3 `continuation-token`, then throws `r2_list_unavailable` for **every non-200 ListObjectsV2 response**. The deliberately fabricated cursor satisfied local checks; the exact R2 HTTP response/status was **not captured**, so the backend cause is inferred from the adapter path, not independently observed. `legacy.js` catches and serializes the thrown error as an MCP tool error.

**Zero limit:** `legacy.js` normalizes with `Math.min(100, Math.max(1, Number(a.limit) || 30))`, so a supplied `limit: 0` maps to 30; it is not rejected by the S3 adapter. This is legacy semantics, not a newly observed S3 permissions bypass.

**Suggested narrow correction, not yet implemented:** Add explicit treatment/tests for invalid S3 continuation-token responses, without relabeling all non-200 S3 errors as cursor errors; maintain generic handling for backend availability/authentication errors and ensure error details do not leak credentials. Test both malformed cursors and real multi-page continuation under hosted R2; include mock XML/error cases, maintain existing legacy zero-limit behavior unless separately approved. Note that this adapter is inherited from draft PR #312, so coordinate any shared implementation change with dependency ownership. No source code changed by this investigation. F5–F8 and independent security review remain open.

## Upstream pagination patch in draft PR #312 — 2026-11-08

The cursor-error follow-up has been implemented **only on the parent PR #312 branch**, after this PR #313 branched off: https://github.com/jcr0916-hue/federatedrepublic/pull/312 (adapter/test patch and handoff tip `3adcba0bf79b88cf42ee7e9679649ad0d1a76a23`). The upstream patch adds bounded recognition of specific S3 HTTP 400 invalid continuation-token error codes and mocked two-page/negative S3 tests. It is **not** integrated into PR #313's source yet, not independently verified by new CI at this checkpoint, and not present in the running hosted S3 Worker. To avoid divergent fixes, review/verify #312 first, then incorporate its updated adapter into #313 in dependency order; rerun complete tests and a controlled hosted acceptance check. Neither draft PR is approved for main merge or production deployment.

## PR #312 pagination fix integrated into PR #313 — 2026-11-08

The verified S3 adapter cursor-error classification and its mock two-page/negative-error tests from the parent draft PR #312 are now copied into this dependent PR #313 branch: `src/readonly-s3-storage.ts` in commit `d866ac2cff68489fa4b13d3391b16eada30fbe6d`, `test/readonly-s3-storage.test.ts` in `1e1a6d01ea75ae039001747da51a8eb5b60aeda0`. The upstream [Newsroom OAuth checks run 42538507015](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538507015) was **successful**, as was upstream World publishing run 42538507016. The downstream [Newsroom OAuth checks run 42538627664](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538627664) and World publishing run 42538627654 were still running at this documentation checkpoint. The existing Cloudflare S3 acceptance Worker **has not been redeployed** and still uses the pre-fix version. Before any hosted update, review completed downstream CI and consider the separate deployment authorization gate. Production/Verification 04 remain untouched, and PR #313 stays draft/unmerged.

## Downstream PR #313 CI PASS — pagination adapter integration (2026-11-08)

[Newsroom OAuth checks run 42538627664](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538627664) completed **SUCCESS** on integrated adapter/test commit `1e1a6d01ea75ae039001747da51a8eb5b60aeda0`: **104 tests / 22 suites / 0 failures**, TypeScript, all standard/candidate/S3 builds, and all release/review artifact upload steps passed. [World publishing run 42538627654](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42538627654) also **SUCCESS**. This verifies the integrated source change and its mocked pagination/error tests, **not** a fresh hosted R2 continuation or live redeploy. A later handoff-only documentation commit requires its own workflow result before treating the final branch tip as CI-verified. The existing acceptance Worker remains on deployed pre-fix version `d42778d4-febe-4215-b034-0189c664ad83`. Keep PR #313 draft, production blocked, and current Verification 04 untouched.

## Hosted pagination regression after isolated redeploy — 2026-11-08

Operator redeployed **only** the isolated `newsroom-s3-readonly-acceptance` resource Worker from local PR #313 source (source CI 104/104 passed), preserving `workers_dev:true` and existing service/secret bindings. Live deployed Worker version **`5e7c1dee-bb8d-41a0-bc36-9307404cb995`** at `https://newsroom-s3-readonly-acceptance.jcr0916.workers.dev`. Issuer, Verification 04, production, `main` and canon unchanged. Wrangler warned that because `preview_urls` was unspecified with workers.dev enabled, **preview URLs were enabled by default**; explicitly set `preview_urls:false` in local resource Wrangler config before any subsequent deploy and verify in Cloudflare.

Post-deploy authenticated ChatGPT S3 Acceptance Test `newsroom_list({desk:"korda",limit:10})` succeeded and returned the same one synthetic Korda HOLD fixture (`cursor:null`, `more:false`), confirming read functionality and existing OAuth connection. **Malformed cursor remains unresolved:** `newsroom_list({limit:1,cursor:"definitely-not-a-valid-cursor"})` returned `r2_list_unavailable`, not the mocked-error expectation `r2_invalid_cursor`. The latest source maps only HTTP 400 with S3 XML `Code=InvalidArgument` or `InvalidToken` to `r2_invalid_cursor`; actual upstream R2 response status and code remain **unknown**. This is a **hosted test failure/gap** despite passing mock CI, not proof of a vulnerability. Next: safely inspect upstream S3 error classification without exposing Authorization headers, signatures, or credentials; adjust source/test case based on observed status/code, rerun CI, redeploy only with review/approval. Do not treat pagination error correction as closed. Hosted real multi-page test, credential lifecycle and independent security review remain open.

## R2 InvalidContinuation correction after hosted regression — 2026-11-08

After isolated S3 resource version `5e7c1dee-bb8d-41a0-bc36-9307404cb995` was deployed, authenticated MCP list remained functional, but the fake cursor still yielded `r2_list_unavailable`. The operator independently tested ListObjectsV2 against the synthetic R2 bucket with their existing Object Read-only AWS CLI profile and supplied `--continuation-token definitely-not-a-valid-cursor`: process exited **254**, reporting service error **`InvalidContinuation`** (`Continuation token is not valid`). No writes or real credentials were disclosed. HTTP status/body at the Worker boundary were not captured independently.

PR #312 now recognizes this actual error code in its bounded HTTP 400 S3 XML mapping, with a targeted synthetic regression test. Corresponding adapter and test sources were copied into PR #313 in commits `2f84486f59c386d0302d7bda2e12a21d467fd751` and `6768226d0fd1bfb6741074c6b709c28eeca9f8ce`. **CI for the new correction is pending; new code is not yet deployed.** After CI success, operator must locally fetch/switch to the new PR #313 branch tip, rebuild the S3 candidate and validate local Wrangler config (`workers_dev:true`, `preview_urls:false`), then selectively redeploy the isolated resource Worker only. Avoid any issuer, Verification 04, production, `main`, or canon changes. Re-test live malformed cursor and original synthetic list; real pagination and independent security review remain outstanding.

## Hosted InvalidContinuation correction VERIFIED — 2026-11-08

Operator rebuilt latest PR #313 S3 resource candidate at branch head `eb1aec4b8c83b7a273e250d1b7c5444457eee2aa`, set isolated `wrangler.s3-acceptance.jsonc` to `workers_dev:true` and `preview_urls:false` with no native R2 binding, and redeployed only isolated resource Worker `newsroom-s3-readonly-acceptance` to **version `3476508c-76fb-4883-9618-2a07c1154cb3`** at `https://newsroom-s3-readonly-acceptance.jcr0916.workers.dev`. Wrangler explicitly warned that workers.dev was enabled while **Preview URLs remained disabled**; this warning is expected and confirms the intended settings, not a deployment failure. Existing issuer service binding, R2 S3 bucket and endpoint variables, resource/client/validator IDs, and 20 requests/60s ingress limiter appeared unchanged in deployment output; no production or issuer Worker deployment was made.

Immediately following deployment, authenticated ChatGPT `Torenthia S3 Acceptance Test` plugin checks against this live version verified: `newsroom_list({desk:"korda",limit:10})` returned the one expected synthetic Korda HOLD fixture with `cursor:null,more:false`; `newsroom_list({limit:1,cursor:"definitely-not-a-valid-cursor"})` produced **`r2_invalid_cursor`**, resolving the earlier observed generic `r2_list_unavailable` for that exact invalid token; `newsroom_read` of the known Korda fixture returned its body, `nonCanonical:true`, HOLD status and synthetic editorial note. Existing ChatGPT OAuth grant is still functioning. **The specific hosted malformed-cursor classification regression is closed.** This is not real multi-page continuation testing, negative/positive token lifecycle testing, or an independent security audit. Synthetic R2 data is not Torenthia canon. PR #312/#313 remain draft/unmerged, published canon and Verification 04 unchanged.

## Hosted S3 two-page continuation VERIFIED — 2026-11-08

Before the test the isolated acceptance R2 bucket had exactly two existing objects: the synthetic Korda fixture `submissions/korda/2026-11-08/22222222-2222-4222-8222-222222222222.json` and its `status/22222222-2222-4222-8222-222222222222.json` record. Through the **separate Cloudflare administrative R2 Object Upload API** (not the read-only S3 credential, not an MCP write tool), added exactly one additional noncanonical Korda report object: `submissions/korda/2026-11-08/33333333-3333-4333-8333-333333333333.json`, explicitly marked `nonCanonical:true`, synthetic, `PROPOSED`. No status object for the second item was needed; original objects were preserved. Cloudflare confirmed successful upload, 459 bytes.

Using the existing authorized `Torenthia S3 Acceptance Test` ChatGPT connector against isolated resource Worker version `3476508c-76fb-4883-9618-2a07c1154cb3`: `newsroom_list({desk:"korda",limit:1})` returned only original `2222...` synthetic HOLD item, `more:true`, nonempty R2 continuation cursor; passing that **actual returned cursor** to `newsroom_list({desk:"korda",limit:1,cursor:<returned>})` returned only new `3333...` synthetic PROPOSED item, `more:false`, `cursor:null`; the two returned IDs differ. Also `newsroom_list({desk:"korda",limit:10})` returned both synthetic items with `more:false`. **Hosted S3 true two-page pagination is VERIFIED** through Worker OAuth/introspection, SigV4 S3 API, ListObjectsV2 and MCP. This does not establish cross-desk identity enforcement, lifecycle of real OAuth grants, or independent security clearance. No production, canonical stories, issuer deployment, Verification 04, `main`, or PR merge changes. The isolated R2 bucket now intentionally has three synthetic objects; preserve that updated inventory in future acceptance checks.

## OAuth lifecycle and agent-desk architecture review — 2026-11-08

Source-only review of current `src/issuer-candidate.ts`, `src/resource-candidate.ts`, and `src/legacy.js` following hosted S3 pagination verification:

- **Current issuer accepts exactly one registered confidential client and a single exact callback** (`ISSUER_CLIENT_ID` and `ISSUER_REDIRECT_URI`), with only the exact `newsroom:read` audience-bound scope and allowlisted GitHub editor identity. `POST /token` supports authorization-code and refresh-token grants, not a client-credentials grant. Real access expires in **900 seconds**; docs specify an eight-hour refresh lifetime. Authorization requires GitHub callback, browser binding, consent and PKCE; there is no safe standalone minting shortcut. Existing connected ChatGPT OAuth grant cannot be used as a disposable revocation/refresh test without potentially breaking the working connector. Design a separately configured disposable client/redirect + isolated grant and user-guided browser consent, or use an explicitly approved second isolated issuer instance, before full positive lifecycle testing. No real credential or token was read/revoked in this review.
- **Agent desk isolation is not implemented by this candidate**: `resource-candidate.ts` passes the fixed principal `{desk:"editorial",editor:true}` into `mcp()` after successful bearer introspection; the issuer's active token metadata includes issuer/audience/client/scope/expiry but **no desk or agent identity**. Thus all accepted grants currently have **editor read visibility across desks by design**. The empty Orath filter merely demonstrates filtering over a bucket with no Orath objects and is NOT evidence of restricted-agent access control. The existing agent-scoped legacy handler remains separate and should not be weakened. Implementing agent OAuth roles needs explicit architecture/editorial authorization and additional scoping tests, not just more fixture data.
- This is an **internal source review**, not independent security sign-off. Hosted continuation is confirmed on isolated resource version `3476508c-76fb-4883-9618-2a07c1154cb3`; synthetic second Korda fixture was added separately through Cloudflare administrative R2 API, while the resource's S3 key remains Object Read only.

**Recommended next decision:** Keep S3 acceptance scoped to central editorial reads for now, and plan a separate agent principal/desk design rather than treating one-editor OAuth as agent authorization. For positive expiry/refresh/revocation, use isolated disposable-grant infrastructure with an explicit callback that the test harness controls and a distinct client secret; do not modify or revoke working ChatGPT grant. Neither production release nor PR merge is authorized.
