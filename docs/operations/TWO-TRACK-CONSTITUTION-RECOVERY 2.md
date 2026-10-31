# Two-track recovery of historical constitutional sources

Run `python3 -B scripts/recover-constitution-history.py` to inspect the first-parent constitutional history between September 18, 2026 and the archival baseline. The report now evaluates **the superseded pair independently** of its successor; earlier audit counts may change.

Run `python3 -B scripts/recover-constitution-history.py --apply` only in a fresh Git checkout/working branch with complete history. It saves verified JSON+Markdown pairs to `docs/archive/constitution/` using the existing immutable archive validator and frozen historical renderer. For exceptions, it copies the original exact JSON and Markdown bytes to `docs/archive/constitution-exceptions/source-<commit>.{json,md}` with a machine-readable provenance record. An exception is **not** described as a valid synchronized edition merely because its original blobs survive.

The procedure does not mutate current Constitution files. Never include exception source files in the canonical archive, and do not delete original branches before separately examining unique historical material. Re-runs refuse to overwrite source files with differing bytes.

**Review the generated PR and its archival checks before merging.** No historical editions are represented as recovered until the generated snapshot files are committed.
