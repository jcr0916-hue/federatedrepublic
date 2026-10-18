# Publishing repair and branch cleanup review — 2026-10-18

## Completed repair and first cleanup

- #213 merged as `92eadf508ff8564e3cbf44a4703b38877496feea` after World publishing and Constitution archival passed. Independently compared all 23 removed HTML blobs to retained canonical pages: identical. No canonical source or Year 14 narrative changed.
- #211 refreshed against that repair and merged as `ff1c8f3e9f93809d44e8bdfc1744f242dfb552ce`. Final head `037cdd43bda06b681a93d4bb79efb96433402d66` passed both checks and Vercel. The script now uses atomic server-enforced SHA leases and checks protected/default/permanent refs and every open PR head/base.
- Fresh preview on merged main verified all ten Batch 12 candidates. The subsequent atomic push deleted exactly those ten refs; the refreshed inventory contained 129 branches. Both permanent refs and both unique-work refs remained intact.
- Full local publishing check passed: 351 built pages, 221 public records, 13 State historical tests, 12 State profile/Constitution routes, 54 scenarios, and 177 constitutional provisions. Twelve new destructive-operation safety tests and five existing cleanup regressions passed.
- #197 was already closed without merging. Confirmed #199 is merged, its corrected scenario is unchanged on current main, and its head is reachable from main. No stale scenario branch was merged by this work.

## Frozen follow-on batches

[BRANCH-CLEANUP-20261018.json](BRANCH-CLEANUP-20261018.json) records 125 exact branch names and full tip SHAs in seven batches (13–18: twenty each; 19: five). Each entry names its preservation destination, tip subject, and related merged PRs when established. All 213 existing PRs were examined; no open PR remains at this review snapshot. Live checks must be repeated before each batch.

Fifty-eight candidate histories are reachable from main; sixty-seven are reachable only from the permanent archive. Archive-only histories are historical source, not current canon. Their exact tip SHAs also match the earlier complete preservation manifest. All commits and intermediate versions are retained through the archive's parent graph, not merely through links or PR references. The archive tree remains `08176b6d2fb144bdc7f14136d5254fb81c6591c0` and its tip remains `0053ac4da09d32807d7f5b71ef0fff2075b421c1`.

Use `scripts/reviewed-branch-cleanup-manifest.py --batch <number>` for a read-only preview. After reviewing that preview and dependencies, the user's explicit authorization permits `CLEANUP_MODE=DELETE-BATCH-<number>`. The runner reuses Batch 12's complete live validation and atomic lease implementation. It rejects another repository, duplicate or malformed SHA entries, and batches above twenty refs. Missing refs are successful no-ops. Never expand a failed lease to the new tip without a new review.

## Explicit preservation review of earlier experimental holds

The older deletion-gate report's three experimental HOLD entries predate the durable archive and decision registers. Reviewed those reports, exact current tips, affected-path comparisons, the complete preservation manifest, and both decision registers before including these names:

- `benchmark-navigator-sonnet5` at `e8f9ebabacb079216de14923a5c76016e73b5199`: six original experimental commits are ancestors of the retained archive. The temporary comparison endpoint and its configuration remain historical source. Later model outcomes and the Sonnet 5 residual promotion are recorded in [AI-EXPERIMENT-DECISIONS.md](AI-EXPERIMENT-DECISIONS.md), including #94. Earlier unrecorded measurements remain not established. Do not deploy the temporary endpoint or rerun a model selection merely because its old branch existed.
- `constitutional-subsidiarity-transition` at `4d95b6a1156d6c6210308fbd854ed5a159f56387`: eight predecessor commits are archived. The adopted v2 and #96 supersede the original draft. [CONSTITUTION-PUBLISHING-DECISIONS.md](CONSTITUTION-PUBLISHING-DECISIONS.md) records the distinction. Do not restore old Constitution JSON, derivatives, or scenario prose.
- `publishing-safety-and-papers` at `d82a3879b940fa81e89fae8b2694baf30cd28f58`: twelve prototype commits, including the unadopted paper/registry framework, are archived. #14 adopted the blocking publication checks; the decision register distinguishes that shipped work from historical experiments. No experiment is revived or relabeled as shipped.

These branch names are cleared as redundant historical refs under the user's authorization because their complete evidence and decisions remain durably preserved. Their archived content is not merged into main. Other archive-only candidates have merged PR provenance in the frozen manifest. `review/scenario-military-treaty-scope-20261016`, which has no separate PR, is entirely reachable from main.

## Deployment and automation dependencies

- The connected Vercel project is `prj_ayI3VUTkMQC7VQ01XCb8AdJSXysE`, team `team_1kqG0k2PIXvDT5ZP0JLX3WS3`. Production is built from main.
- Both custom domains have no branch binding. There are no custom environments or branch-scoped environment variables. The authenticated project's Git settings explicitly state that there are no deploy hooks.
- Inspected all 217 alias records across three pages. Custom/production aliases point to the main production deployment; the other entries are generated preview aliases. No deployment or alias is deleted. [Generated URLs](https://vercel.com/docs/deployments/generated-urls) and [retention policies](https://vercel.com/docs/deployment-retention) govern those artifacts independently.
- The connector denied outgoing notification-webhook listing (403), and the local CLI could not access that team. The required branch deploy-hook check was completed through the authenticated browser instead; it found zero hooks. Notification subscription configuration was not changed.
- GitHub Pages' branch policy names only main. The repository has no webhooks. Checked workflow branch triggers and dispatch scripts; they preserve main, the archive, and the fixed reviewed cleanup lists. No matching local Codex automation configuration was found.
- The final CI and preview for each new PR must finish before that PR head is eligible. Any new branch, PR, protection rule, active deployment, or changed SHA discovered during execution is retained pending review.

## Retained work and stopping rule

Retain `main` and `archive/legacy-project-material` permanently. Also retain these two unique histories unchanged:

- `content/torenthia-y14m01-20261014` at `f0cdc26787904586d16c9eb0b1882a231f41ae8d`: four commits of election/local reporting and Korda delegate-accountability planning. No adoption or canon change is authorized by cleanup.
- `review/scenario-executive-legislature-20261016` at `7ec363fd7850f8edc8c79ac953a8532b59d4ff7e`: three commits concerning single-candidate voter confirmation and a drafting discrepancy. Preserve for substantive review; do not silently merge or discard.

Once all straightforward frozen candidates are processed, stop at these retained refs and any newly discovered work. Record actual deletions and a final fresh inventory separately; the proposed manifest is not an execution result.
