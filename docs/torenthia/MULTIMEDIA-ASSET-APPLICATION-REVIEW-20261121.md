# Torenthia media audit — coverage and next decisions

**Audit date:** 2026-11-21 · **Status:** SOURCE-VERIFIED PLACEMENTS / VISUAL FILE REVIEW INCOMPLETE · **Existing inventory:** [initial inventory](MULTIMEDIA-INVENTORY-20261120.md), [reuse audit](MULTIMEDIA-ASSET-REUSE-AUDIT-20261120.md), [placement audit](MULTIMEDIA-PLACEMENT-AUDIT-20261121.md).

## Scope and editorial rule

This pass is **about what imagery Torenthia has, whether it is placed appropriately, and what additions are actually justified**. Torenthia is the fictional demonstration of the project's Constitution. It is allowed its own varied multimedia styles. Images do not need to be uniform, photorealistic, or present on every article. An image should orient, explain, identify, or show something that the text does not adequately convey.

**Evidence limitation:** I verified page-source references using the GitHub connector and inspected live site text where accessible. I could not complete an actual visual image-quality review: local Git network resolution failed, the GitHub file connector rejects directory listings and some binary files, the Vercel deployment file-tree API returned 404, and the web image fetch did not yield actual pixels. **No claim about sharpness, image composition, distortion, or actual current render is warranted.** This is not a completed all-assets directory inventory or a screenshot review.

## Inventory of identified assets, by application and function

| Group | Specific assets/sources | Where used | Function | Decision |
| --- | --- | --- | --- | --- |
| Torenthia context and political geography | `region-map-tier2-temporary.webp`, sourced from `_data/geography.js` | `torenthia.html`, State profiles via `_includes/state-profile.njk`, `republic-at-a-glance.html` | Locate States, Territories, borders and capitals | **Retain and visually verify**. The filename says temporary, not that the map is wrong; check accuracy before replacement |
| Wider atlas | `world-map-tier1.webp`, `world-map-tier1.jpg` fallback | `atlas.html` | World/neighbor perspective | **Retain; verify** responsive map controls and fallback |
| Capital visual | `verentum-four-founders-card.webp` (root-level repo asset path probe) | Torenthia landing visual tour | Federal-capital sense of place | **Retain/reuse candidate**; no new capital image needed now |
| Rhondel visual | `images/rhondel-cityscape.png` (repository presence verified) | Torenthia landing visual tour | Lake-region State seat identity | **Retain/reuse candidate**, verify crop |
| Lake crossing | `images/lake-varda-crossing.png` (repository presence verified) | Torenthia landing visual tour | Lake Varda geography and crossing context | **Reuse candidate** for dossier; verify it does not misrepresent the specific crossing in that dossier |
| Varek landscape | `images/varek-mountain-landscape.png` (repository presence verified) | Torenthia landing visual tour | Varek regional character | **Retain/reuse candidate**, don't commission redundant scenery |
| Ostara visual | `images/ostara-card.webp` (repo binary path appears to exist; decoder cannot open) | Torenthia landing visual tour | Solara territorial city identity | **Reuse candidate** for `territory-solara.html`; visually inspect |
| Elin Thoss image | `images/Elin-Thoss-Press-Conference-card.webp` (repo binary path appears to exist; decoder cannot open) | Torenthia landing visual tour | Connect federal officeholder to public record | **Retain/reuse candidate**, check continuity |
| Newspaper and record logos | `logos/the-torenthian-logo.svg`, `logos/rnn-logo.svg`, `logos/nrs-logo.svg`, `logos/the-dorven-ledger-logo.svg`, `logos/the-korda-press-logo.svg`, `logos/tnb-logo.svg` | `torenthia-record.html` related media tour | Differentiate press, broadcasting, government record | **Retain**: purposeful, no need to substitute generic news imagery |
| State flags | `corindal-flag.svg`, `caldenmere-flag.png`, `varek-flag.png`, `kelvant-flag.png`, `orath-flag.svg`, `arvane-flag.svg` | State front matter via shared `_includes/state-profile.njk` | State identity | **Retain**, actual file and layout quality still to inspect; do not mark pages image-free |
| State locator maps | Shared SVG/image region crop `geography.baseImage` | Shared State-profile template; Korda dossier map variant | Explain political geography | **Retain**, validate small-screen labels |
| Published example of inline article art | `verentum-card.webp` | `torenthia/news/torenthia-news-071.html`: `worldImage` AND inline `<figure><img>...<figcaption>` | Establish setting of rail story | **Reference example** for purposeful article image placement |
| Published metadata-only image | `world-map-card.webp?v=2614f3c8408e` | `torenthia/news/torenthia-news-067.html`: `worldImage`, no inline figure | Possible metadata/social artwork | **Verify** how/where it is actually displayed |
| Website-wide seal | `seal.png`, `seal.svg`, `seal-watermark.png` | Main constitutional-site branding and protected asset list | Main project identity, not a Torenthia news illustration | **Defer** to later, separate general-site review |

The first seven identity images, six publisher logos, six examined State flags, major maps and two article-image examples are **identified**, not the entire filesystem inventory. Do not extrapolate a total master-image count.

## Placement decisions by page

| Page/surface | Source-backed status | Is use appropriate? | Specific next action |
| --- | --- | --- | --- |
| Torenthia landing / context map | Map is embedded in opening orientation section | **Yes, strong function** — locates the fictional Republic | Verify geographic labels and mobile crop |
| Torenthia landing / Faces & Places | Six configured media cards, each connected to a place, issue or person | **Yes, purposeful selection** | Verify each asset renders and leads to correct destination |
| The Record / Source gallery | Six configured logos | **Yes, editorial identity** | Verify legibility at small widths |
| The Record / ordinary cards | Shared `_includes/record-card.njk` has no media slot | **Appropriate for scanning**; do not force all cards to be illustrated | Optionally add *one featured story media variant* after a useful news image exists |
| State profiles | `stateFlag` plus template-derived regional map | **Yes, useful identity + geography** | Inspect exact rendered crop before suggesting additional State artwork |
| Solara territory | `territory-solara.html` is text-and-links with no direct image, despite an Ostara visual already in Torenthia's tour | **Possible missed reuse** | First candidate to add a *reused* place image, but check visual quality and contextual accuracy |
| Morantine territory | Text-and-links; no direct image | **Potential geographic gap** | Prefer existing political map with Tessom context, not a generic scenic photo |
| Lake Varda dossier | Text-first, no image in source | **Potential missed reuse** | Consider existing crossing image/map if directly related; verify geography before inclusion |
| Korda dossier | SVG regional crop/map | **Already functional** | Inspect borders, scale and readability before new map |
| News 136–143 | None of these eight source files defines article-level images | **Not automatically deficient** | Prioritize only the few stories where place or process adds value: 143, 141, 142 |
| NRS 152–159 | None of these eight source files defines article-level images | **Usually appropriate** for documentary text | Keep mostly image-free; accessible tables only when an exact published schedule demands them |
| Atlas | Has world map and JPEG fallback | **Already useful** | Inspect visual quality, responsive behavior and map navigation |

## Practical next action, not image production

1. **Verify actual pixels and dimensions**, especially the maps and six landing images. Use a repository filesystem clone or an authorized file/browser environment that can read binary images. Record `file path / dimensions / file bytes / usage / thumbnail / copyright provenance / visual-quality decision`. The last three are *not known yet*.
2. Make **no image generation decision** until determining whether an existing relevant asset can be reused for the selected page.
3. If the actual images check out, trial **one reuse-only placement** (Ostara image on Solara profile OR Lake Varda crossing on the appropriate dossier), in a separate feature branch with no prose/canon changes.
4. Consider a single accessible process diagram for §12.2/§12.6, but only if it **adds insight beyond the text** (e.g., shows jurisdictional separation and unresolved decisions; not a decorative summary panel).
5. Keep editorial imagery style flexible. The user rejected the painterly waterfront proof as a news image; do not ship that draft.
6. Do not extend this audit into the general constitutional site until the Torenthia inventory/reuse judgment is satisfactory.

## Source reliability

The web-crawled text for `torenthia.html` showed older featured stories than the current GitHub source frontier. **GitHub `main` is the source-of-truth for page references; a crawler's cached text is not proof of the latest site visuals**. The image collector's rules are in `docs/ASSET-DEPLOYMENT.md`.

### Pass/fail checkpoints for later implementation

- First compare source image bytes with referenced URLs after build.
- If change is useful, use an isolated development branch and review PR.
- Run `npm run build`, `npm run check:assets`, `npm run world:publish-check`.
- Inspect mobile and desktop screenshots for cropped faces, labels, aspect ratios and balance.
- Do not merge/deploy/advance constitutional or Torenthia canon autonomously.
