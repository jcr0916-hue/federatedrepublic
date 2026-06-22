/* Service Worker — The Federated Republic
   Strategy: network-first for HTML, cache-first for assets
   On first visit: cache everything. On repeat visits: instant load.
   On offline: serve cached version. */

const CACHE = 'fr-v7';

const PAGES = [
  '/', '/index.html',
  '/annotated.html', '/scenarios.html', '/glossary.html',
  '/diagrams.html', '/docket.html', '/sources.html',
  '/constitutional-history.html', '/changelog.html',
  '/constitution-current.pdf'
];

const ASSETS = [
  '/site.css', '/search-index.js', '/seal.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
];

/* Install: cache all pages and assets */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([...PAGES, ...ASSETS]).catch(() =>
        cache.addAll(ASSETS) // fall back to just assets if a page is unavailable
      )
    ).then(() => self.skipWaiting())
  );
});

/* Activate: remove old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch: network-first for HTML, cache-first for everything else */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Only handle same-origin + Google Fonts
  if (url.origin !== location.origin &&
      !url.hostname.includes('fonts.g')) return;

  const isHTML = e.request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network-first: fresh HTML when online, cached fallback offline
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first: instant load for CSS, JS, fonts, images
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        });
      })
    );
  }
});
