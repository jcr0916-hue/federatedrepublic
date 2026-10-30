# Historical branch handoff — PR #243

**Original branch:** `content/torenthia-y14m01-speakers-20261026`  
**PR:** [Torenthia Y14 M1: The Votes Behind the Speakers + three NRS records](https://github.com/jcr0916-hue/federatedrepublic/pull/243)  
**Frozen original tip:** `8e142bd218dd08977197d56445509ad1fdbef050`  
**Status:** shipped; original history preserved for recovery.

## Purpose and shipped result

Torenthia Y14 M1: The Votes Behind the Speakers + three NRS records. The PR merged on 2026-10-26T13:20:06Z as `9331821b12f9d39593c771204b64dbc5fb21db87`. This retrospective note records verified repository evidence.

## Significant files

- `docs/WORLD-STORY-STATUS.md`
- `torenthia-news-126.html`
- `torenthia-nrs-122.html`
- `torenthia-nrs-123.html`
- `torenthia-nrs-124.html`

## Tests, decisions, and lessons

Historical individual test outcomes and rejected experiments are **not established by this handoff**; consult the linked PR and preserved commits. Current publishing and cleanup validation is recorded in the [October 30 cleanup review](../BRANCH-CLEANUP-REVIEW-20261030.md). Reuse the shipped implementation on `main`; old intermediate source is retained for historical investigation, not adopted as current content.

## Preservation and disposition

The history-only commit `0bb710a2966b119c42552fd7b7061063a9ebf33d` preserves original commit objects and file trees, including intermediate experiments, without replacing the current source tree. It must reach `main` through a merge commit before deletion. The branch has no open PR at the audit checkpoint; workflow and hosting dependency checks are in the cleanup review. It enters the three-newest-completed rotation and may be SHA-leased away only after fresh gates pass. Unresolved work outside the merged PR is **not established**.
