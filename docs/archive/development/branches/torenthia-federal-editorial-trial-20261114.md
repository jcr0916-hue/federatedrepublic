# Branch history — Federal synthetic editorial trial

- **Original branch** `editorial/receipt-e476a4ff-cc68-4d31-bba8-33b3e754c2f0`
- **Base** [Draft PR #323](https://github.com/jcr0916-hue/federatedrepublic/pull/323) at `c4da1959bd3fa7d3ce9c7cb42f7096efaf7b9bd0`
- **Status** Synthetic editorial trial staged for review. The workspace and ledger implementation remains on its own draft.

## Trial

- The existing Cloudflare connector listed and read the exact November 11 Federal acceptance receipt from the live R2 inbox. The raw object is a version 1 noncanonical `PROPOSED` record. Its legacy status overlay is `HOLD`, event `728b1e77-1d04-4c94-82ae-f133a678bf3a`. The overlay records the earlier test disposition. The trial used the original R2 object for identity and all Cloudflare calls were read-only.
- The [GitHub ledger entry](../../../torenthia/editorial/inbox-ledger/e476a4ff-cc68-4d31-bba8-33b3e754c2f0.json) stages one `REVISION_REQUESTED` decision. The editor’s [Federal assignment](../../../torenthia/agents/federal/workspace/desk.md) asks for citations to the two controlling clauses and the published source-table notice. The raw receipt stayed outside GitHub. The ledger carries its hash, receipt metadata and the synthetic editorial decision.
- An exact replay of the receipt and decision reported no change. The branch validates one ledger entry, four disabled desks and zero planned runs or spend. The local newsroom suite passed all 12 tests. Hosted check results are recorded on the trial PR.

## Follow-up

- Review the single decision and linked assignment in the stacked draft. Delivery to a desk and receipt of a revision are outside this trial. Draft [#320](https://github.com/jcr0916-hue/federatedrepublic/pull/320) remains the independent Federal publication proposal.
- Retain the branch while its PR is open. Recheck dependencies and the exact tip after any future approved merge before applying the reviewed [branch rotation](../BRANCH-LIFECYCLE.md).
