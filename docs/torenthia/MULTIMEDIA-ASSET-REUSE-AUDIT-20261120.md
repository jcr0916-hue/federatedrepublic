# Torenthia visual reuse audit — existing asset candidates and purposeful placements

**Date:** November 20, 2026 · **Status:** source-level verification, proposed recommendations only · **Companion:** [Multimedia Inventory](MULTIMEDIA-INVENTORY-20261120.md).

## Decision

**Do not start generating a large batch of illustrations.** Reuse established location visuals, existing State flags, regional maps, and outlet branding first. For the initial production iteration, only create art or a process graphic that answers a reader's concrete question. The Constitution is the primary project; Torenthia's imagery should help readers see its operation.

## What the running design already offers

| Existing feature | Source | Function | Recommendation |
| --- | --- | --- | --- |
| Context map and geography | `torenthia.html` uses `geography.baseImage` and SVG border/labels; `republic-at-a-glance.html` offers interactive map | Where a jurisdiction or story takes place | Reuse it and deep-link from stories; do not draw a second inconsistent map |
| Faces & Places visual tour | `torenthia.html` `relatedItems`; `_includes/related-rail.njk` | Introduces capital, regions, landscape, officeholder | Keep; verify linked images and mobile rendering |
| Outlet identity gallery | `torenthia-record.html` tour includes logo paths | Helps readers distinguish news, broadcasting, and official records | Keep logos; don't add a random stock photo to every NRS |
| State profile headers | `_includes/state-profile.njk` renders `stateFlag` plus SVG regional map | Distinguishes State identity and geographic context | Already doing functional multimedia work; avoid replacing with interchangeable skylines |
| Korda dossier | `dossier-korda.html` uses map/SVG | Understands settlement geography | Retain; extend only with source-grounded annotations |
| General record cards | `_includes/record-card.njk` (text-only) | Quick archive scanning | Introduce **optional** media for featured narrative records only; unillustrated records must not have blanks |

## Exact referenced asset paths checked

The **public** images are sometimes referred to by a root-level URL even when the repository source file lives under `images/`. The source/deploy mapping is documented in `docs/ASSET-DEPLOYMENT.md`. The exceptions below matter.

| Asset referenced in site | Repository candidate and read result | What it does | Assessment |
| --- | --- | --- | --- |
| `verentum-four-founders-card.webp` | **Root-level** `verentum-four-founders-card.webp`: file read produced a binary UTF-8 decoding error (strong evidence path exists); `images/verentum-four-founders-card.webp` returned 404 | Capital/civic identity | **REFERENCED / VERIFY** image quality, asset availability and actual browser loading |
| `rhondel-cityscape.png` | `images/rhondel-cityscape.png`: exists (blob SHA `5bc7dbf6e398906c298273eca51d71e59fe0c129`) | Lake-region city identity | **REFERENCED / VERIFY** rendered crop and source provenance |
| `lake-varda-crossing.png` | `images/lake-varda-crossing.png`: exists (SHA `bef670c18ea1d00328a299af56b8e6778db4db9d`) | Cross-border lake geography | **REFERENCED / VERIFY** location continuity |
| `varek-mountain-landscape.png` | `images/varek-mountain-landscape.png`: exists (SHA `607a92977c144f96cd2cbc042491217c914df61a`) | Varek region landscape | **REFERENCED / VERIFY** visual/crop; no need to invent general Varek scenery |
| `ostara-card.webp` | `images/ostara-card.webp`: binary UTF-8 decoding error (likely present, contents not inspected) | Solara/Ostara place identity | **REFERENCED / VERIFY** browser and file quality |
| `Elin-Thoss-Press-Conference-card.webp` | `images/Elin-Thoss-Press-Conference-card.webp`: binary UTF-8 decoding error (likely present, contents not inspected) | Identifies Civic Consul and office | **REFERENCED / VERIFY** representation against established canon |
| `logos/the-korda-press-logo.svg` | `logos/the-korda-press-logo.svg`: readable SVG exists (blob SHA `c65adb3ea1dc3221f3957b2194873448c3cea051`) | Media-outlet identity | Reuse at outlet identity surfaces, not in place of individual story illustrations |

**Limits:** the GitHub connector cannot decode certain binary images as UTF-8. The errors above are *not* image previews or an image-quality assessment. They should not be converted into a claim of visual suitability or actual live URL success. The path probes do **not** enumerate the entire `images/` or `logos/` directory.

## A high-value issue before adding more visual assets

`_includes/related-rail.njk` renders all linked media using `<img ... alt="" loading="lazy">` inside an `aria-hidden="true"` image link, **even when the data in `torenthia.html` defines `imageAlt` descriptions**. For decorative images inside cards that already have descriptive headings, empty alt may be intentional; for meaningful geographic or institutional images, it throws away image-specific explanation.

**Recommendation:** test a narrowly scoped accessible pattern: meaningful photographs can expose their `imageAlt` and use one labeled link rather than duplicative links, while purely decorative images stay silent. Do not mechanically replace every empty alt or destroy keyboard behavior. Design/review this separately from adding pictures.

## Revised initial production choice: three types, not ten standalone photographs

| Order | Task | Reuse first? | Reader value | Release decision |
| --- | --- | --- | --- | --- |
| **1** | Feature **news 143**, `The Crane Operator and the Canvas Bag`, using a grounded waterfront/workplace illustration only if an existing Calden harbor image cannot be reused | **Yes** — search Calden assets and history before creating | Shows a worker-candidate and the separation of State port authority from federal Assembly power | Make one illustrative 3:2 lead with safe mobile crop, *not* invented victory/election imagery |
| **2** | Explain **news 141**, `The Tables Before the Ledger` | **Yes** — look for an existing process figure | Helps explain the difference between budget assembly and the unresolved equalization review | An accessible, source-cited diagram is more useful than a generic desk photograph |
| **3** | Provide location context for **news 142**, `Field Sheets and Floodwater`, and related NRS 157 | **Yes** — the existing regional map as locator | Readers see where the Kessel culvert issue sits, and the difference between a survey and authorized repair | Map + one restrained scene only if helpful; avoid fake completed repairs |

**Reserve for later:** Korda landing news 139, Ashbridge news 137, Tessin Ford news 138, Sellen County news 140, and timetable graphic news 136; the existing [main inventory](MULTIMEDIA-INVENTORY-20261120.md) retains those briefs. Pick based on homepage prominence and editorial impact. Routine NRS remain primarily typographic and should link to relevant illustrated stories rather than accumulate unrelated images.

## Media acceptance checklist for one trial

- The visual answers **what/where/how/who** about a story or constitutional mechanism; if not, reject it.
- No unverified official acts, elections, repairs, numbers, uniforms, fabricated photographs or geographic boundaries.
- Source asset and rights/provenance verified, with consistent visual style where reused.
- Optional `worldImage` or explicit figure appears in the *rendered* article **and** on the appropriate featured card, without affecting ordinary NRS cards.
- Caption explains what the image helps readers understand; alt text avoids duplicating an adjacent caption unnecessarily.
- Check desktop/mobile crop, dimensions, file size, contrast, keyboard access and screen-reader order.
- `npm run build`, `npm run check:assets`, and `npm run world:publish-check` all pass before any approved merge; inspect the live page afterward.
- No new canonical events, identity changes, article edits, IDs or publication changes are part of the image PR.

## Next verifications, before producing the first asset

1. Get a **real binary image preview or rendered page screenshot** for the existing capital, Rhondel, Lake Varda, Varek, Ostara, Calden and related city/harbor assets; source references alone are insufficient.
2. Enumerate the master library, including root-level image files (not just `images/`), and calculate file dimensions/size, rights/provenance and duplicates.
3. Prepare an **independent image/template feature PR** for a single headline article and optional image-aware featured card; preserve the existing home tour and manual editor control.

All items are proposed. No image generated, published page modified, live Vercel setting changed or canon advanced.
