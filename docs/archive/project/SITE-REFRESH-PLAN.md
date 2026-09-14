# Site Refresh & Maintainability — Game Plan
*Planning doc for the eventual site refresh. Not launch-window work — begins AFTER the crossroads window settles. Written so any Claude instance can resume cold. Placed in repo so it survives context compaction / new chats.*

---

## WHY THIS EXISTS (the diagnosis)
The site works and looks consistent, but it is **maintained by repetition, not shared structure.** Every new feature means touching many pages. The refresh makes it maintainable so growth stops compounding the "taped together" tape. Plus a visual pass to fix the "academic library page" feel, and content cleanup.

### Status snapshot (as of planning, ~Y13M7 launch window)
- **126 HTML pages**: 44 scenarios, 37 news, 11 NRS, 13 quicksheets, 2 dispatches, plus core pages.
- **1 shared `site.css`** — good foundation — but 121/126 link it; 5 don't (404.html, crossroads.html, feed-snippets.html, thoss-crossroads-preview.html, torenthia-globe.html — some intentional).
- **Nav is DUPLICATED across 123 pages** (each carries its own nav/mobile-menu markup). THIS is the top "taped together" problem — any nav change = 123-page sweep. (Confirmed live: adding the crossroads to the mobile menu had to be done per-page; only homepage got it.)
- **Inline `<style>` sprawl**: 102 pages carry >20 lines of inline CSS. The SAME masthead CSS block is copy-pasted inline across 32 news pages. site.css exists but lots of styling still lives per-page, duplicated.
- **Feeds are hand-maintained**: homepage feed (index.html) shows 5 items; torenthia.html shows 9. No cap enforcement, no single source → drift, and "we're always behind" on the tickers.

---

## THE BRIEF (from John, in his words, distilled)
1. **Easy for US to update.** (→ shared nav + CSS consolidation)
2. **Update tickers automatic if possible** — find latest updates, list most recent 5, short description + link button, so we're not hand-updating constantly. Updating tickers is tedious and we're usually behind.
   - **DECISION: retire the hand-maintained tickers.** Replace with ONE derived, self-updating "Latest" strip on the homepage that reads from the SAME source as the World feed. Publish-and-forget. The World feed (torenthia.html) already IS the reverse-chron "what's new" list — the manual ticker was a redundant second surface that created the maintenance tax. Kill the redundancy; make the homepage strip a *view* of the feed, not a separately-authored list.
   - **DECISION: manifest approach, NOT true auto-discovery (for now).** Add a piece = drop ONE line into a small content manifest (title, date, blurb, link). Ticker + both feeds + cap-at-5 + newest-first all update from that. Plain static, no build step, reliable. True auto-discovery (build step scans pages, scrapes metadata) is a LATER upgrade once pages are clean enough to scrape.
   - **Display: static-5 list vs rotating carousel** = undecided display choice (maintenance is solved either way since it's derived). Claude's lean: static 5-item list (a carousel hides 4 of 5 items and auto-advance fights the reader; real dynamism should come from the visual phase, not ticker motion). John open to rotating if he wants the motion. DECIDE AT BUILD TIME.
3. **Easy for USERS to navigate** — comprehension + simple navigation.
4. **Content cleanup** — prune scenarios that are stale ("long in the tooth") or redundant (two very similar → swap in a better one).
5. **Visual: the site "looks like a library page — academic, not dynamic."** The restraint is GOOD (easy back end) and BAD (static feel). Fixable WITHOUT sacrificing the maintainable back end — the academic feel comes from uniform gray-on-cream density, no hierarchy between landing vs document pages, no motion/contrast/color moments, everything same weight.

---

## THE PLAN — three phases, sequenced deliberately

**Core principle: STRUCTURE FIRST makes the visual refresh cheap and safe. Doing visual first = redoing it after consolidation. Everything incremental & reversible; each phase ships independently; the live site never breaks. 126 pages = NO big-bang rewrite.**

### PHASE 1 — Structure (invisible to visitors, highest leverage, ships safely)
1. **Shared nav.** Move nav/mobile-menu into ONE source every page pulls from. Plain-static-compatible route: a `nav.js` that injects the nav markup into a placeholder element on each page (one script tag per page instead of full duplicated markup). Then a nav change = 1 edit, not 123. This alone removes most of the "taped together" feeling.
   - Watch: keep it accessible (skip-nav must remain first body child; main content keeps id="main-content"); hamburger breakpoint 820px; don't break pages that currently hardcode nav.
2. **Consolidate duplicated inline CSS into site.css.** Pull repeated blocks (news masthead — repeated inline across 32 pages; scenario styles; etc.) into shared classes. Do it page-TYPE by page-type (news, then nrs, then scenario, then quicksheet), verifying each type renders identically before/after. Pages get lighter; styling changes happen once.
3. **Content manifest + self-updating "Latest" strip.** Small JSON manifest (one entry per world-content piece: {type, title, date, blurb, url}). The World feed and the homepage "Latest" strip both render from it. Cap-at-5 + newest-first enforced in code. Retire manual tickers. Add a piece → update one manifest entry → everything updates.

### PHASE 2 — Visual (AFTER structure; restyle shared classes once)
Kill the "library page" feel WITHOUT touching the easy back end:
- Stronger hero (homepage + section landings) — dark navy, gold JetBrains Mono eyebrow, Cormorant 300 h1 (house hero style already defined — push it further).
- Real type hierarchy: differentiate landing pages from document pages (right now everything reads same-weight).
- Contrast & color moments; motion where it earns attention (not gratuitous).
- Make the PORTRAITS work harder visually (we added subject headshots to 17 news pages; they can anchor cards/feeds).
- More dynamic cards (the featured-card pattern exists; extend it).
- Keep: Cormorant Garamond headings, Jost body/UI, JetBrains Mono labels; navy/gold/cream palette; NO Playfair. All shared-class edits now, so restyle once.

### PHASE 3 — Content cleanup (parallel, low-risk, editorial)
- Prune stale/redundant scenarios. Current count 44 (was 46; 2 pulled in the CC redesign as 60%-based).
- Where two scenarios overlap and there's a better idea, swap it in (don't just add — editorial policy is keep-it-current, remove-don't-annotate).
- Known scenario to-dos: fresh CC scenario on the new accountability model (constructive-no-confidence / seat-vacation) — WRITE FRESH not rewrite; two indigenous scenarios (Founding Choice, Departure) recategorized & deferred; scenario-indigenous.html orphan keeps reappearing in fresh clones (verify git rm committed).

---

## TIMING
- **NOT launch-window work.** The crossroads window is live; refresh is a bigger calm project that must NOT compete with feeding the window + holding Thoss's sealed resolution.
- Start Phase 1 AFTER the window settles. Phases ship independently; content cleanup (Phase 3) can run parallel anytime.

## OPEN DECISIONS TO MAKE AT BUILD TIME
- Static-5 list vs rotating carousel for the homepage "Latest" strip.
- nav.js injection vs a light build step (John's stated preference: keep plain-static / no build → nav.js injection). Revisit only if we later want true feed auto-discovery.
- Fate of the dormant torenthia-globe.html (unlinked; do not resume without explicit direction).

## GUARDRAILS (carry into every step)
- Incremental, reversible, live site never breaks. Verify each page-type renders identically before/after a consolidation step.
- American English; house typography/palette; no Playfair.
- site.css is the home for shared styles; fix bugs there so all pages benefit.
- Batch commits; deliver zips to outputs; John pushes (no push token for Claude).

---

## PHASE 4 — Template System (DECIDED: build-step, after Phases 1-3)
*Added 260712. John decided in favor of a real build step. Context: non-commercial hobby project, values simplicity + easy updates + consistency; recurring drift is the pain point; cost must stay ~$0.*

### The decision
Migrate the ~110 shared-skeleton pages to a **static site generator with a build step** (Eleventy / 11ty is the lightweight default candidate — free, open-source; Vercel runs the build for free on the hobby tier, so $0 added cost). One template per page type; a new page becomes "write content, pick template." This is the structural cure for the recurring drift — shared parts live in ONE place by construction, so there is nothing to drift from.

### The tradeoff John accepted (record it plainly)
Currently what John pushes IS what's served. With a build step, John pushes SOURCE (content + templates) and Vercel GENERATES the served pages. A layer sits between "what I wrote" and "what's live." Builds are fast; a failed build keeps the old version live rather than breaking the site. Conceptual shift, but John delegates the building anyway.

### WHY NOT NOW (sequencing discipline — important)
1. The site still has drift/surprises (e.g. 7 empty news pages found 260712). Templating on an unstable base bakes the mess into the template. CONSOLIDATE FIRST (Phases 1-3), TEMPLATE SECOND. The nav + CSS consolidation IS the prep — every layer centralized is a layer the template won't fight.
2. A build migration is a real project, not a session: pick the generator, build templates from the now-consolidated shared parts, migrate page-type by page-type (news -> nrs -> scenario -> quicksheet, same order as CSS), verify each type renders identically before/after, keep exception pages hand-authored.

### The exception pages (John's own list, correct instinct — these stay bespoke, NOT templated)
- **Annotated Edition** — sticky nav + search behavior (own interactive chrome)
- **Glossary** — sticky nav + search behavior
- **Homepage (index)** — landing page: hero, featured cards, not a document
- **The World (torenthia.html)** — feed/index, not a single article
- **Feature pages** — crossroads.html, survey.html (apps, not documents)
- Likely also: quicksheets hub, atlas/map pages, diagrams, contact/sources (evaluate each)

### The templatable ~90% (share one skeleton)
news, NRS, scenario, quicksheet article pages — these are documents with identical chrome and only their content differing. This is the set that becomes template-driven.

### Open decisions for Phase 4 build time
- Generator choice: Eleventy (leading candidate) vs alternatives. Confirm it builds cleanly on Vercel hobby tier at $0.
- Whether to keep the plain .html files as the source format (Eleventy supports HTML+data) so John's mental model barely changes, vs. moving to markdown/nunjucks templates.
- Migration order and per-type render-parity verification.


---

## PHASE 4 PRE-FLIGHT — Runway to reduce migration pain (added 260713, John)
*John plans to start Phase 4 end of this week or early next week. This section is the prep checklist that puts us in the best position to transfer with least burden. Core principle: a template migration is easy in proportion to how UNIFORM and CLEAN the pages already are. Most of the prep IS the rest of Phase 1 — consolidation is not a detour from templating, it's what makes templating not-awful. Every inconsistency we don't fix BEFORE Phase 4 is one we'd have to handle DURING, at the worst time.*

### Pre-flight checklist (roughly by leverage)
1. **Finish CSS consolidation (highest leverage).** Shared styles are still split between site.css and drifted inline blocks (same selector, different values across pages — confirmed during the masthead pass). Resolve the drift and move shared rules to site.css FIRST, so the template just links site.css and every page renders right. Migrating with drift unresolved forces resolving it mid-build (worst time). Masthead done; article-body/byline/article-nav rules still drifted and deferred — this is the pass to finish. Go page-type by page-type (news -> nrs -> scenario -> quicksheet), verifying each type renders identically before/after.
2. **Lock the exact page-type "shapes."** Before migrating, document precisely what each templatable type (news, nrs, scenario, quicksheet) consists of, skeleton minus content. Confirm "every news page is IDENTICALLY structured except content." FIND weird one-offs now, not mid-build. (The 7 empty pages + 5 stale-nav pages found 260713 are exactly the kind of surprise to surface early — assume more exist.)
3. **Separate content from chrome cleanly.** Ideal pre-Phase-4 state: each page = identical boilerplate + ONE clean content block (<main id="main-content">...</main>). The nav sweep moved us toward this. Get every templatable page to "boilerplate + one content block" so extraction is copy-paste, not surgery.
4. **Lock the inventory + exception list.** Walk each exception candidate (Annotated, Glossary, homepage/index, The World/torenthia.html, feature pages crossroads/survey; also evaluate quicksheets hub, atlas/map, diagrams, contact, sources) and decide DEFINITIVELY templated-vs-bespoke. Produce a manifest: which page uses which template.
5. **Pick the generator + PROVE ON ONE PAGE (the only genuinely new pre-flight step).** Choose the tool (Eleventy leading candidate; confirm $0 on Vercel hobby build). Set it up, run ONE news page through the full pipeline (source -> build -> served output), confirm byte-identical to current. Prove the machine on one page before feeding it 110. Contained experiment; does not touch the live site.

### The honest framing (for John + future Claude)
- Items 1-4 are largely the rest of Phase 1 (CSS consolidation + "Latest" strip) plus inventory. Doing Phase 1 IS the Phase 4 prep. Only item 5 is genuinely new, and it's a safe contained experiment.
- The migration will still be tedious (110 pages). The prep can't make it fun, only mechanical-instead-of-surgical. Aim: by the time we migrate, a page is "boilerplate + one content block" and the template is fill-in-the-blank.
- Sequence discipline holds: consolidate/clean FIRST, template SECOND. Don't bake current drift into the template.

### Known state as of 260713 (starting point for pre-flight)
- 124 pages on shared nav.js (single source). skip-nav standardized. Nav drift fixed.
- Masthead CSS consolidated to site.css (30 news pages). Other shared rules still inline/drifted.
- 0 empty files (7 recovered 260713). Scenario count 44. 165 provisions.
- Exception list (John's, to confirm): Annotated, Glossary, index, The World, crossroads, survey.

---

## GENERATOR DECISION LOCKED (260714, John) — Eleventy / Build Awesome + Nunjucks

John researched the open-source generator and chose it. **DECISION: Eleventy (11ty)** is the
generator for Phase 4. Verified current state (web search, 260714):

- **Eleventy (11ty)** — open-source static site generator, **MIT License**, free for any use incl.
  commercial. Created/maintained by Zach Leatherman (github zachleat; repo 11ty/eleventy, ~19.7k stars).
- **Rebrand in progress:** "Eleventy is now Build Awesome" (announced 2026-03-03). SAME project, same
  MIT core, same 11ty repo lineage — just a new name. If setup/branding shows "Build Awesome," it's the
  same tool John researched as Eleventy. Don't be thrown by the name.
- **Current version:** v3.1.x (v3.0 landed late 2024, stabilized through 2025; ESM-based). Needs
  **Node.js 18+** for LOCAL builds only — Vercel handles the build environment, so this likely never
  affects John unless he builds locally.
- **Fits every constraint:** zero client-side JS by default (pure static HTML out); smallest deployed
  output of any major SSG; deploys free to Vercel/Netlify/GH Pages; incremental migration supported
  (convert a few templates at a time, migrate as fast/slow as wanted); doesn't hold content hostage
  (decoupled template languages — easy to leave later if ever needed). No telemetry.

### Template language: NUNJUCKS (John spotted it on the 11ty site)
- **Nunjucks** is NOT a separate program — it's a **templating language Eleventy reads** (one of
  several: Nunjucks, Liquid, Markdown, etc.). Free, open-source (BSD, originally Mozilla). Ships with
  Eleventy; nothing separate to install/choose.
- **Its job = the shared-layout cure.** Write nav/header/footer ONCE in `base.njk`; every content page
  says "wrap me in base" via front matter. Change nav once -> all pages update on next build. This is
  the structural fix for the 123-page nav-duplication problem in this plan.
- The 11ty migration guide describes OUR EXACT migration in one sentence: copy each page into src/,
  move the repeated <head>/header/nav/footer into base.njk + partials, delete that boilerplate per page,
  add a little front matter. Fiddly HTML (embeds, custom markup, the exception pages) stays as-is.
  => confirms all the consolidation work (shared nav.js, masthead CSS, readability structure) IS the
  boilerplate-extraction prep. Nothing wasted.

### Open Phase-4 build-time decision (unchanged, noted): keep pages as plain `.html` with Nunjucks
layout-wrapping (minimal change to John's mental model) vs. writing more heavily in Nunjucks templates.
Decide at build time. Lean: keep `.html` + layout wrap for the ~90% templatable pages.

### DONATION (John wants to support the project — good instinct; it's an indie/community-funded tool)
Verified official channels (beware SEO lookalike "eleventy-11ty" repos — these are the real ones):
- **Open Collective (preferred): https://opencollective.com/11ty** (transparent open finances)
- **GitHub Sponsors: https://github.com/sponsors/11ty**
- Funding history has shifted (independent Open Collective 2024 -> briefly Font Awesome -> now the
  "Build Awesome" era 2026 with a Build Awesome Kickstarter + new sponsor tiers). For the CURRENT
  preferred channel, start at 11ty.dev and follow its own support links. TODO (optional, next session):
  pull the live Build Awesome Kickstarter link and confirm it's still open, if John wants to back that
  specifically rather than the standing Open Collective.

---

# STATUS UPDATE — 260717 (end of day)

**This section supersedes anything above it that conflicts. Several decisions recorded earlier
in this document are now WRONG — they were correct when written and were overtaken by Phase 4
actually shipping. They are listed here rather than deleted, because knowing what we decided and
why we reversed it is worth more than a tidy document.**

## PHASE 4 IS DONE AND LIVE (merged to main 260717, commit 8b9f40e)

The site is now BUILT, not copied. Eleventy 3.1.6, ~1s build, $0 added cost, on every push.
Proof gate at merge: **133/133 pages BYTE-IDENTICAL**. Nobody can tell, which was the promise.

- `package.json` (no `"type":"module"`), `eleventy.config.mjs` (ESM by extension),
  `vercel.json` (@vercel/static-build → `_site`, distDir; 4× api @vercel/node maxDuration 30).
- Permalink override forces `page.html` (NOT pretty `page/index.html`) — otherwise vercel.json's
  `/(.*) → /$1.html` route breaks on every page.
- `templateFormats: ["html"]`, `htmlTemplateEngine: "njk"` — **Nunjucks already runs on every
  page**. Templating needs no migration; it needs front matter.
- **BONUS SECURITY WIN, unplanned:** under the old `@vercel/static` `**/*`, every file in the repo
  was publicly served. Now only `_site` is. `constitution_data.json`, `package.json`,
  `vercel.json`, `eleventy.config.mjs` and `api/` all 404 publicly. The stray root `survey.js`
  fixed itself by never being built.
- Bug the proof caught: `*.jpg` was missing from passthrough. `torenthia-atlas.html` serves
  `world-map-tier1.webp` with an `onerror` fallback to `world-map-tier1.jpg` — the fallback would
  have 404'd, so the world map would vanish on exactly the old browsers the fallback exists for.
  Fixed, with the reason in a comment so nobody strips it.

## REVERSED: "manifest, NOT auto-discovery"

The plan says (Phase 1, tickers): *"DECISION: manifest approach, NOT true auto-discovery (for
now)... True auto-discovery is a LATER upgrade once pages are clean enough to scrape."*

**That decision is retired. Phase 4 IS the build step it was waiting for.** A manifest is still a
file you have to remember to update — i.e. the same failure mode with extra steps. The answer is
front matter + an Eleventy collection.

**PROVEN 260717, not theorised:** front matter was added to `torenthia-news-041.html`, built, and
compared byte-for-byte against the pre-front-matter original: **IDENTICAL, 15,536 bytes both
sides.** Eleventy strips it. The reader sees nothing. The build gains a queryable record.
Extraction across all 57 world pages resolves **46 automatically** (type/date/title/outlet/blurb
already present in the page); **11 need a hand** — 6 news pages whose outlet sits in a masthead
class the scraper doesn't know, and 5 early NRS pages (001–005) that predate the `nrs-doc-id`
structure entirely.

## REVERSED: The World gets a "Latest" strip

**The World's job is CURATION, not recency. The Record is the feed.** Decided 260717 and acted on
the same day when John's phone screenshot showed the strip serving **Month 7 content two months
late — 9 of 57 pieces, missing Thoss entirely**, three inches under the intro paragraph.

- Strip DELETED (7,417 bytes). Curated Dispatch cards KEPT — they're bios, not dated entries.
- Replaced with an evergreen door to The Record. **Nothing dated survives on that page.**
- **A near-miss worth recording:** the first replacement was a "Most recent" line with news-041
  hardcoded in it. That is the same bug at 1/7 scale, and *worse than the strip because it looks
  maintained*. Anything with a headline in it must be DERIVED. Caught before shipping.

**Recency is legible only to someone who already has the context.** A newcomer doesn't know Orin,
or Korda, or why a petition table matters. Curation serves them; recency serves returning readers;
The Record already does recency properly (55/57).

## CLOSED: the globe

**Deleted, 260717.** 8 files, 22 MB — a third of the repo (61M → 40M). Nothing referenced any of
them; the page only ever loaded 2 of its 7 images. Will be re-approached from scratch later if at
all. The "Open Decisions" entry about its fate is now answered.

## ALSO CLOSED 260717

- `thoss-crossroads-preview.html` DELETED — a stale, publicly playable duplicate of a live feature,
  missing the entire Legat Consul branch (s3lc/s4lc absent).
- Stray root `navigator.js` and `survey.js` DELETED (GitHub web uploads that landed at the root
  instead of `api/` — a recurring hazard: **the upload goes wherever you are when you click
  "Add file", so click INTO `api/` first**).
- **`.eleventyignore` CREATED** — this is the retirement step the site never had. A file can now
  stop being a page without being deleted. Currently: `feed-snippets.html` (dev scaffolding, no
  title/nav/footer, was publicly reachable) and `*.md`.
- **The Living Crossroads RETIRED** — "The Dark Horse" canon published (news-041). Both feature
  cards removed from index.html and torenthia.html. **The harness is KEPT and unlinked**
  (`crossroads.html`, `thoss-crossroads.json`, `api/crossroads.js`): the next crossroads only needs
  a new JSON. Deleting the machine because one story ended would be throwing away the build.

## THE NEXT STRUCTURAL JOB (do this before any visual work)

**Front matter on the 57 world pages → `collections.world` → The Record renders itself.**
De-risked 260717 (see above). This is the last thing standing between John and *publishing = drop
the file in*. Everything on the visual roadmap gets cheaper afterwards, because the wire/carousel
is the same collection with a different stylesheet — and **a derived widget cannot go stale**,
which is the entire lesson of the strip we just deleted.

Then Step 2 templating, news first: 1 base + 4 outlet mastheads + 37 content files.

### A concrete argument for templating, found today

**`ai-features.html` should be linked from the footer** (every AI feature links it now, but a
reader who wants the privacy page without touching a feature can't find it; it isn't in the nav
either). That is ONE link. **The footer is on 131 pages in SEVEN distinct variants:**

    76  plain <footer> + <span class="footer-logo">      <- canonical
    45  <footer class="site-footer"> + <span>            <- print @media hiding, deliberate
     5  plain <footer> + <div class="footer-logo">       <- drift
     2  site-footer, slight variant (ai-features, survey)
     1  quicksheets.html — near-canonical variant
     1  404.html — BARE footer, NO disclaimer at all
     1  diagrams.html — different wording AND a hardcoded "166 provisions · 20 articles"

**That last one is the point.** A hand-typed constitutional count, in a footer, that no one will
ever think to check. It is correct today (verified 260717). It is one amendment away from being a
lie. Adding the link by hand means editing 131 files across 7 variants and then editing them all
again during templating. **Deferred deliberately: Step 2 collapses all 7 to one include, and then
it's a one-file change — the link, 404's missing disclaimer, and diagrams' hardcoded count all fix
at once, for free.**

## GUARDRAIL EARNED THE HARD WAY (260717)

`constitutional-quickref.md` was found to be **25% wrong** — 41 of 166 provisions had the wrong
name, Article XX described an article that no longer exists, and the threshold table contained a
Monitor-removal rule ("3/5 Senate, Judicial Track") that **appears nowhere in the constitution**.
Invented law, in the working reference. It is now **GENERATED** by `scripts/build-quickref.py`
from `constitution_data.json` and cannot drift again.

**The general rule, which the strip and the quickref both prove: if a file restates something
another file already knows, it will eventually lie. Derive it or delete it.**
