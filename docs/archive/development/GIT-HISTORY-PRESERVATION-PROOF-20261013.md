# Git-history preservation proof — 2026-10-13

The permanent Git ref `archive/legacy-project-material` was advanced by the **history-only merge commit** [`f2ecc59894455ca93aadb14ec377bf57b60f35f3`](https://github.com/jcr0916-hue/federatedrepublic/commit/f2ecc59894455ca93aadb14ec377bf57b60f35f3).

Its first parent is the former archive tip `5d3052d463bcc87fb33cc5a7e98fd375cf60a099`. The new commit retains **exactly the same root tree** (`08176b6d2fb144bdc7f14136d5254fb81c6591c0`); it does not replace or publish experiment files.

Its three additional Git parents point to the original experimental branch tips:

| Branch | Original tip | Previously main-only gap | Comparison after preservation |
|---|---|---:|---|
| `benchmark-navigator-sonnet5` | [`e8f9ebabacb079216de14923a5c76016e73b5199`](https://github.com/jcr0916-hue/federatedrepublic/commit/e8f9ebabacb079216de14923a5c76016e73b5199) | 6 branch-only commits | Branch is an ancestor of `archive/legacy-project-material`; 0 commits ahead |
| `constitutional-subsidiarity-transition` | [`4d95b6a1156d6c6210308fbd854ed5a159f56387`](https://github.com/jcr0916-hue/federatedrepublic/commit/4d95b6a1156d6c6210308fbd854ed5a159f56387) | 8 branch-only commits | Branch is an ancestor of `archive/legacy-project-material`; 0 commits ahead |
| `publishing-safety-and-papers` | [`d82a3879b940fa81e89fae8b2694baf30cd28f58`](https://github.com/jcr0916-hue/federatedrepublic/commit/d82a3879b940fa81e89fae8b2694baf30cd28f58) | 12 branch-only commits | Branch is an ancestor of `archive/legacy-project-material`; 0 commits ahead |

All **26 commits** and their ancestors remain reachable through the permanent archive ref. This preservation mechanism protects original commit metadata, parent relationships, snapshots and intermediate changes (unlike Markdown SHA references). It does **not** mean the obsolete changes were adopted into `main`.

## Cleanup implications

The three branches no longer have uniquely reachable history, provided `archive/legacy-project-material` and this preservation merge remain intact. The additional four special-case branches were already behind `main`. Both permanent branch refs must never be deleted or rewritten.

**No branch deletions have occurred.** Operational and dependency checks, a refreshed inventory, and a reviewed exact-name deletion manifest must precede deletion. Merged PR working branches may contain extra intermediate commits not yet separately analyzed; do not delete them en masse merely because their PR is merged.
