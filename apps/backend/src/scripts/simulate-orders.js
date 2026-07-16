const { sequelize } = require('../config/database');
const { Order, Product, Seller } = require('../models');
const { notifySeller } = require('../app');

// Noms de clients fictifs
const customers = [
  'Fatou Ndiaye', 'Mamadou Diop', 'Aissatou Fall', 'Ousmane Ba', 'Mariama Sall',
  'Khadija Diallo', 'Ibrahima Niang', 'Aminata Mbaye', 'Modou Thiam', 'Fatima Sow',
  'Abdou Cissé', 'Rokhaya Diagne', 'Moussa Gueye', 'Awa Camara', 'Cheikh Faye'
];

// Messages de commande
const orderMessages = [
  'Commande urgente !',
  'Client fidèle',
  'Nouveau client',
  'Commande importante',
  'Client satisfait'
];

// Fonction pour générer une commande aléatoire
const generateRandomOrder = async (sellerId) => {
  try {
    // Récupérer les produits du vendeur
    const products = await Product.findAll({ 
      where: { seller_id: sellerId },
      limit: 3 
    });

    if (products.length === 0) {
      console.log(`❌ Aucun produit trouvé pour le vendeur ${sellerId}`);
      return null;
    }

    // Sélectionner un produit aléatoire
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1 à 3 unités
    const totalPrice = product.price * quantity;

    // Créer la commande
    const order = await Order.create({
      seller_id: sellerId,
      customer_name: customers[Math.floor(Math.random() * customers.length)],
      customer_phone: `+2217${Math.floor(Math.random() * 90000000) + 10000000}`,
      total_price: totalPrice,
      status: 'pending',
      payment_method: Math.random() > 0.5 ? 'mobile_money' : 'cash',
      delivery_address: 'Adresse de livraison',
      notes: orderMessages[Math.floor(Math.random() * orderMessages.length)]
    });

    // Créer les détails de la commande
    await sequelize.query(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [order.id, product.id, quantity, product.price, totalPrice]
    });

    return {
      order: {
        id: order.id,
        customer_name: order.customer_name,
        total_price: order.total_price,
        status: order.status,
        product: {
          id: product.id,
          name: product.name,
          price: product.price
        }
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors de la création de la commande:', error);
    return null;
  }
};

// Fonction pour simuler des commandes en temps réel
const simulateOrders = async () => {
  try {
    console.log('🎯 Début de la simulation de commandes en temps réel...');
    console.log('📱 Les vendeurs connectés recevront des notifications WebSocket');
    console.log('⏰ Nouvelles commandes toutes les 10-30 secondes...\n');

    // Récupérer tous les vendeurs
    const sellers = await Seller.findAll();
    
    if (sellers.length === 0) {
      console.log('❌ Aucun vendeur trouvé dans la base de données');
      return;
    }

    console.log(`👥 ${sellers.length} vendeurs trouvés:`);
    sellers.forEach(seller => {
      console.log(`- ${seller.name} (ID: ${seller.id})`);
    });
    console.log('');

    let orderCount = 0;

    // Fonction pour créer une commande aléatoire
    const createRandomOrder = async () => {
      const seller = sellers[Math.floor(Math.random() * sellers.length)];
      const orderData = await generateRandomOrder(seller.id);

      if (orderData) {
        orderCount++;
        console.log(`🛒 Commande #${orderCount} créée:`);
        console.log(`   Vendeur: ${seller.name}`);
        console.log(`   Client: ${orderData.order.customer_name}`);
        console.log(`   Montant: ${orderData.order.total_price.toLocaleString()} FCFA`);
        console.log(`   Produit: ${orderData.order.product.name}`);
        console.log(`   Statut: ${orderData.order.status}`);
        console.log('');

        // Envoyer la notification WebSocket au vendeur
        try {
          notifySeller(seller.id, 'new_order', orderData);
          console.log(`📡 Notification WebSocket envoyée au vendeur ${seller.name}`);
        } catch (error) {
          console.error(`❌ Erreur envoi notification:`, error);
        }
      }
    };

    // Créer la première commande immédiatement
    await createRandomOrder();

    // Programmer les commandes suivantes
    const scheduleNextOrder = () => {
      const delay = Math.floor(Math.random() * 20000) + 10000; // 10-30 secondes
      setTimeout(async () => {
        await createRandomOrder();
        scheduleNextOrder(); // Programmer la prochaine commande
      }, delay);
    };

    scheduleNextOrder();

    console.log('✅ Simulation en cours... Appuyez sur Ctrl+C pour arrêter\n');

  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error);
  }
};

// Fonction pour nettoyer les commandes de test
const cleanupTestOrders = async () => {
  try {
    const result = await Order.destroy({
      where: {
        customer_name: customers
      }
    });
    console.log(`🧹 ${result} commandes de test supprimées`);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
  cleanupTestOrders().then(() => {
    console.log('✅ Nettoyage terminé');
    process.exit(0);
  });
} else {
  simulateOrders();
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt de la simulation...');
  await sequelize.close();
  process.exit(0);
}); 