# Local Republic ingest

Run from the repository after `npm ci`. Drop finished files into
`~/Downloads/Federated-Republic-Inbox/`.

```sh
npm run republic:ingest
npm run republic:ingest -- --apply
npm run republic:ingest -- --apply --archive
```

The first command is read-only: no directories, reports, cache files, repository
files or inbox files are written. Missing/empty inboxes are harmless. Review the
detected metadata, proposed actions, warnings/errors and human-review list before
using `--apply`. Apply recalculates the plan; it does not trust a saved preview.
No mode commits, pushes or deploys. Unknown flags and `--archive` alone fail.

## Deterministic routing

| Inbox file | Repository destination / behavior |
| --- | --- |
| `torenthia-news-NNN.html`, `torenthia-nrs-NNN.html`, `torenthia-sc-NNN.html`, `torenthia-dispatch-slug.html` | Same filename at the site root; matching `worldKind` and `worldId` required |
| `WORLD-STORY-STATUS.md`, `WORLD-STORY-BIBLE.md` (flat or under `docs/`) | `docs/`; human-reviewed manual merge only |
| `constitution_data.json` | Manual by default; explicit `--update-constitution` preserves prior Markdown externally before replacement |
| `<state>-test-NN-<slug>.html` (flat or under `state-tests/<state>/`) | `state-tests/<state>/`; validated new canonical historical test only |
| Established `name-state-constitution.md` (flat or under `State Constitutions/`) | Existing `State Constitutions/`; human-reviewed manual merge only |
| Image under inbox `images/` or `logos/` | Same existing canonical folder; no nested directories or inferred logo/map placement |
| Flat images, other filenames/folders, new State names | Report only; destination is ambiguous |

Supported image extensions: PNG, JPEG, WebP, AVIF, GIF, SVG, ICO. To import a new
map, for example, place it at `Federated-Republic-Inbox/images/new-map.webp`.
Image files under `images/` publish at root URLs: reference `new-map.webp`,
not `images/new-map.webp`, in article HTML and `worldImage`. Logos retain their
`logos/` URL prefix. Preview shares this mapping with the build.
This is an explicit destination choice; the helper does not infer geography or
caption/canon facts. It does not transcode or visually certify images.

There are no automatic renames. Ordinary imports **never overwrite, including identical files**.
Browser download suffixes are not stripped. Destination collisions (including flattened public asset URL collisions), symlinks,
nonregular files and ambiguous paths require review. Existing canonical source
files remain manual merges except for the explicit Federal update below.
The older `scripts/place-downloads.sh` is a separate legacy overwrite helper and
is never invoked by this workflow. Use these npm commands for safe ingest.

## Metadata and review

The helper reuses `gray-matter`, `lib/world-publishing.mjs`,
`lib/world-authoring.mjs`, `lib/world-metadata.mjs` and the asset reference parser.
It accepts plain YAML front matter only. Text imports normalize CRLF/CR to LF,
reporting that change; YAML comments, quoting, field order and body formatting
otherwise remain intact. UTF-8 BOMs and sequence numbers outside JavaScript’s safe
integer range require manual correction. Images remain byte-for-byte copies.

Existing publishing rules validate required fields, arrays, dates, ID/filename
consistency, sequence uniqueness, arc/dossier/provision IDs and related records.
Local HTML/CSS/script/image references, `worldImage`, SVG references and literal
template includes must resolve to existing files or eligible imports. Dynamic
references require manual review. Dependency rejection propagates through the
candidate set. If the shared World batch validator fails, all remaining World
candidates are held; independently valid assets can still import.

Missing/blank narrative sequences receive distinct suggested numbers above both published
and incoming sequences. They are **not assigned or reserved**: edit the inbox
file, then preview again. Keyword metadata suggestions are advisory and never
change tags. Explicit draft/review flags, helper draft markers and obvious
TODO/TBD/FIXME/placeholder text block import. `ingestReview: true` can explicitly
hold an item for editorial review; remove it only after the decision is settled.

Core `worldDossiers` assignments always require manual review/import. The helper
never selects dossier status, adds Bible facts, interprets the constitution,
establishes durable character facts or chooses political/story outcomes. Marker
checks cannot certify finished prose or identify every unresolved editorial
question. Authors must review those matters before applying ordinary articles.
Review affected Story Status and dossier summaries manually when warned.

## Apply, validation and recovery

Apply rechecks source bytes and destination existence, then creates files
exclusively. After any repository import it runs available `check:world-meta`,
`check:world-publish`, and `build`; HTML imports also run `check:discovery`.
The build includes State-test and native public asset validation. State-test
imports also run `check:state-tests` before build. Checks stop at the first failure.
Federal updates run the additional sequence below. State Constitution changes
remain manual; their version preservation is optional/manual for now.

Only a successful set of post-import checks permits archive. Successfully copied
sources move to the sibling `~/Downloads/Federated-Republic-Archive/<UTC-time>/`,
preserving their inbox subpaths and original bytes. Archive copies are exclusive;
the source is removed only after copying and checking its bytes again. Failed,
unknown or changed sources stay in the inbox. Empty inbox folders may remain.

On failed validation or a validation-runner error, imported files remain for inspection and **nothing is
archived**. There is no automatic rollback of your working tree or build outputs.
Fix or remove those imports manually and rerun checks. A repeated ingest refuses
the now-existing destinations; this is intentional. Blocked/skipped files or
failed checks produce exit code 1, even if other imports succeeded. A successful
empty preview exits 0. Inspect `git status` and `git diff` before committing.
Do not run concurrent ingest/editor processes against the same inbox/repository.

## Explicit Federal Constitution updates

Put only the intentionally reviewed `constitution_data.json` into the inbox.
This opt-in path does not decide or rewrite constitutional substance.

```sh
npm run republic:ingest -- --update-constitution
npm run republic:ingest -- --update-constitution --apply
# Optional: remove the incoming source from the inbox only after every check passes.
npm run republic:ingest -- --update-constitution --apply --archive
```

Choose the apply command with or without `--archive`; they are alternatives.
Preview compares parsed JSON, validates its structure, and reports the proposed
snapshot path. Equivalent JSON is a no-op, including whitespace-only changes;
it creates no snapshot and leaves the incoming source alone. Mixed inbox batches
are refused. Stale generated Markdown must be reconciled before an update.

Before touching the canonical JSON, apply copies the exact current
`docs/constitution-current.md` bytes to:

```text
~/Downloads/Federated-Republic-Archive/constitution/Constitution-YYMMDD.md
```

Dates use UTC. Same-day collisions use `-01`, `-02`, and so on; existing snapshots
are never overwritten. The snapshot must be written and verified successfully
before replacement. Only Markdown is preserved, not the old JSON. Snapshot paths
must be outside the repository and inbox, with no symlink traversal. Tests that
override the inbox use its sibling `Federated-Republic-Archive/constitution/`.

Apply rechecks the incoming source, canonical JSON and generated Markdown, then
preserves the snapshot and replaces the JSON. It runs `npm run sync`, both
`scripts/check-consistency.py` and `scripts/check-constitutional-site.py`, the
normal World checks/build, and configured discovery/scenario checks, in that order.
If a check fails, it reports the failure and leaves the incoming source in the
inbox even with `--archive`. The prior Markdown snapshot remains safe. The new
JSON and any regenerated files remain for inspection; there is no automatic rollback.
Resolve the failure and rerun validation manually before committing. Rerunning
ingest with now-identical JSON is a no-op, not proof that validation succeeded.

Ingest never creates `docs/archive/`, commits, creates branches, or writes to
`archive/legacy-project-material`. A later housekeeping operation may preserve
local snapshots in cold storage without reintroducing them on `main`.

## State historical tests

Use the schema and authoring rules in [State-test publishing](../STATE-TEST-PUBLISHING.md).
Only established States and real provision definitions in their current State
Constitution are accepted. IDs and test numbers must be unique within their
required naming convention. Draft/review flags, unfinished text, routing overrides
and World/NRS sequence metadata are refused. Local references receive the shared
preview checks; built links and anchors are checked after import.

New validated tests import automatically. Existing test files, even identical
ones, remain manual-review replacements. Invalid State-test batches are held
together; they do not allocate a World or NRS sequence. Ingest never edits the
Story Bible, Story Status, or State constitutional meaning.

Focused regression tests: `npm run test:ingest` and `npm run test:state-tests`.
Tests use temporary repositories
and inboxes; they do not modify published content or your Downloads folder.


NRS imports require explicit unique `nrsSeq` and `nrsId`; they do not need or
consume narrative `worldSeq`. Existing legacy NRS `worldSeq` values remain valid.
The same shared publishing validator checks NRS identities and structured clocks
for repository records plus eligible inbox candidates. Clock warnings do not
block imports. Unknown registry/document files remain report-only for manual review.
