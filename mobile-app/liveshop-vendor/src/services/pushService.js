import { getBackendUrl } from '../config/domains'

class PushService {
  constructor() {
    this._subscribing = false
  }

  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  }

  getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission // 'granted', 'denied', 'default'
  }

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported'
    return await Notification.requestPermission()
  }

  /**
   * Subscribe to push notifications.
   * - Requests permission if not yet granted
   * - Creates push subscription with VAPID key
   * - Sends subscription to backend
   * - Always re-sends to backend (handles device switch, token change)
   */
  async subscribe() {
    if (!this.isSupported()) return false
    if (this._subscribing) return false // prevent parallel calls

    this._subscribing = true

    try {
      // 1. Check / request permission
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }
      if (permission !== 'granted') {
        console.log('Push permission not granted:', permission)
        return false
      }

      // 2. Wait for SW to be ready
      const registration = await navigator.serviceWorker.ready

      // 3. Get auth token
      const token = localStorage.getItem('liveshop_token')
      if (!token) {
        console.warn('No auth token for push subscription')
        return false
      }

      // 4. Get VAPID public key from backend
      const backendUrl = getBackendUrl()
      const vapidRes = await fetch(`${backendUrl}/api/push/vapid-public-key`)
      if (!vapidRes.ok) {
        console.warn('VAPID key endpoint error:', vapidRes.status)
        return false
      }
      const vapidData = await vapidRes.json()
      if (!vapidData.success || !vapidData.publicKey) {
        console.warn('VAPID key not available')
        return false
      }

      const vapidKey = this.urlBase64ToUint8Array(vapidData.publicKey)

      // 5. Get or create push subscription
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey
        })
        console.log('New push subscription created')
      }

      // 6. Always send subscription to backend (ensures it's registered even after reinstall/clear)
      const res = await fetch(`${backendUrl}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      })

      if (res.ok) {
        console.log('Push subscription synced with backend')
        return true
      }

      console.warn('Backend push subscribe failed:', res.status)
      return false
    } catch (error) {
      console.error('Push subscribe error:', error)
      return false
    } finally {
      this._subscribing = false
    }
  }

  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
      }

      const token = localStorage.getItem('liveshop_token')
      if (token) {
        const backendUrl = getBackendUrl()
        await fetch(`${backendUrl}/api/push/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Push unsubscribe error:', error)
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

const pushService = new PushService()
export default pushService
