# September 2026 missed-change audit — implementation record

Date: 2026-09-14. Baseline: main at `4d09884c05e6c3a8d4e79aeef01e82bcfc6b2b87`.
The user authorized implementing and pushing the audit update. The pre-update complete Markdown text is preserved unchanged as `Constitution-260914.md`.

## Plan and scope

1. Reconcile the September review handoff and current main; preserve settled institutional design.
2. Apply missed changes and targeted consistency repairs together, then propagate to live constitutional references.
3. Regenerate public artifacts, validate text and navigation, inspect rendering, and push main.

`constitution_data.json` is the canonical source. Historical records remain historical; superseded working handoffs now point to this completion record. Character imagery and unrelated world-building are outside this update.

## A — Agreed changes

| Sections | Resolution |
| --- | --- |
| 3.2 | Verified and retained the already-applied formulation: “Members of the federal Assembly are elected by proportional representation. States and Territories each elect voting members.” |
| 18.2 | States and Territories may bid; removed the mandatory 20-year competition and prohibition on suspending it. No scheduled reconsideration, rotation or relocation; incumbent arrangement continues absent a qualifying selection. |
| 3.10–3.11 | Renumbered the surviving competence and delegation provisions from 3.12–3.13 after removal of the former intervening provisions. Preserved old web anchors. |
| 2.6(5) | Replaced consecutive-service wording with the lifetime limit and removed the stale 7.5 exit pathway. |
| 7.12 | Restricted service-derived information, relationships and access using “obtained by virtue of their service.” |
| 10.1(2) | Restored Republic ownership of official records and materials; distinguished ownership/custody from publication and lawful classification. |
| 7.10(3)–(4) | Direct financial-interest recusal is self-executing; official gifts belong to the Republic regardless of value. Retained the personal gift restriction. |

## B — Review remnants

| Sections | Resolution |
| --- | --- |
| 14.2 | Removed classified Monitor summary language; public Monitor reports remain unclassified, while underlying records follow Article X. |
| 3.5(2), 4.4(7), new 19.10 | Moved founding Senate and judicial class machinery intact into the transition article; retained pointers at the institutions. |
| 16.1, 19.7 | Consolidated founding recognition-register compilation in the transition article, preserving ministerial treatment of predecessor records and the appeal right. |
| 9.4.a, 9.8(7) | Replaced duplicated Judicial Pool appeal machinery with the controlling common procedure. |
| 9.7.a, 9.1.d | Replaced duplicated acting-Monitor selection and eligibility rules with the controlling acting-service procedure. |

## C — Current-text issues

| Sections | Resolution |
| --- | --- |
| 7.3, 17.1 | Made the constitutional-amendment referendum exception explicit, preserving Article XVII thresholds. |
| 9.9, 4.2, 4.3.a | Excluded all federal judges from the general confirmed-independent-officer removal rule; judicial rules control. |
| 15.2 | Defined a successful admission audit as completed findings from all three Monitors with no material failure; a warning does not count. Preserved the two-success requirement and existing deadlines. |
| 15.5.a(2), 15.2(5) | Placed the remainder assessment after petition certification and before referendum or subdivision Statehood, with audits allowed to proceed pending assessment. Preserved assessment safeguards and deadlines. |
| 9.3 | Distinguished scheduled succession at term expiry from immediate assumption after certification following an unscheduled vacancy; replacement serves the remainder. |
| 20.1 | Explicitly included sovereign entities attaining independence through 15.9 among potential Associated Communities. |

## Propagation

- Regenerated the complete current Markdown, selected quickref extracts, annotated constitutional text, and search index. The quickref is explicitly a selection, not an exhaustive threshold register.
- Added `scripts/sync-annotated.py` to `npm run sync` so annotated provision text follows the canonical source while preserving existing explanatory material and legacy Article III links.
- Corrected stale institutional terminology and rules in the glossary and interactive diagrams, including actual constitutional pools, statutory agencies, terms, judicial tenure, emergency safeguards, Statehood and associated sovereignty.
- Updated Article III, judiciary, Monitors, States and amendments quicksheets and their five PDFs; rebuilt the complete Constitution PDF.
- Corrected current federal cross-references in Navigator, affected scenarios and the Caldenmere preamble; the State constitution's own numbering is unchanged.
- Aligned the audit scenario and optional Seat of Government story planning. Added a public constitutional-history entry and advanced the service-worker cache version.

## Validation

- Complete canonical preamble and all 176 provisions match the public 65-page Constitution PDF.
- Canonical/annotated and generated-reference consistency checks pass; scenario validation passes for all 48 scenarios.
- Browser checks cover the annotated page, glossary, all diagram tabs and detail panels, and five affected quicksheets; no page errors or mobile horizontal overflow were observed. Legacy Article III anchors resolve.
- All five regenerated quicksheet PDFs remain one page; changed PDF layouts were visually inspected.
- The site builds successfully; whitespace checks pass. These are local build checks, not a claim of post-deployment production verification.
