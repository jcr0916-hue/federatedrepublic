# Branch cleanup preservation and dependency review — October 30, 2026

The first GitHub snapshot contained **56 branches**. Complete pagination then found **57**, including another task's new `content/torenthia-oct30-election-preparations` branch. All **267 PRs** and **3,231 deployment records** were inventoried. No PR was open at that checkpoint. This is a frozen review and deletion preview, not a claim that refs have already been deleted.

## Preservation
History-only merge `0bb710a2966b119c42552fd7b7061063a9ebf33d` has the exact tree `155ecb962a60bb9ed1d1dba53df4c8e6f6dbdde6` of audit main `a8bf128dae8db8710d3a10f1de101439c338781d`. Its 29 completed-tip parents preserve **141 distinct previously unreachable commits**. All 47 completed/merged frozen tips are ancestors of that commit. Merge this PR with **Create a merge commit**, never squash/rebase, so those original commits reach main before cleanup. No content from these historical parents is adopted.

The archive remains tip `0053ac4da09d32807d7f5b71ef0fff2075b421c1`, tree `08176b6d2fb144bdc7f14136d5254fb81c6591c0`. No archive ref update is part of this work.

## Deletion preview

Before this delivery PR merges, the newest eligible completed branches are PR #267, #266, and #265. The other **44** of the 47 completed branches become deletion candidates only after preservation is on main. This delivery branch and concurrent new completed work may enter the rotation, displacing older members after fresh checks. The workflow result ledger records actual names and counts.

## Dependency evidence

- GitHub default branch is main; unconditional delete-on-merge is disabled. All listed branches are unprotected and the repository has no active rulesets at the audit checkpoint. Protection and applicable branch rules are queried again before deletion.
- No repository webhooks. GitHub Pages is disabled (404); the legacy github-pages environment remains, with its sole branch policy verified as main. No environment, deployment, alias, or webhook is removed.
- Vercel project `prj_ayI3VUTkMQC7VQ01XCb8AdJSXysE` production deployment `dpl_8xufq2XDGjdDkky26PqVWou9qRYg` is READY from main `a8bf128dae8db8710d3a10f1de101439c338781d`. Both domain records have null gitBranch/customEnvironmentId. No custom environment or branch-scoped variable binding exists.
- Authenticated hosting Git settings explicitly show **no deploy hooks**. Historical preview aliases point at immutable deployments, which do not require a live Git branch to continue serving. All **259** aliases and all deployments remain in place.
- The current repository enables Vercel Git deployments only for main. Two completed release-specific workflows are retired in this PR, removing references and writes to `release-review-constitution-261023`. Their full historical files remain in Git.
- The generated-wording staging workflow still names `constitution-wording-torenthia-y14m1-261023`; that branch is held. Any new literal workflow reference blocks automatic cleanup.
- Active World publishing work on `content/torenthia-oct30-election-preparations` is held. A queued legacy run names an already absent navigator benchmark branch; no ref is recreated. New open PR heads/bases and active workflow/deployment references are always held.
- No local Codex automation configuration directory exists in this workspace account. Unknown external automation is not inferred safe: future automatic candidates need a fresh explicit dependency attestation for their exact tip. Reviews expire after seven days. Outgoing Vercel notification webhooks are outside deploy-hook control and were not modified.

## Retained substantive exceptions

- `content/torenthia-y14m01-20261014` — four unreviewed reporting/planning commits; retained since October 18.
- `review/scenario-executive-legislature-20261016` — three unique scenario/drafting commits; retained since October 18.
- `feature/global-navigator-drawer-20261024` — closed unmerged PR #239; three unique implementation commits.
- `fix/repair-constitution-after-pr219` — closed unmerged PR #220; four unique recovery commits.
- `working-fiscal-amendment-refine-261020` — closed unmerged PR #232; one unique fiscal drafting commit.
- `working-fiscal-draft-and-principle-test-261020` — 97 unique commits after PR #231; substantive constitutional release history requires review.
- `constitution-wording-torenthia-y14m1-261023` — tip differs from merged PR #235; one unique generated-artifact commit and a staging workflow dependency.

## Completed-branch handoff index

### `change/remove-mandatory-devolution-provisional-20261019`
- Shipped: [PR #219: Separate State remediation from voluntary devolution](https://github.com/jcr0916-hue/federatedrepublic/pull/219) merged 2026-10-19T18:27:55Z.
- Frozen SHA: `7cd289977a03fd4aa6b9b8e6209fc4db0d084ec2`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-219-historical-handoff.md](branches/pr-219-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-canon-status-relocation-20261026`
- Shipped: [PR #247: Docs: relocate Torenthia Story Bible and Story Status with runtime consumers](https://github.com/jcr0916-hue/federatedrepublic/pull/247) merged 2026-10-26T15:33:33Z.
- Frozen SHA: `e113a2b9382f383101660a95bfb956a1d624c5b2`; 18 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-247-historical-handoff.md](branches/pr-247-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-first-record-relocation-20261026`
- Shipped: [PR #251: World: pilot relocation of three published Torenthia records](https://github.com/jcr0916-hue/federatedrepublic/pull/251) merged 2026-10-27T01:09:49Z.
- Frozen SHA: `e0168036f9c4481465072c140fbc36a99ddbf4f3`; 8 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-251.md](branches/pr-251.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-publishing-guide-relocation-20261026`
- Shipped: [PR #246: Docs: move Torenthia publishing guide into dedicated folder](https://github.com/jcr0916-hue/federatedrepublic/pull/246) merged 2026-10-26T13:53:34Z.
- Frozen SHA: `c8a23af192563274334d3f476f85ccdf26af4b06`; 6 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-246-historical-handoff.md](branches/pr-246-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-record-inventory-mixed-layout-20261026`
- Shipped: [PR #249: World: support root and categorized Torenthia record inventories](https://github.com/jcr0916-hue/federatedrepublic/pull/249) merged 2026-10-26T20:43:53Z.
- Frozen SHA: `11f5a75555781b214010a2347c2934d65ecb0b28`; 6 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-249-historical-handoff.md](branches/pr-249-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-record-relocation-batch2-20261026`
- Shipped: [PR #252: World: relocate seven more published Torenthia records (batch 2)](https://github.com/jcr0916-hue/federatedrepublic/pull/252) merged 2026-10-27T11:55:49Z.
- Frozen SHA: `65c24148a69c417450411ec3012ba663f768980b`; 17 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-252.md](branches/pr-252.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-record-relocation-batch3-20261027`
- Shipped: [PR #253: World: relocate eight Torenthia records (batch 3)](https://github.com/jcr0916-hue/federatedrepublic/pull/253) merged 2026-10-27T12:46:08Z.
- Frozen SHA: `4dea14564290a6f274e2f18819ee314087f44230`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-record-relocation-batch3-20261027.md](branches/torenthia-record-relocation-batch3-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-record-relocation-batch4-20261027`
- Shipped: [PR #254: World: relocate 40 Torenthia records and retain audit coverage (batch 4)](https://github.com/jcr0916-hue/federatedrepublic/pull/254) merged 2026-10-27T12:52:29Z.
- Frozen SHA: `43f06821ba3582969352b54be03644228189eeab`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-record-relocation-batch4-20261027.md](branches/torenthia-record-relocation-batch4-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-record-relocation-batch5-20261027`
- Shipped: [PR #255: World: relocate 40 unchanged Torenthia records (batch 5)](https://github.com/jcr0916-hue/federatedrepublic/pull/255) merged 2026-10-27T12:56:46Z.
- Frozen SHA: `eb07e0e54f6a79a2bab7a05f56e6455cf25f1cc1`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-record-relocation-batch5-20261027.md](branches/torenthia-record-relocation-batch5-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-record-relocation-batch6-20261027`
- Shipped: [PR #256: World: relocate 40 unchanged Torenthia records (batch 6)](https://github.com/jcr0916-hue/federatedrepublic/pull/256) merged 2026-10-27T12:59:26Z.
- Frozen SHA: `4ec579f335e786bf28e0ecba60542683c2e67ea0`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-record-relocation-batch6-20261027.md](branches/torenthia-record-relocation-batch6-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-record-relocation-batch7-20261027`
- Shipped: [PR #257: World: relocate 40 unchanged Torenthia records (batch 7)](https://github.com/jcr0916-hue/federatedrepublic/pull/257) merged 2026-10-27T13:02:04Z.
- Frozen SHA: `4413658bb5899cd2a16aa12f9157d34473bca9c6`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-record-relocation-batch7-20261027.md](branches/torenthia-record-relocation-batch7-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-record-relocation-batch8-20261027`
- Shipped: [PR #258: World: relocate 40 unchanged Torenthia records (batch 8)](https://github.com/jcr0916-hue/federatedrepublic/pull/258) merged 2026-10-27T13:04:33Z.
- Frozen SHA: `1b0c584cf0fed49f9cc65c2f5a687edd83b66006`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-record-relocation-batch8-20261027.md](branches/torenthia-record-relocation-batch8-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-record-relocation-batch9-20261027`
- Shipped: [PR #259: World: relocate final 38 Torenthia records and preserve manifest (batch 9)](https://github.com/jcr0916-hue/federatedrepublic/pull/259) merged 2026-10-27T13:07:27Z.
- Frozen SHA: `250870b920d9adad8764c558a5afe3a2f3f6ada9`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-record-relocation-batch9-20261027.md](branches/torenthia-record-relocation-batch9-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-records-routing-foundation-20261026`
- Shipped: [PR #248: Build: preserve Torenthia public URLs ahead of record-source relocation](https://github.com/jcr0916-hue/federatedrepublic/pull/248) merged 2026-10-26T18:34:42Z.
- Frozen SHA: `d5ee2d59f99fa2ba0da6b96c5cf36f5a49499f6b`; 2 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-248-historical-handoff.md](branches/pr-248-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-relocation-completion-20261027`
- Shipped: [PR #260: Docs: close Torenthia reorganization with preservation and production evidence](https://github.com/jcr0916-hue/federatedrepublic/pull/260) merged 2026-10-27T13:12:57Z.
- Frozen SHA: `06f3b6a2ec7dc5746ec3822bb048602e1eb7637c`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-relocation-completion-20261027.md](branches/torenthia-relocation-completion-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-repository-organization-20261026`
- Shipped: [PR #244: Docs: Torenthia navigation hub and guarded repository reorganization](https://github.com/jcr0916-hue/federatedrepublic/pull/244) merged 2026-10-26T13:47:01Z.
- Frozen SHA: `c35d74b79534f833f05f542f5da5ebabc3c909c9`; 3 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-244-historical-handoff.md](branches/pr-244-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-storylines-relocation-20261026`
- Shipped: [PR #245: Docs: relocate Year 14 Torenthia planning to its dedicated folder](https://github.com/jcr0916-hue/federatedrepublic/pull/245) merged 2026-10-26T13:49:35Z.
- Frozen SHA: `34c76ecb7dab4f7982f7b539d168d1981067de7f`; 4 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-245-historical-handoff.md](branches/pr-245-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `chore/torenthia-world-authoring-paths-20261026`
- Shipped: [PR #250: World: route newly authored and ingested Torenthia records into source folders](https://github.com/jcr0916-hue/federatedrepublic/pull/250) merged 2026-10-26T23:19:55Z.
- Frozen SHA: `201c53452013d2be12bfb1fc30158be490ee032b`; 8 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-250-historical-handoff.md](branches/pr-250-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `constitution/statehood-audit-fiscal-capacity`
- Shipped: [PR #226: Clarify fiscal capacity within Statehood Audit criteria](https://github.com/jcr0916-hue/federatedrepublic/pull/226) merged 2026-10-19T21:24:23Z.
- Frozen SHA: `bdf955ab0f657d991142ca510744bcc933d892d8`; 7 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-226-historical-handoff.md](branches/pr-226-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `content/state-constitutional-tests-20261029-b`
- Shipped: [PR #266: State history: Arvane special session and Merath labor tribunal](https://github.com/jcr0916-hue/federatedrepublic/pull/266) merged 2026-10-30T01:44:20Z.
- Frozen SHA: `de18e9cdd6e189ca5c08304c03bcb7541f627fd4`; 4 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [state-constitutional-tests-20261029-b.md](branches/state-constitutional-tests-20261029-b.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `content/torenthia-election-outlook-20261027`
- Shipped: [PR #261: Torenthia: spring election coverage and conditional Assembly outlook](https://github.com/jcr0916-hue/federatedrepublic/pull/261) merged 2026-10-27T14:33:45Z.
- Frozen SHA: `74c5af5d204032f2bd34d08ed929029d03010aba`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [content-torenthia-election-outlook-20261027.md](branches/content-torenthia-election-outlook-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `content/torenthia-partisan-column-20261027`
- Shipped: [PR #262: Rewrite Thoss election outlook as a partisan newspaper column](https://github.com/jcr0916-hue/federatedrepublic/pull/262) merged 2026-10-27T16:29:44Z.
- Frozen SHA: `210d13f1ac95861ea23262b4c75d99f3f5e94b80`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [content-torenthia-partisan-column-20261027.md](branches/content-torenthia-partisan-column-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `content/torenthia-state-tests-20261029`
- Shipped: [PR #265: Torenthia: Korda electorate updates and two State constitutional tests](https://github.com/jcr0916-hue/federatedrepublic/pull/265) merged 2026-10-29T12:38:36Z.
- Frozen SHA: `227545260cc0be3e5e3b774138dc7df4c485874a`; 6 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-state-tests-20261029.md](branches/torenthia-state-tests-20261029.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `content/torenthia-y14m1-election-public-questions-20261019`
- Shipped: [PR #218: Publish Torenthia Y14 M1 candidate questions and Dorven source records](https://github.com/jcr0916-hue/federatedrepublic/pull/218) merged 2026-10-19T13:37:24Z.
- Frozen SHA: `acc9cb7adccb06ee0312aa6bb08a9b44d1abd7a3`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-y14m1-election-public-questions-20261019.md](branches/torenthia-y14m1-election-public-questions-20261019.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `content/torenthia-y14m01-speakers-20261026`
- Shipped: [PR #243: Torenthia Y14 M1: The Votes Behind the Speakers + three NRS records](https://github.com/jcr0916-hue/federatedrepublic/pull/243) merged 2026-10-26T13:20:06Z.
- Frozen SHA: `8e142bd218dd08977197d56445509ad1fdbef050`; 5 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-243-historical-handoff.md](branches/pr-243-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `content/torenthia-y14m2-updates-20261028`
- Shipped: [PR #264: Torenthia: four Year 14 Month 2 civic and election-season updates](https://github.com/jcr0916-hue/federatedrepublic/pull/264) merged 2026-10-28T13:15:09Z.
- Frozen SHA: `446a6f0f6433f4427ee3b593bbcc04981914d5a5`; 6 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [torenthia-y14m2-updates-20261028.md](branches/torenthia-y14m2-updates-20261028.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `copy/clarify-constitution-scenarios-torenthia-261019`
- Shipped: [PR #228: Clarify Constitution's scenarios and Torenthia's illustrative role](https://github.com/jcr0916-hue/federatedrepublic/pull/228) merged 2026-10-19T23:25:48Z.
- Frozen SHA: `ff57897d629ec9642b54dbce37a1c4156c526543`; 1 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-228-historical-handoff.md](branches/pr-228-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `docs/constitution-history-261023`
- Shipped: [PR #236: Record constitutional release history and the latest military-notice wording](https://github.com/jcr0916-hue/federatedrepublic/pull/236) merged 2026-10-24T04:45:32Z.
- Frozen SHA: `9756fc4f44c01e1a85b5555ded1795d9ea74785c`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [constitution-history-261023.md](branches/constitution-history-261023.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `docs/history-statehood-fiscal-261019`
- Shipped: [PR #227: Document fiscal capacity Statehood Audit change in constitutional history](https://github.com/jcr0916-hue/federatedrepublic/pull/227) merged 2026-10-19T23:22:25Z.
- Frozen SHA: `ceed42c108fe899436abb4b2a440615a8c15c521`; 1 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-227-historical-handoff.md](branches/pr-227-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `editorial/scenario-citizenship-and-discovery-20261024`
- Shipped: [PR #238: Add Article V citizenship scenario and improve scenario discovery](https://github.com/jcr0916-hue/federatedrepublic/pull/238) merged 2026-10-24T12:28:29Z.
- Frozen SHA: `8109b3e216bcd5eacef7ed70b7f896082e1aa4f9`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-238.md](branches/pr-238.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `fix/constitution-2-17-federal-20261018`
- Shipped: [PR #217: Limit §2.17 cooling-off restriction to federal executive service](https://github.com/jcr0916-hue/federatedrepublic/pull/217) merged 2026-10-19T04:07:18Z.
- Frozen SHA: `bea36637d28be3194b429e773ad8ef6cf9ef3ee2`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [constitution-2-17-federal-20261018.md](branches/constitution-2-17-federal-20261018.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `fix/constitution-post219-clean-sync`
- Shipped: [PR #221: Restore generated Constitution consistency after PR #219](https://github.com/jcr0916-hue/federatedrepublic/pull/221) merged 2026-10-19T18:40:00Z.
- Frozen SHA: `5817a3de70c1323342e7ef59571a214094467aa2`; 8 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-221-historical-handoff.md](branches/pr-221-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `fix/constitutional-archive-recovery-check-261023`
- Shipped: [PR #234: Repair historical Constitution recovery and record production verification](https://github.com/jcr0916-hue/federatedrepublic/pull/234) merged 2026-10-24T04:04:25Z.
- Frozen SHA: `c0ba58e340da9decdf5bf79f25edca228b0749ce`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [constitutional-archive-recovery-261023.md](branches/constitutional-archive-recovery-261023.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `fix/ottoline-nvs-verification-20261019`
- Shipped: [PR #225: Align Ottoline Pree dispatch with National Voting System](https://github.com/jcr0916-hue/federatedrepublic/pull/225) merged 2026-10-19T21:15:29Z.
- Frozen SHA: `fbfbf0cee809761ba74e1cfa799507c5a58a03e3`; 1 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-225-historical-handoff.md](branches/pr-225-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `fix/rehn-term-election-cycle-y14`
- Shipped: [PR #223: Align Rehn's term with Year 14 Legat Consul election](https://github.com/jcr0916-hue/federatedrepublic/pull/223) merged 2026-10-19T20:00:49Z.
- Frozen SHA: `429df4864d46a089d99f80ab6bcb6d99e3acaa6b`; 6 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-223-historical-handoff.md](branches/pr-223-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `holdout-remove-monitor-role-261024`
- Shipped: [PR #242: The Holdout: remove invented Monitor certification role](https://github.com/jcr0916-hue/federatedrepublic/pull/242) merged 2026-10-25T00:22:15Z.
- Frozen SHA: `42dacfc553e5a3e0b08e4ed0c509eeffdb0258ae`; 1 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-242-historical-handoff.md](branches/pr-242-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `maintenance/branch-lifecycle-delete-by-default-20261029`
- Shipped: [PR #267: Policy: archive branch work at merge, then delete safe task branches by default](https://github.com/jcr0916-hue/federatedrepublic/pull/267) merged 2026-10-30T02:28:23Z.
- Frozen SHA: `47ed11bc16054e83935d07bbfcdd6e24dbca86c9`; 3 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [branch-lifecycle-delete-default-20261029.md](branches/branch-lifecycle-delete-default-20261029.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `maintenance/low-deployment-workflow-20261027`
- Shipped: [PR #263: Validate development in Actions and deploy only merged main work](https://github.com/jcr0916-hue/federatedrepublic/pull/263) merged 2026-10-27T16:45:40Z.
- Frozen SHA: `67064a8fb6d3d2f3c8aaceb05f9b65c2f28fc207`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [low-deployment-workflow-20261027.md](branches/low-deployment-workflow-20261027.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `release-review-constitution-261023`
- Shipped: [PR #233: Release the Constitution and reconcile scenarios and Torenthia](https://github.com/jcr0916-hue/federatedrepublic/pull/233) merged 2026-10-24T03:46:39Z.
- Frozen SHA: `b405eed74a41531f62e06f69991ce3512d278fb7`; 0 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [release-review-constitution-261023.md](branches/release-review-constitution-261023.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `shall-to-must-and-fiscal-261024`
- Shipped: [PR #241: Restore must drafting and apply agreed fiscal wording (§12.1.b, §12.2(2))](https://github.com/jcr0916-hue/federatedrepublic/pull/241) merged 2026-10-24T18:23:00Z.
- Frozen SHA: `f502e6844fce357d4f5b61223d832e80c46ac127`; 3 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-241.md](branches/pr-241.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `torenthia-election-season-batch-y14m1`
- Shipped: [PR #216: Add election-season Torenthia batch (NRS 102-106, news 116, Pree dispatch)](https://github.com/jcr0916-hue/federatedrepublic/pull/216) merged 2026-10-19T03:03:39Z.
- Frozen SHA: `2b0f546eb4fdf22883756d0789658d402f007647`; 2 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-216.md](branches/pr-216.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `torenthia-housing-and-field-y14m1`
- Shipped: [PR #237: Add housing act passage, Thoss reconsideration notice, LC qualification (NRS 114-117, news 123-124)](https://github.com/jcr0916-hue/federatedrepublic/pull/237) merged 2026-10-24T12:14:25Z.
- Frozen SHA: `f52ccd415587cf7946b48689910dc84e77805641`; 8 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-237.md](branches/pr-237.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `torenthia-petition-and-pause-y14m1`
- Shipped: [PR #240: Add Hosk pause, Fair Start initiative, Morantine/Aldenmere records, news 125](https://github.com/jcr0916-hue/federatedrepublic/pull/240) merged 2026-10-24T17:49:04Z.
- Frozen SHA: `3a7bf77efa4613af56f1e197896149683b6ca6f3`; 2 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-240.md](branches/pr-240.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `torenthia-solara-batch-y14m1`
- Shipped: [PR #229: Add Solara election-season batch (NRS 109-112, news 119-120)](https://github.com/jcr0916-hue/federatedrepublic/pull/229) merged 2026-10-20T03:05:50Z.
- Frozen SHA: `2ccd140d9d651e5d13b8ecb4123b3c4dc87f46b1`; 2 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-229.md](branches/pr-229.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `torenthia-thoss-priorities-y14m1`
- Shipped: [PR #230: Add Thoss priorities statement and interview (NRS 113, news 122)](https://github.com/jcr0916-hue/federatedrepublic/pull/230) merged 2026-10-24T12:13:08Z.
- Frozen SHA: `cb423ccb7ec14f217209ec8de4c651c623291f2e`; 5 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-230.md](branches/pr-230.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `world/corindal-audit-history-y14m1`
- Shipped: [PR #222: Establish Corindal audit history and Provisional State chronology](https://github.com/jcr0916-hue/federatedrepublic/pull/222) merged 2026-10-19T18:49:09Z.
- Frozen SHA: `eda86357a249053437724a6514d8940cfce342a5`; 2 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-222-historical-handoff.md](branches/pr-222-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.

### `world/corindal-interview-14-01`
- Shipped: [PR #224: Publish The Corindal Ledger interview with Casimir Rehn](https://github.com/jcr0916-hue/federatedrepublic/pull/224) merged 2026-10-19T20:10:06Z.
- Frozen SHA: `61140bf8b08fded2c6c191ebbaebad4a998b11be`; 1 original commits not reachable from permanent refs before preservation.
- Permanent handoff: [pr-224-historical-handoff.md](branches/pr-224-historical-handoff.md).
- Disposition: three-branch rotation; delete only after frozen tip reaches main and all current gates pass.


## Site and local verification

Both builds passed, and all **485 public output files** are byte-identical before and after this change. The new safety suite (23 tests), existing Batch 12 suite (12), and existing manifest suite (7) passed. Both new workflow files parse as YAML.

## Concurrent completed work

PR [#268](https://github.com/jcr0916-hue/federatedrepublic/pull/268) merged during this audit. Its original branch `content/torenthia-oct30-election-preparations`, tip `ceb1b5c006ece0e7fdcec57028c7c56ef8237603`, has 5 original commits not reachable from the squash merge. The delivery commit adds that tip as an additional history-preservation parent, retaining its exact objects without adopting old source. Its permanent handoff is [docs/archive/development/branches/torenthia-oct30-election-preparations.md](branches/torenthia-oct30-election-preparations.md). The same hosting/workflow checks found no branch-specific dependency, and a frozen review is now recorded. It joins the completed rotation only after preservation reaches main.
