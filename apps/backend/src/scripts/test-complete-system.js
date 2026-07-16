const { sequelize } = require('../config/database');
const { Product, Order } = require('../models');
const { uploadProductImage, uploadPaymentProof, deleteImage } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

async function testCompleteSystem() {
  console.log('🧪 Test complet du système Cloudinary...\n');

  try {
    // 1. Test de configuration
    console.log('1️⃣ Test de configuration...');
    const cloudinary = require('cloudinary').v2;
    const config = cloudinary.config();
    console.log('✅ Configuration Cloudinary:', {
      cloud_name: config.cloud_name,
      api_key: config.api_key ? '✅ Configuré' : '❌ Manquant',
      api_secret: config.api_secret ? '✅ Configuré' : '❌ Manquant'
    });

    // 2. Test de connexion
    console.log('\n2️⃣ Test de connexion...');
    try {
      const result = await cloudinary.api.ping();
      console.log('✅ Connexion Cloudinary:', result);
    } catch (error) {
      console.log('❌ Erreur connexion:', error.message);
    }

    // 3. Créer une image de test
    console.log('\n3️⃣ Création image de test...');
    const testImagePath = path.join(__dirname, 'test-image.svg');
    const svgContent = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#4F46E5"/>
        <circle cx="100" cy="100" r="50" fill="#F59E0B"/>
        <text x="100" y="110" text-anchor="middle" fill="white" font-size="16">TEST</text>
      </svg>
    `;
    fs.writeFileSync(testImagePath, svgContent);
    console.log('✅ Image de test créée');

    // 4. Test upload produit
    console.log('\n4️⃣ Test upload produit...');
    const productUpload = await uploadProductImage.single('image')({
      file: {
        path: testImagePath,
        originalname: 'test-product.svg',
        mimetype: 'image/svg+xml'
      }
    }, {
      json: () => ({ success: true })
    });
    console.log('✅ Upload produit:', productUpload);

    // 5. Test upload preuve de paiement
    console.log('\n5️⃣ Test upload preuve de paiement...');
    const paymentUpload = await uploadPaymentProof.single('image')({
      file: {
        path: testImagePath,
        originalname: 'test-payment.svg',
        mimetype: 'image/svg+xml'
      }
    }, {
      json: () => ({ success: true })
    });
    console.log('✅ Upload preuve de paiement:', paymentUpload);

    // 6. Test création produit avec image Cloudinary
    console.log('\n6️⃣ Test création produit...');
    const testProduct = await Product.create({
      seller_id: 1,
      name: 'Produit Test Cloudinary',
      description: 'Produit de test avec image Cloudinary',
      price: 9999.99,
      category: 'general',
      stock_quantity: 10,
      image_url: productUpload.url,
      image_metadata: JSON.stringify({
        publicId: productUpload.public_id,
        url: productUpload.url,
        format: productUpload.format,
        size: productUpload.bytes
      })
    });
    console.log('✅ Produit créé:', testProduct.id);

    // 7. Test création commande avec preuve de paiement
    console.log('\n7️⃣ Test création commande...');
    const testOrder = await Order.create({
      seller_id: 1,
      product_id: testProduct.id,
      customer_name: 'Client Test',
      customer_phone: '+221777777777',
      customer_address: 'Adresse Test',
      quantity: 1,
      total_price: 9999.99,
      payment_method: 'wave',
      payment_proof_url: paymentUpload.url,
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

    // 9. Test suppression des images de test
    console.log('\n9️⃣ Test suppression des images...');
    if (productUpload.public_id) {
      await deleteImage(productUpload.public_id);
      console.log('✅ Image produit supprimée');
    }
    if (paymentUpload.public_id) {
      await deleteImage(paymentUpload.public_id);
      console.log('✅ Image preuve supprimée');
    }

    // 10. Nettoyage des données de test
    console.log('\n🔟 Nettoyage des données...');
    await testOrder.destroy();
    await testProduct.destroy();
    console.log('✅ Données de test supprimées');

    // 11. Nettoyage du fichier temporaire
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('✅ Fichier temporaire supprimé');
    }

    console.log('\n🎉 Test complet réussi !');
    console.log('\n📊 Résumé :');
    console.log('  ✅ Configuration Cloudinary');
    console.log('  ✅ Connexion API');
    console.log('  ✅ Upload d\'images');
    console.log('  ✅ Stockage en base');
    console.log('  ✅ Récupération des données');
    console.log('  ✅ Suppression d\'images');
    console.log('  ✅ Nettoyage des données');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testCompleteSystem()
    .then(() => {
      console.log('\n✅ Test terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test échoué:', error);
      process.exit(1);
    });
}

module.exports = { testCompleteSystem }; 