'use strict';

// Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

// Add list of files to cache here.
const FILES_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './global.css',
  './favicon.png',
  './favicon.ico',
  './build/bundle.css',
  './build/bundle.css.map',
  './build/extra.css',
  './build/bundle.js',
  './build/bundle.js.map',
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');

  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching offline page");
      console.log("[ServiceWorker] Caching " + FILES_TO_CACHE);
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // Remove previous cached data from disk.
  evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  // Add fetch event handler here.

  // if (evt.request.mode !== 'navigate') {
  //   // Not a page navigation, bail.
  //   return;
  // }
  // console.log("evt.request", evt.request)
  evt.respondWith(
    fetch(evt.request)
      .then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // console.log("[sw] cache put", evt.request);
          // console.log('[ServiceWorker] ok')
          
          return cache.match(evt.request.url)
            .then(() => {
              return response;
            })
            .catch(() => {
              console.log('[ServiceWorker] put cache')
              cache.put(evt.request.url, response.clone());
              return response;
            })
        });
      })
      .catch(() => {
        console.log('[ServiceWorker] not ok, get cache')
        return caches.match(evt.request.url).catch(() =>{
          return cache.match('offline.html');
        });
      })
    // fetch(evt.request)
    //     .catch(() => {
    //       return caches.open(CACHE_NAME)
    //           .then((cache) => {
    //             return cache.match('offline.html');
    //           });
    //     })
  );
});
