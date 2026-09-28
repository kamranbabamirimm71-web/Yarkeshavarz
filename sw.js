const CACHE='yar-keshavarz-shell-v23';
const STATIC_CORE=[
  './offline/offline-ai.js',
  './offline/agriculture-db.js',
  './offline/agriculture-db-extended.js',
  './offline/calculators.js',
  './offline/context-engine.js',
  './offline/crop-profiles-universal.js',
  './offline/crop-profiles.js',
  './offline/crop-ui.js',
  './offline/global-agriculture-brain.js',
  './offline/global-crop-registry.js',
  './offline/intent-engine.js',
  './offline/specialized-crop-profiles.js',
  './offline/universal-crop-engine.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './logo.png',
  './wheat-hero.jpg',
  './admin.html',
  './admin.js',
  './admin.css',
  './data/knowledge/knowledge.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(STATIC_CORE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML/navigation is deliberately network-first. This prevents an old
  // cached index.html from hiding the deployed Yar Keshavarz UI.
  if (request.mode === 'navigate' ||
      request.destination === 'document' ||
      url.pathname.endsWith('/index.html')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put('./index.html', copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Other static files may use cache-first, with a network fallback.
  event.respondWith(
    caches.match(request).then(hit => hit || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
      }
      return response;
    }))
  );
});
