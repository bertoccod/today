const CACHE_NAME = 'v1.3';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './index.css',
  './index.js',
  './home.html',
  './home.css',
  './home.js',
  './theme.css',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/placeholder-musica.png',
  './assets/logo_orizz.png' 
];

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('Rimozione vecchia cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('firestore') || event.request.url.includes('google')) {
    return; 
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
