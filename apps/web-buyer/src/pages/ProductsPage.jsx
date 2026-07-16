  import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, MessageCircle, Share2, Eye, Package, X } from 'lucide-react';
import { getPublicLink, getApiUrl, getImageUrl } from '../config/domains';
import realtimeService from '../services/realtimeService';
import CartModal from '../components/CartModal';
import MobileHeader from '../components/MobileHeader';
import MobileProductCard from '../components/MobileProductCard';
import { useCart } from '../contexts/CartContext';

const ProductsPageContent = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Configuration du WebSocket en temps réel
  const setupRealtime = useCallback(() => {
    try {
      // Se connecter au WebSocket
      realtimeService.connect();
      
      // Écouter les nouveaux produits
      realtimeService.onProductCreated((data) => {
        console.log('🆕 Nouveau produit reçu en temps réel:', data);
        
        // Vérifier que le produit appartient au bon vendeur
        if (data.seller_id === linkId) {
          setProducts(prev => [data.product, ...prev]);
          setRealtimeStatus('active');
          
          // Notification visuelle
          showRealtimeNotification('Nouveau produit ajouté !', 'success');
        }
      });

      // Écouter les produits modifiés
      realtimeService.onProductUpdated((data) => {
        console.log('✏️ Produit modifié en temps réel:', data);
        
        if (data.seller_id === linkId) {
          setProducts(prev => prev.map(p => 
            p.id === data.product.id ? data.product : p
          ));
          setRealtimeStatus('active');
          
          showRealtimeNotification('Produit mis à jour !', 'info');
        }
      });

      // Écouter les produits supprimés
      realtimeService.onProductDeleted((data) => {
        console.log('🗑️ Produit supprimé en temps réel:', data);
        
        if (data.seller_id === linkId) {
          // 🔧 CORRECTION : Convertir en nombre pour la comparaison
          const productId = parseInt(data.product_id);
          console.log('🔧 Suppression - ID reçu:', data.product_id, 'ID converti:', productId);
          
          setProducts(prev => {
            console.log('🔍 DEBUG - IDs des produits dans létat local:', prev.map(p => ({ id: p.id, name: p.name, type: typeof p.id })));
            console.log('🔍 DEBUG - Produit à supprimer:', productId, 'type:', typeof productId);
            
            // 🔧 CORRECTION : Comparer en convertissant les deux IDs en nombres
            const filtered = prev.filter(p => parseInt(p.id) !== productId);
            console.log('🔧 Produits après suppression:', filtered.length, 'au lieu de', prev.length);
            return filtered;
          });
          setRealtimeStatus('active');
          
          showRealtimeNotification('Produit supprimé !', 'warning');
        }
      });

      // Écouter les produits épinglés
      realtimeService.onProductPinned((data) => {
        console.log('📌 Produit épinglé en temps réel:', data);
        
        if (data.seller_id === linkId) {
          // 🔧 CORRECTION : Convertir en nombre pour la comparaison
          const productId = parseInt(data.product_id);
          console.log('🔧 Épinglage - ID reçu:', data.product_id, 'ID converti:', productId);
          
          setProducts(prev => {
            console.log('🔍 DEBUG - IDs des produits dans létat local:', prev.map(p => ({ id: p.id, name: p.name, type: typeof p.id })));
            console.log('🔍 DEBUG - Produit à épingler:', productId, 'type:', typeof productId);
            
            // 🔧 CORRECTION : Comparer en convertissant les deux IDs en nombres
            const updated = prev.map(p => 
              parseInt(p.id) === productId ? { ...p, is_pinned: data.is_pinned } : p
            );
            console.log('🔧 Produits après épinglage:', updated.length);
            return updated;
          });
          setRealtimeStatus('active');
          
          const action = data.is_pinned ? 'épinglé' : 'désépinglé';
          showRealtimeNotification(`Produit ${action} !`, 'info');
        }
      });

      // Vérifier le statut de connexion
      const checkConnection = setInterval(() => {
        const status = realtimeService.getConnectionStatus();
        setRealtimeStatus(status.isConnected ? 'active' : 'disconnected');
        
        if (status.isConnected) {
          clearInterval(checkConnection);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur configuration WebSocket:', error);
      setRealtimeStatus('error');
    }
  }, [linkId]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl(`/public/${linkId}/products`);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Vendeur non trouvé');
      }
      
      const data = await response.json();
      setProducts(data.products);
      setSeller(data.seller);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [linkId]);

  useEffect(() => {
    console.log('🚀 ProductsPage monté - linkId:', linkId);
    fetchProducts();
    setupRealtime();
    
    return () => {
      // Nettoyer les écouteurs WebSocket
      realtimeService.removeAllListeners();
    };
  }, [linkId, fetchProducts, setupRealtime]);

  // Afficher une notification en temps réel
  const showRealtimeNotification = (message, type = 'info') => {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 3 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  };

  const handleOrderProduct = (productId) => {
    navigate(`/${linkId}/order/${productId}`);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    // Notification visuelle
    showRealtimeNotification(`${product.name} ajouté au panier !`, 'success');
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedProduct(null);
  };

  const shareShop = () => {
    const shopUrl = getPublicLink(linkId);
    if (navigator.share) {
      navigator.share({
        title: `Boutique de ${seller?.name}`,
        text: `Découvrez les produits de ${seller?.name} en direct !`,
        url: shopUrl
      });
    } else {
      navigator.clipboard.writeText(shopUrl);
    }
  };

  const handleToggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    // Rediriger vers la page de commande avec les produits du panier
    navigate(`/${linkId}/checkout`);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.is_pinned === (selectedCategory === 'live'));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Boutique non trouvée</h1>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-xl"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Espace pour le header fixe sur desktop */}
      <div className="hidden md:block h-20"></div>
      {/* Header mobile */}
      <div className="md:hidden">
        <MobileHeader
          seller={seller}
          onShare={shareShop}
          onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
          realtimeStatus={realtimeStatus}
          onToggleCart={handleToggleCart}
        />
      </div>

      {/* Header desktop */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {seller?.logo_url ? (
                <img
                  src={getImageUrl(seller.logo_url)}
                  alt={seller.name}
                  className="w-10 h-10 rounded-xl object-cover bg-gray-100"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900">{seller?.name}</h1>
                <p className="text-xs text-gray-400">{seller?.description || 'Commande en direct'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleCart}
                className="relative flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Panier
                {items.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {items.length}
                  </span>
                )}
              </button>
              <button
                onClick={shareShop}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtres mobile */}
      <div className="md:hidden px-4 py-2.5 bg-white border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Tous ({products.length})
          </button>
          <button
            onClick={() => setSelectedCategory('live')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              selectedCategory === 'live'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <Star className="w-3 h-3" />
            Épinglés ({products.filter(p => p.is_pinned).length})
          </button>
        </div>
      </div>

      {/* Filtres desktop */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 py-6">
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tous les produits ({products.length})
            </button>
            <button
              onClick={() => setSelectedCategory('live')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === 'live'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Épinglés ({products.filter(p => p.is_pinned).length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste de produits mobile */}
      <div className="md:hidden px-3 py-3 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              {selectedCategory === 'live' ? 'Aucun produit épinglé' : 'Aucun produit disponible'}
            </h2>
            <p className="text-xs text-gray-400">
              {selectedCategory === 'live'
                ? 'Aucun produit n\'est actuellement mis en avant.'
                : 'Le vendeur n\'a pas encore ajouté de produits.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                onOrder={handleOrderProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Grille de produits desktop */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedCategory === 'live' ? 'Aucun produit épinglé' : 'Aucun produit disponible'}
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              {selectedCategory === 'live'
                ? 'Aucun produit n\'est actuellement mis en avant.'
                : 'Le vendeur n\'a pas encore ajouté de produits.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative">
                  {product.image_url ? (
                    <div className="aspect-square bg-gray-100 overflow-hidden cursor-pointer" onClick={() => handleViewProduct(product)}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-50 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-300" />
                    </div>
                  )}

                  {product.is_pinned && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        Épinglé
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    {product.stock_quantity > 0 ? (
                      <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                        Stock: {product.stock_quantity}
                      </span>
                    ) : (
                      <span className="bg-gray-900/80 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                        Rupture
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1.5 group-hover:text-gray-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 mb-3">
                    {product.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">FCFA</span>
                  </p>

                  {product.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOrderProduct(product.id)}
                      disabled={product.stock_quantity === 0}
                      className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${
                        product.stock_quantity === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {product.stock_quantity === 0 ? 'Rupture' : 'Commander'}
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        product.stock_quantity === 0
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget commentaires desktop */}
      <div className="hidden md:block fixed bottom-8 right-8 z-20">
        <button
          onClick={() => navigate(`/${linkId}/comments`)}
          className="bg-gray-900 text-white rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Modal panier */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Modal de visualisation */}
      {showImageModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 truncate pr-4">
                {selectedProduct.name}
              </h3>
              <button onClick={closeImageModal} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full aspect-square object-cover rounded-xl"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-200" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  {selectedProduct.price?.toLocaleString()} <span className="text-xs font-medium text-gray-400">FCFA</span>
                </span>
                <span className="text-xs text-gray-400">Stock: {selectedProduct.stock_quantity}</span>
              </div>

              {selectedProduct.description && (
                <p className="text-sm text-gray-500 leading-relaxed">{selectedProduct.description}</p>
              )}

              {/* Attributs */}
              {(() => {
                try {
                  const attrs = typeof selectedProduct.attributes === 'string'
                    ? JSON.parse(selectedProduct.attributes)
                    : selectedProduct.attributes;
                  if (!attrs || typeof attrs !== 'object') return null;
                  const entries = Object.entries(attrs).filter(([, v]) => v && typeof v !== 'object');
                  if (entries.length === 0) return null;
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {entries.map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-[10px] text-gray-400 capitalize block">{key}</span>
                          <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  );
                } catch { return null; }
              })()}
            </div>

            <div className="flex gap-2 px-5 pb-5">
              <button
                onClick={() => { closeImageModal(); handleOrderProduct(selectedProduct.id); }}
                disabled={selectedProduct.stock_quantity === 0}
                className={`flex-1 h-11 rounded-xl text-sm font-medium ${
                  selectedProduct.stock_quantity === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Commander
              </button>
              <button
                onClick={closeImageModal}
                className="px-5 h-11 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductsPage = () => {
  return <ProductsPageContent />;
};

export default ProductsPage; 