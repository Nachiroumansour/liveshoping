#!/usr/bin/env node

/**
 * 🌱 Script de Seeding pour la Production
 * Crée des données initiales sans dupliquer
 */

const { sequelize } = require('../config/database');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log('\n' + '='.repeat(50));
  log(`🌱 ${title}`, 'cyan');
  console.log('='.repeat(50));
};

// Données de démonstration
const demoData = {
  sellers: [
    {
      name: 'Boutique Mode Paris',
      phone_number: '+33123456789',
      email: 'contact@boutiquemode.fr',
      description: 'Boutique de mode parisienne avec des vêtements tendance',
      address: '123 Rue de la Mode, 75001 Paris, France',
      is_verified: true,
      credits: 1000
    },
    {
      name: 'Tech Store Dakar',
      phone_number: '+221777777777',
      email: 'info@techstore.sn',
      description: 'Magasin de technologie et gadgets à Dakar',
      address: '456 Avenue Cheikh Anta Diop, Dakar, Sénégal',
      is_verified: true,
      credits: 1500
    },
    {
      name: 'Artisanat Local',
      phone_number: '+221788888888',
      email: 'contact@artisanat.sn',
      description: 'Artisanat traditionnel sénégalais',
      address: '789 Rue des Artisans, Thiès, Sénégal',
      is_verified: true,
      credits: 800
    }
  ],
  
  products: [
    {
      name: 'Robe Élégante',
      description: 'Robe d\'été élégante en coton, parfaite pour toutes occasions',
      price: 4500,
      stock_quantity: 25,
      category: 'vetements',
      is_active: true,
      is_pinned: true,
      seller_id: 1,
      variants: [
        { name: 'Taille S', price: 4500, stock_quantity: 8, attributes: { size: 'S', color: 'Noir' } },
        { name: 'Taille M', price: 4500, stock_quantity: 10, attributes: { size: 'M', color: 'Noir' } },
        { name: 'Taille L', price: 4500, stock_quantity: 7, attributes: { size: 'L', color: 'Noir' } }
      ]
    },
    {
      name: 'Smartphone Android',
      description: 'Smartphone dernière génération avec appareil photo haute résolution',
      price: 150000,
      stock_quantity: 15,
      category: 'accessoires',
      is_active: true,
      is_pinned: true,
      seller_id: 2,
      variants: [
        { name: '128GB Noir', price: 150000, stock_quantity: 8, attributes: { storage: '128GB', color: 'Noir' } },
        { name: '256GB Bleu', price: 165000, stock_quantity: 7, attributes: { storage: '256GB', color: 'Bleu' } }
      ]
    },
    {
      name: 'Bracelet Artisanal',
      description: 'Bracelet traditionnel sénégalais fait main',
      price: 2500,
      stock_quantity: 50,
      category: 'bijoux',
      is_active: true,
      is_pinned: false,
      seller_id: 3,
      variants: [
        { name: 'Bracelet Simple', price: 2500, stock_quantity: 30, attributes: { type: 'Bracelet', material: 'Cuivre' } },
        { name: 'Bracelet Décoré', price: 3500, stock_quantity: 20, attributes: { type: 'Bracelet', material: 'Cuivre', decoration: 'Oui' } }
      ]
    }
  ]
};

// Fonction pour créer un vendeur
const createSeller = async (sellerData) => {
  try {
    // Vérifier si le vendeur existe déjà par numéro de téléphone
    const existingSeller = await Seller.findOne({
      where: { phone_number: sellerData.phone_number }
    });

    if (existingSeller) {
      log(`✅ Vendeur "${sellerData.name}" existe déjà (ID: ${existingSeller.id})`, 'green');
      return existingSeller;
    }

    // Générer un public_link_id unique manuellement
    const generateId = async () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let id, exists;
      do {
        id = Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join('');
        exists = await Seller.findOne({ where: { public_link_id: id } });
      } while (exists);
      return id;
    };

    const public_link_id = await generateId();

    // Créer le vendeur avec tous les champs requis
    const sellerDataWithDefaults = {
      ...sellerData,
      public_link_id,
      credit_balance: 100,
      role: 'seller',
      is_active: true,
      pin_code: '1234' // Code PIN par défaut pour tous les utilisateurs de test
    };


    const seller = await Seller.create(sellerDataWithDefaults);
    log(`🆕 Vendeur créé: ${seller.name} (ID: ${seller.id}, Link: ${seller.public_link_id})`, 'green');
    return seller;
  } catch (error) {
    log(`❌ Erreur création vendeur "${sellerData.name}": ${error.message}`, 'red');
    throw error;
  }
};

// Fonction pour créer un produit avec ses variantes
const createProduct = async (productData, sellerId) => {
  try {
    // Vérifier si le produit existe déjà
    const existingProduct = await Product.findOne({
      where: { 
        name: productData.name,
        seller_id: sellerId
      }
    });

    if (existingProduct) {
      log(`✅ Produit "${productData.name}" existe déjà (ID: ${existingProduct.id})`, 'green');
      return existingProduct;
    }

    // Extraire les variantes
    const variants = productData.variants || [];
    delete productData.variants;
    delete productData.seller_id;

    // Créer le produit
    const product = await Product.create({
      ...productData,
      seller_id: sellerId
    });

    log(`🆕 Produit créé: ${product.name} (ID: ${product.id})`, 'green');

    // Créer les variantes
    if (variants.length > 0) {
      for (const variantData of variants) {
        await ProductVariant.create({
          ...variantData,
          product_id: product.id
        });
        log(`  └─ Variante: ${variantData.name}`, 'blue');
      }
    }

    return product;
  } catch (error) {
    log(`❌ Erreur création produit "${productData.name}": ${error.message}`, 'red');
    throw error;
  }
};

// Fonction principale de seeding
const seedProduction = async () => {
  try {
    logSection('DÉMARRAGE DU SEEDING PRODUCTION');
    
    // Test de connexion
    log('🔍 Test de connexion à la base de données...', 'yellow');
    await sequelize.authenticate();
    log('✅ Connexion établie avec succès', 'green');

    // Synchroniser les modèles
    log('🔄 Synchronisation des modèles...', 'yellow');
    await sequelize.sync({ alter: true }); // Modifier la structure existante
    log('✅ Modèles synchronisés', 'green');

    // Créer les vendeurs
    logSection('CRÉATION DES VENDEURS');
    const sellers = [];
    for (const sellerData of demoData.sellers) {
      const seller = await createSeller(sellerData);
      sellers.push(seller);
    }

    // Créer les produits
    logSection('CRÉATION DES PRODUITS');
    for (const productData of demoData.products) {
      const seller = sellers.find(s => s.id === productData.seller_id);
      if (seller) {
        await createProduct(productData, seller.id);
      }
    }

    logSection('SEEDING TERMINÉ AVEC SUCCÈS');
    log('🎉 Toutes les données de démonstration ont été créées !', 'green');
    log('📊 Vendeurs créés:', 'cyan');
    sellers.forEach(s => log(`  - ${s.name} (${s.public_link_id})`, 'blue'));
    
    log('\n💡 URLs de test:', 'cyan');
    sellers.forEach(s => log(`  - ${s.public_link_id}: https://livelink.store/${s.public_link_id}`, 'blue'));

  } catch (error) {
    log(`❌ ERREUR CRITIQUE: ${error.message}`, 'red');
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
    log('\n🔌 Connexion fermée', 'yellow');
  }
};

// Exécuter le seeding si le script est appelé directement
if (require.main === module) {
  seedProduction();
}

module.exports = { seedProduction };
