# TypingMind knowledge-base organization

The GitHub repository is the source of truth. TypingMind displays imported documents without the repository folder hierarchy, so tags provide navigation and retrieval groups.

## Generate the tag plan

After adding and staging new files, run:

```sh
node --test scripts/typingmind-tag-plan.test.mjs
node scripts/typingmind-tag-plan.mjs > /tmp/typingmind-tag-plan.json
```

The planner includes Git-tracked files (including staged additions), reads World front matter, and prints a deterministic, path-aware plan. It does not contact or modify TypingMind. Do not commit the generated snapshot: regenerate it after each publication. The source's synchronization must finish before newly published files can be tagged in TypingMind.

## Tag rules

| Tag | Meaning |
| --- | --- |
| World Canon | Published World records, with News, NRS, Court Opinion, or Dispatch as a second tag |
| Korda, Lake Varda, Fiscal Equalization, Argent Ridge | Topic membership from `worldArcs` |
| The same topic followed by Core | Frozen dossier `seedRecords` plus explicit `worldDossiers` opt-ins |
| World Reference | Story Bible, Story Status, dossiers, atlas, state and territory profiles |
| Constitution | Current constitutional texts, state constitutions and quicksheets |
| Scenarios | Constitutional hypotheticals |
| Crossroads Non-canon | Interactive alternative outcomes; not established World history |
| Archive | Material under `docs/archive/`, regardless of its filename |
| Project Operations | Publishing and maintenance documentation |
| Website Code / Website Pages / Media Assets | Implementation files, other site pages and images |

The planner deliberately gives archive precedence over all other rules. A filename containing “current” does not establish current authority. Duplicate basenames have `requiresPathCheck: true`; confirm their repository path in the source details before assigning tags. In particular, the archived and current `constitution-current.pdf` must not be treated as one document.

For core versus supporting coverage, use the editorial rules in [WORLD-PUBLISHING.md](WORLD-PUBLISHING.md). NRS 041 is Korda Core; News 085 is Korda supporting coverage. Topic mentions in prose alone do not assign tags.

## Apply the plan in the licensed web app

1. Open KB and confirm the GitHub source has synchronized the intended commit/files.
2. Search by filename. For numbered World records use fixed groups such as `torenthia-news-01` (010–019), so each result set fits on one page.
3. Check the displayed names against the plan. “Select all” selects the displayed page, not the entire repository.
4. Select the matching documents, choose Assign Tags, and add the planned tags. Preserve existing tags until agent dependencies have been reviewed.
5. Wait for the tag dialog to finish loading. Save, then reopen or refresh and verify the saved tags. The dialog can refresh during loading and discard an early checkbox change.
6. Repeat for topic subsets within the group; do not apply one topic to every search result unless every result has that topic in the plan.
7. Spot-check both core and supporting records, an archived document and the current Constitution. After a full GitHub resync, check that tags remain present.

## What is automated, and what is not

Tag selection is automated by the repository planner. Applying per-document tags currently requires the KB interface. The observed GitHub source settings offer source-wide Automatic Tags, not metadata or filename conditions. Do not assign World Canon as a source-wide tag: that would also classify code, archives and hypotheticals as canon.

No supported per-document tag-write API has been verified for this licensed app. Do not copy session URLs, session tokens, private endpoints or browser credentials into scripts. A supported API would allow a future idempotent adapter to consume this plan, compare existing tags and add missing tags. Until then, the plan plus supervised UI application is the supported workflow used here; it is not unattended synchronization.

Agent tag access should be reviewed separately. Selecting multiple tags uses OR semantics, so selecting World Canon and Korda does not mean only Korda canon. Use Korda Core alone for a core dossier agent. Old broad tags may still include archives or unrelated material; adding the new tags does not remove that existing access.

## Publication checklist

- Complete the World publishing checks and editorial updates documented in WORLD-PUBLISHING.md.
- Commit/push the content and wait for the GitHub KB source to synchronize.
- Regenerate and review the tag plan; resolve every ambiguous basename by path.
- Apply missing tags, preserving unrelated existing tags.
- Verify core/supporting distinctions and tag persistence after synchronization.
- Record any skipped or ambiguous files; do not claim the entire KB is migrated until all planned documents have been checked.
