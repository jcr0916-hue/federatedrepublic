# Public asset deployment

GitHub is the full source/master library. `_site` is the public deployment, not a
copy of that library. Never delete a useful master merely to reduce deploy size.
This is an internal build optimization; it does not warrant a public update entry.

## Build contract

`npm run build` cleans the generated `_site` directory, then runs Eleventy. After
Eleventy renders HTML and completes ordinary runtime passthrough, the asset
collector in `scripts/public-assets.mjs` follows the public reference graph and
fails the build on unresolved local references. It copies files without rewriting
or recompressing them. Existing Vercel routes and API function bundling are unchanged.

URL mappings remain:

- `images/example.png` → `/example.png` (including any subdirectories).
- `logos/example.svg` → `/logos/example.svg`.
- `pdf/example.pdf` → `/example.pdf`.

Graph roots are rendered HTML, explicit passthrough runtime files, and the small
protected list in `scripts/protected-assets.json`. CSS imports and `url()`, HTML
attributes (including responsive sources, social images, and inline fallbacks),
inline/external JavaScript literals, HTML assembled as JavaScript strings, JSON,
and SVG dependencies are followed recursively. Queries, fragments, URL encoding,
and same-site absolute URLs are normalized without changing the deployed URLs.
External URLs, data URLs, and Vercel `/api/` endpoints are not local static files.
Public HTML links and service-worker page dependencies are also checked.

Templates and live data are covered by the rendered output, rather than scanning
all repository text. Eleventy's public-page collection additionally supplies
string metadata fields ending in `image`, `asset`, `icon`, or `poster`, including
`worldImage`; feed pagination cannot strand those images. `docs/**` and
`scripts/**` cannot become public templates. Internal Markdown, archive notes,
unconsumed data, and unused includes do not select deployment assets. Public
history/download pages remain public and keep their referenced documents.

Runtime filename template literals and concatenations with recognizable asset
suffixes are conservatively expanded against the available filename inventory.
A family with no matches fails validation. Arbitrary runtime computation cannot
be statically predicted: if code computes a URL without a recognizable filename
pattern, add its possible public paths to `scripts/protected-assets.json`. Prefer
literal filename maps or explicit metadata for new runtime features. The current
site's browser scripts live at the public root; review relative URL bases when
introducing scripts in subdirectories.

The protected list preserves implicit favicon requests, seals, both world-map
formats, map infrastructure, and the service worker plus its dependencies.
Existing explicit runtime passthrough remains in place, including JSON and
historical downloads. Logos and PDFs are collected when referenced, like images.
No source library files are edited or removed by the collector.

## Validation and maintenance

- `npm run build` — clean production build, collection, and validation.
- `npm run check:assets` — validate the existing output without repairing it.
- `npm run test:assets` — parser/graph regression tests and an integration test
  using the actual Eleventy configuration, including front matter and docs exclusion.
- `npm run stats:assets` — exact output/image bytes, file counts, and ten largest files.

The build writes `.cache/public-assets.json` outside the deployment. This ignored
manifest lets the standalone validator also check front-matter-only assets after
Eleventy has stripped the metadata. A missing manifest requires a fresh build.
The collector prunes unused known library destinations from repeated builds;
production must use the clean `npm run build` command so deleted pages and assets
cannot survive from older output. Full builds are the verification authority,
rather than incremental preview output.

Continue running the existing consistency, constitutional-site, scenario, and
constitution-PDF validators. The PDF check requires Python's `pypdf` package.

## Measured result — 2026-09-14

Baseline: unmodified GitHub `main` at
`dc2a0c2f30840c5e0fe9f4813fb909515d18350d`, built in a separate checkout.
Numbers are sums of file bytes, not filesystem block allocation or compressed
transfer sizes. Image totals include raster images, SVG, and ICO. These measure
`_site`, not Vercel function bundles or historical deployment retention.

| Metric | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Total bytes | 119,733,146 | 20,304,105 | 99,429,041 (83.04%) |
| Total files | 298 | 244 | 54 |
| Image bytes | 111,584,644 | 12,155,603 | 99,429,041 (89.11%) |
| Image files | 81 | 27 | 54 |
| Public HTML pages | 194 | 194 | 0 |

All 244 retained output files have identical SHA-256 checksums to the baseline,
including every public HTML page and all retained runtime files and downloads.
The source image/logo/PDF library is unchanged. Of its 93 files, 39 deploy.
An independent filename search found no removed image/logo named in built
HTML/CSS/JS/JSON/SVG. All four existing validators and all asset tests pass.
The production build and standalone validator check 242 unique referenced or
protected paths, including public page links and front-matter-only assets.

Largest remaining deployed files:

| Public file | Bytes |
| --- | ---: |
| `seal.png` | 2,064,370 |
| `Elin-Thoss.png` | 1,588,410 |
| `Elin-Thoss-Press-Conference.png` | 1,499,588 |
| `varek-flag.png` | 1,233,316 |
| `harren-flag.png` | 1,213,652 |
| `Ines-Carrow.png` | 1,192,601 |
| `Seren-Mak.png` | 1,038,482 |
| `Tobias-Vael.png` | 593,599 |
| `region-map-tier2-base.webp` | 518,372 |
| `quicksheet-article-2.pdf` | 497,943 |
