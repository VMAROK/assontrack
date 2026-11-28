// Offline support: the app opens without a connection; data syncs when back online.
const VERSION = "aot-v1010";
const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4";
const SHELL = ["./", "./index.html", "./config.js", "./ramsau.jpg", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", LIB];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== "aot-img").map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.endsWith("supabase.co")) return;            // account data: always live
  if (req.url.startsWith(LIB)) {                                // pinned library: cache first
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
    return;
  }
  // restaurant icons: keep a copy so the tiles still show them offline
  if (url.hostname === "www.google.com" && url.pathname.startsWith("/s2/favicons") || url.hostname === "icons.duckduckgo.com") {
    e.respondWith(caches.open("aot-img").then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // wallpapers never change under the same name: keep them on the device so switching is instant
  if (/\/wp\/|\/lib\/|ramsau\.jpg$/.test(url.pathname)) {
    e.respondWith(caches.open("aot-img").then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  // app files: newest from the network, cached copy when offline
  // always ask the server for the newest copy (skip the browser's 10-minute cache)
  // GitHub Pages' CDN can hold an old copy for 10 minutes: ask for a unique URL so it always goes to the newest one
  const fresh = url.origin + url.pathname + (url.search ? url.search + "&" : "?") + "_=" + Date.now();
  e.respondWith(fetch(fresh, { cache: "no-store", credentials: "same-origin" }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined))));
});
