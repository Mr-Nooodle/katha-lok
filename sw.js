// Katha Lok service worker: network first (always fresh when online), cached copy when offline.
const CACHE = 'kl-v4';
const SHELL = ['./', 'index.html', 'config.js', 'assets/style.css', 'assets/app.js', 'assets/yt-api.js', 'assets/logo.svg', 'data/videos.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('.mp4')) return;
  // 'no-cache' revalidates with the server (cheap 304 when unchanged), so a new deploy shows up at once
  // instead of after GitHub Pages' 10-minute browser cache. Navigations can't take options.
  const fresh = e.request.mode === 'navigate' ? fetch(e.request) : fetch(e.request, { cache: 'no-cache' });
  e.respondWith(
    fresh
      .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
