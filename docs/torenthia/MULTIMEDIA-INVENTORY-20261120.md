# Torenthia multimedia inventory — active surfaces and current records

**Status:** PROPOSED visual production inventory · **Audited:** 2026-11-20 · **Source:** GitHub `main` (actual file contents), not cached website snippets. **Scope:** Torenthia landing/Record, active geographic surfaces, recent news 136–143 and NRS 152–159. **Nothing here establishes canon, authorizes image publication, or modifies site UI.**

This inventory is subordinate to the project's Constitution-first purpose. Torenthia is the illustrative fictional world; imagery should illuminate constitutional consequences, places, people, and institutions rather than decorate every page.

## What was inspected, and what was not

- **Verified from source:** metadata and body content for `torenthia/news/torenthia-news-136.html` through `-143.html`, and `torenthia/nrs/torenthia-nrs-152.html` through `-159.html`; inspected each for `worldImage`, `<img>`, `<figure>` and inline image links. **All 16 have no article-level image in their source.** A site-wide navigation icon/favicon is not an article image.
- **Home/Record templates:** `torenthia.html`, `torenthia-record.html`, `_includes/record-card.njk`, `_includes/current-files.njk`. Torenthia home already defines a **visual tour** with city, lake, landscape, territory, and Civic Consul assets, and the Record defines **outlet logos**. The ordinary `record-card.njk` and `current-files.njk` templates are text-only. Images in JS-defined tours are **referenced** assets; this inventory does not claim to have inspected master-image bytes or rendered output.
- **Geographic pages:** `torenthia-state-corindal.html`, `torenthia-state-caldenmere.html` use the common state-profile layout and declare state flags; `territory-morantine.html` is text-first; `dossier-korda.html` has a regional map/SVG. A missing literal `<img>` in a page using a template **does not** prove that the rendered page lacks images.
- **Authority on image deployment:** `docs/ASSET-DEPLOYMENT.md`: master source imagery is broader than the deployed public asset set, and the asset collector follows rendered references (including `worldImage`). Validate new references with `npm run build` and `npm run check:assets`. Never delete master files merely because they are not currently deployed.
- **Not independently verified:** current browser rendering, photography rights, exact live image loading, thumbnail quality, existing duplicate masters, asset dimensions, and full-site inventory. These require a second render/file-tree pass. Website search-engine cached listings are older than the published GitHub frontier; do not infer missing records from those listings.

## Inventory status vocabulary

- **EXISTING / SUITABLE:** image is verified on rendered page and serves its purpose.
- **EXISTING / REASSESS:** image is verified but composition, repetition, crop, contrast, weight or continuity needs work.
- **REFERENCED / VERIFY:** source references asset, but rendered state/master bytes or quality remain unchecked.
- **MISSING / SUGGESTED:** no article-level media identified in inspected content; recommended concept is *not yet an existing asset*.
- **NOT NEEDED:** no standalone illustration recommended; typographic or navigational hierarchy is sufficient.
- **UNCHECKED:** must inspect templates, master assets or deployed rendering before asserting presence/absence.

**Asset lifecycle:** `SUGGESTED → APPROVED CONCEPT → CREATED → EDITORIAL REVIEW → PUBLISHED → VERIFIED`, or `NOT NEEDED`. Never interpret `CREATED` as a published World record.

## Prioritization rules

Score candidate media **0–10**: constitutional/explanatory value **0–3**, reader-facing prominence **0–3**, specificity/reusability **0–2**, and visual distinctiveness **0–2**. Rank **8–10 = P1**, **5–7 = P2**, **0–4 = P3**, but elevate an existing *broken* image to P1 regardless of score. Demote misleading, redundant, unverified-claims, or canon-sensitive pictures until reviewed. Do not force illustrations onto ordinary NRS returns.

Preferred editorial mix for a small batch: **2 grounded story/scene illustrations, 1 practical map, 1 constitutional/process explainer, 1 institutional or place identity**. Adjust to the actual stories. Vary the visual types across adjacent cards and avoid a repeated AI-generated aesthetic.

**Technical acceptance:** meaningful alt text; descriptive filename; source/reference/license or original-generation provenance; aspect/crop (typically 16:9 story/social, 3:2 article, square where needed for cards); mobile responsive sizing and `loading=lazy` for below-fold; compressed WebP/AVIF where supported with practical fallback; verify no CLS/cut-off faces, text legibility or layout change. Prefer no baked-in body copy for diagrams that should be real HTML/SVG. **Do not create a fictional documentary image and pass it off as an actual historical photograph; label it an editorial illustration.**

**Canon acceptance:** factual source IDs for locations/institutions/costumes/uniforms/flags; do not show an unestablished election result, flood disaster, repaired bridge/culvert, executed new law, or officeholder decision. Illustrations may depict ordinary scenes only within established story conditions. For politically or legally technical subjects, diagrams and maps generally clarify more than photorealistic props.

## A. Landing, Record, geographic and recurring surfaces

| ID | Surface | Image status from source | Existing/reference | Recommended media | Priority / score | Action and verification |
| --- | --- | --- | --- | --- | --- | --- |
| S01 | `index.html` — Constitution landing | REFERENCED / VERIFY | Seal is explicitly used; homepage is constitution-centric | Retain constitutional visual emphasis; *no Torenthia-specific hero replacement* | P3 / 3 | Inspect live seal dimensions/load before considering changes |
| S02 | `torenthia.html` — introduction | REFERENCED / VERIFY | JS visual tour cites Verentum, Rhondel, Lake Varda, Varek landscape, Ostara, Elin Thoss images | Keep existing place-and-people tour; consider one labeled **regional locator map** alongside it | P1 / 9 | Verify referenced files, mobile tour appearance, map existing candidates before generating new |
| S03 | `torenthia.html` — latest stories | MISSING / SUGGESTED at card template | `record-card.njk` text-only | One **featured lead-card image** from an approved story, not a thumbnail required for every item | P1 / 10 | Choose one verified `worldImage` and add graceful optional card rendering in a separate UI PR |
| S04 | `torenthia.html` — four active files | MISSING / SUGGESTED at briefing template | `current-files.njk` text-only | Four consistent, small **process maps/diagrams or visual marks** for Korda, Lake Varda, equalization, Argent Ridge; not four generic government-building pictures | P2 / 7 | Design shared visual key; preserve briefing dates and summaries |
| S05 | `torenthia-record.html` — archive | REFERENCED / VERIFY; ordinary cards text-only | JS source tour includes logos for The Torenthian, RNN, NRS, Dorven Ledger, Korda Press, TNB | Keep archive dense and searchable; use thumbnails selectively in featured section, **not** the full list | P2 / 6 | Verify existing logos render; improve type and badges before mass thumbnails |
| S06 | `dossier-korda.html` | REFERENCED / VERIFY | SVG regional map with `geography.baseImage` | Use existing map; annotate route/settlement geography only where sources establish it | P1 / 8 | Inspect map labels and mobile crop; avoid inventing LC-N boundaries |
| S07 | `torenthia-state-corindal.html` | REFERENCED / VERIFY via layout | `stateFlag: corindal-flag.svg`; state-profile layout | Corindal industrial/riverside civic identity photo-*style editorial illustration*, preferably one place-setting panel; optional audited remedial process diagram | P2 / 7 | Verify layout/flag and whether an existing Corindal image already fills this role |
| S08 | `torenthia-state-caldenmere.html` | REFERENCED / VERIFY via layout | `stateFlag: caldenmere-flag.png`; profile describes harbor/Calden | Calden working harbor landscape, shared consistently with recent news 143 | P1 / 9 | Search existing masters/earlier articles to reuse before generating |
| S09 | `territory-morantine.html` | MISSING / SUGGESTED in source, template unchecked | No inline image or `worldImage`; related rail and records | Tessom/Valedon road locator + one understated culvert-area editorial illustration | P2 / 7 | Could reuse concept from news 142; avoid implying culvert repair completed |
| S10 | `republic-at-a-glance.html` | REFERENCED / VERIFY | Interactive political map uses `geography.baseImage` + SVG overlay | Keep as the canonical geographical visual anchor; add links from related articles, **not** independent conflicting redraws | P1 / 9 | Check labels, keyboard/mobile use and state/territory boundaries |

## B. Recent narrative record inventory — observed **no story-level images** in all eight inspected sources

| ID | Record (actual GitHub source) | Existing image | Specific suggestion | Type | Priority / score | Why it helps / guardrail |
| --- | --- | --- | --- | --- | --- | --- |
| N136 | `news-136`: *Two Sailings, and a Committee Drawing Pictures* | MISSING | Two-sailing weekday timetable, contrasting crossing windows and the ordinary weekday schedule | Accessible timetable diagram | P2 / 6 | Explain passenger constraints; no suggestion that Solara authorized extra trips |
| N137 | `news-137`: *Before the Ground Thaws* | MISSING | Ashbridge timber rail loading yard at the late-winter thaw line, weathered spur and trucks waiting | Grounded editorial landscape | P2 / 7 | Show service bottleneck; no depiction of a repaired spur or blocked road unless in published source |
| N138 | `news-138`: *The Crew at Tessin Ford* | MISSING | Hollowmere County river crew recording scour and marker posts before full snowmelt | Editorial fieldwork scene | P2 / 7 | Good ordinary-life texture and Varek geography; no fabricated flood |
| N139 | `news-139`: *The Winter Service Ledger* | MISSING | Varenne Station ferry landing in winter, with grader-route sheet/ordinary operational notice as small inset | Lead editorial illustration | P1 / 9 | Best initial Korda visual; no referendum date, new funding or decided status |
| N140 | `news-140`: *What Accurate Enough Costs* | MISSING | Sellen County winter-road record sheets beside road-maintenance equipment; or side-by-side staff-time trade-off | Editorial illustration or modest graphic | P2 / 7 | Visually explain federal evidence vs local service trade-off; avoid invented numeric budget weights |
| N141 | `news-141`: *The Tables Before the Ledger* | MISSING | Annotated **budget preparation vs fiscal-equalization review** flow, with distinct source/decision steps | Constitutional process diagram | P1 / 9 | High constitutional-explainer value; no adopted formula or appropriation |
| N142 | `news-142`: *Field Sheets and Floodwater* | MISSING | Survey ribbon, measurement marks and unchanged Kessel culvert/Valedon-road crossing outside Tessom | Editorial field-report scene | P1 / 9 | High-detail scene in existing text; explicitly **not** a completed repair or diagnosed engineering solution |
| N143 | `news-143`: *The Crane Operator and the Canvas Bag* | MISSING | Port of Calden crane quay at shift change, candidate's canvas leaflet bag (no campaign win imagery) | Lead editorial illustration | P1 / 10 | Strong first-image candidate, human scale; do not invent election date, votes or port-authority action |

For each: open the actual news source, check design templates and any existing artwork before creating. Suggested concepts do **not** claim that a matching generated master exists.

## C. Latest NRS batch — 152–159

| ID | NRS record | Image finding | Recommendation | Priority |
| --- | --- | --- | --- | --- |
| R152 | Public Reading-Room Catalogue Reconciliation | No article image | **NOT NEEDED**; standard NRS typography and the existing institutional logo are preferable | P3 |
| R153 | Seamark Hill Road Culvert Maintenance | No article image | Optional road/culvert locator if linked from an explainer; no dramatic flood scene | P3 |
| R154 | Terenne Regional Service Schedule | No article image | Optional compact accessible service-hours graphic, generated from exact schedule if surfaced outside the official record | P2 |
| R155 | Terenne County Bridge Inspection Register | No article image | Small inspection-cycle chart only if a public explainer needs it; not an invented structural finding | P3 |
| R156 | Aldenmere Auditor Quarterly Records Reconciliation | No article image | **NOT NEEDED**; one consistent NRS institutional identity suffices | P3 |
| R157 | Kessel Culvert Second Measurement Instruction | No article image | Reuse illustrated location/fieldwork scene from news 142 in a *related-story link*, not another hero | P2 |
| R158 | Morantine Business Registration Renewal Materials | No article image | **NOT NEEDED**; formatted administrative record | P3 |
| R159 | Town of Tessom Municipal Counter Hours | No article image | Optional compact hours block in HTML if useful; no photographic illustration | P3 |

Avoid manufacturing authority by generating fake document scans, official forms, seals, technical measurements or notices that look like authentic NRS originals. Keep actual record text/metadata as authority.

## D. First production queue — ten specific items

All entries are *suggestions only*; creative briefs require canon/asset checks before generation.

| Queue | Media concept | Reuse destination(s) | Deliverable |
| ---: | --- | --- | --- |
| 1 | **Port of Calden: The Crane Operator and the Canvas Bag** | News 143; Caldenmere profile, Torenthia latest lead | Editorial illustration, 3:2 master with safe 16:9 crop |
| 2 | **Kessel culvert — measurement, not repair** | News 142; Morantine profile; NRS 157 related link | Editorial illustration, 3:2 |
| 3 | **Korda winter ferry landing** | News 139; dossier Korda; latest lead when appropriate | Editorial illustration, 3:2 |
| 4 | **Civic-domain budget vs equalization review** | News 141; fiscal equalization dossier; Constitution explanation | Accessible SVG/HTML process flow, no invented fiscal outcomes |
| 5 | **Torenthia geography orientation** | Torenthia landing and article rail | Existing map adaptation/locator before any new geographic drawing |
| 6 | **Ashbridge timber yard and rail spur** | News 137; Korda local coverage | Editorial landscape, 16:9 |
| 7 | **Tessin Ford seasonal survey crew** | News 138; Varek profile | Editorial fieldwork scene, 3:2 |
| 8 | **Federal versus county work-hours trade-off** | News 140; §12.6 explainer | Restraint-first side-by-side editorial graphic |
| 9 | **Two-sailing timetable** | News 136; Solara/Korda-related coverage | Accessible HTML/SVG schedule from established timetable only |
| 10 | **Local governments and the federal record: navigation** | Torenthia Record / constitution guide | One cross-link visual key for News / NRS / State records / Constitution (no new national seal) |

## E. Asset record template — use one line for every candidate

| Field | Required | Example |
| --- | --- | --- |
| `assetId` | Yes | `TMI-N143-01` |
| `pagePath`, `pageTitle` | Yes | `torenthia/news/torenthia-news-143.html` |
| `surface`, `desk` | Yes | `article-hero`, `caldenmere` |
| `currentStatus` | Yes | `MISSING / SUGGESTED` |
| `sourceAsset`, `publicUrl` | Once existing | `images/...webp`, `/...webp` |
| `proposedType`, `concept`, `reusableOn` | Yes | `editorial-illustration`, safe concept, list |
| `canonRefs`, `risks` | Yes | Article and relevant constitution sections |
| `rightsProvenance` | Before publishing | Original generated art / licensed source and author |
| `priority`, `score`, `workflowStatus` | Yes | `P1`, `10`, `SUGGESTED` |
| `altText`, `aspectRatio`, `pixelDimensions`, `fileBytes` | Before publishing | Descriptive alt, tested crops/sizes |
| `reviewer`, `approvedAt`, `publishedCommit`, `verifiedLive` | On release | Evidence links and timestamps |

**Suggested naming:** `torenthia-<location>-<story-key>-editorial-v1.webp`; keep canonical source masters and optimized derivatives separately as appropriate. Existing site conventions and asset collector have precedence over generic naming advice.

## F. Repeatable editorial image workflow

1. **Inventory first.** Compare metadata, body images, shared templates, master library, and actual deployed page; record source-backed **existing** versus **missing**. Do not assume an asset is missing just because its title is not in a filename.
2. **Choose meaningful visual** by score and editorial benefit. Default to no standalone photo for routine NRS records; favor real diagrams for constitutional machinery and human-scale editorial illustrations for significant stories.
3. **Write a one-paragraph specific concept** from published canon. Mark fictional images as **editorial illustrations**, verify geography and flags, and keep legal/election outcomes unresolved where source leaves them open.
4. **Check reuse and rights** before generation. Existing original assets can be stronger than an additional AI image; avoid duplicate portraits and an inconsistent map.
5. **Produce and review** one visual at a time, with preview/crops on mobile, alt text, compressed master/derivative, source/license/provenance, and named editorial approval.
6. **Publish through a reviewed feature branch**, not direct-to-main. Add optional `worldImage` only where the current World rendering actually consumes it; if it does not, add tested template wiring first. Preserve dates, IDs, prose and the content hierarchy.
7. **Build and verify** with `npm run build`, `npm run check:assets`, `npm run world:publish-check`, then inspect the published page and cards. A passing build alone does not verify mobile appearance.
8. **Update the inventory** with real filenames, rights, approved source refs, PR/commit and rendered verification; archive rejected concepts without deleting useful masters.

## G. Immediate next checks

- Render the live Torenthia home, Record, news 139–143, Corindal/Caldenmere/Morantine profiles and Korda dossier at desktop and mobile widths. Verify the JS tours and flags are actually present, and whether any template supplies an image that the body-source audit could not see.
- Enumerate actual repository `images/` and `logos/` master files, dimensions and licensing/provenance; search for Calden, Tessom, Korda and Varek imagery and current map masters. **This is not yet a complete source library inventory.**
- Confirm the news layout already supports `worldImage` and how `record-card.njk` should handle optional image metadata without blank frames for unillustrated NRS.
- Make a **separate**, reviewed visual-design PR for one or two P1 story illustrations and a single homepage featured-card treatment; avoid simultaneous homepage redesign, mass AI image production, or overwriting already styled records.
