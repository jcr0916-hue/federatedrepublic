# Historical branch handoff — PR #245

**Original branch:** `chore/torenthia-storylines-relocation-20261026`  
**PR:** [Docs: relocate Year 14 Torenthia planning to its dedicated folder](https://github.com/jcr0916-hue/federatedrepublic/pull/245)  
**Frozen original tip:** `34c76ecb7dab4f7982f7b539d168d1981067de7f`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

Docs: relocate Year 14 Torenthia planning to its dedicated folder. The PR merged on 2026-10-26T13:49:35Z as `001c1379dd52e10e31085ccbf25c7129fb0c8d61`. This retrospective note records verified repository evidence.

## Significant files

- `docs/WORLD-STORY-STATUS.md`
- `docs/torenthia/README.md`
- `docs/torenthia/STORYLINES-Y14.md`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
