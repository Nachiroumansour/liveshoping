const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

async function testUpload() {
  console.log('🧪 Test d\'upload d\'images vers Cloudinary...\n');

  try {
    // Créer une image SVG de test
    const testImagePath = path.join(__dirname, 'test-image.svg');
    const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#367fd7"/>
  <text x="100" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">Test Image</text>
</svg>`;
    
    // Sauvegarder le SVG
    fs.writeFileSync(testImagePath, svgContent);
    console.log('📁 Image SVG de test créée');

    // Test 1: Upload d'image de produit
    console.log('\n1️⃣ Test upload image de produit...');
    const productResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'liveshop/products',
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    console.log('✅ Image de produit uploadée:', {
      url: productResult.secure_url,
      publicId: productResult.public_id,
      size: productResult.bytes,
      format: productResult.format
    });

    // Test 2: Upload d'avatar
    console.log('\n2️⃣ Test upload avatar...');
    const avatarResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'liveshop/avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
        { fetch_format: 'auto' },
        { radius: 'max' }
      ]
    });
    
    console.log('✅ Avatar uploadé:', {
      url: avatarResult.secure_url,
      publicId: avatarResult.public_id,
      size: avatarResult.bytes,
      format: avatarResult.format
    });

    // Test 3: Upload de preuve de paiement
    console.log('\n3️⃣ Test upload preuve de paiement...');
    const paymentResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'liveshop/payment-proofs',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    console.log('✅ Preuve de paiement uploadée:', {
      url: paymentResult.secure_url,
      publicId: paymentResult.public_id,
      size: paymentResult.bytes,
      format: paymentResult.format
    });

    // Test 4: Générer des URLs optimisées
    console.log('\n4️⃣ Test génération d\'URLs optimisées...');
    const thumbnailUrl = cloudinary.url(productResult.public_id, {
      width: 200,
      height: 200,
      crop: 'fill'
    });
    
    const optimizedUrl = cloudinary.url(productResult.public_id, {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto'
    });

    console.log('✅ URLs générées:', {
      thumbnail: thumbnailUrl,
      optimized: optimizedUrl
    });

    // Test 5: Supprimer les images de test
    console.log('\n5️⃣ Nettoyage des images de test...');
    await cloudinary.uploader.destroy(productResult.public_id);
    await cloudinary.uploader.destroy(avatarResult.public_id);
    await cloudinary.uploader.destroy(paymentResult.public_id);
    console.log('✅ Images de test supprimées');

    // Nettoyer le fichier temporaire
    fs.unlinkSync(testImagePath);
    console.log('✅ Fichier temporaire supprimé');

    console.log('\n🎉 Tous les tests d\'upload sont passés avec succès !');
    console.log('\n📋 Fonctionnalités testées :');
    console.log('   ✅ Upload d\'images de produits');
    console.log('   ✅ Upload d\'avatars');
    console.log('   ✅ Upload de preuves de paiement');
    console.log('   ✅ Génération d\'URLs optimisées');
    console.log('   ✅ Suppression d\'images');
    console.log('   ✅ Transformations automatiques');

  } catch (error) {
    console.error('❌ Erreur lors du test d\'upload:', error.message);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testUpload()
    .then(() => {
      console.log('\n✅ Test terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { testUpload }; 