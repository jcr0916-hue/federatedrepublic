# Historical Constitution reconstruction

The current automatic archive started at commit `9ee6104ef1ed89291874d6b8963128d501afb816`. Earlier editions from September 18 to that baseline need separate preservation. The existing `archive/legacy-project-material` branch contains older historical documents and is **not** replaced by this work.

Run `python3 -B scripts/recover-constitution-history.py` for a **read-only**, machine-readable audit. It walks published first-parent history, identifies every Constitution change, verifies both original JSON/Markdown files against their historically committed renderer, and reports exceptions rather than inventing documents. PR CI uploads this report as a downloadable artifact.

Only after reviewing the audit, run `python3 -B scripts/recover-constitution-history.py --apply` in a working Git checkout. It refuses to write if any pair is invalid, and uses the established append-only archival mechanism, with exact historical bytes, date-based matched names, original commit provenance, and SHA-256 metadata. It does not change the current Constitution. Commit new archives and the resulting review notes together in a follow-up pull request; branch deletion must wait for verified preservation.

No historical snapshots have been claimed as recovered merely by adding this script.
