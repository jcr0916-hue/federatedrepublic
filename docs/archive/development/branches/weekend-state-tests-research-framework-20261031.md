# Weekend development handoff — 2026-10-31

**Original branch:** `weekend/state-tests-research-framework-20261031`
**PR:** [#271](https://github.com/jcr0916-hue/federatedrepublic/pull/271)
**Head at handoff:** final revision pending; parent `7f2486aaeb3952090c958c7b39c7831c30fe236b`, with exact final SHA/results recorded in PR checks.
**Status:** source-reviewed and locally validated; merge conditional on final remote checks. Historical cases and internal documentation ship on merge; paper design and State-agent architecture remain proposals.

## Purpose and changes

Weekend development against repaired main, without routine Torenthia World/NRS releases or an advance in fictional time:

- Repaired main `3613442cf5fe9bdde23c064e9f7825e62f27acaf` ([#272](https://github.com/jcr0916-hue/federatedrepublic/pull/272)) is already an ancestor through `7f2486aa`; verified after fetching both live refs. No repair content is reverted or duplicated.
- [Orath test 02](../../../../state-tests/orath/orath-test-02-the-county-service-mandate.html): Year 8, Month 4; State §§5.6–5.7 distinguish funding a material new county function from generally applicable minimum standards and preserve effective remote access.
- [Corindal test 02](../../../../state-tests/corindal/corindal-test-02-the-entry-that-stayed-visible.html): Year 7, Month 11; State §8.1 preserves an original register entry and traceable correction. Source review corrected the draft's municipal transport board to a **State** board, matching §8.1(b)(viii) rather than inventing a wider compulsory register category. Independent of current character arcs.
- [Paper framework](../../../research/CONSTITUTION-PAPER-FRAMEWORK.md): research design and source hierarchy, with fictional illustrations distinguished from empirical evidence and duplicate archive aliases distinguished from textual revisions.
- [Internal political/character reference](../../../torenthia/POLITICAL-CHARACTER-PLANNING.md): integrates the author's October 31 upload, preserving all six party identities, character intentions, polling distinctions and non-spoiler constraints. Records original-upload SHA-256 and source review. No official election results or numerical party baseline are invented.
- [Bible](../../../torenthia/STORY-BIBLE.md) records verified relationships and labeled authoring constraints; [Status](../../../torenthia/STORY-STATUS.md) retains factual open threads and links to conditional future planning. Its stale frontier is corrected to the already-published 178/133, without adding a record. Existing policy options and fiscal timing are preserved as conditional planning.
- [State pilot](../../../torenthia/STATE-STORY-PILOT.md): one-State evaluation, maintained source packets, local agency, central continuity/publication review, one canonical article and common site presentation. No agents are deployed. Documentation hubs link the frameworks.

## Actual verification

- `npm ci --offline --no-audit --no-fund`: passed; locked dependencies unchanged.
- `npm run world:publish-check`: passed: **44 Python archive tests, 169 Node tests**, 415 built pages, all 270 existing public records, **19 State historical tests** with bidirectional provision/profile discovery, 55 scenarios, 20 federal articles and 177 provisions; constitutional consistency and release compatibility pass.
- `python3 -B scripts/constitution-archive.py check --base 3613442cf5fe9bdde23c064e9f7825e62f27acaf`: passed; full first-parent recovery verified against committed evidence **without writes**. Final committed-head check is required again before merge.
- `npm run test:world-packet`: rerun after the last Bible/Status edits; both tests passed.
- Preservation comparison against repaired main: **zero changes** to all 617 archive files, State/federal constitutional sources and current generated text, Stats, chronology/clocks or any existing World/NRS/court/dispatch record.
- Built-output review: both new historical routes exist; `docs/` and imported political/long-range planning text are absent from public output. `git diff --check` passes.
- [Final remote checks](https://github.com/jcr0916-hue/federatedrepublic/pull/271/checks) must pass on the final head before an ordinary merge with an expected-SHA guard. Verify the subsequent main publishing run and exact production merge SHA; do not infer success from local results.

## Decisions and limits

Reuse State-test discovery, provision callouts and site styles. Validators establish metadata, consistency and links; editorial source review supplies the legal/prose interpretation. Do not treat fictional cases as empirical constitutional validation or copied archive filenames as independent versions.

Preserve the distinction between established publication, approved author intention and unresolved possibility. The six-party map does not retroactively name earlier published parties. Installation votes, dated working support and approval are distinct indicators. Current election, Korda, fiscal and appointment outcomes remain unresolved unless actually published. Keep Rehn/Corindal independent and ordinary reports free of future plot details. Routine World/NRS publication remains paused October 31–November 1, 2026 (real-world).

Research question, scholarly corpus, citation style and venue remain undecided; no completed paper or external empirical finding is claimed. State-agent selection, implementation and pilot results are **not established**.

## Preservation and branch disposition

This permanent note is completed in the same PR; no post-merge archive commit is required. Use a **merge commit** so the original tip and intermediate work remain reachable from main. All 617 archive files and permanent cold storage `0053ac4da09d32807d7f5b71ef0fff2075b421c1` are preserved unchanged.

Live inspection found only PR #271 open, no literal branch reference in repository workflows, no local automation configuration directory, no Vercel deployment/domain/custom environment bound to this branch, and no repository rulesets or protected branch flag. The Vercel project is the intended `federatedrepublic` project/team. **External deploy-hook and branch-scoped setting clearance is not established** by the connector; no `dependencies: none` deletion attestation is asserted.

**Disposition pending merge:** retain while open; after merge, guarded [three-branch rolling cleanup](https://github.com/jcr0916-hue/federatedrepublic/actions/workflows/rolling-branch-cleanup.yml) must record actual retention/deletion in its preview/actual ledger. Keep the three newest eligible completed branches plus dependency/protection/history exceptions under [the lifecycle policy](../BRANCH-LIFECYCLE.md). This branch remains held while external dependency clearance is uncertain, even if it later falls outside the buffer. Do not force deletion, alter cold storage, or enable unconditional delete-on-merge. The eventual workflow ledger, rather than a second PR just to edit this note, records actual closure.
