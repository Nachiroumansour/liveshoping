const { sequelize } = require('../config/database');

async function setSequence(table) {
  const seqName = `${table}_id_seq`;
  try {
    const [[{ max }]] = await sequelize.query(`SELECT COALESCE(MAX(id), 0) AS max FROM "${table}";`);
    const nextVal = Number(max) + 1;
    await sequelize.query(`DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_class WHERE relname = '${seqName}') THEN
        PERFORM setval('${seqName}', ${nextVal}, false);
      END IF;
    END$$;`);
    console.log(`✅ ${seqName} -> ${nextVal}`);
  } catch (e) {
    console.error(`❌ Erreur séquence pour ${table}:`, e.message);
  }
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected');

    const tables = [
      'sellers',
      'products',
      'product_variants',
      'orders',
      'lives',
      'notifications',
      'credit_transactions',
      'otps'
    ];

    for (const t of tables) {
      await setSequence(t);
    }

    await sequelize.close();
    console.log('Done');
    process.exit(0);
  } catch (e) {
    console.error('Fatal:', e);
    process.exit(1);
  }
})(); 