const CACHE_NAME = 'v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './index.css',
  './index.js',
  './home.html',
  './home.css',
  './home.js',
  './theme.css',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/placeholder-musica.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
