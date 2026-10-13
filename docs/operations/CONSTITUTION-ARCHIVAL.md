# Automated Constitution archival

Every replacement of the authoritative `constitution_data.json` and generated
`docs/constitution-current.md` must retain the previous exact pair under
`docs/archive/constitution/` on `main`. The shared basename is
`Constitution-YYMMDD`, with `-01`, `-02`, etc. for additional distinct snapshots
on the same UTC supersession date. Each pair has `.archive.json` provenance and
SHA-256 hashes. No existing snapshot or metadata may be rewritten or deleted.
The directory's README may be edited; the baseline policy is immutable.

## Normal editing and generation

1. Start with an up-to-date Git checkout and edit `constitution_data.json`.
2. Run `npm run sync`. It first preserves the prior committed JSON and Markdown
   together, before rebuilding any derived surfaces. The direct authoritative
   Markdown generator also performs preservation before writing Markdown.
3. Run `npm run world:publish-check` and inspect the changed files.
4. Commit the new current files and every newly created archive file together,
   then open a pull request against `main`.

`npm run constitution:archive` performs just the preservation step. It reads the
previous bytes from Git, never reconstructs historical Markdown using today's
JSON or renderer. JSON formatting changes still preserve the previous pair;
unchanged runs create no snapshot. Repeated runs reuse a verified exact pair.
Markdown must match the canonical renderer; independently editing Markdown is
rejected by the check. Renderer changes use the historical generator to verify
old text and the new generator to verify the new current text. Metadata also
freezes the renderer source and its hash so historical pair verification survives
squash/rebase merges and deletion of proposal branches.

If `main` advances while a pull request is open, update the branch and preserve
the actual new base pair with:

```sh
python3 -B scripts/constitution-archive.py prepare --base origin/main
```

Commit any added snapshots and rerun the pull request checks. This command does
not replace your current sources. A full Git history is required for preservation
and recovery; shallow checkouts must fetch the relevant commits. Already saved
pairs remain verifiable using their frozen renderers.

## Importing reviewed Constitution JSON

Use the explicit [Republic ingest workflow](REPUBLIC-INGEST.md). Preview reports
both archive paths without writing. Apply verifies the previous pair, preserves
both exact files, generates the incoming Markdown, and installs both current
files before running the normal sync/build checks. Uncommitted previous pairs
record hashes and the committed renderer, with `source_commit: null`; their
historical bytes are still preserved. An uncommitted renderer incompatible with
the old pair must be committed/reconciled first.

The older `place-downloads.sh` refuses Constitution JSON replacement and directs
contributors to ingest. It no longer independently copies current Markdown.

## Pull request enforcement

The `Constitution archival check` runs on every pull request to `main`, with no
path filter that could leave a required check pending. It validates the committed
merge result against the actual base SHA. It fails for missing prior archives,
incomplete or mismatched pairs, invalid renderer provenance/hashes, current JSON/Markdown
drift, and modification/deletion of existing snapshots or policy. Untracked local
archives cannot make a committed replacement pass. Proposal-only intermediate
commits are not treated as additional published main versions.

After merging this workflow, configure the `main` branch rule to require
**Constitution archival check**, require the branch to be up to date, and apply
the rule to administrators/bypass actors if replacements must be prevented for
them too. A repository workflow cannot itself enforce branch protection.
See [GitHub's protected branch documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

The normal World publishing check also runs the archival tests and checks the
current working pair and every archived pair's integrity.

## Direct-push recovery

The `recover-archives` job runs after current Constitution or archival-code
changes on `main`, and can be run manually with `workflow_dispatch`. It always
fetches the latest `main` and walks all first-parent revisions since the fixed
`policy.json` baseline. For every published pair change it preserves the parent
pair using the transition's UTC commit date. This includes multiple revisions in
one push and gaps caused by canceled pending runs or out-of-order execution.
Merge commits archive the previous main pair; unmerged branch revisions are not
mistaken for authoritative versions.

Recovery never changes current Constitution files. Jobs serialize, existing
archives are verified/reused, pushes use ordinary fast-forward checks, and three
fetch/rebuild retries handle a concurrent main update. The job commits only this
archive directory. Snapshot-only commits do not match its push path filter;
additionally, pushes with `GITHUB_TOKEN` do not trigger ordinary push workflows.
See [GitHub's workflow trigger documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

Recovery needs Actions `contents: write` permission and a branch rule that permits
the bot's commit. Protected branches may reject that fallback; normal pull
requests already include the archives, so no bot bypass is needed for them.
Failures remain visible in Actions and a manual rerun catches up from the same
baseline. Direct pushes become current before a post-push job can run, so only
required pull request checks provide prevention before publication.

Recovery refuses a rewritten/non-ancestor baseline, historical archive edits,
or a mismatched intermediate/current pair. It does not invent missing historical
Markdown. Resolve those cases with reviewed source/history recovery.

## Failure behavior and verification

Writers share an exclusive `.constitution-archive.lock` directory. A competing
operation stops before replacement; inspect a stale lock before removing it.
Snapshots use exclusive creation and verified writes. Ordinary write failures
remove only files created by that attempt. Incoming current JSON and Markdown
are prepared before replacement, and ordinary installation failures restore both
old current files while retaining the complete archive. Git publishes the pair
in one commit. Separate filesystem renames cannot make two files atomically
visible to a concurrent external reader; a process kill/power loss may leave a
stale lock or partial local operation, which checks reject before publication.

```sh
npm run test:constitution-archive
npm run test:ingest
npm run check:constitution-archive
python3 -B scripts/constitution-archive.py check --base origin/main
npm run world:publish-check
```

Tests use isolated Git repositories and cover exact prior bytes, no-op/retry
behavior, date/suffix collisions, JSON-only formatting changes, renderer changes,
unarchived replacements, incomplete/tampered/mismatched archives, stale previews,
symlinks, concurrent locks, archive failures, installation rollback, batched
pushes, and recovery after missed runs. No actual constitutional amendment is
introduced merely to test this workflow.
