# Constitution archive integrity repair — 31 October 2026

## Findings and provenance

PR [#271](https://github.com/jcr0916-hue/federatedrepublic/pull/271) failed in
[Constitution archival](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41206953967)
and [World publishing](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41206953894)
before the new State tests were checked. The different first reported filenames
reflect inventory traversal order, not separate corruptions.

A fresh full-history clone of main
`c5130bd4a9c7aa61ed07d8cae5eb388e9c74e397` reproduces the failure.
Its direct, single-parent `update` commit (30 October 2026, 19:54:59 PDT;
31 October 02:54:59 UTC) adds 903 files and modifies/deletes none. The parent is
`26caf21101a76d9d9ec0872ec57399b46b6170c9`.

Within `docs/archive/constitution/`, it adds **298 space-numbered copies**,
including `Constitution-260927 2.json`,
`Constitution-261011-01.archive 2.json`, `README 2.md` and `policy 2.json`.
Every added file exactly matches a canonical file already committed in the
parent: both original Git blob IDs and SHA-256 hashes match. There is no unique
constitutional text, Markdown, renderer or provenance in these copies.
The [complete 298-file manifest](../../scripts/constitution-archive-aliases.json)
records every path, counterpart and hash, plus the import and parent commits.
Its frozen SHA-256 is
`1c11abc0d6bfe05c5138cca34f5312f981c89cb2fe6e0e7e6603bfca7255d7f8`.

The main archive has **617 files**: 63 canonical JSON/Markdown/provenance triples,
the canonical README and policy, 128 previously recognized aliases, and the 298
new aliases. All **426 aliases** match their canonical bytes. All 63 canonical
triples pass metadata hashes and their frozen historical renderer. All archive
files present in the parent remain unchanged. The current Constitution source
and generated surfaces are unchanged by the import and by this repair.

The earlier [duplicate incident](../archive/development/branches/constitution-archive-duplicate-copies-20261018.md)
and [23 October recovery repair](CONSTITUTIONAL-ARCHIVE-RECOVERY-261023.md)
were reviewed. They recognize only their fixed 128 aliases and exact historical
restoration commits. Their narrow recognition correctly did not accept this
later import. No additional archival repair commit was found in Git history
between 28 October and the failing import; a claimed separate "yesterday"
repair is **not established**.

## Cause and repair

The proven ingress is the bulk direct-to-main import above. The archive writer
produces only `Constitution-YYMMDD[-NN]` names with exclusive creation; it does
not generate a space-numbered copy. The 903-file import also adds unrelated
numbered scripts/documents and an exact second copy of the archival workflow.
The pattern is consistent with a filesystem conflict-copy import, but which
local application or synchronization process created it is **not established**.
Git history cannot identify that application.

Main was reported unprotected by GitHub at inspection. PR checks cannot prevent
a direct push to an unprotected main. World publishing caught the bad import;
the archive recovery workflow's previous push filter omitted archive-only
additions. Two identical archival workflows also produced duplicate checks.

The repair preserves every archive file and adds exact, hash-pinned recognition
of only the 298 reviewed copies. A copied file must still equal its canonical
counterpart and its fixed reviewed hash; aliases do not count as editions.
Unknown copies, changed bytes (even alias and counterpart changed together),
missing counterparts, incomplete triples and manifest changes remain errors.
Recognition of an old alias is also restricted to its exact top-level path.

The existing immutability gate and full first-parent recovery checks are
unchanged. No deletion/restoration exception is added. The permanent policy and
baseline are unchanged. Existing raw-source exceptions keep their explicit
unverified status. No historical pair is fabricated or reconstructed.

The canonical archival workflow now includes archive-directory and manifest
changes in its main push triggers. Its byte-identical
`.github/workflows/constitution-archive 2.yml` copy is removed; the original
copy remains permanently available in the import commit and main's history.
No other numbered workflow is edited. After the archive check passed, the full
publishing suite exposed eight duplicate State-test filenames and 106 duplicate
World-record filenames (102 NRS, four dispatches) from the same import. Each is
exactly identical to its canonical file and the pre-import canonical Git blob.
Only those 114 redundant ` 2.html` filenames are removed,
following the same noncanonical-file hygiene used in the October 18 incident.
Their [exact paths and hashes](constitution-archive-related-duplicate-evidence-20261031.json)
are recorded and their original blobs remain reachable in main history.
Every canonical State-test file remains byte-identical. No State-test prose,
research document, PR #271 content or Torenthia story is changed.

Future contributors should use a clean checkout, run the documented publishing
checks before committing an import, inspect unexpected additions, and use PRs.
Unknown archive filenames must continue to fail. Do not extend recognition by
pattern, normalize names automatically, delete immutable duplicates, advance
the baseline or certify mismatched source material. Enforcing PR-only changes
requires the branch-protection configuration described in
[the archival policy](CONSTITUTION-ARCHIVAL.md); repository code cannot enforce
that administrative setting.

## Preservation and verification

The permanent cold-storage ref remains
`archive/legacy-project-material` at
`0053ac4da09d32807d7f5b71ef0fff2075b421c1`, tree
`08176b6d2fb144bdc7f14136d5254fb81c6591c0`. It is never a write or cleanup
target. The repair branch will be merged with its original history reachable
from main and a same-PR permanent handoff.

Local regression results, committed-history rehearsal, full publishing results,
remote CI and branch-disposition evidence are recorded in
[the branch handoff](../archive/development/branches/constitution-archive-integrity-20261031.md)
and the repair PR. PR #271 must be updated only after the repair is merged,
without changing its State-test or research content. It remains a separate PR.
