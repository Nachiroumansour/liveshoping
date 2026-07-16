import { UNSPLASH_CONFIG, getUnsplashAccessKey } from '../config/unsplash';

// Service pour la librairie d'images intelligente
class ImageLibraryService {
  constructor() {
    // Unsplash API avec votre vraie clé
    this.UNSPLASH_ACCESS_KEY = getUnsplashAccessKey();
    this.UNSPLASH_API_URL = UNSPLASH_CONFIG.API_URL;
    
    // Catégories prédéfinies
    this.categories = UNSPLASH_CONFIG.CATEGORIES;
  }

  // Rechercher des images par terme
  async searchImages(query, page = 1, perPage = 20) {
    try {
      console.log('🔍 Recherche Unsplash:', query);
      console.log('🔑 Clé API:', this.UNSPLASH_ACCESS_KEY);
      console.log('🌐 URL API:', this.UNSPLASH_API_URL);
      
      const url = `${this.UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
      console.log('📡 URL complète:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`
        }
      });

      console.log('📡 Status response:', response.status);
      console.log('📡 Headers response:', response.headers);

      if (!response.ok) {
        throw new Error(`Erreur API Unsplash: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Données brutes Unsplash:', data);
      console.log('✅ Résultats Unsplash:', data.results.length, 'images');
      
      if (data.results.length > 0) {
        console.log('📸 Premier résultat:', data.results[0]);
        console.log('📸 URLs du premier résultat:', data.results[0].urls);
      }
      
      return this.formatUnsplashImages(data.results);
    } catch (error) {
      console.error('❌ Erreur recherche images:', error);
      return this.getFallbackImages(query);
    }
  }

  // Obtenir des suggestions basées sur le nom du produit
  async getProductSuggestions(productName) {
    const suggestions = [];
    
    // Analyser le nom du produit pour extraire des mots-clés
    const keywords = this.extractKeywords(productName);
    
    for (const keyword of keywords) {
      const images = await this.searchImages(keyword, 1, 5);
      suggestions.push(...images);
    }
    
    return suggestions.slice(0, 10); // Max 10 suggestions
  }

  // Extraire des mots-clés du nom du produit
  extractKeywords(productName) {
    const words = productName.toLowerCase().split(/\s+/);
    const keywords = [];
    
    // Mots-clés importants à rechercher
    const importantWords = words.filter(word => 
      word.length > 2 && 
      !['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'avec', 'pour', 'sur', 'dans'].includes(word)
    );
    
    return importantWords.slice(0, 3); // Max 3 mots-clés
  }

  // Obtenir des images par catégorie
  async getImagesByCategory(category, page = 1) {
    const categoryKeywords = this.categories[category] || ['product'];
    const query = categoryKeywords[0];
    
    return await this.searchImages(query, page, 20);
  }

  // Formater les images Unsplash
  formatUnsplashImages(images) {
    console.log('🔄 Formatage des images Unsplash:', images.length, 'images');
    
    const formattedImages = images.map((image, index) => {
      // Améliorer les URLs avec des paramètres optimaux
      const baseUrl = image.urls.regular;
      const thumbnailUrl = image.urls.thumb;
      
      // Ajouter des paramètres pour optimiser l'affichage
      const optimizedUrl = `${baseUrl}?w=800&h=600&fit=crop&crop=center&q=80`;
      const optimizedThumbnail = `${thumbnailUrl}?w=400&h=300&fit=crop&crop=center&q=80`;
      
      const formatted = {
        id: image.id,
        url: optimizedUrl,
        thumbnail: optimizedThumbnail,
        full: image.urls.full,
        alt: image.alt_description || 'Image de produit',
        photographer: image.user?.name || 'Photographe',
        photographerUrl: image.user?.links?.html || '#',
        width: image.width,
        height: image.height,
        source: 'unsplash',
        free: true
      };
      
      console.log(`📸 Image ${index + 1}:`, {
        id: formatted.id,
        url: formatted.url,
        thumbnail: formatted.thumbnail,
        alt: formatted.alt
      });
      
      return formatted;
    });
    
    console.log('✅ Images formatées:', formattedImages.length);
    return formattedImages;
  }

  // Images de fallback (si API indisponible)
  getFallbackImages(query) {
    const fallbackImages = {
      'phone': [
        { id: 'phone1', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200', alt: 'Smartphone', source: 'fallback' },
        { id: 'phone2', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200', alt: 'iPhone', source: 'fallback' }
      ],
      'vetement': [
        { id: 'vet1', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200', alt: 'Vêtement', source: 'fallback' },
        { id: 'vet2', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200', alt: 'Mode', source: 'fallback' }
      ],
      'default': [
        { id: 'default1', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200', alt: 'Produit', source: 'fallback' }
      ]
    };

    const category = Object.keys(fallbackImages).find(key => 
      query.toLowerCase().includes(key)
    ) || 'default';

    return fallbackImages[category];
  }

  // Obtenir des images populaires
  async getPopularImages() {
    try {
      console.log('📸 Récupération images populaires...');
      
      const response = await fetch(
        `${this.UNSPLASH_API_URL}/photos?order_by=popularity&per_page=20`,
        {
          headers: {
            'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur API Unsplash: ${response.status}`);
      }

      const images = await response.json();
      console.log('✅ Images populaires récupérées:', images.length);
      
      return this.formatUnsplashImages(images);
    } catch (error) {
      console.error('❌ Erreur images populaires:', error);
      return this.getFallbackImages('default');
    }
  }

  // Sauvegarder une image en favori (localStorage)
  saveToFavorites(image) {
    const favorites = this.getFavorites();
    if (!favorites.find(fav => fav.id === image.id)) {
      favorites.push(image);
      localStorage.setItem('imageLibrary_favorites', JSON.stringify(favorites));
    }
  }

  // Obtenir les favoris
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('imageLibrary_favorites') || '[]');
    } catch {
      return [];
    }
  }

  // Supprimer des favoris
  removeFromFavorites(imageId) {
    const favorites = this.getFavorites();
    const updatedFavorites = favorites.filter(fav => fav.id !== imageId);
    localStorage.setItem('imageLibrary_favorites', JSON.stringify(updatedFavorites));
  }

  // Sauvegarder dans l'historique
  saveToHistory(image) {
    const history = this.getHistory();
    const updatedHistory = [image, ...history.filter(h => h.id !== image.id)].slice(0, 20);
    localStorage.setItem('imageLibrary_history', JSON.stringify(updatedHistory));
  }

  // Obtenir l'historique
  getHistory() {
    try {
      return JSON.parse(localStorage.getItem('imageLibrary_history') || '[]');
    } catch {
      return [];
    }
  }
}

export const imageLibraryService = new ImageLibraryService(); 