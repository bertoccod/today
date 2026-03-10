const CACHE_NAME = 'today-v1.6'; // Incrementato a 1.6 per forzare l'aggiornamento

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
  './compleanni.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/placeholder-musica.png',
  './assets/placeholder_gigante.jpg', // Corretto in .jpg come da discussione
  './assets/logo_orizz.png'
];

// 1. INSTALLAZIONE: Crea la cache e scarica i file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Pre-caching in corso...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // Forza l'attivazione immediata
});

// 2. ATTIVAZIONE: Pulisce le vecchie versioni della cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('SW: Rimozione vecchia cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// 3. FETCH: Strategia Stale-While-Revalidate
self.addEventListener('fetch', event => {
  // Escludi chiamate esterne dinamiche (Firebase, API Google, Wikipedia)
  if (
    event.request.url.includes('firestore') || 
    event.request.url.includes('google') || 
    event.request.url.includes('wikipedia.org') ||
    event.request.url.includes('santodelgiorno.it') ||
    event.request.url.includes('artic.edu') ||
    event.request.url.includes('audioscrobbler.com')
  ) {
    return; // Lascia che il browser gestisca queste chiamate normalmente
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Se la risposta è valida, salva una copia aggiornata nella cache
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Se la rete fallisce e non c'è cache, puoi gestire l'errore qui
          return cachedResponse;
        });

        // Ritorna subito la versione in cache (se esiste), altrimenti aspetta la rete
        return cachedResponse || fetchPromise;
      });
    })
  );
});