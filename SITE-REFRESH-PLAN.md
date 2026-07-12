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
