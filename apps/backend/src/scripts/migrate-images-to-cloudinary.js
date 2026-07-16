const { Product, Order } = require('../models');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

async function migrateImagesToCloudinary() {
  console.log('🚀 Début de la migration des images vers Cloudinary...');

  try {
    // Migrer les images de produits
    const products = await Product.findAll({
      where: {
        image_url: {
          [require('sequelize').Op.notLike]: '%cloudinary.com%'
        }
      }
    });

    console.log(`📦 ${products.length} produits à migrer`);

    for (const product of products) {
      if (product.image_url && !product.image_url.includes('cloudinary.com')) {
        try {
          // Construire le chemin local
          const imagePath = path.join(__dirname, '../../uploads', product.image_url.split('/uploads/')[1]);
          
          if (fs.existsSync(imagePath)) {
            console.log(`📤 Upload de ${product.name}...`);
            
            // Upload vers Cloudinary
            const result = await cloudinary.uploader.upload(imagePath, {
              folder: 'liveshop/products',
              transformation: [
                { width: 800, height: 800, crop: 'limit', quality: 'auto' },
                { fetch_format: 'auto' }
              ]
            });

            // Mettre à jour le produit
            await product.update({
              image_url: result.secure_url,
              image_metadata: {
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes,
                thumbnailUrl: cloudinary.url(result.public_id, {
                  width: 200,
                  height: 200,
                  crop: 'fill'
                }),
                optimizedUrl: cloudinary.url(result.public_id, {
                  width: 800,
                  height: 800,
                  crop: 'limit',
                  quality: 'auto'
                })
              }
            });

            console.log(`✅ ${product.name} migré avec succès`);
          } else {
            console.log(`⚠️ Image non trouvée pour ${product.name}: ${imagePath}`);
          }
        } catch (error) {
          console.error(`❌ Erreur migration ${product.name}:`, error.message);
        }
      }
    }

    // Migrer les preuves de paiement
    const orders = await Order.findAll({
      where: {
        payment_proof_url: {
          [require('sequelize').Op.notLike]: '%cloudinary.com%',
          [require('sequelize').Op.ne]: null
        }
      }
    });

    console.log(`💳 ${orders.length} preuves de paiement à migrer`);

    for (const order of orders) {
      if (order.payment_proof_url && !order.payment_proof_url.includes('cloudinary.com')) {
        try {
          const imagePath = path.join(__dirname, '../../uploads', order.payment_proof_url.split('/uploads/')[1]);
          
          if (fs.existsSync(imagePath)) {
            console.log(`📤 Upload preuve de paiement ${order.id}...`);
            
            const result = await cloudinary.uploader.upload(imagePath, {
              folder: 'liveshop/payment-proofs',
              transformation: [
                { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
                { fetch_format: 'auto' }
              ]
            });

            await order.update({
              payment_proof_url: result.secure_url
            });

            console.log(`✅ Preuve de paiement ${order.id} migrée`);
          }
        } catch (error) {
          console.error(`❌ Erreur migration preuve ${order.id}:`, error.message);
        }
      }
    }

    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateImagesToCloudinary()
    .then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { migrateImagesToCloudinary }; 