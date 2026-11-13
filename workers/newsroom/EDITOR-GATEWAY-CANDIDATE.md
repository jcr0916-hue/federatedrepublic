# ChatGPT Central Editor OAuth gateway — isolated engineering candidate

**Status: EXPERIMENTAL / ISOLATED WORKERS CLOSED / PRODUCTION RELEASE PENDING APPROVAL.** The [permanent handoff](../../docs/archive/development/branches/newsroom-chatgpt-editor-gateway-20261111.md) records the hosted and local checkpoints.

## Problem and smallest integration

The existing live MCP endpoint `https://federated-republic-newsroom.jcr0916.workers.dev/mcp` requires a static Editor bearer key and provides no OAuth discovery. The Mac-local Editor can use it, while ChatGPT custom MCP OAuth cannot. Work verified this on November 11. The separate ChatGPT Editor gateway supplies OAuth and forwards only the approved MCP subset to the **unchanged** live Worker.

## Source and permissions

- `src/issuer-editor-candidate.ts`: separate *Editor-only* issuer variant of the tested #319 source. Exact authenticated GitHub Editor identity, separate private client/validator/session/admission secrets and grant/guard namespaces. Scope is `newsroom:editor`, **not** `newsroom:read`; the read shorthand is deliberately not accepted. No agent desk grants are reused.
- `src/editor-gateway-candidate.ts`: checks bearer admission and authoritative issuer introspection on every call, with exact audience/client/issuer/scope/expiry checks. Advertises only `newsroom_list`, `newsroom_read`, `newsroom_review`. `newsroom_submit`, publish, delete, resources, prompts and all unknown tools are rejected.
- Private `NEWSROOM_UPSTREAM` **service binding** to the existing live Worker. `NEWSROOM_EDITOR_KEY` stays exclusively in the gateway's encrypted secret store; it is never sent to a browser/client, issuer or GitHub. `NEWSROOM_UPSTREAM_URL` is constrained to the exact existing live `/mcp` URL and is used solely as the internal Request URL. The gateway has no R2 or GitHub repository binding.
- `newsroom_review` uses a strict key/status/note schema and a `CONFIRM_EDITORIAL_WRITE` string guard. It is marked non-read-only, destructive and non-idempotent. **That guard alone does not prove human consent.** Configure the ChatGPT plugin to *ask before writes* and verify the host confirmation appears before every review write. Refuse live deployment if host confirmation cannot be enforced.
- No editor action publishes canon. Existing President-only GitHub merge and publication controls remain.

## Isolated storage and ChatGPT callback

The [isolated configuration](release/editor-isolated-configuration.json) records the settings to add to the two named Workers. The issuer owns separate SQLite-backed Durable Object classes `IssuerGrant` (`ISSUER_GRANTS`) and `IssuerGuard` (`ISSUER_GUARD`). During a separately authorized closed deployment, let Cloudflare create both namespaces on that issuer and verify that each class has a distinct namespace ID owned by it. The gateway's `ISSUER` service binding points to the isolated issuer. Check the proposed ingress limiter IDs against the account inventory before applying them. Reconcile the additions with the current settings and inherit each Worker's existing encrypted bindings. Keep public and preview ingress disabled during provisioning. [Cloudflare Durable Object deployment guidance](https://developers.cloudflare.com/cf/wrangler/reference/#convert-durable-object-migrations)

Use a dedicated private ChatGPT connection with the predefined `editor-chatgpt-isolated-20261111` client, `client_secret_basic` and `newsroom:editor`. The issuer accepts the exact `https://chatgpt.com/connector_platform_oauth_redirect` URI in authorization and code exchange. Discovery on both Workers identifies the same issuer, and redirects to ChatGPT include that exact `iss` value and the original state. Compare the URI shown in the new connection's management page before signing in. Verify that the dedicated GitHub OAuth App has the separate callback `https://newsroom-editor-isolated-issuer-20261111.jcr0916.workers.dev/oauth/callback`. [OpenAI callback requirements](https://developers.openai.com/plugins/build/auth#redirect-url)

For hosted acceptance, pair a fresh confidential client secret in the ChatGPT connection settings and store its SHA-256 digest as the issuer's encrypted `ISSUER_CLIENT_SECRET_SHA256` binding. Use a synthetic upstream service binding and synthetic bearer for the isolated gateway. Verify sign-in and the confirmation prompt for each review write during the authorized test window, then verify review readback and revocation before closing ingress.

## Stage 1 read-only retest

The November 12 investigation narrowed the first hosted failure to the issuer's confidential-client authentication. The private ChatGPT form uses the existing dedicated client ID and its matching secret from the **Torenthia Newsroom Editor Isolated OAuth** Keychain entry. The President enters the secret in the form's **OAuth Client Secret** field while both Workers are closed. Keep the exact callback already confirmed by discovery. If the same form retained an old value, replace it with the existing Keychain value before the next attempt. [Permanent handoff](../../docs/archive/development/branches/newsroom-chatgpt-editor-gateway-20261111.md#november-12--stage-1-failure-isolated-to-client-authentication) · [OpenAI OAuth configuration](https://developers.openai.com/plugins/build/auth)

1. Use the `newsroom-editor-stage-one-readonly-bundles` artifact from the verified draft PR head. Keep the three baseline deployments private during staging. On the isolated gateway, set the temporary version's `NEWSROOM_UPSTREAM_URL` to the exact synthetic Worker URL ending in `/mcp`, and verify that `NEWSROOM_UPSTREAM` still targets that private synthetic Worker. Inherit the existing encrypted bindings and use the same isolated grant/guard namespaces. The Stage 1 artifacts require a matching `EDITOR_STAGE_ONE_EXPIRES_AT` Unix timestamp in milliseconds on both Workers and return 404 outside a window of at most five minutes.
2. For the two isolated test Workers, save the original observability settings and use Workers Logs with custom logs enabled, invocation logs disabled, query strings redacted, and traces disabled for the authorized test. Check those settings before opening. The `newsroom.editor.stage-one.v1` events record the client authentication method and status, the token response status, and the outcomes of authenticated tool discovery and the two read calls. Query those events by exact Worker and time window. [Cloudflare Workers log settings](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/settings/methods/get/)
3. After the President authorizes a specific window and is at the prepared form, verify the two active Stage 1 version IDs and expiry, then open the issuer and gateway's `workers.dev` endpoints with previews disabled. The synthetic Worker stays private. The President selects **Create as a plugin** in the prepared form and completes **Approve read-only access**. Confirm a successful token response and only `newsroom_list` and `newsroom_read` in authenticated discovery. Use those tools to list one synthetic Federal submission and read the returned key.
4. Close both public endpoints on success, error or expiry. Verify all three Workers' public and preview flags and the absence of routes, custom domains and Previews. Probe the public URLs and the sampled Version URLs for 404. Restore the closed baseline versions and observability settings, then independently repeat the checks. Compare the original bindings and read the paginated grant/guard inventory, including `hasStoredData`. Record the actual hosted outcomes in the branch handoff.

## Verification / unfinished release gates

Real GitHub Actions at implementation head `844e989a8a49ea1c0241e7d28506f0d68cc2d9d5` passed [OAuth CI 43078823821](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/43078823821): **136/136 tests**, typecheck, existing builds and new issuer/gateway bundle builds, readiness gate; [World publishing CI 43078823901](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/43078823901) passed. These are not hosted acceptance or deployment approval.

The new synthetic tests (`test/editor-gateway-candidate.test.ts`) verify metadata/scope, no unauthenticated access, only three tools, exact proxy arguments, rejection of forbidden tools/arguments and missing confirmation, wrong OAuth scope, no secret leak, and failure containment. They mock issuer and live Worker, so **they are not live acceptance**. Build separately using `npm run build:editor-gateway`. Reuse #319 verified issuer lifecycle; its read-only resource acceptance **does not** establish Editor review safety.

Run `node --test --import tsx test/editor-isolated-oauth.test.ts` from `workers/newsroom` to exercise both Workers with local SQLite grant/guard storage and simulated Turnstile, GitHub, and newsroom services. The test checks the exact redirect, issuer identification on success and cancellation, code exchange, synthetic review/readback and revoked access. ChatGPT's hosted confirmation prompt requires its own test.

Before any live beta gateway deployment:

1. Independently review code and tests and obtain passing CI on exact PR SHA, including `typecheck`, `test`, both new bundles and the World publishing check.
2. Test isolated issuer/GitHub consent with new separate client and audience; use no existing tokens, desk identities or Worker secrets.
3. Verify gateway service-binding-only egress and live upstream authentication with a **synthetic noncanonical** receipt and controlled access; explicitly deny all other MCP actions and unauthenticated review.
4. Configure ChatGPT ask-before-writes and verify user confirmation per `newsroom_review`; prove a persisted synthetic review with readback and no duplicate action.
5. Keep the existing newsroom and TypingMind connections unchanged; provision new issuer/gateway behind initially closed ingress and distinct grant/guard data, with straightforward shutoff and spending observability.
6. Obtain explicit Presidential authorization for live gateway provisioning/deployment/credential binding. **No authority is granted by this document.**
7. After deployment, connect **this ChatGPT conversation**; list four desks and read the two known live Federal keys. Only then record editorial dispositions using confirmed write permissions.

**Known risk:** The legacy live Worker uses a write-capable bucket internally; the gateway must never expose submit/publish or non-Editor operations. The Editor key authorizes review writes, so the private service-binding and credential isolation are release-critical. Copying the issuer source requires tracking upstream fixes; do not merge stale security code after #319 advances.

## Roadmap

This implements a **candidate** for P0 E-01 and E-02 from [infrastructure roadmap](../../../../docs/torenthia/newsroom/INFRASTRUCTURE-ROADMAP.md) in independent draft PR #321. P1 GitHub mailboxes, P2 scheduled Realm Agent operations and P3 compaction remain separate; don't bundle them into this gateway PR.
