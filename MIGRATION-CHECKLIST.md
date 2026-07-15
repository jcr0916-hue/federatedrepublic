# Phase 4 — Vercel + Eleventy migration

## Result of the local test: PASS, on the whole site

    127 / 127 HTML pages rebuild BYTE-IDENTICAL through Eleventy
    62 assets passed through, none missing
    build: 0.82 seconds
    constitution_data.json correctly NOT in _site (server-side only)
    api/ correctly NOT in _site
    no .md repo docs leaked into the output

## The strategy this proves: migrate in TWO steps, not one

Step 1 puts Eleventy in the pipeline as a **no-op**. Every page passes through untouched
and byte-identical. Nothing is templated yet. If the deploy is green, the machinery —
build, output dir, routes, functions, headers, assets — is proven with ZERO content risk.

Step 2 templatises page types one at a time (news first: 1 base + 4 mastheads + 37
content files, already proven), each verified byte-identical before it ships.

This is strictly better than a big-bang migration, and it is only possible because the
no-op build is lossless. Do not skip step 1.

## What nearly broke it (and would have taken the whole site down)

**Eleventy's default "pretty permalinks"** rewrite `page.html` -> `page/index.html`.
vercel.json routes `/(.*)` -> `/$1.html`. Every URL on the site would have 404'd.
Fixed in eleventy.config.js:

    eleventyConfig.addGlobalData("permalink", () => (data) => `${data.page.filePathStem}.html`);

Confirmed: 127 flat .html files, zero pretty-permalink directories.

## Hard constraints — do not violate

1. **api/ must stay outside Eleventy.** The four functions are built separately by
   @vercel/node. If Eleventy templates them, they break. Enforced by .eleventyignore.
2. **constitution_data.json must stay at the REPO ROOT and out of _site.**
   api/annotate.js and api/navigator.js load it via
       path.join(__dirname, '..', 'constitution_data.json')
   That resolves to the repo root inside the lambda. It is server-side only — no page
   fetches it. If it moves into _site, both AI features break. Enforced by .eleventyignore.
3. **templateFormats: ["html"] only.** The repo root holds 11 .md documents (arc docs,
   plans, this file). Without this, Eleventy would render them as web pages.
4. **Passthrough is not optional.** 18 png, 14 pdf, 2 webp, svg, ico, site.css, nav.js,
   sw.js, map-data.js, search-index.js, 4 json data files, and 2 asset folders. If any is
   missing from _site, every page using it 404s. Verified: 62 copied, none missing.

## Files to add to the repo

    package.json          (name federatedrepublic, "build": "eleventy", type: module)
    eleventy.config.js
    .eleventyignore
    vercel.json           (REPLACES the current one)

vercel.json changes ONE line in builds — the static entry:

    -  { "src": "**/*", "use": "@vercel/static" }
    +  { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "_site" } }

All four @vercel/node entries, all seven routes and all three headers are UNCHANGED.

Also add to .gitignore:

    _site/
    node_modules/

## The branch test — John runs this, Claude cannot

Claude has no push access and cannot watch a Vercel build log. This must happen on your
account.

1. `git checkout -b phase4-test`
2. Add the four files above; add _site/ and node_modules/ to .gitignore
3. `npm install` locally, then `npx @11ty/eleventy` — expect "Copied 62 Wrote 127 files"
4. Commit and push the BRANCH (not main)
5. Vercel auto-creates a preview deployment. Watch the build log for:
   - does `npm install` + `eleventy` run at all
   - build minutes consumed (expect seconds; hobby tier allows plenty)
   - any "no output directory" error -> distDir mismatch
6. On the preview URL, check IN THIS ORDER — first failure tells you what broke:

       /                                  index loads
       /annotated                         extensionless route works  <- the big one
       /torenthia-news-030                a news page
       /site.css                          asset passthrough
       /seal.png                          image passthrough
       /constitution-current.pdf          pdf passthrough
       POST /api/navigator                expect HTTP 400 on empty body (means ALIVE)
       POST /api/crossroads               expect HTTP 400 (404 = the route regressed)
       /src/anything                      expect 404
       response headers                   X-Frame-Options: DENY present

7. If all pass: merge to main. If any fail, the preview is disposable — nothing on the
   live site is at risk. That is the entire point of using a branch.

## Known remaining risk

`require(dataPath)` in the API functions is a DYNAMIC require. Vercel's file tracer
(@vercel/nft) must statically infer it to bundle constitution_data.json into the lambda.
It works today under @vercel/static. Introducing @vercel/static-build should not change
how @vercel/node traces its own inputs — but this is the one thing the local test cannot
prove. Step 6's `/api/navigator` check is what catches it: a 500 instead of a 400 means
the json did not make it into the lambda, and the fix is `includeFiles` in the function
config.

---

## POST-DEPLOY FIX (the preview caught two things)

### 1. "type": "module" broke two API functions — MY BUG

I put `"type": "module"` in package.json so Eleventy's ESM config would load. That flag makes
Node treat EVERY .js file in the project as ESM — and in ESM, `require` is not defined.

    api/navigator.js   const path = require('path');   -> ReferenceError, function dead
    api/annotate.js    const path = require('path');   -> ReferenceError, function dead
    api/crossroads.js  no require()                    -> fine
    api/survey.js      no require()                    -> fine

Perfect correlation, and NOT the one I first diagnosed. I blamed constitution_data.json not
being traced into the lambda, because the two failing functions are also the two that load
it. Coincidence. The real variable was `require()`.

Reproduced locally: a file with `require('path')` under `{"type":"module"}` throws
"require is not defined"; remove the flag and it loads.

**FIX:** drop `"type": "module"` from package.json; rename `eleventy.config.js` ->
`eleventy.config.mjs`. The .mjs extension makes THAT ONE FILE ESM without forcing ESM on the
whole project. Eleventy 3 reads eleventy.config.mjs natively.

Verified after the fix: all four api/*.js load under `node -e "require(...)"`, and the build
is still 127/127 byte-identical against live main.

### 2. includeFiles — keep it, but it was not the cause

The `includeFiles: ["constitution_data.json"]` entries on navigator and annotate are harmless
and arguably correct belt-and-braces: they make the data dependency explicit rather than
relying on Vercel's tracer to infer a computed `require(path.join(__dirname,'..',...))`.
Keeping them. But they did not fix anything — the type:module flag did.

### Lesson

Two functions failed; two worked. I found a variable that split them perfectly
(constitution_data.json) and stopped looking. There was a SECOND variable that split them
identically (require()), and it was the real one. When two hypotheses both explain the data,
the one you introduced yourself this session is the better suspect.
