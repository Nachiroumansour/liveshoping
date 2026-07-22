// Test du journal d'événements : modèle, émission best-effort, lecture.
// Usage : NODE_ENV=development node src/scripts/test-events.js (depuis apps/backend)
require('dotenv').config();
const assert = require('assert');
const { sequelize } = require('../config/database');
const { Seller } = require('../models');
const Event = require('../models/Event');
const eventService = require('../services/eventService');

async function run() {
  await sequelize.sync();
  const seller = await Seller.findOne();
  assert.ok(seller, 'base dev non seedée : aucun vendeur');
  const SELLER_ID = seller.id;

  // 0. Nettoyage des événements de test
  await Event.destroy({ where: { seller_id: SELLER_ID, type: 'order_created' } });

  // 1. emit crée une ligne et la retourne
  const ev = await eventService.emit(SELLER_ID, 'order_created', {
    order_id: 999901, customer_name: 'Test Awa', product_name: 'Sac test', total_price: 12500
  });
  assert.ok(ev, 'emit a retourné null');
  assert.strictEqual(ev.type, 'order_created');
  assert.strictEqual(ev.payload.customer_name, 'Test Awa');

  // 2. La ligne est en base, ordonnée par date
  const rows = await Event.findAll({
    where: { seller_id: SELLER_ID },
    order: [['created_at', 'DESC']],
    limit: 5
  });
  assert.ok(rows.length >= 1);
  assert.strictEqual(rows[0].payload.order_id, 999901);

  // 3. emit ne jette JAMAIS (type null → erreur DB avalée, retour null)
  const bad = await eventService.emit(SELLER_ID, null, {});
  assert.strictEqual(bad, null, 'emit aurait dû retourner null sans jeter');

  // 4. Nettoyage
  await Event.destroy({ where: { seller_id: SELLER_ID, payload: { order_id: 999901 } } });

  await sequelize.close();
  console.log('✅ test-events : 4/4 assertions OK');
}

run().catch((err) => {
  console.error('❌ test-events échoué:', err);
  process.exit(1);
});
