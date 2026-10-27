# Branch history — Thoss opinion column revision

**Original branch:** `content/torenthia-partisan-column-20261027`  
**PR:** not yet opened  
**Base:** `cb8fa9f1098198d20d0ad9304403311270350688` (merged [PR #261](https://github.com/jcr0916-hue/federatedrepublic/pull/261))  
**Head commit at handoff:** pending; final commit will be recorded on the PR  
**Status:** proposed editorial revision; not merged

## Purpose and changes

Rewrite news 128, originally *Three Assemblies Thoss Might Face*, as a persuasive partisan newspaper column. The revised title is *Give Thoss the Votes to Govern*. The existing source path, public route, worldId, sequence 175 and Year 14 Month 2 date remain fixed. No new World record is allocated.

- `torenthia/news/torenthia-news-128.html`: The Torenthian opinion column by Nella Rusk; stronger mandate, fragmented bargaining and possible replacement now form an argument about delivery rather than three detached numerical scenarios. Metadata, headline, deck and description agree; jurisdiction/provision tags match the revised coverage. No core dossier tag is added.
- `docs/torenthia/STORY-BIBLE.md`: retain Rusk as a new opinion voice; Dara Voss remains an RNN analytical reporter.
- `docs/torenthia/STORY-STATUS.md`: replace the superseded hypothetical-count description with the column's current posture. Original PR #261 publication review and handoff remain historically preserved.

## Editorial evidence and decisions

Read the Story Bible, current Status, Year 14 proposals, publishing guide, original PR #261 handoff/publication review, relevant published stories/records, and generated equalization and Argent Ridge source packets. Checked current constitutional provisions directly, including §§2.5–2.7, 3.1–3.3, 8.2, 12.2, 12.6 and 18.4.

- **Party identity:** published canon establishes Thoss's coalition but no party name or national party ledger. Status's two-major-party structure is explicitly planning-only. The user's requested party sympathy is expressed through Rusk's “our party” and disclosed support; no party name, coalition size or local candidate allegiance is invented.
- **Program:** NRS 113 and news 122 establish merit appointments/promotions, regulatory clarity, backlog reporting within existing authority/appropriations, a civic budget proposal and support for housing/equalization work. Rusk's preferred sequencing, narrow-bill bargains and warnings are predictions or recommendations, not new official commitments.
- **Equalization:** NRS 074/076/127 retain competing approaches and evidence; no estimates, weights, enacted formula or EM noncompliance finding are invented. The column allows both completion before the election and inheritance of unfinished work.
- **Tenure and powers:** the published 266/274 counts remain coalition support, not party totals. Replacement requires an absolute majority of full seated membership electing one named serving-member successor; 251 is conditional on all 500 seats being filled. Thoss has no legislative vote. Senate, appropriations and State consent remain independent constraints.
- **Housing/Trust:** NRS 114/115/118 and news 124 establish bill passage, the siting objection and the Speaker's pause/scheduled withdrawal motion. No later disposition, extended pause, new housing, Norvane consent or Trust protection is claimed. Repeal and designation remain separate.
- **Election:** news 127/current §3.2 supply district RCV mechanics. No date, poll, probability, election result or national seat model is introduced; the column expressly identifies its judgments as prospective.
- **Rejected:** relabeling Dara Voss as a party columnist, naming a planning-only party, retaining artificial seat scenarios, and reporting future story plans as facts.

## Verification

Before editing, all 1,530 tracked local files matched the blobs in remote main's complete Git tree. The local mirror has different commit ancestry, so remote publication will use the verified main commit/tree as its parent/base and include only the four changed paths.

Completed local verification:

- `node scripts/validate-world-draft.mjs --file torenthia/news/torenthia-news-128.html --allow-existing-seq`: passed with no unresolved-canon violations. The two existing reminders concern the unspecified spring election date and Argent Ridge calendar conversion; neither is resolved or dated by this revision.
- `npm run world:publish-check`: passed the full release chain, including tests, guarded build, chronology, metadata, rendered discovery and constitutional/release consistency. Discovery verified 392 built pages and all 261 public records. The nine existing historical metadata suggestions are unchanged; news 128 has no metadata suggestion.
- `python3 -B scripts/constitution-archive.py check --base e133cc0ee191231ebb358506c4a7818ceebc5b9d`: passed, including first-parent recovery verification without writes. That local mirror commit's complete tracked tree was verified identical to remote main before editing.
- Built HTML inspection: title, headline, deck, byline and Opinion label agree with metadata; homepage, World Latest and Complete Record show the revision at the original route. Artificial scenario headings/counts are absent. This was a parsed rendered-HTML inspection, not a browser screenshot review.
- Byte comparison: 1,527 of 1,530 existing tracked files remain identical to the verified main tree, including the other 260 World sources, all 763 existing archive files and `constitution_data.json`. Only article 128, Bible and Status changed; the fourth path is this new handoff.
- `git diff --check`: passed.

Remote checks will be linked on the PR; do not infer a deployment from a local build. No merge or production deployment is performed by this revision task.

## Open follow-ups and preservation

The revision is proposed, not shipped. Election scheduling/results, party names/totals, housing disposition, equalization enactment and Trust consent remain unresolved. No experiment, poll or model was run. Reuse the published program and disclosed opinion voice; never reuse the superseded hypothetical seat groups as reported political facts.

Canonical Constitution, other World sources, historical editorial records and `archive/legacy-project-material` are outside the edit set. The original article remains in Git history and PR #261. Deployment/automation branch-name dependencies have not been assessed for deletion.

**Deletion approval:** not granted; preserve the branch pending separate review.
