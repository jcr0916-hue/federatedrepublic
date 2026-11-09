# Torenthia newsroom operations launch — permanent branch handoff

**Branch:** `feature/torenthia-newsroom-operations-launch-20261109`  
**Origin:** verified `main` commit `98430167c1c5130b41d329d0b99887c29f35ea4f` (November 9, 2026).  
**Purpose:** editorial agent onboarding, staffing, workflow, cadence, candidate assignments and Nov 11–17 supervised launch plan, without touching active newsroom security/infrastructure work or publishing any World content.

## Files and scope

- `docs/torenthia/NEWSROOM-OPERATIONS-LAUNCH-20261111.md`: full proposed editorial operations plan.
- This archival handoff: required by `AGENTS.md`. No existing editorial status, agent initialization, canon, chronology, Worker code or deployment configuration edited.

## Source verification and significant decisions

Reviewed `AGENTS.md`, `docs/torenthia/EDITORIAL-CURRENT-STATUS.md`, `docs/torenthia/EDITORIAL-HANDOFF-20261103.md`, `docs/torenthia/STORY-STATUS.md`, and **the feature-branch** `workers/newsroom/INFRASTRUCTURE-COMPLETION.md` and PR #314 handoff. Source status is dated; preparation snapshot is Y14 M2, worldSeq 183 and nrsSeq 135, subject to live front-matter recheck. Current main SHA was independently verified by GitHub compare with PR #314 feature head; PR #314 is a draft based on #313 and its entire retained dependency chain. Do not merge or disturb these active branches.

**Proposed, not shipped:** A low-volume, no-quota cadence; explicit Editor disposition workflow and GitHub publication gate; individualized TypingMind checklist; priority on revising already-accepted unpublished material; first-week plan; activated/missing-server/needs-qualification matrix. Four mapped legacy identities are Corindal, Korda, Varek and Federal. Neither the new OAuth lifecycle nor production activation has passed the remaining infrastructure gates. Documentation does not provision identities.

**Key resolutions:** Qualification and server-supported identity are distinct; additional qualified desks cannot be enabled with a secret alone. `ACCEPTED` is not canon; all original proposals remain noncanonical until Presidential merge of a reviewed World PR. Dated status inconsistencies (Caldenmere incomplete Test 03 despite broad count; incomplete paperwork for some established agents) must be reconciled from qualification records before activation. Historical test material must not be republished as a current event. No automatic daily quotas. No agent credentials in prompt files or repo.

**Rejected approaches:** Editing Worker code in this branch; copying or reusing fixed Editor OAuth grant for agents; connecting qualified desks that lack mapped server support; overlapping PR #314's OAuth/security/release tasks; deploying/merging; changing credentials, fictional time, canon or news sequences; committing private TypingMind system prompts; treating November 11 as a mandatory release date.

## Verification and limitations

GitHub file creation on this branch completed for the launch plan and this handoff. No app/runtime test applies to Markdown-only proposed guidance. Branch contents, PR checks and exact latest GitHub status should be independently re-read before any integration; no CI pass is asserted without a reported real run. This is **documentation review**, not live agent activation or verified end-to-end onboarding. No production systems modified.

Future work should reuse the operational plan, candidate correction list and matrix, **not repeat agent qualification tests already passed**. Before activating a desk, consult its exact qualification record, installed TypingMind config and approved server mapping. Reassess the security release gate against the latest #314 state; maintain separate infrastructure and editorial owners.

## Disposition

Unmerged unfinished feature branch; retain as an open development dependency and do not delete. At eventual approved merge, include this handoff in the same PR, review `AGENTS.md` branch preservation/dependency rules, and separately record subsequent branch retention/deletion through the rolling cleanup ledger. Main and all #314/#313 parent branches remain unchanged.
