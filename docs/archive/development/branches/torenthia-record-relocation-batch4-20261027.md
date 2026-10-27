# Branch history — Torenthia relocation batch 4

**Original branch:** `chore/torenthia-record-relocation-batch4-20261027`  
**PR:** to be linked by the pull request created from this branch  
**Base:** `7afff123c63dee3aafd337fd8d451387aba172c5` (PR #253 merged)  
**Status:** shipped in PR #254; required checks and production verification passed

## Purpose and changes

Relocate 40 unchanged records: NRS 101–116 to `torenthia/nrs/`, news 009–028 to `torenthia/news/`, and all four dispatches to `torenthia/dispatches/`. Preserve their historical root public URLs. Update the reorganization plan, complete the missing retrospective PR #251 handoff, and record PR #253's verified outcome.

Repair root-only paths in `scripts/check-world-metadata.mjs`, `scripts/check-release-compatibility.py`, and `scripts/check-consistency.py`; add regression coverage in the existing World metadata and publishing test suites. No workflow gate is removed or bypassed.

## Results and verification

- `npm run world:publish-check`: passed, including the build, Constitution archival, discovery, chronology, authoring/ingestion, metadata, and constitutional reference checks.
- All 16 focused metadata/publishing tests passed, including categorized-stream negative cases and historical snapshot hash-drift rejection.
- Compared with base: all 256 source records, all 470 generated public files, and all 336 protected Constitution/archive/State files are byte-identical. Inventory: 58 categorized, 198 at root.
- PR #253 production deployment is READY at merge `7afff123c63dee3aafd337fd8d451387aba172c5`. This branch still requires its own GitHub/Vercel checks and post-merge production verification.

## Decisions and lessons

**Shipped when merged:** source-only relocations and stricter directory-aware audits. Reuse `worldSourceFiles` for record reads and keep public basenames distinct from source locations. A green checker can silently lose coverage if it scans only the root; test known bad content inside categorized paths. Dispatch links need the same source resolution as numeric streams.

**Rejected:** changing record metadata, rewriting historical public links, suppressing warnings, weakening checks, or rewriting the dated editorial audit register. The register is evidence; resolve its old record paths when explicitly checking snapshots. **Experimental:** none. **Unresolved:** later migration batches and any independent cold-storage review.

## Preservation and branch disposition

All records and archives remain on `main` when merged; source blobs are unchanged. Historical branches remain untouched. Deployment/automation branch-name dependencies beyond this PR are not established. **Deletion approval:** not granted; retain this branch and all historical branches pending a separate preservation review.

## Verified merge outcome (recorded by batch 5)

Shipped in [PR #254](https://github.com/jcr0916-hue/federatedrepublic/pull/254), merge `083a0c02eedd0a0e2ad7ae8c87db4bd774772a33`. World publishing, Constitution archival, and Vercel passed on head `43f06821ba3582969352b54be03644228189eeab`. Production deployment `dpl_ESHcRnkQPW3dMJ24ocCHM993oPFe` is READY for the merge, and all moved record URLs plus the homepage, World index/archive, and Constitution print page returned HTTP 200 with bytes matching the validated baseline. Branch retained; no deletion authorized.
