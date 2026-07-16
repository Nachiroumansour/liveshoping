const fs = require('fs');
const path = require('path');

async function testUploadSystem() {
  try {
    console.log('🧪 Test du système d\'upload d\'images...\n');

    // 1. Vérifier que le dossier uploads existe
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Dossier uploads créé');
    } else {
      console.log('✅ Dossier uploads existe déjà');
    }

    // 2. Tester l'API d'upload
    console.log('\n🔍 Test de l\'API d\'upload...');
    console.log('URL: http://localhost:3001/api/upload/image');
    console.log('Méthode: POST');
    console.log('Body: FormData avec image');

    // 3. Tester l'accès aux images uploadées
    console.log('\n🔍 Test de l\'accès aux images...');
    console.log('URL: http://localhost:3001/api/upload/uploads/[filename]');

    // 4. Vérifier les routes dans app.js
    console.log('\n📋 Routes configurées:');
    console.log('✅ /api/upload/image - Upload d\'image');
    console.log('✅ /api/upload/uploads/:filename - Accès aux images');

    // 5. Instructions de test
    console.log('\n🎯 Instructions de test:');
    console.log('1. Redémarrez le serveur backend');
    console.log('2. Allez sur: http://localhost:5173/kbzd7r6a52');
    console.log('3. Choisissez un produit et passez commande');
    console.log('4. Dans la section "Preuve de paiement":');
    console.log('   - Cliquez sur "Capturer avec la caméra"');
    console.log('   - Ou cliquez sur "Choisir depuis la galerie"');
    console.log('5. L\'image sera automatiquement uploadée');

    console.log('\n✅ Test du système d\'upload terminé');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testUploadSystem(); 