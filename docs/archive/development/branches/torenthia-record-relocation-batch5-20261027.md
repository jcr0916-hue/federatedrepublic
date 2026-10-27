# Branch history — Torenthia relocation batch 5

**Original branch:** `chore/torenthia-record-relocation-batch5-20261027`
**PR:** not yet opened; use this branch's migration pull request
**Base:** `083a0c02eedd0a0e2ad7ae8c87db4bd774772a33` (PR #254 merged)
**Status:** proposed; local validation passed; remote checks required before merge

## Purpose and changes

Relocate 40 unchanged published sources: NRS 081–100 and news 029–048, into `torenthia/nrs/` and `torenthia/news/`. Preserve historical root public URLs, record identity, all metadata, and narrative chronology. Update the staged plan and the preceding branch's verified merge outcome. This batch changes no runtime logic.

## Results and verification

- `npm run world:publish-check`: passed, including the complete build, Constitution archival, discovery, ingestion/authoring, chronology, and constitutional reference checks.
- All 256 source records, 470 generated public files, and 336 protected Constitution/archive/State files match the pre-batch baseline byte-for-byte. All source blobs also match the pre-pilot PR #251 base `79c3429942cb69c3616efbd647da5e2906b30556`.
- Inventory after this batch: 98 categorized; 158 at root.
- This PR requires World publishing, Constitution archival, and Vercel success on its final head before merging, followed by production URL/content checks.

## Decisions and lessons

**Shipped when merged:** source-only relocation. Reuse the batch 4 path-aware audits and shared inventory; public basenames remain independent of categorized source paths. Verify entire rendered output, including archives and stream navigation, rather than changing links to source directories. **Experimental:** none. **Rejected:** source-byte/metadata edits, altered public URLs, skipped checks, and automatic branch deletion. **Unresolved:** subsequent batches and any independently authorized cold-storage review.

## Preservation and branch disposition

All records, canonical Constitution, constitutional archives, historical records and documentation remain preserved on `main`. Retain the branch; deployment/automation branch-name dependencies outside this PR are not established. **Deletion approval:** not granted; separate preservation review is required.

### Filename preservation lesson

NRS 96–99 are historically named `torenthia-nrs-96.html` through `torenthia-nrs-99.html`, without zero padding. Select actual inventory filenames when batching; retain their exact names and URLs. A preliminary local preparation stopped on the absent padded spelling before publishing any branch changes, then resumed with the real filenames and reran the full gate. Do not normalize these names.
