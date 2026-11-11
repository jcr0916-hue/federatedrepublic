# ChatGPT Central Editor OAuth gateway — isolated engineering candidate

**Status: EXPERIMENTAL / NOT DEPLOYED / NO LIVE CREDENTIALS INSTALLED / NO PRODUCTION APPROVAL.**

## Problem and smallest integration

The existing live MCP endpoint `https://federated-republic-newsroom.jcr0916.workers.dev/mcp` requires a static Editor bearer key and provides no OAuth discovery. The Mac-local Editor can use it, while ChatGPT custom MCP OAuth cannot. Work verified this on November 11. The separate ChatGPT Editor gateway supplies OAuth and forwards only the approved MCP subset to the **unchanged** live Worker.

## Source and permissions

- `src/issuer-editor-candidate.ts`: separate *Editor-only* issuer variant of the tested #319 source. Exact authenticated GitHub Editor identity, separate private client/validator/session/admission secrets and grant/guard namespaces. Scope is `newsroom:editor`, **not** `newsroom:read`; the read shorthand is deliberately not accepted. No agent desk grants are reused.
- `src/editor-gateway-candidate.ts`: checks bearer admission and authoritative issuer introspection on every call, with exact audience/client/issuer/scope/expiry checks. Advertises only `newsroom_list`, `newsroom_read`, `newsroom_review`. `newsroom_submit`, publish, delete, resources, prompts and all unknown tools are rejected.
- Private `NEWSROOM_UPSTREAM` **service binding** to the existing live Worker. `NEWSROOM_EDITOR_KEY` stays exclusively in the gateway's encrypted secret store; it is never sent to a browser/client, issuer or GitHub. `NEWSROOM_UPSTREAM_URL` is constrained to the exact existing live `/mcp` URL and is used solely as the internal Request URL. The gateway has no R2 or GitHub repository binding.
- `newsroom_review` uses a strict key/status/note schema and a `CONFIRM_EDITORIAL_WRITE` string guard. It is marked non-read-only, destructive and non-idempotent. **That guard alone does not prove human consent.** Configure the ChatGPT plugin to *ask before writes* and verify the host confirmation appears before every review write. Refuse live deployment if host confirmation cannot be enforced.
- No editor action publishes canon. Existing President-only GitHub merge and publication controls remain.

## Verification / unfinished release gates

Real GitHub Actions at implementation head `844e989a8a49ea1c0241e7d28506f0d68cc2d9d5` passed [OAuth CI 43078823821](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/43078823821): **136/136 tests**, typecheck, existing builds and new issuer/gateway bundle builds, readiness gate; [World publishing CI 43078823901](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/43078823901) passed. These are not hosted acceptance or deployment approval.

The new synthetic tests (`test/editor-gateway-candidate.test.ts`) verify metadata/scope, no unauthenticated access, only three tools, exact proxy arguments, rejection of forbidden tools/arguments and missing confirmation, wrong OAuth scope, no secret leak, and failure containment. They mock issuer and live Worker, so **they are not live acceptance**. Build separately using `npm run build:editor-gateway`. Reuse #319 verified issuer lifecycle; its read-only resource acceptance **does not** establish Editor review safety.

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
