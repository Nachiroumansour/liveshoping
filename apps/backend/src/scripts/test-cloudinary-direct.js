require('dotenv').config();
const { sequelize } = require('../config/database');
const { Product, Order } = require('../models');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinaryDirect() {
  console.log('🧪 Test direct Cloudinary...\n');

  try {
    // 1. Test de configuration
    console.log('1️⃣ Test de configuration...');
    const config = cloudinary.config();
    console.log('✅ Configuration Cloudinary:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? '✅ Configuré' : '❌ Manquant',
      api_secret: config.api_secret ? '✅ Configuré' : '❌ Manquant'
    });

    // 2. Test de connexion
    console.log('\n2️⃣ Test de connexion...');
    const pingResult = await cloudinary.api.ping();
    console.log('✅ Connexion Cloudinary:', pingResult);

    // 3. Créer une image de test
    console.log('\n3️⃣ Création image de test...');
    const testImagePath = path.join(__dirname, 'test-image-direct.svg');
    const svgContent = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#4F46E5"/>
        <circle cx="100" cy="100" r="50" fill="#F59E0B"/>
        <text x="100" y="110" text-anchor="middle" fill="white" font-size="16">TEST</text>
      </svg>
    `;
    fs.writeFileSync(testImagePath, svgContent);
    console.log('✅ Image de test créée');

    // 4. Test upload direct produit
    console.log('\n4️⃣ Test upload direct produit...');
    const productUploadResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'products',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    console.log('✅ Upload produit réussi:', {
      public_id: productUploadResult.public_id,
      url: productUploadResult.secure_url,
      format: productUploadResult.format,
      size: productUploadResult.bytes
    });

    // 5. Test upload direct preuve de paiement
    console.log('\n5️⃣ Test upload direct preuve de paiement...');
    const paymentUploadResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'payment-proofs',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    console.log('✅ Upload preuve de paiement réussi:', {
      public_id: paymentUploadResult.public_id,
      url: paymentUploadResult.secure_url,
      format: paymentUploadResult.format,
      size: paymentUploadResult.bytes
    });

    // 6. Test création produit avec image Cloudinary
    console.log('\n6️⃣ Test création produit...');
    const testProduct = await Product.create({
      seller_id: 1,
      name: 'Produit Test Cloudinary Direct',
      description: 'Produit de test avec image Cloudinary (upload direct)',
      price: 8888.88,
      category: 'general',
      stock_quantity: 5,
      image_url: productUploadResult.secure_url,
      image_metadata: JSON.stringify({
        publicId: productUploadResult.public_id,
        url: productUploadResult.secure_url,
        format: productUploadResult.format,
        size: productUploadResult.bytes,
        width: productUploadResult.width,
        height: productUploadResult.height
      })
    });
    console.log('✅ Produit créé:', testProduct.id);

    // 7. Test création commande avec preuve de paiement
    console.log('\n7️⃣ Test création commande...');
    const testOrder = await Order.create({
      seller_id: 1,
      product_id: testProduct.id,
      customer_name: 'Client Test Direct',
      customer_phone: '+221777777777',
      customer_address: 'Adresse Test Direct',
      quantity: 2,
      total_price: 17777.76,
      payment_method: 'orange_money',
      payment_proof_url: paymentUploadResult.secure_url,
      status: 'pending'
    });
    console.log('✅ Commande créée:', testOrder.id);

    // 8. Test récupération des données
    console.log('\n8️⃣ Test récupération des données...');
    const productWithImage = await Product.findByPk(testProduct.id);
    const orderWithProof = await Order.findByPk(testOrder.id);
    
    console.log('✅ Produit avec image:', {
      id: productWithImage.id,
      name: productWithImage.name,
      image_url: productWithImage.image_url,
      has_metadata: !!productWithImage.image_metadata
    });
    
    console.log('✅ Commande avec preuve:', {
      id: orderWithProof.id,
      payment_proof_url: orderWithProof.payment_proof_url
    });

    // 9. Test génération d'URLs optimisées
    console.log('\n9️⃣ Test génération URLs optimisées...');
    const thumbnailUrl = cloudinary.url(productUploadResult.public_id, {
      transformation: [
        { width: 200, height: 200, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    const optimizedUrl = cloudinary.url(productUploadResult.public_id, {
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    console.log('✅ URLs générées:', {
      thumbnail: thumbnailUrl,
      optimized: optimizedUrl
    });

    // 10. Test suppression des images de test
    console.log('\n🔟 Test suppression des images...');
    await cloudinary.uploader.destroy(productUploadResult.public_id);
    console.log('✅ Image produit supprimée');
    await cloudinary.uploader.destroy(paymentUploadResult.public_id);
    console.log('✅ Image preuve supprimée');

    // 11. Nettoyage des données de test
    console.log('\n1️⃣1️⃣ Nettoyage des données...');
    await testOrder.destroy();
    await testProduct.destroy();
    console.log('✅ Données de test supprimées');

    // 12. Nettoyage du fichier temporaire
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('✅ Fichier temporaire supprimé');
    }

    console.log('\n🎉 Test direct réussi !');
    console.log('\n📊 Résumé :');
    console.log('  ✅ Configuration Cloudinary');
    console.log('  ✅ Connexion API');
    console.log('  ✅ Upload direct d\'images');
    console.log('  ✅ Stockage en base');
    console.log('  ✅ Récupération des données');
    console.log('  ✅ Génération URLs optimisées');
    console.log('  ✅ Suppression d\'images');
    console.log('  ✅ Nettoyage des données');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testCloudinaryDirect()
    .then(() => {
      console.log('\n✅ Test direct terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test direct échoué:', error);
      process.exit(1);
    });
}

module.exports = { testCloudinaryDirect }; 