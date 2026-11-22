# Branch history — Torenthia agent workspaces

- **Original branch** `feature/torenthia-agent-workspaces-20261114`
- **Base** `98430167c1c5130b41d329d0b99887c29f35ea4f` on `main`
- **Status** Proposed Phase 1. Production rollout is outside this branch.

## Changes

- [Operating guide](../../../torenthia/NEWSROOM-OPERATIONS.md) documents the controls, rollout and processed-only retention proposal. A [single roster](../../../torenthia/agents/roster.json) gives Federal, Korda, Varek and Corindal separate disabled entries, weekly UTC slots, model references and proposed budgets. The global switch is off. Their workspaces use the existing agent directories.
- The [editorial ledger](../../../torenthia/editorial/inbox-ledger/README.md) uses one file per existing R2 receipt UUID. The CLI prepares GitHub changes for review and checks that receipt identity and earlier decisions survive edits. The read-only Actions workflow runs tests and gives a manual scheduling preview.
- GitHub reported the repository is public. Preserve raw R2 bodies in restricted storage during the trial. The ledger holds the receipt hash, shareable editorial decisions and references.

## Verified

- The existing Cloudflare connector listed the live `submissions/` prefix and read the known November 11 Federal test object directly. The object matched the expected desk, key and UUID and returned the original version 1 noncanonical record. Only read calls were used. The bucket lifecycle readback reported the default incomplete multipart abort rule.
- The checked-in roster dry run selected zero agents and reserved zero spend. Twelve local tests passed, including Git-backed validation of appended decisions, rejected rewrites and deleted entries. The local World publishing suite completed through build, discovery and release compatibility.
- Published sources at the base show Year 14 Month 2, World 185 through news 138 and NRS 137 through NRS-Y14-0049. [Open publication draft #320](https://github.com/jcr0916-hue/federatedrepublic/pull/320) stays independent.

## Dependencies and follow-up

- The four live TypingMind connections were verified in the earlier beta. Reuse their desk identifiers and existing R2 ingress. Draft [#316](https://github.com/jcr0916-hue/federatedrepublic/pull/316) and [#321](https://github.com/jcr0916-hue/federatedrepublic/pull/321) preserve earlier launch and planning work.
- [#322](https://github.com/jcr0916-hue/federatedrepublic/pull/322) is an isolated OAuth experiment stacked on [#319](https://github.com/jcr0916-hue/federatedrepublic/pull/319). Its latest hosted attempt returned `401 invalid_client`. Use the verified R2 connector path for editor reads. Preserve the experiment and dependency chain for their separate disposition.
- The first follow-up is approval to stage one known synthetic receipt and revision assignment as an editorial PR. The subsequent managed Federal pilot needs a trusted writer, a repository-scoped App, protected-branch checks, verified budget enforcement, and a way to enforce pauses across the legacy submission path. Reuse the existing Pro/Flash prototype for model execution and reviewed source packets. A GitHub-side pause has no authority over credentials still held by legacy clients.
- Keep this branch while the PR is open. Recheck dependencies and the final tip after any future approved merge before applying the reviewed branch rotation.
