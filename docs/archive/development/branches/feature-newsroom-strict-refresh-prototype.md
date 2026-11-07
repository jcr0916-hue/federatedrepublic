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

## Initial CI verification — 2026-11-07

- Opened **draft PR [#305](https://github.com/jcr0916-hue/federatedrepublic/pull/305)** targeting `feature/newsroom-chatgpt-oauth` (NOT `main`).
- GitHub Actions `Newsroom OAuth checks` run **42356794969**, job **128356529028**, **passed**: `npm run typecheck && npm test && npm run build && npm run build:test`.
- Exactly **34 tests passed; zero failed**, including the five `strict refresh lineage prototype (not wired to OAuth)` state-machine cases.
- The experimental Durable Object module itself was **typechecked**, but **was not instantiated in a Miniflare Durable Object runtime or deployed**. Its transaction behavior remains unverified in a live DO. Build success does not imply provider integration, cross-region isolation or strict token replay protection.
- The release entrypoint `src/index.ts` was not changed. No R2/KV/DO provisioning, credential changes, connected ChatGPT plugin disruption, production deployment or merge occurred.

## SQLite Durable Object integration proof — 2026-11-07

- Added a **local-only** HTTP fixture `prototype/strict-refresh-fixture.ts` that invokes internal DO RPC; the fixture is NEVER imported by `src/index.ts` or configured for deployment.
- Added `test/strict-refresh-runtime.test.ts`: creates a Miniflare Durable Object instance, initializes a hashed grant, dispatches **two concurrent rotations** of the same token, verifies **one success and one replay rejection**, verifies successor rotation and revocation, and confirms a separate grant name is independent.
- Initial run `42356942706` failed HTTP 500. Diagnostic run `42357013701` identified missing SQLite namespace configuration in Miniflare: synchronous `storage.kv` requires `useSQLite:true`; this was a test fixture configuration defect, NOT an OAuth provider failure.
- Corrected fixture to `durableObjects: { REFRESH_GRANTS: { className: "StrictRefreshGrant", useSQLite: true } }` on commit `1279de77d64ee4286f61d42d498963828f640b8e`.
- GitHub Actions `Newsroom OAuth checks` run **42357083595**, job **128357414735**, **passed**: typecheck, tests, release build and fixture build. **35 tests passed / 0 failed**, including live-in-Miniflare SQLite DO serialization. This validates *local* atomicity in the same DO namespace, **not cross-region hosted execution**.
- Remaining: inspect provider 1.2.4 API to determine integration point; connect to an isolated synthetic-only OAuth server; test an actual hosted SQLite Durable Object under concurrent requests from different regions; design credential issuance and reauthorization semantics; capture rollback. Existing test ChatGPT connection, production Worker, R2, KV, main, and canon have not changed.
