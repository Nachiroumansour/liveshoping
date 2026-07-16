const { sequelize } = require('../config/database');
const { Order } = require('../models');

async function fixPaymentProofs() {
  try {
    console.log('🔧 Correction des URLs de preuve de paiement...\n');

    // 1. Vérifier toutes les commandes avec preuves
    const ordersWithProof = await Order.findAll({
      where: {
        payment_proof_url: {
          [require('sequelize').Op.not]: null
        }
      }
    });

    console.log(`📋 ${ordersWithProof.length} commandes avec preuves trouvées`);

    let fixedCount = 0;
    let removedCount = 0;

    for (const order of ordersWithProof) {
      const originalUrl = order.payment_proof_url;
      let newUrl = originalUrl;
      let shouldUpdate = false;

      // Vérifier si l'URL est valide
      if (!originalUrl || originalUrl.trim() === '') {
        console.log(`❌ Commande #${order.id}: URL vide - suppression`);
        newUrl = null;
        shouldUpdate = true;
        removedCount++;
      } else if (originalUrl.startsWith('http')) {
        console.log(`❌ Commande #${order.id}: URL externe - suppression`);
        console.log(`   URL: ${originalUrl}`);
        newUrl = null;
        shouldUpdate = true;
        removedCount++;
      } else if (!originalUrl.startsWith('/uploads/')) {
        console.log(`❌ Commande #${order.id}: URL invalide - suppression`);
        console.log(`   URL: ${originalUrl}`);
        newUrl = null;
        shouldUpdate = true;
        removedCount++;
      } else {
        // URL valide, vérifier si le fichier existe
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../../uploads', originalUrl.replace('/uploads/', ''));
        
        if (!fs.existsSync(filePath)) {
          console.log(`❌ Commande #${order.id}: Fichier non trouvé - suppression`);
          console.log(`   Fichier: ${filePath}`);
          newUrl = null;
          shouldUpdate = true;
          removedCount++;
        } else {
          console.log(`✅ Commande #${order.id}: URL valide`);
          console.log(`   URL: ${originalUrl}`);
          console.log(`   Fichier: ${filePath}`);
        }
      }

      // Mettre à jour si nécessaire
      if (shouldUpdate) {
        await order.update({ payment_proof_url: newUrl });
        fixedCount++;
      }
    }

    console.log('\n📊 Résumé des corrections:');
    console.log(`   ✅ URLs valides: ${ordersWithProof.length - fixedCount}`);
    console.log(`   🔧 URLs corrigées: ${fixedCount}`);
    console.log(`   🗑️ URLs supprimées: ${removedCount}`);

    // 2. Vérifier les commandes après correction
    const remainingProofs = await Order.findAll({
      where: {
        payment_proof_url: {
          [require('sequelize').Op.not]: null
        }
      }
    });

    console.log(`\n✅ ${remainingProofs.length} commandes avec preuves valides restantes`);

    if (remainingProofs.length > 0) {
      console.log('\n📋 URLs valides restantes:');
      remainingProofs.forEach(order => {
        console.log(`   Commande #${order.id}: ${order.payment_proof_url}`);
        console.log(`   URL complète: http://localhost:3001/api/upload${order.payment_proof_url}`);
      });
    }

    await sequelize.close();
    console.log('\n✅ Correction terminée');

  } catch (error) {
    console.error('❌ Erreur:', error);
    await sequelize.close();
  }
}

fixPaymentProofs(); 