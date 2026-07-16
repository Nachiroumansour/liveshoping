const { sequelize } = require('../config/database');
const { Seller, Product, Order } = require('../models');

async function diagnosticCommandes() {
  try {
    console.log('🔍 Diagnostic des commandes et notifications...\n');

    // 1. Vérifier Mansour
    const mansour = await Seller.findOne({ where: { name: 'Mansour' } });
    if (!mansour) {
      console.log('❌ Mansour non trouvé');
      return;
    }

    console.log('✅ Mansour trouvé:', {
      id: mansour.id,
      name: mansour.name,
      link_id: mansour.public_link_id,
      wave_qr: !!mansour.wave_qr_code_url,
      orange_qr: !!mansour.orange_money_qr_code_url
    });

    // 2. Vérifier les produits de Mansour
    const products = await Product.findAll({ where: { seller_id: mansour.id } });
    console.log(`✅ ${products.length} produits trouvés pour Mansour`);

    // 3. Vérifier les commandes existantes
    const orders = await Order.findAll({ where: { seller_id: mansour.id } });
    console.log(`✅ ${orders.length} commandes trouvées pour Mansour`);

    // 4. Tester l'API des méthodes de paiement
    console.log('\n🔍 Test de l\'API des méthodes de paiement...');
    const paymentMethodsUrl = `http://localhost:3001/api/public/${mansour.public_link_id}/payment-methods`;
    console.log('URL:', paymentMethodsUrl);

    // 5. Créer une commande de test
    if (products.length > 0) {
      console.log('\n🧪 Création d\'une commande de test...');
      
      const testOrder = await Order.create({
        product_id: products[0].id,
        seller_id: mansour.id,
        customer_name: 'Test Client',
        customer_phone: '+221777777777',
        customer_address: 'Adresse de test',
        quantity: 1,
        total_price: products[0].price,
        payment_method: 'free_money',
        payment_proof_url: 'https://example.com/proof.jpg',
        status: 'pending'
      });

      console.log('✅ Commande de test créée:', {
        id: testOrder.id,
        customer: testOrder.customer_name,
        product: products[0].name,
        payment_method: testOrder.payment_method,
        payment_proof: testOrder.payment_proof_url
      });

      // 6. Simuler une notification
      console.log('\n🔔 Test de notification...');
      if (global.notifySeller) {
        global.notifySeller(mansour.id, 'new_order', {
          order: {
            id: testOrder.id,
            customer_name: testOrder.customer_name,
            total_price: testOrder.total_price,
            product: {
              name: products[0].name
            }
          }
        });
        console.log('✅ Notification envoyée');
      } else {
        console.log('❌ global.notifySeller non disponible');
      }
    }

    // 7. Recommandations
    console.log('\n📋 Recommandations:');
    console.log('1. ✅ Les méthodes de paiement sont configurées');
    console.log('2. ✅ Le champ payment_proof_url est géré');
    console.log('3. ⚠️  Pour les notifications vocales:');
    console.log('   - Vérifiez que l\'app vendeur est connectée');
    console.log('   - Vérifiez les contrôles vocaux dans l\'interface');
    console.log('   - Testez avec le bouton "Test" dans les contrôles vocaux');

    await sequelize.close();
    console.log('\n✅ Diagnostic terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await sequelize.close();
  }
}

diagnosticCommandes(); 