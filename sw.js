'use strict';
const CACHE = 'melaka-rts-v9';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
// fetch the core files fresh from the server, never from the browser's HTTP cache
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const keep = (r, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)); } return res; };
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET' || !/^https?:/.test(r.url)) return;
  const page = r.mode === 'navigate' || /\/$|\.html(\?|$)/.test(r.url);
  if (page) {
    // pages: always try the network first so a new version shows on the next open; the cache is for offline
    e.respondWith(fetch(r, { cache: 'no-store' }).then((res) => keep(r, res)).catch(() => caches.match(r, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))));
    return;
  }
  // icons and other files: cache first, refreshed in the background
  e.respondWith(caches.match(r, { ignoreSearch: true }).then((hit) => {
    const net = fetch(r).then((res) => keep(r, res)).catch(() => hit);
    return hit || net;
  }));
});
