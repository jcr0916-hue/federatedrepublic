# Living Crossroads — THOSS (the real feature)

The harness, now carrying the sealed Thoss crossroads. Same proven mechanic
you tested; real Torenthia content.

## Files
- crossroads.html — the page (fetches thoss-crossroads.json). Renamed from the test page.
- thoss-crossroads.json — the Thoss content.
- api/crossroads.js — the Sonnet 5 classifier (unchanged from the test build; routing decisions only).

## vercel.json — the /api/crossroads route should already be registered from the test deploy.
If not, add (mirrors survey.js):
  builds: { "src": "api/crossroads.js", "use": "@vercel/node", "config": { "maxDuration": 30 } }
  routes: { "src": "/api/crossroads", "dest": "/api/crossroads.js" }

## Launch sequencing (John's plan)
- Goes navigable ~2 weeks before the canon piece publishes.
- Keep it unlinked until you're ready, then wire it into nav/feature card when you launch the window.
- 2-3 World pieces/day through the window, >=1 mundane, building toward the resolution.
- Retires when the canon news piece publishes.

## What stays sealed
The canon outcome is sealed (Claude only). John plays as a player. Do not surface the
canon path in any player-facing text.
