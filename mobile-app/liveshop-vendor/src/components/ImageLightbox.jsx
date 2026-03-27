import React, { useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageLightbox = ({ imageUrl, images = [], productName, onClose, isOpen }) => {
  const [zoom, setZoom] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build images list: use images array if provided, else fallback to single imageUrl
  const allImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : []);
  const hasMultiple = allImages.length > 1;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));

  const handlePrev = useCallback((e) => {
    e.stopPropagation();
    setZoom(1);
    setCurrentIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  }, [allImages.length]);

  const handleNext = useCallback((e) => {
    e.stopPropagation();
    setZoom(1);
    setCurrentIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
  }, [allImages.length]);

  if (!isOpen || allImages.length === 0) return null;

  const currentImage = typeof allImages[currentIndex] === 'object'
    ? (allImages[currentIndex].url || allImages[currentIndex].optimizedUrl)
    : allImages[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev/Next arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Zoom controls + image counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full p-2 backdrop-blur-sm">
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          disabled={zoom <= 1}
          className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <span className="text-white px-2 flex items-center font-medium min-w-[50px] justify-center text-sm">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          disabled={zoom >= 3}
          className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-30"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {hasMultiple && (
          <>
            <div className="w-px h-5 bg-white/30 mx-1" />
            <span className="text-white text-sm font-medium px-2">
              {currentIndex + 1} / {allImages.length}
            </span>
          </>
        )}
      </div>

      {/* Image */}
      <div
        className="relative max-w-4xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage}
          alt={`${productName || 'Image'} ${hasMultiple ? currentIndex + 1 : ''}`}
          className="w-full h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Product name */}
      {productName && (
        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          <p className="font-medium">{productName}</p>
        </div>
      )}

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto p-2">
          {allImages.map((img, idx) => {
            const thumbUrl = typeof img === 'object' ? (img.thumbnailUrl || img.url) : img;
            return (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setZoom(1); }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-90'
                }`}
              >
                <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
