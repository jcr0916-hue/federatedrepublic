# Article XVII citation audit — completed-text baseline

**Recorded:** 16 October 2026. **Result:** Reference updates.
**Delivery:** audit complete; proposed corrections await PR review.

## Authority and coverage

- Merged baseline: [`c39e7086b4e65d6a93fbaead6f729aafbbfb1161`](https://github.com/jcr0916-hue/federatedrepublic/commit/c39e7086b4e65d6a93fbaead6f729aafbbfb1161), including the completed constitutional review through PR #191.
- Source: [canonical Constitution at that commit](https://github.com/jcr0916-hue/federatedrepublic/blob/c39e7086b4e65d6a93fbaead6f729aafbbfb1161/constitution_data.json).
- Article: Article XVII — Constitutional Amendments; 4 current provisions.
- Article SHA-256: `9322d4af576482ce8b09bcbb17fa7be6e138d6e21156dcd600891592b6a42e00` (sorted keys, compact UTF-8 JSON, `ensure_ascii=False`).
- All 279 pages in the four requested corpora were screened. 3 non-profile pages contain an explicit reference to this article in the recorded baseline; see the inventory below. State references were distinguished separately.
- Method, validation, scope limits, and the branch handoff: [completion record](remaining-articles-20261016.md).

## Current identifiers, names, and anchors

- §17.1 — Amendment Paths — `s17-1`.
- §17.2 — No Executive Veto; Amendment Takes Effect — `s17-2`.
- §17.3 — Amendment Consistency and Supremacy — `s17-3`.
- §17.4 — Supremacy of This Constitution — `s17-4`.

## Findings and decisions

### [scenario-the-direction.html](../../../scenario-the-direction.html)

- Provision tag: §17.4 → §17.4 Supremacy of This Constitution.

### [scenario-void-exception.html](../../../scenario-void-exception.html)

- Provision tag: §17.3 Amendment Consistency and Limitations → §17.3 Amendment Consistency and Supremacy.

The amendment referendum thresholds, non-derogable-rights limit, partial-void example, and constitutional supremacy remain applicable. No amendment result or ratification count changes.

## Inspected reference inventory

These are baseline page matches, not a list of pages requiring changes. Generic rights references, statements of political opinion, and lawful choices within a statutory process are not automatically rewritten.

- [scenario-the-direction.html](../../../scenario-the-direction.html)
- [scenario-the-severed-clause.html](../../../scenario-the-severed-clause.html)
- [scenario-void-exception.html](../../../scenario-void-exception.html)

All nine State profiles were also screened. Their State Constitution section numbers remain unchanged. Kelvant’s federal §§15.4 and 15.5.a(3) references and Arvane’s acknowledgment of the federal rights floor remain applicable. This federal audit does not re-audit the State Constitutions or update the profiles’ political frontiers.

## Preservation and validation

No federal or State Constitution, generated constitutional text/PDF, chronology, clock, shared State template, or published identity/date was changed. The canonical State-history page The Winning Bid is byte-identical to the baseline. The dated record preserves the comparison and decisions; subsequent changes require a dated supplement. Validation results and the review PR are retained in the [completion record](remaining-articles-20261016.md) and [branch handoff](../development/branches/torenthia-articles-ii-xx-audit-20261016.md).
