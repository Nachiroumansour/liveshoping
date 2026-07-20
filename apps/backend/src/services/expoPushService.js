const { Expo } = require('expo-server-sdk');

/**
 * Canal push natif (app Expo vendeur). Symétrique de webPushService :
 * même signature sendPushNotification(sellerId, notification).
 * Le token Expo (ExponentPushToken[...]) est stocké dans push_subscriptions.endpoint
 * avec type='expo' (keys_* null).
 */
class ExpoPushService {
  constructor() {
    this.expo = new Expo();
  }

  getModel() {
    return require('../models/PushSubscription');
  }

  isExpoToken(token) {
    return Expo.isExpoPushToken(token);
  }

  async saveToken(sellerId, token) {
    if (!this.isExpoToken(token)) {
      throw new Error('Token Expo invalide');
    }

    const PushSubscription = this.getModel();
    const [sub] = await PushSubscription.findOrCreate({
      where: { endpoint: token },
      defaults: {
        seller_id: sellerId,
        endpoint: token,
        type: 'expo',
        keys_p256dh: null,
        keys_auth: null
      }
    });

    // L'appareil a changé de compte
    if (sub.seller_id !== sellerId) {
      await sub.update({ seller_id: sellerId });
    }

    console.log(`Expo push token enregistré pour seller ${sellerId}`);
    return true;
  }

  async removeToken(sellerId, token = null) {
    const PushSubscription = this.getModel();
    const where = token
      ? { seller_id: sellerId, type: 'expo', endpoint: token }
      : { seller_id: sellerId, type: 'expo' };
    await PushSubscription.destroy({ where });
    return true;
  }

  async sendPushNotification(sellerId, notification) {
    const PushSubscription = this.getModel();
    const subscriptions = await PushSubscription.findAll({
      where: { seller_id: sellerId, type: 'expo' }
    });

    if (subscriptions.length === 0) return false;

    const messages = subscriptions
      .filter((sub) => this.isExpoToken(sub.endpoint))
      .map((sub) => ({
        to: sub.endpoint,
        sound: 'default',
        title: notification.title || 'LiveShop Link',
        body: notification.message || '',
        priority: notification.type === 'new_order' ? 'high' : 'default',
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...(notification.data || {})
        }
      }));

    if (messages.length === 0) return false;

    let sent = false;
    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync(chunk);
        for (let i = 0; i < tickets.length; i++) {
          const ticket = tickets[i];
          if (ticket.status === 'ok') {
            sent = true;
          } else if (ticket.details?.error === 'DeviceNotRegistered') {
            // Token expiré : purger la ligne correspondante
            const badToken = chunk[i].to;
            await PushSubscription.destroy({
              where: { endpoint: badToken, type: 'expo' }
            });
            console.log(`Token Expo expiré supprimé (${String(badToken).slice(-12)})`);
          } else {
            console.error(`Expo push erreur seller ${sellerId}:`, ticket.details?.error || ticket.message);
          }
        }
      } catch (error) {
        console.error(`Expo push envoi échoué seller ${sellerId}:`, error.message);
      }
    }

    return sent;
  }
}

const expoPushService = new ExpoPushService();
module.exports = expoPushService;
