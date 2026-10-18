# Scenario alignment and selection review — 16 October 2026

**Authority:** Latest merged `constitution_data.json` on `main` at review time. **Scope:** 54 root `scenario-*.html` sources; 53 are indexed in the general library and `scenario-winning-bid.html` is intentionally State-centered. This is an initial whole-library citation and editorial-selection review, **not** certification that every historical mechanism has received a complete semantic legal audit.

## Findings

1. **Identifier sweep:** Searched the text of all 54 scenario source pages for explicit `§N.N` and `§N.N.a`-style references and compared each extracted identifier to the 20-article current source. **No nonexistent cited provision identifier was found.** This is a *syntactic* result only: a surviving identifier can carry a different rule or title after revision.
2. **Confirmed semantic mismatch:** `scenario-the-return.html` states that §5.2 establishes a named Residency Credential. Current §5.2 instead sets out legal residents' rights and exclusions, without creating that named credential. Correct that attribution, keeping the scenario's administrative credential a *story fact*, not an express constitutional requirement. Its re-entry and §6.2 legal analysis deserves additional substantive review against the revised enforcement and appeals text before it is recommended as an Article V introduction.
3. **Selection gap:** The reading guide `_data/reading.json` currently presents **no scenario selection for Article V**, despite Article V appearing in the scenarios `The Return` and `The Departure`. Do not add a misleading Article V link until semantic accuracy of the chosen story is confirmed.
4. **Uneven emphasis:** Library categories contain numerous scenarios for the dual executive, Monitor checks and State/Territorial boundaries, while fewer scenarios foreground citizenship or ordinary local institutional life. This may be a deliberate strength, not a reason to delete well-made stories. Recommend improving navigation and purposeful reader routes before consolidating content.
5. **Existing validator limits:** `scripts/check-scenarios.py` verifies provision existence, built anchors and the generated scenario catalog. It does not show whether an accurately numbered provision actually supports an asserted power, threshold or procedure.

## Suggested selection principles

- One **accessible entry point** for each Article where practical, with a second advanced scenario for genuinely different mechanisms. Avoid creating stories merely to fill an artificial quota.
- Use an existing scenario when it correctly illustrates the Article, even if its assigned library category is different.
- A good scenario poses a concrete choice, tests an institutional safeguard or fallback, and makes the consequences visible. Prefer distinct mechanisms over repeating a crisis with a different name.
- Keep long fictional founding history and State-specific history discoverable through their natural routes; the general scenario catalog need not contain everything.
- Prioritize semantic audit of scenarios depending on recently condensed mechanisms: immigration/citizenship (§5–6), executive authority and incapacity (§2), election/fallbacks (§7–11), military control (§14), territorial and Indigenous status (§15–16), and transition (§19). Verify actual wording and legal transitions before deciding a rewrite is necessary.

## Disposition

- **Fixed in this PR:** Explicit §5.2 Residency Credential attribution in `scenario-the-return.html`. No plot change.
- **Not changed:** Scenario catalog composition, order, categories and `_data/reading.json`; no selection should be based solely on citation counts.
- **Pending:** Full paragraph-by-paragraph semantic audit of each published scenario against the new Constitution, link/build verification, and targeted editorial recommendations where multiple stories duplicate the same functional test.
- **Preserve:** All 54 scenarios and their current URLs unless separate editorial review approves a change.

This dated record should be supplemented rather than overwritten as the review progresses.
