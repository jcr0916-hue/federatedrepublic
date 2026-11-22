# Newsroom OAuth — replay protection decision and isolated implementation plan

**Status:** PROPOSED / SECURITY GATE. **Scope:** draft PR #304, `feature/newsroom-chatgpt-oauth`. **No production authorization.**

## Verified baseline and constraint

- The isolated test Worker and ChatGPT editor are connected with `newsroom:read`; the original agent bearer paths, desk separation, R2 submissions, review notes and noncanonical content policy remain intact.
- `@cloudflare/workers-oauth-provider` is pinned to `1.2.4`. The provider deliberately permits an immediately previous refresh token to recover a lost refresh response. A local test issued two concurrent refresh requests with the same token and both succeeded; that is **observed behavior**, not proof of a broken integration. The final corrected test and CI passed at `dc4c79f`.
- Cross-location Workers KV does not provide transactional compare-and-swap for this rotation state; a test in one Miniflare instance is not proof of globally serialized refreshes. Relevant provider discussion: https://github.com/cloudflare/workers-oauth-provider/issues/214.
- The current editor plugin deliberately grants only `newsroom:read`. The `newsroom:review` OAuth path remains locally tested, not validated end-to-end in the hosted ChatGPT connection.

## Decision: strict review authorization requires coordinated replay controls

**Proposed security policy, not yet implemented or approved for production:**

1. Keep the currently working OAuth test client **read-only** and do not disrupt its KV grant, rotate its credentials, or change its callback during this work.
2. Before enabling `newsroom:review` over OAuth in production, use an authorization design whose refresh-token rotation and revocation decisions are serialized across geographic regions and can detect replay. The leading candidate is a **SQLite-backed Durable Object**, with one strongly consistent authority per editor grant or client/editor pair. Do not assume that merely binding a Durable Object to the existing provider supplies the required property.
3. Evaluate the provider API first. If it cannot externalize grant/refresh lifecycle and enforce strict replay checks, prototype an explicitly scoped adapter or a separate compatible OAuth authorization server **on another isolated feature branch or test Worker**. Do not silently patch vendored minified code or put a public token/introspection/admin endpoint in front of the service.
4. Retain short-lived, resource-bound access tokens, exact fixed client/callback, PKCE S256, GitHub numeric user ID allowlist, consent/session binding, and least-privilege tool filtering. OAuth token refresh must never grant scopes beyond the original consent; agent bearer principals must remain unchanged.
5. If strict replay is not achievable with a compatible provider without large additional complexity, document the alternative (keep production OAuth **read-only**, with editorial review restricted to existing bearer access), its residual risks, and obtain an explicit decision before rollout.

## Acceptance tests for the proposed hardened design

- **Concurrent use:** two refreshes of the same current token, arriving at the same time through distinct Worker instances/regions, produce one accepted transition and one rejected replay (or a documented safe idempotent *identical response*, never two divergent live successor tokens).
- **Replay:** a used previous token cannot silently produce another successor; a detected replay is logged without recording raw token, and the chosen revocation policy is enforced.
- **Revocation:** after a test grant is revoked, old access and refresh tokens fail consistently; a new GitHub-authorized grant can connect without inheriting the old token lineage.
- **Scope:** read-only grants cannot call `newsroom_review`, `newsroom_submit` or any publication operation, even by direct JSON-RPC invocation. A specifically consented review grant can append `UNDER_REVIEW` to test-only material, but still cannot submit or publish.
- **Isolation:** actual Corindal/Korda/Varek/Federal bearer identities remain desk-limited; editor has cross-desk list/read only by explicit policy.
- **Availability:** partial/retried refresh does not silently elevate privileges, leak secrets, or strand the editor in an irrecoverable state. Document expected client reauthorization behavior.
- **Rollback:** record exact test Worker version, KV/DO bindings, storage migration and recovery procedure before any live rollout. No live grant or existing test R2 record may be migrated destructively during the prototype.

## Implementation sequence

A. Confirm pinned provider extensibility and compare (i) accept documented grace for read-only editor, (ii) use a distinct coordinated authorization implementation for review. Record the decision and effort/operational trade-offs.

B. Develop a **separate, isolated prototype**, with synthetic client IDs/secrets and no access to production R2, production bearer keys, or existing ChatGPT test grant. Use Durable Object transactional storage only if it actually serializes refresh/revocation state.

C. Add deterministic concurrent-refresh, replay, consent/scope, revocation, reconnect, origin, redirect and cross-desk tests. CI must pass before any hosted test. A green CI is not a cross-region verification.

D. Run a controlled hosted test on **new test credentials**, without disconnecting the existing editor. Collect non-secret evidence and update `workers/newsroom/HOSTED-TEST.md`.

E. Request Presidential approval **separately** for changes to the PR release architecture, any production configuration, the merge, and the deployment. No publication or advancement of fictional time is implied.

## Current disposition

- **Shipped to production:** nothing.
- **Working isolated test:** read-only ChatGPT editor, original agent bearer flow, separate editor legacy reviews.
- **Unresolved:** live OAuth review-scope grant, strict refresh-token replay prevention across regions, deterministic hosted revocation denial, production release gate.
- **Do not repeat:** the observed two-success concurrent local test and provider grace-period explanation are already recorded in `HOSTED-TEST.md`; they do not need to be rediscovered.

Sources: https://github.com/cloudflare/workers-oauth-provider/blob/main/docs/advanced-configuration.md; https://github.com/cloudflare/workers-oauth-provider/issues/214; https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/.
