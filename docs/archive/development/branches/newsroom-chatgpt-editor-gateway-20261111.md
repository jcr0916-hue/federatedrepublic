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
