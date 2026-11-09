# Newsroom infrastructure completion — branch handoff

Branch: `feature/newsroom-infrastructure-completion-20261108`. Parent: draft [PR #313](https://github.com/jcr0916-hue/federatedrepublic/pull/313), exact head `dc55fa55aa43cc60451ddabdb5d1f516c970ce28`. PR number pending creation. All parent head/base branches remain active dependencies and must be retained.

Purpose: resume the durable handoffs and replace ambiguous completion claims with tested controls and actual GitHub/Cloudflare evidence, while preserving the production Worker, working Editor grants, canon and deployment boundaries.

Experimental changes: durable account-wide invalidation epoch; inactive-bearer quota isolation; bounded S3 streaming and strict pagination flag validation; repeatable four-desk MCP/REST acceptance runner; S3-only, unapproved release contract; consolidated operations/onboarding and remaining-gate record in [INFRASTRUCTURE-COMPLETION.md](../../../../workers/newsroom/INFRASTRUCTURE-COMPLETION.md).

Actual results at this checkpoint: both parent PRs' latest real publishing/OAuth checks succeed; original 104 tests pass locally; intermediate expanded suite passed 109/109. Final expanded tests/builds and this branch's supported-Node CI pending. Live read-only connector smoke tests succeed for S3 acceptance and Verification 04. No hosted lifecycle success is claimed. Disposable legacy hosted acceptance is prepared, not yet run.

Shipped: nothing to main or production. Existing production and known-working acceptance deployments/grants are preserved. Historical checkpoints remain in the parent handoffs. Do not repeat the S3 credential-provisioning/AWS permission proof already recorded in #313; do not confuse it with a new hosted token lifecycle result.

Unresolved: real disposable GitHub consent/lifecycle, independent security/operations sign-off, distributed abuse and public authorize-budget exhaustion, hosted global containment/rotation and regional replay/rollback, administrative main protection and Presidential release approval. Main currently reports unprotected and no repository rulesets; committed Vercel configuration deploys main only. See the consolidated record for exact evidence and operator steps.

Rejected: reusing/revoking the working ChatGPT Editor grant, repurposing the fixed Editor OAuth principal as an agent identity, deploying synthetic mint/clock fixtures, changing preserved legacy bytes, attaching production data, claiming local tests are hosted/independent proof, or merging merely because CI is green.

Disposition: retain this unfinished branch and every open PR dependency. No branch deletion or merge is authorized. Complete the AGENTS.md preservation/protection/dependency checks at eventual reviewed integration; this branch is not eligible for completed-branch rotation yet.
