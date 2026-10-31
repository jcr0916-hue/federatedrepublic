# Branch cleanup batch 12 — 2026-10-18

**Original branch:** `maintenance/branch-cleanup-batch-12-20261018`

**PR:** [#211](https://github.com/jcr0916-hue/federatedrepublic/pull/211)
**Status:** reviewed cleanup tooling; deletion is a separate operation

## Scope and preservation
Ten existing branches with no commits ahead of main. The exact names and frozen tip SHAs remain in `scripts/reviewed-branch-cleanup-batch-12.py`. Prior Batch 05 Boolean correction was merged in PR #149. Main and `archive/legacy-project-material` are permanent.

Refreshed against repaired main `92eadf508ff8564e3cbf44a4703b38877496feea` after #212 and the successful #213 duplicate-page repair. No canon, constitutional text, historical archives, or canonical pages change in this PR.

## Safety and modes
Script defaults to `CLEANUP_MODE=preview` and requires `GITHUB_REPOSITORY`, `GITHUB_TOKEN`. It validates live tip SHAs, the frozen archive tip, default/permanent/protected branches, every page of open PR heads and bases, and full ancestry in a frozen permanent SHA. It rechecks permanent tips and repeats validation before deletion.

Deletion uses one `git push --atomic` with an explicit `--force-with-lease=refs/heads/<name>:<expected>` for every ref. A moved branch causes server rejection of the whole push. **Rejected:** the earlier GET-then-REST-DELETE sequence, which could delete a concurrent update despite a preceding SHA check. Missing branches remain successful no-ops. Read-only API requests retry transient failures; authorization failures are not ignored.

`CLEANUP_MODE=DELETE-BATCH-12` still requires a reviewed preview and separate external dependency clearance. The user explicitly authorized necessary merges and rigorously verified obsolete-branch deletions in this continuation on 2026-10-18. This note records that authorization; it does not grant it itself.

## Verification completed
- Successful authenticated live read-only preview: all ten frozen candidates VERIFIED, no refs changed. Initial network timeouts failed closed and were followed by the successful retry.
- Twelve new safety regressions passed, including SHA drift, unique history, archive drift, protected/default/permanent refs, PR bases and pagination, repeat-safe absence, validation before mutation, and atomic server leases. Five existing cleanup regressions also passed.
- Full local `npm run world:publish-check` passed: 351 built pages, 221 public records, 13 State historical tests, 12 State profile/Constitution routes, 54 scenarios, and 177 constitutional provisions. Dependency lockfiles matched the existing local installation.
- Refreshed head `54e2187aa4fed892d764410ca0db91566cd191ad` passed World publishing run 39135809530 and Constitution archival run 39135809461 before the additional safety changes; final-head CI must also pass before merge.
- Fresh inventory: 139 branches; 134 ancestry-eligible, two permanent, two with unique history, and this open PR head. Unique-history branches `content/torenthia-y14m01-20261014` and `review/scenario-executive-legislature-20261016` are excluded from deletion.
- #197 was already closed unmerged before this continuation. Verified merged #199 (`3d3ce169b6fe0a1e5608086bf73a1398fde23360`) is its replacement, its head is an ancestor of main, and the corrected scenario on main is unchanged from that replacement. Do not merge #197.
- External checks: Vercel production serves repaired main; both custom domains have no branch binding; no custom environments or branch-scoped environment variables; GitHub Pages policy names only main; no repository webhooks. Workflow branch triggers name main. Existing deployment artifacts and previews are not deleted by this cleanup.
- No branches deleted while preparing this PR.

## Next steps
Merge after final-head CI, rerun preview on merged main, and execute the authorized ten-ref cleanup with server leases after final dependency checks. Keep the archive unchanged. Review further frozen batches separately; retain unique work and any new PR or deployment dependency. Preserve the deletion results and final inventory in a completion record.
