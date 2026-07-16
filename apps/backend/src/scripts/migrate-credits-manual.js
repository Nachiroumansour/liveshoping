const { sequelize } = require('../config/database');
const { Seller, CreditTransaction } = require('../models');

async function migrateCreditsManual() {
  try {
    console.log('🚀 Début de la migration manuelle du système de crédits...');

    // 1. Vérifier si la colonne credit_balance existe
    console.log('🔍 Vérification de la structure de la table sellers...');
    const tableInfo = await sequelize.query("PRAGMA table_info(sellers)", {
      type: sequelize.QueryTypes.SELECT
    });

    const hasCreditBalance = tableInfo.some(col => col.name === 'credit_balance');
    
    if (!hasCreditBalance) {
      console.log('📝 Ajout de la colonne credit_balance...');
      await sequelize.query(`
        ALTER TABLE sellers 
        ADD COLUMN credit_balance INTEGER NOT NULL DEFAULT 100
      `);
      console.log('✅ Colonne credit_balance ajoutée');
    } else {
      console.log('✅ Colonne credit_balance déjà présente');
    }

    // 2. Créer la table credit_transactions si elle n'existe pas
    console.log('🔍 Vérification de la table credit_transactions...');
    const tables = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'", {
      type: sequelize.QueryTypes.SELECT
    });

    const hasCreditTransactions = tables.some(table => table.name === 'credit_transactions');
    
    if (!hasCreditTransactions) {
      console.log('📝 Création de la table credit_transactions...');
      await sequelize.query(`
        CREATE TABLE credit_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          seller_id INTEGER NOT NULL,
          type VARCHAR(20) NOT NULL,
          action_type VARCHAR(50),
          amount INTEGER NOT NULL,
          balance_before INTEGER NOT NULL,
          balance_after INTEGER NOT NULL,
          payment_method VARCHAR(50),
          payment_reference VARCHAR(100),
          description TEXT,
          metadata TEXT,
          status VARCHAR(20) DEFAULT 'completed',
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          FOREIGN KEY (seller_id) REFERENCES sellers (id) ON DELETE CASCADE
        )
      `);
      
      // Créer les index
      await sequelize.query('CREATE INDEX idx_credit_transactions_seller_id ON credit_transactions (seller_id)');
      await sequelize.query('CREATE INDEX idx_credit_transactions_type ON credit_transactions (type)');
      await sequelize.query('CREATE INDEX idx_credit_transactions_created_at ON credit_transactions (created_at)');
      
      console.log('✅ Table credit_transactions créée avec ses index');
    } else {
      console.log('✅ Table credit_transactions déjà présente');
    }

    // 3. Attribuer 100 crédits aux vendeurs qui n'en ont pas
    console.log('🎁 Attribution des crédits gratuits...');
    const sellersWithoutCredits = await sequelize.query(`
      SELECT id, name FROM sellers 
      WHERE credit_balance IS NULL OR credit_balance = 0
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    if (sellersWithoutCredits.length > 0) {
      console.log(`📝 Attribution de 100 crédits à ${sellersWithoutCredits.length} vendeurs...`);
      
      for (const seller of sellersWithoutCredits) {
        // Mettre à jour le solde
        await sequelize.query(`
          UPDATE sellers 
          SET credit_balance = 100 
          WHERE id = ?
        `, {
          replacements: [seller.id],
          type: sequelize.QueryTypes.UPDATE
        });
        
        // Créer une transaction de bonus
        await sequelize.query(`
          INSERT INTO credit_transactions (
            seller_id, type, action_type, amount, balance_before, balance_after,
            description, metadata, status, created_at, updated_at
          ) VALUES (?, 'bonus', NULL, 100, 0, 100, ?, ?, 'completed', datetime('now'), datetime('now'))
        `, {
          replacements: [
            seller.id,
            'Crédits gratuits d\'inscription',
            JSON.stringify({
              migration: true,
              reason: 'Attribution initiale lors de la migration'
            })
          ],
          type: sequelize.QueryTypes.INSERT
        });
        
        console.log(`✅ ${seller.name} (ID: ${seller.id}) - 100 crédits attribués`);
      }
    } else {
      console.log('✅ Tous les vendeurs ont déjà des crédits');
    }

    // 4. Afficher un résumé
    console.log('\n📊 Résumé de la migration:');
    const totalSellers = await sequelize.query('SELECT COUNT(*) as count FROM sellers', {
      type: sequelize.QueryTypes.SELECT
    });
    
    const sellersWithCredits = await sequelize.query(`
      SELECT COUNT(*) as count FROM sellers 
      WHERE credit_balance IS NOT NULL AND credit_balance >= 0
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`- Total vendeurs: ${totalSellers[0].count}`);
    console.log(`- Vendeurs avec crédits: ${sellersWithCredits[0].count}`);

    // Afficher quelques exemples
    const sampleSellers = await sequelize.query(`
      SELECT id, name, credit_balance 
      FROM sellers 
      LIMIT 5
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    console.log('\n👥 Exemples de vendeurs:');
    sampleSellers.forEach(seller => {
      console.log(`- ${seller.name} (ID: ${seller.id}): ${seller.credit_balance} crédits`);
    });

    console.log('\n✅ Migration manuelle du système de crédits terminée avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Tester les routes /api/credits');
    console.log('2. Vérifier le fonctionnement avec le script de test');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateCreditsManual()
    .then(() => {
      console.log('🎉 Migration terminée !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec de la migration:', error);
      process.exit(1);
    });
}

module.exports = migrateCreditsManual; 