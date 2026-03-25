/**
 * Migration: Ajouter logo_url et description à la table sellers
 *
 * Usage: node src/scripts/migrate-shop-profile.js
 */

const { sequelize } = require('../config/database');

async function migrate() {
  try {
    console.log('🔄 Migration: Ajout logo_url + description à sellers...');

    const queryInterface = sequelize.getQueryInterface();

    // Vérifier si les colonnes existent déjà
    const tableDescription = await queryInterface.describeTable('sellers');

    if (!tableDescription.logo_url) {
      await queryInterface.addColumn('sellers', 'logo_url', {
        type: require('sequelize').DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null
      });
      console.log('✅ Colonne logo_url ajoutée');
    } else {
      console.log('⏭️  Colonne logo_url existe déjà');
    }

    if (!tableDescription.description) {
      await queryInterface.addColumn('sellers', 'description', {
        type: require('sequelize').DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null
      });
      console.log('✅ Colonne description ajoutée');
    } else {
      console.log('⏭️  Colonne description existe déjà');
    }

    console.log('✅ Migration terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

migrate();
