import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST)

// Runtime caching strategies
registerRoute(
  ({ request }) => ['script', 'style', 'font'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'assets',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 })]
  })
)

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 })]
  })
)

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api',
    networkTimeoutSeconds: 3,
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 5 })]
  })
)

registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 5 })]
  })
)

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
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Open new window
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
