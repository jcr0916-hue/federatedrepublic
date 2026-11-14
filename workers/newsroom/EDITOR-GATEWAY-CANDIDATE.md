# ChatGPT Central Editor OAuth gateway — isolated engineering candidate

**Status: EXPERIMENTAL / ISOLATED WORKERS CLOSED / PRODUCTION RELEASE PENDING APPROVAL.** The [permanent handoff](../../docs/archive/development/branches/newsroom-chatgpt-editor-gateway-20261111.md) records the hosted and local checkpoints.

## Problem and smallest integration

The existing live MCP endpoint `https://federated-republic-newsroom.jcr0916.workers.dev/mcp` requires a static Editor bearer key and provides no OAuth discovery. The Mac-local Editor can use it, while ChatGPT custom MCP OAuth cannot. Work verified this on November 11. The separate ChatGPT Editor gateway supplies OAuth and forwards only the approved MCP subset to the **unchanged** live Worker.

## Source and permissions

- `src/issuer-editor-candidate.ts`: separate *Editor-only* issuer variant of the tested #319 source. Exact authenticated GitHub Editor identity, separate private client/validator/session/admission secrets and grant/guard namespaces. Scope is `newsroom:editor`, **not** `newsroom:read`; the read shorthand is deliberately not accepted. No agent desk grants are reused.
- `src/editor-gateway-candidate.ts`: checks bearer admission and authoritative issuer introspection on every call, with exact audience/client/issuer/scope/expiry checks. Advertises only `newsroom_list`, `newsroom_read`, `newsroom_review`. `newsroom_submit`, publish, delete, resources, prompts and all unknown tools are rejected.
- The isolated gateway forwards through the private `NEWSROOM_UPSTREAM` service binding to the synthetic Worker. `NEWSROOM_EDITOR_KEY` authenticates that internal request. The Stage 1 build pins `NEWSROOM_UPSTREAM_URL` to the synthetic Worker's `/mcp` URL. The gateway has no R2 or GitHub repository binding.
- `newsroom_review` uses a strict key/status/note schema and a `CONFIRM_EDITORIAL_WRITE` string guard. It is marked non-read-only, destructive and non-idempotent. **That guard alone does not prove human consent.** Configure the ChatGPT plugin to *ask before writes* and verify the host confirmation appears before every review write. Refuse live deployment if host confirmation cannot be enforced.
- No editor action publishes canon. Existing President-only GitHub merge and publication controls remain.

## Isolated storage and ChatGPT callback

The [isolated configuration](release/editor-isolated-configuration.json) records the settings to add to the two named Workers. The issuer owns separate SQLite-backed Durable Object classes `IssuerGrant` (`ISSUER_GRANTS`) and `IssuerGuard` (`ISSUER_GUARD`). During a separately authorized closed deployment, let Cloudflare create both namespaces on that issuer and verify that each class has a distinct namespace ID owned by it. The gateway's `ISSUER` service binding points to the isolated issuer. Check the proposed ingress limiter IDs against the account inventory before applying them. Reconcile the additions with the current settings and inherit each Worker's existing encrypted bindings. Keep public and preview ingress disabled during provisioning. [Cloudflare Durable Object deployment guidance](https://developers.cloudflare.com/cf/wrangler/reference/#convert-durable-object-migrations)

Use the predefined `editor-chatgpt-isolated-20261111` client, `client_secret_post` and `newsroom:editor` in the private Stage 1 form. The issuer accepts the exact `https://chatgpt.com/connector_platform_oauth_redirect` URI in authorization and code exchange. Discovery on both Workers identifies the same issuer, and redirects to ChatGPT include that exact `iss` value and the original state. Compare the URI shown in the connection form before signing in. The dedicated GitHub OAuth App uses its own callback, `https://newsroom-editor-isolated-issuer-20261111.jcr0916.workers.dev/oauth/callback`. [OpenAI callback requirements](https://developers.openai.com/plugins/build/auth#redirect-url)

The isolated client was paired during provisioning. Use the named login Keychain item in the [credential register](../../docs/archive/development/branches/newsroom-chatgpt-editor-gateway-20261111.md#november-14--credential-register-and-stage-1-decision). The gateway uses the private synthetic upstream and its fixture bearer. Stage 1 exercises sign-in and read-only access. Review confirmation, write readback and revocation belong to a separate acceptance stage.

## Stage 1 read-only retest

The November 13 POST retest reached token client authentication and returned HTTP 401. The original provisioning match and Cloudflare version history support using the existing **Torenthia Newsroom Editor Isolated OAuth** credential. The November 13 logs omit the specific rejection reason. Use the build that emits fixed reason codes for a single authorized Stage 1 run. [Credential register and decision](../../docs/archive/development/branches/newsroom-chatgpt-editor-gateway-20261111.md#november-14--credential-register-and-stage-1-decision)

1. Use the `newsroom-editor-stage-one-readonly-bundles` artifact from the verified draft PR head. Keep the three baseline deployments private during staging. On the isolated gateway, set the temporary version's `NEWSROOM_UPSTREAM_URL` to the exact synthetic Worker URL ending in `/mcp`, and verify that `NEWSROOM_UPSTREAM` still targets that private synthetic Worker. Inherit the current encrypted bindings, including the rotated Turnstile binding on the parked issuer, and use the same isolated grant/guard namespaces. The parked versions are expired. Stage 1 requires the same fresh `EDITOR_STAGE_ONE_EXPIRES_AT` Unix timestamp in milliseconds on both Workers and returns 404 outside a window of at most five minutes.
2. With all three isolated Workers closed, save the issuer and gateway's original observability settings. Use [the logging preflight](#stage-1-logging-preflight) to apply and independently verify the diagnostic settings. Query `newsroom.editor.stage-one.v1` events by exact Worker, version and time window. The `token_client_auth` event reports only the authentication method, status and fixed reason. The separate `token` status shows whether the exchange succeeded after authentication. The gateway reports the outcomes of tool discovery and the two read calls.
3. After the President authorizes a window of at most five minutes and is at the private form, activate only the two diagnostic versions while closed. Independently verify both versions at 100%, the same hard cutoff, and the logging settings. Enable the issuer and gateway's `workers.dev` endpoints with previews disabled and the synthetic Worker private. Confirm both discovery documents return 200 and the anonymous gateway `/mcp` returns 401. If the issuer gets the previously observed Cloudflare 1042 despite its enabled flag, reapply that flag once within the same cutoff or close the window. After the form's final discovery refresh, confirm the exact callback `https://chatgpt.com/connector_platform_oauth_redirect`, the full client ID `editor-chatgpt-isolated-20261111`, and `client_secret_post`. Discovery can reset the fields. The President copies the password from the named login Keychain item directly into **OAuth Client Secret**, selects **Create as a plugin**, and completes **Approve read-only access**. Require `token_client_auth` with `method=post`, `reason=accepted` and HTTP 200, then token HTTP 200. Require authenticated discovery of exactly `newsroom_list` and `newsroom_read`, a list of one synthetic Federal submission, and a read using its returned key.
4. Close both public endpoints on success, error or expiry. Verify all three Workers' public and preview flags and the absence of routes, custom domains and Previews. Probe the public URLs and the sampled Version URLs for 404. Restore the closed baseline versions and observability settings, then independently repeat the checks. Compare the original bindings and read the paginated grant/guard inventory, including `hasStoredData`. Record the actual hosted outcomes in the branch handoff.

### Token client authentication diagnostics

For POST, `missing_client_id` and `missing_secret` include empty fields. `client_id_mismatch` means the exact registered ID comparison failed. `invalid_secret_format` means the decoded value violates the existing printable ASCII and length requirements. `secret_mismatch` means the registered ID and secret format passed, but verification failed. A request with neither credential is `missing_credentials`. Duplicate parameters and mixed authentication methods are rejected with HTTP 400. Basic and unsupported headers have fixed failure labels as well.

The public OAuth response remains generic. Query only the fixed events during an authorized window. Keep credentials, digests, headers, URLs, request bodies, codes, and PKCE values out of diagnostic output. Close on the first failed exchange. Missing fields, ID mismatch and invalid format direct follow-up to the ChatGPT form or its saved request fields. `secret_mismatch` establishes a mismatch between the submitted value and the configured verifier. Determine which side differs before requesting a re-pair. If authentication is accepted and the token step fails, use the token status to investigate the next stage. Record the result before considering any further hosted work.

### Stage 1 logging preflight

Use [`acceptance/editor-stage-one-logging.ts`](acceptance/editor-stage-one-logging.ts) with the authenticated Cloudflare management client. To load it in the Cloudflare execution tool, bundle it from `workers/newsroom` with the installed dependencies and paste the resulting JavaScript into the tool's async function.

```sh
./node_modules/.bin/esbuild acceptance/editor-stage-one-logging.ts \
  --bundle --format=iife --global-name=stageOneLogging
```

Await `stageOneLogging.verifyStageOneLogging(options => cloudflare.request(options), accountId, role, "apply")` for each of `"issuer"` and `"gateway"`. It checks closed ingress, sends the settings update and requires a separate Cloudflare GET to confirm effective observability and continued closure. Custom logs and query-string redaction must be enabled, and invocation logs and traces must be disabled. Both responses must explicitly match the required settings, including sampling and persistence. An omitted `logs.destinations` or `traces.destinations` has the same meaning as `[]`. Explicit nulls, nonempty destinations and missing required values stop preflight. [Cloudflare Worker update](https://developers.cloudflare.com/api/resources/workers/subresources/beta/subresources/workers/methods/update/) · [Cloudflare Worker readback](https://developers.cloudflare.com/api/resources/workers/subresources/beta/subresources/workers/methods/get/)

After privately activating the Stage 1 builds, call the same function in `"verify"` mode to read both Workers again before opening. Keep ingress closed if any check fails. Restore the saved settings on both Workers on failure and at the end of the test, and use `assertObservabilitySettings` against an independent GET to confirm restoration.

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
