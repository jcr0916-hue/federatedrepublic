# Branch history — trim-article-6-2026-10-15

**Original branch:** `trim-article-6-2026-10-15`  
**PR:** to be filled in once opened (draft)  
**Head commit at handoff:** see the PR  
**Status:** proposed (shipped only once the PR merges)

## Purpose
Trim Article VI to the text settled with John one provision at a time. Follows PR #166 (Article V, merged). Guiding rule: make it possible for the government to function; do not solve every imaginable case.

## Changes and artifacts
- `constitution_data.json` plus generated files (`annotated.html`, `docs/constitution-current.md`, `docs/constitutional-quickref.md`, `search-index.js`, constitution archive pair `Constitution-261016-01`). 20 articles, 177 provisions.
- §6.1: Federal Sponsorship Category sentence, the aggregate-limits §1.6 proviso and the Territories §1.6 reference cut. §6.2: three-ground list cut, State sponsorship challenge limited to §1.6 with the court determining remedy, counsel paragraph restated; renumbered 1–4. §6.3: shelter paragraph and one sentence of the independence paragraph cut; renumbered 1–7. §6.3.a: "consistent with Article I" cut.
- Pages aligned: `scenario-the-return`, `scenario-sponsoring-state`, `quicksheet-immigration`; history entry `article-6-concise-261015`.
- `constitution-current.pdf` and `quicksheet-immigration.pdf` regenerated in the cloud container (subset fonts); a Mac render may differ slightly.

## Results and verification
- Passed: see the PR; the full `npm run world:publish-check` chain, the PDF checks and the archive check were run before opening it.

## Decisions and lessons
- §6.2(2) of the old text (three grounds for challenging a certification denial) was cut because §1.1 (remedy for any violation) and §4.5(4) (no legal injury without a forum) already provide review, and the list read as exclusive. The phrase "federal certification mandate" had no definition anywhere.
- State sponsorship denials: challenge only for §1.6 discrimination; the court determines the remedy. John's view is that leaving the remedy open lets a court act against malicious conduct; ordinary relief is vacatur because §6.1 gives States the sponsorship decision.
- Article I protections already apply to every person, so the old "retain the protections of Article I" wording was cut; the entitlement to appointed counsel in removal proceedings is the real content and stays.
- §6.3(1) (shelter, subsistence, medical care) was cut because §1.20 makes an asylum seeker an Inhabitant from claim and §12.1 entitles every Inhabitant.
- Kept as written: absolute bans on ideological screening and nationality quotas, vesting by operation of law, the 72-hour guardian rule, the §6.3.a liberty rule.

## Open follow-ups
- `scenario-the-unremovable` describes a supervised detention regime under §6.3.a (90-day initial review, 180-day reviews, five-year limit) that §6.3.a does not contain; the provision says the person "shall remain at liberty". Pre-existing mismatch, not changed here.
- Aggregate application limits have no processing deadline, so applicants could wait in a queue indefinitely. Left alone as a case not yet seen.
- Article VII onward continues the same article-by-article process.

## Preservation and branch disposition
- Results live on `main` once merged: the history entry, this note, and the regenerated constitution archive pair.
- Branch name dependencies (deployments, automation, external links): not checked.
- **Deletion approval:** Not granted by this note. Requires separate approved manifest and guarded cleanup.
