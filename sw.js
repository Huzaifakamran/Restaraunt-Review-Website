var staticCacheName = 'v2';
/**
 * Install Service worker and cache all pages and assets required for offline access
 */
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(staticCacheName).then((cache) => {
    return cache.addAll(['./',
      'js/main.js', 'js/restaurant_info.js', 'js/dbhelper.js', 'js/indexController.js',
      'css/styles.css',
      'img/1.jpg', 'img/2.jpg', 'img/3.jpg', 'img/4.jpg', 'img/5.jpg', 
      'data/restaurants.json',
      'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
      'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
      ]);
  }));
});

/**
 * Activate Service worker and delete old cache (if any) add new cache
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((cacheNames) => {
    return Promise.all(cacheNames.filter((cacheName) => {
      return cacheName.startsWith('mws-') && cacheName != staticCacheName;
    }).map((cacheName) => {
      return caches.delete(cacheName);
    }));
  }));
});

/***
 * Intercept all request and match against the cache to respond accordingly
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((response) => {
    /**
     * If we have a matching response, we return the cached value, otherwise we return
     * the result of a call to fetch, which will make a network request and return the
     * data if anything can be retrieved from the network.
     * This is a simple example and uses any cached assets we cached during the install step.
     */
    return response ||
    caches.open(staticCacheName).then((cache) => {
      return fetch(event.request).then((response) => {
        if (response.status === 404) {
          console.log("Page not found.");
          return new Response("Page not found.")
        }
        /**
         * If we want to cache new requests cumulatively, we can do so by handling the response
         * of the fetch request and then adding it to the cache, like below.
         * Below code will cache the visited restaurant page
         */
        if(event.request.url.indexOf('restaurant.html') != -1 || event.request.url.indexOf('leaflet') != -1){
          cache.put(event.request, response.clone());
        }
        return response;
      });
    });
  }).catch(function() {
      // If both(cache miss and n/w fetch) fail, show a generic fallback:
      return new Response("You seems to be offline, and we didn't find any old cache for the URL.")
  })
  );
});

/**
 * listen for the "message" event, and call
 * skipWaiting if you get the appropriate message
 */
self.addEventListener('message', (event) => {
  if (event.data) {
    console.log('Messgae received:' + event.data);
    self.skipWaiting();
  }
});