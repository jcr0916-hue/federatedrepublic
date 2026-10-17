# Article XIII citation audit — completed-text baseline

**Recorded:** 16 October 2026. **Result:** Reference updates and documented hypothetical procedure corrections.
**Delivery:** audit complete; proposed corrections await PR review.

## Authority and coverage

- Merged baseline: [`fc41e26b97dedcce9b84dacb7380b0ab9575eec2`](https://github.com/jcr0916-hue/federatedrepublic/commit/fc41e26b97dedcce9b84dacb7380b0ab9575eec2), including the completed constitutional review and the single-candidate restoration in PR #195; concurrent scenario corrections through PR #196 are retained.
- Source: [canonical Constitution at that commit](https://github.com/jcr0916-hue/federatedrepublic/blob/fc41e26b97dedcce9b84dacb7380b0ab9575eec2/constitution_data.json).
- Article: Article XIII — Direct Democracy; 2 current provisions.
- Article SHA-256: `2337cca29d6cbc4a279267007492af5f7c255b8c672c51ce5d89acf2be35a3a4` (sorted keys, compact UTF-8 JSON, `ensure_ascii=False`).
- All 279 pages in the four requested corpora were screened. 11 non-profile pages contain an explicit reference to this article in the recorded baseline; see the inventory below. State references were distinguished separately.
- Method, validation, scope limits, and the branch handoff: [completion record](remaining-articles-20261016.md).

## Current identifiers, names, and anchors

- §13.1 — Optional Referendum — `s13-1`.
- §13.2 — Citizen Legislative Initiative — `s13-2`.

## Findings and decisions

### [_data/scenarioBridges.json](../../../_data/scenarioBridges.json)

- scenario-the-second-path: align the §13.2 reading-link title with the current canonical name.

### [scenario-the-severed-clause.html](../../../scenario-the-severed-clause.html)

- Verified conflict: current §13.2 requires a filing screen. Preserve the petition, popular vote, and severance outcome while supplying the erroneous threshold determination that precedes them.

### [torenthia-nrs-011.html](../../../torenthia-nrs-011.html)

- Consular review precedes enactment; keep the enacted law and filing date.
- Distinguish the repeal period from consular review.

## Inspected reference inventory

These are baseline page matches, not a list of pages requiring changes. Generic rights references, statements of political opinion, and lawful choices within a statutory process are not automatically rewritten.

- [torenthia-news-038.html](../../../torenthia-news-038.html)
- [torenthia-news-039.html](../../../torenthia-news-039.html)
- [torenthia-news-040.html](../../../torenthia-news-040.html)
- [torenthia-news-060.html](../../../torenthia-news-060.html)
- [torenthia-news-063.html](../../../torenthia-news-063.html)
- [torenthia-nrs-011.html](../../../torenthia-nrs-011.html)
- [torenthia-nrs-013.html](../../../torenthia-nrs-013.html)
- [torenthia-nrs-029.html](../../../torenthia-nrs-029.html)
- [scenario-organized-third.html](../../../scenario-organized-third.html)
- [scenario-the-second-path.html](../../../scenario-the-second-path.html)
- [scenario-the-severed-clause.html](../../../scenario-the-severed-clause.html)

All nine State profiles were also screened. Their State Constitution section numbers remain unchanged. Kelvant’s federal §§15.4 and 15.5.a(3) references and Arvane’s acknowledgment of the federal rights floor remain applicable. This federal audit does not re-audit the State Constitutions or update the profiles’ political frontiers.

## Preservation and validation

No federal or State constitutional source, constitutional PDF, chronology, clock, shared State template, or published identity/date was changed. The annotated display, full-text search, and generated quick reference are synchronized to the merged §2.6.a restoration as a verified publishing dependency. The canonical State-history page The Winning Bid is byte-identical to the baseline. The dated record preserves the comparison and decisions; subsequent changes require a dated supplement. Validation results and the review PR are retained in the [completion record](remaining-articles-20261016.md) and [branch handoff](../development/branches/torenthia-articles-ii-xx-audit-20261016.md).
