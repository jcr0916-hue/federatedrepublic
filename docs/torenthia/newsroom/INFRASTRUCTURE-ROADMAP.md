# Torenthia Newsroom — Infrastructure Roadmap and Dependency Register

**Status:** PROPOSED operational planning, not canon, not production authorization.  
**Planning date:** 2026-11-11. **Owner:** Central Editor / VP, under Presidential review.  
**Operating principle:** Supervised four-desk beta continues while improvements are staged and verified. No merge, deployment, canonical publication, credential change, or new service authorization is implied.

## Current verified baseline and known gap

- The President reports Work's Mac-local acceptance: Federal, Korda, Varek and Corindal individually authenticated and submitted/read private tests; Mac-local Editor listed/read four live receipts and persisted a HOLD note. This **reported acceptance** must be reconciled to its own private technical report; this file does not independently verify those Mac operations.
- Work's Mac-local Editor has access to the **live** inbox; the ChatGPT Central Editor currently sees only older test connector identities. Reading live Federal submissions through `Torenthia Newsroom Editor — Test` and `Torenthia OAuth Verification 04` returned `not found`, and their Federal lists were empty. Do **not** treat that as a failed agent submission or assume that simply changing a displayed plugin name fixes its server, audience, identity, or resource binding.
- Live Federal submission keys (non-secret identifiers only):
  - Proposal: `submissions/federal/2026-11-11/0adf4937-2af4-48b7-b19c-aa5682d9e5b4.json`
  - Follow-up proposed article: `submissions/federal/2026-11-11/64bf82b0-833c-44d5-b9e8-67ec0f35f8f9.json`
- A prior editorial decision, ACCEPT FOR DEVELOPMENT, was made in ChatGPT but **not persisted to live newsroom**. The article remains PROPOSED pending actual Editor read/review. Do not replay the decision or use an old test environment as the live ledger.
- Existing infrastructure engineering and tests are documented in draft PRs #304–#319 (especially #314, #318, #319); editorial operations in independent #316. Preserve dependency chain and handoffs; avoid repeating completed browser and isolated tests.

## November 11 diagnosis: OAuth gateway requirement

**Work's non-secret live-endpoint findings (reported):** `https://federated-republic-newsroom.jcr0916.workers.dev/mcp` uses Streamable HTTP with an Editor bearer key. Requests without that key receive HTTP 401 without `WWW-Authenticate`; OAuth discovery returns 404. Consequently ChatGPT's custom MCP OAuth flow cannot authenticate directly, and the custom connection form does not offer a direct pre-shared bearer-key field. This is a confirmed integration mismatch, **not** evidence of a faulty live newsroom or missing agent submission.

**Smallest safe new component:** a dedicated **Editor-only OAuth gateway** with separate live configuration that reuses the tested #319 issuer code, authorizes only the known Editor identity, and proxies only `newsroom_list`, `newsroom_read`, and `newsroom_review` to the existing live Worker. Protect the upstream bearer key in the gateway's secret store; never place it in ChatGPT text, a plugin manifest, a GitHub commit, logs or browser-visible requests. Require deliberate host/tool confirmation for every editorial review write and test authorization/denial using synthetic receipts before any live write.

This is **new code/deployment** with its own audit and release gate, not a trivial plugin URL change. Preserve the existing Worker, Editor Keychain item, and all four agent grants. Initially authorize implementation on an isolated branch and disposable environment only; Presidential approval is still required for any live deployment/credential provisioning. Reuse existing #319 tests and add gateway-specific denial/review tests; do not restart the full security program. The #319 read-only OAuth tests **do not** prove `newsroom_review` is safe.

**Gateway-specific acceptance:** independently connect from this ChatGPT conversation; list four desks, read the two known live Federal keys, demonstrate identity restriction and denial of unadvertised tools, then perform a user-confirmed review of an approved *synthetic* receipt and reread the persisted audit history. Live story decisions are made only after this succeeds.

## Priority policy

**P0 / Blocker:** prevents the intended routine editorial workflow or exposes a confirmed high-impact security defect.  
**P1 / Next:** completes two-way agent communications and prevents manual copy/paste.  
**P2 / Planned:** builds trustworthy low-volume autonomous operations after messaging works.  
**P3 / Maintenance:** context compaction, richer resilience and optional optimizations.

Order by real dependencies, not the chronological order of ideas. When the President introduces a new feature, place it in this register with prerequisites, acceptance criteria, owner and stage. Reprioritize existing tasks if the new idea changes the critical path. Do not allow a new idea to silently create a production release gate. Record updates and cross-link the relevant PR/handoff, rather than opening parallel contradictory roadmaps.

## Ranked dependency register

| ID | Priority | Task and outcome | Prerequisites | Minimum acceptance evidence | Status / owner |
|---|---|---|---|---|---|
| E-01 | **P0** | Connect **this ChatGPT Central Editor** to the existing live newsroom (correct resource, identity, scopes and service). **Confirmed:** the live Worker is bearer-key-only and cannot be connected to ChatGPT custom MCP OAuth directly. Implement a *separate, narrow OAuth-protected Editor MCP gateway* reusing vetted #319 issuer code, without changing the working live Worker or existing TypingMind credentials. | Work verified existing live MCP endpoint `https://federated-republic-newsroom.jcr0916.workers.dev/mcp` uses pre-shared bearer key (`Authorization`); unauthenticated `/mcp` returns 401 without OAuth challenge and discovery returns 404. Review #319 issuer code and exact gateway security boundary; keep Mac Keychain secret private. | From this ChatGPT conversation list all four desks and read both live Federal keys; prove non-Editor token cannot review. | **ROOT CAUSE CONFIRMED; implementation pending**; integration operator + Central Editor |
| E-02 | **P0** | Prove and expose editor decision persistence from ChatGPT itself. | E-01 and proper Editor review permission; no unsupported write tool claims. | Gateway must expose only `newsroom_list`, `newsroom_read`, `newsroom_review` (no publish/submit); confirmation required on review writes. Set test decision on an explicitly selected noncanonical receipt; reread audit history and verify agents' permitted visibility. Never modify a real story's status without editorial authorization. | **BLOCKED by E-01** |
| E-03 | **P0** | Keep supervised beta recoverable, bounded, and scoped. | Existing live service operational evidence; inspect current kill-switch, cost monitoring and token revocation procedures. | Verified rollback/shutdown owner, live key separation, desk isolation, no agent publication, usable cost monitoring against approved $5 pilot allowance (not assumed to be automatically enforced). | **Reported partial verification; needs release checklist** |
| C-01 | **P1** | Durable editorial **outbox/inbox** addressed separately to each Realm Agent, with instruction IDs, source references, assignment priority, response/revision links and editor authority. GitHub branch is a candidate, not a proven transport. | E-01/E-02 desirable for unified ledger; verify GitHub branch visibility/read capability for all TypingMind agents; choose single durable source of truth. | Editor writes one noncanonical instruction and agent reads/acknowledges it without President copy/paste; neither agent nor inbox can alter canon. | PLANNED |
| C-02 | **P1** | Closed-loop acknowledgments and replies; prevent duplicate assignments. | C-01 and existing desk-scoped submission ability; choose idempotency identifiers. | Delivered → acknowledged → submitted → editor disposition trace for each desk; no cross-desk private exposure. | PLANNED |
| A-01 | **P2** | Real-world editorial calendar and low-volume scheduled agent wake-ups; no mandatory filler. | C-01/C-02; scheduler actually able to invoke the established TypingMind agents; verified credentials and $5 beta spend controls. | Routine source/inbox scan with meaningful proposal or NO-UPDATE; no fictional time advancement; per-desk event log and usage record. | PLANNED |
| A-02 | **P2** | Triggered follow-ups on new published canon or significant editorial decision, with deduplication and escalation limits. | A-01 and authoritative GitHub published-frontier detector; C-02. | One new relevant change triggers only affected desks; repeated checks do not flood; Editor can pause/escalate. | PLANNED |
| M-01 | **P3** | Automatic compact agent handoffs on editorial milestones/context pressure. | Reliable durable storage and verified reread, ideally C-01/C-02 and A-01. | Restored agent distinguishes canon, proposals, pending reviews and personal context; **never clear context until checkpoint is verified retrievable**. | PLANNED |
| S-01 | **P3 / conditional** | Remaining hardened-release gates (rotation, monitoring/alert delivery, emergency regional rehearsals, independent review, production integration). Escalate any **demonstrated** isolation, credential, write-control or cost exploit immediately to P0. | Mature beta telemetry, #318/#319 evidence, approved separate change window. | Reviewable tests and rollback evidence for chosen deployment. | DEFERRED, not blanket beta blocker |

## Sequencing and stage gates

1. **Editor access first:** identify live resource and ChatGPT connector mismatch; correct safely; verify E-01.
2. **Editor action path:** verify authorized review writes and history (E-02), plus live kill switch/usage checks (E-03).
3. **Bidirectional delivery:** validate GitHub instruction visibility without making `main` an unreviewed editorial message channel; add C-01 then C-02.
4. **Agent autonomy:** a real scheduler invokes agents on low-frequency reviews; monitor spend; add relevant event-driven triggers only after delivery works.
5. **Continuity automation:** handoff compaction follows verified persistence; do not create a separate canon source.
6. **Release hardening:** improve by measured risk while operating under supervised restrictions.

## Non-negotiable boundaries

- Canon remains approved published World / NRS and Constitution; editorial inbox content is never canon.
- Realm Agents are independent creative stewards of jurisdictions, not subordinate federal reporters; no requalification of already approved agents.
- Agents may **propose** official actions and characters but never independently enact, publish, advance fictional time or assign publication IDs.
- GitHub `main` remains protected from ad hoc writes: development on separate branches; Presidential merge/publication approval required.
- Never disclose or copy Mac Keychain secrets, OAuth tokens, or private agent prompts into GitHub.
- Avoid new redundant Work/Codex tasks and duplicated testing. The current working service should remain operational during improvements.

## Roadmap change-log

- **2026-11-11, follow-up:** Work reported exact live MCP endpoint and bearer-only authentication; OAuth discovery unavailable. E-01 root cause confirmed and design narrowed to an Editor-only OAuth gateway; E-02 requires explicit write confirmation and synthetic-review proof. No gateway created or deployed.
- **2026-11-11, initial:** user directed fixing ChatGPT live Editor mismatch before mailbox automation; requested GitHub-backed agent communications, self-directed scheduled activity, self-handoff automation, and explicit dependency-aware reprioritization. Created this draft planning register; implementation/testing not implied.
