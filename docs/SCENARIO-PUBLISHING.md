# Publishing scenarios

Add a root-level `scenario-*.html` page with front matter:

```yaml
---
scenarioCategory: dual-executive
---
```

Use a category ID from `lib/scenario-categories.json`. That small configuration holds category labels, hooks, and category order (array order), never scenario entries.

The build reads each scenario's heading (`scenario-title`, falling back to `h1`), subtitle (`scenario-subtitle`, falling back to the description meta tag), filename, constitutional references, and reading time (220 words per minute). Scripts, styles, and template includes do not contribute to reading time. Library totals and provision counts are derived from the same data.

Optional `scenarioOrder` places a story within its category; existing stories use increments of ten to preserve the established order. New stories without it appear after ordered stories, sorted by filename. Only the introductory story has `scenarioStart: true`. There is no separate featured catalog.

For canonical history best discovered through particular State profiles, use `scenarioLibrary: false` and link the existing `scenario-*.html` URL through the State pages' `stateScenarios` front matter. Such a page remains publicly accessible and must pass constitutional-reference and link validation; it is not counted in the general Scenario Library. **The Winning Bid** is the initial State-centered example, linked from Aldenmere and Caldenmere.

Existing curated reading bridges in `_data/scenarioBridges.json` remain optional enhancements. New stories receive generated reading guidance from their own description and provision references when they include `scenario-end.njk`.

Run `npm run test:scenarios`, `npm run build`, `npm run check:scenarios`, and `npm run check:discovery`. The old `python3 scripts/build-scenario-index.py` command now delegates to the build; it does not rewrite source files.
