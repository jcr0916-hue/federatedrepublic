# Branch handoff — Torenthia multimedia inventory (2026-11-20)

- **Original branch:** `docs/torenthia-media-inventory-20261120`, created from `main`.
- **Purpose:** document a focused image inventory, missing media and prioritized production queue for the Torenthia illustrative world and constitution-related features without adding art or changing published site code.
- **Changes:** `docs/torenthia/MULTIMEDIA-INVENTORY-20261120.md` is the primary artifact, including source-grounded audit of Torenthia homepage/Record, Korda dossier, selected State/Territory pages, news 136–143 and NRS 152–159, a ten-item visual queue, editorial/multimedia rules, asset record template and phased verification.
- **Sources actually checked:** `docs/torenthia/STORY-STATUS.md`, `docs/torenthia/COVERAGE.md`, `docs/ASSET-DEPLOYMENT.md`, original World HTML files 136–143 and NRS 152–159, `index.html`, `torenthia.html`, `torenthia-record.html`, relevant State/Territory profiles and `_includes/record-card.njk`, `_includes/current-files.njk`. External cached site indexes were seen but were older and are **not** the audit baseline.
- **Evidence and limits:** the inspected sixteen recent records do not contain article-level `worldImage` or inline image; the Torenthia landing includes referenced geographic/civic tour images and the Record includes outlet logos; shared record cards are text-only; some State flags and map content are template-driven. No master image filesystem enumeration, image quality/binary verification or fresh desktop/mobile browser screenshot was performed. Missing or weak artwork in the actual rendered site remains **unverified** unless explicitly named as source-missing. Do not claim full-site completeness.
- **No changes:** no World narrative/Constitution/canon content, record metadata, asset binaries, theme, navigation, production schedule, agent activation, secrets or website deployment changes.
- **Tests:** not run for this documentation-only branch; no runtime code is changed. Before follow-on image/UI PR, require production build, asset validation, World publishing check and human mobile/desktop preview.
- **Decisions:** prioritize story-specific illustrations and constitutional explanatory diagrams, reuse existing geography and outlet assets, leave routine NRS entries mostly image-free, prevent fictional images from misrepresenting unestablished official outcomes. Constitution remains central and Torenthia is illustrative.
- **Unresolved:** master-image rights and dimensions, exact rendered images, responsive layout, optional `worldImage` usage, appropriate reused artwork and actual filenames.
- **Branch disposition:** retain while PR open. On authorized merge, preserve this handoff in `main` and apply `AGENTS.md` rolling cleanup safeguards; do not delete automatically.

## Follow-on reuse audit on the same PR

- Added `docs/torenthia/MULTIMEDIA-ASSET-REUSE-AUDIT-20261120.md` after inspecting actual shared template rendering and probing seven featured existing asset paths. It documents known source references, confirms three PNGs and one Korda press SVG by blob SHA, notes binary decoding failures for several WebP files and the root-level placement of `verentum-four-founders-card.webp`, and does not claim image bytes or live browser rendering were verified.
- Concrete improvement candidate: `_includes/related-rail.njk` ignores provided `imageAlt` and marks all media image links `aria-hidden`, even on meaningful geographic images. This needs a separate accessibility review; no UI code changed here.
- Production queue narrowed to one purposeful waterfront story image, one constitutional budget/equalization explanatory diagram, and a map-based Kessel location treatment before generating additional illustrative art. No tests run for this documentation-only addition.

## November 21 — source-based image placement audit

- Added `docs/torenthia/MULTIMEDIA-PLACEMENT-AUDIT-20261121.md` documenting image references/usage in Torenthia landing, Record, six State profiles, Korda dossier, selected recent news, and media card templates. Verified mapping of six tour assets, six publisher logos, six flags, maps and prior news examples of inline figure vs metadata-only `worldImage`.
- **Important limitation:** GitHub connected file fetch cannot enumerate directories; direct git network access and Vercel deployment file tree were unavailable. The master asset catalog remains incomplete. Browser/mobile visual inspection and binary dimensions/quality are not verified, so this document does not overclaim completeness.
- **Editorial direction clarified by President:** the Constitution is the project; Torenthia serves it, can have distinct visual styles, and imagery must have function. Prioritize existing-asset reuse, appropriate placements, and selective missing visuals. No site/code/canon/media changes made.

## November 21 — media application review

- Added `docs/torenthia/MULTIMEDIA-ASSET-APPLICATION-REVIEW-20261121.md` recording itemized map, logo, place-photo, flag, and article-image references with purpose and reuse recommendations. Sources checked include `atlas.html`, `territory-solara.html`, `territory-morantine.html`, dossiers, State profile template, and published news 067/071.
- Attempted actual visual inspection, but local git clone failed DNS, binary GitHub connector could not decode images, public image retrieval yielded no pixels, and Vercel deployment files endpoint returned 404. Consequently **rendered visual quality remains unverified**; no false quality judgments were entered. Do not describe asset audit as complete.
- No changes to site code, assets, canon, agents or deployment. This remains a docs-only draft PR for Presidential review.

## November 21 — portraits, places and institutional image audit

- Added `docs/torenthia/MULTIMEDIA-PORTRAITS-PLACES-INSTITUTIONS-20261121.md`. Read actual news 001, 005, 011, 027, 028, 035, 041, 047, 071 and cited source-search hits for other recurring portraits. Identified recurrent portrait references for Vael, Mak, Carrow, Thoss, event-specific Thoss press scene, existing city/territory landscape usage, and generic map-card metadata; distinguished visible inline figures from merely declared `worldImage` metadata.
- Read `docs/operations/REGIONAL-MAP.md` verifying provenance, 1536×1024 size and 2,158,954-byte current temporary map, its Gaea replacement plan, dependencies and rollback context. Also read `docs/torenthia/FLAG-DESIGN-REFERENCE-20261101.md` clarifying national flag vs seal.
- Limits: this remains source-level, not a binary pixel/rights/full-tree/visual render audit. Direct container network to GitHub and production site failed DNS; web API tree inaccessible. No source code, deployed page, assets or canon changed; no build tests applicable to docs-only change. Media additions not authorized.

## November 22 — full Git-tree asset census (important correction to previous limitations)

- **Resolved earlier listing blocker** via the GitHub connector's generic public Git `trees/main?recursive=1` read: tree SHA `2dbc40d09496dd2c4f954234f4f322216d7d3628`, `truncated:false`, 2,115 tree objects, **98 image-format files**. Earlier notes describing the asset list as inaccessible remain historically accurate for previous tool attempts but are superseded for the **file inventory** (pixel inspection remains unavailable).
- Added `docs/torenthia/MULTIMEDIA-FULL-ASSET-CENSUS-20261122.md` with all 98 file paths, actual Git blob sizes, evidence-graded reference categories, and targeted search results. 39 specific filenames returned no indexed GitHub code-search matches; these are **unverified candidates**, not proven unused. An additional 10 image references were not assessed in this pass. Source-backed placements and asset formats are separated.
- Identified existing unreferenced-in-index institutional masters (`torenthia-assembly-chamber.png`, `senate-chamber.png`, `council-of-ministers-meetingroom.png`), place images (`calden-cityscape.png`, `dorven-cityscape.png`, `valedon-cityscape.png`, etc.), and 20 named portraits; prioritize validating their actual content rather than generating new media. Existing main-story canon remains untouched.
- No source, image binaries, publishing configuration or canon changed; no merge/deploy. Next: inspect actual pixels and assess selected reuse places; verify dynamic code references before declaring an asset unused.

## November 22 — institutional and cityscape asset application review

- Added `docs/torenthia/MULTIMEDIA-INSTITUTIONS-CITYSCAPES-REVIEW-20261122.md`: checked institutional and place master image paths/byte sizes against existing landing, Record, Republic-at-a-Glance, fiscal dossier, and two State profile source pages. Prioritized *Assembly chamber*, *Senate chamber*, *Council of Ministers meeting room*, Calden/Dorven cityscapes for actual visual inspection and cautioned against misrepresenting institutions, specific incidents or speculative capital plans.
- Full Git tree now enumerates files, but remote image pixel preview remains blocked: GitHub connector generic fetch refuses non-UTF8 blobs; direct HTTPS to raw GitHub failed DNS. Do not claim visual approval or unreferenced status based solely on indexed search. This review is **documentation only**; no images, pages, canon, merged branches, deploys or automated agents changed.
