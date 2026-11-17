# Branch history — world/federal-accurate-enough

**PR:** PENDING

## Purpose
Publish the Federal Realm desk's first accepted draft, *What Accurate Enough Costs*, as news 140 (worldSeq 187, Year 14 Month 2), and end the Federal desk's temporary Tuesday run.

## Shipped in this PR
- `torenthia/news/torenthia-news-140.html`: the Federal desk draft (inbox submission `66f5812c`, 2026-11-17 02:04 UTC) with the Central Editor's edits: the correction request now reaches the County through Varek's administration in Kellor (NRS 128 is addressed to State and Territory administrations); "board" became County Council (Varek §5.1); an unsourced claim about the County's federal reporting duties was cut; byline Aleth Fenn, The Torenthian.
- `docs/torenthia/STORY-STATUS.md`: publication paragraph; frontier worldSeq 187.
- `docs/torenthia/agents/federal/NOTES.md`: the editorial decision, recorded for the desk.
- `docs/torenthia/agents/desks.json`: Federal back to Monday and Thursday (Tuesday was added in #341 for one supervised run).

## Verification
`world:publish-check` passes; `check:world-meta` raises nothing for news 140; newsroom tests pass.

## Preservation and branch disposition
Results live on `main` once merged. **Deletion approval:** not granted by this note.
