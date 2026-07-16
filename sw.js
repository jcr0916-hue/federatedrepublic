/* Service Worker — The Federated Republic
   Strategy: network-first for HTML, cache-first for assets
   On first visit: cache everything. On repeat visits: instant load.
   On offline: serve cached version. */

const CACHE = 'fr-v31';

const PAGES = [
  '/', '/index.html',
  '/annotated.html', '/scenarios.html', '/glossary.html',
  '/diagrams.html',  '/sources.html',
  '/constitutional-history.html', '/torenthia.html',
  '/constitution-current.pdf'
];

const ASSETS = [
  '/site.css', '/nav.js', '/search-index.js', '/seal.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Jost:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
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

  // Never touch the API. These are POSTs to Node functions; the Cache API rejects
  // cache.put() on a POST, and a stale answer from an AI endpoint is worse than none.
  if (url.pathname.startsWith('/api/')) return;

  // Only handle same-origin + Google Fonts
  if (url.origin !== location.origin &&
      !url.hostname.includes('fonts.g')) return;

  const isHTML = e.request.headers.get('accept')?.includes('text/html');

  // JSON is DATA, not an asset — it changes. thoss-crossroads.json was being served
  // cache-first, so a reader who played the crossroads once kept that version of the
  // story forever: the Legat Consul branch was invisible to anyone who had visited
  // before it shipped. Data goes network-first, with cache as the offline fallback.
  const isData = url.pathname.endsWith('.json');

  if (isHTML || isData) {
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
