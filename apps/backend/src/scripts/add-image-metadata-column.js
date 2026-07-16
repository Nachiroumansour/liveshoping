const { sequelize } = require('../config/database');

async function addImageMetadataColumn() {
  console.log('🔧 Ajout de la colonne image_metadata à la table products...');

  try {
    // Vérifier si la colonne existe déjà
    const [results] = await sequelize.query(`
      PRAGMA table_info(products);
    `);
    
    const columnExists = results.some(col => col.name === 'image_metadata');
    
    if (columnExists) {
      console.log('✅ La colonne image_metadata existe déjà');
      return;
    }

    // Ajouter la colonne image_metadata
    await sequelize.query(`
      ALTER TABLE products ADD COLUMN image_metadata TEXT;
    `);

    console.log('✅ Colonne image_metadata ajoutée avec succès');

    // Vérifier la structure de la table
    const [newResults] = await sequelize.query(`
      PRAGMA table_info(products);
    `);
    
    console.log('📋 Structure de la table products :');
    newResults.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
    throw error;
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  addImageMetadataColumn()
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { addImageMetadataColumn }; 