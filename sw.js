// Natan: tiene l'app sul telefono così si apre anche senza rete. Le risposte invece arrivano sempre dal Natan di Kevin.
const CACHE = "natan-1.5.0-1791922441";
const FILES = ["./", "./index.html", "./app/", "./app/index.html", "./manifest.webmanifest", "./icone/icon-192.png", "./icone/icon-512.png", "./icone/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.endsWith("ponte.json")) return;   // ponte.json sempre fresco
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request)));
});
