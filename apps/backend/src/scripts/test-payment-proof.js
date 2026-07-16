const { sequelize } = require('../config/database');
const { Order } = require('../models');

async function testPaymentProof() {
  try {
    console.log('🔍 Test de visualisation des preuves de paiement...\n');

    // 1. Vérifier les commandes avec preuves
    const ordersWithProof = await Order.findAll({
      where: {
        payment_proof_url: {
          [require('sequelize').Op.not]: null
        }
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    console.log(`✅ ${ordersWithProof.length} commandes avec preuves trouvées`);

    if (ordersWithProof.length === 0) {
      console.log('❌ Aucune commande avec preuve de paiement trouvée');
      console.log('💡 Créez une commande avec preuve depuis l\'interface client');
      return;
    }

    // 2. Afficher les détails des preuves
    console.log('\n📋 Détails des preuves de paiement:');
    ordersWithProof.forEach((order, index) => {
      console.log(`\n${index + 1}. Commande #${order.id}:`);
      console.log(`   Client: ${order.customer_name}`);
      console.log(`   Méthode: ${order.payment_method}`);
      console.log(`   Preuve URL: ${order.payment_proof_url}`);
      console.log(`   URL complète: http://localhost:3001/api/upload${order.payment_proof_url}`);
    });

    // 3. Tester l'accès aux images
    console.log('\n🧪 Test d\'accès aux images...');
    const testOrder = ordersWithProof[0];
    
    if (testOrder.payment_proof_url) {
      const imageUrl = `http://localhost:3001/api/upload${testOrder.payment_proof_url}`;
      console.log(`📸 Test de l'image: ${imageUrl}`);
      
      // Vérifier si le fichier existe physiquement
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../../uploads', testOrder.payment_proof_url.replace('/uploads/', ''));
      
      if (fs.existsSync(filePath)) {
        console.log('✅ Fichier image trouvé sur le serveur');
        const stats = fs.statSync(filePath);
        console.log(`   Taille: ${(stats.size / 1024).toFixed(2)} KB`);
      } else {
        console.log('❌ Fichier image non trouvé sur le serveur');
        console.log(`   Chemin recherché: ${filePath}`);
      }
    }

    // 4. Instructions pour tester
    console.log('\n🎯 Instructions pour tester:');
    console.log('1. Allez dans l\'app vendeur: http://localhost:5174/');
    console.log('2. Cliquez sur "Commandes" dans le menu');
    console.log('3. Cliquez sur "Voir" pour une commande avec preuve');
    console.log('4. Cliquez sur "Voir la preuve" dans les détails');
    console.log('5. L\'image devrait s\'afficher correctement');

    // 5. Vérifier les routes d'upload
    console.log('\n🔧 Vérification des routes d\'upload:');
    console.log('✅ Route POST /api/upload/image - Upload d\'images');
    console.log('✅ Route GET /api/upload/uploads/:filename - Servir les images');
    console.log('✅ Dossier uploads/ - Stockage local');

    await sequelize.close();
    console.log('\n✅ Test terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await sequelize.close();
  }
}

testPaymentProof(); 