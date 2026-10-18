# Constitution archive duplicate-file compatibility — 2026-10-18

## Incident
Both PR #211 and the original PR #212 failed checks because the pre-existing main archive contains 128 suffix-numbered copies (space-2 or space-3) of canonical archive files.

## Investigation
Compared all 128 duplicate Git blobs to correctly named counterparts on main: all were byte-identical. The validator rejected their unexpected filenames. Attempted deletion was correctly rejected by the separate historical archive immutability check.

## Resolution
PR #212 now **preserves every historical archive file**. It modifies the validator to recognize only the enumerated set of 128 pre-existing aliases, and only while their file content exactly equals the corresponding canonical archive file. Other unexpected filenames remain rejected. Historical archive immutability checks are unchanged. No Constitution data, archived content or publication records are modified.

## Verification
Archive pairs retained byte-for-byte; CI on updated PR pending. If passed, merge PR #212 before refreshing PR #211. No branch deletion is involved.

## Follow-up
After #212 merge, refresh #211 against main and verify both workflows. Continue authenticated cleanup preview before any deletion.
