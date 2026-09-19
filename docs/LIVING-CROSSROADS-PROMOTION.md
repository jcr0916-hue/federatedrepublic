# Recurring Living Crossroads card

The homepage and Torenthia hub share `_includes/living-crossroads.njk` and the evergreen `images/living-crossroads.jpg` artwork.

Change `_data/crossroads.json` to activate an installment: set `active` to `true`, and supply its `title`, `url`, and short `description`. The entire picture and caption become one accessible link. Set `active` to `false` between installments: the same artwork stays visible with a coming-next note and no game link. New game files must also be enabled in the engine and included in the build.

Keep episode names out of the artwork so it can be reused. The original generated PNG is not needed by the website; the JPEG is the optimized published asset.

The two pages use a versioned stylesheet URL for this update. The service worker now fetches same-origin CSS and JavaScript network-first, preventing older cached styles or game code from being paired indefinitely with fresh HTML.
