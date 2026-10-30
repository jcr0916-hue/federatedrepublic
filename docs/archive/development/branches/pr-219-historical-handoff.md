# Historical branch handoff — PR #219

**Original branch:** `change/remove-mandatory-devolution-provisional-20261019`  
**PR:** [Separate State remediation from voluntary devolution](https://github.com/jcr0916-hue/federatedrepublic/pull/219)  
**Frozen original tip:** `7cd289977a03fd4aa6b9b8e6209fc4db0d084ec2`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

Separate State remediation from voluntary devolution. The PR merged on 2026-10-19T18:27:55Z as `e309c3bb667f153d71dd4c184fc73652f1d08f33`. This retrospective note records verified repository evidence.

## Significant files

- `constitution_data.json`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
