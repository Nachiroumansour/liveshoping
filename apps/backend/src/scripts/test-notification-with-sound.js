const { sequelize } = require('../config/database');
const { Seller, Product, Order } = require('../models');

async function testNotificationWithSound() {
  try {
    console.log('🔊 Test des notifications avec son...');

    // Trouver Fatou Diallo
    const fatou = await Seller.findOne({
      where: { phone_number: '+221771234567' }
    });

    if (!fatou) {
      console.log('❌ Vendeur Fatou Diallo non trouvé');
      return;
    }

    console.log(`✅ Vendeur trouvé: ${fatou.name} (ID: ${fatou.id})`);

    // Trouver un produit de Fatou
    const product = await Product.findOne({
      where: { seller_id: fatou.id }
    });

    if (!product) {
      console.log('❌ Aucun produit trouvé pour ce vendeur');
      return;
    }

    console.log(`✅ Produit trouvé: ${product.name} (ID: ${product.id})`);

    // Créer une commande de test
    const testOrder = await Order.create({
      product_id: product.id,
      seller_id: fatou.id,
      customer_name: 'Client Test Son',
      customer_phone: '+221770000000',
      customer_address: 'Adresse de test, Dakar',
      quantity: 1,
      total_price: product.price,
      payment_method: 'wave',
      status: 'pending'
    });

    console.log(`✅ Commande de test créée: ID ${testOrder.id}`);

    // Envoyer la notification via WebSocket
    if (global.notifySeller) {
      global.notifySeller(fatou.id, 'new_order', {
        order: {
          id: testOrder.id,
          product_id: testOrder.product_id,
          customer_name: testOrder.customer_name,
          customer_phone: testOrder.customer_phone,
          customer_address: testOrder.customer_address,
          quantity: testOrder.quantity,
          total_price: testOrder.total_price,
          payment_method: testOrder.payment_method,
          status: testOrder.status,
          created_at: testOrder.created_at,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url
          }
        },
        message: `Nouvelle commande de ${testOrder.customer_name} - ${product.name} 🔊`
      });

      console.log('📡 Notification WebSocket avec son envoyée !');
      console.log('🔊 Vérifiez l\'app mobile pour entendre le son de notification');
    } else {
      console.log('❌ Fonction notifySeller non disponible');
    }

    // Attendre 10 secondes puis supprimer la commande de test
    setTimeout(async () => {
      await testOrder.destroy();
      console.log('🧹 Commande de test supprimée');
    }, 10000);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Connexion à la base de données fermée');
  }
}

// Exécuter le test
testNotificationWithSound(); 