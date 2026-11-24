
const CACHE_NAME = 'ankand-premium-shell-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key =>
          key.startsWith('ankand-premium-shell-') &&
          key !== CACHE_NAME
        ).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (
    req.method !== 'GET' ||
    url.origin !== self.location.origin
  ) return;

  // Administrimi nuk përdor cache.
  if (
    url.pathname === '/admin' ||
    url.pathname.startsWith('/admin/')
  ) return;

  // Faqja publike e ankandit.
  if (req.mode === 'navigate') {
    if (
      url.pathname === '/' ||
      url.pathname === '/index.html'
    ) {
      event.respondWith(
        fetch(req).catch(() =>
          caches.match('/index.html')
        )
      );
    }
    return;
  }

  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then(cached =>
        cached || fetch(req)
      )
    );
  }
});
