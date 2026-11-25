# Torenthia multimedia inventory — portraits, places, and institutional assets

**Audit:** 2026-11-21 · **Status:** source-evidence inventory, no asset/UI changes · **Supersedes no canon.**
**Companions:** [main inventory](MULTIMEDIA-INVENTORY-20261120.md), [placement audit](MULTIMEDIA-PLACEMENT-AUDIT-20261121.md), [asset application review](MULTIMEDIA-ASSET-APPLICATION-REVIEW-20261121.md).

## Purpose and standard

The **Constitution is the project**; fictional Torenthia demonstrates consequences and institutions. The purpose of this inventory is to identify **what we have, where it is used, whether placement is meaningful, and what is missing**. Torenthia's imagery can have different artistic styles from the rest of the site and from one editorial genre to another. Do not add pictures merely because an article has none.

Entries below are verified against current `main` source documents. **Filename references and present HTML figures are verified; pixel-level visual quality and full library enumeration are not.** GitHub's file reader cannot return a complete binary image directory or its visual pixels here; don't claim images look good or bad without seeing them.

## 1. Established character portraits: use rather than regenerate

| Asset | Confirmed published placement examples | Current function | Assessment / recommendation |
| --- | --- | --- | --- |
| `Tobias-Vael.png` | `torenthia/news/torenthia-news-001.html`, `-011.html`, `-010.html`, `-012.html`, `-023.html`, `-030.html`: source search finds the same portrait figure in these stories | Identifies a recurring political figure | **RETAIN** as a stable recognizable portrait; avoid manufacturing a new likeness for each report. Review whether a single profile/gallery is useful later, not a new photo on every mention |
| `Seren-Mak.png` | News `-005.html`, `-015.html`, `-019.html` | Stable recurring-person identity | **RETAIN**; existing editorial article portrait already serves its purpose |
| `Ines-Carrow.png` | News `-002.html`, `-006.html`, `-028.html` | Identifies foreign-affairs figure | **RETAIN**; news 028 confirms an inline figure/caption, with `worldImage: "Ines-Carrow-card.webp"` for metadata |
| `Elin-Thoss.png` | News `-027.html`, `-029.html`, `-033.html`, `-035.html`, `-036.html` | Political career/character continuity | **RETAIN**. Some old captions say *Assembly, Selvane 3rd*: these are historical-era stories, so do **not** blindly update past captions to her later Civic Consul office |
| `Elin-Thoss-Press-Conference.png` | News `-041.html`, with full article figure and caption | Event-specific portrait rather than a generic headshot | **GOOD PLACEMENT**: depicts an event recorded in the story; `worldImage: "Elin-Thoss-Press-Conference-card.webp"` is also present |
| `Elin-Thoss-Press-Conference-card.webp` | `torenthia.html` Faces & Places tour; news 041 `worldImage` | Officeholder identity / card-size derivative | **REUSE** where Elin Thoss is the subject, not as generic government decoration |
| `Elin-Thoss-card.webp` | Metadata on news `-027.html`, `-035.html`, `-042.html`, `-068.html` and other historical pieces | Metadata/card variant of same established figure | **RETAIN**; verify which templates actually render metadata before treating it as visible illustration |
| `Ines-Carrow-card.webp` | News `-002.html`, `-006.html`, `-028.html` `worldImage` | Alternate card metadata | **RETAIN** if image metadata is consumed by a current surface |
| `world-map-card.webp?v=2614f3c8408e` | Metadata on many different news stories, including `-047.html` (*Thirty Minutes With the Civic Consul*) | Broad geographical fallback | **REASSESS**. Repeating a generic map as article-specific metadata may be redundant or misleading, but `_includes/record-card.njk` does not display thumbnails; verify actual Open Graph/featured-card consumption before modifying metadata |

**Verified historical use vs unsupported assumption:** The named portrait files are source-referenced in multiple published articles, but their full-resolution pixel content and licensing have not been directly reviewed. The *existence of matching filenames* in article HTML is not a license to replace the images, generate new character appearances or retcon historical office titles.

### Concrete observed examples

- News 001: `<figure class="subject-portrait"><img src="Tobias-Vael.png" ...><figcaption>Tobias Vael · Senator</figcaption></figure>`.
- News 005: Seren Mak inline portrait + caption.
- News 027: Elin Thoss inline portrait as an Assembly member; `worldImage` points to a card variant.
- News 028: Ines Carrow inline portrait + card variant metadata.
- News 041: Elin Thoss press-conference photograph/illustration is an event-specific inline image; stronger editorial justification than a generic portrait on every story.
- News 071: `verentum-card.webp` image and caption explain the South Loop urban setting.

## 2. Place imagery — uses and high-value reuse

| Existing source asset | Source-backed use | Assessment | Next targeted action |
| --- | --- | --- | --- |
| `verentum-four-founders-card.webp` | Torenthia landing: visual tour of federal capital | **RETAIN**; relevant place identity | Inspect whether city imagery is also used where capital geography matters (not necessarily every Verentum story) |
| `rhondel-cityscape.png` | Torenthia landing: Rhondel/Kelvant | **RETAIN**; conveys city identity | Evaluate on Kelvant profile only if it adds more than the existing State flag/map |
| `lake-varda-crossing.png` | Torenthia landing: lake corridor | **REUSE PROPOSAL** on dossier, separately staged in **draft PR #369** | Verify visual accuracy and mobility/responsiveness before any merge |
| `varek-mountain-landscape.png` | Torenthia landing: Varek/Argent Ridge | **RETAIN**; regional atmosphere | No new generic Varek scene called for from current evidence |
| `ostara-card.webp` | Torenthia landing: Ostara/Solara | **REUSE PROPOSAL** on Solara territory profile, separately staged in **draft PR #368** | Verify visual quality before any merge |
| `verentum-card.webp` | News 071 *The South Loop Is Back on Schedule* | **GOOD SOURCE PLACEMENT**: city setting anchors a specific article | Use as reference for meaningful feature imagery, not for every national politics item |
| Calden harbor / Tessom fieldwork / Ashbridge rail scene | No suitable existing asset confirmed from text search | **OPEN / NOT YET A MISSING-ASSET VERDICT** | Search full binary master library before proposing creation; earlier painterly Calden proof was not approved |

## 3. Geographic and institutional visual anchors — documented asset evidence

`docs/operations/REGIONAL-MAP.md` documents the current regional map accurately:

- `images/region-map-tier2-temporary.webp` / public `/region-map-tier2-temporary.webp` is a **lossless WebP of 1536×1024**, **2,158,954 bytes**, with a recorded SHA-256. It came from supplied temporary map artwork and **is intended to be replaced by Gaea**, but replacement is a later cartographic operation, *not* a multimedia-quality quick fix.
- It is referenced through `_data/geography.js`, shared across the Torenthia intro, Republic-at-a-Glance map, State regional crops, and Korda dossier.
- The older `images/region-map-tier2-base.webp` is retained; the map operation notes explicitly describe restoring that version by changing `geography.baseImage` and rebuilding.
- **Decision:** **RETAIN NOW**, inspect later against the real geography contract; don't create a second unverified map or change the shared image without evaluating all dependent SVG overlays.

Institutional images and marks:

- **State flags** such as `corindal-flag.svg`, `caldenmere-flag.png`, `varek-flag.png`, `kelvant-flag.png`, `orath-flag.svg`, `arvane-flag.svg` appear through shared State profile template. **RETAIN**; profiles already use the map and flag to explain identity.
- **News and record source logos** `logos/the-torenthian-logo.svg`, `logos/rnn-logo.svg`, `logos/nrs-logo.svg`, `logos/the-dorven-ledger-logo.svg`, `logos/the-korda-press-logo.svg`, `logos/tnb-logo.svg` appear on the Record's source gallery. **RETAIN**; these identify whose reporting or official record readers are seeing.
- `docs/torenthia/FLAG-DESIGN-REFERENCE-20261101.md` records **Four Founders** as Torenthia's national flag and distinguishes it from the Federal Republic seal, with source vectors under `images/flags/`. Keep those canon-approved differences; do not equate the national flag with the site seal.
- The main Constitution website uses the seal and different identity graphics. **General-site review remains a separate phase.**

## 4. Why the current image references should not be mistaken for successful display

- `worldImage` is an **optional content metadata field**, not necessarily an inline `<figure>`. News 047 has a generic map in metadata but no inline picture, whereas news 041 has both metadata and an inline press-conference figure.
- `_includes/record-card.njk` contains **no image markup**. Thus the ordinary Record cards cannot display `worldImage` as thumbnails unless a different component is used.
- Torenthia's `related-rail.njk` does render image media but currently sets `alt=""` and hides the thumbnail link, despite available `imageAlt` data. That may be valid for decorative images alongside good titles; verify intended accessible experience before modifying globally.

## 5. Recommended actions from this pass

| Priority | Decision | Justification |
| --- | --- | --- |
| P1 | **Keep portrait identity consistent and reuse the existing files.** | Recurring figures are already visually established; replacing their appearances would weaken continuity |
| P1 | **Review pending reuse PRs #368 and #369 together, with actual rendered previews and checks.** | Proposals reference existing images, adding context; neither is yet deployed or fully validated |
| P1 | **Verify master library beyond what file-source references reveal.** | A genuinely complete asset census is still needed for defensible “missing image” decisions |
| P2 | **Check whether generic `world-map-card.webp` metadata is visible anywhere.** | If not displayed, no reader-facing defect; if surfaced repeatedly, consider better defaults selectively |
| P2 | **Evaluate historical portrait image sizes and modern device performance.** | The asset deployment baseline (2026-09-14) listed `Elin-Thoss.png` 1,588,410 bytes, press-conference variant 1,499,588 bytes, `Ines-Carrow.png` 1,192,601 bytes, `Seren-Mak.png` 1,038,482 bytes, `Tobias-Vael.png` 593,599 bytes; these are **historical measurements** to remeasure before optimization |
| P3 | **New portraits, cityscapes, and landscapes only by a specific demonstrated need.** | The existing collection already covers many recurring people, place types and identity functions |

**No new image recommended solely because a current article is image-free.** No style unification project is proposed.

## Unverified / incomplete

- No exhaustive list of `images/`, root-level raster assets, `logos/`, or unused masters; GitHub connector rejects directory fetching and the current environment's external network access is unavailable. File path search is not a full binary tree census.
- No actual visual pixel review, rendered screenshot, file color/quality, duplicate hash scan, rights verification or mobile rendering inspection. The map's dimensions/bytes are documented by the original repo's technical record, not independently measured now.
- No merge or deploy; no changed images, code, metadata, canon or newsroom workflow. Future source changes must use AGENTS.md-compliant branch-first review and handoffs.

**Summary:** Torenthia has a coherent *set of roles* for existing pictures—character identification, geography, local setting, State identity and publication identity. The strongest next steps are auditing actual binary masters and selectively improving placement, not bulk image generation.
