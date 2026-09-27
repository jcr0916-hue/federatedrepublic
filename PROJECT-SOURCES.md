# Cold storage — superseded project material

This is `archive/legacy-project-material`, a frozen historical snapshot.
**Nothing on this branch establishes current project authority.**
Use [PROJECT-SOURCES.md on main](https://github.com/jcr0916-hue/federatedrepublic/blob/main/PROJECT-SOURCES.md)
for current law, Torenthia canon, operational state, sources, and workflows.

## Preservation

This branch was created from main at `e3639d0fd93b664dc559c18a83d1dc8d39df5dd9`.
[COLD-STORAGE-MANIFEST.json](COLD-STORAGE-MANIFEST.json) records the original paths,
byte sizes, and SHA-256 hashes of all 71 files retired in the first migration.
The 65 `docs/archive/` files and six additional legacy files remain at their
original paths with their bytes unchanged. The legacy Atlas implementation is
preserved here; its public URL on main becomes a compatibility page.
Other files inherited from the snapshot are historical context, not current authority.

## Branch policy

- Cold storage only; do not develop or publish from this branch.
- Do not periodically merge main into this branch.
- Add material only when it retires from active use; preserve its provenance.
- Never merge this branch back into main.
- Keep current authority and public historical canon on main.
- Automatic Vercel deployment is disabled for this branch in its own configuration.
- Git history remains the ultimate backup.

Historical plans can contain abandoned dates, outcomes, instructions, and workflows.
Consult them only for explicitly requested historical work, never as new canon or
current operating instructions.

## Later retirements

The TypingMind guide, tag planner, and its tests were retired from main at
`82335e6a61378571de28dad9206900c31f5e603e` and preserved at their original paths.
Their manifest entries record `retiredFrom` separately from the initial snapshot.
This raises the preservation inventory to 74 files; no merge from main was made.
