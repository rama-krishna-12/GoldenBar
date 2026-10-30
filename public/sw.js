const CACHE_NAME = 'goldenbar-pwa-cache-v3';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

// Offline HTML fallback page if cache match fails
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoldenBar - Offline Mode</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
    h1 { font-size: 24px; margin-bottom: 8px; color: #fbbf24; }
    p { font-size: 14px; opacity: 0.9; max-width: 320px; line-height: 1.5; color: #94a3b8; }
    button { margin-top: 20px; background: #fbbf24; color: #0f172a; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <h1>GoldenBar is Ready Offline</h1>
  <p>You are currently offline. GoldenBar stores your workout data locally on your device so you can continue training.</p>
  <button onclick="window.location.reload()">Retry Connection</button>
</body>
</html>`;

// Install event - precache assets individually to avoid atomic failure
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Put offline fallback page in cache
      await cache.put(
        new Request('/offline.html'),
        new Response(OFFLINE_FALLBACK_HTML, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
      );

      // Pre-cache core assets safely
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`GoldenBar SW: skipped caching ${url}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Stale-while-revalidate for static assets, network-first with offline fallback for navigation
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Let browser handle cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);

  // Navigation requests (HTML pages)
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;

          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;

          const indexCached = await caches.match('/index.html');
          if (indexCached) return indexCached;

          const offlineFallback = await caches.match('/offline.html');
          if (offlineFallback) return offlineFallback;

          return new Response(OFFLINE_FALLBACK_HTML, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // Asset requests (images, JS, CSS, fonts, manifest)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, nothing to update in cache
        });

      return cachedResponse || fetchPromise;
    })
  );
});
