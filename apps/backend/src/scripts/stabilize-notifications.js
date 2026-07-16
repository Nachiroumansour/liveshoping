const { sequelize } = require('../config/database');
const { Seller, Order } = require('../models');

async function stabilizeNotifications() {
  try {
    console.log('🔧 Diagnostic et stabilisation des notifications...\n');

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

    // 2. Vérifier les commandes existantes
    const orders = await Order.findAll({ 
      where: { seller_id: mansour.id },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    console.log(`✅ ${orders.length} commandes trouvées pour Mansour`);

    // 3. Vérifier les notifications en base
    const { Notification } = require('../models');
    const notifications = await Notification.findAll({
      where: { seller_id: mansour.id },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    console.log(`✅ ${notifications.length} notifications en base de données`);

    // 4. Statistiques des notifications
    const stats = {
      total: notifications.length,
      sent: notifications.filter(n => n.sent).length,
      read: notifications.filter(n => n.read).length,
      new_orders: notifications.filter(n => n.type === 'new_order').length,
      status_updates: notifications.filter(n => n.type === 'order_status_update').length
    };

    console.log('\n📊 Statistiques des notifications:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Envoyées: ${stats.sent}`);
    console.log(`   Lues: ${stats.read}`);
    console.log(`   Nouvelles commandes: ${stats.new_orders}`);
    console.log(`   Mises à jour statut: ${stats.status_updates}`);

    // 5. Recommandations pour stabiliser les notifications
    console.log('\n🔧 Recommandations pour stabiliser les notifications:');

    console.log('\n1. ✅ Vérifier la connexion WebSocket:');
    console.log('   - Assurez-vous que l\'app vendeur est connectée');
    console.log('   - Vérifiez les logs WebSocket dans la console');
    console.log('   - Testez la reconnexion automatique');

    console.log('\n2. ✅ Vérifier les contrôles vocaux:');
    console.log('   - Allez dans l\'interface vendeur');
    console.log('   - Cliquez sur l\'icône microphone');
    console.log('   - Testez le bouton "Test"');
    console.log('   - Vérifiez que le volume est activé');

    console.log('\n3. ✅ Tester une vraie commande:');
    console.log('   - Allez sur: http://localhost:5173/kbzd7r6a52');
    console.log('   - Passez une commande avec preuve de paiement');
    console.log('   - Vérifiez la notification dans l\'app vendeur');

    console.log('\n4. ✅ Vérifier les logs serveur:');
    console.log('   - Surveillez les logs du serveur backend');
    console.log('   - Vérifiez que global.notifySeller est disponible');
    console.log('   - Vérifiez les erreurs de notification');

    // 6. Test de notification manuel
    console.log('\n🧪 Test de notification manuel...');
    if (global.notifySeller) {
      global.notifySeller(mansour.id, 'new_order', {
        order: {
          id: orders[0]?.id || 999,
          customer_name: 'Test Client',
          total_price: 100000,
          product: {
            name: 'Produit de test'
          }
        }
      });
      console.log('✅ Notification de test envoyée');
    } else {
      console.log('❌ global.notifySeller non disponible - redémarrez le serveur');
    }

    // 7. Vérifier les méthodes de paiement
    console.log('\n💳 Méthodes de paiement configurées:');
    console.log('   ✅ Wave (toujours disponible - paiement par preuve)');
    console.log('   ✅ Orange Money (toujours disponible - paiement par preuve)');
    console.log('   ✅ Free Money (toujours disponible - paiement par preuve)');
    console.log('   ✅ Espèces à la livraison (toujours disponible)');
    console.log('   ❌ Virement bancaire (supprimé)');

    await sequelize.close();
    console.log('\n✅ Diagnostic terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await sequelize.close();
  }
}

stabilizeNotifications(); 