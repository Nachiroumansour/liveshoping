const { sequelize } = require('../config/database');
const { Seller, Product, Order } = require('../models');

async function simpleTest() {
  try {
    console.log('🧪 Test simple des notifications...');
    
    // Trouver Fatou Diallo
    const seller = await Seller.findByPk(1);
    console.log(`✅ Vendeur: ${seller.name}`);

    // Trouver un produit avec du stock
    const product = await Product.findOne({
      where: { 
        seller_id: 1,
        stock_quantity: { [sequelize.Sequelize.Op.gt]: 0 }
      }
    });
    console.log(`✅ Produit: ${product.name} (Stock: ${product.stock_quantity})`);

    // Créer une commande
    const order = await Order.create({
      product_id: product.id,
      seller_id: seller.id,
      customer_name: 'Test Client',
      customer_phone: '+221777777777',
      customer_address: 'Dakar, Sénégal',
      quantity: 1,
      total_price: product.price,
      payment_method: 'wave',
      status: 'pending'
    });

    console.log(`✅ Commande créée: ID ${order.id}`);

    // Simuler la notification
    console.log('📡 Simulation de notification WebSocket...');
    console.log(`   Vendeur: ${seller.name} (ID: ${seller.id})`);
    console.log(`   Commande: ${order.customer_name} - ${product.name}`);
    console.log(`   Montant: ${order.total_price.toLocaleString()} FCFA`);

    // Nettoyer après 3 secondes
    setTimeout(async () => {
      await order.destroy();
      console.log('🧹 Commande supprimée');
      process.exit(0);
    }, 3000);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

simpleTest(); 