# Article III citation audit — completed-text baseline

**Recorded:** 16 October 2026. **Result:** Reference updates and clarifications.
**Delivery:** audit complete; proposed corrections await PR review.

## Authority and coverage

- Merged baseline: [`c39e7086b4e65d6a93fbaead6f729aafbbfb1161`](https://github.com/jcr0916-hue/federatedrepublic/commit/c39e7086b4e65d6a93fbaead6f729aafbbfb1161), including the completed constitutional review through PR #191.
- Source: [canonical Constitution at that commit](https://github.com/jcr0916-hue/federatedrepublic/blob/c39e7086b4e65d6a93fbaead6f729aafbbfb1161/constitution_data.json).
- Article: Article III — The Legislature; 11 current provisions.
- Article SHA-256: `b0b987e3b32745d83194976099acb573fc22ea7e21bf09f846d91bb1debe1ad8` (sorted keys, compact UTF-8 JSON, `ensure_ascii=False`).
- All 279 pages in the four requested corpora were screened. 24 non-profile pages contain an explicit reference to this article in the recorded baseline; see the inventory below. State references were distinguished separately.
- Method, validation, scope limits, and the branch handoff: [completion record](remaining-articles-20261016.md).

## Current identifiers, names, and anchors

- §3.1 — The Legislature — `s3-1`.
- §3.2 — The Assembly — `s3-2`.
- §3.3 — Electoral Districts — `s3-3`.
- §3.4 — Legislative Standards — `s3-4`.
- §3.5 — The Senate — `s3-5`.
- §3.6 — Treaties and Trade Agreements — `s3-6`.
- §3.7 — Legislative Process and Passage — `s3-7`.
- §3.8 — Legislative Oversight — `s3-8`.
- §3.9 — Independent Statutory Agencies — `s3-9`.
- §3.10 — Federal Legislative Competence — `s3-10`.
- §3.11 — Delegation of Authority — `s3-11`.

## Findings and decisions

### [_data/scenarioBridges.json](../../../_data/scenarioBridges.json)

- scenario-alliance-clause: align the §3.6 reading-link title with the current canonical name.

### [scenario-alliance-clause.html](../../../scenario-alliance-clause.html)

- Treaty withdrawal begins with a Legat notice; the Senate affirms it.
- Provision tag: §3.6 Treaty Ratification → §3.6 Treaties and Trade Agreements.

### [scenario-coordination-failure.html](../../../scenario-coordination-failure.html)

- Provision tag: §3.7 Legislative Process → §3.7 Legislative Process and Passage.

### [scenario-recalled-senator.html](../../../scenario-recalled-senator.html)

- Provision tag: §3.2(6) State Recall → §3.2 The Assembly.

### [scenario-the-coalition.html](../../../scenario-the-coalition.html)

- Use the full-membership threshold required for constructive replacement.
- Provision tag: §3.2 The Speaker → §3.2 The Assembly.

### [torenthia-news-056.html](../../../torenthia-news-056.html)

- Qualify deemed approval to majority measures and preserve affirmative-vote requirements.

## Inspected reference inventory

These are baseline page matches, not a list of pages requiring changes. Generic rights references, statements of political opinion, and lawful choices within a statutory process are not automatically rewritten.

- [torenthia-news-010.html](../../../torenthia-news-010.html)
- [torenthia-news-024.html](../../../torenthia-news-024.html)
- [torenthia-news-035.html](../../../torenthia-news-035.html)
- [torenthia-news-041.html](../../../torenthia-news-041.html)
- [torenthia-news-042.html](../../../torenthia-news-042.html)
- [torenthia-news-056.html](../../../torenthia-news-056.html)
- [torenthia-news-109.html](../../../torenthia-news-109.html)
- [torenthia-nrs-010.html](../../../torenthia-nrs-010.html)
- [torenthia-nrs-026.html](../../../torenthia-nrs-026.html)
- [torenthia-nrs-088.html](../../../torenthia-nrs-088.html)
- [scenario-alliance-clause.html](../../../scenario-alliance-clause.html)
- [scenario-coordination-failure.html](../../../scenario-coordination-failure.html)
- [scenario-first-nomination.html](../../../scenario-first-nomination.html)
- [scenario-recalled-senator.html](../../../scenario-recalled-senator.html)
- [scenario-the-administrator.html](../../../scenario-the-administrator.html)
- [scenario-the-audit.html](../../../scenario-the-audit.html)
- [scenario-the-coalition.html](../../../scenario-the-coalition.html)
- [scenario-the-contraction.html](../../../scenario-the-contraction.html)
- [scenario-the-map.html](../../../scenario-the-map.html)
- [scenario-the-petition.html](../../../scenario-the-petition.html)
- [scenario-the-prior-claim.html](../../../scenario-the-prior-claim.html)
- [scenario-the-restoration.html](../../../scenario-the-restoration.html)
- [scenario-the-three-recusals.html](../../../scenario-the-three-recusals.html)
- [scenario-the-vote.html](../../../scenario-the-vote.html)

All nine State profiles were also screened. Their State Constitution section numbers remain unchanged. Kelvant’s federal §§15.4 and 15.5.a(3) references and Arvane’s acknowledgment of the federal rights floor remain applicable. This federal audit does not re-audit the State Constitutions or update the profiles’ political frontiers.

## Preservation and validation

No federal or State Constitution, generated constitutional text/PDF, chronology, clock, shared State template, or published identity/date was changed. The canonical State-history page The Winning Bid is byte-identical to the baseline. The dated record preserves the comparison and decisions; subsequent changes require a dated supplement. Validation results and the review PR are retained in the [completion record](remaining-articles-20261016.md) and [branch handoff](../development/branches/torenthia-articles-ii-xx-audit-20261016.md).
