/**
 * Migration: Ensure public_link_id column supports slugs
 * SQLite doesn't support ALTER COLUMN, so we use Sequelize sync
 *
 * Usage: node src/scripts/migrate-slug-column.js
 */

const { sequelize } = require('../config/database');
const Seller = require('../models/Seller');

async function migrateColumn() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB établie');

    // Sequelize sync will adjust the model to match the updated definition
    await Seller.sync({ alter: true });
    console.log('✅ Table sellers synchronisée (public_link_id VARCHAR(100))');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur migration:', error.message);
    process.exit(1);
  }
}

migrateColumn();
