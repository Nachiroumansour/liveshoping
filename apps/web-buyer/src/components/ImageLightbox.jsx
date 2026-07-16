import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImageLightbox = ({ imageUrl, images = [], productName, onClose, isOpen, initialIndex = 0 }) => {
  const [zoom, setZoom] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(null);

  // Construire le tableau d'images (priorité aux images multiples, sinon fallback sur imageUrl)
  const allImages = React.useMemo(() => {
    if (images && images.length > 0) {
      return images.map(img => typeof img === 'string' ? img : img.url || img.optimizedUrl || img.thumbnailUrl);
    }
    if (imageUrl) {
      return [imageUrl];
    }
    return [];
  }, [images, imageUrl]);

  const hasMultipleImages = allImages.length > 1;

  // Reset zoom et index quand le lightbox s'ouvre
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Handlers pour le swipe mobile
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart || !hasMultipleImages) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext(e);
      else handlePrevious(e);
    }
    setTouchStart(null);
  };

  if (!isOpen || allImages.length === 0) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));

  const handlePrevious = (e) => {
    e.stopPropagation();
    setZoom(1);
    setCurrentIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setZoom(1);
    setCurrentIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Bouton fermer */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-10 h-10 z-10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Bouton précédent */}
      {hasMultipleImages && (
        <Button
          onClick={handlePrevious}
          variant="ghost"
          size="icon"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 z-10"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </Button>
      )}

      {/* Bouton suivant */}
      {hasMultipleImages && (
        <Button
          onClick={handleNext}
          variant="ghost"
          size="icon"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-10 h-10 sm:w-12 sm:h-12 z-10"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </Button>
      )}

      {/* Contrôles de zoom + indicateur d'images */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 rounded-full p-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full"
          disabled={zoom <= 1}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
        
        {hasMultipleImages ? (
          <span className="text-white px-3 flex items-center font-medium text-sm">
            {currentIndex + 1} / {allImages.length}
          </span>
        ) : (
          <span className="text-white px-3 flex items-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
        )}
        
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full"
          disabled={zoom >= 3}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
      </div>

      {/* Image principale */}
      <div 
        className="relative max-w-4xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={allImages[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Nom du produit */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
        <p className="font-medium">{String(productName || '')}</p>
      </div>

      {/* Miniatures en bas (si plusieurs images) */}
      {hasMultipleImages && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setZoom(1);
              }}
              className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-white scale-110' 
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Miniature ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
