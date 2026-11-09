# Newsroom infrastructure: current completion record

This record supersedes stale status summaries in the historical PR #304–#313 chain. All changes here are experimental branch work. Production release, main merge, production permission changes and revocation of connected grants remain unapproved.

## Current verified baseline — November 8, 2026

GitHub PR #312 head `ff84cbfd8799b7f2d72136fc74c1b72762a776b9` and PR #313 head `dc55fa55aa43cc60451ddabdb5d1f516c970ce28` both have successful real `local-oauth` and `World publishing check` checks. The new branch starts exactly at #313's head. The unmodified suite also passed 104/104 locally; the local Node is 24.15.0, below the package's declared supported range, so supported-Node GitHub CI remains authoritative.

Cloudflare reports these deployed versions:

- Legacy production: `federated-republic-newsroom`, version `08a99769-3618-488e-adbd-30a8be38a788`, deployment `7a53aadb-d87e-46e5-b7b8-831970590373`; native production bucket plus the original five bearer secret names.
- S3 acceptance issuer: `7ce5d472-f58e-40cf-aa55-7577ea81f0f9`, deployment `e23f3cdb-fe07-4c94-9f38-17906be96739`; separate grant/guard namespaces and secret bindings.
- S3 acceptance resource: `3476508c-76fb-4883-9618-2a07c1154cb3`, deployment `d78fcd13-edd0-4666-82f6-7b8c2fc0e518`; acceptance-bucket S3 credentials, service-bound issuer, local ingress limiter, **no native R2 binding**.
- Verification 04 issuer/resource remain versions `32779f6e-2f2f-4e34-8859-88ffe2e139ff` / `2d6a2b80-ae5b-4a8e-abed-7404a63736d8`.

Both connected OAuth readers were exercised read-only in this task. S3 acceptance returned a synthetic Korda row with a real continuation token; Verification 04 returned its separate synthetic Korda row after the connector requested routine authentication. No token, grant, callback or secret was changed by this task.

GitHub main was `98430167c1c5130b41d329d0b99887c29f35ea4f`. The branch API reports `protected:false`, and the repository ruleset API returns an empty list. **No server-enforced main protection is established.** Vercel's committed configuration disables branch deployment and enables main deployment. Newsroom CI only tests/builds and the Cloudflare config has no deployment target. Do not merge or push main: it is a deployment boundary.

## Changes prepared on this branch

- Inactive bearer guesses no longer spend the authenticated editor's 1,200/minute shared introspection quota. Tokens are still inspected authoritatively on every operation; no cached allow is introduced. A regression sends 1,201 forged calls, then confirms a valid call and emergency revocation still work.
- `IssuerGuard.currentEpoch()` and compare-and-swap `invalidateAll(expectedEpoch)` provide an internal, persistent account-wide invalidation fence. The epoch is included in pending, code and active grant bindings. Every relevant issuer operation reads the current epoch. Quota cleanup preserves it. No public operator or minting route is introduced. Old records with no epoch fail closed; **do not deploy this over the preserved acceptance namespaces**.
- The S3 adapter cancels oversized chunked object/list streams while reading, instead of buffering the entire response before checking its size. Missing/invalid pagination flags fail closed.
- The repeatable HTTP acceptance runner exercises four real legacy desk identities, forged role/desk inputs, cross-desk MCP and REST reads, agent review denial, editor review and publication denial. It refuses production and existing acceptance URLs. It is a client-side runner, never a Worker entrypoint.
- The review-only release contract now selects the S3 entrypoint and excludes native `NEWSROOM`. It remains unapproved and non-deployable.

## Incident control procedure

Use an explicitly approved internal operator binding to the **intended issuer's** `ISSUER_GUARD` namespace. Obtain the guard by `idFromName(registeredClientId)`, read `currentEpoch()`, then call `invalidateAll(observedEpoch)`. Record only the epoch/result, namespace ownership, timestamp and deployment IDs. A retry with the old epoch cannot invalidate newly authorized grants. Verify old access, refresh, pending authorization and issued code all fail; then authorize a fresh grant. Individual disconnect remains `/revoke` with the grant's refresh token.

This intentionally avoids a grant-token inventory: the epoch is an equivalent global containment control. It does not enumerate past authorizations or clean their records immediately; expiry alarms perform cleanup. It is not a public administration API. Operator binding provisioning, ownership and hosted rehearsal still require review. Requests already in flight can complete; the next request must consult the current epoch. Never restore a pre-invalidation guard/grant snapshot, reset the epoch or downgrade to code that ignores it. Keep all ingress closed during recovery.

## Remaining gates and essential operator actions

1. **Disposable real OAuth lifecycle:** a distinct GitHub OAuth App and a harness-controlled HTTPS callback are still required. Do not reuse either working app/ChatGPT registration or revoke its grant. The dedicated issuer needs fresh client/validator credentials and fresh DO namespaces. Its GitHub callback must be its own origin plus `/oauth/callback`. Existing deterministic tests cover exact access/refresh expiry, code/refresh replay, lost responses, restart/crash recovery, individual revocation and cross-grant isolation. Those are not a hosted GitHub/ChatGPT lifecycle result. Configure the separate app through the operator's account, then perform browser consent; no secret belongs in chat or GitHub.
2. **Independent review and hosted operations:** freeze source and bundle hashes; review the account-wide control, source identity/spoofing, distributed authorization/cost abuse, legitimate burst thresholds, redacted monitoring, coordinated secret rotation, all ingress paths and regional replay/rollback. F5's forged-quota path is mitigated, but public `/authorize` quota exhaustion and distributed backend cost remain unresolved. F7's missing global invalidation primitive is mitigated locally; hosted containment/rotation/monitoring remains unresolved. F8 is excluded with the KV/provider release path. None of these results is independent security sign-off.
3. **Main protection and release:** an administrator should configure a main ruleset requiring PR review and the actual publishing/OAuth checks, reject force-push/deletion, and explicitly reconcile the existing constitution-archive automation that currently pushes main. This task does not silently alter that automation or claim that a Markdown policy is server protection. After all gates, the President separately approves the concrete merge and production deployment. No automatic production R2 attachment or website publishing is permitted.

## Agent onboarding using the existing isolated design

The implemented legacy identities are Corindal, Korda, Varek and Federal; Editor has cross-desk review. Orath and the other state desks are **not provisioned by the supplied code**. A new secret alone cannot add a desk: its server-side principal mapping, tests and reviewed rollout are needed. Current OAuth is exclusively Central Editor read access; do not label it agent OAuth.

For an approved first pilot, configure one TypingMind agent with the existing production `/mcp` endpoint and only its already-issued bearer credential, stored in that client's private authentication setting. Do not paste credentials in prompts or documents. Allow `newsroom_submit`, `newsroom_list`, `newsroom_read`; never give the agent Editor credentials or review/publish tools. Retain the external client's confirmation setting for submission. Run the synthetic isolated acceptance first; a production pilot submission is a separate, deliberately unpublished editorial action.

The server determines the desk and assigns `PROPOSED` plus `nonCanonical:true`. Agents cannot read other desks or editorial status/history keys. The legacy agent view retains the original proposal status even after editorial review; only Editor sees the current status overlay and private note. `ACCEPTED` is an editorial decision, never publication. Approved content goes through a GitHub feature branch, canon checks, draft PR and Presidential merge approval. No fictional time advancement or automated reporting schedule is configured by this infrastructure work.
