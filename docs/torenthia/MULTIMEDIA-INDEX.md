# Torenthia multimedia — consolidated image index

**Status:** Canonical index of every image-format file in the `main` tree. Consolidates
the dated audit snapshots listed below into one reference. **No images, pages, canon, or
deployment were changed by this document.** Last verified against tree SHA `d5090ab8`
(2026-11-27).

This is the single entry point for "what pictures does the Federated Republic site have,
where are they used, and what is still unplaced?" It supersedes the fragmented snapshots
only as a *lookup*; the older documents retain their value as dated reasoning and are kept.

## Related (dated) audit documents

| Document | Role |
| --- | --- |
| `MULTIMEDIA-FULL-ASSET-CENSUS-20261122.md` | First complete 98-file tree census with blob sizes |
| `MULTIMEDIA-PLACEMENT-AUDIT-20261121.md` | Source-proven page placements |
| `MULTIMEDIA-ASSET-APPLICATION-REVIEW-20261121.md` | Per-page placement decisions |
| `MULTIMEDIA-INSTITUTIONS-CITYSCAPES-REVIEW-20261122.md` | Institution/cityscape reuse candidates |
| `MULTIMEDIA-IMAGE-GALLERY-20261122.md` | Rendered gallery for visual review |
| `MULTIMEDIA-NEXT-PASS-20261124.md` | Latest state and ranked next actions |
| `MULTIMEDIA-INVENTORY-20261120.md`, `MULTIMEDIA-ASSET-REUSE-AUDIT-20261120.md` | Earliest inventory and reuse passes |

## How to read this index

- **Reference status** describes evidence only, not usefulness:
  - **Known reference** — a page, template, front matter, or documented provenance cites it.
  - **No indexed match** — exact-filename search found no page/template source. A *candidate
    for reuse or an unused master*, **not** proven unused (dynamic/JS/metadata paths are a
    known blind spot).
  - **Not assessed** — no conclusion recorded.
- **Paths are source paths.** Public URLs are flattened: `images/x.png → /x.png`,
  `logos/x.svg → /logos/x.svg`, `pdf/x.pdf → /x.pdf` (see `docs/ASSET-DEPLOYMENT.md`).
  Pages reference images by **bare filename** (`seal.png`), not `images/…`.
- Only referenced/protected assets deploy to `_site`. A master existing here does **not**
  mean it is on the live site.

## Totals

**98 image-format files** — 60 PNG, 18 WEBP, 18 SVG, 2 JPG — across `(root)` (7),
`assets/` (1), `images/` (79), `images/flags/` (4), `logos/` (7).

---

## Master inventory

### Flags — national and State (18)

| Path | Format | Size | Status | Use / note |
| --- | --- | ---: | --- | --- |
| `images/flags/torenthia-four-founders.svg` | SVG | — | Known | **National flag** (approved; Four Founders) |
| `images/flags/proposal-a-federal-union.svg` | SVG | — | Known | Archived design candidate (historical, not national) |
| `images/flags/proposal-b-constitutional-republic.svg` | SVG | — | Known | Archived design candidate |
| `images/flags/proposal-c-new-republic.svg` | SVG | — | Known | Archived design candidate |
| `aldenmere-flag.svg` | SVG | — | Known | State profile template |
| `arvane-flag.svg` | SVG | — | Known | State profile template |
| `corindal-flag.svg` | SVG | — | Known | State profile template |
| `merath-flag.svg` | SVG | — | Known | State profile template |
| `orath-flag.svg` | SVG | — | Known | State profile template |
| `rhovane-flag.svg` | SVG | — | Known | State profile template |
| `images/caldenmere-flag.png` | PNG | 1.12 | Known | State profile template |
| `images/harren-flag.png` | PNG | 1.16 | Known | State profile template |
| `images/kelvant-flag.png` | PNG | 1.12 | Known | State profile template |
| `images/norvane-flag.png` | PNG | 1.15 | Known | State profile template |
| `images/selvane-flag.png` | PNG | 1.17 | Known | State profile template |
| `images/varek-flag.png` | PNG | 1.18 | Known | State profile template |

> 12 State flags (6 SVG + 6 PNG). Flag design docs exist under
> `docs/world/visual-identity/` (Kelvant, Varek, Caldenmere).

### Maps and seals (14)

| Path | Format | Size | Status | Use / note |
| --- | --- | ---: | --- | --- |
| `images/world-map-tier1.webp` | WEBP | 1.95 | Known | `atlas.html` world map |
| `images/world-map-tier1.jpg` | JPG | 0.79 | Known | Atlas JPEG fallback |
| `assets/world-map-tier1-source.png` | PNG | 2.51 | Not assessed | Source master |
| `images/world-map-card.webp` | WEBP | 0.07 | Known | News `worldImage` metadata; updates fallback |
| `images/region-map-tier2-temporary.webp` | WEBP | 2.06 | Known | **Main context map** (`_data/geography.js`) — `torenthia.html`, State profiles, `republic-at-a-glance.html`. Filename says "temporary"; quality/accuracy check pending |
| `images/region-map-tier2-base.webp` | WEBP | 0.49 | Known | Preserved older map master |
| `images/seal.png` | PNG | 1.97 | Known | **Site identity** — hero, nav, `og:image`, service worker cache, NRS header |
| `images/seal.svg` | SVG | — | Known | Seal vector source |
| `images/seal-card.webp` | WEBP | 0.03 | Known | Carousel fallback |
| `images/seal-watermark.png` | PNG | 0.28 | Known | Protected watermark |
| `images/favicon-32.png` | PNG | — | Known | Favicon |
| `images/apple-touch-icon.png` | PNG | 0.07 | Known | Apple touch icon |
| `favicon.ico` | ICO | — | Known | Root favicon |

> `seal.png` was recorded "not assessed" in the 11-22 census; this index upgrades it to
> Known with evidence (`index.html` hero + `og:image`, `_includes/nav.njk`, `sw.js`
> ASSETS list, `torenthia/nrs/torenthia-nrs-001.html` header).

### Publisher and institutional logos (7)

| Path | Format | Size | Status | Use / note |
| --- | --- | ---: | --- | --- |
| `logos/the-torenthian-logo.svg` | SVG | 0.02 | Known | Record source gallery (national newspaper) |
| `logos/rnn-logo.svg` | SVG | 0.01 | Known | Record source gallery (broadcaster) |
| `logos/nrs-logo.svg` | SVG | 0.01 | Known | Record source gallery (official record) |
| `logos/the-dorven-ledger-logo.svg` | SVG | 0.02 | Known | Record source gallery (local press) |
| `logos/the-korda-press-logo.svg` | SVG | 0.01 | Known | Record source gallery (territorial press) |
| `logos/tnb-logo.svg` | SVG | 0.01 | Known | Record source gallery (broadcaster/regional) |
| `logos/supreme-court-logo.svg` | SVG | 0.01 | **No indexed match** | Conditional reuse for a court-record context; verify design/canon before treating as an official seal |

### Federal institutional imagery (3) — on hold

| Path | Format | Size | Status | Use / note |
| --- | --- | ---: | --- | --- |
| `images/torenthia-assembly-chamber.png` | PNG | 2.21 | No indexed match | Federal Assembly chamber; **HOLD** pending coordinated Verentum architectural family (President) |
| `images/senate-chamber.png` | PNG | 2.06 | No indexed match | Federal Senate chamber; **HOLD** |
| `images/council-of-ministers-meetingroom.png` | PNG | 1.81 | No indexed match | Executive meeting room; **HOLD** + verify the "Council of Ministers" term against constitutional text |

### Cityscapes, landscapes and places (22)

| Path | Format | Size | Status | Use / note |
| --- | --- | ---: | --- | --- |
| `images/rhondel-cityscape.png` | PNG | 2.74 | Known | `torenthia.html` visual tour (Rhondel) |
| `images/varek-mountain-landscape.png` | PNG | 2.99 | Known | `torenthia.html` visual tour (Varek) |
| `images/lake-varda-crossing.png` | PNG | 1.76 | Known | `torenthia.html` visual tour; draft PR #369 |
| `images/ostara-card.webp` | WEBP | 0.08 | Known | `torenthia.html` visual tour (Solara/Ostara); draft PR #368 |
| `images/verentum-four-founders-card.webp` | WEBP | 0.31 | Known | `torenthia.html` visual tour (capital district) |
| `images/verentum.png` | PNG | 2.53 | Not assessed | Capital master |
| `images/verentum-card.webp` | WEBP | 0.06 | Known | `torenthia/news/torenthia-news-071.html` inline figure + `worldImage` |
| `images/verentum-civic-campus-card.webp` | WEBP | 0.08 | Known | Ref not confirmed |
| `images/Terenne-cIvic-campus.png` | PNG | 3.22 | No indexed match | **Terenne** civic campus (legacy name `verentum-cIvic-campus.png`; uppercase `I` in `cIvic`) — do **not** use as Verentum |
| `images/Terenne-street-level.png` | PNG | 2.22 | Known | `torenthia-state-aldenmere.html` inline figure (legacy name `verentum-street-level.png`) |
| `images/calden-cityscape.png` | PNG | 2.65 | No indexed match | Caldenmere/Calden; reuse candidate (PR #390) |
| `images/dorven-cityscape.png` | PNG | 2.49 | No indexed match | Orath/Dorven; reuse candidate (PR #390) |
| `images/marisvia-cityscape.png` | PNG | 2.68 | No indexed match | Foreign city; Atlas subsection candidate |
| `images/valedon-cityscape.png` | PNG | 2.59 | No indexed match | Foreign city; Atlas subsection candidate |
| `images/caldris-landscape.png` | PNG | 2.71 | No indexed match | Foreign landscape; low-priority |
| `images/sunderland-shoreline.png` | PNG | 1.78 | No indexed match | Conditional foreign context |
| `images/lake-varda-incident.png` | PNG | 2.24 | No indexed match | **HOLD** — event-specific label; verify chronology before use |
| `images/riverglow.png` | PNG | 2.38 | No indexed match | Likely draft/alternative |
| `images/riverglow-alt.png` | PNG | 2.69 | No indexed match | Likely draft/alternative |
| `images/riverglow-3.png` | PNG | 2.83 | No indexed match | Likely draft/alternative |
| `images/riverglow-card.webp` | WEBP | 0.05 | Known | Ref not confirmed |
| `images/ostara.png` | PNG | 3.03 | Not assessed | Ostara master |

> **Rename note:** on 2026-11-24 (commit `9e140618`, PR #398), `verentum-street-level.png`
> and `verentum-cIvic-campus.png` were renamed to `Terenne-*` because both depict
> **Terenne (Aldenmere State capital)**, not the federal capital Verentum. The census
> predates this. Keep legacy filenames in archival references; do not treat these as
> Verentum imagery.

### Ostara civic futures (4) — hold (chronological/canon risk)

| Path | Format | Size | Status | Use / note |
| --- | --- | ---: | --- | --- |
| `images/ostara-civic-plan.png` | PNG | 2.23 | No indexed match | Distinct plan stage; **HOLD** — do not publish out of sequence |
| `images/ostara-civic-proposal.png` | PNG | 3.02 | No indexed match | Proposal stage; **HOLD** |
| `images/ostara-civic-realized.png` | PNG | 2.86 | No indexed match | "Realized" concept; **HOLD** — do not imply it was built |
| `images/ostara-civic-plan-card.webp` / `ostara-civic-proposal-card.webp` | WEBP | 0.05/0.08 | Known | Ref not confirmed |

### Character portraits (26)

**Published / established** (do not replace):

| Path | Format | Size | Status | Use / note |
| --- | --- | ---: | --- | --- |
| `images/Elin-Thoss.png` | PNG | 1.51 | Known | news 027, 029, 033, 035, 036 |
| `images/Elin-Thoss-card.webp` | WEBP | 0.02 | Known | News metadata |
| `images/Elin-Thoss-Press-Conference.png` | PNG | 1.43 | Known | news 041 inline |
| `images/Elin-Thoss-Press-Conference-card.webp` | WEBP | 0.03 | Known | Homepage tour; news 041 metadata |
| `images/Ines-Carrow.png` | PNG | 1.14 | Known | news 002, 006, 028 |
| `images/Ines-Carrow-card.webp` | WEBP | 0.01 | Known | News metadata |
| `images/Seren-Mak.png` | PNG | 0.99 | Known | news 005, 015, 019 |
| `images/Seren-Mak-card.webp` | WEBP | 0.01 | Known | Ref not confirmed |
| `images/Tobias-Vael.png` | PNG | 0.57 | Known | news 001, 011 and others |
| `images/Tobias-Vael-card.webp` | WEBP | 0.02 | Known | Ref not confirmed |

**Unplaced portrait masters** (20 — verify identity in canon before use):

`Aldous-Fenn` · `Aldric-Feyn` · `Corwin-Hale` (journalist/editor) · `Dara-Voss` ·
`Dessa-Orin` · `Halden-Rews` · `Herbert-Sole` · `Ivenne-Casta` · `Kessa-Vray` ·
`Lenne-Akar` (journalist/editor) · `Maren-Sollis` · `Nadia-Sorrel` (former Civic Consul) ·
`Pell-Sandris` (Legat Consul candidate) · `Petra-Vend` · `Renata-Kell` · `Reya-Solt` ·
`Rosalind-kade` · `Thomas-Verel` · `Yelka-Sarn` · `Casimir-Rehn` (outgoing Legat Consul).

All are `images/*.png`, 1.20–2.11 MB, **no indexed reference match**. Names are
established in `_data/worldRegistry.json`; pixels are not. Do not add a journalist's
portrait to a bylined news event by default.

### Other / misc (4)

| Path | Format | Size | Status | Use / note |
| --- | --- | ---: | --- | --- |
| `images/federated-republic-parchment.png` | PNG | 1.51 | Not assessed | Parchment master |
| `images/Federated-Republic-Parchment-card.webp` | WEBP | 0.03 | Known | Carousel fallback |
| `images/living-crossroads.jpg` | JPG | 0.73 | Not assessed | Crossroads feature art |
| `verentum-four-founders-card.webp` (root) | WEBP | 0.31 | Known | Homepage visual tour |

---

## Decision ledger (consolidated)

| Verdict | Assets |
| --- | --- |
| **Retain — active** | All State flags, national flag, maps (`region-map-tier2-temporary.webp`, `world-map-tier1.*`), seal family, all logos in the Record source gallery, published portraits (Thoss, Carrow, Mak, Vael), homepage visual-tour images |
| **Reuse (pending visual review)** | `calden-cityscape.png`, `dorven-cityscape.png`, `Terenne-street-level.png` (State profiles, PR #390); `marisvia-cityscape.png`, `valedon-cityscape.png`, `caldris-landscape.png` (Atlas); `lake-varda-crossing.png` (dossier); `ostara-card.webp` (Solara profile) |
| **Hold** | `torenthia-assembly-chamber.png`, `senate-chamber.png`, `council-of-ministers-meetingroom.png` (replacement pending); Ostara plan/proposal/realized group; `lake-varda-incident.png`; 20 unplaced portraits |
| **Conditional** | `logos/supreme-court-logo.svg` (verify canon before court use) |
| **Do not use as named** | `Terenne-cIvic-campus.png` / `Terenne-street-level.png` (are Terenne, not Verentum) |

## Open work-in-progress (PRs)

| PR | Subject | Status |
| --- | --- | --- |
| #363 | Main inventory draft (documentation only) | — |
| #368 | Ostara image on Solara profile | Unmerged |
| #369 | Lake Varda crossing on dossier | Unmerged |
| #390 | City images on State profiles | Unmerged draft |
| #398 | Terenne filename fix (merged; rename committed) | Merged |

## Known data-quality caveats

1. **Reference status is evidence, not truth.** Zero search hits ≠ unused; dynamic/JS-built
   URLs and `worldImage` metadata are a known blind spot. Pixel, dimension, and rights
   verification remains **unperformed** across the board (binary reads were unavailable in
   prior passes).
2. **File sizes are Git blob bytes** (MiB, base 1,048,576), not deployed transfer size.
3. Most full-size PNGs are 1–3 MB. Reuse should add an optimized WebP derivative and leave
   the master unchanged.
4. This index covers Torenthia and site-identity imagery. A dedicated **general
   constitutional-site** media review was explicitly deferred and is not included here.
