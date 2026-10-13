// Natan: tiene l'app sul dispositivo così si apre anche senza rete (anche il motore che fa girare Natan sul dispositivo).
// La biblioteca non passa di qui: l'app la salva da sola nel dispositivo. I modelli li salva il motore stesso.
const CACHE = "natan-1.7.0-1791929838";
const FILES = ["./", "./index.html", "./app/", "./app/index.html", "./manifest.webmanifest", "./icone/icon-192.png", "./icone/icon-512.png", "./icone/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("natan-") && k !== CACHE && k !== "natan-motore").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.hostname === "cdn.jsdelivr.net" || u.hostname === "esm.run") {                 // il motore: prima dalla copia salvata
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open("natan-motore").then(c => c.put(e.request, copy)); } return r; })));
    return;
  }
  if (u.origin !== location.origin || u.pathname.endsWith("ponte.json") || u.pathname.includes("/biblioteca/")) return;   // ponte.json sempre fresco
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request)));
});
