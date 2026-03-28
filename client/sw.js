const CACHE = 'el-rio-v1';
const ASSETS = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.json'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(r => r || caches.match('/index.html'))));
});
