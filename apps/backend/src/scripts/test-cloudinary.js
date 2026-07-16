const { cloudinary } = require('../config/cloudinary');

async function testCloudinary() {
  console.log('🧪 Test de la configuration Cloudinary...\n');

  try {
    // Test 1: Vérifier la configuration
    console.log('1️⃣ Vérification de la configuration...');
    const config = cloudinary.config();
    console.log('✅ Configuration Cloudinary:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? '✅ Configuré' : '❌ Manquant',
      api_secret: config.api_secret ? '✅ Configuré' : '❌ Manquant'
    });

    // Test 2: Tester la connexion avec une requête simple
    console.log('\n2️⃣ Test de connexion...');
    const result = await cloudinary.api.ping();
    console.log('✅ Connexion réussie:', result);

    // Test 3: Lister les ressources (pour vérifier l'accès)
    console.log('\n3️⃣ Test d\'accès aux ressources...');
    const resources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 1
    });
    console.log('✅ Accès aux ressources OK');
    console.log(`📊 Total de ressources: ${resources.total_count}`);

    // Test 4: Tester la génération d'URL
    console.log('\n4️⃣ Test de génération d\'URL...');
    const testUrl = cloudinary.url('sample', {
      width: 100,
      height: 100,
      crop: 'fill'
    });
    console.log('✅ Génération d\'URL OK:', testUrl);

    console.log('\n🎉 Tous les tests Cloudinary sont passés avec succès !');
    console.log('\n📋 Votre configuration est prête pour :');
    console.log('   • Upload d\'images de produits');
    console.log('   • Upload de preuves de paiement');
    console.log('   • Upload d\'avatars');
    console.log('   • Upload de bannières de lives');
    console.log('   • Optimisation automatique des images');
    console.log('   • Génération de thumbnails');

  } catch (error) {
    console.error('❌ Erreur lors du test Cloudinary:', error.message);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 Solutions possibles :');
      console.log('   • Vérifiez vos credentials dans le fichier .env');
      console.log('   • Assurez-vous que CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET sont corrects');
      console.log('   • Redémarrez le serveur après modification du .env');
    }
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testCloudinary()
    .then(() => {
      console.log('\n✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { testCloudinary }; 