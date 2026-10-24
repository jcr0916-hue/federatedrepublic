# Constitutional release — historical recovery repair

The constitutional release shipped in [PR #233](https://github.com/jcr0916-hue/federatedrepublic/pull/233), merge `8759e9f73de4609b856b06ff13bd97f4358bfc41`. Its public pages, PDFs and deterministic APIs passed [production verification](constitutional-release-261023-production.json). The post-merge [recovery run](https://github.com/jcr0916-hue/federatedrepublic/actions/runs/40059688070) failed while replaying older first-parent history. The release's ordinary archive comparison passed; it did not previously rehearse that entire recovery history.

## Historical evidence and scope

- On 18 October, `47e9f9fdba9f79663c500cd5898d10f8ca85890c` temporarily removed 128 suffix-numbered duplicate archive files. `2d786132cff15205d36e370e03ed05f92221b91e` restored their exact bytes. The existing [branch report](../archive/development/branches/constitution-archive-duplicate-copies-20261018.md) documents why restoration was required and why only the enumerated aliases are recognized. Current and canonical files remain intact. The recovery replay had still rejected the historical deletion even after restoration.
- PR #219's merge `e309c3bb667f153d71dd4c184fc73652f1d08f33` published JSON without matching generated Markdown. `f9b93b4f4b308c6810b9cc6045c8d9d820818a07` repaired the generated text. The original broken JSON and Markdown are now preserved byte-for-byte as `docs/archive/constitution-exceptions/source-e309c3bb667f153d71dd4c184fc73652f1d08f33.*`, with hashes, supersession provenance and the explicit status `unverified_historical_source`. They are not described as a valid constitutional edition.
- Recovery also preserved the valid edition immediately before PR #219 as the new matched pair `Constitution-261019-02.*`, sourced from `38d7c002f2553e2d4d473e166f3055fe201fa8f6` and its historically committed renderer. This is an addition; no existing archive or metadata was changed.

## Repair and safeguards

`constitution-archive.py` recognizes only those fixed historical commits. For the alias event it requires the restoration on the audited first-parent chain and identical alias/canonical Git blobs before deletion, at restoration and at the head. A later deletion or edit of the same alias remains an error. The ordinary before/after immutability check is unchanged.

For the one broken edition it requires the known repair on the first-parent chain and verifies both saved raw files and provenance hashes against the actual historical pair. The valid predecessor can be archived even though the incoming historical edition was broken. The broken pair is never inserted into the certified archive. Unknown mismatches, missing/changed evidence, current mismatches and all other historical archive changes remain errors. The fixed baseline was not advanced and Git history was not rewritten.

The existing archival `check` command now verifies the full first-parent recovery plan against committed source evidence without writing files. Its existing pull request job therefore rejects missing historical pairs or raw exception evidence before merge. No workflow-file edit or credential expansion is required. This catches the failure path that the ordinary current/base comparison did not exercise.

## Actual validation and publication record

All 33 archival tests passed locally, including eight additional history tests: fixed-event recognition, later alias deletion rejection, exact-blob verification, first-parent requirements, raw-source preservation, and refusal of tampered evidence before any archive writes. The additional preflight tests require committed pairs and committed raw evidence, and confirm that failed checks write nothing. The existing tests rejecting unknown invalid intermediate revisions and changes later restored continue to pass. Real-history recovery preserved one missing valid pair; its second run recovered zero pairs, confirming idempotence.

The full publishing suite passed locally after the repair, including 164 Node tests, 33 archival tests, all 368 built pages and the frozen 338-decision compatibility snapshot. Remote follow-up checks must pass before merging this repair. The public constitutional content and approved JSON are unchanged. Final repair PR, merge, recovery-job and deployment results are appended below or in the linked PR before this release project is described as complete.
