import React, { useState, useEffect } from 'react';
import { Search, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { imageLibraryService } from '@/services/imageLibraryService';

const SimpleImageLibrary = ({ onImageSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    
    try {
      if (query.trim()) {
        console.log('🔍 Recherche pour:', query);
        const results = await imageLibraryService.searchImages(query);
        console.log('📸 Images trouvées:', results.length);
        console.log('📸 Première image:', results[0]);
        setImages(results);
      } else {
        console.log('📸 Chargement images populaires...');
        const popular = await imageLibraryService.getPopularImages();
        console.log('📸 Images populaires:', popular.length);
        setImages(popular);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image) => {
    console.log('🖼️ Image sélectionnée:', image);
    onImageSelect(image);
    onClose();
  };

  const handleImageError = (image, event) => {
    console.error('❌ Erreur chargement image:', {
      id: image.id,
      url: image.url,
      thumbnail: image.thumbnail,
      error: event.target.src
    });
    event.target.style.display = 'none';
    event.target.nextSibling.style.display = 'flex';
  };

  const handleImageLoad = (image) => {
    console.log('✅ Image chargée avec succès:', {
      id: image.id,
      url: image.url,
      thumbnail: image.thumbnail
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Librairie d'Images</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Rechercher des images..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Recherche en cours...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune image trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div 
                  key={image.id || index}
                  className="cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={image.thumbnail || image.url}
                      alt={image.alt || 'Image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Erreur chargement image:', {
                          id: image.id,
                          url: image.url,
                          thumbnail: image.thumbnail,
                          error: e.target.src
                        });
                        
                        // Essayer l'URL complète si la thumbnail échoue
                        if (e.target.src === image.thumbnail && image.url !== image.thumbnail) {
                          console.log('🔄 Tentative avec URL complète:', image.url);
                          e.target.src = image.url;
                        } else {
                          // Afficher le placeholder
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                      onLoad={() => {
                        console.log('✅ Image chargée avec succès:', {
                          id: image.id,
                          url: image.url,
                          thumbnail: image.thumbnail,
                          currentSrc: event.target.src
                        });
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-xs" style={{display: 'none'}}>
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Image non disponible</p>
                        <p className="text-xs mt-1">ID: {image.id}</p>
                        <p className="text-xs">Source: {image.source}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{image.alt || 'Image'}</p>
                    <p className="text-xs text-gray-500">{image.source}</p>
                    {image.photographer && (
                      <p className="text-xs text-gray-400">Par {image.photographer}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleImageLibrary; 