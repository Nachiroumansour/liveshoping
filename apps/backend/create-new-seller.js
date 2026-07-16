const bcrypt = require('bcrypt');
const { Seller } = require('./src/models');

async function createNewSeller() {
  try {
    console.log('🆕 Création nouveau vendeur de test...');
    
    // Nouveau numéro de test
    const phone = '+221123456789';
    
    // Vérifier si le vendeur existe déjà
    let seller = await Seller.findOne({ where: { phone } });
    
    if (seller) {
      console.log('✅ Ce vendeur existe déjà:');
      console.log('📱 Téléphone:', phone);
      console.log('🔑 Code PIN: 1234');
      console.log('👤 ID:', seller.id);
      return;
    }

    // Créer le nouveau vendeur
    const hashedPin = await bcrypt.hash('1234', 10);
    
    seller = await Seller.create({
      phone: phone,
      pin: hashedPin,
      name: 'Nouveau Vendeur Test',
      email: 'nouveau@livelink.store',
      status: 'active',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Nouveau vendeur créé avec succès !');
    console.log('📱 Téléphone:', phone);
    console.log('🔑 Code PIN: 1234');
    console.log('👤 ID:', seller.id);
    console.log('📧 Email:', seller.email);
    console.log('');
    console.log('🧪 Connectez-vous maintenant pour tester les notifications !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

createNewSeller();
