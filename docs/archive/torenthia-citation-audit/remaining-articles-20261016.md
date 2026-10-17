# Completion record — Articles II–XX and final Article I follow-up

**Recorded:** 16 October 2026. **Status:** all twenty articles audited against the completed merged text; corrections proposed for user review.

## Baseline and scope

- Branch: `audit/torenthia-articles-ii-xx-20261016`; merged baseline: [`c39e7086b4e65d6a93fbaead6f729aafbbfb1161`](https://github.com/jcr0916-hue/federatedrepublic/commit/c39e7086b4e65d6a93fbaead6f729aafbbfb1161).
- Constitution source SHA-256: `e9c10b5e7cbfa3c7b5622784d5d9c1b6724435de70f314b47b0aa6c94c00c64b`. Twenty articles, 177 provisions. Each article record contains its own source-object hash, identifiers, current names, and anchors.
- Screened 115 published news pages, 101 NRS pages, 54 scenario pages (including canonical State history outside the general library), and nine State profiles: 279 pages total.
- Compared decoded section and paragraph references, ordinary `Section` references, article terminology, provision tags, publication metadata, current powers, thresholds and timing where a mismatch arose, and the rendered reading rails. The curated scenario-reference data is part of those published rails.
- The original [Article I pilot](article-i-20261016.md), merged in [PR #182](https://github.com/jcr0916-hue/federatedrepublic/pull/182), remains unchanged. Its [dated follow-up](article-i-20261016-final.md) records the later renumbering and final text.

## What changed

Most changes align provision tags and reading-link names with canonical titles, correct authority references, or replace superseded paragraph references. Classification belongs to §10.2; the Convention paragraph is §15.5.a(3); the positive remainder assessment is §15.5.a(2); incapacity declination is §2.16(6).

The source comparison also verified five conflicts in hypothetical setups or consequences:

- **The Order:** lawful surveillance within the Republic needs prior judicial authorization under §1.7; executive direction under §2.3 alone is insufficient. The lawful operation is given that authorization. The unlawful rendition, refusal, investigation, and remedy remain.
- **The First Nomination:** current §4.4 confirmation requires a majority of the full seated Senate. The old 61–39 result would confirm, contradicting the example’s rejection. It is changed to 41–59 to retain the rejection and subsequent nomination. The Year 2 vacancy is early, rather than expiry of a founding term; §19.10 founding terms are four, eight, and twelve years.
- **The Formation:** the clock runs from a vacancy, not every general election. The setup identifies the outgoing Consul’s departure, keeps the day sequence and eventual election result, and removes a one-candidate fallback absent from §2.6.a.
- **Automatic Floor:** §12.2(5) withholds legislative pay when the interim appropriation starts, independently of civil-service pay. The seventeen-day impasse and uninterrupted public services remain.
- **The Severed Clause:** §13.2(1) requires an initial eligibility determination. The example now describes the erroneous favorable determination and preserves the later vote and judicial severance.

Other explanatory corrections address the Federal Prosecution Service’s independence, required responses to Monitor reports, independent political expression, social-rights standards and remedies, public confirmation safeguards, the Endowment’s fund-transfer route, treaty authorization limits, and the removed constitutional twenty-year capital-host timetable. The per-article records identify each affected file and reason.

No published Torenthia event, election result, court holding, candidate position, World sequence ID, or fictional date is changed. The five procedural examples above are general hypotheticals, not Torenthian canon. All nine State profiles and the canonical Winning Bid page are unchanged. No Orath or Merath page or asset is created; the [weekend plan](../../operations/WEEKEND-OBJECTIVES-2026-10-17.md) remains independent.

## Validation

The final `npm run world:publish-check` passed after the content and curated reading-rail updates: 337 built pages, 221 public records, five State historical tests, all 54 scenario pages, and all 177 constitutional provisions. The base-relative Constitution archive guard and whitespace check also passed.

An additional read-only pass verified all 279 sources, 1,923 decoded federal citation occurrences, 243 canonical scenario tags, 1,496 built constitutional links, and all twenty completed-text article records. Publication identity/date metadata, all nine profiles, canonical Winning Bid history, the original Article I record, constitutional sources, and scope boundaries were preserved. Local archival/documentation links resolved. These mechanical checks support the recorded semantic review; they do not replace it.

## Limits and continuation

This completes the requested federal article-by-article citation audit for the recorded four corpora. It is not a rewrite of all published content or a general audit of State law. Court opinions, dispatches, dossiers, standalone quick sheets, old development notes, and sealed fixtures are outside the requested corpora; linked targets and shared material rendered on the audited pages are checked as dependencies. Political arguments and attributed statements are retained where they can represent the speaker’s view rather than a claim of current law.

The State-profile political summaries are not advanced by this audit. Independent statutory details are not invented when a constitutional clause has been removed. In particular, the next federal-host competition’s statutory timetable is not established here. The current Constitution and merged published history continue to control future writing.

No unresolved in-scope stale identifier or verified functional conflict remains in the corrected passages. The phrase “complete” records completion of the audit; the proposed fixes are shipped only after review and merge. Future constitutional changes or publications require a dated supplement rather than overwriting these records.

The [branch handoff](../development/branches/torenthia-articles-ii-xx-audit-20261016.md) retains delivery and branch-preservation information. Branch deletion is not authorized by this audit.
