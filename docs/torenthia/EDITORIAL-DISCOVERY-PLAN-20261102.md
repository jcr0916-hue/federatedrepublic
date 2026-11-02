# Torenthia publication and jurisdiction discovery — proposed release specification

**Status:** Editorial design proposal for review, not deployed or published. **Date:** 2026-11-01 (real world).

## Decision proposed for approval

Use **one canonical World article per story**, with **multiple discovery surfaces**. Readers need not visit every State/Territory page to discover local news. Do not fork duplicate article pages or create competing narrative sequence systems.

1. **Torenthia home / main updates:** unified latest news and dispatches, including local stories; show clearly labeled jurisdiction, outlet and fictional date. Keep the existing global feed and archive; add a convenient “Local / States & Territories” path. Preserve access to NRS as a distinct legal-record type. A jurisdiction story should be discoverable from main without requiring it to be nationally important.
2. **Jurisdiction page:** a “Latest from [State/Territory]” section, most recent first, linking to canonical article pages; a link to the full jurisdiction-filtered archive. Cross-jurisdiction stories can appear on multiple local pages when their metadata meaningfully tags those jurisdictions.
3. **Story/dossier pages:** auto-list associated articles using existing `worldArcs`, `worldJurisdictions` and, for core procedural records only, `worldDossiers`. Local lifestyle reporting should not be forced into a constitutional dossier just to make it discoverable.
4. **Global cues:** unobtrusive “New local reporting” / “Latest across the Republic” links and clear source labels, rather than an isolated updates area accessible only by browsing a State.
5. **No editorial leakage:** internal agent identities, training packets and publication-candidate files are not public content.

## Initial Korda publication package

- First: “When the Lake Thaws Before the Road Does,” Sela Breck, The Korda Press, provisional Y14 M2. `worldKind: news`; `worldJurisdictions: [Korda]`; supporting arc/dossier metadata only if justified after current packet review.
- Second: “The Table Across the Lake,” same byline and provisional month, after the first story. `worldKind: news`; `worldJurisdictions: [Korda]`; consider `worldArcs: [lake-varda]`, with Korda only where substantively warranted. No fabricated treaty, completed conference, or rescue failure.
- Both articles exist as accepted Markdown drafts on ancestor PR #275. Reuse those bytes; do not write duplicate competing versions.
- Additional federal/State items: **none yet editorially approved for this release**. A prospective third story must receive source-backed review before being added; do not fill the release with invented NRS or chronology changes.

## Release gates

- Refresh `main`, the latest World/NRS frontier, ongoing Korda and Lake Varda records, and outstanding cross-branch edits; run `npm run world:packet -- --arc korda`.
- Confirm seasonal thaw is plausible in proposed Y14 M2 under published Torenthia calendar/geography. Adjust prose or proposed date rather than manufacture climate canon.
- Use `npm run world:new` preview-first for distinct HTML article records, with valid metadata, unique identifiers from refreshed branch state, and full edited article body; do not hardcode the old 178/133 frontiers.
- Verify canonical site URL, main news feed discovery, jurisdiction discovery, archive filtering, topic links, accessibility/responsiveness, and existing tests.
- Keep #273 → #274 → #275 → this branch intact; reconcile before integration. Do not merge, deploy or assign published status without tomorrow's final approval.

## Implementation note

Inspect actual templates and existing filters before changing navigation. Prefer minimal reusable templates/data-query behavior over separate State-specific homepages or a second CMS. This document is a product specification, **not** a claim that those UI features have already been implemented.
