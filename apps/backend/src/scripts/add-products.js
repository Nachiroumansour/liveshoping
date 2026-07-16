const { sequelize } = require('../config/database');
const { Seller, Product } = require('../models');

// Produits supplémentaires pour Fatou Diallo (bijoux)
const additionalProducts = [
  {
    name: "Bague cocktail avec saphirs",
    price: 180000,
    description: "Bague cocktail élégante avec saphirs bleus et diamants, parfaite pour les soirées.",
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
    stock_quantity: 3,
    is_pinned: false
  },
  {
    name: "Collier en or blanc avec perles",
    price: 85000,
    description: "Collier en or blanc avec perles d'eau douce, design sophistiqué.",
    image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
    stock_quantity: 7,
    is_pinned: false
  },
  {
    name: "Bracelet en or avec rubis",
    price: 95000,
    description: "Bracelet en or 18 carats avec rubis naturels, élégant et précieux.",
    image_url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400",
    stock_quantity: 4,
    is_pinned: true
  },
  {
    name: "Boucles d'oreilles en argent avec turquoise",
    price: 28000,
    description: "Boucles d'oreilles en argent avec pierres turquoise naturelles.",
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400",
    stock_quantity: 9,
    is_pinned: false
  },
  {
    name: "Chaîne en or avec pendentif émeraude",
    price: 140000,
    description: "Chaîne en or avec pendentif émeraude naturelle, très rare.",
    image_url: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400",
    stock_quantity: 2,
    is_pinned: true
  },
  {
    name: "Bague de mariage en platine",
    price: 320000,
    description: "Bague de mariage en platine avec diamants, design intemporel.",
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
    stock_quantity: 1,
    is_pinned: true
  },
  {
    name: "Collier en or avec améthyste",
    price: 65000,
    description: "Collier en or avec améthyste violette, pierre de protection.",
    image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
    stock_quantity: 5,
    is_pinned: false
  },
  {
    name: "Bracelet en or avec grenats",
    price: 78000,
    description: "Bracelet en or avec grenats rouges, pierre de passion.",
    image_url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400",
    stock_quantity: 6,
    is_pinned: false
  },
  // --- NOUVEAUX PRODUITS VÊTEMENTS ET CHAUSSURES ---
  {
    name: "Robe longue en wax africain",
    price: 35000,
    description: "Robe élégante en tissu wax, motifs traditionnels, taille S à XL.",
    image_url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400",
    stock_quantity: 7,
    is_pinned: false
  },
  {
    name: "Chemise blanche coton premium",
    price: 18000,
    description: "Chemise blanche classique, coton doux, coupe moderne.",
    image_url: "https://images.unsplash.com/photo-1526178613658-3f1622045557?w=400",
    stock_quantity: 10,
    is_pinned: false
  },
  {
    name: "Boubou femme brodé",
    price: 40000,
    description: "Boubou traditionnel brodé main, plusieurs coloris.",
    image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400",
    stock_quantity: 5,
    is_pinned: true
  },
  {
    name: "Sandales en cuir artisanal",
    price: 15000,
    description: "Sandales plates en cuir véritable, fabrication artisanale du Sénégal.",
    image_url: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400",
    stock_quantity: 12,
    is_pinned: false
  },
  {
    name: "Baskets tendance femme",
    price: 28000,
    description: "Baskets mode, semelle épaisse, confort et style.",
    image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
    stock_quantity: 8,
    is_pinned: false
  },
  {
    name: "Escarpins noirs élégants",
    price: 32000,
    description: "Escarpins noirs à talon, parfaits pour les cérémonies.",
    image_url: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400",
    stock_quantity: 6,
    is_pinned: true
  }
];

async function addProducts() {
  try {
    console.log('📦 Ajout de produits supplémentaires...');

    // Trouver Fatou Diallo
    const fatou = await Seller.findOne({
      where: { phone_number: '+221771234567' }
    });

    if (!fatou) {
      console.log('❌ Vendeur Fatou Diallo non trouvé. Assurez-vous que le seeding a été effectué.');
      return;
    }

    console.log(`✅ Vendeur trouvé: ${fatou.name} (ID: ${fatou.id})`);

    // Ajouter les produits
    const createdProducts = [];
    for (const productData of additionalProducts) {
      const product = await Product.create({
        ...productData,
        seller_id: fatou.id
      });
      createdProducts.push(product);
      console.log(`✅ Produit ajouté: ${product.name} - ${product.price} FCFA`);
    }

    console.log('\n🎉 Produits ajoutés avec succès !');
    console.log(`📊 ${createdProducts.length} nouveaux produits ajoutés pour ${fatou.name}`);
    
    // Afficher le total des produits
    const totalProducts = await Product.count({
      where: { seller_id: fatou.id }
    });
    console.log(`📦 Total des produits pour ${fatou.name}: ${totalProducts}`);

    console.log('\n💰 Produits ajoutés:');
    createdProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.price.toLocaleString()} FCFA (Stock: ${product.stock_quantity})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des produits:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Connexion à la base de données fermée');
  }
}

// Exécuter l'ajout de produits
addProducts(); 