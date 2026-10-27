# Branch history — Torenthia election outlook

**Original branch:** `content/torenthia-election-outlook-20261027`  
**PR:** [#261](https://github.com/jcr0916-hue/federatedrepublic/pull/261)  
**Content commit at handoff:** `39fe58e486d1da3f6df98cfec2bf6f02181bb9dd`; the final documentation head is recorded on the PR  
**Status:** validated publication candidate; merge gated on the final PR checks

## Purpose

Publish three NRS records and two main pieces for the approaching spring election, including a conditional Assembly-composition analysis grounded in published canon and the current Constitution.

## Changes and artifacts

- `torenthia/nrs/torenthia-nrs-125.html` through `127.html`: quarterly Judicial Pool return, Hadrin counter reopening and equalization comparison direction.
- `torenthia/news/torenthia-news-127.html` and `128.html`: election reporting and conditional analysis; worldSeq 174–175, Y14 M2.
- `_data/worldClocks.json`, `_data/currentFiles.json` and `docs/torenthia/STORY-STATUS.md`: reviewed operational updates and core equalization discovery.
- [Editorial evidence and validation record](../../../torenthia/ELECTION-PUBLICATION-20261027.md).

## Results and verification

Preview-first helper allocation, all five individual draft checks, the full `npm run world:publish-check`, the archive check against the starting commit and `git diff --check` passed. Built discovery verified 392 pages and 261 record routes. All 256 existing World sources and 766 archive/reference files match the base bytes. Final remote World publishing, Constitution archival and deployment results are recorded in [PR #261 checks](https://github.com/jcr0916-hue/federatedrepublic/pull/261/checks); merge requires all three to pass on the final head.

## Decisions and lessons

- **Publication payload:** five finished records; NRS uses independent sequences and references, while news uses the narrative sequence. Public routes retain basenames.
- **Experimental:** no model-derived poll, probability or district forecast was attempted. The published analysis uses transparent hypothetical tenure-position counts.
- **Rejected:** inventing party totals, candidate loyalties, an election date, a successor, enacted equalization reform or a housing disposition. Planning documents cannot establish these facts.
- **Unresolved:** election scheduling, housing withdrawal/review outcome, equalization estimates and substantive reform, EM succession trigger and Korda ratification remain future editorial work.
- **Historically preserved:** all prior World records, canonical constitutional sources and historical archives are outside the intended edit set. Byte comparisons confirmed 256 historical World sources and 766 existing archive/reference files unchanged.

## Open follow-ups

Reuse the common-evidence direction for the next equalization beat. Track the quarterly Judicial Pool return now due Y14 M5. Resolve the housing file from its actual recorded procedural stage; do not infer elapsed business days or an outcome from month-only publication dates. The three forecast cases must never become a reported party ledger.

## Preservation and branch disposition

The handoff and editorial evidence stay in `main` with the publication on merge. Existing archives and `archive/legacy-project-material` are retained. No cleanup or cold-storage removal is part of this branch. Deployment/automation branch-name dependencies have not been assessed for deletion.

**Deletion approval:** not granted. Retain this branch pending a separate preservation review and guarded cleanup.
