import { getBackendUrl } from '../config/domains'

class PushService {
  constructor() {
    this.subscribed = false
  }

  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  }

  async getPermissionStatus() {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission // 'granted', 'denied', 'default'
  }

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported'
    const result = await Notification.requestPermission()
    return result
  }

  async subscribe() {
    if (!this.isSupported()) return false
    if (this.subscribed) return true

    try {
      const permission = await this.requestPermission()
      if (permission !== 'granted') {
        console.log('Push permission denied')
        return false
      }

      const registration = await navigator.serviceWorker.ready
      const token = localStorage.getItem('liveshop_token')
      if (!token) return false

      // Get VAPID public key from backend
      const backendUrl = getBackendUrl()
      const vapidRes = await fetch(`${backendUrl}/api/push/vapid-public-key`)
      const vapidData = await vapidRes.json()
      if (!vapidData.success || !vapidData.publicKey) {
        console.warn('VAPID key not available')
        return false
      }

      // Convert VAPID key to Uint8Array
      const vapidKey = this.urlBase64ToUint8Array(vapidData.publicKey)

      // Check existing subscription
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey
        })
      }

      // Send subscription to backend
      const res = await fetch(`${backendUrl}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription: subscription.toJSON() })
      })

      if (res.ok) {
        this.subscribed = true
        console.log('Push subscription registered')
        return true
      }

      return false
    } catch (error) {
      console.error('Push subscribe error:', error)
      return false
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

      this.subscribed = false
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
