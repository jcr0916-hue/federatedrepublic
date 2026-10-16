# Branch history — trim-article-7-2026-10-15

**Original branch:** `trim-article-7-2026-10-15`  
**PR:** to be filled in once opened (draft)  
**Head commit at handoff:** see the PR  
**Status:** proposed (shipped only once the PR merges)

## Purpose
Review Article VII with John one provision at a time and apply the result. Follows PR #168 (merged). Guiding rule: make it possible for the government to function; do not solve every imaginable case.

## Changes and artifacts
- `constitution_data.json` plus generated files (`annotated.html`, `docs/constitution-current.md`, `docs/constitutional-quickref.md`, `search-index.js`, constitution archive pair `Constitution-261016-02`). 20 articles, 177 provisions.
- §7.1: State plurality defined inside paragraph (1); old (5) folded in; certification paragraph moved out; (2)–(4) keep their numbers. New §7.2(7): federal election and direct-vote results are final upon certification, subject only to timely Supreme Court review for material error. §7.3: one sentence cut, participation point folded in. §7.8: "That authority resumes…" sentence cut. §7.14: statute first, then the limit on setting one's own pay; "except as expressly authorized" cut.
- Unchanged after review: §7.2(1)–(6), §7.2.a, §7.4–§7.7, §7.9–§7.13, §7.15.
- Pages aligned: `quicksheet-elections`, `scenario-the-three-recusals`, `scenario-the-direction`; history entry `article-7-concise-261015`.
- `constitution-current.pdf` and `quicksheet-elections.pdf` regenerated in the cloud container (subset fonts); a Mac render may differ slightly.

## Results and verification
- Passed: see the PR; the full `npm run world:publish-check` chain, the PDF checks and the archive check were run before opening it.

## Decisions and lessons
- Finality on certification is a universal rule (John's proposal), placed in §7.2(7). Before, only consular elections had one, so Assembly and Senate results had no stated end point. The narrow Supreme Court review stays as the safety valve; the list of who may seek review was dropped in favor of statute.
- §7.10(1) is the definition of "disqualifying financial interest" that §9.4.a, §9.8 and §9.9.a cite, so it stays separate from the recusal duty in (3).
- §7.5 and §7.9 overlap but were left alone: merging would leave a numbering gap or force renumbering §7.10–§7.15, which are cited widely.
- Scenarios cited §7.11 for "preserves challenge to the affected act"; §7.11 has no such sentence. They now cite §7.10 for the recusal duty and §4.5(1) for court challenge.
- **Reuse:** before proposing to merge a definition into another paragraph, grep who cites it (§7.10(1) nearly went wrong).

## Open follow-ups
- §7.10(5) (Monitor investigation and referral) overlaps the Monitor mandate in Article IX; revisit when Article IX is reviewed.
- Article VIII onward continues the same article-by-article process.

## Preservation and branch disposition
- Results live on `main` once merged: the history entry, this note, and the regenerated constitution archive pair.
- Branch name dependencies (deployments, automation, external links): not checked.
- **Deletion approval:** Not granted by this note. Requires separate approved manifest and guarded cleanup.
