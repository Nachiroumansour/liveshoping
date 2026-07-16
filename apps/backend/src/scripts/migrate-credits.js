const { sequelize } = require('../config/database');
const { Seller, CreditTransaction } = require('../models');

async function migrateCredits() {
  try {
    console.log('🚀 Début de la migration du système de crédits...');

    // Synchroniser les modèles avec la base de données
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');

    // Vérifier si la colonne credit_balance existe
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

    // Vérifier si la table credit_transactions existe
    const tables = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='credit_transactions'", {
      type: sequelize.QueryTypes.SELECT
    });

    if (tables.length === 0) {
      console.log('📝 Création de la table credit_transactions...');
      await sequelize.sync({ alter: true });
      console.log('✅ Table credit_transactions créée');
    } else {
      console.log('✅ Table credit_transactions déjà présente');
    }

    // Attribuer 100 crédits gratuits aux vendeurs existants qui n'en ont pas
    const sellersWithoutCredits = await Seller.findAll({
      where: {
        credit_balance: null
      }
    });

    if (sellersWithoutCredits.length > 0) {
      console.log(`🎁 Attribution de 100 crédits gratuits à ${sellersWithoutCredits.length} vendeurs...`);
      
      for (const seller of sellersWithoutCredits) {
        await seller.update({ credit_balance: 100 });
        
        // Créer une transaction de bonus pour tracer l'attribution
        await CreditTransaction.create({
          seller_id: seller.id,
          type: 'bonus',
          action_type: null,
          amount: 100,
          balance_before: 0,
          balance_after: 100,
          description: 'Crédits gratuits d\'inscription',
          metadata: {
            migration: true,
            reason: 'Attribution initiale lors de la migration'
          },
          status: 'completed'
        });
        
        console.log(`✅ ${seller.name} (ID: ${seller.id}) - 100 crédits attribués`);
      }
    } else {
      console.log('✅ Tous les vendeurs ont déjà des crédits');
    }

    // Afficher un résumé
    const totalSellers = await Seller.count();
    const sellersWithCredits = await Seller.count({
      where: {
        credit_balance: {
          [sequelize.Op.gte]: 0
        }
      }
    });

    console.log('\n📊 Résumé de la migration:');
    console.log(`- Total vendeurs: ${totalSellers}`);
    console.log(`- Vendeurs avec crédits: ${sellersWithCredits}`);
    console.log(`- Vendeurs sans crédits: ${totalSellers - sellersWithCredits}`);

    // Afficher quelques exemples
    const sampleSellers = await Seller.findAll({
      attributes: ['id', 'name', 'credit_balance'],
      limit: 5
    });

    console.log('\n👥 Exemples de vendeurs:');
    sampleSellers.forEach(seller => {
      console.log(`- ${seller.name} (ID: ${seller.id}): ${seller.credit_balance} crédits`);
    });

    console.log('\n✅ Migration du système de crédits terminée avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Tester les routes /api/credits');
    console.log('2. Intégrer les middlewares dans les routes existantes');
    console.log('3. Configurer un vrai prestataire de paiement');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateCredits()
    .then(() => {
      console.log('🎉 Migration terminée !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec de la migration:', error);
      process.exit(1);
    });
}

module.exports = migrateCredits; 