// Test du canal push Expo : modèle, service, cohabitation webpush.
// Usage : node src/scripts/test-expo-push.js (depuis apps/backend)
require('dotenv').config();
const assert = require('assert');
const { sequelize } = require('../config/database');
const PushSubscription = require('../models/PushSubscription');
const { Seller } = require('../models');
const expoPushService = require('../services/expoPushService');

const FAKE_TOKEN = 'ExponentPushToken[test-migration-0001]';

async function run() {
  await sequelize.sync();

  // Réutiliser un vrai seller (base dev seedée) pour respecter la FK
  const seller = await Seller.findOne();
  const SELLER_ID = seller ? seller.id : 999901;

  // 0. Nettoyage
  await PushSubscription.destroy({ where: { endpoint: FAKE_TOKEN } });

  // 1. Validation de format
  assert.strictEqual(expoPushService.isExpoToken(FAKE_TOKEN), true, 'token Expo valide refusé');
  assert.strictEqual(expoPushService.isExpoToken('pas-un-token'), false, 'token invalide accepté');

  // 2. saveToken crée une ligne type=expo sans clés
  await expoPushService.saveToken(SELLER_ID, FAKE_TOKEN);
  const row = await PushSubscription.findOne({ where: { endpoint: FAKE_TOKEN } });
  assert.ok(row, 'ligne non créée');
  assert.strictEqual(row.type, 'expo');
  assert.strictEqual(row.seller_id, SELLER_ID);
  assert.strictEqual(row.keys_p256dh, null);

  // 3. saveToken est idempotent (même endpoint → pas de doublon)
  await expoPushService.saveToken(SELLER_ID, FAKE_TOKEN);
  const count = await PushSubscription.count({ where: { endpoint: FAKE_TOKEN } });
  assert.strictEqual(count, 1, 'doublon créé');

  // 4. saveToken refuse un token invalide
  await assert.rejects(
    () => expoPushService.saveToken(SELLER_ID, 'nimporte-quoi'),
    /Token Expo invalide/
  );

  // 5. sendPushNotification n'explose pas et renvoie un booléen
  //    (le token factice sera rejeté par l'API Expo : sent=false attendu,
  //    ou ticket ok si Expo accepte le format — les deux sont tolérés)
  const sent = await expoPushService.sendPushNotification(SELLER_ID, {
    id: 1,
    type: 'new_order',
    title: 'Test',
    message: 'Test expo push',
    data: {}
  });
  assert.strictEqual(typeof sent, 'boolean');

  // 6. removeToken purge
  await expoPushService.removeToken(SELLER_ID);
  const after = await PushSubscription.count({ where: { seller_id: SELLER_ID, type: 'expo' } });
  assert.strictEqual(after, 0, 'token non purgé');

  // 7. Le fan-out notificationService charge sans erreur avec le nouveau service
  require('../services/notificationService');

  await sequelize.close();
  console.log('✅ test-expo-push : 7/7 assertions OK');
}

run().catch((err) => {
  console.error('❌ test-expo-push échoué:', err);
  process.exit(1);
});
