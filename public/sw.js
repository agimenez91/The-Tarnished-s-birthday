// Service worker — offline support for The Tarnished's Birthday.
// Bump CACHE_VERSION whenever you deploy a new build to force a refresh.
const CACHE_VERSION = 'tarnished-v1'

// Pre-cache the app shell so the start screen loads with no connection.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.webp',
  '/icons/app-icon-192.png',
  '/icons/app-icon-512.png',
  '/icons/app-icon-180.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Navigations: network-first, fall back to cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html')),
    )
    return
  }

  // Everything else (hashed assets, images, fonts): cache-first, then network.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        // Cache same-origin and successful cross-origin (e.g. Google Fonts) responses.
        if (
          response &&
          (response.ok || response.type === 'opaque') &&
          (request.url.startsWith(self.location.origin) ||
            request.url.includes('fonts.g'))
        ) {
          const copy = response.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
