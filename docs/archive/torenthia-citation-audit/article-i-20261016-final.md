# Article I citation audit — completed-text baseline

**Recorded:** 16 October 2026. **Result:** Reference updates.
**Delivery:** audit complete; proposed corrections await PR review.

## Authority and coverage

- Merged baseline: [`fc41e26b97dedcce9b84dacb7380b0ab9575eec2`](https://github.com/jcr0916-hue/federatedrepublic/commit/fc41e26b97dedcce9b84dacb7380b0ab9575eec2), including the completed constitutional review and the single-candidate restoration in PR #195; concurrent scenario corrections through PR #196 are retained.
- Source: [canonical Constitution at that commit](https://github.com/jcr0916-hue/federatedrepublic/blob/fc41e26b97dedcce9b84dacb7380b0ab9575eec2/constitution_data.json).
- Article: Article I — Individual Sovereignty and Rights; 20 current provisions.
- Article SHA-256: `a8fc5b21c70a02b6174ed9f56190b2a355186827fcc90fa51cdf3984c9d46faf` (sorted keys, compact UTF-8 JSON, `ensure_ascii=False`).
- All 279 pages in the four requested corpora were screened. 28 non-profile pages contain an explicit reference to this article in the recorded baseline; see the inventory below. State references were distinguished separately.
- Method, validation, scope limits, and the branch handoff: [completion record](remaining-articles-20261016.md).

## Current identifiers, names, and anchors

- §1.1 — Right to Courts and Legal Remedy — `s1-1`.
- §1.2 — Individual Sovereignty Floor — `s1-2`.
- §1.3 — Prohibition of Torture and Cruel Treatment — `s1-3`.
- §1.4 — Prohibition of Slavery and Forced Labor — `s1-4`.
- §1.5 — Civil and Political Liberties — `s1-5`.
- §1.6 — Equality and Non-Discrimination — `s1-6`.
- §1.7 — Privacy, Property, and Security of the Home — `s1-7`.
- §1.8 — Democratic Participation — `s1-8`.
- §1.9 — Right to Bear Arms — `s1-9`.
- §1.10 — Habeas Corpus — `s1-10`.
- §1.11 — Rights of the Accused and Fair Trial — `s1-11`.
- §1.12 — Right to a Public Trial — `s1-12`.
- §1.13 — Freedom from Retroactive Criminal Law — `s1-13`.
- §1.14 — Double Jeopardy — `s1-14`.
- §1.14.a — Conduct Lawful in Another Jurisdiction — `s1-14a`.
- §1.15 — Environmental Obligations — `s1-15`.
- §1.16 — Emergency Derogation — `s1-16`.
- §1.16.a — Non-Derogable Rights — `s1-16a`.
- §1.17 — Right to Seek Asylum — `s1-17`.
- §1.18 — Non-Refoulement — `s1-18`.

## Findings and decisions

The [original Article I pilot](article-i-20261016.md) remains preserved against its earlier baseline. PR #189 subsequently closed the numbering gaps; PR #190 clarified privacy scope; PR #191 clarified the Senate briefing on foreign intelligence. The current mapping and rights names above supersede the pilot for current use. The original record is not rewritten.

The final corpus contains no unresolved federal Article I identifier. The duty-of-refusal example now identifies prior judicial authorization for surveillance within the Republic under §1.7; see the [Article II record](article-ii-20261016.md). State §1 references remain State citations.

### [_data/scenarioBridges.json](../../../_data/scenarioBridges.json)

- scenario-second-declaration: align the §1.16 reading-link title with the current canonical name.
- scenario-second-declaration: align the §1.16.a reading-link title with the current canonical name.

## Inspected reference inventory

These are baseline page matches, not a list of pages requiring changes. Generic rights references, statements of political opinion, and lawful choices within a statutory process are not automatically rewritten.

- [torenthia-news-040.html](../../../torenthia-news-040.html)
- [torenthia-news-052.html](../../../torenthia-news-052.html)
- [torenthia-nrs-005.html](../../../torenthia-nrs-005.html)
- [torenthia-nrs-013.html](../../../torenthia-nrs-013.html)
- [torenthia-nrs-021.html](../../../torenthia-nrs-021.html)
- [scenario-finality-act.html](../../../scenario-finality-act.html)
- [scenario-harder-ballot.html](../../../scenario-harder-ballot.html)
- [scenario-organized-third.html](../../../scenario-organized-third.html)
- [scenario-second-declaration.html](../../../scenario-second-declaration.html)
- [scenario-sponsoring-state.html](../../../scenario-sponsoring-state.html)
- [scenario-the-administrator.html](../../../scenario-the-administrator.html)
- [scenario-the-departure.html](../../../scenario-the-departure.html)
- [scenario-the-first-twelve-years.html](../../../scenario-the-first-twelve-years.html)
- [scenario-the-first-war.html](../../../scenario-the-first-war.html)
- [scenario-the-founding-choice.html](../../../scenario-the-founding-choice.html)
- [scenario-the-graduation.html](../../../scenario-the-graduation.html)
- [scenario-the-ledger.html](../../../scenario-the-ledger.html)
- [scenario-the-order.html](../../../scenario-the-order.html)
- [scenario-the-petition.html](../../../scenario-the-petition.html)
- [scenario-the-redaction.html](../../../scenario-the-redaction.html)
- [scenario-the-restoration.html](../../../scenario-the-restoration.html)
- [scenario-the-return.html](../../../scenario-the-return.html)
- [scenario-the-severed-clause.html](../../../scenario-the-severed-clause.html)
- [scenario-the-sixty-percent.html](../../../scenario-the-sixty-percent.html)
- [scenario-the-third-strike.html](../../../scenario-the-third-strike.html)
- [scenario-the-unremovable.html](../../../scenario-the-unremovable.html)
- [scenario-void-exception.html](../../../scenario-void-exception.html)
- [scenario-winning-bid.html](../../../scenario-winning-bid.html)

All nine State profiles were also screened. Their State Constitution section numbers remain unchanged. Kelvant’s federal §§15.4 and 15.5.a(3) references and Arvane’s acknowledgment of the federal rights floor remain applicable. This federal audit does not re-audit the State Constitutions or update the profiles’ political frontiers.

## Preservation and validation

No federal or State constitutional source, constitutional PDF, chronology, clock, shared State template, or published identity/date was changed. The annotated display, full-text search, and generated quick reference are synchronized to the merged §2.6.a restoration as a verified publishing dependency. The canonical State-history page The Winning Bid is byte-identical to the baseline. The dated record preserves the comparison and decisions; subsequent changes require a dated supplement. Validation results and the review PR are retained in the [completion record](remaining-articles-20261016.md) and [branch handoff](../development/branches/torenthia-articles-ii-xx-audit-20261016.md).
