const { sequelize } = require('../config/database');
const { Seller, Product, Live, LiveProduct } = require('../models');

async function createTestLive() {
  try {
    console.log('🧪 Création d\'un live de test avec produits...');

    // Trouver un vendeur
    const seller = await Seller.findOne();
    if (!seller) {
      console.log('❌ Aucun vendeur trouvé. Exécutez d\'abord: npm run seed');
      return;
    }

    console.log(`✅ Vendeur trouvé: ${seller.name} (ID: ${seller.id})`);

    // Trouver des produits du vendeur
    const products = await Product.findAll({
      where: { seller_id: seller.id },
      limit: 5
    });

    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé pour ce vendeur. Exécutez d\'abord: npm run seed');
      return;
    }

    console.log(`✅ ${products.length} produits trouvés`);

    // Créer un live
    const liveTitle = 'Live Test - Vente Flash';
    const liveSlug = 'live-test-vente-flash';
    
    const live = await Live.create({
      title: liveTitle,
      slug: liveSlug,
      date: new Date(),
      sellerId: seller.id
    });

    console.log(`✅ Live créé: ${live.title} (ID: ${live.id}, Slug: ${live.slug})`);

    // Associer les produits au live
    const liveProducts = products.map(product => ({
      liveId: live.id,
      productId: product.id
    }));

    await LiveProduct.bulkCreate(liveProducts);

    console.log(`✅ ${products.length} produits associés au live`);

    // Afficher les informations du live
    console.log('\n📋 Informations du live créé:');
    console.log('─'.repeat(50));
    console.log(`Titre: ${live.title}`);
    console.log(`Slug: ${live.slug}`);
    console.log(`Vendeur: ${seller.name}`);
    console.log(`Lien public: http://localhost:3000/${seller.public_link_id}/live/${live.slug}`);
    console.log(`API endpoint: http://localhost:3001/api/public/${seller.public_link_id}/live/${live.slug}`);

    console.log('\n📦 Produits associés:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.price.toLocaleString()} FCFA`);
    });

    console.log('\n✅ Live de test créé avec succès !');
    console.log('🌐 Testez le lien public pour voir les produits');

  } catch (error) {
    console.error('❌ Erreur lors de la création du live:', error);
  } finally {
    await sequelize.close();
  }
}

createTestLive(); 