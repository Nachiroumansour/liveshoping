const bcrypt = require('bcrypt');
const { Seller, Product } = require('./src/models');
const crypto = require('crypto');

// Génère un ID public unique
function generatePublicLinkId() {
  return crypto.randomBytes(5).toString('hex');
}

// Images de test (URLs publiques gratuites)
const testImages = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500',
];

const testProducts = [
  {
    name: 'Montre Élégante',
    description: 'Belle montre moderne avec bracelet en cuir',
    price: 15000,
    stock_quantity: 10,
    image_url: testImages[0],
    images: JSON.stringify([testImages[0], testImages[1], testImages[2]]),
    is_pinned: true,
    attributes: JSON.stringify({ couleur: 'Noir', taille: 'Medium' })
  },
  {
    name: 'Casque Audio Pro',
    description: 'Casque sans fil avec réduction de bruit active',
    price: 25000,
    stock_quantity: 5,
    image_url: testImages[1],
    images: JSON.stringify([testImages[1], testImages[3]]),
    is_pinned: true,
    attributes: JSON.stringify({ couleur: 'Blanc', type: 'Sans fil' })
  },
  {
    name: 'Lunettes de Soleil',
    description: 'Lunettes polarisées protection UV400',
    price: 8000,
    stock_quantity: 20,
    image_url: testImages[2],
    images: JSON.stringify([testImages[2]]),
    is_pinned: false,
    attributes: JSON.stringify({ couleur: 'Marron' })
  },
  {
    name: 'Sac à Main Cuir',
    description: 'Sac en cuir véritable fait main',
    price: 35000,
    stock_quantity: 3,
    image_url: testImages[3],
    images: JSON.stringify([testImages[3], testImages[4], testImages[0]]),
    is_pinned: false,
    attributes: JSON.stringify({ couleur: 'Beige', matière: 'Cuir' })
  },
  {
    name: 'Appareil Photo Vintage',
    description: 'Appareil photo rétro pour les amateurs de photographie',
    price: 45000,
    stock_quantity: 2,
    image_url: testImages[4],
    images: JSON.stringify([testImages[4], testImages[3]]),
    is_pinned: true,
    attributes: JSON.stringify({ type: 'Vintage', état: 'Neuf' })
  }
];

async function createLocalTestData() {
  try {
    console.log('🚀 Création des données de test local...\n');
    
    // Créer ou récupérer le vendeur de test
    const testPhone = '+221700000000';
    const testPin = '0000';
    
    let seller = await Seller.findOne({ where: { phone_number: testPhone } });
    
    if (!seller) {
      console.log('👤 Création du vendeur de test...');
      const hashedPin = await bcrypt.hash(testPin, 10);
      const publicLinkId = generatePublicLinkId();
      
      seller = await Seller.create({
        phone_number: testPhone,
        pin_hash: hashedPin,
        name: 'Boutique Test Local',
        public_link_id: publicLinkId,
        is_active: true,
        role: 'seller',
        credit_balance: 100,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✅ Vendeur créé !');
    } else {
      console.log('✅ Vendeur de test existe déjà');
    }
    
    console.log('\n📦 Création des produits de test...');
    
    // Supprimer les anciens produits de test
    await Product.destroy({ where: { seller_id: seller.id } });
    console.log('🗑️  Anciens produits supprimés');
    
    // Créer les nouveaux produits
    for (const productData of testProducts) {
      const product = await Product.create({
        ...productData,
        seller_id: seller.id,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log(`   ✅ ${product.name} créé (ID: ${product.id})`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DONNÉES DE TEST CRÉÉES AVEC SUCCÈS !');
    console.log('='.repeat(50));
    console.log('\n📱 Informations de connexion :');
    console.log('   Téléphone : +221700000000');
    console.log('   Code PIN  : 0000');
    console.log(`\n🔗 Lien boutique : http://localhost:5174/${seller.public_link_id}`);
    console.log(`\n👤 ID Vendeur : ${seller.id}`);
    console.log(`🔗 Public Link ID : ${seller.public_link_id}`);
    console.log(`📦 Produits créés : ${testProducts.length}`);
    console.log('\n💡 Pour tester :');
    console.log('   1. Lancez le backend : cd liveshop-backend && npm run dev');
    console.log('   2. Lancez le web-client : cd web-client/liveshop-client && npm run dev');
    console.log('   3. Ouvrez http://localhost:5174/' + seller.public_link_id);
    console.log('   4. Cliquez sur une image pour voir la lightbox !');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

createLocalTestData();
