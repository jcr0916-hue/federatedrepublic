# Torenthia media placement audit — inspected source references

**Date:** 2026-11-21 · **Scope:** Where known media is referenced and whether those placements serve readers. **Status:** PARTIAL placement audit; **not** a full binary asset inventory or screenshot-based quality review. Companion: [multimedia inventory](MULTIMEDIA-INVENTORY-20261120.md) and [reuse audit](MULTIMEDIA-ASSET-REUSE-AUDIT-20261120.md). No production changes proposed here.

## The decision rule

The Constitution is the project and Torenthia helps demonstrate it. Torenthia may use its own mix of realism, illustration, maps, graphic design and diagrams. **Do not require stylistic uniformity**; accept a visual if it adds useful place, institutional identity, evidence, or interpretation beyond its surrounding text. The right outcome for some records is **no picture**.

## Confirmed placements

The following are **source-proven placements**, not claims that every image has loaded in the current user's browser. Paths are public URL references unless noted.

| Ref / asset | Where in current source | Purpose served | Assessment | Next decision |
| --- | --- | --- | --- | --- |
| `region-map-tier2-temporary.webp` via `_data/geography.js` | Torenthia main context map; State-profile SVG regional crops; Republic-at-a-Glance map | Orient readers to jurisdictions and borders | **RETAIN / REVIEW MASTER** — critical functional map; source says *temporary* | Inspect whether the temporary base is intentional, exact geographic quality and label layering; do not replace without cartographic validation |
| `verentum-four-founders-card.webp` (source checked at root, not `images/`) | `torenthia.html` visual tour, Verentum | Capital/civic geography | **REUSE / VERIFY VISUAL** | Check root-level asset placement and existing render before a new cityscape |
| `rhondel-cityscape.png` (`images/` source exists) | `torenthia.html` visual tour, Rhondel | Lake city identity | **REUSE / VERIFY VISUAL** | Keep unless quality/crop is poor |
| `lake-varda-crossing.png` (`images/` source exists) | `torenthia.html` visual tour, Lake Varda | Geography of lake crossings | **REUSE / VERIFY VISUAL** | Better reuse in Lake Varda dossier or a related rail than another invented crossing visual |
| `varek-mountain-landscape.png` (`images/` source exists) | `torenthia.html` visual tour, Varek | Regional landscape identity | **REUSE / VERIFY VISUAL** | Don't commission generic Varek landscape unless this fails |
| `ostara-card.webp` (binary file at `images/` path) | `torenthia.html` visual tour, Solara/Ostara | Territory place identity | **REUSE / VERIFY VISUAL** | Could also provide context in Solara profile |
| `Elin-Thoss-Press-Conference-card.webp` (binary file at `images/` path) | `torenthia.html` visual tour, Civic Consul | Connect officeholder to institutional record | **REUSE / VERIFY VISUAL** | Keep representation tied to the published role |
| `logos/the-torenthian-logo.svg` | `torenthia-record.html` source gallery | Identify national newspaper | **RETAIN**, check deployed SVG | Logo helps distinguish source without article photo |
| `logos/rnn-logo.svg` | Record source gallery | Identify broadcaster | **RETAIN**, check deployed SVG | Same |
| `logos/nrs-logo.svg` | Record source gallery | Identify formal records | **RETAIN**, check deployed SVG | Use in institutional context, not as substitute for illustrated news |
| `logos/the-dorven-ledger-logo.svg` | Record source gallery | Identify local newspaper | **RETAIN**, check deployed SVG | Same |
| `logos/the-korda-press-logo.svg` (SVG exists) | Record source gallery | Identify territorial press | **RETAIN** | Reuse branding consistently if article design warrants |
| `logos/tnb-logo.svg` | Record source gallery | Identify broadcaster/regional press | **RETAIN**, check deployed SVG | Same |
| `corindal-flag.svg`, `caldenmere-flag.png`, `varek-flag.png`, `kelvant-flag.png`, `orath-flag.svg`, `arvane-flag.svg` | Front matter in respective State pages → `_includes/state-profile.njk` | State recognition, not decoration | **RETAIN** | Flags appear from template even if page itself has no literal `<img>` |
| SVG state map crops via `geography.baseImage` | `_includes/state-profile.njk` and `dossier-korda.html` | Geographic context | **RETAIN** | Check legibility on mobile; avoid a new map for each page |
| `verentum-card.webp` | `torenthia/news/torenthia-news-071.html`: metadata **plus actual inline figure and caption** | Shows capital and South Loop setting | **GOOD EXAMPLE TO CHECK VISUALLY** | Existing precedent for a relevant article illustration |
| `world-map-card.webp?v=2614f3c8408e` | `torenthia/news/torenthia-news-067.html`: `worldImage` metadata | Map contextualizes a diplomatic/federal story | **REFERENCED / VERIFY** | Card/metadata use may not imply an image appears in article body |
| `seal.png` (and protected seal assets) | `index.html`, `scripts/protected-assets.json` | Constitution/site identity, not Torenthia story decoration | **OUTSIDE TOR-ONLY CHANGES** | Maintain separation of general site and world audit |

## Important findings about actual usage

1. The **Torenthia visual tour is already purposeful**: city, lake, landscape, territory, and government. Do not replace it merely to change styles.
2. The **Record's press logos** identify the outlets; this is a useful distinction between newspapers, broadcasting and government records.
3. **State pages have both flags and regional maps via layout**. Earlier body-source scans alone could incorrectly label these pages “image-free.” They aren't, at the template level.
4. The **article image precedent exists**: news 071 includes an actual figure, caption, and `worldImage`. In contrast, news 067 has `worldImage` *metadata only*. **Metadata presence is not proof of an inline picture**.
5. `_includes/record-card.njk` has **no image rendering at all**. It cannot display `worldImage` thumbnails in ordinary archive cards as written. This is a purposeful **presentation opportunity only if a featured-card placement needs it**; do not turn hundreds of record cards into thumbnail grids by default.
6. `_includes/related-rail.njk` displays images but uses empty alt text and a hidden linked media element even though the calling data supplies `imageAlt`. Review whether this is genuinely decorative per item; the linked heading already communicates destination. Avoid changing accessibility semantics mechanically.
7. `_data/geography.js` currently resolves the map to `region-map-tier2-temporary.webp`. This demands a **map source/quality check**, not an automatic migration to older map imagery.
8. Source HTML and metadata for news 136–143 and NRS 152–159 have no article-level images. That *does not* mean each needs one. For NRS 152, 156, 158 and 159, plain official-document layout is appropriate; a timetable/hours graphic would be useful only if it conveys accurate details or provides a navigational benefit.

## Additions called for — after reusing what exists

| Priority | Surface | Add only if... | Proposed form | Why |
| --- | --- | --- | --- | --- |
| 1 | `torenthia.html` current-feature headline | An approved story has a useful photo/illustration and the first card benefits from it | **Optional** featured thumbnail/figure, no change to general archive-card default | Makes a leading story recognizable without flooding the site with imagery |
| 1 | `torenthia/news/torenthia-news-143.html` | No already-suitable Calden harbor/workfront asset is available | Contemporary realistic **editorial depiction** with caption acknowledging it is illustrative | Helps readers picture where the Assembly candidate works; avoid oil-painted reportage style unless deliberately desired |
| 1 | `torenthia/news/torenthia-news-141.html` | Readers otherwise struggle to distinguish §12.2 and §12.6 | Clean, **accessible constitutional process diagram** with the unresolved premise clearly labeled | Explains jurisdiction/process, not just repeats prose |
| 2 | `dossier-lake-varda.html` | Current dossier lacks adequate geographic context in rendered design | Reuse `lake-varda-crossing.png` or map locator | Explains what/where, no unnecessary new image |
| 2 | `territory-solara.html` | The territory profile currently lacks meaningful place context | Reuse existing `ostara-card.webp` | Builds geographical recognition |
| 2 | `territory-morantine.html` / news 142 | Existing geographic map lacks an obvious Tessom/Kessel locator | Accurate, labeled locator based on established geography | Helps place a specific culvert story; no invented flood or completed fix |
| 3 | Routine NRS / records index | Clear service times or jurisdiction charts require visual parsing | Small HTML table/timetable, not photorealistic imagery | Makes factual reading easier; otherwise **NOT NEEDED** |

## Checkpoints before any media production

- Enumerate **all** root-level images, `images/` and `logos/` masters and record file sizes, dimensions, duplication candidates and rights. **Not completed:** GitHub's connected read action rejects directory paths, and direct repo/network tree enumeration was unavailable; this audit deliberately does not invent a total.
- Visually inspect current rendered pages and actual image binaries at desktop and mobile widths, including cropped flags and the map base. **Not completed:** source inspection only. Do not assert “image looks good” without this.
- Prefer a reuse trial before generating an illustration. Confirm image provenance and alternate text/caption.
- For new placements, use a separate development branch and draft PR, keep canon and schedules untouched, and run `npm run build`, `npm run check:assets` and `npm run world:publish-check` before any merge. The master/library retention and public reference graph are defined in `docs/ASSET-DEPLOYMENT.md`.

**Current verdict:** existing maps, flags, identity images and publication logos are appropriate by role; the largest source-backed gaps are selective story illustration and explanatory/geographic reuse, **not** an across-the-board shortage of pictures.
