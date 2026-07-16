const { sequelize } = require('../config/database');
const { Seller } = require('../models');
const bcrypt = require('bcrypt');

async function setMansourPin() {
  try {
    console.log('🔐 Définition du code PIN pour Mansour...');

    // Trouver Mansour
    const mansour = await Seller.findOne({
      where: { name: 'Mansour' }
    });

    if (!mansour) {
      console.log('❌ Vendeur Mansour non trouvé');
      return;
    }

    // Code PIN simple pour les tests : 1234
    const pinCode = '1234';
    const hashedPin = await bcrypt.hash(pinCode, 10);

    // Mettre à jour le code PIN
    await mansour.update({
      pin_hash: hashedPin
    });

    console.log('✅ Code PIN défini avec succès!');
    console.log(`📱 Numéro: ${mansour.phone_number}`);
    console.log(`🔐 Code PIN: ${pinCode}`);
    console.log(`🔗 Link ID: ${mansour.public_link_id}`);

    await sequelize.close();
    console.log('\n🎯 Vous pouvez maintenant vous connecter avec:');
    console.log(`   Téléphone: ${mansour.phone_number}`);
    console.log(`   Code PIN: ${pinCode}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await sequelize.close();
  }
}

setMansourPin(); 