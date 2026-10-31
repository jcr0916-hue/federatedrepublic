# Branch history — fix/constitution-archive-integrity-20261031

**Original branch:** `fix/constitution-archive-integrity-20261031`

**PR:** not yet opened

**Head commit at handoff:** pending final verification commit

**Status:** proposed; remote CI and merge pending

## Purpose and changes

Repair the recurrent archival failure blocking PR #271 while preserving all
historical constitutional material. See the
[incident record](../../../operations/CONSTITUTION-ARCHIVE-INTEGRITY-20261031.md)
and [298-file hash/provenance manifest](../../../../scripts/constitution-archive-aliases.json).

The validator accepts only those exact paths with pinned hashes and canonical
counterparts. Eight additional archival regressions cover future copies,
tampering, missing canonical files, nested paths, manifest changes, immutability
and later deletion/restoration. Ingest fixtures carry the new pinned manifest.
The existing archival workflow checks archive-only main pushes; its identical
numbered workflow copy is removed. Eight exact duplicate State-test filenames
from the same import blocked publishing after the archival repair; only those
redundant names are removed, with canonical content unchanged and their hashes
recorded in the incident evidence. The operational policy explains prevention
and the limits of checks on an unprotected main.

## Results and decisions

- **Historically preserved:** all 617 archive files, all 63 canonical triples,
  all 426 aliases, raw-source exceptions, the immutable baseline, and all cold
  storage. No constitutional source, generated text, canonical State-test or
  research content is edited. Removed noncanonical filenames remain preserved
  in the import commit, reachable through main.
- **Local verification:** 43 archival tests passed (35 existing plus eight new);
  `check-current` passed. Full publishing and committed-history checks pending.
- **Rejected:** speculative deletion, broad filename exemptions, automatic
  deduplication, changing the baseline, or suppressing integrity checks.
- **Unresolved:** the local app that created filesystem copies is not
  established. Main is unprotected; enforcing PR-only pushes requires an
  administrative branch rule. Other numbered files from the 903-file bulk
  import are outside this repair's scope.
- **Experimental:** none shipped. No new constitutional edition is introduced.

## Preservation and branch disposition

Use an ordinary merge commit, retaining the original branch history on main.
The cold-storage ref is permanently excluded from writes and cleanup. After
successful merge, keep this branch temporarily among the three newest eligible
completed branches, with later deletion only through the
[guarded rolling cleanup](../BRANCH-LIFECYCLE.md).
Actual disposition is pending and must be reported separately from content
merge; its ledger is the
[cleanup workflow](../../../../.github/workflows/rolling-branch-cleanup.yml).

**Dependency review:** pending final-SHA inspection of live deployments,
automation, open PRs and branch rules. No deletion clearance is asserted here.
Add the exact final-SHA marker only after that inspection. Do not create another
PR solely to change this handoff after merge.
