# Constitution 20 — Managed newsroom Gateway integration contract

**Status:** PROPOSED, review-only. **Date:** 2026-11-15. **Dependency:** stacked drafts #323 → #324 → #325. No runtime activation or authorized paid calls.

## Purpose and boundaries

Connect the existing managed newsroom controls to **Vercel AI Gateway** without rebuilding the newsroom, rewriting Canon, or weakening Central Editor review. GitHub `main` is the authoritative constitutional/canon/policy source and shared, public agent-memory checkpoint. Cloudflare R2 remains the private submission inbox. No model may publish, merge, change policy, choose its own privileges, or receive GitHub/R2 credentials.

Existing Federal pilot implementation in `scripts/newsroom/managed-federal.mjs` and `github-writer.mjs` is intentionally Federal-specific. It is **not** yet a desk-agnostic runtime. Roster `docs/torenthia/agents/roster.json` currently lists Federal, Korda, Varek, Corindal with both global and desk switches off, `providerRef: "litellm"`, placeholder model aliases, and proposed per-run limits (2 calls, 16,000 input tokens, 4,096 output tokens, 120 seconds, 5 cents). These are not proof of enforceable live billing limits.

## Contract A — trusted planner and job authority

1. The trusted dispatcher selects only a roster-approved desk from an immutable protected `main` commit; both `automationEnabled` and its `enabled` switch must authorize it. An approved supervised fixture may enable switches **only in an isolated in-memory test copy**.
2. Bind each short-lived, signed job to `agentId`, desk, immutable policy head, expected draft head, draft PR, exact receipt/decision IDs, source-bundle hash, model policy revision, budget reservation ID and expiry. Reject mismatched/expired/stale grants; never silently broaden a Federal grant to other desks.
3. Keep a stable job/slot claim to serialize each desk and prevent duplicate model charges on retry. Enforce maximum active runs, call count, token counts, wall time, reserved cost, cumulative daily spend, and upstream retry/fallback counts. Reserve worst-case model/fallback cost **before** paid calls; refuse if the ceiling cannot be verified from current provider prices. Gateway-level budgets are defense-in-depth, not a transactional per-run ceiling.
4. Re-read protected toggles immediately before every paid invocation, R2 submission and GitHub write; abort in-flight work on pause and reconcile ambiguous outcomes. A changed policy head invalidates authorization.

## Contract B — Gateway adapter

1. Trusted server-side adapter uses Gateway OpenAI-compatible API `https://ai-gateway.vercel.sh/v1` with a server-only `AI_GATEWAY_API_KEY` (or verified trusted OIDC exchange). Use provider/model IDs configured in a reviewed policy; never put keys, headers, private prompts or raw responses into GitHub, model output, telemetry, CI or PRs.
2. Model-specific primary and fallback IDs remain **UNSELECTED** until benchmarking and signed-off price/quality review. Migrate `providerRef` and aliases only together with roster-validator, CLI and fixture updates. Do not change existing live site model routing while the agent adapter is developed.
3. Explicitly cap input/output tokens, number of API attempts, elapsed time and worst-case cost; classify 402 as budget exhausted (no retry), distinguish gateway/upstream 429 and use bounded jitter only where permitted. A fallback is another paid call under the **same** job budget; never silently retry expensive work.
4. Record provider, model ID, request/attempt count, token usage, reported cost, masked failure category and immutable policy revision without prompts or secret values. Reconcile actual against reserved cost; stop if usage is unavailable and the maximum affordable exposure cannot be bounded.
5. For dry runs, inject a fake transport; assert **zero network, zero paid calls, zero R2 writes, zero GitHub writes**. Never rely on a live budget alert as a substitute for this test.

Sources: [Vercel API compatibility](https://vercel.com/docs/ai-gateway/sdks-and-apis), [authentication](https://vercel.com/docs/ai-gateway/authentication-and-byok), [key budgets](https://vercel.com/changelog/budgets-for-api-keys-on-ai-gateway).

## Contract C — generic desk authorization

1. Extract common grant/policy/receipt/note operations from the Federal pilot **after preserving its current fixture invariants**. Resolve desk and exact `workspacePath`, `allowedWrites`, and `inboxDesk` from a validated roster at immutable protected `main`; reject missing identity, duplicate desk bindings, unreviewed files, executable files, and cross-desk requests.
2. No agent can choose its own GitHub branch or file path. The trusted writer checks the editor-staged same-repository **draft** PR, exact diff, approved base and expected head; commit with GitHub's atomic expected-head operation. Preserve idempotent exact replay and verification after ambiguous responses. Do not assume the Federal-specific `agent-notes/federal` constant can be reused for another desk.
3. R2 bridge reads one exact ledger-linked receipt with hash, UUID and desk verification. Each submission must be scoped to its own desk and reconcile ambiguous replies. Raw receipt objects and private narrative do not enter public notes or model prompts; provide only reviewed, shareable assignment/source excerpts.
4. New desk/ingress credentials and GitHub App scope need separate approval. The existing TypingMind routes remain independent; disabling a managed roster entry alone does not revoke legacy desk credentials.

## Contract D — Ashbridge first joint acceptance

Use an **already prepared, approved Ashbridge source packet**; never infer canonical facts from planning documents. Exercise Federal and the relevant verified state desk (Corindal only if the source packet confirms jurisdiction) in a supervised, offline fixture first.

Acceptance gates: (a) independently scoped grants; (b) pinned source hierarchy and accurate citations; (c) known-source vs unestablished claims marked; (d) cross-desk access refused; (e) held/moved policy and stale draft refused; (f) exact replay returns the same result; (g) one budget reservation shared across fallback/retry; (h) pause aborts side effects; (i) editor sees complete reviewable output; (j) no canon publication, merge, live submission or cost incurred in acceptance fixture.

**Only after** the above is tested and documented may the President separately approve the GitHub App and read-only inbox binding, actual provider/model IDs and hard ceilings, one staffed paid pilot, recurring schedule, and publication—each its own approval gate.

## Implementation sequence and reports

1. Write contract tests for the Gateway transport fake (402, 429, timeout, retry/fallback, token/cost overrun), then generalize the existing desk writer while retaining Federal tests.
2. Add desk-isolation and idempotency fixtures, then the Ashbridge no-network joint exercise.
3. Require Node 24 newsroom test suite, roster/ledger validator and local World publishing suite with actual result logs. No result is claimed by this specification alone.
4. Preserve this PR and its handoff as a draft, stacked on #325; do not retarget to `main` ahead of the dependency chain.

### Unresolved

- Gateway model IDs and benchmark; actual model pricing and hard cost reserve.
- GitHub App installation and effective branch rules; read-only R2 bridge credential.
- Ashbridge exact immutable source-packet/ref and state-desk eligibility.
- Proper cancellation and durable cost reservation backend; production telemetry retention.
- Whether desk-agnostic PR staging follows separate `agent-notes/<desk>` naming or a more restrictive approved mapping.

**No change to canon, agent switches, production configuration, scheduled triggers or secrets is included here.**
