# Idea board

Ideas the desks have proposed: storylines, characters, reactions and "what ifs." The desk editor routes them here from each day's triage, the Central Editor puts the week's ideas on the board every Monday, and John decides which move forward.

## Where John marks them

The board is a private phone page: <https://claude.ai/artifact/McG5YjLTR7phxbvWJHbDTC>. Each idea is a card with the desk, a one-line pitch, the story in two or three sentences and the desks that could react. Three buttons, **GO**, **LATER** and **NO**, save at once. Tapping the same button again undoes it. The tabs at the top sort cards by status.

- **GO** becomes an assignment on the next daily review: the proposing desk's `ASSIGNMENTS.md` gets an item under `## Open` (and each reacting desk's, when the idea names them), and the card shows "Assigned." A desk with an open assignment runs that week even in an off week of its cadence.
- **LATER** stays on the board, parked.
- **NO** stays on the board in the NO tab in case John changes his mind.

## How the Central Editor runs it

The board's data lives in the page's database, collection `ideas`, one document per idea. The Central Editor reads and writes it with the `ArtifactData` tool, using the page's URL above.

Document fields: `week` (the Monday, `YYYY-MM-DD`), `order` (number within the week), `desk` (display name of the proposing desk), `title`, `pitch` (one plain sentence), `story` (two or three sentences, no jargon, no file paths), `react` (desks that could react, may be empty), `status` (`pending`, `go`, `later`, `no`), `decidedAt` (set by the page), `assignedAt` (set by the editor once the assignment exists), `sourceKey` (the inbox key of the filing). Ids look like `w20261123-korda-1`.

- **Mondays:** put the past seven days' idea-board items on the board as `pending`. Delete any document with `example: true` (the first board ships with three sample cards).
- **Every day:** read the board. For each `go` idea without `assignedAt`, add the assignment, set `assignedAt`, and record it in the log below. Note `later` and `no` decisions in the log once.
- If the `ArtifactData` tool is unavailable in a run, put the week's ideas in the log below instead and tell John.

## Log

Decisions and assignments, newest first, one line each: date, desk, idea, decision, what was assigned.

- 2026-11-20 · Federal desk · A worksheet with four names, and no order (`w20261116-federal-1`) · **GO** · assigned to the Federal desk (canon article, with fixes), Election Tracker (note on publication) and Partisan Media (opinion column after publication).

## Keeping the board clean

Before adding a card, the Central Editor checks the board for the idea's `sourceKey` (the inbox key of the filing). If a card already carries it, the idea is skipped, whatever its status. A desk that re-pitches the same premise under a new key is noted, not carded again, until its first pitch has an answer. Ideas filed as finished articles are flagged by the desk editor: card the premise, and note that the desk wrote a full draft too early.
