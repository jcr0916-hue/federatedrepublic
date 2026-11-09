# Newsroom infrastructure completion — branch handoff

Branch: `feature/newsroom-infrastructure-completion-20261108`. Draft [PR #314](https://github.com/jcr0916-hue/federatedrepublic/pull/314). Parent: draft [PR #313](https://github.com/jcr0916-hue/federatedrepublic/pull/313), exact head `dc55fa55aa43cc60451ddabdb5d1f516c970ce28`. All parent head/base branches remain active dependencies and must be retained.

Purpose: resume the durable handoffs and replace ambiguous completion claims with tested controls and actual GitHub/Cloudflare evidence, while preserving the production Worker, working Editor grants, canon and deployment boundaries.

Experimental changes: durable account-wide invalidation epoch; inactive-bearer quota isolation; bounded S3 streaming and strict pagination flag validation; repeatable four-desk MCP/REST acceptance runner; S3-only, unapproved release contract; consolidated operations/onboarding and remaining-gate record in [INFRASTRUCTURE-COMPLETION.md](../../../../workers/newsroom/INFRASTRUCTURE-COMPLETION.md).

Actual results: both parent PRs' latest real publishing/OAuth checks succeed. Implementation commit `be72290afacf5f3e9531c7607ff5910f3fe3c7ad` passes [real OAuth CI](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42548852956) on Node 24.22.2: 111/111 tests, typecheck, five bundles; [publishing CI](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/42548852955) succeeds. Local 111/111 suite/builds pass; follow-up actual alarm cleanup/restart test also passes. Live read-only list/read and two-page S3 pagination succeed; Verification 04 also lists its separate fixture. Latest PR checks must be re-read before integration.

Real hosted legacy acceptance passes 149 checks on four desks, using only exact preserved production source, a new disposable bucket and generated test credentials. Test Worker `newsroom-legacy-isolation-20261108`, version `adc0539d-c531-4e3c-8cd6-c7be627be253`, deployment `570b826c-3cbe-44cf-b3cf-42cd79301f10`. Six synthetic objects remain for evidence. Workers.dev and previews are disabled, confirmed through Cloudflare. Initial management-runtime HTTP calls were blocked by its outbound-host allowlist; desktop HTTP testing then passed. No hosted OAuth lifecycle success is claimed.

Shipped: nothing to main or production. Existing production and known-working acceptance deployments/grants are preserved. Historical checkpoints remain in the parent handoffs. Do not repeat the S3 credential-provisioning/AWS permission proof already recorded in #313; do not confuse it with a new hosted token lifecycle result.

Unresolved: real disposable GitHub consent/lifecycle, independent security/operations sign-off, distributed abuse and public authorize-budget exhaustion, hosted global containment/rotation and regional replay/rollback, administrative main protection and Presidential release approval. Main currently reports unprotected and no repository rulesets; committed Vercel configuration deploys main only. See the consolidated record for exact evidence and operator steps.

Rejected: reusing/revoking the working ChatGPT Editor grant, repurposing the fixed Editor OAuth principal as an agent identity, deploying synthetic mint/clock fixtures, changing preserved legacy bytes, attaching production data, claiming local tests are hosted/independent proof, or merging merely because CI is green.

Disposition: retain this unfinished branch and every open PR dependency. No branch deletion or merge is authorized. Complete the AGENTS.md preservation/protection/dependency checks at eventual reviewed integration; this branch is not eligible for completed-branch rotation yet.
