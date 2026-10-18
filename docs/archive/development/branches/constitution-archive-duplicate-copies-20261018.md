# Constitution archive duplicate-copy repair — 2026-10-18

## Incident
PR #211 (branch cleanup batch 12) fails independent Constitution archival and World publishing CI. Logs indicate unexpected archive files with space-number duplicate suffixes, e.g. Constitution-261014 2.json and Constitution-261016-04.archive 2.json.

## Investigation
- Read main's docs/archive/constitution directory: 301 entries.
- Identified 128 files whose names include a duplicate suffix space-2 or space-3 before the extension.
- For each duplicate, verified an identically named canonical counterpart after removing the suffix and confirmed both Git blob SHA values were equal (byte-identical content).
- This branch deletes only the 128 duplicate-suffix copies; no canonical counterpart, historical original, manifest, policy, or check code is changed.
- The issue already exists on main. The two new files in PR #211 are unrelated to Constitution archive content.

## Verification
Every removed file had a matching same-byte canonical file on main. Pending GitHub CI validation after opening this PR. Do not modify archive validator to bypass malformed files.

## Next steps
Merge repair after CI succeeds. Re-run PR #211's checks against repaired main, then separately review and merge that branch cleanup script. Its deletion mode stays disabled pending authenticated preview and user approval.
