# Eleventy proof-on-one-page — RESULT: PASS

Pre-flight item 5, the only step whose outcome was genuinely unknown.

## Verdict

**37 of 37 news pages rebuild BYTE-IDENTICAL to what is live today**, across all four
in-world outlets (The Torenthian 30, RNN 5, TNB 1, The Dorven Ledger 1).

    Eleventy      3.1.6  (MIT)
    Node          v22.22.2   (needs 18+; local build only)
    Build time    37 files in 0.24 seconds
    Config        eleventy.config.js, ESM, ~8 lines

Method: each live page was split at exact byte boundaries into
`head_a | title | head_b | description | head_c | pageStyle | chrome | masthead |
main_tag | content | tail`, with a round-trip assertion proving the split lossless
before anything was templated. The rebuilt output was then compared character-for-
character against the live file. Not "looks right" — identical.

## What the proof found that guessing would not have

**1. Nunjucks auto-escapes.** `{{ description }}` turned `didn't` into `didn&#39;t`.
   Silent, plausible-looking, and wrong. Fixed with `| safe` on title and description.
   This alone justifies the exercise: it would have corrupted every page with an
   apostrophe in its meta description and nobody would have noticed for months.

**2. The mastheads are ONE partial with variables, not many.** Byte-keying produced 19
   distinct mastheads — 12 of them Torenthian. Diffing two of them: they differ only in
   the DATE ("Year 13" vs "Year 12", "Month 2" vs "Month 10"). So the real decomposition
   is 4 masthead partials (one per outlet), parameterised with date and section. Exactly
   the model the four-outlet finding predicted.

**3. Chrome drift — 12 distinct Google Fonts URLs across 126 pages.** Within the news
   type alone there are 3, which is why the proof produced 3-4 base templates instead of
   1. They differ in requested weights: e.g. `1,300;1,400` vs `1,400` italic Cormorant.
   Unify the URL and the news type collapses to ONE base template.

**4. A live bug: `family=JetBrains Mono` with a literal space** on 8 scenario pages
   (the-classification, the-contraction, the-ledger, the-objection, the-second-renewal,
   the-three-recusals, the-unremovable, the-waiver). Google Fonts expects `+`. The other
   118 pages send `JetBrains+Mono`. Each of those 8 pages does use the font in CSS. Worth
   a live check — but it is certainly not what the rest of the site requests.

## What this means for the migration

The machine works and the shape is now known:

    1 base template          (after unifying the font URL)
    4 masthead partials      (torenthian / rnn / tnb / ledger), date+section as variables
    37 content files         (front matter: title, description, pageStyle, masthead)

`pageStyle` stays per-page front matter — that is where the remaining per-article CSS
lives after today's consolidation (113 KB -> 54 KB). It is not a blocker; it is a
variable.

## Remaining unknowns (NOT proven here)

- **Vercel build at $0.** Proven locally only. Needs a real deploy: build command
  `npx @11ty/eleventy`, output `_site`. Hobby-tier build minutes should cover a
  0.24-second build comfortably, but "should" is not "did".
- **The other page types.** Scenarios are ready (43/44 share one skeleton after today).
  Quick sheets are print artifacts with per-sheet tuning — templatable for chrome only.
  Bespoke pages (23) are mostly meant to be bespoke.
- **RNN's two internal markup generations** (.rnn-name/.developing-bar vs
  .rnn-logo/.breaking-bar) — unify WITHIN RNN before templating it, never across outlets.
