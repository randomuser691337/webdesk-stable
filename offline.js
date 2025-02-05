const cacheName = "WebBoot 0.0.3";
const cacheUrls = ["index.html", "fs.js", "wfs.js", "jszip.js", "target.json"];
const ver = "0.0.3";

self.addEventListener("install", async (event) => {
    try {
        const cache = await caches.open(cacheName);
        await cache.addAll(cacheUrls);
        console.log(`<i> Cache installed (version: ${ver})`);
    } catch (error) {
        console.error("Service Worker installation failed:", error);
    }
});

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
        update();
    }
});

async function update() {
    try {
        console.log("<i> Clearing old cache...");
        const cache = await caches.open(cacheName);
        await caches.delete(cacheName);
        const newCache = await caches.open(cacheName);
        await newCache.addAll(cacheUrls);
        console.log("<i> Updated offline mode");
    } catch (error) {
        console.error("Error clearing or recaching the cache:", error);
    }
}

if (navigator.onLine === false) {
    console.log(`<i> Worker ${ver} is initializing... (active)`);
    self.addEventListener("fetch", (event) => {
        event.respondWith(
            (async () => {
                const cache = await caches.open(cacheName);

                try {
                    const cachedResponse = await cache.match(event.request);
                    if (cachedResponse) {
                        console.log("<i> cachedResponse: ", event.request.url);
                        return cachedResponse;
                    }

                    const fetchResponse = await fetch(event.request);
                    if (fetchResponse) {
                        console.log("<i> fetchResponse: ", event.request.url);
                        await cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    }
                } catch (error) {
                    console.log("<!> Fetch failed: ", error);
                    const cachedResponse = await cache.match("index.html");
                    return cachedResponse;
                }
            })()
        );
    });
} else {
    console.log(`<i> Worker ${ver} is initializing... (dormant)`);
}
