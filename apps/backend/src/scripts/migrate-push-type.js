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

  const table2 = await qi.describeTable('push_subscriptions');
  const isSqlite = sequelize.getDialect() === 'sqlite';
  if (table2.keys_p256dh.allowNull && table2.keys_auth.allowNull) {
    console.log('ℹ️ keys_p256dh / keys_auth déjà nullable');
  } else if (sequelize.getDialect() === 'postgres') {
    await sequelize.query(
      'ALTER TABLE push_subscriptions ALTER COLUMN keys_p256dh DROP NOT NULL'
    );
    await sequelize.query(
      'ALTER TABLE push_subscriptions ALTER COLUMN keys_auth DROP NOT NULL'
    );
    console.log('✅ keys_p256dh / keys_auth rendues nullable (postgres)');
  } else {
    // SQLite : pas d'ALTER COLUMN ; changeColumn recrée la table sous le capot,
    // ce qui supprime les index non-uniques (seul l'UNIQUE inline sur endpoint
    // survit) — on les recrée juste après, indépendamment de ce bloc (idempotence).
    await qi.changeColumn('push_subscriptions', 'keys_p256dh', {
      type: DataTypes.TEXT,
      allowNull: true
    });
    await qi.changeColumn('push_subscriptions', 'keys_auth', {
      type: DataTypes.TEXT,
      allowNull: true
    });
    console.log('✅ keys_p256dh / keys_auth rendues nullable (sqlite)');
  }

  if (isSqlite) {
    const indexes = await qi.showIndex('push_subscriptions');
    const hasSellerIdIndex = indexes.some(
      (i) => i.fields.length === 1 && i.fields[0].attribute === 'seller_id'
    );
    const hasSellerIdTypeIndex = indexes.some(
      (i) =>
        i.fields.length === 2 &&
        i.fields[0].attribute === 'seller_id' &&
        i.fields[1].attribute === 'type'
    );
    if (!hasSellerIdIndex) {
      await qi.addIndex('push_subscriptions', ['seller_id']);
      console.log('✅ Index seller_id restauré');
    }
    if (!hasSellerIdTypeIndex) {
      await qi.addIndex('push_subscriptions', ['seller_id', 'type']);
      console.log('✅ Index seller_id+type restauré');
    }
  }

  await sequelize.close();
  console.log('✅ Migration push_subscriptions terminée');
}

migrate().catch((err) => {
  console.error('❌ Migration échouée:', err);
  process.exit(1);
});
