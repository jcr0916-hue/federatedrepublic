# Recurring Living Crossroads card

The homepage renders `_includes/living-crossroads.njk` and the evergreen `images/living-crossroads.jpg` artwork when an installment is active. The Torenthia hub currently does not embed the card; it may reuse the same component for a future active story.

Change `_data/crossroads.json` to activate an installment: set `active` to `true`, and supply its `title`, `url`, and short `description`. The entire picture and caption become one accessible link. Set `active` to `false` between installments: the homepage shows only a compact, unlinked standby notice with no large artwork; the full artwork and game link return automatically when the feature becomes active. New game files must also be enabled in the engine and included in the build.

When an installment concludes, also remove any episode-specific navigation entry and dossier promotion; the feature switch alone does not remove those manually authored links. Keep the old game file for archival reference and existing direct links unless a separate decision calls for withdrawing those URLs. A new installment should supply its own game data and only then restore navigation and promotion.

Keep episode names out of the artwork so it can be reused. The original generated PNG is not needed by the website; the JPEG is the optimized published asset.

The two pages use a versioned stylesheet URL for this update. The service worker now fetches same-origin CSS and JavaScript network-first, preventing older cached styles or game code from being paired indefinitely with fresh HTML.
