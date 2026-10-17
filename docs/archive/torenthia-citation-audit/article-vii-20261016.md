# Article VII citation audit — completed-text baseline

**Recorded:** 16 October 2026. **Result:** Reference updates and clarifications.
**Delivery:** audit complete; proposed corrections await PR review.

## Authority and coverage

- Merged baseline: [`fc41e26b97dedcce9b84dacb7380b0ab9575eec2`](https://github.com/jcr0916-hue/federatedrepublic/commit/fc41e26b97dedcce9b84dacb7380b0ab9575eec2), including the completed constitutional review and the single-candidate restoration in PR #195; concurrent scenario corrections through PR #196 are retained.
- Source: [canonical Constitution at that commit](https://github.com/jcr0916-hue/federatedrepublic/blob/fc41e26b97dedcce9b84dacb7380b0ab9575eec2/constitution_data.json).
- Article: Article VII — Elections and Federal Office; 16 current provisions.
- Article SHA-256: `f3c56d5802d713c7ddf069538c66ba936232eb12ee08407d49cc8d0580992963` (sorted keys, compact UTF-8 JSON, `ensure_ascii=False`).
- All 279 pages in the four requested corpora were screened. 22 non-profile pages contain an explicit reference to this article in the recorded baseline; see the inventory below. State references were distinguished separately.
- Method, validation, scope limits, and the branch handoff: [completion record](remaining-articles-20261016.md).

## Current identifiers, names, and anchors

- §7.1 — Consular Election System — `s7-1`.
- §7.2 — Federal Elections — `s7-2`.
- §7.2.a — Special Elections and Postponements — `s7-2a`.
- §7.3 — Electoral Supermajority Threshold — `s7-3`.
- §7.4 — Eligibility and Disclosure for Federal Office — `s7-4`.
- §7.5 — Removal from Federal Office — `s7-5`.
- §7.6 — Continuity and Acting Service — `s7-6`.
- §7.7 — Official Capacity Protection — `s7-7`.
- §7.8 — Separation of Branch Authority — `s7-8`.
- §7.9 — Inviolability of Electoral Mandates — `s7-9`.
- §7.10 — Ethics and Financial Disclosure — `s7-10`.
- §7.11 — Codes of Conduct and Conflicts of Interest — `s7-11`.
- §7.12 — Post-Service Restrictions — `s7-12`.
- §7.13 — Federal Public Service Ethics — `s7-13`.
- §7.14 — Compensation of Federal Officials — `s7-14`.
- §7.15 — Authority by Constitutional Operation — `s7-15`.

## Findings and decisions

### [_data/scenarioBridges.json](../../../_data/scenarioBridges.json)

- scenario-the-direction: align the §7.11 reading-link title with the current canonical name.
- scenario-the-three-recusals: align the §7.11 reading-link title with the current canonical name.

### [scenario-deadlock.html](../../../scenario-deadlock.html)

- Provision tag: §7.6 Office Continuity → §7.6 Continuity and Acting Service.

### [scenario-long-count.html](../../../scenario-long-count.html)

- Provision tag: §7.6 Office Continuity → §7.6 Continuity and Acting Service.

### [scenario-recalled-senator.html](../../../scenario-recalled-senator.html)

- Provision tag: §7.6 Office Continuity → §7.6 Continuity and Acting Service.

### [scenario-the-administrator.html](../../../scenario-the-administrator.html)

- Provision tag: §7.2 State Election Administration → §7.2 Federal Elections.

### [scenario-the-direction.html](../../../scenario-the-direction.html)

- Provision tag: §7.10 → §7.10 Ethics and Financial Disclosure.

### [scenario-the-formation.html](../../../scenario-the-formation.html)

- Provision tag: §7.4 Eligibility → §7.4 Eligibility and Disclosure for Federal Office.

### [scenario-the-holdout.html](../../../scenario-the-holdout.html)

- Provision tag: §7.3 Electoral Supermajority → §7.3 Electoral Supermajority Threshold.

### [scenario-the-severed-clause.html](../../../scenario-the-severed-clause.html)

- Provision tag: §7.3 Electoral Supermajority → §7.3 Electoral Supermajority Threshold.

### [scenario-the-suspension.html](../../../scenario-the-suspension.html)

- Provision tag: §7.3 Electoral Supermajority → §7.3 Electoral Supermajority Threshold.

### [scenario-the-three-recusals.html](../../../scenario-the-three-recusals.html)

- Do not attribute a deleted list of statutory examples to constitutional text.
- Keep the fictional statutory workflow without a constitutional prohibition absent from §7.13.
- Provision tag: §7.10 Ethics and Conflict of Interest → §7.10 Ethics and Financial Disclosure.
- Provision tag: §7.13 Federal Employee and Military Disclosure → §7.13 Federal Public Service Ethics.

### [scenario-the-waiver.html](../../../scenario-the-waiver.html)

- Retain the consular waiver while acknowledging §7.3's amendment exception.

## Inspected reference inventory

These are baseline page matches, not a list of pages requiring changes. Generic rights references, statements of political opinion, and lawful choices within a statutory process are not automatically rewritten.

- [torenthia-news-058.html](../../../torenthia-news-058.html)
- [torenthia-nrs-002.html](../../../torenthia-nrs-002.html)
- [torenthia-nrs-007.html](../../../torenthia-nrs-007.html)
- [torenthia-nrs-010.html](../../../torenthia-nrs-010.html)
- [scenario-deadlock.html](../../../scenario-deadlock.html)
- [scenario-harder-ballot.html](../../../scenario-harder-ballot.html)
- [scenario-long-count.html](../../../scenario-long-count.html)
- [scenario-recalled-senator.html](../../../scenario-recalled-senator.html)
- [scenario-the-administrator.html](../../../scenario-the-administrator.html)
- [scenario-the-cause.html](../../../scenario-the-cause.html)
- [scenario-the-classification.html](../../../scenario-the-classification.html)
- [scenario-the-direction.html](../../../scenario-the-direction.html)
- [scenario-the-first-war.html](../../../scenario-the-first-war.html)
- [scenario-the-formation.html](../../../scenario-the-formation.html)
- [scenario-the-graduation.html](../../../scenario-the-graduation.html)
- [scenario-the-holdout.html](../../../scenario-the-holdout.html)
- [scenario-the-rate.html](../../../scenario-the-rate.html)
- [scenario-the-severed-clause.html](../../../scenario-the-severed-clause.html)
- [scenario-the-suspension.html](../../../scenario-the-suspension.html)
- [scenario-the-three-hours.html](../../../scenario-the-three-hours.html)
- [scenario-the-three-recusals.html](../../../scenario-the-three-recusals.html)
- [scenario-the-waiver.html](../../../scenario-the-waiver.html)

All nine State profiles were also screened. Their State Constitution section numbers remain unchanged. Kelvant’s federal §§15.4 and 15.5.a(3) references and Arvane’s acknowledgment of the federal rights floor remain applicable. This federal audit does not re-audit the State Constitutions or update the profiles’ political frontiers.

## Preservation and validation

No federal or State constitutional source, constitutional PDF, chronology, clock, shared State template, or published identity/date was changed. The annotated display, full-text search, and generated quick reference are synchronized to the merged §2.6.a restoration as a verified publishing dependency. The canonical State-history page The Winning Bid is byte-identical to the baseline. The dated record preserves the comparison and decisions; subsequent changes require a dated supplement. Validation results and the review PR are retained in the [completion record](remaining-articles-20261016.md) and [branch handoff](../development/branches/torenthia-articles-ii-xx-audit-20261016.md).
