# Branch history — fix/constitution-archive-integrity-20261031

**Original branch:** `fix/constitution-archive-integrity-20261031`

**PR:** [#272](https://github.com/jcr0916-hue/federatedrepublic/pull/272)

**Head commit at handoff:** implementation checkpoint `7ae395a440744ab8e879a039504bafefd6a1b361`; final reviewed SHA is recorded in PR #272

**Status:** implementation complete; final CI, safety review and merge recorded in PR #272

## Purpose and changes

Repair the recurrent archival failure blocking PR #271 while preserving all
historical constitutional material. See the
[incident record](../../../operations/CONSTITUTION-ARCHIVE-INTEGRITY-20261031.md)
and [298-file hash/provenance manifest](../../../../scripts/constitution-archive-aliases.json).

The validator accepts only those exact paths with pinned hashes and canonical
counterparts. Nine additional archival regressions cover future copies,
tampering, missing canonical files, nested paths, manifest changes, immutability
and later deletion/restoration, including a committed check's refusal to use
uncommitted manifest evidence. Ingest fixtures carry the new pinned manifest.
The existing archival workflow checks archive-only main pushes; its identical
numbered workflow copy is removed. Eight exact duplicate State-test filenames
and 106 exact duplicate World-record filenames from the same import blocked
publishing after the archival repair; only those
redundant names are removed, with canonical content unchanged and their hashes
recorded in the incident evidence. The operational policy explains prevention
and the limits of checks on an unprotected main.

## Results and decisions

- **Historically preserved:** all 617 archive files, all 63 canonical triples,
  all 426 aliases, raw-source exceptions, the immutable baseline, and all cold
  storage. No constitutional source, generated text, canonical State-test or
  research content is edited. Removed noncanonical filenames remain preserved
  in the import commit, reachable through main.
- **Local verification:** all 44 archival tests passed (35 existing, nine new),
  as did all 37 ingest tests. The full publishing suite passed with 169 Node
  tests; it verified 413 built pages, 270 public records, 17 State historical
  tests, 55 scenarios and all 177 provisions. The full committed first-parent
  recovery preflight also passed without writes. Final-head CI and the repeated
  recovery rehearsal are recorded in PR #272.
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
successful merge, retain this branch while external deploy-hook clearance is
uncertain. Once eligible, keep it temporarily among the three newest completed
branches, with later deletion only through the
[guarded rolling cleanup](../BRANCH-LIFECYCLE.md).
Actual disposition is pending and must be reported separately from content
merge; its ledger is the
[cleanup workflow](../../../../.github/workflows/rolling-branch-cleanup.yml).

**Dependency review:** live hosting records show no deployment for this branch,
no matching branch-scoped variables, no custom environments, and no
branch-bound domains. The GitHub connection cannot inspect administrative
settings; browser settings require sign-in. Deploy-hook clearance is therefore
not established, and no `dependencies: none` deletion attestation is asserted.
The guarded workflow must retain an uncertain ref, in addition to its three
eligible completions. Actual final-SHA workflow/PR/automation observations and
the disposition ledger are recorded in PR #272. Do not create another PR solely
to change this handoff after merge.
