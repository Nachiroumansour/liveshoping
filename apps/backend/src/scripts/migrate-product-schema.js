const { sequelize } = require('../config/database');
const { Product, ProductVariant } = require('../models');

async function migrateProductSchema() {
  try {
    console.log('🚀 Début de la migration du schéma des produits...');

    // Synchroniser les modèles avec la base de données
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés avec la base de données');

    // Vérifier si la table product_variants existe
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    const hasProductVariants = tableExists.includes('product_variants');
    
    if (!hasProductVariants) {
      console.log('📋 Création de la table product_variants...');
      await ProductVariant.sync();
      console.log('✅ Table product_variants créée');
    }

    // Mettre à jour les produits existants avec les nouveaux champs par défaut
    console.log('🔄 Mise à jour des produits existants...');
    
    const products = await Product.findAll();
    let updatedCount = 0;

    for (const product of products) {
      const updates = {};
      let needsUpdate = false;

      // Ajouter les nouveaux champs avec des valeurs par défaut si ils n'existent pas
      if (product.category === undefined || product.category === null) {
        updates.category = 'general';
        needsUpdate = true;
      }

      if (product.attributes === undefined || product.attributes === null) {
        updates.attributes = null;
        needsUpdate = true;
      }

      if (product.images === undefined || product.images === null) {
        updates.images = product.image_url ? [product.image_url] : null;
        needsUpdate = true;
      }

      if (product.tags === undefined || product.tags === null) {
        updates.tags = null;
        needsUpdate = true;
      }

      if (product.has_variants === undefined || product.has_variants === null) {
        updates.has_variants = false;
        needsUpdate = true;
      }

      if (product.status === undefined || product.status === null) {
        updates.status = 'active';
        needsUpdate = true;
      }

      if (product.weight === undefined || product.weight === null) {
        updates.weight = null;
        needsUpdate = true;
      }

      if (product.dimensions === undefined || product.dimensions === null) {
        updates.dimensions = null;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await product.update(updates);
        updatedCount++;
      }
    }

    console.log(`✅ ${updatedCount} produits mis à jour`);

    // Vérifier la structure finale
    console.log('🔍 Vérification de la structure finale...');
    
    const productColumns = await sequelize.getQueryInterface().describeTable('products');
    const variantColumns = await sequelize.getQueryInterface().describeTable('product_variants');

    console.log('📊 Colonnes de la table products:');
    Object.keys(productColumns).forEach(column => {
      console.log(`  - ${column}: ${productColumns[column].type}`);
    });

    console.log('📊 Colonnes de la table product_variants:');
    Object.keys(variantColumns).forEach(column => {
      console.log(`  - ${column}: ${variantColumns[column].type}`);
    });

    console.log('🎉 Migration terminée avec succès !');
    
    // Statistiques
    const totalProducts = await Product.count();
    const totalVariants = await ProductVariant.count();
    
    console.log(`📈 Statistiques:`);
    console.log(`  - Produits: ${totalProducts}`);
    console.log(`  - Variantes: ${totalVariants}`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateProductSchema()
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration échouée:', error);
      process.exit(1);
    });
}

module.exports = migrateProductSchema; 