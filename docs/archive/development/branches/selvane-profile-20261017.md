# Branch history — content/selvane-profile-20261017

**Original branch:** `content/selvane-profile-20261017`

**PR:** pending

**Head commit at handoff:** pending; the PR will record the final tip

**Status:** proposed; not merged or shipped

**Recorded:** October 17, 2026 (America/Los_Angeles)

## Purpose

Complete the twelve-State profile inventory with Selvane, following merged [PR #200](https://github.com/jcr0916-hue/federatedrepublic/pull/200). Base: main `0edd9193a9170df6dde888336089158e000efe1f`. Reuse the completed local checkout on a new branch; retain the original Orath/Merath branch and its history.

## Changes and artifacts

- `torenthia-state-selvane.html`: source-linked editorial feature about civic equality, open professional public service, elected policy direction, proportional representation, local capacity, appointment fallbacks and citizen amendment. Thoss’s published federal district work supplies the opening; a separate federal-history card links Leva Coren’s founding-era story.
- `state-constitution-selvane.html` and Eleventy passthrough: formatted reader for the existing eight-article, seventy-section Constitution, with reciprocal profile link and byte-identical source download. No constitutional wording changes.
- `_data/statepages.js` completes all twelve map/directory/sibling routes. `_data/stats.js` changes Selvane’s summary only; numbers, audit statuses and every other State entry remain unchanged.
- Shared templates support a Constitution without a source subtitle or supplied flag: explicit description, no empty subtitle, one-column header, and no promise of a flag in the Explore intro. No flag or capital is invented.
- Safe State body rendering supports numbered lists with their original explicit values. Discovery verification accounts for semantic list markers; regression tests cover nonconsecutive numbers, clause separation and escaped markup. CSS gives numbered lists a safe inset and fixes the mobile contents menu inheriting global fixed-header styling.
- [Editorial/source record](../../../world/SELVANE-PROFILE-20261017.md) preserves authority, source decisions and boundaries. No World record/ID, date, election result, officeholder, clock, State historical test, map coordinate, Bible/status entry, or constitutional source changes.

## Results and verification

- Full `npm run world:publish-check`: passed, repeated after the reader display fixes. Includes 164 Node tests plus the Constitution archive tests, 343 built pages, 221 public records, five historical State tests, 54 scenarios and 177 federal provisions. Discovery verifies all twelve published State profile/Constitution pairs, source bytes, rendered provisions and glossary boundaries.
- Browser: profile and reader checked at 1440, 1024, 768, 390 and 320px. No document overflow, broken images, missing alt attributes, duplicate h1 or federal glossary injection. Verified eight article sections and all seventy provision anchors, numbered items 1–6, meaningful metadata, and text-only/flagless presentation. Mobile contents navigation stays below its summary in document flow.
- Map and directory → profile → Constitution/source → federal history → filtered archive flows passed at desktop/phone widths; nine Selvane archive records. Keyboard skip and related-rail navigation passed. Orath/Merath flags and sibling links, plus Varek’s bulleted reader/mobile contents, were checked for regressions. No local request failures or page errors in the completed browser run.
- Screenshots inspected on desktop and phone, including the opening, Explore rail, Constitution and §20’s structural-law list. Visual review found the list inset and mobile contents/header collision; both were corrected. The browser harness was given an explicit image-load wait after one run sampled the logo before decoding completed. These were verification findings, not invented World events.
- Source integrity: all eight articles and §§1–70 present; Selvane source is unchanged from main and deployed byte-for-byte. SHA-256: `71f2f78a9b3cdcd58217c14f9df804ec3fde2abde5d7e9a6498ac3b4ccf54fb7`. Federal text, all State sources, World Bible/status, chronology/clocks and geography are unchanged. Base-relative Constitution archive and whitespace checks passed.
- Existing reminders remain: Argent Ridge calendar conversion, spring LC election scheduling and status-dashboard/registry mismatch. Node also reports its existing module-type inference warning. No new publishing failures.
- Dependencies reused from a completed sibling checkout with the same lockfile. Browser screenshots/results are local review artifacts under the project’s `output/selvane-profile-2026-10-17/`; they are not public assets. Remote CI and deployment results are not established at this pre-PR handoff; consult the linked PR.

## Decisions and lessons

- **Accepted:** preserve the editorial overview → uninterrupted feature → Explore sequence. Treat Thoss’s former federal district and Selvane’s statewide State election as distinct systems; preserve the State’s original flat section numbers. Reuse dynamic inventory/source validation across all twelve States.
- **Rejected:** inventing a flag, capital, current officeholders, statutory deadlines, heritage seat quotas, a dated constitutional transition, or a State historical test. Ninety-nine is the Constitution’s default chamber size, not a verified current statutory count. Professional qualification does not become an examination for elected office.
- **Experimental:** none shipped; temporary browser tooling remains local verification only.
- **Historically preserved:** source hashes, canon boundaries, reader corrections and verification results remain in this note and the substantive editorial record. Future flag work should reuse the optional shared presentation after an approved design is available.

## Open follow-ups

Review and merge the PR after remote checks. No approved flag artwork or named capital was established in the consulted sources; neither blocks this profile. Existing chronology/status reminders remain separate maintenance work. Completion of this PR would publish all twelve State profiles; Territories remain a separate inventory.

## Preservation and branch disposition

Keep this note and editorial record in the same PR and in place on merge. No post-merge move is required. Branch deployment/automation dependencies have not been checked for deletion clearance. **Deletion approval is not granted**; retain this branch and the original Orath/Merath branch pending separate guarded preservation review. `main` and `archive/legacy-project-material` remain permanent.
