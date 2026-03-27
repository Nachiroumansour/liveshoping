// Configuration des catégories de produits avec leurs attributs spécifiques
const productCategories = {
  general: {
    name: 'Général',
    description: 'Produits généraux',
    attributes: []
  },
  vetements: {
    name: 'Vêtements',
    description: 'Habits et vêtements',
    attributes: [
      {
        name: 'size',
        label: 'Taille',
        type: 'select',
        required: true,
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
      },
      {
        name: 'color',
        label: 'Couleur',
        type: 'select',
        required: true,
        options: ['Rouge', 'Bleu', 'Vert', 'Noir', 'Blanc', 'Jaune', 'Orange', 'Violet', 'Rose', 'Gris', 'Marron']
      },
      {
        name: 'material',
        label: 'Matériau',
        type: 'text',
        required: false
      },
      {
        name: 'gender',
        label: 'Genre',
        type: 'select',
        required: true,
        options: ['Homme', 'Femme', 'Unisexe', 'Enfant']
      }
    ]
  },
  tissus: {
    name: 'Tissus',
    description: 'Tissus et étoffes',
    attributes: [
      {
        name: 'length',
        label: 'Longueur (mètres)',
        type: 'number',
        required: true,
        unit: 'm'
      },
      {
        name: 'width',
        label: 'Largeur (cm)',
        type: 'number',
        required: true,
        unit: 'cm'
      },
      {
        name: 'material',
        label: 'Type de tissu',
        type: 'select',
        required: true,
        options: ['Coton', 'Soie', 'Laine', 'Polyester', 'Lin', 'Velours', 'Denim', 'Satin', 'Crêpe']
      },
      {
        name: 'pattern',
        label: 'Motif',
        type: 'select',
        required: false,
        options: ['Uni', 'Rayé', 'À pois', 'Fleuré', 'Géométrique', 'Abstrait', 'Animaux']
      },
      {
        name: 'color',
        label: 'Couleur',
        type: 'text',
        required: true
      }
    ]
  },
  bijoux: {
    name: 'Bijoux',
    description: 'Bijoux et accessoires',
    attributes: [
      {
        name: 'material',
        label: 'Matériau',
        type: 'select',
        required: true,
        options: ['Or', 'Argent', 'Platine', 'Acier', 'Cuivre', 'Laiton', 'Plastique', 'Bois', 'Pierre']
      },
      {
        name: 'weight',
        label: 'Poids (grammes)',
        type: 'number',
        required: false,
        unit: 'g'
      },
      {
        name: 'size',
        label: 'Taille',
        type: 'text',
        required: false
      },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: ['Bague', 'Collier', 'Bracelet', 'Boucles d\'oreilles', 'Montre', 'Chaîne', 'Pendentif']
      }
    ]
  },
  alimentation: {
    name: 'Alimentation',
    description: 'Produits alimentaires',
    attributes: [
      {
        name: 'weight',
        label: 'Poids',
        type: 'number',
        required: true,
        unit: 'kg'
      },
      {
        name: 'expiry_date',
        label: 'Date d\'expiration',
        type: 'date',
        required: false
      },
      {
        name: 'origin',
        label: 'Origine',
        type: 'text',
        required: false
      },
      {
        name: 'storage',
        label: 'Conservation',
        type: 'select',
        required: false,
        options: ['Ambiance', 'Réfrigérateur', 'Congélateur', 'Sec']
      }
    ]
  },
  services: {
    name: 'Services',
    description: 'Services et prestations',
    attributes: [
      {
        name: 'duration',
        label: 'Durée',
        type: 'text',
        required: false
      },
      {
        name: 'location',
        label: 'Lieu',
        type: 'text',
        required: false
      },
      {
        name: 'type',
        label: 'Type de service',
        type: 'select',
        required: true,
        options: ['Coiffure', 'Manucure', 'Massage', 'Cours', 'Réparation', 'Transport', 'Nettoyage', 'Consultation']
      }
    ]
  },
  accessoires: {
    name: 'Accessoires',
    description: 'Accessoires divers',
    attributes: [
      {
        name: 'color',
        label: 'Couleur',
        type: 'text',
        required: false
      },
      {
        name: 'material',
        label: 'Matériau',
        type: 'text',
        required: false
      },
      {
        name: 'size',
        label: 'Taille',
        type: 'text',
        required: false
      }
    ]
  },
  chaussures: {
    name: 'Chaussures',
    description: 'Chaussures et chaussons',
    attributes: [
      {
        name: 'size',
        label: 'Pointure',
        type: 'select',
        required: true,
        options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47']
      },
      {
        name: 'color',
        label: 'Couleur',
        type: 'text',
        required: true
      },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: true,
        options: ['Sneakers', 'Baskets', 'Tongs', 'Sandales', 'Bottes', 'Escarpins', 'Mocassins', 'Chaussons']
      },
      {
        name: 'material',
        label: 'Matériau',
        type: 'text',
        required: false
      }
    ]
  },
  cosmetiques: {
    name: 'Cosmétiques',
    description: 'Produits de beauté',
    attributes: [
      {
        name: 'volume',
        label: 'Volume',
        type: 'text',
        required: false
      },
      {
        name: 'skin_type',
        label: 'Type de peau',
        type: 'select',
        required: false,
        options: ['Normale', 'Sèche', 'Grasse', 'Mixte', 'Sensible']
      },
      {
        name: 'brand',
        label: 'Marque',
        type: 'text',
        required: false
      },
      {
        name: 'expiry_date',
        label: 'Date d\'expiration',
        type: 'date',
        required: false
      }
    ]
  },
  maison: {
    name: 'Maison',
    description: 'Articles de maison',
    attributes: [
      {
        name: 'dimensions',
        label: 'Dimensions',
        type: 'text',
        required: false
      },
      {
        name: 'material',
        label: 'Matériau',
        type: 'text',
        required: false
      },
      {
        name: 'color',
        label: 'Couleur',
        type: 'text',
        required: false
      },
      {
        name: 'room',
        label: 'Pièce',
        type: 'select',
        required: false,
        options: ['Salon', 'Cuisine', 'Chambre', 'Salle de bain', 'Bureau', 'Jardin', 'Balcon']
      }
    ]
  },
  electronique: {
    name: 'Électronique',
    description: 'Appareils électroniques et gadgets',
    attributes: [
      {
        name: 'brand',
        label: 'Marque',
        type: 'text',
        required: false
      },
      {
        name: 'condition',
        label: 'État',
        type: 'select',
        required: false,
        options: ['Neuf', 'Reconditionné', 'Occasion']
      },
      {
        name: 'warranty',
        label: 'Garantie',
        type: 'text',
        required: false
      }
    ]
  },
  telephones: {
    name: 'Téléphones & Tablettes',
    description: 'Smartphones, tablettes et accessoires',
    attributes: [
      {
        name: 'brand',
        label: 'Marque',
        type: 'select',
        required: false,
        options: ['Samsung', 'iPhone', 'Xiaomi', 'Tecno', 'Infinix', 'Huawei', 'Oppo', 'Realme', 'Autre']
      },
      {
        name: 'storage',
        label: 'Stockage',
        type: 'select',
        required: false,
        options: ['16 Go', '32 Go', '64 Go', '128 Go', '256 Go', '512 Go', '1 To']
      },
      {
        name: 'condition',
        label: 'État',
        type: 'select',
        required: false,
        options: ['Neuf', 'Reconditionné', 'Occasion']
      },
      {
        name: 'color',
        label: 'Couleur',
        type: 'text',
        required: false
      }
    ]
  },
  sacs: {
    name: 'Sacs & Bagages',
    description: 'Sacs à main, valises et bagages',
    attributes: [
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: false,
        options: ['Sac à main', 'Sac à dos', 'Pochette', 'Valise', 'Sacoche', 'Cabas', 'Besace', 'Trousse']
      },
      {
        name: 'material',
        label: 'Matériau',
        type: 'select',
        required: false,
        options: ['Cuir', 'Simili cuir', 'Tissu', 'Toile', 'Nylon', 'Plastique']
      },
      {
        name: 'color',
        label: 'Couleur',
        type: 'text',
        required: false
      }
    ]
  },
  parfums: {
    name: 'Parfums',
    description: 'Parfums et eaux de toilette',
    attributes: [
      {
        name: 'volume',
        label: 'Volume (ml)',
        type: 'text',
        required: false
      },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: false,
        options: ['Eau de parfum', 'Eau de toilette', 'Brume', 'Huile parfumée', 'Encens', 'Thiouraye']
      },
      {
        name: 'gender',
        label: 'Genre',
        type: 'select',
        required: false,
        options: ['Homme', 'Femme', 'Unisexe']
      }
    ]
  },
  sport: {
    name: 'Sport & Fitness',
    description: 'Équipements et vêtements de sport',
    attributes: [
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: false,
        options: ['Vêtement sport', 'Équipement', 'Chaussure sport', 'Accessoire', 'Nutrition sportive']
      },
      {
        name: 'size',
        label: 'Taille',
        type: 'select',
        required: false,
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique']
      }
    ]
  },
  bebe: {
    name: 'Bébé & Enfants',
    description: 'Articles pour bébés et enfants',
    attributes: [
      {
        name: 'age_range',
        label: 'Tranche d\'âge',
        type: 'select',
        required: false,
        options: ['0-3 mois', '3-6 mois', '6-12 mois', '1-2 ans', '2-4 ans', '4-8 ans', '8-12 ans']
      },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: false,
        options: ['Vêtement', 'Jouet', 'Puériculture', 'Couches', 'Alimentation', 'Accessoire']
      },
      {
        name: 'gender',
        label: 'Genre',
        type: 'select',
        required: false,
        options: ['Garçon', 'Fille', 'Mixte']
      }
    ]
  },
  auto: {
    name: 'Auto & Moto',
    description: 'Pièces et accessoires véhicules',
    attributes: [
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: false,
        options: ['Pièce détachée', 'Accessoire', 'Huile & Lubrifiant', 'Pneu', 'Entretien', 'Décoration']
      },
      {
        name: 'vehicle',
        label: 'Véhicule',
        type: 'select',
        required: false,
        options: ['Voiture', 'Moto', 'Scooter', 'Camion', 'Universel']
      }
    ]
  },
  artisanat: {
    name: 'Artisanat',
    description: 'Produits artisanaux et fait main',
    attributes: [
      {
        name: 'technique',
        label: 'Technique',
        type: 'select',
        required: false,
        options: ['Couture', 'Crochet', 'Tricot', 'Poterie', 'Vannerie', 'Sculpture', 'Peinture', 'Broderie', 'Teinture']
      },
      {
        name: 'material',
        label: 'Matériau',
        type: 'text',
        required: false
      },
      {
        name: 'origin',
        label: 'Origine',
        type: 'text',
        required: false
      }
    ]
  },
  informatique: {
    name: 'Informatique',
    description: 'Ordinateurs et accessoires informatiques',
    attributes: [
      {
        name: 'brand',
        label: 'Marque',
        type: 'text',
        required: false
      },
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: false,
        options: ['Ordinateur portable', 'Ordinateur bureau', 'Écran', 'Clavier', 'Souris', 'Imprimante', 'Câble', 'Disque dur', 'Clé USB', 'Autre']
      },
      {
        name: 'condition',
        label: 'État',
        type: 'select',
        required: false,
        options: ['Neuf', 'Reconditionné', 'Occasion']
      }
    ]
  },
  decoration: {
    name: 'Décoration',
    description: 'Articles de décoration intérieure',
    attributes: [
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        required: false,
        options: ['Tableau', 'Cadre', 'Vase', 'Coussin', 'Tapis', 'Rideau', 'Miroir', 'Bougie', 'Plante artificielle', 'Autre']
      },
      {
        name: 'color',
        label: 'Couleur',
        type: 'text',
        required: false
      },
      {
        name: 'dimensions',
        label: 'Dimensions',
        type: 'text',
        required: false
      }
    ]
  }
};

// Fonction pour obtenir les attributs d'une catégorie
const getCategoryAttributes = (category) => {
  return productCategories[category]?.attributes || [];
};

// Fonction pour obtenir toutes les catégories
const getAllCategories = () => {
  return Object.keys(productCategories).map(key => ({
    id: key,
    ...productCategories[key]
  }));
};

// Fonction pour valider les attributs d'un produit
const validateProductAttributes = (category, attributes) => {
  // Tous les attributs sont optionnels pour plus de flexibilité
  return [];
};

module.exports = {
  productCategories,
  getCategoryAttributes,
  getAllCategories,
  validateProductAttributes
}; 