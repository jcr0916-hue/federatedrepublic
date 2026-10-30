# Historical branch handoff — PR #246

**Original branch:** `chore/torenthia-publishing-guide-relocation-20261026`  
**PR:** [Docs: move Torenthia publishing guide into dedicated folder](https://github.com/jcr0916-hue/federatedrepublic/pull/246)  
**Frozen original tip:** `c8a23af192563274334d3f476f85ccdf26af4b06`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

Docs: move Torenthia publishing guide into dedicated folder. The PR merged on 2026-10-26T13:53:34Z as `ef12c6d33a22c7bfab8dad89c08ec585749985c4`. This retrospective note records verified repository evidence.

## Significant files

- `PROJECT-SOURCES.md`
- `docs/README.md`
- `docs/torenthia/PUBLISHING.md`
- `docs/torenthia/README.md`
- `eleventy.config.mjs`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
