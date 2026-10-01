# Regional map artwork and coordinate contract

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
| `atlas.html` | Separate 1000 × 563 world-map coordinate system using the current continental artwork. Torenthia sits on the western side of the northwestern continent between the Western Sea and Lake Varda; the Republic hotspot reads the lexical `MAP_DATA` binding and opens Republic at a Glance. The Tier 2 regional map remains the detailed geographic authority where the two scales differ. |
| `torenthia-atlas.html` | Existing redirect to `atlas.html`. |

`tier2-labels.json` and `tier2-borders.json` remain unchanged. `_data/geography.js`
loads those full data sets; `map-data.js` retains its existing simplified border
paths, identical label positions, and tier dimensions. The browser overlays contain
30 State-border paths and seven national-border paths. Korda uses the full 30 State
polylines from the JSON. `_data/statepages.js` still derives percentages and capital
points from the existing labels; no coordinate conversion or migration was needed.

State-crop city captions now sit below their markers to clear nearby State names.
Capital dots and geographic coordinates have not moved. World-map thumbnails and
published article artwork are unchanged.

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
