# Read-only R2 S3 storage credential prototype (not deployed)

**Status: EXPERIMENTAL, NOT RELEASE SELECTED.** This work addresses PR #310 finding F6 by exploring a true storage credential permission boundary instead of treating a frozen JavaScript `get/list` façade as storage authorization. No Cloudflare token has been created or tested; no real bucket is attached.

Cloudflare R2 supports **bucket-scoped Object Read only** credentials for its **S3-compatible API**: https://developers.cloudflare.com/r2/api/tokens/. Workers' native `R2Bucket` binding still exposes write operations. The prototype in `src/readonly-s3-storage.ts` does not use a native R2 binding. It issues only SigV4-signed GET operations (GetObject and ListObjectsV2) using injected S3 endpoint/bucket/access-key credentials. This adapter is NOT yet wired to `src/resource-candidate.ts` and leaves the currently working candidate and Verification 04 unchanged.

## Prototype contract

- Exact bucket-scoped credential: must be created with **Object Read only**, restricted to precisely the approved bucket and approved by the President. A code-level GET-only restriction cannot compensate for mistakenly assigning a write-capable S3 credential.
- Endpoint: `https://<account-id>.r2.cloudflarestorage.com/` or exact Cloudflare jurisdictional variant. `bucket`, `accessKeyId` and `secretAccessKey` must be distinct production-only values. No credentials in URLs, source, logs or PR. None provisioned.
- Legacy read calls needed: `get(submissions/...)`, `get(status/...)`, `list({ prefix: submissions/... , limit, cursor })`. No mutating method or review submission path is exposed.
- SigV4 `GET` with canonical request digest, headers, service `s3`, region `auto`; no redirects, failures fail closed, bounded response objects and strict prefix/key checks.
- Read responses are mapped to minimal `get().json()` and `list().objects[].key`, `truncated`, `cursor` interface expected by the preserved newsroom handlers.

## What is and is not proven

- Unit tests exercise signed-method and host allowlists, no exposed write operations, query pagination and XML key decoding, malformed data and redirect/size failure handling using synthetic in-process mocked HTTP responses.
- **Not proven:** signing interoperability with live R2 S3; region-specific signing semantics; list XML variants, continuation behavior, latency/streaming semantics, errors or ETag; compatibility with the complete preserved newsroom read handler in deployed Workers; real credential privilege enforcement; worker subrequest/egress restrictions; current-state production integration.
- The current OAuth resource still uses the native write-capable `NEWSROOM` binding and passes a frozen read façade. Do not claim F6 closed until an independently reviewed resource implementation has **no R2Bucket binding** and a live bucket-scoped **Object Read only** credential is validated, including denied Put/Delete attempts and read/list of synthetic material in a hosted environment.

## Next gates

1. CI typecheck and unit tests for this prototype; retain review evidence and permanent branch handoff.
2. Review SigV4 canonical encoding and XML parsing against documented S3/R2 behavior; add protocol-accurate integration fixtures and a deterministic signature test vector. Reject the prototype if proof is insufficient.
3. On a separate dependent branch, integrate the adapter with the resource Worker and replace the native bucket binding with a minimal set of **new** S3 read-only credential variables. Never pass a write secret or native R2 binding to the new resource.
4. Run isolated hosted tests with a **new synthetic bucket and bucket-scoped Object Read only token**. Demonstrate authorized GET/List and S3 Put/Delete **403** with this token using a safe throwaway key. Do not run write tests against production.
5. Only after independent audit, review production R2 bucket identity, rollback and President approval, plan a production release. Existing legacy Worker and Verification 04 remain unchanged throughout.

No production configuration, source entrypoint change, canonical publication, main merge or token creation is authorized by this prototype.
