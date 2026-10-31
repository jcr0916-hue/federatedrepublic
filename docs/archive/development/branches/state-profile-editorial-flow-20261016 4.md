# Branch history — design/state-profile-editorial-flow-20261016

**Purpose:** Improve engagement and reduce awkward vertical gaps in every Torenthia State profile before adding the Orath/Merath profiles.

## Changes
- Shared `_includes/state-profile.njk` only; no State canon or constitutional text is changed.
- Moves the large related-links rail from between the State overview and main text to after the main article.
- Makes the hero facts, map and State-position overview more compact.
- Adds a constrained editorial text column, larger feature-opening headline and balanced section separation, including mobile adjustments.

## Editorial decisions and constraints
Do not rewrite nine published State biographies merely to compensate for layout flaws. Use a shared template so existing profiles and future Orath/Merath pages benefit together. Retain full flag, map, State history, Constitution and archive navigation. No newly fabricated State content.

## Verification
Source template updated; site build, mobile rendering, accessibility and visual regression checks are pending. Review the state pages at desktop and phone widths before merge; pay particular attention to layout continuity and the map SVG.

## Preservation and deletion
Merge retains this design rationale under `docs/archive/development/branches/`. Branch deletion is a separately guarded step.
