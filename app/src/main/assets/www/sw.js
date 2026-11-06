const V = 'girounivers-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'css/app.css', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/astro.js', 'js/data.js', 'js/util.js', 'js/store.js', 'js/photoui.js', 'js/sky.js', 'js/solar.js', 'js/catalog.js', 'js/challenges.js', 'js/agenda.js', 'js/main.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method === 'GET') e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });
