# Branch history — newsroom/kelvant-norvane-varek-fix

**PR:** PENDING

## Purpose
Turn on the Kelvant and Norvane desks, and correct the Varek profile's stale Argent Ridge line.

## Shipped in this PR
- `docs/torenthia/agents/desks.json`: **Kelvant** enabled, Mondays, every week (its approval is one of the Northern Lake Settlement's pending steps, so it is an active desk). **Norvane** enabled, Saturdays, every second week, first run 2026-11-21 (Argent Ridge refusal and northern-arrival housing; quieter). Both use the shared runner key; their briefs, notes and assignments were already in place and current.
- `torenthia-state-varek.html`: "Norvane's remains outstanding" replaced with Norvane's later refusal (NRS 038) and that the designation has not taken effect.
- `scripts/newsroom-run.test.mjs`: Monday runner tests now name the Federal desk (`only: 'federal'`), so they keep testing one desk as more desks share Monday.

## Verification
`test:newsroom-run` 20/20, `test:newsroom-inbox` 15/15, `world:publish-check` passes.

## Preservation and branch disposition
Results live on `main` once merged. **Deletion approval:** not granted by this note.
