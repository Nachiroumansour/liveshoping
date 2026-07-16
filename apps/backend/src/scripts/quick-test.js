const { sequelize } = require('../config/database');
const { Seller, Product, Order } = require('../models');

async function quickTest() {
  try {
    console.log('🧪 Test rapide du système LiveShop Link');
    console.log('─'.repeat(50));

    // 1. Test de connexion à la base de données
    console.log('1️⃣ Test de connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données OK');

    // 2. Vérifier les vendeurs
    console.log('\n2️⃣ Vérification des vendeurs...');
    const sellers = await Seller.findAll();
    if (sellers.length === 0) {
      console.log('❌ Aucun vendeur trouvé. Exécutez : npm run seed');
      return;
    }
    console.log(`✅ ${sellers.length} vendeurs trouvés`);

    // 3. Vérifier les produits
    console.log('\n3️⃣ Vérification des produits...');
    const products = await Product.findAll();
    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé. Exécutez : npm run seed');
      return;
    }
    console.log(`✅ ${products.length} produits trouvés`);

    // 4. Vérifier les commandes
    console.log('\n4️⃣ Vérification des commandes...');
    const orders = await Order.findAll();
    console.log(`✅ ${orders.length} commandes trouvées`);

    // 5. Afficher les informations de test
    console.log('\n📊 Informations de test :');
    console.log('─'.repeat(50));
    
    console.log('\n👥 Vendeurs disponibles :');
    sellers.forEach((seller, index) => {
      console.log(`${index + 1}. ${seller.name}`);
      console.log(`   📱 ${seller.phone_number}`);
      console.log(`   🔗 http://localhost:3000/${seller.public_link_id}`);
      console.log(`   🔑 PIN: 1234`);
    });

    console.log('\n📦 Produits par vendeur :');
    for (const seller of sellers) {
      const sellerProducts = await Product.findAll({
        where: { seller_id: seller.id }
      });
      console.log(`\n${seller.name} (${sellerProducts.length} produits) :`);
      sellerProducts.forEach(product => {
        console.log(`   - ${product.name} : ${product.price.toLocaleString()} FCFA`);
      });
    }

    console.log('\n🎥 Lives disponibles :');
    const { Live } = require('../models');
    const lives = await Live.findAll();
    lives.forEach(live => {
      const seller = sellers.find(s => s.id === live.sellerId);
      console.log(`- ${live.title}`);
      console.log(`  👤 ${seller.name}`);
      console.log(`  🔗 http://localhost:3000/${seller.public_link_id}/live/${live.id}`);
      console.log(`  ⏰ ${new Date(live.date).toLocaleString()}`);
    });

    console.log('\n🧪 Commandes de test :');
    console.log('─'.repeat(50));
    console.log('🔹 Commande unique :');
    console.log('   npm run simulate single');
    console.log('');
    console.log('🔹 5 commandes avec 3s d\'intervalle :');
    console.log('   npm run simulate multiple 5 3000');
    console.log('');
    console.log('🔹 Simulation continue (5s) :');
    console.log('   npm run simulate continuous 5000');

    console.log('\n🌐 URLs de test :');
    console.log('─'.repeat(50));
    console.log('📱 App vendeur : http://localhost:5174');
    console.log('🖥️  Web client : http://localhost:3000');
    console.log('🔧 Backend API : http://localhost:3001/api/health');

    console.log('\n✅ Test rapide terminé !');
    console.log('💡 Connectez-vous à l\'app vendeur et lancez une simulation');

  } catch (error) {
    console.error('❌ Erreur lors du test :', error.message);
  } finally {
    await sequelize.close();
  }
}

quickTest(); 