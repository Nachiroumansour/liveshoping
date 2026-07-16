const { sequelize } = require('../config/database');
const { Seller, Product, Order } = require('../models');

async function testNotificationsComplete() {
  try {
    console.log('🧪 Test complet des notifications WebSocket...');
    
    // Vérifier si global.notifySeller est disponible
    console.log('🔍 global.notifySeller disponible:', !!global.notifySeller);
    
    if (!global.notifySeller) {
      console.log('❌ Fonction notifySeller non disponible - redémarrez le serveur');
      return;
    }

    // Trouver Fatou Diallo
    const seller = await Seller.findByPk(1);
    console.log(`✅ Vendeur: ${seller.name} (ID: ${seller.id})`);

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
      customer_name: 'Test Client WebSocket',
      customer_phone: '+221777777779',
      customer_address: 'Dakar, Sénégal',
      quantity: 1,
      total_price: product.price,
      payment_method: 'wave',
      status: 'pending'
    });

    console.log(`✅ Commande créée: ID ${order.id}`);

    // Envoyer la notification WebSocket
    console.log('📡 Envoi notification WebSocket...');
    global.notifySeller(seller.id, 'new_order', {
      order: {
        id: order.id,
        product_id: order.product_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        quantity: order.quantity,
        total_price: order.total_price,
        payment_method: order.payment_method,
        status: order.status,
        created_at: order.created_at,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url
        }
      },
      message: `Nouvelle commande de ${order.customer_name} - ${product.name}`
    });

    console.log('✅ Notification WebSocket envoyée !');
    console.log('📱 Vérifiez l\'app mobile pour voir la notification');
    console.log('🔊 Vérifiez que le son de notification se joue');
    console.log('🎤 Vérifiez que l\'annonce vocale se fait entendre');

    // Nettoyer après 10 secondes
    setTimeout(async () => {
      await order.destroy();
      console.log('🧹 Commande supprimée');
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testNotificationsComplete(); 