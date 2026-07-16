import React, { useState, useEffect, useRef } from 'react';
import { imageService } from '../services/imageService';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  size = 'medium', // 'thumbnail', 'small', 'medium', 'large', 'original'
  lazy = true,
  fallback = '/placeholder-image.jpg',
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Configuration des tailles
  const sizeConfig = {
    thumbnail: { width: 200, height: 200, crop: 'fill' },
    small: { width: 400, height: 400, crop: 'limit' },
    medium: { width: 800, height: 800, crop: 'limit' },
    large: { width: 1200, height: 1200, crop: 'limit' },
    original: {}
  };

  // Optimiser l'URL de l'image
  const getOptimizedUrl = (url) => {
    if (!url) return fallback;
    
    // Si c'est une URL Cloudinary
    if (imageService.isCloudinaryUrl(url)) {
      const config = sizeConfig[size];
      return imageService.optimizeImageUrl(url, config);
    }
    
    return url;
  };

  // Observer pour le lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy]);

  // Charger l'image quand elle est visible
  useEffect(() => {
    if (!inView) return;

    const optimizedUrl = getOptimizedUrl(src);
    setImageSrc(optimizedUrl);
  }, [inView, src, size]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    setImageSrc(fallback);
    onError?.();
  };

  return (
    <div className={`relative ${className}`} ref={imgRef}>
      {/* Placeholder de chargement */}
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Image */}
      {inView && (
        <img
          src={imageSrc || fallback}
          alt={alt}
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          {...props}
        />
      )}

      {/* Placeholder si pas encore visible */}
      {!inView && (
        <div className={`${className} bg-gray-200 animate-pulse rounded-lg`} />
      )}

      {/* Indicateur d'erreur */}
      {error && (
        <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-red-500 text-xs text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500">!</span>
            </div>
            Erreur de chargement
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 