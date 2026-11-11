# Branch handoff — ChatGPT Editor Gateway

- **Branch:** `feature/newsroom-chatgpt-editor-gateway-20261111`
- **Parent:** `feature/newsroom-current-acceptance-20261109` / draft PR #319; preserve full parent dependency chain #304–#319.
- **Purpose:** Address P0 ChatGPT Editor connection mismatch without modifying the live bearer-only newsroom or TypingMind credentials.
- **Changes:** Separate Editor-scope OAuth issuer, three-tool reviewed MCP proxy using private service binding, package/build scripts, fully synthetic authorization/forwarding tests, non-deploying security runbook.
- **Tests:** Verified implementation head `844e989a8a49ea1c0241e7d28506f0d68cc2d9d5` passed [Newsroom OAuth checks](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/43078823821): Node 24, **136/136 tests**, TypeScript and all pre-existing builds **plus both new Editor gateway/issuer bundles**, with readiness gate successful. [World publishing](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/43078823901) also passed. Final documentation-head CI needs re-read. Tests are fully synthetic for this gateway, not live auth proof. No live gateway connectivity, provision, deployment, or permission test claimed.
- **Security decisions:** Single allowlisted Editor OAuth identity; dedicated `newsroom:editor` scope, never reuse read-only scope; strict upstream URL; secret only in gateway; review write requires explicit confirmation in ChatGPT permissions, beyond request-string guard.
- **Rejected:** Reusing outdated test plugin identities, direct OAuth login to non-OAuth live Worker, passing Mac Keychain Editor key via ChatGPT chat, modifying existing desk secrets or old Workers.
- **Limitations:** Must review compile/runtime/test results, independent security check, synthetic hosted consent/write/readback; no production status. Test fixture stubs cannot prove upstream binding behavior or host confirmation.
- **Related:** Roadmap draft PR #321, editorial PR #316, isolated OAuth PR #319. No canon or production change.
- **Disposition:** Keep branch while PR open; no merge/deploy/self-publication or branch deletion authorized. Handoff must be updated with real tests/PR before merging.

## November 11 — approved isolated provisioning checkpoint

The President approved creation/configuration of two **isolated test** Cloudflare Workers and separate test credentials, specifically excluding any existing live Editor credential or production rollout.

**Created, verified by independent Cloudflare API readback:**

- `newsroom-editor-isolated-issuer-20261111`
- `newsroom-editor-isolated-gateway-20261111`

The initial deny-all placeholders have been **replaced** by the exact PR #322 CI-tested module bundles, SHA-256-verified during Cloudflare upload: gateway `459d954812f0d809ed6090cd5e3debac498667b2775e69743a4d4bdbf3cdbacd` (14,588 bytes), issuer `a2af5f69c93d36b7517ce01d7f78156884d4a4962f9fcf464e9dd737c7c9b0e4` (47,229 bytes). Both versions are **still fail-closed** because no runtime credentials or bindings have been installed. Source bundles were transferred from GitHub CI artifact `newsroom-editor-gateway-isolated-bundles` via a one-time nonsecret compressed CI log payload; the temporary log step was subsequently removed. Both were reverified **after upload** with `workers.dev.enabled=false`, `previews_enabled=false`, no schedules, **zero bindings**, and no service binding, R2, OAuth grant namespace, secret or live newsroom access. No test credential has yet been generated or installed. The two scripts use compatibility date `2026-10-01`. There is **no hosted OAuth/Editor test pass** to claim. New GitHub OAuth App, Turnstile widget, isolated DO namespaces, config and credential bindings are still outstanding. An attempted atomic Turnstile widget creation and private binding was blocked by the connected service; a read-only follow-up confirmed **no widget and no Turnstile secret binding** were created. Do not retry by bypassing the denial.

**Next:** stage the actual versioned build artifacts and independent synthetic credentials in those two isolated Workers while ingress remains closed; create new nonproduction grant/guard namespaces and a synthetic upstream test service (never the live newsroom Editor key). Audit effective bindings, perform controlled browser OAuth and review confirmation tests on synthetic records, then close ingress and verify grant cleanup. A final production/live-gateway approval is separately required.

**Do not confuse compiled-but-closed isolated Workers with a functioning ChatGPT connection.**
