const notificationService = require('./src/services/notificationService');
const { Notification } = require('./src/models');

async function testOfflineNotifications() {
  console.log('🧪 Test des notifications hors ligne...');
  
  try {
    // Initialiser le service
    await notificationService.initializeQueue();
    
    // Simuler une commande pour un vendeur déconnecté (ID 1)
    const sellerId = 1;
    const orderData = {
      order: {
        id: Date.now(),
        customer_name: 'Client Test Offline',
        product_name: 'Produit Test',
        total: 2000,
        created_at: new Date().toISOString()
      }
    };
    
    console.log(`📤 Envoi notification à vendeur ${sellerId} (supposé déconnecté)...`);
    
    // Envoyer la notification
    await notificationService.sendRealtimeNotification(
      sellerId,
      'new_order',
      orderData
    );
    
    console.log('✅ Notification traitée');
    
    // Vérifier les notifications en base
    const notifications = await Notification.findAll({
      where: { seller_id: sellerId },
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    console.log('\n📋 Dernières notifications en base:');
    notifications.forEach(notif => {
      console.log(`- ID: ${notif.id}, Type: ${notif.type}, Envoyée: ${notif.sent}, Tentatives: ${notif.retry_count}`);
    });
    
    // Vérifier les notifications non envoyées
    const pendingNotifications = await Notification.findAll({
      where: { 
        seller_id: sellerId,
        sent: false 
      },
      order: [['created_at', 'DESC']]
    });
    
    console.log(`\n⏳ Notifications en attente: ${pendingNotifications.length}`);
    
    if (pendingNotifications.length > 0) {
      console.log('🔄 Ces notifications seront renvoyées quand le vendeur se reconnectera');
      pendingNotifications.forEach(notif => {
        console.log(`- ${notif.title}: ${notif.message}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  } finally {
    process.exit(0);
  }
}

testOfflineNotifications();
