# Branch history — Torenthia relocation batch 9

**Original branch:** `chore/torenthia-record-relocation-batch9-20261027`
**PR:** not yet opened; use this branch's migration pull request
**Base:** `342ba20a76d9db29778185c932d42cf453dd542f` (PR #258 merged)
**Status:** proposed; local validation passed; remote checks required before merge

## Purpose and changes

Relocate 38 unchanged published sources: NRS 001–020 and news 109–126, into `torenthia/nrs/` and `torenthia/news/`. Preserve historical root public URLs, record identity, all metadata, and narrative chronology. Update the staged plan and the preceding branch's verified merge outcome. This batch changes no runtime logic.

## Results and verification

- `npm run world:publish-check`: passed, including the complete build, Constitution archival, discovery, ingestion/authoring, chronology, and constitutional reference checks.
- All 256 source records, 470 generated public files, and 336 protected Constitution/archive/State files match the pre-batch baseline byte-for-byte. All source blobs also match the pre-pilot PR #251 base `79c3429942cb69c3616efbd647da5e2906b30556`.
- Inventory after this batch: 256 categorized; 0 at root.
- This PR requires World publishing, Constitution archival, and Vercel success on its final head before merging, followed by production URL/content checks.

## Decisions and lessons

**Shipped when merged:** source-only relocation. Reuse the batch 4 path-aware audits and shared inventory; public basenames remain independent of categorized source paths. Verify entire rendered output, including archives and stream navigation, rather than changing links to source directories. **Experimental:** none. **Rejected:** source-byte/metadata edits, altered public URLs, skipped checks, and automatic branch deletion. **Unresolved:** subsequent batches and any independently authorized cold-storage review.

## Preservation and branch disposition

All records, canonical Constitution, constitutional archives, historical records and documentation remain preserved on `main`. Retain the branch; deployment/automation branch-name dependencies outside this PR are not established. **Deletion approval:** not granted; separate preservation review is required.

## Manifest

Includes `docs/torenthia/RECORD-RELOCATION-MANIFEST-20261027.json`: all original filenames, destinations, blob IDs, and SHA-256 hashes. Verified all 256 destinations against original source bytes. Retain this as migration evidence; do not treat historical filenames as renumbering targets.
