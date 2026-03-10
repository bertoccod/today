const CACHE_NAME = 'today-v1.5'; // Cambia versione per pulire tutto
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
  './assets/placeholder-musica.png',
  './assets/logo_orizz.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Usa la logica dell'app che FUNZIONA (Cache-first)
self.addEventListener('fetch', event => {
  // Escludi Firebase e API di Google dal controllo della cache
  if (event.request.url.includes('firestore') || event.request.url.includes('google')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Se è in cache, dalli subito, altrimenti vai in rete
      return response || fetch(event.request);
    })
  );
});