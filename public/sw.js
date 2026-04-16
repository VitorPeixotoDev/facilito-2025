const CACHE_NAME = "facilito-v1";
// Apenas recursos estáticos. Não pré-cachear páginas para evitar HTML cacheado e sessão incorreta.
const urlsToCache = ["/lito_head_init.png", "/favicon.ico", "/site.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error("Service Worker Facilitô: erro na instalação:", error);
      })
  );
});

function isDocumentRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.url.includes("/_next/")) {
    return;
  }

  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("supabase.co") ||
    event.request.url.includes("supabase.in") ||
    event.request.url.includes("googleapis.com") ||
    event.request.url.includes("googleusercontent.com")
  ) {
    return;
  }

  if (isDocumentRequest(event.request)) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/") || new Response("Offline", { status: 503, statusText: "Offline" });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== "basic") {
            return res;
          }

          const responseToCache = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return res;
        })
        .catch(() => caches.match(event.request));
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
