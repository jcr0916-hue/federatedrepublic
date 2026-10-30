# Branch cleanup results — October 30, 2026

**46 branches actually deleted; 12 retained** at the successful first-run checkpoint. No eligible older completed branch remains pending. [Exact names, frozen SHAs, and reasons](BRANCH-CLEANUP-RESULTS-20261030.json).

[Implementation PR #269](https://github.com/jcr0916-hue/federatedrepublic/pull/269) merged as `4490763dbb81f2466ba20d6dfc99c47a819a39cd`, after all final-head publishing, archival and cleanup safety checks passed. [Automatic cleanup run 41057106976](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41057106976) passed its read-only preview, fresh safety checks, three atomic SHA-leased deletion batches, and final verification. Already-absent refs in this first run: **0**.

## Permanent history and production

- `main` retained. All 48 reviewed original completed tips are now ancestors of main. The history-only commit preserves 141 otherwise unreachable original commits; the concurrent PR #268 original tip adds five more. **146 original commits** remain recoverable without restoring obsolete content.
- `archive/legacy-project-material` retained unchanged: commit `0053ac4da09d32807d7f5b71ef0fff2075b421c1`, tree `08176b6d2fb144bdc7f14136d5254fb81c6591c0`. Cold storage was never a deletion or write target.
- Current production deployment `dpl_DobuZxTwxRjwVyZVPCMNE46a85dA` is READY from merged main `4490763dbb81f2466ba20d6dfc99c47a819a39cd`. Home and annotated Constitution pages both returned HTTP 200. Both custom domains remain attached; deployments, all 259 audited aliases, environments, and security settings were kept.
- Before/after builds had **485 byte-identical public output files**, and the combined merge with concurrent PR #268 changes only maintenance scripts, workflows, instructions, and archive documentation. No canonical constitutional, editorial, API, or public site source was changed by cleanup.

## Retained branches and reasons

- `archive/legacy-project-material` — permanent/default branch.
- `constitution-wording-torenthia-y14m1-261023` — tip differs from merged PR #235; one unique generated-artifact commit and a staging workflow dependency.
- `content/torenthia-oct30-election-preparations` — three newest eligible completed branches.
- `content/torenthia-y14m01-20261014` — four unreviewed reporting/planning commits; retained since October 18.
- `feature/global-navigator-drawer-20261024` — closed unmerged PR #239; three unique implementation commits.
- `fix/repair-constitution-after-pr219` — closed unmerged PR #220; four unique recovery commits.
- `main` — permanent/default branch.
- `maintenance/branch-lifecycle-delete-by-default-20261029` — three newest eligible completed branches.
- `maintenance/branch-rotation-cleanup-20261030` — three newest eligible completed branches.
- `review/scenario-executive-legislature-20261016` — three unique scenario/drafting commits; retained since October 18.
- `working-fiscal-amendment-refine-261020` — closed unmerged PR #232; one unique fiscal drafting commit.
- `working-fiscal-draft-and-principle-test-261020` — 97 unique commits after PR #231; substantive constitutional release history requires review.

Seven substantive/dependency exceptions remain. Their exact tips are frozen in the inventory and remain unchanged. Three are closed-unmerged experiments; two have long-standing unique work; two differ from their merged PR tips, including 97 constitutional working-history commits and a generated-artifact branch with a current staging workflow reference. No substantive adoption/rejection decision was inferred merely from a closed PR.

## Deleted branches — exact actual list

- `change/remove-mandatory-devolution-provisional-20261019` — PR #219; frozen `7cd289977a03fd4aa6b9b8e6209fc4db0d084ec2` preserved on main.
- `chore/torenthia-canon-status-relocation-20261026` — PR #247; frozen `e113a2b9382f383101660a95bfb956a1d624c5b2` preserved on main.
- `chore/torenthia-first-record-relocation-20261026` — PR #251; frozen `e0168036f9c4481465072c140fbc36a99ddbf4f3` preserved on main.
- `chore/torenthia-publishing-guide-relocation-20261026` — PR #246; frozen `c8a23af192563274334d3f476f85ccdf26af4b06` preserved on main.
- `chore/torenthia-record-inventory-mixed-layout-20261026` — PR #249; frozen `11f5a75555781b214010a2347c2934d65ecb0b28` preserved on main.
- `chore/torenthia-record-relocation-batch2-20261026` — PR #252; frozen `65c24148a69c417450411ec3012ba663f768980b` preserved on main.
- `chore/torenthia-record-relocation-batch3-20261027` — PR #253; frozen `4dea14564290a6f274e2f18819ee314087f44230` preserved on main.
- `chore/torenthia-record-relocation-batch4-20261027` — PR #254; frozen `43f06821ba3582969352b54be03644228189eeab` preserved on main.
- `chore/torenthia-record-relocation-batch5-20261027` — PR #255; frozen `eb07e0e54f6a79a2bab7a05f56e6455cf25f1cc1` preserved on main.
- `chore/torenthia-record-relocation-batch6-20261027` — PR #256; frozen `4ec579f335e786bf28e0ecba60542683c2e67ea0` preserved on main.
- `chore/torenthia-record-relocation-batch7-20261027` — PR #257; frozen `4413658bb5899cd2a16aa12f9157d34473bca9c6` preserved on main.
- `chore/torenthia-record-relocation-batch8-20261027` — PR #258; frozen `1b0c584cf0fed49f9cc65c2f5a687edd83b66006` preserved on main.
- `chore/torenthia-record-relocation-batch9-20261027` — PR #259; frozen `250870b920d9adad8764c558a5afe3a2f3f6ada9` preserved on main.
- `chore/torenthia-records-routing-foundation-20261026` — PR #248; frozen `d5ee2d59f99fa2ba0da6b96c5cf36f5a49499f6b` preserved on main.
- `chore/torenthia-relocation-completion-20261027` — PR #260; frozen `06f3b6a2ec7dc5746ec3822bb048602e1eb7637c` preserved on main.
- `chore/torenthia-repository-organization-20261026` — PR #244; frozen `c35d74b79534f833f05f542f5da5ebabc3c909c9` preserved on main.
- `chore/torenthia-storylines-relocation-20261026` — PR #245; frozen `34c76ecb7dab4f7982f7b539d168d1981067de7f` preserved on main.
- `chore/torenthia-world-authoring-paths-20261026` — PR #250; frozen `201c53452013d2be12bfb1fc30158be490ee032b` preserved on main.
- `constitution/statehood-audit-fiscal-capacity` — PR #226; frozen `bdf955ab0f657d991142ca510744bcc933d892d8` preserved on main.
- `content/state-constitutional-tests-20261029-b` — PR #266; frozen `de18e9cdd6e189ca5c08304c03bcb7541f627fd4` preserved on main.
- `content/torenthia-election-outlook-20261027` — PR #261; frozen `74c5af5d204032f2bd34d08ed929029d03010aba` preserved on main.
- `content/torenthia-partisan-column-20261027` — PR #262; frozen `210d13f1ac95861ea23262b4c75d99f3f5e94b80` preserved on main.
- `content/torenthia-state-tests-20261029` — PR #265; frozen `227545260cc0be3e5e3b774138dc7df4c485874a` preserved on main.
- `content/torenthia-y14m01-speakers-20261026` — PR #243; frozen `8e142bd218dd08977197d56445509ad1fdbef050` preserved on main.
- `content/torenthia-y14m1-election-public-questions-20261019` — PR #218; frozen `acc9cb7adccb06ee0312aa6bb08a9b44d1abd7a3` preserved on main.
- `content/torenthia-y14m2-updates-20261028` — PR #264; frozen `446a6f0f6433f4427ee3b593bbcc04981914d5a5` preserved on main.
- `copy/clarify-constitution-scenarios-torenthia-261019` — PR #228; frozen `ff57897d629ec9642b54dbce37a1c4156c526543` preserved on main.
- `docs/constitution-history-261023` — PR #236; frozen `9756fc4f44c01e1a85b5555ded1795d9ea74785c` preserved on main.
- `docs/history-statehood-fiscal-261019` — PR #227; frozen `ceed42c108fe899436abb4b2a440615a8c15c521` preserved on main.
- `editorial/scenario-citizenship-and-discovery-20261024` — PR #238; frozen `8109b3e216bcd5eacef7ed70b7f896082e1aa4f9` preserved on main.
- `fix/constitution-2-17-federal-20261018` — PR #217; frozen `bea36637d28be3194b429e773ad8ef6cf9ef3ee2` preserved on main.
- `fix/constitution-post219-clean-sync` — PR #221; frozen `5817a3de70c1323342e7ef59571a214094467aa2` preserved on main.
- `fix/constitutional-archive-recovery-check-261023` — PR #234; frozen `c0ba58e340da9decdf5bf79f25edca228b0749ce` preserved on main.
- `fix/ottoline-nvs-verification-20261019` — PR #225; frozen `fbfbf0cee809761ba74e1cfa799507c5a58a03e3` preserved on main.
- `fix/rehn-term-election-cycle-y14` — PR #223; frozen `429df4864d46a089d99f80ab6bcb6d99e3acaa6b` preserved on main.
- `holdout-remove-monitor-role-261024` — PR #242; frozen `42dacfc553e5a3e0b08e4ed0c509eeffdb0258ae` preserved on main.
- `maintenance/low-deployment-workflow-20261027` — PR #263; frozen `67064a8fb6d3d2f3c8aaceb05f9b65c2f28fc207` preserved on main.
- `release-review-constitution-261023` — PR #233; frozen `b405eed74a41531f62e06f69991ce3512d278fb7` preserved on main.
- `shall-to-must-and-fiscal-261024` — PR #241; frozen `f502e6844fce357d4f5b61223d832e80c46ac127` preserved on main.
- `torenthia-election-season-batch-y14m1` — PR #216; frozen `2b0f546eb4fdf22883756d0789658d402f007647` preserved on main.
- `torenthia-housing-and-field-y14m1` — PR #237; frozen `f52ccd415587cf7946b48689910dc84e77805641` preserved on main.
- `torenthia-petition-and-pause-y14m1` — PR #240; frozen `3a7bf77efa4613af56f1e197896149683b6ca6f3` preserved on main.
- `torenthia-solara-batch-y14m1` — PR #229; frozen `2ccd140d9d651e5d13b8ecb4123b3c4dc87f46b1` preserved on main.
- `torenthia-thoss-priorities-y14m1` — PR #230; frozen `cb423ccb7ec14f217209ec8de4c651c623291f2e` preserved on main.
- `world/corindal-audit-history-y14m1` — PR #222; frozen `eda86357a249053437724a6514d8940cfce342a5` preserved on main.
- `world/corindal-interview-14-01` — PR #224; frozen `61140bf8b08fded2c6c191ebbaebad4a998b11be` preserved on main.

## Recurring safeguards

The [rolling workflow](../../../.github/workflows/rolling-branch-cleanup.yml) runs after a successful current-main World publishing run. Manual dispatch defaults to preview. It retains the three newest **eligible** completed branches plus all exceptions; current branch rules, open PR heads/bases, active workflows/deployments, original-tip reachability, frozen SHA, permanent handoff, and explicit external dependency review are mandatory. Fresh external attestations expire after seven days. The JSON preview expires after one hour. No unconditional delete-on-merge was enabled.

Actions summaries and artifacts record each actual disposition. The reviewed policy, 18 retrospective historical handoffs, [implementation handoff](branches/branch-rotation-cleanup-20261030.md), and [frozen audit](BRANCH-CLEANUP-20261030.json) are permanent on main.

## Reporting-branch closure

This report is delivered on temporary `maintenance/branch-cleanup-results-20261030`; it was not part of the first-run checkpoint above. After its merge, it enters the newest-three buffer and may displace `maintenance/branch-lifecycle-delete-by-default-20261029` (the oldest current member). Its post-merge workflow must record that actual follow-on disposition. This report does not pre-claim that final deletion or delete its own newly completed branch. The intended steady inventory stays **12**: two permanent refs, three rotating completions, and seven holds.

## Validation

- New rolling cleanup safety: **24 passed**. Existing destructive-operation regressions: **12 passed**. Existing manifest regressions: **7 passed**.
- PR #269 final head `e4f1e2fc320c1071a3aea1ac50bc0cb1617ccbd6`: World publishing runs [41056745666](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41056745666) and [41056738624](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41056738624), Constitution archival [41056746055](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41056746055), cleanup safety [41056745651](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41056745651) — all success.
- Main publishing [41056988785](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41056988785) and automated cleanup [41057106976](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/41057106976) — success.
- Exact deletion ledger cross-checked against every frozen original SHA and main ancestry. Real repeat of the exact frozen deletion preview: **success; 0 new deletions, all 46 refs already absent, 12 retained, 0 pending eligible deletions**. No ref was recreated and no missing-ref error occurred.
