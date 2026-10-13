const CACHE_NAME = "servicesaathi-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/globals.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Cache-first for static assets, network-first for pages and NEVER cache sensitive APIs indiscriminately
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip mutating requests and private API endpoints
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/dashboard/")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // If offline and request is an HTML page
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }
        })
      );
    })
  );
});
