# Historical branch handoff — PR #242

**Original branch:** `holdout-remove-monitor-role-261024`  
**PR:** [The Holdout: remove invented Monitor certification role](https://github.com/jcr0916-hue/federatedrepublic/pull/242)  
**Frozen original tip:** `42dacfc553e5a3e0b08e4ed0c509eeffdb0258ae`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

The Holdout: remove invented Monitor certification role. The PR merged on 2026-10-25T00:22:15Z as `905789d6e9b85668c987843e254b14719c08d695`. This retrospective note records verified repository evidence.

## Significant files

- `scenario-the-holdout.html`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
