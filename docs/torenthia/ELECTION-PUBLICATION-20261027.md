# Spring election publication — 27 October 2026

PR: [#261](https://github.com/jcr0916-hue/federatedrepublic/pull/261). Content commit: `39fe58e486d1da3f6df98cfec2bf6f02181bb9dd`.

Base: `c572f5f46beb2e11f3500c0082dfc71fcaeaab0b` (merged relocation completion, PR #260). Publication advances the fictional frontier from Year 14 Month 1 to **Year 14 Month 2**, without assigning a day or an election date.

## New publication

- NRS 125 / `NRS-Y14-0037`: Judicial Pool quarterly return. No additions or removals; published total remains 214. The Month 2 return fulfills the notice due in NRS 033 and sets the next quarterly return in Month 5. No judicial vacancy, nominee or Executive Monitor succession event is created.
- NRS 126 / `NRS-Y14-0038`: Hadrin's usual records counter reopens after the ventilation works in NRS 124. Receipt dates and rights remain unchanged. Both 125 and 126 are deliberately mundane records.
- NRS 127 / `NRS-Y14-0039`: the equalization committee directs comparable illustrations of its three existing approaches. This is the batch's substantive new procedural action. No estimates, weights, recommendation, bill, payment, appropriation, deadline or EM failure finding follows from it.
- News 127 / worldSeq 174: Petra Vend's election report connects the established district contests to Thoss's actual published program and explains the separate Assembly, Legat Consul and Senate arrangements.
- News 128 / worldSeq 175: Dara Voss's expressly conditional analysis examines three hypothetical Assembly compositions and their implications for merit legislation, regulatory clarity, equalization, budgets and executive tenure.

The five sources are in `torenthia/nrs/` and `torenthia/news/`. Categorized-directory defaults preserve public basename routes. Only NRS 127 is a new core dossier record; the news pieces are supporting coverage. The equalization dossier summary, structured clocks and affected Status entries are updated together. No durable Bible revision is needed.

## Canon and constitutional review

The authoring workflow, Story Bible, Status, Year 14 planning proposals, chronology and clock registries, current dossier records, stats ledger and latest relevant publications were read before drafting. Bounded authoring packets were generated for equalization, Argent Ridge and Lake Varda. Plans were treated as proposals; no future beat was reported as accomplished.

Primary continuity sources:

- NRS 033: 214 eligible Judicial Pool members, two applications returned for documentation, next return due Y14 M2. The new no-change quarterly return and its next reporting deadline are explicit new fiction, not claims recovered from an unpublished source.
- NRS 124: Hadrin's temporary counter arrangement and planned completion notice; NRS 126 supplies that completion.
- NRS 074 and 076; news 100 and 111: equalization submissions, three options and the need for comparable evidence. NRS 113 and news 122 establish Thoss's requests and domestic program. NRS 127 advances the review only to a staff direction.
- NRS 104 and news 116: Dorven's qualified candidates and published positions; NRS 109 and news 119: Ostara's five candidates, three-member district and Solara's nine Assembly seats. No new loyalty, endorsement or candidate quotation is attributed.
- NRS 116 and news 123: four qualified Legat Consul candidates; current §7.1 controls the two-part national/State count. No ballot order or election date is introduced.
- `_data/stats.js` and news 122: 500 Assembly seats, reported working support 266, installation vote 274. The published numeric ledger is unchanged.
- NRS 114, 115 and 118: housing passage, reconsideration notice and Speaker's pause. The batch records no later disposition and does not extend the pause across the month change. The 288–201 bill vote is not a confidence count.
- NRS 122–123 and news 126: no Executive Monitor nominee or established vacancy/term-end date. No confirmation package or vacancy clock is invented.

Current `constitution_data.json` was checked directly: §§2.5, 2.6, 2.6.a, 2.7, 3.1–3.3, 3.5, 3.6, 7.1–7.2, 8.1–8.4, 9.3, 9.4.a, 12.2, 12.6 and 18.4. In particular, the Civic Consul has no legislative vote; an election does not restart formation absent a vacancy; removal requires an absolute majority for a named serving-member successor; the Senate and independent audit institutions retain their roles.

## Projection assumptions and limits

News 128's groups are hypothetical positions on retaining Thoss, preferring replacement or remaining uncommitted. They are not canonical parties, candidate commitments, poll results or a district-to-seat model. Each case totals 500 seated members, excluding the Civic Consul:

- 280 / 180 / 40: larger retaining group; all other members together would have 220. Legislative agreement is a separate assumption.
- 245 / 225 / 30: neither group alone can install a successor; 225 would need at least 26 of the 30, all voting for the same person.
- 230 / 255 / 15: replacement is possible if at least 251 of the 255 agree on one eligible named successor and pass the constructive motion.

No case receives a probability. Vacancies change the full-seated denominator. No constitutional removal, enactment or territorial outcome is selected. The piece distinguishes stronger bargaining power from authority to enact alone. It does not introduce the planning-only party structure or activate the held Corindal arc.

The Argent Ridge calendar-conversion reminder and unspecified spring election date remain open after explicit editorial review. Neither reminder authorizes inventing a deadline. Korda ratification, Statehood, housing disposition, EM nomination and equalization enactment remain unresolved. The new judicial reporting deadline is the only rescheduled reporting clock.

## Validation and preservation

Initial individual draft validation passes for all five records using `--allow-existing-seq` after sequential helper allocation. The publishing guard validates 261 records. There are no metadata suggestions on the five additions; the nine existing historical metadata suggestions are retained without editing their sources.

Completed local checks:

- `npm run world:publish-check`: passed, including the full test chain, guarded build, discovery, chronology, constitutional consistency and release compatibility.
- `python3 -B scripts/constitution-archive.py check --base c572f5f46beb2e11f3500c0082dfc71fcaeaab0b`: passed, including read-only first-parent recovery verification.
- All five individual draft checks: passed with no unresolved-canon violations. The two open date/calendar editorial reminders were reviewed as described above.
- Built discovery verified 392 pages and all 261 record routes, dossier dates, related links, stream navigation and constitutional anchors.
- A byte comparison with the base commit verified all **256 existing World sources** and **766 existing files under `docs/archive/`, State constitutional sources and selected canonical reference sources** unchanged. The only existing tracked files edited are Status, clocks and the equalization dossier summary/question.
- `git diff --check`: passed. No workflow, test, canonical Constitution or existing archive file is altered.

Final remote results are attached to [PR #261 checks](https://github.com/jcr0916-hue/federatedrepublic/pull/261/checks). Merge is conditional on successful World publishing, Constitution archival and Vercel checks on the final head, with review state clear. The recovery-only Constitution job is intentionally skipped on PRs. Production results are verified against the deployed public routes after merge. No branch deletion is authorized.
