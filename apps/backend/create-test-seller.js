const bcrypt = require('bcrypt');
const { Seller } = require('./src/models');

async function createTestSeller() {
  try {
    console.log('🔍 Vérification vendeur de test...');
    
    // Vérifier si le vendeur existe déjà
    let seller = await Seller.findOne({ where: { phone: '+221771842787' } });
    
    if (seller) {
      console.log('✅ Vendeur de test existe déjà:');
      console.log('📱 Téléphone: +221771842787');
      console.log('🔑 Code PIN: 1234');
      console.log('👤 ID:', seller.id);
      console.log('📧 Email:', seller.email);
      console.log('✅ Status:', seller.status);
      return;
    }

    console.log('🆕 Création du vendeur de test...');
    
    // Créer le vendeur de test
    const hashedPin = await bcrypt.hash('1234', 10);
    
    seller = await Seller.create({
      phone: '+221771842787',
      pin: hashedPin,
      name: 'Vendeur Test',
      email: 'test@livelink.store',
      status: 'active',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('✅ Vendeur de test créé avec succès !');
    console.log('📱 Téléphone: +221771842787');
    console.log('🔑 Code PIN: 1234');
    console.log('👤 ID:', seller.id);
    console.log('');
    console.log('🧪 Vous pouvez maintenant vous connecter pour tester les notifications temps réel !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.name === 'SequelizeValidationError') {
      console.error('📋 Détails validation:', error.errors.map(e => e.message));
    }
  } finally {
    process.exit(0);
  }
}

createTestSeller();
