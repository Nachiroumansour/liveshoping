import { precacheAndRoute, matchPrecache } from 'workbox-precaching'
import { registerRoute, setCatchHandler } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST)

// ═══════════════════════════════════════════
// CACHING STRATEGIES
// ═══════════════════════════════════════════

// JS, CSS, Fonts — StaleWhileRevalidate (fast + always up to date)
registerRoute(
  ({ request }) => ['script', 'style', 'font'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'assets',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 })]
  })
)

// Images — CacheFirst (download once, serve from cache 30 days)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 })]
  })
)

// API GET requests — StaleWhileRevalidate
// Shows cached data IMMEDIATELY, then updates in background when online
// Offline: vendor sees their products, orders, dashboard from cache
registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'GET',
  new StaleWhileRevalidate({
    cacheName: 'api-data',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 })]
  })
)

// HTML pages — NetworkFirst avec timeout généreux pour données mobiles lentes (3G/4G)
registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 8,
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 })]
  })
)

// Fallback : si réseau échoue ET cache vide → servir index.html depuis le précache
// Évite la page blanche sur première ouverture avec données mobiles lentes
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return matchPrecache('/index.html')
  }
  return Response.error()
})

// ═══════════════════════════════════════════
// PUSH NOTIFICATIONS
// ═══════════════════════════════════════════

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'LiveShop Link', body: event.data.text() }
  }

  const { title, body, icon, badge, tag, data, actions, requireInteraction } = payload

  event.waitUntil(
    self.registration.showNotification(title || 'LiveShop Link', {
      body: body || '',
      icon: icon || '/pwa-192x192.png',
      badge: badge || '/pwa-192x192.png',
      tag: tag || 'liveshop-notification',
      data: data || {},
      actions: actions || [],
      requireInteraction: requireInteraction || false,
      vibrate: [200, 100, 200]
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'
  const action = event.action

  if (action === 'close') return

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})

// Handle SW messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
