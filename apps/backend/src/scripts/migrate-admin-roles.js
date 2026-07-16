const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

async function migrateAdminRoles() {
  try {
    console.log('🔧 Migration des rôles admin...\n');

    // 1. Vérifier si les colonnes existent déjà
    const tableInfo = await sequelize.query("PRAGMA table_info(sellers)");
    const columns = tableInfo[0].map(col => col.name);
    
    console.log('📋 Colonnes existantes:', columns);

    // 2. Ajouter la colonne role si elle n'existe pas
    if (!columns.includes('role')) {
      console.log('➕ Ajout de la colonne role...');
      await sequelize.query(`
        ALTER TABLE sellers 
        ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'seller' 
        CHECK (role IN ('seller', 'admin', 'superadmin'))
      `);
      console.log('✅ Colonne role ajoutée');
    } else {
      console.log('✅ Colonne role existe déjà');
    }

    // 3. Ajouter la colonne is_active si elle n'existe pas
    if (!columns.includes('is_active')) {
      console.log('➕ Ajout de la colonne is_active...');
      await sequelize.query(`
        ALTER TABLE sellers 
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1
      `);
      console.log('✅ Colonne is_active ajoutée');
    } else {
      console.log('✅ Colonne is_active existe déjà');
    }

    // 4. Créer le superadmin s'il n'existe pas
    console.log('\n👑 Création du superadmin...');
    const superAdminPhone = '+221771842787';
    
    const existingSuperAdmin = await sequelize.query(
      'SELECT * FROM sellers WHERE phone_number = ?',
      {
        replacements: [superAdminPhone],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingSuperAdmin.length === 0) {
      // Créer le superadmin
      const pinHash = await bcrypt.hash('2468', 10);
      const publicLinkId = 'superadmin';
      
      await sequelize.query(`
        INSERT INTO sellers (phone_number, name, pin_hash, public_link_id, credit_balance, role, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, {
        replacements: [
          superAdminPhone,
          'Super Admin',
          pinHash,
          publicLinkId,
          999999, // Crédits illimités pour le superadmin
          'superadmin',
          1
        ]
      });

      console.log('✅ Superadmin créé avec succès !');
      console.log('📱 Téléphone:', superAdminPhone);
      console.log('🔐 PIN:', '2468');
      console.log('👤 Nom:', 'Super Admin');
      console.log('💰 Crédits:', '999999 (illimités)');
    } else {
      console.log('✅ Superadmin existe déjà');
      
      // Mettre à jour le rôle si nécessaire
      await sequelize.query(`
        UPDATE sellers 
        SET role = 'superadmin', is_active = 1, credit_balance = 999999
        WHERE phone_number = ?
      `, {
        replacements: [superAdminPhone]
      });
      
      console.log('✅ Rôle superadmin mis à jour');
    }

    // 5. Afficher les statistiques
    console.log('\n📊 Statistiques des rôles:');
    const roleStats = await sequelize.query(`
      SELECT role, COUNT(*) as count, SUM(credit_balance) as total_credits
      FROM sellers 
      GROUP BY role
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    roleStats.forEach(stat => {
      console.log(`- ${stat.role}: ${stat.count} utilisateurs, ${stat.total_credits} crédits totaux`);
    });

    console.log('\n🎉 Migration terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await sequelize.close();
  }
}

migrateAdminRoles(); 