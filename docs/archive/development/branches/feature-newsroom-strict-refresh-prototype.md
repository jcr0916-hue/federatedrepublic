# Branch handoff — feature/newsroom-strict-refresh-prototype

**Branch:** `feature/newsroom-strict-refresh-prototype`
**Base:** `feature/newsroom-chatgpt-oauth` (draft PR #304), originating from branch head `9e42c3f78c894fda93837165dea80ebf37fbafb0`.
**Status:** EXPERIMENTAL / isolated source only. No deployed code, no production release, no canonical content.

## Purpose

Explore a stricter alternative to Cloudflare OAuth provider's deliberate previous-refresh-token grace behavior without altering the working ChatGPT editor connection or existing bearer desks.

## Changes

- `workers/newsroom/prototype/refresh-state.ts`: deterministic hash-only refresh lineage transition policy; accepts only the current token hash, rejects replay, expiry and revocation.
- `workers/newsroom/prototype/strict-refresh-grant.ts`: unbound SQLite-backed Durable Object candidate; serializes initialization, rotation and revocation through `ctx.storage.transactionSync` and `ctx.storage.kv`. Intended one-instance-per-editor-grant. There is NO public handler or release entrypoint import.
- `workers/newsroom/test/strict-refresh-prototype.test.ts`: standalone policy-unit tests for creation, transition, replay, expiry, revocation and malformed hashes.

## Results and known limitations

- **Not yet established at initial handoff:** CI TypeScript, local tests, hosted invocation, DO migration config and cross-region concurrency behavior. Record actual workflow outcomes as they arrive.
- This does **not** replace `@cloudflare/workers-oauth-provider`. There is no integration with its grants, token issuance, signature validation, refresh or revocation flows, no credential hashing boundary, and no generated client credentials. Do **not** deploy as a drop-in fix or claim production readiness.
- The pure transition policy by itself is not a concurrency guarantee. Serialization depends on actual SQLite Durable Object storage and a single authoritative instance per grant. Real DO runtime tests and across-location tests are still required.
- DO RPC methods are intended to be **binding-only**; caller authentication and scope verification belong to the not-yet-written OAuth integration. Do not expose `initialize` or `rotate` as public HTTP/MCP endpoints.

## Decisions

Use a separate branch based on PR #304 rather than modifying its deployed source. Keep the authenticated read-only ChatGPT editor untouched; do not copy live credentials, KV, R2, or GitHub identity data into the prototype.

## Follow-ups and disposition

1. Run/typecheck tests in CI (draft PR targeting `feature/newsroom-chatgpt-oauth`); correct any compile/test errors.
2. Add a Miniflare/local Durable Object integration test verifying atomic concurrent RPC rotations and restart persistence. Confirm SQLite DO API against current Cloudflare docs.
3. Verify whether OAuth provider 1.2.4 supports replacing storage/refresh lifecycle safely. If not, prototype an explicit adapter/server on a **separate isolated Worker** with synthetic-only credentials, and obtain authorization before provisioning.
4. Validate strict replay, revocation/reconnect, audience/scope, cross-region consistency and rollback.
5. Retain branch while open; never merge into PR #304 or `main`, deploy production, or advance Torenthia canon without explicit Presidential approval. Final branch cleanup follows AGENTS.md and the branch lifecycle policy.

Historical provenance: `workers/newsroom/HOSTED-TEST.md`, `workers/newsroom/OAUTH-SECURITY-DECISION.md`, draft PR #304. Maintain separation from Constitution-Lab.
