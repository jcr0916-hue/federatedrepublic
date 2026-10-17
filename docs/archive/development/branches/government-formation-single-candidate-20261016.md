# Branch history — government-formation-single-candidate-20261016

## Purpose
Restore the author's intended single-candidate confirmation pathway in federal Constitution §2.6.a, identified by scenario review.

## Changes
- `constitution_data.json`, §2.6.a(4): remove explicit minimum of two candidates; cap advancing nominations at four.
- §2.6.a(5): specify ranked-choice national election if multiple candidates advance and a yes-or-no popular confirmation if exactly one advances.
- `docs/constitution-current.md`: keep canonical Markdown mirror aligned.

## Accepted / deferred decisions
Preserve the Assembly nomination, 45-day constitutional default and 90-day absolute maximum, as well as acting service and Assembly's ability to elect before the national election begins. This patch does not invent a new process for no candidates or rejection of a sole candidate; those edge cases require separate drafting review if needed.

## Verification
Checked the source excerpt and revised both files against matching text. Full build, constitutional source-sync and scenario checks await CI. PR #194 is a separate scenario review and should not be mistaken for a constitutional amendment.

## Retention
Merge this handoff onto main. Branch deletion requires separate reviewed cleanup.
