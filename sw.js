// Service worker for Português Drill - registered by the app itself (see
// syncServiceWorkerRegistration() in index.html).
//
// Strategy: network-first, cache-fallback, for every GET request. Online
// users always get the freshest version; the cache is only used when the
// network request actually fails, i.e. genuinely offline.
//
// IMPORTANT: bump CACHE_VERSION every time the app's own version stamp (in
// index.html) is bumped, so old cached files get cleared out.
//
// The prefix is 'pt-drill-' (not the Japanese apps' 'jp-drill-') on purpose:
// on activate this deletes every OTHER cache with its own prefix, and apps
// published under the same github.io address share one cache store - a
// shared prefix would let this app wipe the Japanese apps' offline copies.
const CACHE_VERSION = 'pt-drill-v261011-010';

const PRECACHE_URLS = [
  './',
  './index.html',
  './vocab.js',
  './grammar.js',
  './instructions.html',
  './changelog.html',
  './manifest-pt.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // One at a time, so a single missing asset can't stop the rest caching.
      Promise.all(
        PRECACHE_URLS.map((url) => cache.add(url).catch(() => {}))
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith('pt-drill-') && name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Network-first still means "wait for the network" by default, and a
// connection that's merely slow/lossy (weak signal on a train, one bar in a
// station) rather than cleanly offline can leave a plain fetch() hanging for
// a long time before the browser's own timeout gives up and lets the catch()
// below run. Racing every fetch against a short timeout means a bad-but-not-
// dead connection still falls back to the cached version quickly, instead of
// the app just sitting there loading.
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const networkFetch = fetch(event.request).then((response) => {
    // Only cache genuinely successful responses. Opaque cross-origin
    // responses (status 0) are also cached best-effort - the Google
    // Font request falls in this category on some browsers - since a
    // stale font is a much smaller problem than a missing one offline.
    if (response && (response.ok || response.type === 'opaque')) {
      const copy = response.clone();
      caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy)).catch(() => {});
    }
    return response;
  });
  // If the timeout below wins the race, this fetch is still left running in
  // the background (not cancelled) so a slow-but-eventually-successful
  // response still updates the cache for next time. That means it can go on
  // to reject on its own after the race is already settled - swallow that
  // here so it doesn't show up as an unhandled rejection; the user's already
  // been served from cache by then.
  networkFetch.catch(() => {});

  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('network-timeout')), NETWORK_TIMEOUT_MS);
  });

  event.respondWith(
    Promise.race([networkFetch, timeout]).catch(() => caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      // No exact match cached - if this was a page navigation (not an
      // image/font/etc.), fall back to the cached app shell rather than
      // showing the browser's own offline error page.
      if (event.request.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    }))
  );
});
