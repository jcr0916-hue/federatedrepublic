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
| `constitution_data.json` | Root canonical data file; human-reviewed manual merge only |
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

There are no automatic renames and **no overwrites, including identical files**.
Browser download suffixes are not stripped. Destination collisions (including flattened public asset URL collisions), symlinks,
nonregular files and ambiguous paths require review. Existing canonical source
files consequently remain manual merges; ingest is not a replacement editor.
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
The build includes the native public asset validation. The command selector runs
native `sync` before build plus constitutional consistency/site checks if
constitutional sources are imported; current conservative routing holds those
sources for manual merge, so run `npm run sync` and the constitutional checks
yourself after such a merge. No constitutional edits are authorized implicitly.

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

Focused regression tests: `npm run test:ingest`. Tests use temporary repositories
and inboxes; they do not modify published content or your Downloads folder.


NRS imports require explicit unique `nrsSeq` and `nrsId`; they do not need or
consume narrative `worldSeq`. Existing legacy NRS `worldSeq` values remain valid.
The same shared publishing validator checks NRS identities and structured clocks
for repository records plus eligible inbox candidates. Clock warnings do not
block imports. Unknown registry/document files remain report-only for manual review.
