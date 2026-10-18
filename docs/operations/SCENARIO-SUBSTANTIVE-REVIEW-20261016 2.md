# Scenario substantive review — immigration, citizenship and compacts (16 October 2026)

Authority: latest merged `constitution_data.json` on `main`, checked against the scenario narratives. This is **batch one** of the legal-mechanism review following the all-library identifier sweep in `docs/operations/SCENARIO-ALIGNMENT-REVIEW-20261016.md`.

## Examined
- `scenario-the-return.html` — resident re-entry, certification denial, counsel and judicial remedies under §§1.1, 1.5, 1.6, 4.5, 5.2, 6.1 and 6.2.
- `scenario-the-unremovable.html` — unexecuted removal, non-refoulement, legal residency via asylum, §§1.16.a, 1.18, 6.2, 6.3 and 6.3.a.
- `scenario-sponsoring-state.html` — State sponsorship, vested federal residency and challenges under §§1.6, 6.1 and 6.2.
- `scenario-the-departure.html` — citizenship, founding Indigenous status, Associated Community compact obligations and exit under §§5.1, 16.2, 20.3–20.5.

## Changes proposed
- **The Return:** Corrected unqualified claim to publicly appointed counsel, as §6.2(4) conditions appointment on inability to afford representation. Corrected an assertion that §6.2 provides a mandatory judicial remedy for discriminatory suspension of an existing resident's credential; the revised text specifically addresses State sponsorship denials and national-security certification denials, leaving the precise suspension remedy a question for applicable constitutional and statutory law.
- **The Departure:** Clarified the narrow material-fraud judicial exception to §5.1's citizenship protection, without claiming withdrawal from a compact extinguishes citizenship. Clarified §20.5's actual function—reciprocal obligations, reviews and arbitration—rather than making it an express constitutional separation-terms rule.

## Retained
- No plot, date, court outcome or sovereign-choice event is being changed in this batch.
- `The Unremovable` and `Sponsoring State` have no specific correction proposed **on this examination**; this is not certification that every paragraph or interpretive premise is unassailable.

## Cautions and later decisions
- The Return still raises a legitimate interpretive question about whether travel allows treating existing legal residency as new certification; the scenario is a hypothetical, not a holding that a border officer can cancel vested status.
- Do not infer that §20.3 binds a nation **after** the compact terminates; it imposes conditions on the ongoing compact.
- Selection: retain all four scenarios for now. They test different mechanisms: re-entry suspension, failed removal, retroactive sponsorship withdrawal, and compact exit. No consolidation recommended within this set.
- The combined library's broader semantic review remains incomplete, and the local `npm run test:scenarios`, `npm run build`, `npm run check:scenarios`, `npm run check:discovery` have not been run in this session. Verify PR checks.

Further batches should compare whole-scenario conclusions to the operative text, not merely validate citations.
