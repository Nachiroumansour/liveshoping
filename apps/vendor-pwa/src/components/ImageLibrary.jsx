import React, { useState, useEffect } from 'react';
import { Search, Heart, Clock, Upload, X, Star, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ImageCapture from './ImageCapture';
import { imageLibraryService } from '../services/imageLibraryService';

// Images de fallback pour le test (déplacé en haut)
const fallbackImages = [
  {
    id: 'phone1',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200',
    alt: 'Smartphone moderne',
    source: 'unsplash'
  },
  {
    id: 'phone2',
    url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200',
    alt: 'iPhone premium',
    source: 'unsplash'
  },
  {
    id: 'phone3',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200',
    alt: 'Samsung Galaxy',
    source: 'unsplash'
  },
  {
    id: 'vet1',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
    alt: 'Vêtements élégants',
    source: 'unsplash'
  },
  {
    id: 'vet2',
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200',
    alt: 'Mode fashion',
    source: 'unsplash'
  },
  {
    id: 'robe1',
    url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200',
    alt: 'Robe rouge élégante',
    source: 'unsplash'
  },
  {
    id: 'robe2',
    url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200',
    alt: 'Robe noire chic',
    source: 'unsplash'
  },
  {
    id: 'laptop1',
    url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200',
    alt: 'MacBook Pro',
    source: 'unsplash'
  },
  {
    id: 'laptop2',
    url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200',
    alt: 'Ordinateur portable',
    source: 'unsplash'
  },
  {
    id: 'bijoux1',
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
    alt: 'Bague en or',
    source: 'unsplash'
  },
  {
    id: 'bijoux2',
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
    alt: 'Collier en argent',
    source: 'unsplash'
  },
  {
    id: 'food1',
    url: 'https://images.unsplash.com/photo-1504674900240-9a9049b7d8ce?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1504674900240-9a9049b7d8ce?w=200',
    alt: 'Nourriture fraîche',
    source: 'unsplash'
  }
];

const ImageLibrary = ({ 
  onImageSelect, 
  productName = '', 
  onClose,
  multiple = false,
  maxImages = 10 
}) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(fallbackImages);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Recherche avec l'API Unsplash
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    
    console.log('🔍 Début de la recherche:', query);
    console.log('🔑 Clé API:', imageLibraryService.UNSPLASH_ACCESS_KEY);
    
    try {
      if (query.trim()) {
        console.log('📡 Appel API Unsplash pour:', query);
        const results = await imageLibraryService.searchImages(query);
        console.log('✅ Résultats reçus:', results.length, 'images');
        setSearchResults(results);
      } else {
        console.log('📡 Récupération images populaires...');
        const popular = await imageLibraryService.getPopularImages();
        console.log('✅ Images populaires reçues:', popular.length, 'images');
        setSearchResults(popular);
      }
    } catch (error) {
      console.error('❌ Erreur recherche:', error);
      // Utiliser les images de fallback en cas d'erreur
      if (query.trim()) {
        const filtered = fallbackImages.filter(img => 
          img.alt.toLowerCase().includes(query.toLowerCase()) ||
          img.id.toLowerCase().includes(query.toLowerCase())
        );
        console.log('🔄 Utilisation fallback:', filtered.length, 'images');
        setSearchResults(filtered);
      } else {
        console.log('🔄 Utilisation fallback complet');
        setSearchResults(fallbackImages);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (image) => {
    if (multiple) {
      const isSelected = selectedImages.find(img => img.id === image.id);
      if (isSelected) {
        setSelectedImages(selectedImages.filter(img => img.id !== image.id));
      } else if (selectedImages.length < maxImages) {
        setSelectedImages([...selectedImages, image]);
      }
    } else {
      onImageSelect(image);
      onClose?.();
    }
  };

  const handleConfirmSelection = () => {
    onImageSelect(selectedImages);
    onClose?.();
  };

  const renderImageCard = (image) => {
    const isSelected = selectedImages.find(img => img.id === image.id);
    
    console.log('🖼️ Rendu image:', image.id, image.url, image.thumbnail);

    return (
      <div 
        key={image.id}
        className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
          isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleImageSelect(image)}
      >
        <div className="aspect-square relative">
          <img
            src={image.thumbnail || image.url}
            alt={image.alt || 'Image de produit'}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              console.error('❌ Erreur chargement image:', image.id, e.target.src);
              e.target.src = 'https://via.placeholder.com/200x200?text=Image+non+disponible';
            }}
            onLoad={() => {
              console.log('✅ Image chargée:', image.id);
            }}
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
                {image.source === 'unsplash' ? 'Unsplash' : 'Libre'}
              </Badge>
            </div>

            {isSelected && (
              <div className="absolute top-2 left-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">
                    {selectedImages.findIndex(img => img.id === image.id) + 1}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-white">
          <p className="text-xs text-gray-600 truncate font-medium">{image.alt || 'Image de produit'}</p>
          {image.photographer && (
            <p className="text-xs text-gray-400 truncate mt-1">Par {image.photographer}</p>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Rechercher des images (ex: robe, phone, laptop)..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-4 py-3 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Recherche en cours...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Résultats de recherche</h3>
                
                {searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Aucun résultat trouvé</p>
                    <p className="text-sm text-gray-400 mt-1">Essayez avec d'autres mots-clés</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {searchResults.map((image, index) => (
                      <div 
                        key={image.id || index} 
                        className="group cursor-pointer rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50"
                        onClick={() => handleImageSelect(image)}
                      >
                        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                          <img
                            src={image.thumbnail || image.url}
                            alt={image.alt || 'Image de produit'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              console.error('❌ Erreur image:', image.id, e.target.src);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={() => console.log('✅ Image chargée:', image.id)}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-xs" style={{display: 'none'}}>
                            <div className="text-center">
                              <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                                <span>📷</span>
                              </div>
                              Image non disponible
                            </div>
                          </div>
                          
                          {/* Overlay au hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200">
                            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs font-medium">
                                {image.source === 'unsplash' ? 'Unsplash' : 'Libre'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                            {image.alt || 'Image de produit'}
                          </p>
                          {image.photographer && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              Par {image.photographer}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'suggestions':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Suggestions pour "{productName || 'votre produit'}"
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fallbackImages.map(image => renderImageCard(image))}
            </div>
          </div>
        );

      case 'popular':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Images populaires</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fallbackImages.map(image => renderImageCard(image))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header moderne */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">📸</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Librairie d'Images</h2>
              <p className="text-xs sm:text-sm text-gray-500">Trouvez la parfaite image pour votre produit</p>
            </div>
            {multiple && selectedImages.length > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                {selectedImages.length}/{maxImages} sélectionnées
              </Badge>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            className="hover:bg-gray-100 border-gray-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Info message moderne */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs">💡</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
              <strong>Conseil :</strong> Recherchez par nom de produit (ex: "robe", "phone", "laptop") ou utilisez l'upload direct pour vos propres images. Toutes les images sont libres de droits.
            </p>
          </div>
        </div>

        {/* Content avec layout moderne */}
        <div className="flex flex-col lg:flex-row h-[calc(95vh-140px)] sm:h-[calc(90vh-140px)]">
          {/* Main content - plus large */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Barre de recherche */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher des images (ex: robe, phone, laptop)..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 pr-4 py-3 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                />
              </div>
            </div>
            
            {/* Résultats */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-500 text-lg">Recherche en cours...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-500">Essayez avec d'autres mots-clés</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {searchResults.map((image, index) => (
                  <div 
                    key={image.id || index} 
                    className="group cursor-pointer rounded-xl overflow-hidden bg-white border-2 transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50"
                    onClick={() => handleImageSelect(image)}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                      <img
                        src={image.thumbnail || image.url}
                        alt={image.alt || 'Image de produit'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          console.error('❌ Erreur image:', image.id, e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={() => console.log('✅ Image chargée:', image.id)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-xs" style={{display: 'none'}}>
                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                            <span>📷</span>
                          </div>
                          Image non disponible
                        </div>
                      </div>
                      
                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200">
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs font-medium">
                            {image.source === 'unsplash' ? 'Unsplash' : 'Libre'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                        {image.alt || 'Image de produit'}
                      </p>
                      {image.photographer && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          Par {image.photographer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Upload moderne */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 p-4 sm:p-6 bg-gray-50/50">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-600" />
                  Upload d'image
                </h3>
                <ImageCapture
                  onImageUpload={(image) => {
                    handleImageSelect(image);
                  }}
                  multiple={false}
                  uploadType="product"
                />
              </div>

              {/* Selected images */}
              {multiple && selectedImages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Images sélectionnées</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedImages.map((image, index) => (
                      <div key={image.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <img
                          src={image.thumbnail || image.url}
                          alt={image.alt}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{image.alt}</p>
                          <p className="text-xs text-gray-500">{image.source}</p>
                        </div>
                        <button
                          onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handleConfirmSelection}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Confirmer la sélection ({selectedImages.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLibrary; 