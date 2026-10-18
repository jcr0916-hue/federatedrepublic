# Publishing repair and branch cleanup results — 2026-10-18

## Completed changes

- **Publishing repaired:** #213 merged as `92eadf508ff8564e3cbf44a4703b38877496feea` after both required checks passed. All 23 removed HTML copies were byte-identical to retained canonical files.
- **Cleanup safeguards shipped:** #211 merged as `ff1c8f3e9f93809d44e8bdfc1744f242dfb552ce` after both required checks and Vercel passed. Deletion now uses atomic server-enforced SHA leases, complete open-PR head/base pagination, permanent/default/protected ref checks, and preservation ancestry.
- **Follow-on review preserved:** #214 merged as `90b1941f614192106c86f41bfad142bf7b27bdba`, with both required checks and Vercel passing on head `0f3b9fbfd603e990698b8efd1328ebab976bc482`.
- **135 reviewed refs actually deleted:** Batch 12 deleted ten; batches 13–18 deleted twenty each; batch 19 deleted five. Every batch had a successful read-only preview, fresh live validation, atomic leases, and subsequent checks of permanent and unique-work refs. No stale lease was overridden.

The initial live inventory was 139 branches. One delivery branch was created for this work. At this reporting checkpoint, five branches remain: the four retained refs below and the delivery branch while this report is reviewed. After this report merges, the delivery ref must receive a separate fresh preview and SHA-lease deletion; that outcome is not claimed in this checkpoint record.

[Complete actual deletion ledger](BRANCH-CLEANUP-RESULTS-20261018.json) lists all 135 names, exact deleted SHAs, batch numbers, and preservation destinations. The [frozen manifest](BRANCH-CLEANUP-20261018.json) and [preservation/dependency review](BRANCH-CLEANUP-REVIEW-20261018.md) remain on main. Execution logs and final delivery-ref verification are retained with this chat's completion artifacts.

## Retained refs

- `main`: current published implementation and canonical content.
- `archive/legacy-project-material`: unchanged tip `0053ac4da09d32807d7f5b71ef0fff2075b421c1`, unchanged tree `08176b6d2fb144bdc7f14136d5254fb81c6591c0`. All archived historical commits and intermediate files remain reachable.
- `content/torenthia-y14m01-20261014`: unchanged `f0cdc26787904586d16c9eb0b1882a231f41ae8d`. Four unique commits of reporting and planning remain for substantive review.
- `review/scenario-executive-legislature-20261016`: unchanged `7ec363fd7850f8edc8c79ac953a8532b59d4ff7e`. Three unique scenario/drafting commits remain for substantive review.

The natural stopping rule has been reached for the original backlog. These unique histories were neither merged nor deleted. Archive-only experiments were retained as historical source through the permanent graph, with explicit decisions recorded; none was revived as current canon.

## Verification

- Full local publishing check passed: 351 built pages, 221 public records, 13 State historical tests, 12 State profile/Constitution routes, 54 scenarios, and 177 constitutional provisions.
- Twelve new destructive-operation safety regressions, seven manifest validation regressions, and five pre-existing cleanup regressions passed.
- #213 final-head CI: World publishing run 39135551736; Constitution archival run 39135551725 — both success.
- #211 final-head CI: World publishing run 39172089228; Constitution archival run 39172089358 — both success.
- #214 final-head CI: World publishing run 39172719155; Constitution archival run 39172719121 — both success.
- Canonical page blobs and constitutional sources were preserved. The only content removals in this continuation were the 23 identical suffixed HTML copies. No Torenthia Year 14 event or constitutional meaning was changed.
- Production runs from main. Checked domain/environment bindings, all 217 alias records at the dependency checkpoint, zero deploy hooks in authenticated settings, GitHub Pages policy, workflow refs and repository hooks. No deployment, alias, environment or security setting was deleted or weakened.
- #197 was already closed unmerged. Verified the intended replacement #199 is merged and its corrected scenario is unchanged in current main. No blind stale-PR merge occurred.

## Remaining substantive work

The two unique branches above require their own editorial/constitutional decisions. They are outside obsolete-ref deletion. Outgoing Vercel notification-webhook listing remained permission-denied through the connector and CLI; branch-specific deploy hooks were independently verified absent through the authenticated project settings.
