# Branch history — Torenthia relocation batch 8

**Original branch:** `chore/torenthia-record-relocation-batch8-20261027`
**PR:** not yet opened; use this branch's migration pull request
**Base:** `fc88f344a13b765acf0b95790081dde076812dfe` (PR #257 merged)
**Status:** shipped in PR #258; required checks and production verification passed

## Purpose and changes

Relocate 40 unchanged published sources: NRS 021–040 and news 089–108, into `torenthia/nrs/` and `torenthia/news/`. Preserve historical root public URLs, record identity, all metadata, and narrative chronology. Update the staged plan and the preceding branch's verified merge outcome. This batch changes no runtime logic.

## Results and verification

- `npm run world:publish-check`: passed, including the complete build, Constitution archival, discovery, ingestion/authoring, chronology, and constitutional reference checks.
- All 256 source records, 470 generated public files, and 336 protected Constitution/archive/State files match the pre-batch baseline byte-for-byte. All source blobs also match the pre-pilot PR #251 base `79c3429942cb69c3616efbd647da5e2906b30556`.
- Inventory after this batch: 218 categorized; 38 at root.
- This PR requires World publishing, Constitution archival, and Vercel success on its final head before merging, followed by production URL/content checks.

## Decisions and lessons

**Shipped when merged:** source-only relocation. Reuse the batch 4 path-aware audits and shared inventory; public basenames remain independent of categorized source paths. Verify entire rendered output, including archives and stream navigation, rather than changing links to source directories. **Experimental:** none. **Rejected:** source-byte/metadata edits, altered public URLs, skipped checks, and automatic branch deletion. **Unresolved:** subsequent batches and any independently authorized cold-storage review.

## Preservation and branch disposition

All records, canonical Constitution, constitutional archives, historical records and documentation remain preserved on `main`. Retain the branch; deployment/automation branch-name dependencies outside this PR are not established. **Deletion approval:** not granted; separate preservation review is required.

## Verified merge outcome (recorded by batch 9)

Shipped in [PR #258](https://github.com/jcr0916-hue/federatedrepublic/pull/258), merge `342ba20a76d9db29778185c932d42cf453dd542f`. World publishing, Constitution archival, and Vercel passed on head `1b0c584cf0fed49f9cc65c2f5a687edd83b66006`. Production deployment `dpl_14kQoMdrNuES8iCVtpA7XaxbBfyo` is READY for the merge, and all moved record URLs plus the homepage, World index/archive, and Constitution print page returned HTTP 200 with bytes matching the validated baseline. Branch retained; no deletion authorized.
