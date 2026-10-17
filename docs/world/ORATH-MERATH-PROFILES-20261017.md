# Orath and Merath profile editorial record — October 17, 2026

## Authority and scope

Prepared from `main` at `3d3ce16` for the [weekend objectives](../operations/WEEKEND-OBJECTIVES-2026-10-17.md). Read the actual State sources, current profile and Constitution templates, existing profiles, [World Story Bible](../WORLD-STORY-BIBLE.md), [World Story Status](../WORLD-STORY-STATUS.md), shared statistics ledger, map labels/borders, and the published records listed below. New profiles use the merged editorial reading flow from [PR #176](https://github.com/jcr0916-hue/federatedrepublic/pull/176) and retain [PR #178](https://github.com/jcr0916-hue/federatedrepublic/pull/178)’s removal of the duplicate Constitution block.

These are evergreen profiles, not newly sequenced World publications. No `worldSeq`, `nrsSeq`, fictional date, election result, officeholder, statute, constitutional wording, or State historical test is added. No Bible/status rewrite is needed. Population, federal representation and audit labels continue to come from `_data/stats.js`; State legislative size ranges are identified as constitutional ranges, not current chamber counts. After accepting the profiles, the user also authorized the older Orath article correction recorded below.

## Orath source decisions

- `State Constitutions/orath-state-constitution.md`: all thirteen articles read. Preamble/§13.6 ground an agricultural identity capable of economic change; §§2.1–2.3 and 3.2–3.6 ground the Grange, selection of the Steward, constructive confidence, veto and emergency limits.
- §§1.5–1.6, 4.4 and 6.4 ground cooperative participation, labor remedies and worker independence; §§5.1–5.9 distinguish public county/municipal government from cooperative economic authority.
- §1.4 and Article X ground water access and the Toren Tributary Water Board, with multiple user categories, scarcity priorities and federal/interstate limits. No new international water outcome or local allocation is asserted.
- Articles VIII, IX and XI ground accessible records, fiscal stabilization, geographic service costs and education access. Authorized assistance is not presented as a newly adopted program or guaranteed commodity price.
- `torenthia-news-086.html` (Year 13, Month 12) supplies Dorven’s replaced freight scale and the Merath technician. The profile attributes Hale’s reporting rather than inventing a new scene or quotation.
- `torenthia-nrs-97.html` / NRS-Y14-0009 and `torenthia-news-114.html` (Year 14, Month 1) supply the current seasonal-freight/election context. No shortage, quota, candidate response or new funding failure is inferred.
- Dorven is an established Orath town and Ledger location; it is **not labeled the State capital**. A capital is not established in the consulted sources, and no map coordinates or city claims are invented.

## Merath source decisions

- `State Constitutions/merath-state-constitution.md`: all twelve articles read. Articles II–III ground the five-person collective executive, distinct Popular/Assembly Councillor mandates and tenures, limited Chair, four-year Assembly, 60/40 district/compensatory allocation and constitutional membership range.
- Article I and §4.4 ground enforceable worker rights and independent Labor Tribunals; §§5.2–5.4 and 7.2–7.4 ground cooperative purchases, industrial districts, municipal home rule, utilities and advisory planning. Statutory options remain options; no new district, public utility acquisition or Planning Council appointment is asserted.
- §1.16 and Articles VIII–X ground immediate versus resource-dependent duties, permitted tax instruments, protected appropriations, recorded Council votes, independent audit and privacy. No current tax rates, benefit amounts or fiscal outcomes are invented.
- §12.5 preserves equal standing for people outside paid employment. §12.4 leaves the seat to law; no capital or named manufacturing city is fabricated.
- `torenthia-news-091.html` (Year 13, Month 12) supplies the Merath freight cooperative’s reported shorter quoted westbound shipping times following Arvane’s Westport expansion. Quoted times are not represented as measured universal reductions.
- `torenthia-nrs-99.html` / NRS-Y14-0011 (Year 14, Month 1) supplies routine inspection scheduling only. No breach, closure or emergency is asserted.

## Presentation and discovery

Both profiles register in `_data/statepages.js`, which supplies sibling navigation, map hotspots and directory links. Only Orath/Merath summary strings change in `_data/stats.js`; numerical facts and all other jurisdiction entries remain unchanged. Formatted State readers link back to the profiles and to the original Markdown, copied byte-for-byte by Eleventy. The shared reader renders escaped Markdown bold safely, preserves a second italic front-matter tagline, and recognizes Merath’s “Adopted by the working people” closing line separately from §12.6. No constitutional source is edited.

The profile template keeps its compact overview → uninterrupted feature → Explore rail sequence. Its only copy adjustment removes the stale claim that the rail precedes the continuing profile. Flag provenance, palettes and limitations are recorded in [the visual-identity note](visual-identity/ORATH-MERATH-FLAGS.md).

Rendered-text verification exposed federal glossary popups being injected into State text: “constructive vote of no confidence” acquired a Civic Consul explanation beside Orath’s Steward, and Merath’s “absolute majority” acquired a seated-membership definition despite its explicit authorized-membership denominator. State profiles and State constitutional readers are now excluded from federal glossary injection. Other page families retain their existing glossary behavior.

## Resolved Orath population/status inconsistency

`torenthia-news-039.html` originally called Orath a “Territory” of 140,000 people, conflicting with the current State Constitution, Story Bible, and shared ledger (State; 5.4 million). The user accepted both profiles and explicitly requested correction of this issue on October 17, 2026. The article now identifies Orath as a State of five million four hundred thousand people. The unsupported comparison with Verentum’s third district is removed, the later “this Territory” reference becomes “this State,” and the closing threshold reflection no longer treats the erroneous 140,000 as a collective public opinion.

The corrected passage distinguishes equal jurisdictional counting in Phase One from the signature requirement based on each jurisdiction’s eligible voters, consistent with federal §13.1(2). It invents neither an eligible-voter count nor a statutory percentage. The two visiting petitioners, four hours at the table, nine signatures, market-day setting, narrator, publication metadata and established story events remain unchanged. This is an editorial continuity correction, not a fictional population increase, change of status, completed petition threshold or new publication. The original wording remains preserved in Git history at [the pre-correction tip](https://github.com/jcr0916-hue/federatedrepublic/blob/ef6ea002e693ec2807edbf1c063de6868988eb64/torenthia-news-039.html).

## Verification

Actual publishing, link/discovery, source-integrity and browser results are recorded in the [permanent branch handoff](../archive/development/branches/orath-merath-profiles-20261017.md). No merged/publication status is claimed by this editorial record.
