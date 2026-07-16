// Configuration Unsplash API
export const UNSPLASH_CONFIG = {
  // Clé d'accès Unsplash (votre vraie clé)
  ACCESS_KEY: 'qGE6rVEST4XIR2WXtKcVPplsUM4ufwl_1n9YXm7xcXg',
  
  // URL de l'API
  API_URL: 'https://api.unsplash.com',
  
  // Limites par défaut
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 30,
  
  // Catégories prédéfinies avec mots-clés
  CATEGORIES: {
    vetements: {
      name: 'Vêtements',
      keywords: ['clothing', 'fashion', 'style', 'outfit', 'dress', 'shirt', 'pants'],
      icon: '👕'
    },
    bijoux: {
      name: 'Bijoux',
      keywords: ['jewelry', 'accessories', 'necklace', 'ring', 'bracelet', 'earrings'],
      icon: '💍'
    },
    tech: {
      name: 'Technologie',
      keywords: ['technology', 'electronics', 'smartphone', 'laptop', 'computer', 'gadget'],
      icon: '📱'
    },
    alimentation: {
      name: 'Alimentation',
      keywords: ['food', 'drink', 'fresh', 'organic', 'healthy', 'natural'],
      icon: '🍎'
    },
    maison: {
      name: 'Maison',
      keywords: ['home', 'decor', 'furniture', 'kitchen', 'living', 'bedroom'],
      icon: '🏠'
    },
    beaute: {
      name: 'Beauté',
      keywords: ['beauty', 'cosmetics', 'skincare', 'makeup', 'perfume', 'care'],
      icon: '💄'
    },
    sport: {
      name: 'Sport',
      keywords: ['sports', 'fitness', 'exercise', 'athletic', 'training', 'workout'],
      icon: '⚽'
    },
    enfants: {
      name: 'Enfants',
      keywords: ['kids', 'toys', 'children', 'baby', 'play', 'education'],
      icon: '🧸'
    }
  },
  
  // Images de fallback par catégorie
  FALLBACK_IMAGES: {
    vetements: [
      {
        id: 'vet1',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
        alt: 'Vêtements élégants',
        source: 'fallback'
      },
      {
        id: 'vet2',
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
        alt: 'Mode fashion',
        source: 'fallback'
      }
    ],
    tech: [
      {
        id: 'tech1',
        url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200',
        alt: 'Smartphone moderne',
        source: 'fallback'
      },
      {
        id: 'tech2',
        url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
        alt: 'iPhone premium',
        source: 'fallback'
      }
    ],
    default: [
      {
        id: 'default1',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
        thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
        alt: 'Produit générique',
        source: 'fallback'
      }
    ]
  }
};

// Fonction pour obtenir la clé Unsplash
export const getUnsplashAccessKey = () => {
  return UNSPLASH_CONFIG.ACCESS_KEY;
};

// Fonction pour valider la configuration
export const validateUnsplashConfig = () => {
  const accessKey = getUnsplashAccessKey();
  return accessKey && accessKey.length > 0;
};

// Fonction pour obtenir les mots-clés d'une catégorie
export const getCategoryKeywords = (category) => {
  return UNSPLASH_CONFIG.CATEGORIES[category]?.keywords || ['product'];
};

// Fonction pour obtenir les images de fallback
export const getFallbackImages = (category) => {
  return UNSPLASH_CONFIG.FALLBACK_IMAGES[category] || UNSPLASH_CONFIG.FALLBACK_IMAGES.default;
}; 