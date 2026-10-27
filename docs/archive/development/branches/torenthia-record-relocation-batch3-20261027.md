# Torenthia source migration — batch 3

- **Branch:** `chore/torenthia-record-relocation-batch3-20261027`
- **Purpose:** Third controlled relocation of published Torenthia source HTML into categorized folders.
- **Changes:** Move unchanged `torenthia-nrs-117.html` through `torenthia-nrs-120.html` into `torenthia/nrs/` and `torenthia-news-005.html` through `torenthia-news-008.html` into `torenthia/news/`; update the reorganization plan. No narrative, metadata, Constitution, or public URL edits.
- **Reused:** Existing Eleventy root-level permalink mapping, categorized World inventory, discovery validation, and homepage-link consistency fix from PRs #248–#252.
- **Validation:** Initial run: Constitution archival and Vercel passed; World publishing failed in AI efficiency report because `lib/world-context-packet.mjs` attempted to read moved `torenthia-nrs-118.html` from the root. Fixed `recordExcerpt` to read the `sourcePath` already provided by `readWorldInventory`, with a legacy fallback. Re-run all required checks; do not merge on failure.
- **Unresolved:** Remaining records still at root; move in further validated batches.
- **History:** https://github.com/jcr0916-hue/federatedrepublic/pull/251 and https://github.com/jcr0916-hue/federatedrepublic/pull/252
