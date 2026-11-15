# Branch handoff — Constitution 20 offline Gateway pilot adapter

- **Branch:** `feature/constitution20-gateway-offline-adapter-20261115`
- **Base:** Constitution 20 specification draft [#326](https://github.com/jcr0916-hue/federatedrepublic/pull/326), itself stacked on #325 → #324 → #323.
- **Purpose:** implement a deliberately disconnected, single-attempt Gateway transport contract that can be tested without a live provider.
- **Files:** `scripts/newsroom/gateway-pilot.mjs`, `scripts/newsroom/gateway-pilot.test.mjs` and this handoff.
- **Proposed:** trusted injected transport; immutable policy revision; explicit model ID and prices; pre-call upper-bound byte/token estimate, worst-case cost reservation; required live authorization before and after reservation; stable job claim; one attempt only; no automatic fallback/retry; bounded usage and opaque errors.
- **Safety:** not imported by existing runner, workflow, scheduler, or site API. No roster edit, enabled switch, Gateway secret, R2/GitHub write, paid call, canon update or deployment.
- **Verification:** five Node native test cases added for reserved call/duplicate, denied or paused job, 402/429/transport failure, missing or excessive usage, cost refusal. **Execution not established** because no runnable Node 24 checkout was available through the current connector. These are proposed tests, not claimed passing results. CI checks must be reviewed before further progress.
- **Limits:** `reserve` and `authorize` are injected trusted interfaces, not production implementations. Durable store, rate/pricing attestation, cancellation, and exact telemetry reconciliation remain necessary. No multi-desk runner yet. Input bytes plus framing is a conservative *local reservation estimate*, not independently verified provider tokenization. No live provider compatibility or price verification performed.
- **Rejected:** autonomous activation, hidden retry/fallback, model credentials in prompts, promoting placeholder aliases, generalizing Federal writer without its existing regression tests.
- **Disposition:** retain while this draft and the dependent chain remain open. After authorized merge, follow AGENTS.md preservation and rolling cleanup gates; no automatic deletion during review.
