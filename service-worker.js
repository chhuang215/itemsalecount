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

  if (evt.request.url.indexOf('livereload') !== -1) {
    // Not a page navigation, bail.
    return;
  }
  // if (evt.request.mode !== 'navigate') {
  //   // Not a page navigation, bail.
  //   return;
  // }

  evt.respondWith(
    fetch(evt.request)
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
