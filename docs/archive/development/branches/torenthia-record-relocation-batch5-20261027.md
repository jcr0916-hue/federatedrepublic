# Branch history — Torenthia relocation batch 5

**Original branch:** `chore/torenthia-record-relocation-batch5-20261027`
**PR:** not yet opened; use this branch's migration pull request
**Base:** `083a0c02eedd0a0e2ad7ae8c87db4bd774772a33` (PR #254 merged)
**Status:** shipped in PR #255; required checks and production verification passed

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

## Verified merge outcome (recorded by batch 6)

Shipped in [PR #255](https://github.com/jcr0916-hue/federatedrepublic/pull/255), merge `6cecc2915905b9c82d300d73b7edfc97c14829fb`. World publishing, Constitution archival, and Vercel passed on head `eb07e0e54f6a79a2bab7a05f56e6455cf25f1cc1`. Production deployment `dpl_BZWwRHRK3wN22nyf5nwXeyo9YA7f` is READY for the merge, and all moved record URLs plus the homepage, World index/archive, and Constitution print page returned HTTP 200 with bytes matching the validated baseline. Branch retained; no deletion authorized.
