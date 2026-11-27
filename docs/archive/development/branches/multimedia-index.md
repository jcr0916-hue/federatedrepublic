# Branch handoff — multimedia-index

- **Original branch:** `multimedia-index`
- **Purpose:** Consolidate eight dated multimedia audit snapshots in `docs/torenthia/`
  into one canonical image index.
- **Significant changes:** Added `docs/torenthia/MULTIMEDIA-INDEX.md` only. No images,
  pages, canon, or deployment changed.
- **Decisions:**
  - Index supersedes the older snapshots *as a lookup* but leaves them in place as dated
    reasoning.
  - `seal.png` upgraded from "not assessed" to **Known reference** with evidence
    (`index.html` hero + `og:image`, `_includes/nav.njk`, `sw.js`, NRS header).
  - Incorporated the 2026-11-24 `Terenne-*` rename (PR #398) that the 11-22 census predates.
  - Added the decision ledger and open-PR register (#363, #368, #369, #390, #398).
- **Known limitations:** Reference status remains evidence-graded, not proven; pixel,
  dimension, and rights verification is unperformed (not established). File sizes are Git
  blob bytes.
- **Shipped:** documentation only. **Not shipped:** any asset or page change.
- **Rejected approaches:** none — no alternative index format was produced.
- **Future work:** keep the index updated as PRs #368/#369/#390 resolve; a separate general
  constitutional-site media review remains explicitly deferred.
