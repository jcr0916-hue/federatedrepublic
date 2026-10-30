# Historical branch handoff — PR #248

**Original branch:** `chore/torenthia-records-routing-foundation-20261026`  
**PR:** [Build: preserve Torenthia public URLs ahead of record-source relocation](https://github.com/jcr0916-hue/federatedrepublic/pull/248)  
**Frozen original tip:** `d5ee2d59f99fa2ba0da6b96c5cf36f5a49499f6b`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

Build: preserve Torenthia public URLs ahead of record-source relocation. The PR merged on 2026-10-26T18:34:42Z as `3f5b3ad71004e83330cf872755a43abffe0b211e`. This retrospective note records verified repository evidence.

## Significant files

- `docs/torenthia/REORGANIZATION-PLAN.md`
- `eleventy.config.mjs`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
