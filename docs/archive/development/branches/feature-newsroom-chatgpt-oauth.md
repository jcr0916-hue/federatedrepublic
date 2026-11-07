# Branch history — feature/newsroom-chatgpt-oauth

**Original branch:** `feature/newsroom-chatgpt-oauth`

**Base:** `98430167c1c5130b41d329d0b99887c29f35ea4f`

**PR:** [#304 — draft](https://github.com/jcr0916-hue/federatedrepublic/pull/304)

**Head at handoff:** current head is recorded by the PR; initial adapter checkpoint `0bda38832cb3e77a4504acf0c1303c4d74b4a5b7`, source integration follows.

**Status:** experimental integrated implementation, locally verified; no merge, provisioning or deployment

## Purpose

Prepare the approved branch-only OAuth addition for ChatGPT custom MCP, preserving five bearer principals, four desk boundaries and Presidential publication authority. The user approved local development/testing and a draft PR. Merging, provisioning, hosted tests and deployment remain separately gated.

## Changes and artifacts

- `workers/newsroom/src/legacy.js`: the user's source-only file, original 7,808 bytes unchanged, followed only by `principal`/`mcp` exports. SHA-256 and scanned provenance are recorded in `baseline-provenance.json` and verified by a test. No real credentials were supplied or copied.
- `src/index.ts`, `adapter.ts`, `legacy.d.ts`: connect the actual original handlers to the OAuth provider. Legacy bearer and REST paths use the original implementation without requiring OAuth configuration.
- `src/oauth.ts`, `policy.ts`, `github.ts`: fixed client/editor policy, exact callbacks, S256 PKCE on both legs, browser-bound consent/state, scopes, lifecycle and tool metadata. OAuth permits read/list and separately scoped review, never submit/publish.
- `test/`: local Workers-runtime tests with synthetic credentials, mocked GitHub, local R2/KV and blocked outbound access. Both actual handlers and a synthetic policy adapter are covered. Test administration is absent from the release entrypoint.
- Local integrated/fixture builds; `cloudflare.config.ts` still has no deployment target/bindings or deploy script. A PR-only workflow runs checks without cloud credentials. Eleventy excludes `workers/**`.

## Results and verification

- Worker `npm run typecheck`, `npm run build` and `npm run build:test`: passed.
- Worker `npm test`: **27 passed** at compatibility date `2026-10-01`. Actual-handler cases cover response parity for all five legacy principals through the integrated entrypoint without OAuth configuration; four-desk submission/list/read isolation; forged fields; pagination/foreign cursors; malformed/prefix-lookalike keys; editor-only reviews; all eight statuses/history; preserved `nonCanonical: true`; and OAuth reads/scoped reviews through actual R2 handlers. OAuth tests also cover discovery, exact client/redirect/PKCE/resource, consent/CSRF/browser binding, allowlisted identity, denied tools, notifications, expiry, revocation, refresh rotation, policy removal and code reuse/concurrency in one runtime.
- The initial actual-handler OAuth test attempted to use an older grant after reconnecting. The provider correctly revoked it. The final test checks that revocation and then uses the replacement grant; application policy was not relaxed.
- Worker dependency audit: zero reported vulnerabilities. Stable Miniflare 4 did not support the inspected October date; the exact Miniflare 5 beta pin preserves that target. No live runtime/configuration change occurred.
- Repository `npm run world:publish-check`: passed again after source integration, including the full site build/consistency checks (426 pages, 281 public records, no `_site/workers`). Root install reported three preexisting high-severity findings; root dependency changes are outside scope.
- Live metadata recheck after source integration: deployment `7a53aadb-d87e-46e5-b7b8-831970590373`, version `08a99769-3618-488e-adbd-30a8be38a788` at 100%, unchanged.
- Exact match of the supplied file to the deployed module, rebuilt-bundle deployment parity, cross-colocation KV atomicity, hosted tests and actual ChatGPT linking: **not established**.

## Decisions and lessons

- Reuse the actual original handlers. The setup note alone contained no code; it could not certify R2 isolation. The user later supplied `newsroom-worker.txt`, resolving local source integration. Preserve that baseline and avoid reconstruction.
- Automatic review had rejected returning full live source through the connector. No encoded/indirect export was used; the import came from the user's local file. Its byte equivalence to production is not asserted.
- Source review confirms the agent view intentionally retains the original submission status while editors get the status overlay. Review never rewrites the original noncanonical submission. Preserve those semantics unless separately requested.
- Pre-registration generates the client ID; use the returned ID. Manual redirects plus status rejection are required by workerd's Request implementation for the fixed GitHub endpoints.
- Keep production identities/client values unset, a separate OAuth store, explicit read/review scopes, private administrative helpers and no publication authority. Reconnecting replaces the prior editor grant for this client/resource.

## Open follow-ups

1. Confirm the approved immutable editor identity and exact ChatGPT callback; separately approve any app/client/storage provisioning and isolated hosted test.
2. Resolve the observed public 403 and verify real ChatGPT linking, revocation/reconnect, and isolation without production data.
3. Assess code/refresh single-use behavior across locations and introduce coordinated storage if required; a local concurrency pass alone is insufficient.
4. Verify the production baseline, review release configuration/rollback, and seek separate merge/deployment approval.

## Preservation and branch disposition

Retain the unfinished branch and draft PR. Nothing is shipped; no content merge, production release or branch deletion is authorized or claimed. This handoff belongs in the same eventual PR. Prefer a merge commit for original-history reachability and later apply the guarded three-completed-branch retention policy with its exceptions.

External dependency/cleanup review remains pending; do not attest `dependencies: none`. The final-SHA review and eventual disposition must be recorded under [the lifecycle policy](../BRANCH-LIFECYCLE.md). Main and `archive/legacy-project-material` remain permanent.
