import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

const ImageGallery = ({ 
  images = [], 
  className = '',
  showThumbnails = true,
  maxThumbnails = 5,
  onImageClick,
  onImageRemove
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(1);

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500 text-sm">Aucune image</p>
      </div>
    );
  }

  const handleImageClick = (index) => {
    setSelectedImage(index);
    setShowModal(true);
    setZoom(1);
    onImageClick?.(images[index], index);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const handleZoom = (direction) => {
    if (direction === 'in') {
      setZoom(prev => Math.min(prev + 0.5, 3));
    } else {
      setZoom(prev => Math.max(prev - 0.5, 0.5));
    }
  };

  const getImageUrl = (image) => {
    if (typeof image === 'object' && image.url) {
      return image.url;
    }
    return image;
  };

  const getImageAlt = (image, index) => {
    if (typeof image === 'object' && image.originalName) {
      return image.originalName;
    }
    return `Image ${index + 1}`;
  };

  return (
    <div className={className}>
      {/* Image principale */}
      <div className="relative mb-4">
        <OptimizedImage
          src={getImageUrl(images[selectedImage])}
          alt={getImageAlt(images[selectedImage], selectedImage)}
          className="w-full h-64 md:h-80 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          size="large"
          onClick={() => handleImageClick(selectedImage)}
        />
        
        {/* Indicateur de position */}
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {selectedImage + 1} / {images.length}
        </div>

        {/* Bouton de suppression */}
        {onImageRemove && (
          <button
            onClick={() => onImageRemove(selectedImage)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.slice(0, maxThumbnails).map((image, index) => (
            <div
              key={index}
              className={`relative flex-shrink-0 cursor-pointer ${
                index === selectedImage ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <OptimizedImage
                src={getImageUrl(image)}
                alt={getImageAlt(image, index)}
                className="w-16 h-16 object-cover rounded-lg"
                size="thumbnail"
              />
              
              {/* Indicateur Cloudinary */}
              {typeof image === 'object' && image.publicId && (
                <div className="absolute bottom-1 left-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
          
          {images.length > maxThumbnails && (
            <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
              +{images.length - maxThumbnails}
            </div>
          )}
        </div>
      )}

      {/* Modal de visualisation */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Bouton fermer */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Contrôles de zoom */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              <button
                onClick={() => handleZoom('in')}
                className="bg-white bg-opacity-20 text-white p-2 rounded hover:bg-opacity-30"
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleZoom('out')}
                className="bg-white bg-opacity-20 text-white p-2 rounded hover:bg-opacity-30"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>

            {/* Image */}
            <div className="relative overflow-hidden max-w-full max-h-full">
              <img
                src={getImageUrl(images[selectedImage])}
                alt={getImageAlt(images[selectedImage], selectedImage)}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Indicateur de position */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery; 