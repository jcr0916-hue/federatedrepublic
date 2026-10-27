# Branch history — Torenthia relocation completion

**Original branch:** `chore/torenthia-relocation-completion-20261027`
**PR:** not yet opened; use this branch's completion-documentation pull request
**Base:** `dc60c74d9e8d0dfae3746c998a3196bb0eaa50ba` (PR #259 merged)
**Status:** documentation prepared after successful record migration and production audit

## Purpose and changes

Record the completed 256-record migration and its evidence. Mark Stage 3 complete in `docs/torenthia/REORGANIZATION-PLAN.md`; add the completion report and batch/check/production evidence to the preservation manifest. Close the final batch's handoff, and record recovered successful check outcomes for PRs #251 and #252. No runtime logic, record source, metadata, chronology, canonical Constitution or historical archive changes.

## Results and verification

All record PRs #251–#259 have successful World publishing, Constitution archival and Vercel checks at their final heads. The full local publishing gate passed on the final record tree. All 256 record sources, 470 generated public files, and 336 protected files are byte-identical to their preserved baselines. After final record merge, all 256 historical record URLs plus four key pages returned HTTP 200 and matching bytes on production; Vercel is READY for that exact merge. Authoring discovery returns the correct next filenames and independent sequence.

This branch passed manifest validation for all 256 identities/destinations/Git blobs/SHA-256 hashes and all nine record-PR totals, `npm run build`, byte comparison for all 470 outputs and 336 protected files, and `git diff --cached --check`. Require the same three remote checks on the final documentation head before merge. Detailed original #251/#252 experiments beyond recovered final outcomes are not established.

## Decisions, lessons, and follow-ups

**Shipped when merged:** completion documentation and preservation evidence. **Experimental:** none. **Rejected:** normalizing historical filenames, changing record bytes/URLs, weakening audits, deleting branches, or treating old audit notes as current canon. Reuse actual inventory paths and negative tests in categorized folders. **Unresolved:** independently scoped Stage 4 provenance review; no record migrations remain.

## Preservation and branch disposition

Retain this branch and all source-migration branches. `main` and `archive/legacy-project-material` remain permanent. Deployment/automation branch-name dependencies outside this task are not established. **Deletion approval:** not granted; requires separate preservation review. All evidence remains on `main` after merging.
