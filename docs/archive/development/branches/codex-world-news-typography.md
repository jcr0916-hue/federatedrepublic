# Branch history — codex/world-news-typography

**Original branch:** `codex/world-news-typography`
**Review:** [Compare with main](https://github.com/jcr0916-hue/federatedrepublic/compare/main...codex/world-news-typography)
**Status:** proposed

## Purpose

Give the three newest Torenthia news stories (139–141, sequences 186–188) the hierarchy and reading rhythm of a newspaper feature.

## Changes and decisions

- The three files in `torenthia/news/` use a semantic article and header, display the existing outlet, author and in-world date from front matter, and emphasize the existing dateline.
- `site.css` adds an opt-in layout that reuses the site's palette and article styles. It sets a responsive headline, reading width, paragraph spacing and clearance beneath the fixed navigation.
- Reuse this markup for future stories that need the same layout. Keep the front matter as the source of publication details. Archive-wide restyling and adding editorial copy were outside this pass.

## Verification

- `npm run world:publish-check` and `git diff --check` passed. The build reports existing chronology and metadata advisories.
- Compared baseline and revised builds for all three stories. Their headlines, decks, body paragraphs, existing IDs and hrefs match. Source front matter matches byte for byte.
- Captured the live pages and reviewed a local Eleventy build in Edge at desktop and mobile widths. Checked for horizontal overflow at 320, 390 and 1280 CSS pixels.

## Preservation and branch disposition

The draft branch carries this handoff and the proposed changes. Vercel's checked-in config enables Git deployments only from `main`. Live branch dependencies and final cleanup eligibility remain to be checked under the repository's branch lifecycle policy after review. Retain the branch while the PR is open.
