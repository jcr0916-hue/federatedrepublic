# Article II citation audit — completed-text baseline

**Recorded:** 16 October 2026. **Result:** Reference updates and documented hypothetical procedure corrections.
**Delivery:** audit complete; proposed corrections await PR review.

## Authority and coverage

- Merged baseline: [`fc41e26b97dedcce9b84dacb7380b0ab9575eec2`](https://github.com/jcr0916-hue/federatedrepublic/commit/fc41e26b97dedcce9b84dacb7380b0ab9575eec2), including the completed constitutional review and the single-candidate restoration in PR #195; concurrent scenario corrections through PR #196 are retained.
- Source: [canonical Constitution at that commit](https://github.com/jcr0916-hue/federatedrepublic/blob/fc41e26b97dedcce9b84dacb7380b0ab9575eec2/constitution_data.json).
- Article: Article II — The Dual Executive; 24 current provisions.
- Article SHA-256: `68860659af27655d1a2b5f34dbd6e60bf662d56a4f4a7aeb5ef36d755005a55b` (sorted keys, compact UTF-8 JSON, `ensure_ascii=False`).
- All 279 pages in the four requested corpora were screened. 46 non-profile pages contain an explicit reference to this article in the recorded baseline; see the inventory below. State references were distinguished separately.
- Method, validation, scope limits, and the branch handoff: [completion record](remaining-articles-20261016.md).

## Current identifiers, names, and anchors

- §2.1 — The Legat Consul — Domain and Term — `s2-1`.
- §2.2 — Military Authorization Framework — `s2-2`.
- §2.3 — Consular Intelligence — `s2-3`.
- §2.3.a — Legat Consul Legislative Veto — `s2-3a`.
- §2.4 — Legat Consul International Agreements — `s2-4`.
- §2.4.a — Domain Officers — `s2-4a`.
- §2.5 — The Civic Consul — Domain and Term — `s2-5`.
- §2.6 — Constructive Vote of No Confidence — `s2-6`.
- §2.6.a — Government Formation — `s2-6a`.
- §2.7 — Civic Consul Legislative Instruments — `s2-7`.
- §2.8 — Duty of Refusal — `s2-8`.
- §2.9 — Legat Consul Succession and Incapacity — `s2-9`.
- §2.9.a — State Emergency Council — `s2-9a`.
- §2.10 — Executive Transparency — `s2-10`.
- §2.11 — Emergency Governance — `s2-11`.
- §2.12 — Clemency — `s2-12`.
- §2.13 — Consular Removal — `s2-13`.
- §2.14 — Council of Ministers — `s2-14`.
- §2.14.a — Cross-Domain Emergency Lead — `s2-14a`.
- §2.14.b — Cross-Domain Assistance — `s2-14b`.
- §2.15 — Federal Prosecution — `s2-15`.
- §2.16 — Executive Incapacity — `s2-16`.
- §2.17 — Cooling-Off from Executive Service — `s2-17`.
- §2.18 — Domestic Insurrection — `s2-18`.

## Findings and decisions

### [_data/scenarioBridges.json](../../../_data/scenarioBridges.json)

- scenario-the-formation: align the §2.6.a reading-link title with the current canonical name.
- scenario-the-coalition: align the §2.6 reading-link title with the current canonical name.

### [annotated.html](../../../annotated.html)

- Regenerate the §2.6.a display from the merged single-candidate restoration; the previously published derived block still contained the superseded two-candidate minimum.

### [docs/constitutional-quickref.md](../../../docs/constitutional-quickref.md)

- Regenerate the derived §2.6.a timing excerpt from the merged source; no canonical constitutional text changes.

### [scenario-coordination-failure.html](../../../scenario-coordination-failure.html)

- Provision tag: §2.14.a Cross-Domain Emergency Coordination → §2.14.a Cross-Domain Emergency Lead.
- Provision tag: §2.4 Consular Domain → §2.4 Legat Consul International Agreements.

### [scenario-the-coalition.html](../../../scenario-the-coalition.html)

- Provision tag: §2.6 Constructive No Confidence → §2.6 Constructive Vote of No Confidence.
- Provision tag: §2.5 The Civic Consul → §2.5 The Civic Consul — Domain and Term.
- Keep the published grounds as part of the hypothetical motion without attributing a deleted grounds-publication requirement to §2.6.

### [scenario-the-direction.html](../../../scenario-the-direction.html)

- Publication is a requirement, not a grant of control over individual prosecutorial decisions. Preserve the direction, refusal, and court result.
- Remove the obsolete claim that publication alone makes a specific-prosecution direction lawful.
- Retain the financial-conflict route actually decided; do not invent a different judicial holding.
- Preserve simultaneous publication as the event, without attributing a deleted timing rule to the Constitution.
- Replace the superseded blanket permission to direct specific prosecutions.
- Provision tag: §2.15 → §2.15 Federal Prosecution.
- Provision tag: §2.8 → §2.8 Duty of Refusal.
- Provision tag: §2.12 → §2.12 Clemency.
- Provision tag: §2.6 → §2.6 Constructive Vote of No Confidence.

### [scenario-the-first-war.html](../../../scenario-the-first-war.html)

- Provision tag: §2.2 Defense Execution → §2.2 Military Authorization Framework.

### [scenario-the-formation.html](../../../scenario-the-formation.html)

- Make the formation clock run from a vacancy, rather than automatically from every general election.
- Align the setup with the vacancy trigger.
- Use §2.6.a(1)'s actual starting event.
- Preserve routine continuity while identifying the vacancy and acting-service trigger.
- Retain PR #194’s merged correction of the acting reconsideration notice: a ten-business-day pause of review, with Assembly withdrawal possible, rather than a separate veto.
- Recheck against merged PR #195: §2.6.a(4) now allows up to four candidates and (5) expressly restores national yes-or-no confirmation for a sole candidate. Replace the superseded two-candidate minimum in the published explanation; retain the actual four-candidate result.
- Use the statutory period and constitutional maximum without an unsupported Panel extension power.
- Retain the electoral outcome while removing a denial inconsistent with the initial vacancy.
- Provision tag: §2.7 Suspensive Veto → §2.7 Civic Consul Legislative Instruments.

### [scenario-the-order.html](../../../scenario-the-order.html)

- Update the penalty-protection sentence number.
- Verified scope conflict: executive direction alone does not authorize surveillance within the Republic. State the judicial authorization supporting the already-lawful setup; the rendition, refusal, and outcome are unchanged.
- Correct the remaining bare sentence reference to the penalty protection.
- Quote current §2.8 and its three-sentence structure; retain the protected refusal, investigation, and disciplinary remedy.

### [scenario-the-referendum.html](../../../scenario-the-referendum.html)

- Provision tag: §2.1 Legat Consul → §2.1 The Legat Consul — Domain and Term.
- Provision tag: §2.5 Civic Consul → §2.5 The Civic Consul — Domain and Term.

### [scenario-the-three-hours.html](../../../scenario-the-three-hours.html)

- Provision tag: §2.9 Legat Consul Succession → §2.9 Legat Consul Succession and Incapacity.

### [scenario-the-twenty-four-hours.html](../../../scenario-the-twenty-four-hours.html)

- Map repeated-incapacity, duration, review, and declination paragraphs to current §2.16(2), (3), (4), and (6); retain the determinations and 24/48-hour clocks.
- Publication records the initial incapacity determination; it is not a separate condition of vesting under §§2.16(1), 7.15.
- Provision tag: §2.16(2)–(4) Restoration &amp; Recurring Incapacity → §2.16 Executive Incapacity.
- Provision tag: §2.16(6) Declination → §2.16 Executive Incapacity.
- Provision tag: §2.16(1) Acting Succession → §2.16 Executive Incapacity.
- Provision tag: §2.6 Constructive Removal → §2.6 Constructive Vote of No Confidence.
- Keep the recorded repeated determination and avoid an extra temporal qualification absent from the current provision.

### [scenario-the-vote.html](../../../scenario-the-vote.html)

- Provision tag: §2.7 Suspensive Veto → §2.7 Civic Consul Legislative Instruments.
- Provision tag: §2.5 The Civic Consul → §2.5 The Civic Consul — Domain and Term.

### [search-index.js](../../../search-index.js)

- Regenerate full-text search and its content revision from the unchanged merged Constitution; §2.6.a was stale after PR #195.

### [torenthia-news-010.html](../../../torenthia-news-010.html)

- Align worldProvisions with the corrected operative authorities so the generated reading rail points to them.
- Replace claimed Civic Consul concurrence with the current consultation rule; preserve the speech and treaty narrative.

### [torenthia-news-018.html](../../../torenthia-news-018.html)

- Route Civic Consul information rights to §2.5(5), rather than the external-intelligence provision.
- Align worldProvisions with the corrected operative authorities so the generated reading rail points to them.

### [torenthia-news-044.html](../../../torenthia-news-044.html)

- Use the current Council of Ministers description without presenting an old paraphrase as a quotation.

### [torenthia-nrs-007.html](../../../torenthia-nrs-007.html)

- Correct the eligibility reference; §2.4 governs international agreements.
- Align worldProvisions with the corrected operative authorities so the generated reading rail points to them.

### [torenthia-nrs-012.html](../../../torenthia-nrs-012.html)

- Remove a deleted constitutional claim of irrevocability; retain the 48-hour declination and last-successor rules.
- Use the current repeated-incapacity interval without adding an unstated restoration-based starting rule.

## Inspected reference inventory

These are baseline page matches, not a list of pages requiring changes. Generic rights references, statements of political opinion, and lawful choices within a statutory process are not automatically rewritten.

- [torenthia-news-009.html](../../../torenthia-news-009.html)
- [torenthia-news-010.html](../../../torenthia-news-010.html)
- [torenthia-news-012.html](../../../torenthia-news-012.html)
- [torenthia-news-014.html](../../../torenthia-news-014.html)
- [torenthia-news-018.html](../../../torenthia-news-018.html)
- [torenthia-news-031.html](../../../torenthia-news-031.html)
- [torenthia-news-041.html](../../../torenthia-news-041.html)
- [torenthia-news-042.html](../../../torenthia-news-042.html)
- [torenthia-news-043.html](../../../torenthia-news-043.html)
- [torenthia-news-044.html](../../../torenthia-news-044.html)
- [torenthia-news-068.html](../../../torenthia-news-068.html)
- [torenthia-news-094.html](../../../torenthia-news-094.html)
- [torenthia-news-098.html](../../../torenthia-news-098.html)
- [torenthia-news-110.html](../../../torenthia-news-110.html)
- [torenthia-nrs-001.html](../../../torenthia-nrs-001.html)
- [torenthia-nrs-002.html](../../../torenthia-nrs-002.html)
- [torenthia-nrs-003.html](../../../torenthia-nrs-003.html)
- [torenthia-nrs-004.html](../../../torenthia-nrs-004.html)
- [torenthia-nrs-007.html](../../../torenthia-nrs-007.html)
- [torenthia-nrs-010.html](../../../torenthia-nrs-010.html)
- [torenthia-nrs-012.html](../../../torenthia-nrs-012.html)
- [torenthia-nrs-014.html](../../../torenthia-nrs-014.html)
- [torenthia-nrs-017.html](../../../torenthia-nrs-017.html)
- [torenthia-nrs-025.html](../../../torenthia-nrs-025.html)
- [torenthia-nrs-044.html](../../../torenthia-nrs-044.html)
- [torenthia-nrs-049.html](../../../torenthia-nrs-049.html)
- [torenthia-nrs-052.html](../../../torenthia-nrs-052.html)
- [torenthia-nrs-072.html](../../../torenthia-nrs-072.html)
- [torenthia-nrs-092.html](../../../torenthia-nrs-092.html)
- [scenario-coordination-failure.html](../../../scenario-coordination-failure.html)
- [scenario-finality-act.html](../../../scenario-finality-act.html)
- [scenario-the-classification.html](../../../scenario-the-classification.html)
- [scenario-the-coalition.html](../../../scenario-the-coalition.html)
- [scenario-the-direction.html](../../../scenario-the-direction.html)
- [scenario-the-first-twelve-years.html](../../../scenario-the-first-twelve-years.html)
- [scenario-the-first-war.html](../../../scenario-the-first-war.html)
- [scenario-the-formation.html](../../../scenario-the-formation.html)
- [scenario-the-ledger.html](../../../scenario-the-ledger.html)
- [scenario-the-objection.html](../../../scenario-the-objection.html)
- [scenario-the-order.html](../../../scenario-the-order.html)
- [scenario-the-referendum.html](../../../scenario-the-referendum.html)
- [scenario-the-return.html](../../../scenario-the-return.html)
- [scenario-the-second-renewal.html](../../../scenario-the-second-renewal.html)
- [scenario-the-three-hours.html](../../../scenario-the-three-hours.html)
- [scenario-the-twenty-four-hours.html](../../../scenario-the-twenty-four-hours.html)
- [scenario-the-vote.html](../../../scenario-the-vote.html)

All nine State profiles were also screened. Their State Constitution section numbers remain unchanged. Kelvant’s federal §§15.4 and 15.5.a(3) references and Arvane’s acknowledgment of the federal rights floor remain applicable. This federal audit does not re-audit the State Constitutions or update the profiles’ political frontiers.

## Preservation and validation

No federal or State constitutional source, constitutional PDF, chronology, clock, shared State template, or published identity/date was changed. The annotated display, full-text search, and generated quick reference are synchronized to the merged §2.6.a restoration as a verified publishing dependency. The canonical State-history page The Winning Bid is byte-identical to the baseline. The dated record preserves the comparison and decisions; subsequent changes require a dated supplement. Validation results and the review PR are retained in the [completion record](remaining-articles-20261016.md) and [branch handoff](../development/branches/torenthia-articles-ii-xx-audit-20261016.md).
