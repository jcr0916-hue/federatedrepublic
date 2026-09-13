# Website alignment with the applied constitutional review

Constitutional source: current `constitution_data.json`, containing 20 articles and 175 provisions. The constitutional text itself was not edited. Work began from `a758403` and incorporated current main `0e5ef6e`; that newer commit removed the historical Markdown archive but did not change the Constitution. The archive was not restored over that repository change.

## 1. Annotated edition and search

- Corrected article introductions and explanatory references to match the current text.
- Indexed the full text of all 175 provisions, including lettered sections; exact section searches lead to their correct anchors.
- Versioned annotation caches against the Constitution and made annotation requests resolve the canonical provision on the server.
- Corrected shared glossary and Navigator references, and refreshed service-worker handling of the search index.

Validation: all 175 rendered provisions and index entries match the canonical text; exact lettered-section search was exercised in the browser.

## 2. Quicksheets

- Updated all 12 quicksheet pages and their printable PDFs for current selection, removal, succession, territorial, fiscal, and other referenced procedures.
- Retained the existing print designs. Eleven PDFs fit one page; Article II uses two pages.
- Added a repeatable browser-based PDF generation script.

Validation: provision-reference checks, site build, PDF page inspection, and browser rendering completed. Printed editions were rendered from the revised HTML.

## 3. Torenthia

- Updated fiscal-equalization and separation-of-powers references in news, NRS records, dispatches, shared data, and active world-reference documents.
- Corrected the Monetary Authority's report duty and the executive-incapacity fallback.
- Aligned Corindal's account with one remaining sitting senator and one unfilled seat.
- Kept Morantine and Solara as Territories pursuing statehood, with no Senate seats, as directed. Removed the erroneous Territory-to-Provisional classification.

Validation: canonical consistency checks and the complete site build passed after this phase. State-constitution section numbering was not treated as federal numbering.

## 4. Scenarios

- Corrected immediate Statehood on a passing audit; three-Monitor findings; Provisional remediation and restoration; referendum timing; devolution; and the three-stage independence process.
- Corrected Monitor acting-pool selection and the need for Supreme Court confirmation before suspension under the bad-faith protocol.
- Corrected judicial appointment timing and the Senate's ability to end a bypass before certification of the public vote.
- Updated ethics and recusal references, lawful-refusal protection, asylum safeguards, Endowment renewal, voting references, and fiscal procedures.
- Replaced the invented thirty-day constitutional coordination-failure process with ordinary legislation and coordination for that scenario's non-emergency dispute.
- Preserved the matching-fund proposal in **The Second Path**, with the SC striking down the appropriation clause while lawful provisions survive, as directed.
- Synchronized all 48 scenario pages' preview descriptions and both scenario libraries. The legacy library now matches the current library and no longer links to the missing Grounds Review page. Category counts and the unique provision-reference count are derived from the current contents.
- Removed a broken inline script fragment from **The Deadlock**.

Validation: all 48 pages' provision references and built internal links passed; both libraries contain all 48 unique pages and matching descriptions. Browser checks loaded every scenario, exercised every shelf in both libraries, checked mobile width, and reported no page-script errors. Desktop and mobile screenshots were inspected.

## Final download check

The linked Constitution PDF still advertised 166 provisions. It was regenerated directly from the canonical JSON, retaining the serif navy-and-gold document style, with the current preamble and all 175 provisions unabridged. The 64-page edition was checked by full-text comparison and visual rendering. Added repeatable PDF generation and full-text verification scripts, and made PDF requests network-first with offline cache fallback.

## Reproduction and limits

Run `python3 scripts/build-scenario-index.py`, `npm run build`, `python3 scripts/check-constitutional-site.py`, `python3 scripts/check-consistency.py`, and `python3 scripts/check-scenarios.py` from the repository root. The scenario checker expects the built site in `_site`. With ReportLab and pypdf installed, `python3 scripts/build-constitution-pdf.py` regenerates the main PDF and `python3 scripts/check-constitution-pdf.py` verifies its complete text.

The checks confirm rendering, references, links, and synchronization; they do not turn the fictional scenarios into constitutional text. Statutory details and fictional judicial outcomes remain examples subordinate to the current Constitution. External AI-provider calls were not exercised. The build retains its existing module-type warning for `_data/atlas.js`.

The user explicitly approved publication. All reviewed website updates through commit `bdee3af` were published to GitHub main on 13 September 2026. Production deployment is not verified by this report.
