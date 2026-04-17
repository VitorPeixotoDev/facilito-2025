const SW_VERSION = "v2";
const CACHE_NAME = `facilito-static-${SW_VERSION}`;
// Apenas recursos estáticos públicos.
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

function isNextDataRequest(url) {
  // Requests do App Router/Flight são dinâmicos e não devem ser cacheados no SW.
  return (
    url.searchParams.has("_rsc") ||
    url.searchParams.has("__nextDataReq") ||
    url.searchParams.has("__flight__")
  );
}

function isProtectedAppRoute(url) {
  const pathname = url.pathname;
  return (
    pathname.startsWith("/applicant") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth")
  );
}

function isStaticAssetRequest(request, url) {
  if (request.destination === "style" || request.destination === "script" || request.destination === "font") {
    return true;
  }

  if (request.destination === "image") {
    return true;
  }

  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|mjs|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (
    requestUrl.pathname.includes("/api/") ||
    requestUrl.hostname.includes("supabase.co") ||
    requestUrl.hostname.includes("supabase.in") ||
    requestUrl.hostname.includes("googleapis.com") ||
    requestUrl.hostname.includes("googleusercontent.com")
  ) {
    return;
  }

  // Navegação/HTML e payloads dinâmicos: sempre rede (evita stale data e inconsistência de sessão).
  if (
    isDocumentRequest(event.request) ||
    isProtectedAppRoute(requestUrl) ||
    isNextDataRequest(requestUrl)
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response("Offline", { status: 503, statusText: "Offline" });
      })
    );
    return;
  }

  if (!isStaticAssetRequest(event.request, requestUrl)) {
    // Qualquer GET não-estático fora das regras acima vai para rede.
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets estáticos: cache-first.
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((res) => {
          if (!res || res.status !== 200 || (res.type !== "basic" && res.type !== "cors")) {
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
