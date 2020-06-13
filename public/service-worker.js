const CACHE_STATIC = 'static-v2';
const CACHE_DYNAMIC = 'dynamic-v2';
const STATIC_FILES = [
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
];

function isInArray(string, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === string) {
      return true;
    }
  }
  return false;
}

function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then(function (cache) {
    return cache.keys().then(function (keys) {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
      }
    });
  });
}

self.addEventListener('install', function (event) {
  console.log('[Service worker] Install event...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC).then(function (cache) {
      // Cache all url requests
      cache.addAll(['/', ...STATIC_FILES]);
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
  let httpBin = 'https://pwgram.firebaseio.com/posts.json';
  if (event.request.url.includes(httpBin)) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC).then(function (cache) {
        return fetch(event.request).then(function (res) {
          trimCache(CACHE_DYNAMIC, 10);
          cache.put(event.request, res.clone());
          return res;
        });
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        // Response will be null if cache is not available
        if (response) return response;

        return fetch(event.request)
          .then(function (res) {
            return caches.open(CACHE_DYNAMIC).then(function (cache) {
              trimCache(CACHE_DYNAMIC, 10);
              // res.clone() to avoid the Promise from being consumed before returning it
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch(function (error) {
            return caches.open(CACHE_STATIC).then(function (cache) {
              if (event.request.headers.get('accept').includes('text/html')) {
                return cache.match('/offline.html');
              }
            });
          });
      })
    );
  }
});
