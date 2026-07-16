const { sequelize } = require('../config/database');
const { Product, ProductVariant } = require('../models');

async function safeMigration() {
  try {
    console.log('🚀 Début de la migration sécurisée...');

    const queryInterface = sequelize.getQueryInterface();

    // Vérifier les colonnes existantes dans la table products
    const productColumns = await queryInterface.describeTable('products');
    console.log('📊 Colonnes existantes dans products:', Object.keys(productColumns));

    // Ajouter les nouvelles colonnes une par une
    const newColumns = [
      { name: 'category', type: 'VARCHAR(100)', defaultValue: 'general' },
      { name: 'attributes', type: 'TEXT' },
      { name: 'images', type: 'TEXT' },
      { name: 'tags', type: 'TEXT' },
      { name: 'has_variants', type: 'BOOLEAN', defaultValue: false },
      { name: 'status', type: 'VARCHAR(20)', defaultValue: 'active' },
      { name: 'weight', type: 'FLOAT' },
      { name: 'dimensions', type: 'TEXT' }
    ];

    for (const column of newColumns) {
      if (!productColumns[column.name]) {
        console.log(`➕ Ajout de la colonne ${column.name}...`);
        try {
          await queryInterface.addColumn('products', column.name, {
            type: column.type,
            allowNull: true,
            defaultValue: column.defaultValue
          });
          console.log(`✅ Colonne ${column.name} ajoutée`);
        } catch (error) {
          console.log(`⚠️ Colonne ${column.name} déjà existante ou erreur:`, error.message);
        }
      } else {
        console.log(`ℹ️ Colonne ${column.name} déjà existante`);
      }
    }

    // Créer la table product_variants si elle n'existe pas
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes('product_variants')) {
      console.log('📋 Création de la table product_variants...');
      await ProductVariant.sync();
      console.log('✅ Table product_variants créée');
    } else {
      console.log('ℹ️ Table product_variants déjà existante');
    }

    // Mettre à jour les produits existants
    console.log('🔄 Mise à jour des produits existants...');
    const products = await Product.findAll();
    let updatedCount = 0;

    for (const product of products) {
      const updates = {};
      let needsUpdate = false;

      // Mettre à jour les images si nécessaire
      if (product.images === null && product.image_url) {
        updates.images = JSON.stringify([product.image_url]);
        needsUpdate = true;
      }

      // Mettre à jour la catégorie si nécessaire
      if (!product.category) {
        updates.category = 'general';
        needsUpdate = true;
      }

      // Mettre à jour le statut si nécessaire
      if (!product.status) {
        updates.status = 'active';
        needsUpdate = true;
      }

      // Mettre à jour has_variants si nécessaire
      if (product.has_variants === null || product.has_variants === undefined) {
        updates.has_variants = false;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await product.update(updates);
        updatedCount++;
      }
    }

    console.log(`✅ ${updatedCount} produits mis à jour`);

    // Vérification finale
    console.log('🔍 Vérification finale...');
    const finalColumns = await queryInterface.describeTable('products');
    console.log('📊 Colonnes finales dans products:');
    Object.keys(finalColumns).forEach(column => {
      console.log(`  - ${column}: ${finalColumns[column].type}`);
    });

    const totalProducts = await Product.count();
    const totalVariants = await ProductVariant.count();
    
    console.log(`📈 Statistiques finales:`);
    console.log(`  - Produits: ${totalProducts}`);
    console.log(`  - Variantes: ${totalVariants}`);

    console.log('🎉 Migration sécurisée terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  safeMigration()
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration échouée:', error);
      process.exit(1);
    });
}

module.exports = safeMigration; 