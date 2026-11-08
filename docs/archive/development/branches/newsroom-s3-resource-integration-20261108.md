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
