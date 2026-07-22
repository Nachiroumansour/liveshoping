// Migration : table events (journal d'événements de boutique)
// Usage : node src/scripts/migrate-events.js (depuis apps/backend)
require('dotenv').config();
const { sequelize } = require('../config/database');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  const tables = await qi.showAllTables();
  const names = tables.map((t) => (typeof t === 'string' ? t : t.tableName));

  if (!names.includes('events')) {
    const Event = require('../models/Event');
    await Event.sync();
    console.log('✅ Table events créée (avec index)');
  } else {
    console.log('ℹ️ Table events déjà présente');
  }

  await sequelize.close();
  console.log('✅ Migration events terminée');
}

migrate().catch((err) => {
  console.error('❌ Migration échouée:', err);
  process.exit(1);
});
