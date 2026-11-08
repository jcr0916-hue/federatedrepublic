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
