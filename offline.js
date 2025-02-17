const CACHE_NAME = 'offline-cache-v1';
const FILES_TO_CACHE = [
    '/index.html',
    '/fs.js',
    '/wfs.js',
    '/jszip.js',
    '/target.json'
];

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "stop") {
        console.log("<i> Goodbye, cruel world");
        self.registration.unregister().then(() => {
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => client.navigate(client.url));
            });
        });
    } else if (event.data && event.data.type === "hello") {
        console.log(ver);
        event.source.postMessage({ type: ver });
    } else if (event.data && event.data.type === "update") {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        );
    }
});

self.addEventListener('install', (event) => {
    console.log('<i> Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching files...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('<i> Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

if (navigator.onLine === false) {
    self.addEventListener('fetch', (event) => {
        console.log('<i> Fetching:', event.request.url);
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        console.log('<i> Serving from cache: ', event.request.url);
                        return response;
                    }

                    return fetch(event.request)
                        .catch(() => {
                            return caches.match('/index.html');
                        });
                })
        );
    });
}