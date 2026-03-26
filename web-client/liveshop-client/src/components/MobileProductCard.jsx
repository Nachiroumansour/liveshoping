import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Star,
  Package,
  Plus,
  Minus,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Eye
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import ImageLightbox from './ImageLightbox';

const MobileProductCard = ({ product, onOrder }) => {
  const { addToCart, items, updateQuantity } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const cartItem = items.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const productImages = useMemo(() => {
    const imgs = [];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach(img => {
        const url = typeof img === 'string' ? img : img.url || img.optimizedUrl || img.thumbnailUrl;
        if (url) imgs.push(url);
      });
    }
    if (imgs.length === 0 && product.image_url) {
      imgs.push(product.image_url);
    }
    return imgs;
  }, [product.images, product.image_url]);

  const hasMultipleImages = productImages.length > 1;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1);
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleUpdateQuantity = (newQuantity) => {
    updateQuantity(product.id, newQuantity);
  };

  const getProductAttributes = () => {
    if (!product.attributes) return [];
    try {
      const attrs = typeof product.attributes === 'string'
        ? JSON.parse(product.attributes)
        : product.attributes;
      if (!attrs || typeof attrs !== 'object') return [];
      return Object.entries(attrs)
        .filter(([key, value]) => value && typeof value !== 'object')
        .map(([key, value]) => [key, String(value)]);
    } catch (e) {
      return [];
    }
  };

  const attributes = getProductAttributes();
  const hasAttributes = attributes.length > 0;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Image */}
        <div className="relative">
          {productImages.length > 0 ? (
            <div
              className="aspect-[4/5] bg-gray-100 cursor-pointer relative overflow-hidden"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={productImages[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Navigation flèches */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/80 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/80 text-gray-700 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Points indicateurs */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-3'
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/5] bg-gray-50 flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
          )}

          {/* Badges top */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.stock_quantity > 0 ? (
              <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium px-2 py-1 rounded-lg">
                Stock: {product.stock_quantity}
              </span>
            ) : (
              <span className="bg-gray-900/80 text-white text-[10px] font-medium px-2 py-1 rounded-lg">
                Rupture
              </span>
            )}
          </div>

          {product.is_pinned && (
            <div className="absolute top-2.5 right-2.5">
              <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                Épinglé
              </span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-3">
          {/* Nom */}
          <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">
            {product.name}
          </h3>

          {/* Prix */}
          <p className="text-base font-bold text-gray-900 mb-2.5">
            {product.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">FCFA</span>
          </p>

          {/* Attributs + Voir plus */}
          <div className="flex items-center gap-1 flex-wrap mb-2.5">
            {hasAttributes && attributes.slice(0, 2).map(([key, value]) => (
              <span
                key={key}
                className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
              >
                {String(value)}
              </span>
            ))}
            {(product.description || attributes.length > 2 || productImages.length > 1) && (
              <button
                onClick={() => setShowDetail(true)}
                className="text-[10px] font-medium text-gray-400 hover:text-gray-600 px-1 flex items-center gap-0.5"
              >
                <Eye className="w-3 h-3" />
                Voir plus
              </button>
            )}
          </div>

          {/* Actions */}
          {isInCart ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="flex-1 text-center text-xs font-medium text-gray-600">
                {cartItem.quantity} dans le panier
              </span>
              <button
                onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOrder(product.id)}
                disabled={isOutOfStock}
                className={`flex-1 h-9 rounded-xl text-sm font-medium transition-colors ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white active:bg-gray-800'
                }`}
              >
                Commander
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  isOutOfStock
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowDetail(false)}>
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between z-10">
              <h3 className="text-sm font-semibold text-gray-900 truncate pr-4">{product.name}</h3>
              <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Images carousel */}
            {productImages.length > 0 && (
              <div className="relative">
                <img
                  src={productImages[currentImageIndex]}
                  alt={product.name}
                  className="w-full aspect-square object-cover"
                />
                {productImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {productImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-4 space-y-4">
              {/* Prix */}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  {product.price?.toLocaleString()} <span className="text-xs font-medium text-gray-400">FCFA</span>
                </span>
                <span className="text-xs text-gray-400">Stock: {product.stock_quantity}</span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
              )}

              {/* Attributs */}
              {hasAttributes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Détails</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {attributes.map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-[10px] text-gray-400 capitalize block">{key}</span>
                        <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => { setShowDetail(false); onOrder(product.id); }}
                disabled={isOutOfStock}
                className={`w-full h-11 rounded-xl text-sm font-medium transition-colors ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white active:bg-gray-800'
                }`}
              >
                {isOutOfStock ? 'Rupture de stock' : 'Commander'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageLightbox
        imageUrl={product.image_url}
        images={productImages}
        productName={product.name}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={currentImageIndex}
      />
    </>
  );
};

export default MobileProductCard;
