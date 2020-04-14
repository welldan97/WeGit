const CACHE = 'wegit-v1';

const AUTO_CACHE = ['/', '/service-worker.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(AUTO_CACHE))
      .then(self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => CACHE !== cacheName);
      })
      .then(unusedCaches => {
        return Promise.all(
          unusedCaches.map(unusedCache => {
            return caches.delete(unusedCache);
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    }),
  );
});
