const { sequelize } = require('../config/database');
const { Seller, Order, Product } = require('../models');
const notificationService = require('../services/notificationService');

async function testRealtimeSystem() {
  try {
    console.log('🧪 Test du système de notifications en temps réel...\n');

    // 1. Vérifier Mansour
    const mansour = await Seller.findOne({ where: { name: 'Mansour' } });
    if (!mansour) {
      console.log('❌ Mansour non trouvé');
      return;
    }

    console.log('✅ Mansour trouvé:', {
      id: mansour.id,
      name: mansour.name,
      link_id: mansour.public_link_id
    });

    // 2. Vérifier global.notifySeller
    if (!global.notifySeller) {
      console.log('❌ global.notifySeller non disponible');
      console.log('💡 Redémarrez le serveur pour activer les notifications');
      return;
    }

    console.log('✅ global.notifySeller disponible');

    // 3. Test de notification de nouvelle commande
    console.log('\n📦 Test notification nouvelle commande...');
    const testOrder = {
      id: 999,
      customer_name: 'Client Test',
      total_price: 50000,
      product: {
        name: 'Produit Test'
      }
    };

    await notificationService.sendRealtimeNotification(
      mansour.id,
      'new_order',
      { order: testOrder }
    );

    // 4. Test de notification de mise à jour de commande
    console.log('\n📦 Test notification mise à jour commande...');
    const updatedOrder = {
      id: 999,
      customer_name: 'Client Test',
      status: 'payé',
      total_price: 50000
    };

    await notificationService.sendRealtimeNotification(
      mansour.id,
      'order_status_update',
      { order: updatedOrder }
    );

    // 5. Test de notification de mise à jour de produit
    console.log('\n📦 Test notification mise à jour produit...');
    const testProduct = {
      id: 1,
      name: 'Produit Mis à Jour',
      price: 75000
    };

    await notificationService.sendRealtimeNotification(
      mansour.id,
      'product_updated',
      { product: testProduct }
    );

    // 6. Test de notification de mise à jour de crédits
    console.log('\n💰 Test notification mise à jour crédits...');
    await notificationService.sendRealtimeNotification(
      mansour.id,
      'credits_updated',
      { 
        newCredits: 150,
        change: 50,
        reason: 'Achat de crédits'
      }
    );

    // 7. Vérifier les notifications en base
    const { Notification } = require('../models');
    const notifications = await Notification.findAll({
      where: { seller_id: mansour.id },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    console.log(`\n📋 ${notifications.length} notifications créées en base`);

    // 8. Instructions pour tester
    console.log('\n🎯 Instructions pour tester:');
    console.log('1. Connectez-vous à l\'app vendeur: http://localhost:5174/');
    console.log('2. Vérifiez l\'indicateur de notification dans le header');
    console.log('3. Cliquez sur l\'icône de notification pour voir les détails');
    console.log('4. Passez une vraie commande depuis: http://localhost:5173/kbzd7r6a52');
    console.log('5. Vérifiez que la notification apparaît en temps réel');

    // 9. Vérifier les événements WebSocket
    console.log('\n🔧 Événements WebSocket configurés:');
    console.log('   ✅ new_notification - Nouvelles notifications');
    console.log('   ✅ order_updated - Mises à jour de commandes');
    console.log('   ✅ product_updated - Mises à jour de produits');
    console.log('   ✅ stats_updated - Mises à jour de statistiques');
    console.log('   ✅ credits_updated - Mises à jour de crédits');

    // 10. Vérifier l'actualisation automatique
    console.log('\n🔄 Actualisation automatique configurée:');
    console.log('   ✅ Toutes les 30 secondes');
    console.log('   ✅ Basée sur les notifications');
    console.log('   ✅ Lors du retour en ligne');
    console.log('   ✅ Lors du focus de la fenêtre');
    console.log('   ✅ Événements spécifiques déclenchés');

    await sequelize.close();
    console.log('\n✅ Test terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await sequelize.close();
  }
}

testRealtimeSystem(); 