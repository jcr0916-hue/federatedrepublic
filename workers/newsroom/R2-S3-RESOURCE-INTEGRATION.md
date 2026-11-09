# S3 read-only MCP resource candidate — isolated integration

**State:** EXPERIMENTAL. No production or candidate Worker is deployed with this code. Existing `resource-candidate.ts` remains the default native R2 resource entrypoint, and Verification 04 is unchanged.

## Separate build

`src/resource-s3-candidate.ts` is a distinct entrypoint that composes the same tested MCP authorization/discovery handler with the experimental `readonlyS3Storage` adapter. It builds to **`dist/resource-s3-candidate.js`** and is retained as a separate CI artifact; this does **not** change `dist/resource-candidate.js` or `dist/worker.js`. No deployment targets or Cloudflare service bindings are provisioned by the code.

`resource-candidate.ts` now exports a storage dependency factory while its default export still uses the native `NEWSROOM` binding. The S3 entrypoint does **not** require or accept that native binding; instead it expects `R2_READ_ENDPOINT` (Cloudflare R2 S3 endpoint), `R2_READ_BUCKET` (exact approved bucket), `R2_READ_ACCESS_KEY_ID` and `R2_READ_SECRET_ACCESS_KEY` (secret). Other resource bindings remain: `RESOURCE_AUDIENCE`, `RESOURCE_ISSUER`, `RESOURCE_CLIENT_ID`, `RESOURCE_VALIDATOR_ID`, `RESOURCE_VALIDATOR_SECRET`, `ISSUER` service binding and `RESOURCE_INGRESS_LIMIT` rate-limit binding.

The future S3 access credential **must** be bucket-scoped and have Cloudflare R2 **Object Read only** permissions through the S3 API. Credentials are not provisioned, guessed, displayed or reused from production. The bound Worker must be configured with no `NEWSROOM` R2Bucket binding, no legacy agent secrets and no OAuth client secret.

## Tests and limitations

The new `test/resource-s3-candidate.test.ts` executes the standalone resource in isolated Miniflare with a simulated issuer, no R2 binding, and a synthetic S3 GET/List transport. It exercises actual MCP `newsroom_list` and `newsroom_read` to the original preserved legacy read handler, including editorial status overlay, and rejects write tools. New adapter unit tests cover sign/read/list and data bounds. No live data used.

This is **not** proof of R2's enforced Object Read only policy. Before rollout, a human must create a new throwaway **synthetic** R2 bucket and bucket-scoped read credential, then hosted signed GetObject/ListObjectsV2 must succeed and signed PutObject/DeleteObject must be rejected (403) using disposable test objects. Until then, SigV4 canonicalization against the real R2 S3 service remains unverified. Peer-review XML parsing, pagination, error mapping and token lifecycle with a real S3 backend. Check Worker egress control and retries before production.

A separately selected and explicitly approved production release must replace the native R2 binding only after source and hosted verification. Security blocker F6 remains **open**. F5/F7/F8 remain open as previously recorded. No `main` merge, production access, canonical publication, R2 modification, or Verification 04 change is authorized.

## Isolated hosted test fixture provisioned — 2026-11-08

An independently named R2 bucket **`newsroom-s3-readonly-acceptance`** was created through Cloudflare after the source and CI tests. It contains only two marked synthetic objects: `submissions/korda/2026-11-08/22222222-2222-4222-8222-222222222222.json` and `status/22222222-2222-4222-8222-222222222222.json`. Object listing confirmed both keys; no production bucket, original OAuth test bucket, or canon was modified. This changes the earlier source-only setup statement: a **synthetic bucket is now provisioned**, but no S3 API token, access key, client credential, Worker deployment or real S3 read has been created/performed. The real permission-enforcement/interop gate remains open.

**Next human-gated step:** Create a Cloudflare R2 **Object Read only** S3 API token restricted to **only** the new acceptance bucket; never paste either credential into a chat, GitHub issue/PR, source file or CI logs. The Cloudflare connector available here has no credential-issuance operation exposed in its R2 endpoint inventory. After the credential is created, prepare a **new isolated S3 candidate Worker** with it via Cloudflare secret bindings, not by changing Verification 04's resource. Perform Get/List and denied Put/Delete using only disposable synthetic objects. The read-only token needs separate authorized handling because the initial key is not redisplayed by Cloudflare.

## Real R2 credential acceptance results — 2026-11-08 (supersedes earlier provisioning checkpoint)

**VERIFIED through operator-run AWS CLI 2.39.6 against the live Cloudflare R2 S3 API, synthetic bucket only.** A dedicated R2 **Object Read only** account token restricted to `newsroom-s3-readonly-acceptance` was created and used via a local `torenthia-r2-acceptance` profile. The earlier statement that no token or real S3 request existed is historical and **no longer current**.

| Operation | Tested resource | Observed result |
| --- | --- | --- |
| `ListObjectsV2` | Acceptance bucket | Success; two known synthetic objects listed |
| `HeadObject` | Synthetic status JSON | Success; 113 bytes, JSON |
| `GetObject` | Synthetic status JSON | Success; downloaded locally |
| `PutObject` | New `security-tests/readonly-denial-test.json` key | `AccessDenied` |
| `DeleteObject` | Existing synthetic status JSON | `AccessDenied` |
| `ListObjectsV2` | Separate `newsroom-oauth-isolated-test` bucket | `AccessDenied` |

This **passes the credential permission and basic AWS CLI/R2 S3 interoperability gate** for the tested bucket. It does **not** demonstrate that the candidate Worker's own SigV4 implementation, MCP routing, isolated deployment or secret bindings work with real R2. No secrets or account IDs are committed. The profile and downloaded object stayed local; no production changes, Worker deploys, merges or canon edits were made.

**Outstanding:** Hosted isolated S3 candidate Worker with secrets and no `NEWSROOM` native R2 binding; end-to-end MCP `newsroom_list`/`newsroom_read`; issuer/validator/ingress controls; XML parsing and pagination, errors, egress/retry behavior, token lifecycle; independent security/operations review and F5–F8. Keep PR #313 draft and downstream production release blocked. Existing Verification 04 and native resource candidate are unchanged.


## Hosted Cloudflare + ChatGPT OAuth MCP acceptance — 2026-11-08 (latest checkpoint)

**Live isolated integration PASS for discovery, bearer protection, and synthetic list/read.** The previous statements above that the candidate has never been deployed and hosted S3 has not been tested describe *earlier checkpoints* and are superseded for the isolated acceptance Workers only. Production deployment remains **not approved**.

- Issuer: `newsroom-s3-issuer-acceptance`, version `7ce5d472-f58e-40cf-aa55-7577ea81f0f9`, deployed with two Durable Object bindings, rate limiter and three secret bindings.
- S3 resource: `newsroom-s3-readonly-acceptance`, version `d42778d4-febe-4215-b034-0189c664ad83`, deployed with the issuer service binding, rate limiter and three secret bindings. Cloudflare's live configuration has **no native R2Bucket/NEWSROOM binding**.
- Both dedicated `workers.dev` endpoints were enabled for testing after initial uploads with no public targets. Preview endpoints remain disabled. These are publicly reachable, protected test endpoints, not private network routes.
- Live issuer OAuth discovery: HTTP **200**, `newsroom:read`, PKCE S256, authorization/token/introspection/revocation metadata.
- Live resource OAuth discovery: HTTP **200**, correct issuer/resource relationship, bearer method.
- Unauthenticated POST `/mcp` for `tools/list`: HTTP **401**, `invalid_token`, `WWW-Authenticate` bearer challenge.
- Dedicated **Torenthia S3 Acceptance Test** ChatGPT connection completed OAuth authorization; authenticated `newsroom_list` found exactly one synthetic Korda HOLD submission with `more:false`.
- Authenticated `newsroom_read` returned the complete synthetic payload at `submissions/korda/2026-11-08/22222222-2222-4222-8222-222222222222.json`, including `nonCanonical:true`, editorial note and body. This confirms the live resource-to-R2 S3 retrieval path for the fixture.
- Operator removed temporary issuer/resource JSON secret files and validator-secret temporary file after configuring Worker secret bindings; never place their values in logs or commits. The read-only AWS CLI profile is retained locally.

**Remaining release gates:** token expiry/refresh/revocation and negative privilege cases; real S3 XML pagination and error behavior; per-desk controls; ingress/load, retry and egress review; independent security sign-off; disposition of F5–F8. The observed successful authenticated read and previously verified separate AWS CLI denied writes are not a complete production security audit. Leave PR #313 draft and dependency chain unmerged. Explicitly consider disabling these two public acceptance test endpoints when testing ends.

## Approved separation and disposable lifecycle acceptance design (2026-11-08)

The President approved **two distinct authorization tracks**:

1. **Central Newsroom Editor:** existing isolated `newsroom-s3-readonly-acceptance` resource and its dedicated issuer; registered confidential ChatGPT client, exact `newsroom:read` audience, current editor-only principal, no MCP writes and no native R2 binding. Preserve this known-working connection during negative testing; never revoke its token to simulate grant revocation.
2. **Future state agents:** separate OAuth issuer/client/resource principal design, with authenticated state-desk binding and data-plane enforcement for own-desk `newsroom_list` and `newsroom_read`. Current issuer introspection and resource principal are editorial-only and **cannot prove agent isolation**. No agent-access changes are authorized yet. Existing legacy agent credentials retain their current desk isolation until explicitly replaced.

### Disposable positive OAuth lifecycle test (planned; not provisioned)

To test real token minting/refresh/expiry/revocation without risking ChatGPT, use a **separate isolated test issuer** with its own Durable Object grant/guard namespaces, client ID and secret hash, resource validator ID and hash, and distinct GitHub OAuth App whose callback matches the new issuer's `/oauth/callback`. Use a dedicated HTTPS redirect URI the test harness can receive safely (the current issuer mandates an exact registered HTTPS redirect). Restrict the GitHub editor ID to the approved tester. No production bindings, tokens, R2 buckets or shared issuer Durable Objects. Where a separate resource is needed for access-token validation, bind only to this disposable issuer and synthetic data. Keep `workers_dev` and preview settings explicitly configured; disable public test endpoints on completion.

**Acceptance matrix:** browser authorization and PKCE S256 issue an authorization code for the exact audience/read scope; a single successful confidential-client code exchange returns access and refresh tokens; issuer introspection with separately authenticated resource credentials reports active and correct audience/scope/expiry; resource accepts valid access; refresh rotates credentials; old refresh replay fails and cannot leave an active successor; the relevant revocation invalidates the correct family while leaving other grants and the currently connected ChatGPT editor entirely unchanged; expiry rejects access, with test-controlled clocks preferred over assuming ambient time; malformed credentials, wrong audience/scope and wrong redirect continue to fail. Never print actual access/refresh/client secrets into console, GitHub logs, PRs or chat; report only statuses/booleans and redact redirect query strings containing authorization codes.

**Current blockers:** no second isolated issuer/client/redirect or GitHub OAuth App is yet provisioned; the current issuer supports one exact client/redirect and has no supported test-only minting shortcut. Do not invent lifecycle success from local tests or use the active ChatGPT grant. A dedicated browser consent/registered redirect workflow requires an operator step, and the isolated environment should be reviewed before any secret is installed. This is a plan, not permission to deploy production or modify the current editor authorization.
