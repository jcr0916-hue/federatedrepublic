# Torenthia — chat-independent editorial handoff

**Prepared 2026-11-03 (real world).** A future VP/chat should read this, `EDITORIAL-CURRENT-STATUS.md`, `STORY-BIBLE.md`, `STORY-STATUS.md`, current Constitution, and *then* GitHub's current main HEAD and open PRs. This file is a timestamped snapshot; it does not replace live GitHub checks or published records.

## Where matters stand

- Verified main HEAD at time of snapshot: `c8d43dbd2aabfe0260fb9eb095529382a6bb0764`.
- Published fictional time: **Year 14, Month 2**. Last narrative sequence **181**; NRS sequence **135**.
- Latest merged main publications: news 134, *The Two-Sailing Week* by Maren Vey in *The Westport Ledger*; NRS 134, Council informational Lake Varda/budget-calendar summary; NRS 135, Elections Panel contribution-record processing/publication-readiness review. Neither NRS entry creates a narrative worldSeq.
- Unverified: live website deploy status. Merge/CI evidence is not independent proof of deploy.
- User's preferred workflow: agents receive built-in current federal Constitution, act as independent sources of prose, and submit drafts; President authorizes merges; **never put local agent initialization files in GitHub unless requested**; provide verified downloadable markdown/ZIP packages instead.

## Open review work — verify live status

| PR | Content | Decision needed |
|---|---|---|
| [#283](https://github.com/jcr0916-hue/federatedrepublic/pull/283) | **Draft** debut media opinion articles: *The Clock Is Not the Problem*, Halen Druse / The Verentum Review (staged worldSeq 182, news 135); *Two Sailings, and a Committee Drawing Pictures*, Ilsa Varn / The Common Interest (staged worldSeq 183, news 136) | Review HTML, publication checks, current frontier; ask President before merge |
| [#284](https://github.com/jcr0916-hue/federatedrepublic/pull/284) | **Draft** correct STORY-STATUS frontier from 178/133 to 181/135 | Review/merge with approval; reconcile future frontier if #283 merges first |
| [#282](https://github.com/jcr0916-hue/federatedrepublic/pull/282) | Draft Partisan Media Agent setup files mistakenly committed to GitHub | President expected local downloadable files; do not merge reflexively; ask whether to close |
| [#279](https://github.com/jcr0916-hue/federatedrepublic/pull/279) | Operating philosophy / naming | Still open; preserve President's preference |
| [#278](https://github.com/jcr0916-hue/federatedrepublic/pull/278) | Orath qualification docs | Still open; don't misread open docs PR as unfinished testing |

## Agent qualification and first candidates

- Solara agent **passed Tests 01–03 on November 3**, regular supervised operations approved. A **24-member proportional RCV territorial Assembly, four-year terms, Chief Minister elected by the Assembly (13/24), constructive no-confidence, 30-day successor election** are approved design from Compact v0.3. Ostara is its civic center; 0.9 million, 9 federal Assembly seats and no senators. Distinguish federal Ostara district roll NRS 109 (three federal Assembly seats, five qualified candidates) from territorial institutions. Compact is an approved governing editorial reference, **not a newly enacted law**. The exact locally downloaded v0.3 should be treated as the source document; do not reconstruct and call it verbatim.
- Solara Test 02 candidate **“The Book at the Harbor Office”**, by proposed **Alin Ferris**, proposed local paper **The Ostara Soundings**, characters **Nessa Riel**, **Tomas Ivar**, **Pella Orr**. Accepted for publication preparation, with three copyedits: give a distinct ending from Westport Ledger, clarify harbor office as a new proposed local detail, avoid asserting “most workers weekly” without evidence. Tide book is a proposed non-official observed-conditions ledger, not NRS/legal science. No fabricated history or ferry rationale.
- Solara Test 03 candidate **“The Split Road Out of Ostara”**: hypothetical public-works debate between maintaining Ostara buildings and coastal/outlying roads/access; proposed minister Renn Arvath, member Lio Carden; proposed Chief Minister Maren Voss and member Sela Marrow should be renamed to avoid overlap with Maren Vey/Dara Voss/Sela Hart/Sela Breck. **Do not canonize votes, government acts or officeholders from a hypothetical test.** Avoid invented archipelago (“outer islands” should be “outlying coastal communities”), lifetime road-wait history, unverified absence of failures, and in-article disclaimer. The editorial agent passed, but article needs copyedits and explicit canon approval before scheduling.
- Korda qualified, two accepted candidates: `agents/korda/publication-candidates/when-the-lake-thaws-before-the-road-does.md`, `agents/korda/publication-candidates/the-table-across-the-lake.md`. See `agents/korda/QUALIFICATION-STATUS-20261101.md`.
- Varek **already finished qualification** (no new test needed); `agents/varek/publication-candidates/the-crew-at-tessin-ford.md` accepted for final copy/continuity checks.
- Corindal `agents/corindal/publication-candidates/before-the-ground-thaws.md` accepted with final checks pending.
- Federal `agents/federal/publication-candidates/the-reports-that-will-outlast-the-officeholder.md` accepted with specific evidence/canon checks pending.
- Partisan Media qualified. Third desk *The Meridian Standard* has no approved first article yet. Opinion columns PR #283 are not canon until merged.
- Solara's ferry rationale is **not established**. The Common Interest intends to seek it; **Solara Agent now exists** and can be asked to consider an answer as a proposal, without invented official reply. No forced deadline.
- Older Torenthia-story frontiers and pilot notes should not be treated as a more current agent roster.

## Fictional-story constraints to preserve

- Solara Statehood: first audit passed; second pending. Marisvia's historical claims/dispute unresolved. Historical Solara federal-seat bid is a past fact; no new capital selection process initiated. §18.2 hosting now operates through a statutory selection and federal operational use rights; Verentum remains current seat. Solara's future capital ambitions are a *possible* long-range arc, not an order to agent.
- Korda Convention adopted proposal 28–5; affected electors not finally certified, no referendum result/date or jurisdiction change.
- Lake Varda civilian-navigation conference has no agreement.
- Federal fiscal equalization committee has no formula/remedy. No active EM failure finding.
- Executive Monitor Reya Solt remains in office, no established vacancy/expiry date, §9.3 60-day lottery fallback begins only **after** vacancy. No joint Speaker nominee, no lottery.
- Four qualified Legat Consul candidates Ines Carrow, Seren Mak, Tobias Vael, Pell Sandris; no scheduled voting date or result.
- No arbitrary “daily NRS quota,” no automatic crisis. Local life and independent perspectives matter.

## Resume checklist

1. Refresh GitHub main SHA and the actual last front-matter worldSeq/nrsSeq, and check open PRs; beware of overlapping planned IDs.
2. Look for merge approval already given. Never assume a draft PR was merged; do not merge into `main` without President's approval.
3. Read latest qualification-status docs, not outdated setup-stage headings. If contradictory, date and source the contradiction, do not silently downgrade agents.
4. Ask local agents for independent pitches/official proposals; separate published facts from draft intentions and new story proposals.
5. Edit accepted pieces on feature branches and run publishing/world validation before recommending merges; site deployment must be separately verified.
6. Update current-status/handoff docs whenever an agent qualifies, a PR merges, an editorial decision is made, or constitutional material changes.
7. Keep the Constitution in all agents' reference material current and do not mix Torenthia with the separate Constitution-Lab project.
