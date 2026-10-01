# Atlas and regional map artwork and coordinate contract

The temporary Torenthia base is the uploaded `ChatGPT Image Sep 26, 2026, 01_13_40 PM.png`,
pending the Gaea replacement. It is presentation artwork; the swap does not change canon.

## Current asset

- Source PNG: 1536 × 1024, SHA-256 `90b257bcd4934fc0416e285723fb74624649c2e9f8c2d264c4899c60d4f7bda0`.
- Repository: `images/region-map-tier2-temporary.webp`.
- Public URL: `/region-map-tier2-temporary.webp`.
- Encoding: lossless WebP, 2,158,954 bytes; decoded RGB pixels verified identical to the PNG.
- WebP SHA-256: `2277ff3803af15fab7e3e3df73e69a0bee1bfe896f59e506f997722fc2c25ddd`.
- Shared template reference: `geography.baseImage` in `_data/geography.js`.

The existing asset collector finds the image in rendered HTML and SVG and publishes
it at the root URL. No collector, deployment, or service-worker change is required.
The new filename avoids the service worker's cache-first copy of the previous image.
The previous `images/region-map-tier2-base.webp` is retained, including its protected
public URL. To restore the previous artwork, change `geography.baseImage` back to
`region-map-tier2-base.webp` and rebuild.

## Views and coordinates

| View | Artwork and coordinate behavior |
| --- | --- |
| `republic-at-a-glance.html` | Full 1536 × 1024 image and SVG, scaled together; four State links and ten activity markers retain their percentages. |
| `torenthia.html` | Shared regional image under the existing SVG in a 3:2 frame. |
| `_includes/state-profile.njk` | Harren, Varek, Norvane, and Kelvant use the same image. Existing 520 × 320 viewBoxes remain centered on their State labels. |
| `dossier-korda.html` | Existing `1030 425 430 425` viewBox, State borders, labels, and Rhondel marker. |
| `atlas.html` | Separate 1672 × 941 continental world-map canvas. Torenthia sits between the Western Sea and Lake Varda on the northwestern continent. Its native map link opens Republic at a Glance; build and browser both read the Tier 1 coordinate contract. The Tier 2 regional map remains the detailed geographic authority where the two scales differ. |
| `torenthia-atlas.html` | Existing redirect to `atlas.html`. |

`tier2-labels.json` and `tier2-borders.json` remain unchanged. `_data/geography.js`
loads those full data sets; `map-data.js` retains its existing simplified border
paths, identical label positions, and Tier 2 dimensions. The browser overlays contain
30 State-border paths and seven national-border paths. Korda uses the full 30 State
polylines from the JSON. `_data/statepages.js` still derives percentages and capital
points from the existing labels; no regional coordinate conversion or migration was needed.

State-crop city captions now sit below their markers to clear nearby State names.
Capital dots and regional geographic coordinates have not moved. The temporary
regional swap did not change world-map thumbnails or published article artwork.

## Continental world map — accepted October 1, 2026

The accepted image is the user's `ChatGPT Image Oct 1, 2026, 07_10_50 AM.png`,
supplied after the original `fantasy_atlas_of_caldris_and_beyond.png` handoff.
It contains Torenthia, Caldris, Sunderland, Lake Varda, and Valedon on the
northwestern continent, with the "Korda Frontier" label absent. Preserve this
artwork as a continental overview. Torenthia's Tier 2 map, political overlays,
State crops, and city coordinates remain the detailed geographic authority;
the Atlas caption and accessible description both explain that relationship.

| Repository asset | Dimensions | Bytes | SHA-256 |
| --- | --- | --- | --- |
| `assets/world-map-tier1-source.png` | 1672 × 941 | 2,635,758 | `2614f3c8408e5bfa3b4f9f09c0c5b58998ff637a2a6234c4e0c53ee5a781b7cf` |
| `images/world-map-tier1.webp` | 1672 × 941 | 2,049,944 | `04146920aed5405492fa88040636901f6be7dc371ce002f494af85ee96a3d072` |
| `images/world-map-tier1.jpg` | 1672 × 941 | 827,814 | `b08e01e1ed04741bd59e90b65194a585d7986c1b96a8fdaf0d9307c5e7bc0c91` |
| `images/world-map-card.webp` | 560 × 315 | 76,478 | `f6114e1c14fc2b99c6ab64b7c1f9afd575be4d8dbea4c9c37686022bfbb7d59b` |

The master PNG is an exact copy of the supplied file. It stays in Git's source
library and is excluded from the public asset graph. The full WebP is lossless;
its decoded RGB pixels were verified identical to the source. The JPG uses
quality 95, 4:4:4 subsampling, and optimized encoding. The card resizes the full
extent with Lanczos to 560 × 315 (the height rounded to a whole pixel), then
encodes WebP at quality 92. No derivative crops or repaints the artwork.

`MAP_DATA.tier1` now uses the image's actual 1672 × 941 canvas. The Torenthia
hotspot is `(304, 328)`, below its painted name, with descriptive radii `(104, 97)`.
The displayed link has a 55 × 55 CSS-pixel target; the radii do not draw political
boundaries or scale the target. `_data/atlas.js` reads the same JSON contract for
image dimensions and initial link percentages, so the native anchor works before
JavaScript loads and when scripting is disabled. The browser can refresh its
position from the lexical `MAP_DATA` binding. The short tooltip appears only on
hover or keyboard focus to keep the map's place names clear.

The existing public URLs `/world-map-tier1.webp`, `/world-map-tier1.jpg`, and
`/world-map-card.webp` remain available. Every internal Atlas and card reference
uses `?v=2614f3c8408e`, derived from the accepted PNG's checksum. This creates fresh
image cache keys even under the already-installed cache-first service worker.
The JPG error fallback uses the same version. Card front matter, the curated
update feed, and the inline conference article image all use the new reference;
article text, fictional dates, and constitutional sources are unchanged.
The asset collector normalizes queries to the same files without publishing
the master PNG. On a future artwork change, replace all derivatives together,
update the query version and this table, and review Tier 1 coordinates again.

The two abandoned base64 chunks are removed. Their partial content remains
recoverable from commits `c8f7e156c802b05968fc84354751e6e5cbb9b724` and
`705d15c0b557cfc1f60b28f0d27743b7528b8ab8`; ordinary binary Git commits carry the
complete source and derivatives. The branch began at main
`7a10fb75a3d150993c4655c0cc05f8c5c5a82ea0`.

Before publishing any subsequent map replacement, run `npm run world:publish-check`,
`npm run check:assets`, and `git diff --check`; wait for GitHub and Vercel checks
on the final commit. Inspect desktop and phone previews, keyboard/pointer and
no-script navigation, JPG fallback, and a returning visitor with an older map in
cache. Verify the regional map and every regional coordinate remain unchanged.

## Alignment limits and Gaea follow-up

The two regional images share the same canvas and broadly corresponding landforms.
This preserves registration of the overlay layers, but neither image has surveyed
georeferencing. Existing political lines and city points remain authoritative for
this presentation; painting details do not establish new boundaries or locations.

- Rhondel's existing point `(1180, 610)` is inland from the painted western shore of
  Lake Varda. A precise waterfront location needs an approved coordinate, not an
  inferred shift of the city or the whole overlay.
- Coast-facing border endpoints and river-adjacent national lines are approximate
  against the detailed artwork. Review individual control points when Gaea is ready;
  an automatic global translation or scale would displace other aligned features.
- Korda's competing petition boundaries and Varenne Station have no separate geometry
  in the existing data. The dossier's limitation caption is retained.
- The full overview remains dense on phones. State crops and the jurisdiction
  directory provide the existing readable alternatives; no new zoom system was added.

For the Gaea replacement, export the same uncropped 3:2 extent and orientation at
1536 × 1024. Do not directly substitute a square heightmap or padded 2048 × 2048
export. If the extent changes, register the artwork to known control points first
or explicitly review a transformation across every overlay and crop. Use another
new asset filename, change `geography.baseImage`, and rebuild to avoid stale images.

## Verification for the temporary swap

`npm run world:publish-check` passed all 99 tests, the 235-page build, discovery,
176-provision constitutional checks, and all 52 scenario checks. After adjusting
city captions, the production build, asset check, discovery check, and whitespace
check passed again. The collector validates 300 referenced/protected assets.

Browser verification covered the overview, hub, Korda, Atlas hotspot, and all four
State crops. Desktop (1280 px) and phone (390 px) checks confirmed matching image/SVG
bounds, retained crop coordinates, no horizontal page overflow, and no State/capital
caption collisions. Activity clicks, keyboard activation, and the State profile link
worked. No browser errors or warnings were reported. The geography data, constitutional
sources, statistics, and all 137 published World records were unchanged.
