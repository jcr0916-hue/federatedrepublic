# Constitution version archive

New previous Federal Constitution versions are preserved here on `main`, as
exact JSON/Markdown pairs. This directory is historical evidence, not current
constitutional authority. The current sources remain `constitution_data.json`
and its generated `docs/constitution-current.md`.

The first superseded version on a UTC date uses:

```text
Constitution-YYMMDD.json
Constitution-YYMMDD.md
Constitution-YYMMDD.archive.json
```

The date is when the previous version is superseded, not a date inferred from
its text. Further versions that day use the same shared `-01`, `-02`, etc.
suffix for all three files. Metadata records SHA-256 hashes, the original source
commit when available, the historical renderer source/commit/hash, and the UTC timestamp.
Existing snapshots and metadata are immutable. Exact already-preserved pairs
are reused on retries, including when a revision is reverted and superseded again.
The frozen renderer makes pair verification independent of proposal commits that
may disappear after squash/rebase merges or branch deletion.

See [Constitution archival operations](../../operations/CONSTITUTION-ARCHIVAL.md)
for generation, import, checks, recovery, and branch protection requirements.
`policy.json` fixes the recovery baseline at the verified current `main` commit
before this automation was introduced. Keep it immutable.

Older Markdown and Word archives remain intact on
[archive/legacy-project-material](https://github.com/jcr0916-hue/federatedrepublic/tree/archive/legacy-project-material/docs/archive/constitution).
They predate this paired archive policy; this change does not fabricate JSON
partners or move/rename those historical files. Earlier unarchived October
revisions remain recoverable from Git history; automatic recovery begins at the
recorded baseline. Do not merge the legacy branch into `main`.

This directory stays in GitHub and is excluded from the generated public site
by the existing `docs/**` exclusion.
