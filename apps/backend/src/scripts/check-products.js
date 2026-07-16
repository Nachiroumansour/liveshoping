const { sequelize } = require('../config/database');
const { Seller, Product } = require('../models');

async function checkProducts() {
  try {
    console.log('🔍 Vérification des produits de Fatou Diallo...');
    
    const seller = await Seller.findByPk(1);
    console.log(`✅ Vendeur: ${seller.name}`);

    const products = await Product.findAll({
      where: { seller_id: 1 }
    });

    console.log(`\n📦 ${products.length} produits trouvés:`);
    products.forEach(product => {
      console.log(`- ${product.name} (ID: ${product.id}, Stock: ${product.stock_quantity}, Prix: ${product.price.toLocaleString()} FCFA)`);
    });

    const productsWithStock = products.filter(p => p.stock_quantity > 0);
    console.log(`\n✅ ${productsWithStock.length} produits avec du stock:`);
    productsWithStock.forEach(product => {
      console.log(`- ${product.name} (Stock: ${product.stock_quantity})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkProducts(); 