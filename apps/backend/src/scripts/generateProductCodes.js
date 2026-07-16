/**
 * Script pour générer les codes produit pour les produits existants
 * Exécuter avec: node src/scripts/generateProductCodes.js
 */

const { sequelize } = require('../config/database');
const Product = require('../models/Product');

async function generateProductCodes() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connecté à la base de données');

    // Récupérer tous les produits sans code, groupés par vendeur
    const products = await Product.findAll({
      where: {
        product_code: null
      },
      order: [['seller_id', 'ASC'], ['id', 'ASC']]
    });

    console.log(`📦 ${products.length} produits sans code trouvés`);

    if (products.length === 0) {
      console.log('✅ Tous les produits ont déjà un code !');
      process.exit(0);
    }

    // Grouper par vendeur
    const productsBySeller = {};
    for (const product of products) {
      if (!productsBySeller[product.seller_id]) {
        productsBySeller[product.seller_id] = [];
      }
      productsBySeller[product.seller_id].push(product);
    }

    // Pour chaque vendeur, trouver le dernier code et générer les suivants
    for (const [sellerId, sellerProducts] of Object.entries(productsBySeller)) {
      console.log(`\n👤 Vendeur ${sellerId}: ${sellerProducts.length} produits à traiter`);

      // Trouver le dernier code existant pour ce vendeur
      const lastProductWithCode = await Product.findOne({
        where: { 
          seller_id: sellerId,
          product_code: { [require('sequelize').Op.ne]: null }
        },
        order: [['product_code', 'DESC']]
      });

      let nextNumber = 1;
      if (lastProductWithCode && lastProductWithCode.product_code) {
        const match = lastProductWithCode.product_code.match(/^#?(\d+)$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      // Générer les codes pour chaque produit
      for (const product of sellerProducts) {
        const newCode = `#${String(nextNumber).padStart(3, '0')}`;
        
        await product.update({ product_code: newCode });
        console.log(`  ✓ ${product.name.substring(0, 30)}... → ${newCode}`);
        
        nextNumber++;
      }
    }

    console.log('\n✅ Tous les codes produit ont été générés avec succès !');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

generateProductCodes();
