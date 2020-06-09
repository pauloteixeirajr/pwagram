self.addEventListener('install', function (event) {
  console.log('[Service worker] Install event...', event);
});

self.addEventListener('activate', function (event) {
  console.log('[Service worker] Activate event...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  console.log('[Service worker] Fetch event...', event);
});
