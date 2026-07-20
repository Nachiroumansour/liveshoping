// Migration : push_subscriptions multi-canal (webpush | expo)
// Usage : node src/scripts/migrate-push-type.js (depuis apps/backend)
require('dotenv').config();
const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  const table = await qi.describeTable('push_subscriptions');

  if (!table.type) {
    await qi.addColumn('push_subscriptions', 'type', {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'webpush'
    });
    console.log('✅ Colonne type ajoutée (défaut webpush)');
  } else {
    console.log('ℹ️ Colonne type déjà présente');
  }

  // SQLite ne supporte pas changeColumn proprement ; les nouvelles lignes Expo
  // passent par le modèle (allowNull: true). En PostgreSQL on relâche la contrainte.
  if (sequelize.getDialect() === 'postgres') {
    await sequelize.query(
      'ALTER TABLE push_subscriptions ALTER COLUMN keys_p256dh DROP NOT NULL'
    );
    await sequelize.query(
      'ALTER TABLE push_subscriptions ALTER COLUMN keys_auth DROP NOT NULL'
    );
    console.log('✅ keys_p256dh / keys_auth rendues nullable');
  }

  await sequelize.close();
  console.log('✅ Migration push_subscriptions terminée');
}

migrate().catch((err) => {
  console.error('❌ Migration échouée:', err);
  process.exit(1);
});
