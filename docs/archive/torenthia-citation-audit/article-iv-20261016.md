# Article IV citation audit — completed-text baseline

**Recorded:** 16 October 2026. **Result:** Reference updates and documented hypothetical procedure corrections.
**Delivery:** audit complete; proposed corrections await PR review.

## Authority and coverage

- Merged baseline: [`c39e7086b4e65d6a93fbaead6f729aafbbfb1161`](https://github.com/jcr0916-hue/federatedrepublic/commit/c39e7086b4e65d6a93fbaead6f729aafbbfb1161), including the completed constitutional review through PR #191.
- Source: [canonical Constitution at that commit](https://github.com/jcr0916-hue/federatedrepublic/blob/c39e7086b4e65d6a93fbaead6f729aafbbfb1161/constitution_data.json).
- Article: Article IV — The Judicial Architecture; 9 current provisions.
- Article SHA-256: `f1e0d384b51c1e886261983d8b3b06d817806a6ec9b940110a0f76ce61480154` (sorted keys, compact UTF-8 JSON, `ensure_ascii=False`).
- All 279 pages in the four requested corpora were screened. 20 non-profile pages contain an explicit reference to this article in the recorded baseline; see the inventory below. State references were distinguished separately.
- Method, validation, scope limits, and the branch handoff: [completion record](remaining-articles-20261016.md).

## Current identifiers, names, and anchors

- §4.1 — Court Structure — `s4-1`.
- §4.2 — Judicial Appointments and Independence — `s4-2`.
- §4.3 — The Supreme Court — `s4-3`.
- §4.3.a — Supreme Court Justice Removal — `s4-3a`.
- §4.4 — Supreme Court Selection — `s4-4`.
- §4.4.a — Public Confirmation — `s4-4a`.
- §4.5 — Judicial Review and Scope — `s4-5`.
- §4.5.a — Judicial Decisions and Privacy — `s4-5a`.
- §4.6 — Judgment Recognition — `s4-6`.

## Findings and decisions

### [scenario-automatic-floor.html](../../../scenario-automatic-floor.html)

- Provision tag: §4.5 Constitutional Continuity → §4.5 Judicial Review and Scope.

### [scenario-finality-act.html](../../../scenario-finality-act.html)

- Provision tag: §4.5 Judicial Review and Constitutional Authority → §4.5 Judicial Review and Scope.

### [scenario-first-nomination.html](../../../scenario-first-nomination.html)

- Remove a founding-term end in Year 2: §19.10 founding judicial terms are four, eight, or twelve years.
- Keep Year 2, the departing justice, and the vacancy; correct its classification as an early vacancy.
- A 61–39 vote would confirm under current §4.4(3); use 41–59 to preserve the hypothetical rejection and second nomination.
- Keep the recorded tally consistent with the corrected failed vote.
- Replace the obsolete two-thirds confirmation threshold.
- Use §4.4(3)'s majority of full seated membership.
- Explain the current confirmation rule without retaining the discarded supermajority rationale.

### [scenario-second-declaration.html](../../../scenario-second-declaration.html)

- Provision tag: §4.5 Judicial Review → §4.5 Judicial Review and Scope.

### [scenario-sponsoring-state.html](../../../scenario-sponsoring-state.html)

- Provision tag: §4.5 Judicial Review and Constitutional Authority → §4.5 Judicial Review and Scope.

### [scenario-the-administrator.html](../../../scenario-the-administrator.html)

- Provision tag: §4.5 Judicial Review → §4.5 Judicial Review and Scope.

### [scenario-the-holdout.html](../../../scenario-the-holdout.html)

- Provision tag: §4.4 SC Selection → §4.4 Supreme Court Selection.
- Remove the deleted prohibition on ordinary nomination of an otherwise eligible serving Temporary Associate Justice.

### [scenario-the-map.html](../../../scenario-the-map.html)

- Provision tag: §4.5 Judicial Review and Constitutional Authority → §4.5 Judicial Review and Scope.

### [scenario-the-prior-claim.html](../../../scenario-the-prior-claim.html)

- Provision tag: §4.5 Judicial Review → §4.5 Judicial Review and Scope.

### [scenario-the-third-strike.html](../../../scenario-the-third-strike.html)

- Provision tag: §4.5 Judicial Review → §4.5 Judicial Review and Scope.

### [torenthia-nrs-039.html](../../../torenthia-nrs-039.html)

- Cite public judicial decisions and NRS publication, rather than the interim-order power.
- Align worldProvisions with the corrected operative authorities so the generated reading rail points to them.

## Inspected reference inventory

These are baseline page matches, not a list of pages requiring changes. Generic rights references, statements of political opinion, and lawful choices within a statutory process are not automatically rewritten.

- [torenthia-news-065.html](../../../torenthia-news-065.html)
- [torenthia-nrs-037.html](../../../torenthia-nrs-037.html)
- [torenthia-nrs-039.html](../../../torenthia-nrs-039.html)
- [scenario-automatic-floor.html](../../../scenario-automatic-floor.html)
- [scenario-coordination-failure.html](../../../scenario-coordination-failure.html)
- [scenario-finality-act.html](../../../scenario-finality-act.html)
- [scenario-first-nomination.html](../../../scenario-first-nomination.html)
- [scenario-second-declaration.html](../../../scenario-second-declaration.html)
- [scenario-sponsoring-state.html](../../../scenario-sponsoring-state.html)
- [scenario-the-administrator.html](../../../scenario-the-administrator.html)
- [scenario-the-cause.html](../../../scenario-the-cause.html)
- [scenario-the-direction.html](../../../scenario-the-direction.html)
- [scenario-the-holdout.html](../../../scenario-the-holdout.html)
- [scenario-the-map.html](../../../scenario-the-map.html)
- [scenario-the-prior-claim.html](../../../scenario-the-prior-claim.html)
- [scenario-the-rate.html](../../../scenario-the-rate.html)
- [scenario-the-return.html](../../../scenario-the-return.html)
- [scenario-the-severed-clause.html](../../../scenario-the-severed-clause.html)
- [scenario-the-third-strike.html](../../../scenario-the-third-strike.html)
- [scenario-the-three-recusals.html](../../../scenario-the-three-recusals.html)

All nine State profiles were also screened. Their State Constitution section numbers remain unchanged. Kelvant’s federal §§15.4 and 15.5.a(3) references and Arvane’s acknowledgment of the federal rights floor remain applicable. This federal audit does not re-audit the State Constitutions or update the profiles’ political frontiers.

## Preservation and validation

No federal or State Constitution, generated constitutional text/PDF, chronology, clock, shared State template, or published identity/date was changed. The canonical State-history page The Winning Bid is byte-identical to the baseline. The dated record preserves the comparison and decisions; subsequent changes require a dated supplement. Validation results and the review PR are retained in the [completion record](remaining-articles-20261016.md) and [branch handoff](../development/branches/torenthia-articles-ii-xx-audit-20261016.md).
