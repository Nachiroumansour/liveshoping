const { sequelize } = require('../config/database');
const { Seller, Product, Live, LiveProduct } = require('../models');
const bcrypt = require('bcryptjs');

// Données de test
const sellersData = [
  {
    name: "Fatou Diallo",
    phone_number: "+221771234567",
    public_link_id: "fatou123",
    pin_hash: null
  },
  {
    name: "Mamadou Ba",
    phone_number: "+221772345678", 
    public_link_id: "mamadou456",
    pin_hash: null
  },
  {
    name: "Aissatou Diop",
    phone_number: "+221773456789",
    public_link_id: "aissatou789",
    pin_hash: null
  },
  {
    name: "Ousmane Sall",
    phone_number: "+221774567890",
    public_link_id: "ousmane012",
    pin_hash: null
  },
  {
    name: "Mariama Fall",
    phone_number: "+221775678901",
    public_link_id: "mariama345",
    pin_hash: null
  }
];

const productsData = [
  // Produits pour Fatou (Bijoux) - Plus de produits
  {
    name: "Bague en or 18 carats",
    price: 150000,
    description: "Magnifique bague en or 18 carats avec pierre précieuse. Parfaite pour les occasions spéciales.",
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
    stock_quantity: 5,
    is_pinned: true
  },
  {
    name: "Collier en argent avec pendentif",
    price: 45000,
    description: "Élégant collier en argent sterling avec pendentif en forme de cœur.",
    image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
    stock_quantity: 12,
    is_pinned: false
  },
  {
    name: "Bracelet en perles naturelles",
    price: 25000,
    description: "Bracelet artisanal en perles naturelles multicolores.",
    image_url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400",
    stock_quantity: 8,
    is_pinned: false
  },
  {
    name: "Boucles d'oreilles en or jaune",
    price: 75000,
    description: "Boucles d'oreilles élégantes en or jaune 14 carats, design classique.",
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400",
    stock_quantity: 6,
    is_pinned: false
  },
  {
    name: "Chaîne en or avec médaillon",
    price: 95000,
    description: "Chaîne en or 18 carats avec médaillon personnalisable.",
    image_url: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400",
    stock_quantity: 4,
    is_pinned: true
  },
  {
    name: "Bracelet en argent avec charmes",
    price: 35000,
    description: "Bracelet en argent avec charmes amovibles, personnalisable.",
    image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
    stock_quantity: 10,
    is_pinned: false
  },
  {
    name: "Bague de fiançailles diamant",
    price: 250000,
    description: "Bague de fiançailles avec diamant naturel, sertissage solitaire.",
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
    stock_quantity: 2,
    is_pinned: true
  },
  {
    name: "Collier en or avec pierres colorées",
    price: 120000,
    description: "Collier en or avec pierres semi-précieuses colorées.",
    image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
    stock_quantity: 3,
    is_pinned: false
  },

  // Produits pour Mamadou (Vêtements)
  {
    name: "Boubou traditionnel brodé",
    price: 35000,
    description: "Magnifique boubou traditionnel avec broderies dorées. Taille unique.",
    image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
    stock_quantity: 10,
    is_pinned: true
  },
  {
    name: "Turban en soie",
    price: 15000,
    description: "Turban élégant en soie naturelle, disponible en plusieurs couleurs.",
    image_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
    stock_quantity: 20,
    is_pinned: false
  },
  {
    name: "Pagne wax premium",
    price: 12000,
    description: "Pagne wax de qualité premium, motifs traditionnels africains.",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    stock_quantity: 15,
    is_pinned: false
  },

  // Produits pour Aissatou (Cosmétiques)
  {
    name: "Huile de karité pure",
    price: 8000,
    description: "Huile de karité 100% naturelle, hydratante et nourrissante.",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
    stock_quantity: 25,
    is_pinned: true
  },
  {
    name: "Savon noir traditionnel",
    price: 3000,
    description: "Savon noir traditionnel pour le corps et le visage.",
    image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    stock_quantity: 30,
    is_pinned: false
  },
  {
    name: "Masque visage argile",
    price: 5000,
    description: "Masque purifiant à l'argile naturelle.",
    image_url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400",
    stock_quantity: 18,
    is_pinned: false
  },

  // Produits pour Ousmane (Électronique)
  {
    name: "Smartphone Samsung Galaxy A54",
    price: 250000,
    description: "Smartphone Samsung Galaxy A54 128GB, 5G, appareil photo 50MP.",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    stock_quantity: 3,
    is_pinned: true
  },
  {
    name: "Écouteurs sans fil Bluetooth",
    price: 25000,
    description: "Écouteurs sans fil avec réduction de bruit active.",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    stock_quantity: 12,
    is_pinned: false
  },
  {
    name: "Power Bank 20000mAh",
    price: 35000,
    description: "Batterie externe haute capacité pour tous vos appareils.",
    image_url: "https://images.unsplash.com/photo-1609592806598-04d5d2c4f3c8?w=400",
    stock_quantity: 8,
    is_pinned: false
  },

  // Produits pour Mariama (Alimentation)
  {
    name: "Café Touba premium",
    price: 5000,
    description: "Café Touba de qualité premium, torréfié traditionnellement.",
    image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    stock_quantity: 50,
    is_pinned: true
  },
  {
    name: "Miel pur d'acacia",
    price: 8000,
    description: "Miel pur d'acacia, récolté dans les forêts du Sénégal.",
    image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400",
    stock_quantity: 20,
    is_pinned: false
  },
  {
    name: "Attieke frais",
    price: 3000,
    description: "Attieke frais fait maison, parfait pour accompagner vos plats.",
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    stock_quantity: 40,
    is_pinned: false
  }
];

// Fonction pour générer un slug à partir d'un titre
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[ùû]/g, 'u')
    .replace(/[ôö]/g, 'o')
    .replace(/[îï]/g, 'i')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

const livesData = [
  {
    title: "Nouveaux bijoux en or - Collection été",
    slug: "nouveaux-bijoux-en-or-collection-ete",
    date: new Date(Date.now() + 2 * 60 * 60 * 1000), // Dans 2 heures
    sellerId: 1
  },
  {
    title: "Boubous traditionnels - Nouveaux arrivages",
    slug: "boubous-traditionnels-nouveaux-arrivages",
    date: new Date(Date.now() + 4 * 60 * 60 * 1000), // Dans 4 heures
    sellerId: 2
  },
  {
    title: "Soins naturels pour la peau",
    slug: "soins-naturels-pour-la-peau",
    date: new Date(Date.now() + 6 * 60 * 60 * 1000), // Dans 6 heures
    sellerId: 3
  },
  {
    title: "Promo smartphones - Prix cassés",
    slug: "promo-smartphones-prix-casses",
    date: new Date(Date.now() + 1 * 60 * 60 * 1000), // Dans 1 heure
    sellerId: 4
  },
  {
    title: "Produits locaux et bio",
    slug: "produits-locaux-et-bio",
    date: new Date(Date.now() + 3 * 60 * 60 * 1000), // Dans 3 heures
    sellerId: 5
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Début du seeding de la base de données...');

    // Synchroniser la base de données
    await sequelize.sync({ force: true });
    console.log('✅ Base de données synchronisée');

    // Créer les vendeurs
    console.log('👥 Création des vendeurs...');
    const sellers = [];
    for (const sellerData of sellersData) {
      const pin_hash = await bcrypt.hash('1234', 10); // PIN par défaut: 1234
      const seller = await Seller.create({
        ...sellerData,
        pin_hash
      });
      sellers.push(seller);
      console.log(`✅ Vendeur créé: ${seller.name} (ID: ${seller.id})`);
    }

    // Créer les produits
    console.log('📦 Création des produits...');
    const products = [];
    let productIndex = 0;
    
    // Distribution spéciale des produits
    const productDistribution = [
      { sellerIndex: 0, startIndex: 0, count: 8 },  // Fatou: 8 produits (bijoux)
      { sellerIndex: 1, startIndex: 8, count: 3 },  // Mamadou: 3 produits (vêtements)
      { sellerIndex: 2, startIndex: 11, count: 3 }, // Aissatou: 3 produits (cosmétiques)
      { sellerIndex: 3, startIndex: 14, count: 3 }, // Ousmane: 3 produits (électronique)
      { sellerIndex: 4, startIndex: 17, count: 3 }  // Mariama: 3 produits (alimentation)
    ];
    
    for (const distribution of productDistribution) {
      const seller = sellers[distribution.sellerIndex];
      const sellerProducts = productsData.slice(distribution.startIndex, distribution.startIndex + distribution.count);
      
      for (const productData of sellerProducts) {
        const product = await Product.create({
          ...productData,
          seller_id: seller.id
        });
        products.push(product);
        console.log(`✅ Produit créé: ${product.name} pour ${seller.name}`);
        productIndex++;
      }
    }

    // Créer les lives
    console.log('🎥 Création des lives...');
    const lives = [];
    for (const liveData of livesData) {
      const live = await Live.create(liveData);
      lives.push(live);
      console.log(`✅ Live créé: ${live.title} pour le vendeur ${live.sellerId}`);
    }

    // Associer des produits aux lives
    console.log('🔗 Association des produits aux lives...');
    for (let i = 0; i < lives.length; i++) {
      const live = lives[i];
      const sellerProducts = products.filter(p => p.seller_id === live.sellerId);
      
      // Associer les 2 premiers produits du vendeur au live
      for (let j = 0; j < Math.min(2, sellerProducts.length); j++) {
        await LiveProduct.create({
          liveId: live.id,
          productId: sellerProducts[j].id
        });
        console.log(`✅ Produit ${sellerProducts[j].name} associé au live ${live.title}`);
      }
    }

    console.log('\n🎉 Seeding terminé avec succès !');
    console.log('\n📊 Résumé :');
    console.log(`- ${sellers.length} vendeurs créés`);
    console.log(`- ${products.length} produits créés`);
    console.log(`- ${lives.length} lives créés`);
    
    console.log('\n🔑 Informations de connexion :');
    console.log('PIN par défaut pour tous les vendeurs : 1234');
    console.log('\n📱 Numéros de téléphone des vendeurs :');
    sellers.forEach(seller => {
      console.log(`- ${seller.name}: ${seller.phone_number} (ID: ${seller.public_link_id})`);
    });

    console.log('\n🌐 Liens publics des boutiques :');
    sellers.forEach(seller => {
      console.log(`- ${seller.name}: http://localhost:3000/${seller.public_link_id}`);
    });

    console.log('\n🎥 Liens des lives :');
    lives.forEach(live => {
      const seller = sellers.find(s => s.id === live.sellerId);
      console.log(`- ${live.title}: http://localhost:3000/${seller.public_link_id}/live/${live.id}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Connexion à la base de données fermée');
  }
}

// Exécuter le seeding
seedDatabase(); 