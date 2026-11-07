# Branch history — feature/newsroom-chatgpt-oauth

**Original branch:** `feature/newsroom-chatgpt-oauth`
**Base:** `98430167c1c5130b41d329d0b99887c29f35ea4f`
**PR:** draft pending creation
**Head commit at handoff:** pending commit
**Status:** experimental adapter; source integration unresolved; nothing deployed or shipped

## Purpose

Prepare the approved branch-only OAuth addition for ChatGPT custom MCP, preserving the five existing bearer principals, four desk boundaries and Presidential publication authority. The user approved local development and draft-PR preparation; merging, provisioning, hosted tests and deployment remain separately gated.

## Changes and artifacts

- `workers/newsroom/src/`: a single-Worker OAuth provider adapter, fixed client/editor policy, exact callbacks, S256 PKCE for both OAuth legs, browser-bound consent/state, operation scopes, token lifecycle and tool metadata. Integration requires three original-Worker ports.
- `workers/newsroom/test/`: synthetic adapter and local Workers-runtime integration tests, with outbound access blocked. No live credentials are used.
- `workers/newsroom/cloudflare.config.ts`: intentionally no Worker entrypoint or remote bindings; no deploy script.
- `workers/newsroom/baseline-provenance.json` and README: inspected live version/ETag, setup-note provenance and remaining integration gate.
- Eleventy excludes `workers/**`. The new PR-only GitHub workflow runs local OAuth checks without Cloudflare credentials or deployment.

## Results and verification

- `npm run typecheck` in the Worker package: passed.
- `npm test` in the Worker package: 20 tests passed in local workerd at compatibility date `2026-10-01`. Includes five-principal routing, exact client/redirect/PKCE/resource checks, CSRF/state, allowed identity, scope enforcement, notification handling, expiry, revocation, refresh rotation and simultaneous code exchange. These exercise a **synthetic legacy adapter**, not the live storage implementation.
- `npm run build:test`: passed; builds the synthetic fixture only.
- Worker-package dependency install/audit: zero reported vulnerabilities. The initially selected Miniflare 4 runtime supported only dates through August 6; the final harness pins Miniflare 5 beta to preserve the inspected October 1 target. No live runtime/configuration change occurred.
- Repository `npm run world:publish-check`: passed, including the full site build and consistency checks. Verified 426 built pages and 281 public records; no `_site/workers` directory. The existing root dependency install reported three high-severity audit findings; root dependency changes were outside this PR.
- Fresh live source baseline, actual desk/R2 regressions, exact rebuilt-bundle comparison, actual ChatGPT linking and hosted tests: **not established**.

## Decisions and lessons

- Reuse the original handlers through explicit ports. Do not reconstruct their behavior from the setup summary or claim that synthetic adapter tests certify desk storage isolation.
- The user's `federated_republic_newsroom_setup.md` confirmed key layout, kinds and review statuses, but contained no code. No token was requested or copied.
- Automatic approval review rejected returning the full live Worker through the connector because embedded credentials could be exposed. A later preflight verified authentication literals were only known labels and secrets were environment-bound, but a complete-source return was still rejected. Do not repeat an encoded/indirect export; obtain a secret-safe local source file.
- A direct dashboard download check did not obtain a source file. The integration prerequisite remains unresolved.
- The provider generates pre-registered client IDs. Use the returned ID, not a requested identifier. Worker Request handling uses manual redirects and rejects non-success GitHub responses; `redirect: error` was incompatible with workerd.
- Production identity/client values have no defaults. Existing legacy bearer routing remains independent of missing OAuth configuration. Keep the separate OAuth storage, explicit read/review scopes and no-publishing boundary.

## Open follow-ups

1. Obtain a secret-free original source file, scan it, retain baseline provenance, and wire the three ports.
2. Run actual own-desk and cross-desk submit/list/read/review tests, including cursors, malformed/prefix-lookalike keys, review history/status and noncanonical protection.
3. Confirm approved immutable GitHub identity and exact ChatGPT callback; separately authorize any app/client/storage provisioning and hosted test.
4. Resolve the observed public 403 and validate the real ChatGPT OAuth round trip in isolated resources before proposing release.

## Preservation and branch disposition

Retain this unfinished branch and its draft PR. No content merge, production release or branch deletion is authorized or claimed. Complete source integration and review before a release decision. Preserve this handoff in the same eventual PR, prefer a merge commit for original-history reachability, and later apply the guarded three-completed-branch retention policy with its exceptions.

External dependency/cleanup review is pending; do not add a `dependencies: none` attestation. The final-SHA review and branch disposition must be recorded under [the lifecycle policy](../BRANCH-LIFECYCLE.md). Main and `archive/legacy-project-material` remain permanent.
