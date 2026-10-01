// ==========================================================
// PWA SERVICE WORKER (sw.js)
// ==========================================================
const CACHE_NAME = 'fitbullk-hub-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/js/dataService.js',
  '/js/career.js',
  '/js/stadium.js',
  '/js/player.js',
  '/js/physics.js',
  '/js/network.js',
  '/js/game.js',
  '/js/platform.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => console.warn('PWA Cache error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    }).catch(() => caches.match('/index.html'))
  );
});
