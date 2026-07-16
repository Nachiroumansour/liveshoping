const { sequelize } = require('../config/database');
const { Seller, Product } = require('../models');
const crypto = require('crypto');

async function createMansourUser() {
  try {
    console.log('👤 Création du vendeur Mansour avec produits...');

    // Générer un link_id unique
    const linkId = crypto.randomBytes(4).toString('hex');

    // Créer le vendeur Mansour
    const mansour = await Seller.create({
      name: 'Mansour',
      phone_number: '+221777777777',
      public_link_id: linkId,
      is_active: true,
      credits: 1000,
      role: 'seller'
    });

    console.log(`✅ Vendeur Mansour créé avec succès!`);
    console.log(`📱 Link ID: ${linkId}`);
    console.log(`🔗 Lien public: http://localhost:5173/${linkId}`);

    // Créer des produits pour Mansour
    const products = [
      {
        name: 'iPhone 15 Pro Max',
        price: 850000,
        description: 'iPhone 15 Pro Max 256GB, couleur titane naturel. État neuf, garantie Apple.',
        image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        stock_quantity: 3,
        is_pinned: true,
        seller_id: mansour.id
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        price: 750000,
        description: 'Samsung Galaxy S24 Ultra 512GB, couleur noir. Avec S Pen incluse.',
        image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
        stock_quantity: 5,
        is_pinned: false,
        seller_id: mansour.id
      },
      {
        name: 'MacBook Air M3',
        price: 1200000,
        description: 'MacBook Air M3 13 pouces, 8GB RAM, 256GB SSD. Parfait pour le travail.',
        image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
        stock_quantity: 2,
        is_pinned: true,
        seller_id: mansour.id
      },
      {
        name: 'AirPods Pro 2',
        price: 180000,
        description: 'AirPods Pro 2ème génération avec réduction de bruit active.',
        image_url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
        stock_quantity: 8,
        is_pinned: false,
        seller_id: mansour.id
      },
      {
        name: 'iPad Air 5',
        price: 450000,
        description: 'iPad Air 5ème génération, 64GB, WiFi + Cellular.',
        image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        stock_quantity: 4,
        is_pinned: false,
        seller_id: mansour.id
      },
      {
        name: 'Apple Watch Series 9',
        price: 320000,
        description: 'Apple Watch Series 9, 45mm, GPS + Cellular.',
        image_url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
        stock_quantity: 6,
        is_pinned: true,
        seller_id: mansour.id
      },
      {
        name: 'Sony WH-1000XM5',
        price: 280000,
        description: 'Casque Sony WH-1000XM5 avec réduction de bruit exceptionnelle.',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        stock_quantity: 7,
        is_pinned: false,
        seller_id: mansour.id
      },
      {
        name: 'DJI Mini 3 Pro',
        price: 650000,
        description: 'Drone DJI Mini 3 Pro avec caméra 4K et transmission O3.',
        image_url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400',
        stock_quantity: 2,
        is_pinned: true,
        seller_id: mansour.id
      }
    ];

    // Créer tous les produits
    const createdProducts = await Product.bulkCreate(products);

    console.log(`✅ ${createdProducts.length} produits créés avec succès!`);
    console.log('\n📋 Liste des produits créés:');
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ${product.price.toLocaleString()} FCFA`);
    });

    console.log('\n🎯 Prochaines étapes:');
    console.log(`1. Connectez-vous à l'app vendeur: http://localhost:5174/`);
    console.log(`2. Créez un nouveau live`);
    console.log(`3. Associez les produits au live`);
    console.log(`4. Testez le lien public: http://localhost:5173/${linkId}/live/[slug-du-live]`);

    await sequelize.close();
    console.log('\n✅ Script terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await sequelize.close();
  }
}

createMansourUser(); 