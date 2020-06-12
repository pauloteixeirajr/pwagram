const CACHE_STATIC = 'static-v2';
const CACHE_DYNAMIC = 'dynamic-v2';

self.addEventListener('install', function (event) {
  console.log('[Service worker] Install event...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC).then(function (cache) {
      // Cache all url requests
      cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
        '/src/js/app.js',
        '/src/js/feed.js',
        '/src/js/material.min.js',
        '/src/css/app.css',
        '/src/css/feed.css',
        '/src/images/main-image.jpg',
        'https://fonts.googleapis.com/css?family=Roboto:400,700',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
      ]);
    })
  );
});

self.addEventListener('activate', function (event) {
  console.log('[Service worker] Activate event...', event);
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_STATIC && key !== CACHE_DYNAMIC) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Response will be null if cache is not available
      if (response) return response;

      return fetch(event.request)
        .then(function (res) {
          return caches.open(CACHE_DYNAMIC).then(function (cache) {
            // res.clone() to avoid the Promise from being consumed before returning it
            cache.put(event.request.url, res.clone());
            return res;
          });
        })
        .catch(function (error) {
          return caches.open(CACHE_STATIC).then(function (cache) {
            return cache.match('/offline.html');
          });
        });
    })
  );
});
