importScripts('/src/js/idb.js');
importScripts('/src/js/utils.js');

const CACHE_STATIC = 'static-v2';
const CACHE_DYNAMIC = 'dynamic-v2';
const STATIC_FILES = [
  '/index.html',
  '/offline.html',
  '/src/js/idb.js',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/utils.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
];
const firebase = 'https://pwgram-b099b.firebaseio.com/posts.json';
const firebaseApi =
  'https://us-central1-pwgram-b099b.cloudfunctions.net/storePostData';

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
  if (event.request.url.includes(firebase)) {
    event.respondWith(
      fetch(event.request).then(function (res) {
        const clonedRes = res.clone();
        clearAllData('posts')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (let key in data) {
              writeData('posts', data[key]);
            }
          });
        return res;
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

self.addEventListener('sync', function (event) {
  if (event.tag === 'sync-new-post') {
    event.waitUntil(
      readAllData('sync-posts').then(function (data) {
        for (const dt of data) {
          const postData = new FormData();
          postData.append('id', dt.id);
          postData.append('title', dt.title);
          postData.append('location', dt.location);
          postData.append('rawLocationLat', dt.rawLocation.lat);
          postData.append('rawLocationLng', dt.rawLocation.lng);
          postData.append('file', dt.picture, dt.id + '.png');

          fetch(firebaseApi, {
            method: 'POST',
            body: postData,
          })
            .then(function (res) {
              console.log('Sent data', res);
              if (res.ok) {
                res.json().then(function (resData) {
                  deleteItemFromData('sync-posts', resData.id);
                });
              }
            })
            .catch(function (err) {
              console.log(err);
            });
        }
      })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  const notification = event.notification;
  const action = event.action;

  if (action === 'confirm') {
    console.log('Confirm was chosen');
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll().then(function (clis) {
        const client = clis.find(function (c) {
          return c.visibilityState === 'visible';
        });
        if (client) {
          client.navigate(notification.data.url);
          client.focus();
        } else {
          clients.openWindow(notification.data.url);
        }
        notification.close();
      })
    );
  }
});

self.addEventListener('notificationclose', function (event) {
  console.log('Notification was closed', event);
});

self.addEventListener('push', function (event) {
  let data = {
    title: 'New!',
    content: 'Something new happened',
    openUrl: '/',
  };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const options = {
    body: data.content,
    icon: '/scr/images/icons/app-icon-96x96.png',
    badge: '/scr/images/icons/app-icon-96x96.png',
    data: {
      url: data.openUrl,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
