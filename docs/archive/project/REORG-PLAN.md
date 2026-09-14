# Repository Reorganization — Plan

**Status:** queued for weekend. Mechanics verified 13.09 (Tuesday); file inventory to be finalized
Friday once the rest of the week's content is in.

**Problem:** 277 files at repo root (146 html, 53 png, 28 webp, 14 md, 13 pdf, 7 json, 4 js, 1 svg,
1 jpg). Navigating and finding anything is getting genuinely difficult.

---

## THE HAZARD, AND WHY IT'S THE WHOLE PROBLEM

`eleventy.config.mjs` sets a global permalink rule:

```js
eleventyConfig.addGlobalData("permalink", () => (data) => `${data.page.filePathStem}.html`);
```

`filePathStem` includes the folder path. So moving `torenthia-news-046.html` into `world/`
changes its output URL from `/torenthia-news-046.html` to `/world/torenthia-news-046.html`.

**That would break:**
- Every social post already published to X, Bluesky, and Facebook. X posts CANNOT be edited after
  posting — those links would 404 permanently. This is the irreversible one.
- Internal links across ~70 world pieces (each has prev/next nav)
- `_data/updates.js` hrefs (hero feed)
- `search-index.js` hrefs
- Any external links or bookmarks

Same problem for images: passthrough globs are root-only (`*.png`, `*.webp`, etc.), and every
`src=` reference across the site points at a flat root path.

---

## THE TWO MECHANISMS (both tested and verified working, 13.09)

### 1. Images / PDFs / static assets — passthrough remap

```js
eleventyConfig.addPassthroughCopy({ "images": "." });
eleventyConfig.addPassthroughCopy({ "pdf": "." });
```

Source file at `images/casimir-rehn.png` outputs to `_site/casimir-rehn.png`. Folder in source,
flat in output, **URL unchanged**.

VERIFIED: test build confirmed `images/test.png` → `_site/test.png`.

### 2. HTML pages — front-matter permalink override

```yaml
---
permalink: /torenthia-news-046.html
---
```

Front-matter data beats global data in Eleventy's cascade, so this overrides the `filePathStem`
rule. Source file at `world/torenthia-news-046.html` outputs to `_site/torenthia-news-046.html`,
**URL unchanged**.

VERIFIED: test build confirmed `world/test-page.html` with `permalink: /test-page.html` →
`_site/test-page.html`, overriding the global rule.

---

## THE SAFETY NET — non-negotiable

**Build `_site` before the move. Build `_site` after. Diff them.**

If `_site` is byte-identical before and after, then nothing broke — not one URL, not one image
reference, not one link. This turns "I think this is safe" into "this is provably safe."

```bash
# before
npx @11ty/eleventy && mv _site _site_before
# ...do the reorganization...
npx @11ty/eleventy && diff -r _site_before _site
# expect: no output
```

Any diff output = something moved that shouldn't have. Fix before pushing.

---

## PROPOSED STRUCTURE (finalize Friday)

```
/
├── world/                   ~70 news / nrs / dispatch pieces
├── pages/                   index, torenthia, atlas, annotated, glossary,
│                            quicksheets, changelog, constitutional-history, etc.
├── images/
│   ├── portraits/           character portraits + -card.webp versions
│   ├── places/              cityscapes, landscapes, maps
│   └── site/                seal, favicon, parchment, icons
├── pdf/                     13 PDFs
├── docs/                    14 .md working docs (threads, canon, plans)
├── State Constitutions/     (exists)
├── _data/  _includes/  api/  logos/  scripts/   (exist)
└── [root]                   config files only: package.json, vercel.json,
                             eleventy.config.mjs, constitution_data.json, sw.js,
                             site.css, nav.js, search-index.js, map-data.js
```

Note: some root files MUST stay at root — `vercel.json`, `package.json`, `eleventy.config.mjs`,
and anything the passthrough list names directly. `constitution_data.json` is referenced by
`vercel.json`'s `includeFiles` for the API functions; moving it means updating that too.

---

## PHASED APPROACH — recommended order

**Phase 1 (low risk, high payoff): images, PDFs, .md docs.**
~107 of 277 root files. No front matter needed — just move + two config lines. `.md` docs aren't
served at all (`templateFormats: ["html"]`), so they can move freely with zero URL implications.
Prove the pattern here with the `_site` diff before touching anything riskier.

**Phase 2 (real work): HTML.**
146 files, each needing a `permalink:` line. Two sub-cases:
- World pieces already have front matter → add one line to the existing block
- Site pages may have no front matter → need a new block added

Scriptable, but verify the diff carefully — this is where breakage would actually happen.

**Phase 3 (optional): sub-organizing images/** into portraits/places/site.
Pure source-side tidying; passthrough remap means output is unaffected either way.

---

## DELIVERY MECHANISM

Claude does not have push access. Delivery is: Claude reorganizes locally, verifies the `_site`
diff is clean, then delivers a zip **with correct folder structure preserved** — John unpacks over
the repo and pushes.

Zip must contain real directories, not filenames with slashes in them (learned the hard way on the
atlas `_data/` delivery).

---

## TO DECIDE FRIDAY

1. Final file inventory (Wed/Thu/Fri content will add ~6 more files)
2. Whether Phase 2 (HTML) is worth doing at all, or whether Phase 1 solves enough of the problem
3. Whether `pages/` is a useful split or whether site pages should stay at root since there
   are relatively few of them
4. Whether to sub-organize `images/` now or later
