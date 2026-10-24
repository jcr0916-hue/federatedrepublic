# Branch history — docs/constitution-history-261023

**Original branch:** `docs/constitution-history-261023`

**PR:** not yet opened

**Base:** `59beca5349754b131373d562ac77f447d60d654f` (PR #235)

**Status at preparation:** proposed history/publication update; final deployment evidence belongs in the PR.

## Purpose and changes

Add the missing 23 October history entries for the constitutional release, its compatibility work and the subsequent §2.2 notice wording. The recent page shows them newest first; the complete archive preserves its oldest-first display. Existing historical entries and their contemporary citations remain unchanged.

The main branch had merged PR #235's canonical JSON before its generated-artifact commit `747255819700ff957e89847247e6db23b2fd9252`. Reused that commit's annotated text, Markdown, search index and Constitution PDF, preserving the new constitutional wording exactly. Updated the military diagram and Alliance Clause's remaining notice summary. No new constitutional policy or fictional event was added.

Preserved the valid prior edition from `79124ba87619026bf219c20a649d772a9e8c0fd5` as a matched archive pair. Preserved the unsynchronized PR #235 source/Markdown bytes under `constitution-exceptions` with explicit unverified status and no invented repair commit. Recovery recognizes only that fixed historical revision, verifies its committed evidence, and still requires a valid current edition. Two regression cases ensure that raw source is never certified as a matched edition and that future unknown mismatches remain rejected.

## Verification and decisions

- Full publishing suite passed: 35 archival tests, 164 Node tests, 369 pages, all 239 public records, constitutional text/search consistency and live references.
- Browser checks passed for both history pages at desktop/mobile widths: search, entry order, direct-link expansion, print expansion/restoration and links to the updated §2.2 source. No page errors, failed same-origin requests or horizontal overflow.
- The reused Constitution PDF passed all 177 canonical provision-text checks across 54 pages; all thirteen PDFs retained tagged structure and bookmarks. Visual inspection covers the complete reused PDF.
- **Rejected:** changing the adopted §2.2 wording, hand-editing generated Markdown, rewriting dated history entries, representing mismatched source files as a verified edition, or weakening recovery for unknown future revisions.
- **Experimental:** none. **Unresolved at preparation:** remote CI and final public deployment verification.

## Preservation and reuse

Reuse the three stable history anchors and existing-artifact provenance to avoid duplicate entries or regeneration. Retain the publication branch, canonical archive pairs, raw historical sources, original article history and all Git commits. The original release's hash register remains a dated snapshot; this follow-up does not re-certify it against a later Constitution.

**Deletion approval:** Not granted. `main` and `archive/legacy-project-material` remain permanent.
