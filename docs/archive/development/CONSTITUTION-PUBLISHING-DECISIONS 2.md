# Constitutional and publishing experiments — outcomes and reuse guidance

**Recorded:** 2026-10-13. Consult this before reopening an already tested idea. References are to historical merged PRs and the earlier unmerged source branches. Distinguish recorded outcomes from ideas not adopted.

## Enumerated competence and subsidiarity

**Earlier original experiment:** [`constitutional-subsidiarity-transition`](https://github.com/jcr0916-hue/federatedrepublic/tree/constitutional-subsidiarity-transition) enumerated federal competence and explored the constitutional derivatives and prior-claim scenario. Its eight previously branch-only commits have been retained through the permanent archive branch via [history-only merge f2ecc598](https://github.com/jcr0916-hue/federatedrepublic/commit/f2ecc59894455ca93aadb14ec377bf57b60f35f3).

**Subsequent adopted work:** [PR #96](https://github.com/jcr0916-hue/federatedrepublic/pull/96), from a *different* branch (`constitutional-subsidiarity-transition-v2`), replaced the broad §3.10 peace/order/good-government competence with enumerated federal powers, strengthened subsidiarity in §15.8 and §15.8.a, and revised Article XIX transition mechanics. Its prior-claim scenario and derivatives were synchronized.

**Decision:** Do not reintroduce the original draft wholesale or treat its eight commits as an unaddressed constitutional issue. It is predecessor design material; compare individual proposals against current §3.10, §15.8/§15.8.a, and Article XIX before considering *new* changes. Historical material is not automatically current law.

## Constitution text-economy and continuity review

[PR #109](https://github.com/jcr0916-hue/federatedrepublic/pull/109) documents the 10 October review's reported reduction from 28,615 to 25,828 words, corrected references, and design rules: a fallback needs no additional fallback, specify outcomes rather than technology, leave operating details to elected institutions, and place publication duties in their general home. The review explicitly left at least one §1.8 rationale question open; do not mislabel every question as settled.

[PR #119](https://github.com/jcr0916-hue/federatedrepublic/pull/119) recorded concrete continuity and procedural changes: §2.11 declarations, essential chamber functions, expiry/review bounds, §2.7 emergency-law designation, §1.19 review, simple-majority definition in §3.7, acting-office functions in §7.8, and §17.1 popular-ratification thresholds. The separately discussed Continuity of Government v2 proposal remained excluded.

**Avoid redoing:** Consult the design-principles record and original open-items list before proposing another fallback, new clock, or explanatory sentence. Focus on unresolved defects in the *current* edition rather than reopening an older text simply because an archived branch contains it.

## World metadata and publishing safety

[PR #12](https://github.com/jcr0916-hue/federatedrepublic/pull/12) introduced **advisory** keyword-assisted metadata warnings; front matter remained editorial authority.

The original [`publishing-safety-and-papers`](https://github.com/jcr0916-hue/federatedrepublic/tree/publishing-safety-and-papers) branch explored registries, guardrails, and a design-paper publishing system across 12 unique commits. All those commits are now reachable from the permanent archive through [f2ecc598](https://github.com/jcr0916-hue/federatedrepublic/commit/f2ecc59894455ca93aadb14ec377bf57b60f35f3).

[PR #14](https://github.com/jcr0916-hue/federatedrepublic/pull/14) **adopted** blocking publication checks for drafts, invalid metadata, unfinished helper markers, and invalid relationships, plus `npm run world:publish-check`. It expressly **did not adopt** the design-paper and registry experiments at that time. Its reported validation was 39 tests passing, with a build/discovery check covering 227 pages and 132 World records *at the time* (not current counts).

**Avoid redoing:** Before building another World registry, paper workflow, or publish guard, compare the archived experiment against today's tooling. Existing blocking checks already solve specific failure classes; a registry/papers proposal must identify a remaining need instead of recreating the previous prototype.

## Constitutional archival and current outputs

[PR #124](https://github.com/jcr0916-hue/federatedrepublic/pull/124) established previous-pair preservation and verified historical renderers. [PRs #126–129](https://github.com/jcr0916-hue/federatedrepublic/pull/129) completed indexed recovery and separate exceptions handling. [PR #130](https://github.com/jcr0916-hue/federatedrepublic/pull/130) removed the Preamble from canonical current text; [#131](https://github.com/jcr0916-hue/federatedrepublic/pull/131) regenerated annotated/PDF forms; [#132](https://github.com/jcr0916-hue/federatedrepublic/pull/132) fixed stale navigation.

**Avoid redoing:** Never restore a discarded Preamble or stale Constitution from an old branch. The current source is `constitution_data.json` and current generated Markdown is `docs/constitution-current.md`. Historical pair archives must remain immutable.

## Decision protocol for future work

Before repeating an experiment, write down **the previous question, measured or reviewed result, adoption/rejection status, unresolved problem, what materially changed, and the regression evidence needed**. Missing measurement data must remain marked unknown. The historical branch records preserve traceability; this decision register is the entry point for avoiding repeated work.
