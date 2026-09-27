# Test fixtures

`thoss-crossroads.json` is a byte-for-byte copy of the sealed, retired Thoss
Crossroads data, retained solely as an engine regression fixture. Its SHA-256 is
`3b66e1a72070e0b4aacb1c355eba55d4156bb6bad413506301aaa50266c17f19`.

The original is preserved on `archive/legacy-project-material`. This fixture is
not current canon or a playable installment. Keep it under `scripts/`, which
Eleventy excludes, and never add it to public assets or the game allowlist.
The tests verify the sealed bytes and legacy engine behavior without publishing it.
