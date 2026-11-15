# Branch handoff — Constitution 20 budget-claim contract

- **Original branch:** `feature/constitution20-budget-claims-20261115`.
- **Base/dependencies:** draft [#327](https://github.com/jcr0916-hue/federatedrepublic/pull/327) at `d49990b59ba23b46ab07647afc328d09f596180b`, stacked on #326 → #325 → #324 → #323.
- **Purpose:** supply a testable fail-closed budget-reservation policy for the offline Gateway adapter before any external model use.
- **Files:** `scripts/newsroom/budget-reservation.mjs`, `scripts/newsroom/budget-reservation.test.mjs`, and this handoff.
- **Proposed:** require a trusted verified job lookup and a **durable, serializable, atomic** per-UTC-day transaction backend. Claim exactly one `agentId/UTC-slot` and policy revision. Bound total daily cents, slot cents and jobs per slot. Reject exact replay, corrupt state, and invalid signed-job mapping. Never refund reserved worst-case spend based on an ambiguous provider failure.
- **Tests added:** six synthetic Node native tests covering replay, parallel duplicate claims, slot/day/agent ceilings, day separation, corrupt state and identity mismatch. **Execution not established in this handoff**; verify hosted check run before declaring results.
- **No production backing store:** injected transaction fixture is an in-memory simulation, intentionally unsuitable for running multiple workers. Real persistence, crash recovery, reservation reconciliation, expiry and policy auditing require a future approved implementation.
- **Decision:** do not weaken the previous adapter's single-attempt, no-automatic-retry design. No live Vercel calls, provider keys, roster changes, GitHub or R2 writes, scheduled tasks, canon or publication.
- **Unresolved:** deployable durable transaction backend, immutable model price attestation, cross-day job lifecycle, direct integration of the reservation interface, cancellation/telemetry, desk-generic writer and Ashbridge fixture.
- **Branch closure:** retain while draft PR and stacked bases are open. Following an authorized merge, verify tip/history and AGENTS.md rolling branch-cleanup gates.
