const webpush = require('web-push');

class WebPushService {
  constructor() {
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    try {
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@livelink.store';

      if (vapidPublicKey && vapidPrivateKey) {
        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        this.isConfigured = true;
        console.log('Web Push configured with VAPID keys');
      } else {
        console.warn('Web Push not configured - VAPID keys missing');
      }
    } catch (error) {
      console.error('Web Push init error:', error);
      this.isConfigured = false;
    }
  }

  // Get PushSubscription model (lazy require to avoid circular deps)
  getModel() {
    return require('../models/PushSubscription');
  }

  async saveSubscription(sellerId, subscription) {
    if (!this.isConfigured) throw new Error('Web Push not configured');

    const PushSubscription = this.getModel();
    const { endpoint, keys } = subscription;

    // Upsert: update if same endpoint exists, create otherwise
    const [sub] = await PushSubscription.findOrCreate({
      where: { endpoint },
      defaults: {
        seller_id: sellerId,
        endpoint,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth
      }
    });

    // Update seller_id and keys if endpoint already existed (device switched account)
    if (sub.seller_id !== sellerId || sub.keys_p256dh !== keys.p256dh) {
      await sub.update({
        seller_id: sellerId,
        keys_p256dh: keys.p256dh,
        keys_auth: keys.auth
      });
    }

    console.log(`Push subscription saved for seller ${sellerId}`);
    return true;
  }

  async removeSubscription(sellerId) {
    const PushSubscription = this.getModel();
    await PushSubscription.destroy({ where: { seller_id: sellerId } });
    console.log(`Push subscriptions removed for seller ${sellerId}`);
    return true;
  }

  async sendPushNotification(sellerId, notification) {
    if (!this.isConfigured) return false;

    const PushSubscription = this.getModel();
    const subscriptions = await PushSubscription.findAll({
      where: { seller_id: sellerId }
    });

    if (subscriptions.length === 0) return false;

    const payload = JSON.stringify({
      title: notification.title || 'LiveShop Link',
      body: notification.message || '',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: `notification-${notification.id}`,
      data: {
        notificationId: notification.id,
        type: notification.type,
        url: this.getNotificationUrl(notification),
        ...(notification.data || {})
      },
      actions: this.getNotificationActions(notification.type),
      requireInteraction: notification.type === 'new_order'
    });

    let sent = false;
    for (const sub of subscriptions) {
      try {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
        };
        await webpush.sendNotification(pushSub, payload);
        sent = true;
      } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription expired, remove it
          await sub.destroy();
          console.log(`Expired push subscription removed (${sub.endpoint.slice(-20)})`);
        } else {
          console.error(`Push send error for seller ${sellerId}:`, error.message);
        }
      }
    }

    return sent;
  }

  getNotificationUrl(notification) {
    const baseUrl = process.env.VENDOR_URL || 'https://space.livelink.store';
    switch (notification.type) {
      case 'new_order':
        return `${baseUrl}/orders?status=pending`;
      case 'order_status_update':
        return `${baseUrl}/orders/${notification.data?.order?.id || ''}`;
      case 'new_comment':
        return `${baseUrl}/products`;
      case 'credits_updated':
        return `${baseUrl}/credits`;
      default:
        return baseUrl;
    }
  }

  getNotificationActions(type) {
    switch (type) {
      case 'new_order':
        return [
          { action: 'view', title: 'Voir la commande' },
          { action: 'close', title: 'Fermer' }
        ];
      case 'order_status_update':
        return [{ action: 'view', title: 'Voir' }];
      default:
        return [];
    }
  }

  async sendBulkPushNotifications(sellerIds, notification) {
    const results = await Promise.allSettled(
      sellerIds.map(id => this.sendPushNotification(id, notification))
    );
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    return { successful, failed: results.length - successful, total: results.length };
  }

  async sendTestPush(sellerId) {
    return await this.sendPushNotification(sellerId, {
      id: Date.now(),
      type: 'test',
      title: 'Test notification',
      message: 'Les notifications push fonctionnent correctement.',
      data: {}
    });
  }

  async getStats() {
    const PushSubscription = this.getModel();
    const totalSubscriptions = await PushSubscription.count();
    return {
      isConfigured: this.isConfigured,
      totalSubscriptions,
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY ? 'configured' : 'missing'
    };
  }

  getPublicKey() {
    return process.env.VAPID_PUBLIC_KEY || null;
  }
}

const webPushService = new WebPushService();
module.exports = webPushService;
