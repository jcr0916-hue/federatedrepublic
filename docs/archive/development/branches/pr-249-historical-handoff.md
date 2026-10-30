# Historical branch handoff — PR #249

**Original branch:** `chore/torenthia-record-inventory-mixed-layout-20261026`  
**PR:** [World: support root and categorized Torenthia record inventories](https://github.com/jcr0916-hue/federatedrepublic/pull/249)  
**Frozen original tip:** `11f5a75555781b214010a2347c2934d65ecb0b28`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

World: support root and categorized Torenthia record inventories. The PR merged on 2026-10-26T20:43:53Z as `f37d3738a5d7adb5e83d1f878f7b4a5968d60134`. This retrospective note records verified repository evidence.

## Significant files

- `lib/world-authoring.mjs`
- `lib/world-publishing.mjs`
- `scripts/world-authoring.test.mjs`
- `scripts/world-publishing.test.mjs`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
