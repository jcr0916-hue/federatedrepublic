# Read-only newsroom OAuth — production release architecture and gates

**Decision:** The first production OAuth release is **read-only**. This document is a release *design*, not deployment authorization or a runnable Cloudflare config. **Status: NOT READY TO DEPLOY.**

**Source review follow-up:** [The November 8 security review](SECURITY-REVIEW-20261108.md) records reproduced defects, branch-only mitigations and unresolved release blockers. This agent-assisted review is not an independent external audit and does not satisfy G0's independent-review gate. None of its runtime changes have been deployed to Verification 04 or production.

## Verified baseline (2026-11-08)

- The original production Worker `federated-republic-newsroom` has five legacy bearer secrets (`KEY_CORINDAL`, `KEY_KORDA`, `KEY_VAREK`, `KEY_FEDERAL`, `KEY_EDITOR`) and an R2 `NEWSROOM` binding; no OAuth candidate bindings were added to that Worker. Production legacy clients continue to use their existing paths.
- The independent candidate issuer `newsroom-strict-issuer-candidate` has two SQLite Durable Object namespaces (`ISSUER_GRANTS` and `ISSUER_GUARD`), distinct GitHub and OAuth confidential-client credentials, a resource-validator identity and exact origin/callback/audience settings.
- The candidate MCP resource `newsroom-strict-resource-candidate` has a service binding `ISSUER` to the candidate issuer and a private synthetic `NEWSROOM` R2 bucket plus distinct resource-validator credentials. It does not receive the five legacy bearer keys.
- Real ChatGPT `Torenthia OAuth Verification 04` completed authentication/code exchange, MCP discovery, `newsroom_list` and `newsroom_read` of a marked noncanonical synthetic Korda proposal. Missing-key and filtered empty-desk cases also behaved as expected.
- All five draft PRs #304–#308 remain unmerged. The current source entrypoint `src/index.ts` still assembles the original KV/provider OAuth adapter and is built as `dist/worker.js`. It is **not** the recommended production OAuth entrypoint. Hardened issuer and resource are built separately; no production deployment configuration exists.

These facts establish hosted interoperability, **not** production readiness. Earlier reports in `ISSUER-CANDIDATE.md`, `HOSTED-TEST.md` and prototype assessments contain historical milestones and should not be silently rewritten as present-day deployment state.

## Chosen architecture

1. **Legacy newsroom (unchanged):** maintain the existing production Worker, R2 storage, agent desk isolation, editorial submission/review paths and original bearer secret identities. Nothing here changes its routes, bindings, data model, or canon policy.
2. **Production OAuth issuer (NEW, separate name):** build **only** `src/issuer-candidate.ts` → `dist/issuer-candidate.js`. One pre-registered confidential ChatGPT client, exact redirect and audience, GitHub numeric editor allowlist, PKCE S256, signed-in consent, SQLite grant/guard authorities, short access lifetime, strict one-time refresh, credential-authenticated revocation and introspection.
3. **Production read-only MCP resource (NEW, separate name):** build **only** `src/resource-candidate.ts` → `dist/resource-candidate.js`. Bind `ISSUER` to the new production issuer as a Cloudflare **service binding**, not a public URL proxy. Bind `NEWSROOM` to the intended production R2 bucket only after explicit review and approval. Enforce exact bearer issuer/audience/client/scope/expiry on **every** call and expose exactly `newsroom_list` and `newsroom_read`. ChatGPT `server/discover` remains supported.
4. **Editor and publishing authority:** existing bearer-based review/submission paths remain external to OAuth. No `newsroom:review` OAuth grant, `newsroom_submit`, `newsroom_review`, publish or arbitrary REST operation may be exposed through this release.
5. **Canonical publication remains GitHub:** the newsroom is an unpublished-draft transport, never automatic publication or a constitutional/canon authority.

**Why not promote PR #304's built `dist/worker.js`?** It uses `@cloudflare/workers-oauth-provider@1.2.4` with Workers KV, which explicitly supports a previous-refresh-token recovery grace window. It does not supply the required strictly serialized refresh/replay semantics. PR #304 remains useful for preserving and testing legacy behavior; it is not an approved hardened OAuth release path. Do **not** combine its OAuth token endpoint with the candidate issuer, put both credentials behind one Worker, or swap it over production's existing Worker.

## Production environment boundaries — placeholders, NOT values

Use two **new** uniquely named Workers, two **new production-only SQLite Durable Object namespaces**, dedicated OAuth client and GitHub app credentials, independent resource-validator identity/secret, and explicitly approved production URL/origin. Do not reuse the isolated `newsroom-strict-*` client, secrets, grants, DO namespaces or synthetic R2 bucket; do not rename/overwrite the existing `federated-republic-newsroom` Worker. Name/route selection requires an explicit approval checkpoint.

Issuer must provide exactly the necessary bindings, including **ISSUER_INGRESS_LIMIT** (Cloudflare rate-limit binding; exact namespace/threshold selected at deployment): `ISSUER_ORIGIN`, `ISSUER_CLIENT_ID`, `ISSUER_CLIENT_SECRET_SHA256` (secret), `ISSUER_REDIRECT_URI`, `ISSUER_AUDIENCE`, `ISSUER_EDITOR_ID`, `ISSUER_GITHUB_CLIENT_ID`, `ISSUER_GITHUB_CLIENT_SECRET` (secret), `ISSUER_RESOURCE_ID`, `ISSUER_RESOURCE_SECRET_SHA256` (secret), `ISSUER_GRANTS` and `ISSUER_GUARD` (DO namespaces).

Resource must provide **RESOURCE_INGRESS_LIMIT** (Cloudflare rate-limit binding; exact namespace/threshold selected at deployment), plus: `RESOURCE_AUDIENCE`, `RESOURCE_ISSUER`, `RESOURCE_CLIENT_ID`, `RESOURCE_VALIDATOR_ID`, `RESOURCE_VALIDATOR_SECRET` (secret), `ISSUER` (service binding pinned to production issuer), `NEWSROOM` (R2 binding pinned only to the approved existing production bucket).

Cross-binding invariants to verify without disclosing secrets:
- `ISSUER_ORIGIN == RESOURCE_ISSUER`; `ISSUER_AUDIENCE == RESOURCE_AUDIENCE` (full URL including `/mcp`); `ISSUER_CLIENT_ID == RESOURCE_CLIENT_ID`.
- `ISSUER_RESOURCE_ID == RESOURCE_VALIDATOR_ID`; the issuer's stored `ISSUER_RESOURCE_SECRET_SHA256` equals the digest of `RESOURCE_VALIDATOR_SECRET`. OAuth client and validator must use distinct identities/secrets.
- `ISSUER_REDIRECT_URI` equals **the callback ChatGPT actually displays** for the new production connection; GitHub dedicated app callback must equal `ISSUER_ORIGIN + '/oauth/callback'`. URLs must be HTTPS and exact.
- `ISSUER_GRANTS` and `ISSUER_GUARD` refer to the intended **new** production namespaces; the `ISSUER` service binding points to the intended **new** issuer Worker.
- No `KEY_*` secrets, `OAUTH_KV`, `CHATGPT_CLIENT_ID` or original `GITHUB_CLIENT_SECRET` belong on the hardened resource. No test data may appear in the production bucket.
- **R2 risk:** a standard Worker R2 bucket binding exposes mutating methods as well as reads. The current MCP source protects reads by allowlisting only the two read tools, but that is **application-layer** enforcement, not a storage-level read-only credential. Independent review must explicitly assess this residual risk; do not call the R2 binding intrinsically read-only.

## Required ordered gates (not satisfied by this document)

**G0 — Frozen review source and approval.** Keep PR #304 → #305 → #306 → #307 → #308 and this branch as draft until integration/review is complete. Audit source, CI artifacts, dependency locks, build scripts and source-to-bundle hashes. Obtain an **independent** security review, not just the author's self-review. Verify unchanged baseline source versus deployed production Worker if modifying it is ever proposed (not proposed here).

**G1 — Operations and threats.** Assess issuer shared-budget exhaustion (authorization, token, introspection and revoke), per-source/edge rate limits, outage response, GitHub downtime, replay monitoring without sensitive data, Cloudflare token/secret logging redaction, R2 binding write capability, region/edge replay guarantees, and account-wide grant supersession policy. Specify 24/7 monitoring ownership, error budgets, incident escalation and scoped secret rotation. No global token logging. Never expose debug/token mint routes.

**G2 — Production-specific resources, approval required.** After explicit approval, create two new Workers, two separate production DO namespaces, fresh dedicated OAuth/GitHub confidential credentials, and new ChatGPT client registration. Securely bind a service reference; *do not attach production R2 yet*. Confirm private storage namespaces and deploy target IDs are distinct from both test and legacy assets. Record non-secret inventory and backout decision point.

**G3 — Staging with synthetic data.** Point resource to a separate synthetic bucket until live OAuth, discovery, list/read, missing-key, wrong-audience, expired/revoked tokens, strict replay, direct write denial, timeouts and rate-limit outcomes are verified. Include service-binding failure and realistic reconnect behavior. Preserve Verification 04 as the separate known-good test connection throughout.

**G4 — Narrow live read access, approval required.** Review the production R2 bucket's immutable identity and code-level R2 operations; deliberately rebind only the production **read-only resource** Worker. Validate expected unpublished submissions across known desks without modifying or publishing content; test that `newsroom_submit`, `newsroom_review` and publishing paths are unreachable. Take a non-secret deployment snapshot and confirm legacy agents/editors remain operational.

**G5 — Release decision.** President explicitly approves any merge into `main`, Worker deployment, production R2 attachment, permission change, or revocation. Prefer controlled serial PR integration so the original release `dist/worker.js` cannot be selected accidentally; don't assume green CI implies operational acceptance. Keep production-candidate rollout separate from website publishing/canon changes.

## Rollback and recovery

- **Before live R2 attachment:** close **all ingress to the new production OAuth resource**: inventory its Workers.dev URL, custom domains/routes, version/preview URLs and service-binding callers. Turning off Workers.dev alone is insufficient when another path remains. Verify each inventoried path denies access; do not restore ingress until the incident gate is cleared. Leave legacy production Worker, legacy bearer secrets and R2 untouched. Preserve non-secret logs. Test credentials and grants may remain until their documented expiry or be revoked by approved incident action.
- **After live R2 attachment:** disable the **new production resource** ingress and roll back its last known-good *code* version or detach R2; do not roll back/overwrite the legacy Worker. Be aware that reverting Worker code **does not revert Durable Object SQLite grant state** or R2 data. For suspected credential compromise, independently revoke the affected production OAuth grants and rotate matching issuer/resource/client credentials in a controlled sequence (reconnect expected).
- A lost successful refresh-token response is **not** automatically recoverable with a consumed token; require a fresh ChatGPT authorization. Old grants may remain valid until revoked/expired; the new issuer does not automatically revoke every previous grant on reconnect. Choose explicit incident and supersession policies before production.
- The security-review branch retains hash-only spent-refresh and redeemed-code proof. A proven refresh replay or correctly bound code replay revokes the successor family; even the successful response from a duplicate race then yields unusable tokens. A spent refresh can also revoke its family after a concurrent rotation. Accept the resulting reconnect requirement before rollout. Records created/rotated before this mitigation lack earlier proof; use new production namespaces, not a retrofit claim about the existing reference environment.
- A code rollback leaves connected storage state in place. Never restore a pre-revocation SQLite/PITR checkpoint as an authentication rollback: it can resurrect credentials. The new hash-only proof uses additive keys and the existing `revoked` flag; earlier code ignores those proof keys and loses replay detection for active grants. Keep ingress closed during a downgrade and use a reviewed forward fix or fresh isolated namespaces/credentials. Namespace replacement or client-secret rotation alone is not evidence that every old access token was durably revoked. An inventory/supersession or equivalent approved global invalidation mechanism is still a release blocker.
- No production data migration is proposed. Rollback does not roll back unpublished status changes in R2—hence this release must never gain write capabilities.
- Do **not** turn off `Torenthia OAuth Verification 04` or delete the isolated reference Workers/DO/R2 in ordinary production rollback. They are a separate diagnostic environment.

## Release disposition

**Prepared:** separated candidate implementations, real ChatGPT read proof, source/CI tests, prior draft history, this architectural decision and machine-readable non-deployable contract.

**Not established / release blockers:** independent audit, production R2 least-privilege assessment, hosted regional replay and rate-limit validation, account-wide grant supersession decision, production monitoring/secret-rotation policy, selected fresh deployment names/credentials, rollback rehearsal and Presidential release approval.

**No change to `main`, public website, published canon, or production Worker is authorized by this plan.**

## Draft ingress-boundary addendum (PR after #310, not deployed)

The candidate issuer and resource now expect distinct Cloudflare Rate Limiting bindings `ISSUER_INGRESS_LIMIT` and `RESOURCE_INGRESS_LIMIT`. After an authorization request passes input validation, or after MCP bearer syntax passes but **before** the resource's service-bound introspection, the Worker charges an approximate per-location, per-source limiter. A missing or failing binding returns HTTP 503 (fail closed); a rejected budget returns 429. Test-only harness binds simulated limiters. No existing live test/production Worker has been modified.

**This does not clear F5.** Cloudflare's Rate Limiting binding is approximate and independent per location; an attacker distributed across regions or many network sources may still spend the issuer's authoritative shared quota. `CF-Connecting-IP` is used only as an edge-originated source hint; same-zone Worker subrequests can influence it. A shared mobile/proxy IP can cause collateral denials for legitimate ChatGPT calls. Missing IPs share one conservative bucket. No rate-limit binding, WAF rule, route configuration, custom domain or Cloudflare zone was provisioned. Separate approved edge/WAF protections, source-spoofing controls, realistic ChatGPT burst thresholds and multi-region abuse tests remain mandatory before production. See [Cloudflare rate-limiting semantics](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) and [CF-Connecting-IP behavior](https://developers.cloudflare.com/fundamentals/reference/http-headers/).

Do not blindly attach low development/test thresholds to a production hostname. Review traffic baseline first and select separate namespace IDs per binding, a 10- or 60-second configured period and suitable sustained limits. Reserve independent authenticated revocation capacity. Explicit rollout approval remains unchanged.
