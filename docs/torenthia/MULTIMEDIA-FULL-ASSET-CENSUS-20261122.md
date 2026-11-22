# Torenthia multimedia — complete file-tree image census (first pass)

**Date:** 2026-11-22 · **Source:** GitHub `main`, recursive Git tree API, tree SHA `2dbc40d09496dd2c4f954234f4f322216d7d3628` (response `truncated:false`) · **Status:** complete image-file list on this Git tree; usage audit continues.

## Important breakthrough and scope

Unlike earlier audits, this census enumerates every image-format file in the full `main` Git tree, not just files named by source references. There are **98 image files** across `(root)` (7), `assets` (1), `images` (79), `images/flags` (4), `logos` (7). Formats: 60 PNG, 18 WEBP, 18 SVG, 2 JPG. Includes graphics for the main constitutional site, archive masters and icons as well as Torenthia; it is an image-format **repository census**, not a claim all 98 belong to Torenthia or are deployed.

A Git tree reports path, blob size and SHA; **it does not establish visual quality, real image dimensions, rights, on-site display, or whether a file is currently in a shipped deployment**. Reference categories here mean:
- **Known reference:** evidence from explicit page/template/article source or documented flag/map provenance. Presence in a metadata field may not mean a visible image.
- **No indexed reference match:** targeted GitHub indexed-code search for that exact filename returned no matching source. **It is a candidate for reuse or an unused master, not proven unused**; indexing/JS/runtime and historical material require checking.
- **Reference not assessed:** no conclusion about use.

## Key findings / action-oriented opportunities

**Places and institutions first — do NOT commission new illustrations until checking masters:**

| Existing master | Exact-code-search result | Potential purposeful reuse |
| --- | --- | --- |
| `images/calden-cityscape.png` (2.66 MiB) | No indexed match | A Caldenmere geographic or city context page; investigate before generating a port scene |
| `images/dorven-cityscape.png` (2.49 MiB) | No indexed match | Orath/Dorven civic and regional identity |
| `images/marisvia-cityscape.png` (2.67 MiB), `images/valedon-cityscape.png` (2.59 MiB) | No indexed matches | Neighboring-country reports, only if readers benefit from geographic distinction |
| `images/caldris-landscape.png` (2.71 MiB) | No indexed match | Landscape context for Caldris, not generic article decoration |
| `images/verentum-street-level.png` (2.22 MiB), `images/verentum-cIvic-campus.png` (3.22 MiB) | No indexed matches | Capital institutions and city setting; check whether related small WebP card is already deployed |
| `images/torenthia-assembly-chamber.png` (2.21 MiB), `images/senate-chamber.png` (2.06 MiB), `images/council-of-ministers-meetingroom.png` (1.81 MiB) | No indexed matches | Explaining what the distinct national chambers and meeting spaces are; do not invent a new seat or office |
| `logos/supreme-court-logo.svg` | No indexed match | Institutional identity if there is an appropriate court-information surface |
| `images/ostara-civic-plan.png`, `images/ostara-civic-proposal.png`, `images/ostara-civic-realized.png` | No indexed matches | **High caution:** distinct hypothetical/proposal/realized stages, which must not be published out of chronological/canonical context |
| `images/lake-varda-incident.png`, `images/sunderland-shoreline.png` | No indexed matches | Potential story/dossier context; verify chronology and whether imagery implies unapproved events |
| `images/riverglow.png`, `images/riverglow-alt.png`, `images/riverglow-3.png` | No indexed matches | Potential alternatives/unused drafts; compare pixel contents and provenance rather than choosing by filename |

**Portrait candidates:** 20 additional named full-size portraits produced no exact-filename matches in this indexed-source check: Aldous Fenn, Aldric Feyn, Corwin Hale, Dara Voss, Dessa Orin, Halden Rews, Herbert Sole, Ivenne Casta, Kessa Vray, Lenne Akar, Maren Sollis, Nadia Sorrel, Pell Sandris, Petra Vend, Renata Kell, Reya Solt, Rosalind Kade, Thomas Verel, Yelka Sarn, Casimir Rehn. These are **possible unused image assets**, not a recommendation to insert every one. Check which characters exist in canon and deserve a named-profile portrait before using them; distinguish reporters from officeholders and events. Current published portraits of Thoss, Carrow, Mak, Vael are already established and should not be replaced.

**Flags and logos** are present in the full tree and already fulfill useful identity functions in shared templates. `images/flags` also includes 3 design proposals retained as historical artifacts; do not treat those as missing applications or publish them as the national flag. The current national flag is Four Founders.

**Performance note:** high-resolution PNG masters are frequently 1–3 MiB; avoid adding several directly to ordinary landing cards. If a user-facing reuse is approved, prefer an existing appropriate derivative or add an optimized derivative **without deleting master originals**, following `docs/ASSET-DEPLOYMENT.md`.

## Full 98-file repository inventory

Path uses actual Git repository tree; `images/X` normally publishes as `/X` per asset deployment documentation, not `/images/X`. Sizes are Git blob bytes divided by 1,048,576, rounded to hundredths.

| Source path | Size | Reference classification | Evidence or next verification |
| --- | ---: | --- | --- |
| `aldenmere-flag.svg` | 0.00 MB | Known reference | State profile template |
| `arvane-flag.svg` | 0.00 MB | Known reference | State profile template |
| `assets/world-map-tier1-source.png` | 2.51 MB | Reference not assessed | Not assessed in this pass |
| `corindal-flag.svg` | 0.00 MB | Known reference | State profile template |
| `images/Aldous-Fenn.png` | 1.83 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Aldric-Feyn.png` | 1.77 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/apple-touch-icon.png` | 0.07 MB | Reference not assessed | Not assessed in this pass |
| `images/calden-cityscape.png` | 2.65 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/caldenmere-flag.png` | 1.12 MB | Known reference | State profile template |
| `images/caldris-landscape.png` | 2.71 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/casimir-rehn.png` | 1.89 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Corwin-Hale.png` | 1.49 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/council-of-ministers-meetingroom.png` | 1.81 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Dara-Voss.png` | 1.79 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Dessa-Orin.png` | 1.38 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/dorven-cityscape.png` | 2.49 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Elin-Thoss-card.webp` | 0.02 MB | Known reference | Published news metadata |
| `images/Elin-Thoss-Press-Conference-card.webp` | 0.03 MB | Known reference | Torenthia homepage tour; news 041 metadata |
| `images/Elin-Thoss-Press-Conference.png` | 1.43 MB | Known reference | Published news 041 inline |
| `images/Elin-Thoss.png` | 1.51 MB | Known reference | Published news 027, 029, 033, 035, 036 |
| `images/favicon-32.png` | 0.00 MB | Reference not assessed | Not assessed in this pass |
| `images/Federated-Republic-Parchment-card.webp` | 0.03 MB | Known reference | Site carousel fallback |
| `images/federated-republic-parchment.png` | 1.51 MB | Reference not assessed | Not assessed in this pass |
| `images/flags/proposal-a-federal-union.svg` | 0.00 MB | Known reference | Archived flag design candidate |
| `images/flags/proposal-b-constitutional-republic.svg` | 0.00 MB | Known reference | Archived flag design candidate |
| `images/flags/proposal-c-new-republic.svg` | 0.00 MB | Known reference | Archived flag design candidate |
| `images/flags/torenthia-four-founders.svg` | 0.00 MB | Known reference | Approved national flag documented in flag design reference |
| `images/Halden-Rews.png` | 1.80 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/harren-flag.png` | 1.16 MB | Known reference | State profile template |
| `images/Herbert-Sole.png` | 1.89 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Ines-Carrow-card.webp` | 0.01 MB | Known reference | Published news metadata |
| `images/Ines-Carrow.png` | 1.14 MB | Known reference | Published news 002, 006, 028 |
| `images/Ivenne-Casta.png` | 1.91 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/kelvant-flag.png` | 1.12 MB | Known reference | State profile template |
| `images/Kessa-Vray.png` | 1.75 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/lake-varda-crossing.png` | 1.76 MB | Known reference | Torenthia homepage tour; draft PR #369 |
| `images/lake-varda-incident.png` | 2.24 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Lenne-Akar.png` | 1.87 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/living-crossroads.jpg` | 0.73 MB | Reference not assessed | Not assessed in this pass |
| `images/Maren-Sollis.png` | 1.47 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/marisvia-cityscape.png` | 2.68 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Nadia-Sorrel.png` | 1.81 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/norvane-flag.png` | 1.15 MB | Known reference | State profile template |
| `images/ostara-card.webp` | 0.08 MB | Known reference | Torenthia homepage tour; draft PR #368 |
| `images/ostara-civic-plan-card.webp` | 0.05 MB | Known reference | Reference not confirmed |
| `images/ostara-civic-plan.png` | 2.23 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/ostara-civic-proposal-card.webp` | 0.08 MB | Known reference | Reference not confirmed |
| `images/ostara-civic-proposal.png` | 3.02 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/ostara-civic-realized.png` | 2.86 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/ostara.png` | 3.03 MB | Reference not assessed | Not assessed in this pass |
| `images/Pell-Sandris.png` | 1.82 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Petra-Vend.png` | 1.20 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/region-map-tier2-base.webp` | 0.49 MB | Known reference | Preserved older map master |
| `images/region-map-tier2-temporary.webp` | 2.06 MB | Known reference | Torenthia, republic-at-a-glance, State maps |
| `images/Renata-Kell.png` | 1.97 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Reya-Solt.png` | 1.95 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/rhondel-cityscape.png` | 2.74 MB | Known reference | Torenthia homepage visual tour |
| `images/riverglow-3.png` | 2.83 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/riverglow-alt.png` | 2.69 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/riverglow-card.webp` | 0.05 MB | Known reference | Reference not confirmed |
| `images/riverglow.png` | 2.38 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Rosalind-kade.png` | 2.01 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/seal-card.webp` | 0.03 MB | Known reference | Site carousel fallback |
| `images/seal-watermark.png` | 0.28 MB | Reference not assessed | Not assessed in this pass |
| `images/seal.png` | 1.97 MB | Reference not assessed | Not assessed in this pass |
| `images/seal.svg` | 0.00 MB | Reference not assessed | Not assessed in this pass |
| `images/selvane-flag.png` | 1.17 MB | Known reference | State profile template |
| `images/senate-chamber.png` | 2.06 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Seren-Mak-card.webp` | 0.01 MB | Known reference | Reference not confirmed |
| `images/Seren-Mak.png` | 0.99 MB | Known reference | Published news 005, 015, 019 |
| `images/sunderland-shoreline.png` | 1.78 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Thomas-Verel.png` | 2.04 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/Tobias-Vael-card.webp` | 0.02 MB | Known reference | Reference not confirmed |
| `images/Tobias-Vael.png` | 0.57 MB | Known reference | Published news 001, 011 and others |
| `images/torenthia-assembly-chamber.png` | 2.21 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/valedon-cityscape.png` | 2.59 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/varek-flag.png` | 1.18 MB | Known reference | State profile template |
| `images/varek-mountain-landscape.png` | 2.99 MB | Known reference | Torenthia homepage visual tour |
| `images/verentum-card.webp` | 0.06 MB | Known reference | Published news 071 inline |
| `images/verentum-civic-campus-card.webp` | 0.08 MB | Known reference | Reference not confirmed |
| `images/verentum-cIvic-campus.png` | 3.22 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/verentum-street-level.png` | 2.22 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `images/verentum.png` | 2.53 MB | Reference not assessed | Not assessed in this pass |
| `images/world-map-card.webp` | 0.07 MB | Known reference | Published news metadata; site updates fallback |
| `images/world-map-tier1.jpg` | 0.79 MB | Known reference | Atlas JPEG fallback |
| `images/world-map-tier1.webp` | 1.95 MB | Known reference | Atlas |
| `images/Yelka-Sarn.png` | 1.57 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `logos/nrs-logo.svg` | 0.01 MB | Known reference | Record source gallery |
| `logos/rnn-logo.svg` | 0.01 MB | Known reference | Record source gallery |
| `logos/supreme-court-logo.svg` | 0.01 MB | No indexed reference match | Exact-filename GitHub code search returned zero matches; verify dynamic/archival uses |
| `logos/the-dorven-ledger-logo.svg` | 0.02 MB | Known reference | Record source gallery |
| `logos/the-korda-press-logo.svg` | 0.01 MB | Known reference | Record source gallery |
| `logos/the-torenthian-logo.svg` | 0.02 MB | Known reference | Record source gallery |
| `logos/tnb-logo.svg` | 0.01 MB | Known reference | Record source gallery |
| `merath-flag.svg` | 0.00 MB | Known reference | State profile template |
| `orath-flag.svg` | 0.00 MB | Known reference | State profile template |
| `rhovane-flag.svg` | 0.00 MB | Known reference | State profile template |
| `verentum-four-founders-card.webp` | 0.31 MB | Known reference | Torenthia homepage visual tour |

## What remains before decisions

1. **Reference validation:** go beyond indexed filename search; inspect template variables, JS-built asset URLs, metadata, older unpublished contexts, and derivative naming. Zero search results cannot prove no real use.
2. **Actual visual review:** inspect pixels, crops, aspect ratios, file dimensions, and source rights; cannot assert image quality based on filenames.
3. **Prioritization:** review existing institutional assets first (chambers + meeting room), then geographic assets (Calden, Dorven, Verentum), then unused portraits; choose only placements that help readers understand governmental institutions or locations.
4. **Site review:** compare current built pages at mobile/desktop widths; archive assets may intentionally remain unused.
5. **Implementation:** stage small independently reviewable branches after selecting and verifying an image. Do not change canon, merge or deploy without approval.

## Existing changes and constraints

- Main inventory draft PR #363 is documentation only.
- Existing-image placement draft PRs #368 (Ostara on Solara) and #369 (Lake Varda crossing on dossier) remain separate and not merged.
- Project focus is the Constitution, with Torenthia as illustrative world; a main-site multimedia audit is explicitly later.
