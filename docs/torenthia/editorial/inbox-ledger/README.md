# Newsroom submission ledger

This is the GitHub editorial decision record for the existing R2 newsroom inbox. Each original submission has one file named by its R2 UUID. The entry retains the full object key, the roster agent, submission time, kind, decoded receipt hash and an ordered list of editorial decisions. Keep GitHub-bound notes short and suitable for a public repository. Raw drafts and private material stay in R2 until secure archival is arranged.

## Record a receipt

1. Use the existing Cloudflare connector to list `federated-republic-newsroom` under `submissions/` and read the exact raw object. The live Worker also uses `status/` and `reviews/` for legacy overlays. Read those only when reconciling a historical decision. The original `PROPOSED` record supplies the stable identity and hash.
2. Look for `<submission-id>.json` on current `main` and open editorial PRs. Reuse the branch already holding that receipt, or start `editorial/receipt-<submission-id>` at current `main`. Keep one open PR per receipt and use its exact head SHA for each write. For a batch, designate one editor to own the affected receipts and check each UUID against open work before staging it.
3. Keep the raw object outside the public checkout. From the editorial checkout, preview intake with `node scripts/newsroom/cli.mjs record /path/to/receipt.json [decision.json]`. The command returns the ledger path, proposed entry and whether it changed. Save only the returned `entry` as JSON at that path on the editorial branch. Preview a later decision with `node scripts/newsroom/cli.mjs decide <submission-id> /path/to/decision.json`.
4. Stage the ledger entry and any shareable task in the desk’s `workspace/desk.md` on the editorial branch. Send the revision request through the existing approved operator channel if the desk is still using TypingMind. Revisions arrive in R2 under a new UUID. Record both receipts and link the new entry’s decision back to the original via `relatedReceiptId`. The validator checks that each linked receipt exists.
5. Before proposing a merge, validate against the current base SHA and review the public diff. If the branch head moved, re-read the ledger first. Reuse the same decision UUID and data for an exact retry. If a different decision landed first, reconcile it before making a new decision with the new predecessor. The CI check protects the original receipt metadata and each already recorded decision from edits or deletion.

## Decision fields

- `id` is a fresh UUID v4 per decision. `previousId` is the latest decision UUID, or `null` on the first decision.
- `recordedAt` is a real UTC timestamp. `editor` is the responsible GitHub login.
- `disposition` uses the existing newsroom statuses `UNDER_REVIEW`, `REVISION_REQUESTED`, `ASSIGN`, `ACCEPTED`, `WATCH`, `HOLD`, `ARCHIVED` and `REJECTED`. `note` records the editor’s rationale or requested change.
- Optional `followUp` carries `agentId` and `task`. Optional `relatedReceiptId` points to another ledger UUID.
- Optional `publication` carries a `pullRequest` number. After the approved publication PR merges and the page is verified, append a decision with the publication PR, `mergeCommit` and live `url`.
- An `ARCHIVED` decision may carry `archive` with a GitHub `repository`, immutable `commit` SHA and JSON `path`. The operator verifies that protected archive independently before any retention change.

For example, an editor’s decision file may contain the following synthetic data.

```json
{
  "id": "20000000-0000-4000-8000-000000000001",
  "previousId": null,
  "recordedAt": "2026-11-16T16:30:00Z",
  "editor": "example-editor",
  "disposition": "REVISION_REQUESTED",
  "note": "Add the controlling published source.",
  "followUp": {
    "agentId": "federal",
    "task": "Cite the published record in the revised report."
  }
}
```

Use the existing [Torenthia publishing process](../../PUBLISHING.md) for any article or NRS proposal. Its exact copy and merge remain the President’s decision. [Newsroom operating guide](../../NEWSROOM-OPERATIONS.md)
