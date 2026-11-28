# Multimedia technical verification — measured pixels and integrity

**Date:** 2026-11-27 · **Method:** binary read of `main` blobs + Pillow decode (actual pixels), plus direct SVG source parsing. **Tree:** `d5090ab8`.

This closes the gap that every prior multimedia audit recorded as *"pixel verification unperformed."* It reports **measured** values only. Where a file could not be read, it is listed as **not measured** rather than guessed.

## Coverage achieved

| Class | Measured | Total | Coverage |
| --- | ---: | ---: | --- |
| **Card/thumbnail derivatives (`.webp`)** | **15** | **15** | **100%** |
| **SVG files (flags, seal, logos)** | **18** | **18** | **100%** |
| Raster masters (PNG/JPG) | 8 | 62 | 13% |
| **All raster files** | **23** | **80** | 29% |

The unmeasured remainder is almost entirely full-size PNG masters above ~1 MiB, which the read path refuses (`File is too large to display`). Their blob sizes were already established by the 11-22 census; only their pixel dimensions remain unverified.

## Defects found

### 1. Two files are JPEG data with a `.png` extension

| File | Declared | Actual | Dimensions | Size |
| --- | --- | --- | --- | ---: |
| `images/Tobias-Vael.png` | PNG | **JPEG** | 1024×1024 | 593,599 B |
| `images/seal-watermark.png` | PNG | **JPEG** | 1024×1024 | 295,152 B |

Both decode correctly — browsers sniff content type, so this is not a rendering break — but it is a real inconsistency: a `.png` URL serving JPEG bytes, no alpha channel where a PNG name implies one, and a surprise for any optimizer or image pipeline that trusts the extension. `seal-watermark.png` matters most: a *watermark* implying transparency is actually an opaque RGB JPEG.

**Note:** 21 other `.png` files were verified as genuine PNG. The mismatch is limited to these two.

### 2. Card thumbnail aspect ratios are not uniform

All 15 deployed card derivatives, measured:

| Ratio | Count | Files |
| --- | ---: | --- |
| **4:3** (560×420) | **13** | Elin-Thoss · Elin-Thoss-Press-Conference · Federated-Republic-Parchment · Ines-Carrow · ostara · ostara-civic-plan · ostara-civic-proposal · riverglow · seal · Seren-Mak · Tobias-Vael · verentum · verentum-civic-campus |
| **16:9** | **2** | `verentum-four-founders-card.webp` (1400×788) · `world-map-card.webp` (560×315) |

Two cards will crop or letterbox differently from the other thirteen in any grid that assumes one ratio. The 1400×788 one is also **2.5× wider** than its siblings — an outlier in both shape and source resolution.

### 3. Five SVGs have no intrinsic size

These declare only a `viewBox`, so their intrinsic dimensions are undefined and layout must supply them:

`images/seal.svg` (viewBox 500×500, `width="100%"`) · `aldenmere-flag.svg` · `arvane-flag.svg` · `corindal-flag.svg` · `rhovane-flag.svg` (all viewBox 1536×1024)

The other six State flags (`merath`, `orath`) and all seven logos declare explicit `width`/`height`. Mixed intrinsic-sizing behaviour across a flag family is a latent CLS/`object-fit` risk.

### 4. Flag aspect ratios split into two families

| Ratio | Count | Files |
| --- | ---: | --- |
| **3:2** (1536×1024, 900×600) | **7** | National flag (900×600) + `aldenmere`, `arvane`, `corindal`, `merath`, `orath`, `rhovane` |
| **25:16** (150×96) | **3** | `proposal-a`, `proposal-b`, `proposal-c` |

The adopted flags are a consistent 3:2. The three archived **proposals** are 150×96 = **1.5625**, a different ratio — and at only 150×96 they are **far too small to enlarge** to a flag-sized display without blurring. If the proposals are ever shown beside adopted flags, they must be redrawn as vectors at 3:2, not upscaled.

### 5. Portraits are square 1024×1024

Verified portraits (2 of 26): `Tobias-Vael.png` and `Seren-Mak.png`, both **1024×1024 RGB**. Square is fine for avatars, but it is **not** the 4:3 of the card derivatives cut from them — so a portrait-to-card crop discards roughly the top and bottom quarter. Confirm the crop centres the face before assuming the card is a faithful reduction.

## Measured inventory

### Cards — complete (15/15)

| File | W×H | Ratio | Bytes |
| --- | ---: | ---: | ---: |
| `Elin-Thoss-card.webp` | 560×420 | 1.333 | 25,666 |
| `Elin-Thoss-Press-Conference-card.webp` | 560×420 | 1.333 | 31,324 |
| `Federated-Republic-Parchment-card.webp` | 560×420 | 1.333 | 27,314 |
| `Ines-Carrow-card.webp` | 560×420 | 1.333 | 9,304 |
| `ostara-card.webp` | 560×420 | 1.333 | 88,642 |
| `ostara-civic-plan-card.webp` | 560×420 | 1.333 | 51,774 |
| `ostara-civic-proposal-card.webp` | 560×420 | 1.333 | 87,668 |
| `riverglow-card.webp` | 560×420 | 1.333 | 47,706 |
| `seal-card.webp` | 560×420 | 1.333 | 28,790 |
| `Seren-Mak-card.webp` | 560×420 | 1.333 | 10,788 |
| `Tobias-Vael-card.webp` | 560×420 | 1.333 | 23,402 |
| `verentum-card.webp` | 560×420 | 1.333 | 63,002 |
| `verentum-civic-campus-card.webp` | 560×420 | 1.333 | 81,500 |
| `world-map-card.webp` | 560×315 | **1.778** | 76,478 |
| `verentum-four-founders-card.webp` | 1400×788 | **1.777** | 320,330 |

### Other raster measured (8)

| File | Format | Real container | Mode | W×H | Ratio | Bytes |
| --- | --- | --- | --- | ---: | ---: | ---: |
| `images/Tobias-Vael.png` | PNG | **JPEG** | RGB | 1024×1024 | 1.0 | 593,599 |
| `images/Seren-Mak.png` | PNG | PNG | RGB | 1024×1024 | 1.0 | 1,038,482 |
| `images/seal-watermark.png` | PNG | **JPEG** | RGB | 1024×1024 | 1.0 | 295,152 |
| `images/apple-touch-icon.png` | PNG | PNG | RGBA | 180×180 | 1.0 | 77,715 |
| `images/favicon-32.png` | PNG | PNG | RGBA | 32×32 | 1.0 | 3,120 |
| `images/world-map-tier1.jpg` | JPG | JPEG | RGB | 1672×941 | 1.777 | 827,814 |
| `images/living-crossroads.jpg` | JPG | JPEG | RGB | 1536×1024 | 1.5 | 760,936 |
| `images/region-map-tier2-base.webp` | WEBP | WEBP | RGB | 1536×1024 | 1.5 | 518,372 |

> `world-map-tier1.jpg` at **1672×941** does not share the 1536×1024 shape of `region-map-tier2-base.webp` or `living-crossroads.jpg`. All are RGB, none has an alpha channel.

### SVG — complete (18/18)

| File | viewBox | Declared W×H | Ratio | Intrinsic size? |
| --- | --- | --- | ---: | --- |
| `images/seal.svg` | 500×500 | `100%`/`100%` | 1.0 | **No** |
| `aldenmere-flag.svg` | 1536×1024 | — | 1.5 | **No** |
| `arvane-flag.svg` | 1536×1024 | — | 1.5 | **No** |
| `corindal-flag.svg` | 1536×1024 | — | 1.5 | **No** |
| `rhovane-flag.svg` | 1536×1024 | — | 1.5 | **No** |
| `merath-flag.svg` | 1536×1024 | 1536×1024 | 1.5 | Yes |
| `orath-flag.svg` | 1536×1024 | 1536×1024 | 1.5 | Yes |
| `images/flags/torenthia-four-founders.svg` | 900×600 | 900×600 | 1.5 | Yes |
| `images/flags/proposal-a-federal-union.svg` | 150×96 | 150×96 | 1.5625 | Yes |
| `images/flags/proposal-b-constitutional-republic.svg` | 150×96 | 150×96 | 1.5625 | Yes |
| `images/flags/proposal-c-new-republic.svg` | 150×96 | 150×96 | 1.5625 | Yes |
| `logos/nrs-logo.svg` | 560×420 | 560×420 | 1.333 | Yes |
| `logos/rnn-logo.svg` | 560×420 | 560×420 | 1.333 | Yes |
| `logos/supreme-court-logo.svg` | 560×420 | 560×420 | 1.333 | Yes |
| `logos/the-dorven-ledger-logo.svg` | 560×420 | 560×420 | 1.333 | Yes |
| `logos/the-korda-press-logo.svg` | 560×420 | 560×420 | 1.333 | Yes |
| `logos/the-torenthian-logo.svg` | 560×420 | 560×420 | 1.333 | Yes |
| `logos/tnb-logo.svg` | 560×420 | 560×420 | 1.333 | Yes |

All seven publisher logos are **uniformly 560×420 (4:3)** — a consistent set. Every SVG validates as well-formed and every one carries `role="img"` with `aria-labelledby` to a `<title>` and `<desc>`; the flags also have descriptive alt text, which is a genuine accessibility strength.

## Not measured (and why)

**57 raster files** were unreadable at this path (all reported >1 MiB). They remain size-known from the census but dimension-unknown:

- 24 of 26 portraits (all except Tobias-Vael, Seren-Mak)
- all cityscapes: calden, dorven, marisvia, rhondel, valedon, Terenne (street-level and civic campus)
- landscapes: caldris, varek-mountain, sunderland, lake-varda-crossing, lake-varda-incident, riverglow ×3
- institutions: assembly, senate, council-of-ministers
- civic: ostara, ostara-civic-plan/proposal/realized
- `verentum.png`, `seal.png`, `federated-republic-parchment.png`
- 6 State flag PNGs, `assets/world-map-tier1-source.png`
- `region-map-tier2-temporary.webp` (the live context map), `world-map-tier1.webp`

To finish the remaining 57, a clone or CI job with filesystem access is required; the API read path caps at ~1 MiB.

## Recommended follow-ups

| Priority | Action | Rationale |
| --- | --- | --- |
| 1 | Rename or re-encode `seal-watermark.png` and `Tobias-Vael.png` | Content/extension mismatch; the watermark especially implies transparency it does not have |
| 2 | Decide one card ratio; re-cut `world-map-card` and `verentum-four-founders-card` to match, or make the grid ratio-agnostic | 13 of 15 cards share 4:3; two do not |
| 3 | Add explicit `width`/`height` to the 5 viewBox-only SVGs | Prevents layout shift on the seal and four State flags |
| 4 | Do **not** upscale the 150×96 flag proposals | Too small to enlarge; redraw as vectors at 3:2 if reused |
| 5 | Confirm portrait→card crop centres the face | 1024×1024 source into 4:3 card discards ~25% of height |
| 6 | Complete the 57 unmeasured masters via a clone/CI job | Needed before any dimension-dependent optimisation |

None of these is a publication blocker. Items 1–3 are low-risk, independently reviewable fixes; item 4 is a caution against a plausible-looking but damaging reuse.

## Validation trace

- Binary read via repository contents API; decode and measurement with Pillow 11 (raster) and direct XML parsing (SVG). `Image.load()` forced full decode to surface truncation — **zero corrupt or truncated files** among the 23 measured.
- Every measured file's magic bytes were checked against its extension; the two mismatches above are the only deviations.
- Network fetch was unavailable in this environment, so no raw.githubusercontent download was used; all bytes came through the repository read path.
