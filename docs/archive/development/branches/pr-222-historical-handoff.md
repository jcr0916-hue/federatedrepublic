# Historical branch handoff — PR #222

**Original branch:** `world/corindal-audit-history-y14m1`  
**PR:** [Establish Corindal audit history and Provisional State chronology](https://github.com/jcr0916-hue/federatedrepublic/pull/222)  
**Frozen original tip:** `eda86357a249053437724a6514d8940cfce342a5`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

Establish Corindal audit history and Provisional State chronology. The PR merged on 2026-10-19T18:49:09Z as `1b60ac1fa752f0c0741c1bd3a6b9d620e7647b16`. This retrospective note records verified repository evidence.

## Significant files

- `docs/WORLD-STORY-BIBLE.md`
- `torenthia-state-corindal.html`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
