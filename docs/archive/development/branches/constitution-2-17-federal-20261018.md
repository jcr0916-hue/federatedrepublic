# Branch history — constitution-2-17-federal-20261018

**Original branch:** `fix/constitution-2-17-federal-20261018`

**PR:** not yet opened

**Head commit at handoff:** pending; base `4220db128d67ccb1ff6a123544ceff6b198e025a`

**Status:** proposed; nothing shipped until merged

## Purpose

Implement John's approved narrow change from [Constitution 12](chatgpt-conversation://6acfc34b-5c40-83e8-89ed-73c22f203245): insert only "federal" into §2.17's first sentence. Keep its second sentence unchanged.

## Changes and artifacts

- `constitution_data.json`: "may not serve in any executive capacity" becomes "may not serve in any federal executive capacity". No other canonical bytes change; 20 articles and 177 provisions remain.
- Normal `npm run sync` outputs: `annotated.html`, `docs/constitution-current.md`, `docs/constitutional-quickref.md`, and `search-index.js`, including its generated revision identifier.
- **Historically preserved:** exact previous JSON/Markdown pair `docs/archive/constitution/Constitution-261019` and frozen-renderer provenance. The archive date is UTC; the design session is October 18 in America/Los_Angeles. Existing archives remain unchanged.
- `quicksheet-article-2.html`: the same one-word qualification in its §2.17 summary. `constitutional-history.html`: new entry `federal-executive-cooling-off-261018`; older entries remain historical.
- `pdf/constitution-current.pdf` and `pdf/quicksheet-article-2.pdf`: regenerated from the built site with the existing browser-rendering settings. Only these two affected PDFs were regenerated.

## Results and verification

- Passed `npm run world:publish-check`: all constituent suites and production build, discovery for 358 pages and 228 public records, constitutional consistency and full-text/search checks for all 177 provisions, and scenario checks.
- A byte-level comparison against `origin/main` verified the entire canonical file differs only by the approved insertion, the second sentence is identical, the three generated textual surfaces have exactly the corresponding insertion, and both historical files exactly equal the prior committed bytes.
- Passed `scripts/check-constitution-pdf.py`: all 177 provisions verified. Passed `scripts/check-pdf-accessibility.py`: tagged structure and outlines present in all 13 public PDFs. The Article II PDF's complete revised summary also matches after whitespace normalization.
- Browser inspection verified the built annotated §2.17. Rendered and visually inspected the revised provision, both quick-sheet pages, and layout contact sheets covering all Constitution pages.
- Initial PDF-renderer launch found its bundled browser revision unavailable. Used the installed Chromium executable with the repository's unchanged PDF settings; no renderer or dependency source changes. Current Constitution PDF has 57 pages versus the prior 55; the Article II PDF remains two pages. Cross-environment pagination is a rendering limitation, with complete canonical text verified.
- Existing non-blocking World clock/dashboard reminders and metadata suggestions remain; their unrelated sources were not changed.
- Passed the final production rebuild and `npm run check:assets` (438 referenced/protected assets); both deployed PDF copies exactly match the regenerated source PDFs. Passed `git diff --check`.
- Committed archive check and GitHub CI: not established until recorded below.

## Decisions and lessons

- **Accepted:** the approved one-word qualification and necessary archival, generated-document, quick-sheet, and design-history synchronization.
- **Rejected:** an explanatory State-service sentence or any rewrite of §2.17's second sentence. The user approved only "federal".
- **Experimental:** none retained. Reuse `npm run sync`, the immutable archive workflow, and the existing PDF rendering settings; do not manually edit generated Markdown or historical snapshots.

## Open follow-ups

- PR review and explicit user approval are required before merging; merge is not authorized by this task. CI status will be linked from the PR.

## Preservation and branch disposition

- Proposed results, historical pair, design-history entry, and this handoff are preserved together in this branch and will reach `main` only through the PR.
- No intermediate substantive experiment requires separate preservation. Branch deployment/automation dependencies: not checked; this note grants no cleanup authorization.
- **Deletion approval:** Not granted by this note. Requires separate approved manifest and guarded cleanup. Keep `main` and `archive/legacy-project-material`.
