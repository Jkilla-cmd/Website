/* Reseller Dashboard Service Worker
   Cache-first for app shell assets; network-first for anything else.
*/
const CACHE_VERSION = "v3-2026-01-01";
const APP_CACHE = `reseller-dashboard-${CACHE_VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./index_updated.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png"
];

// Install: pre-cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("reseller-dashboard-") && k !== APP_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Cache-first for app shell
  if (APP_SHELL.includes(url.pathname) || APP_SHELL.includes(url.pathname.replace(/^\//, "./"))) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // Network-first for everything else (so updates are picked up)
  event.respondWith(
    fetch(req)
      .then((resp) => {
        // Optionally cache GET responses
        if (req.method === "GET" && resp.ok) {
          const copy = resp.clone();
          caches.open(APP_CACHE).then((cache) => cache.put(req, copy));
        }
        return resp;
      })
      .catch(() => caches.match(req))
  );
});
