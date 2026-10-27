# Branch history — Torenthia relocation batch 6

**Original branch:** `chore/torenthia-record-relocation-batch6-20261027`
**PR:** not yet opened; use this branch's migration pull request
**Base:** `6cecc2915905b9c82d300d73b7edfc97c14829fb` (PR #255 merged)
**Status:** shipped in PR #256; required checks and production verification passed

## Purpose and changes

Relocate 40 unchanged published sources: NRS 061–080 and news 049–068, into `torenthia/nrs/` and `torenthia/news/`. Preserve historical root public URLs, record identity, all metadata, and narrative chronology. Update the staged plan and the preceding branch's verified merge outcome. This batch changes no runtime logic.

## Results and verification

- `npm run world:publish-check`: passed, including the complete build, Constitution archival, discovery, ingestion/authoring, chronology, and constitutional reference checks.
- All 256 source records, 470 generated public files, and 336 protected Constitution/archive/State files match the pre-batch baseline byte-for-byte. All source blobs also match the pre-pilot PR #251 base `79c3429942cb69c3616efbd647da5e2906b30556`.
- Inventory after this batch: 138 categorized; 118 at root.
- This PR requires World publishing, Constitution archival, and Vercel success on its final head before merging, followed by production URL/content checks.

## Decisions and lessons

**Shipped when merged:** source-only relocation. Reuse the batch 4 path-aware audits and shared inventory; public basenames remain independent of categorized source paths. Verify entire rendered output, including archives and stream navigation, rather than changing links to source directories. **Experimental:** none. **Rejected:** source-byte/metadata edits, altered public URLs, skipped checks, and automatic branch deletion. **Unresolved:** subsequent batches and any independently authorized cold-storage review.

## Preservation and branch disposition

All records, canonical Constitution, constitutional archives, historical records and documentation remain preserved on `main`. Retain the branch; deployment/automation branch-name dependencies outside this PR are not established. **Deletion approval:** not granted; separate preservation review is required.

## Verified merge outcome (recorded by batch 7)

Shipped in [PR #256](https://github.com/jcr0916-hue/federatedrepublic/pull/256), merge `cda006583b7f606a40e3ed8f26ab91e463f72ba7`. World publishing, Constitution archival, and Vercel passed on head `4ec579f335e786bf28e0ecba60542683c2e67ea0`. Production deployment `dpl_AiV6qT9hDJ1svYnUZUUmrGxBJByb` is READY for the merge, and all moved record URLs plus the homepage, World index/archive, and Constitution print page returned HTTP 200 with bytes matching the validated baseline. Branch retained; no deletion authorized.
