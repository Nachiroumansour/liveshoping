const { sequelize } = require('../config/database');
const { Seller, Product, Order } = require('../models');

async function testVoiceNotification() {
  try {
    console.log('🎤 Test des notifications vocales...');

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
      customer_name: 'Aminata Diallo',
      customer_phone: '+221770000000',
      customer_address: 'Dakar, Plateau, Rue 10',
      quantity: 2,
      total_price: product.price * 2,
      payment_method: 'wave',
      status: 'pending'
    });

    console.log(`✅ Commande de test créée: ID ${testOrder.id}`);

    // Envoyer la notification via WebSocket avec message vocal
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
        message: `Nouvelle commande de ${testOrder.customer_name} - ${product.name} 🎤`
      });

      console.log('📡 Notification WebSocket avec annonce vocale envoyée !');
      console.log('🎤 Vérifiez l\'app mobile pour entendre l\'annonce vocale');
      console.log('💬 Message qui sera lu :');
      console.log(`   "Nouvelle commande ! ${testOrder.customer_name} a commandé ${testOrder.quantity} ${product.name}s pour ${testOrder.total_price.toLocaleString()} FCFA. Adresse de livraison : ${testOrder.customer_address}"`);
    } else {
      console.log('❌ Fonction notifySeller non disponible');
    }

    // Attendre 15 secondes puis supprimer la commande de test
    setTimeout(async () => {
      await testOrder.destroy();
      console.log('🧹 Commande de test supprimée');
    }, 15000);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Connexion à la base de données fermée');
  }
}

// Exécuter le test
testVoiceNotification(); 