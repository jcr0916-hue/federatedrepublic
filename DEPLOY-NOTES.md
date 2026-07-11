# Living Crossroads — harness deploy notes (TEST BUILD)

This is the HARNESS on THROWAWAY test content (Provincial Delegate infrastructure story).
NOT Thoss, NOT canon. Purpose: prove the real Sonnet classifier works end-to-end.

## Files
- crossroads.html — the stateless page (fetches test-crossroads.json)
- test-crossroads.json — the throwaway test content
- api/crossroads.js — the Sonnet 5 classifier endpoint (routing decisions only, never prose)

## vercel.json — ADD these two lines (mirrors survey.js pattern):
In "builds":  { "src": "api/crossroads.js", "use": "@vercel/node", "config": { "maxDuration": 30 } },
In "routes":  { "src": "/api/crossroads", "dest": "/api/crossroads.js" },

## What to test once deployed
Free text that the BUTTONS DON'T OFFER should route to the clever-move fragments:
- Scene 1 → type a "bridge actor" move (find a hawk trusted by farmers to carry it) → should hit s1_bridge
- Scene 2 → type "sell the sunset as a feature / future leverage" → should hit s2_reframe
- Scene 3 → type "put the hawk and the rural delegate in a room together" → should hit s3_convene
Out-of-bounds test: type something off-topic (e.g. "threaten to leak their records") → graceful redirect.

## Safety properties (verify held)
- The endpoint returns ONLY {fragment, confidence, missing, read} — never story prose.
- Invalid/unknown fragment ids are coerced to out_of_bounds.
- Bad JSON from the model fails safe to out_of_bounds.
- No data stored anywhere. Stateless.

## Local preview (no API)
crossroads-harness.html (self-contained, in outputs) runs offline using a keyword STUB
fallback — good for checking layout/flow/on-ramp, but the REAL intent-reading only works
once api/crossroads.js is deployed.
