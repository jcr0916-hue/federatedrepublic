# Branch handoff — multimedia-index

- **Original branch:** `multimedia-index`
- **Purpose:** Consolidate eight dated multimedia audit snapshots in `docs/torenthia/`
  into one canonical image index, then close the long-standing "pixel verification
  unperformed" gap with measured data.
- **Significant changes:** Added `docs/torenthia/MULTIMEDIA-INDEX.md` and
  `docs/torenthia/MULTIMEDIA-VERIFICATION-20261127.md`. No images, pages, canon, or
  deployment changed.
- **Decisions:**
  - Index supersedes the older snapshots *as a lookup* but leaves them in place as dated
    reasoning.
  - `seal.png` upgraded from "not assessed" to **Known reference** with evidence
    (`index.html` hero + `og:image`, `_includes/nav.njk`, `sw.js`, NRS header).
  - Incorporated the 2026-11-24 `Terenne-*` rename (PR #398) that the 11-22 census predates.
  - Added the decision ledger and open-PR register (#363, #368, #369, #390, #398).
  - Verification measured real pixels rather than inferring from filenames.
- **Verified results (measured, not inferred):**
  - All 15 card derivatives measured at 100% coverage; all 18 SVGs parsed at 100%.
  - **Two `.png` files are actually JPEG data**: `Tobias-Vael.png`, `seal-watermark.png`.
  - 13 of 15 cards are 4:3; two are 16:9 (`world-map-card`, `verentum-four-founders-card`).
  - 5 SVGs have no intrinsic size (viewBox only). Flag proposals are only 150×96.
  - Zero corrupt/truncated files among the 23 measured.
- **Known limitations:** 57 large PNG masters remain dimension-unverified because the
  API read path caps at ~1 MiB. A clone or CI job with filesystem access is required to
  finish them. Rights/provenance verification remains **not established**.
- **Shipped:** documentation only. **Not shipped:** any asset or page change.
- **Rejected approaches:** upscaling the 150×96 flag proposals — rejected as blur-prone;
  redraw as vectors at 3:2 if reuse is wanted.
- **Future work:** re-cut the two outlier cards to one ratio, rename/re-encode the two
  mismatched files, add explicit `width`/`height` to the 5 viewBox-only SVGs, and finish
  the 57 unmeasured masters via CI.
