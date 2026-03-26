import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, MessageCircle, Heart, Share2, Eye, Package, Clock, X, Zap } from 'lucide-react';
import { getApiUrl, getPublicLink, getImageUrl } from '../config/domains';
import realtimeService from '../services/realtimeService';
import CartModal from '../components/CartModal';
import MobileHeader from '../components/MobileHeader';
import MobileProductCard from '../components/MobileProductCard';
import { useCart } from '../contexts/CartContext';

const LiveProductsPageContent = () => {
  const { linkId, liveSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [live, setLive] = useState(null);
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
          const productId = parseInt(data.product_id);
          console.log('🔧 Suppression - ID reçu:', data.product_id, 'ID converti:', productId);
          
          setProducts(prev => {
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
          const productId = parseInt(data.product_id);
          console.log('🔧 Épinglage - ID reçu:', data.product_id, 'ID converti:', productId);
          
          setProducts(prev => {
            const updated = prev.map(p => 
              parseInt(p.id) === productId ? { ...p, is_pinned: true } : p
            );
            return updated;
          });
          setRealtimeStatus('active');
          
          showRealtimeNotification('Produit épinglé !', 'info');
        }
      });

      // Gestion des événements de connexion
      realtimeService.onConnect(() => {
        console.log('🔗 WebSocket connecté');
        setRealtimeStatus('active');
      });

      realtimeService.onDisconnect(() => {
        console.log('🔌 WebSocket déconnecté');
        setRealtimeStatus('disconnected');
      });

      realtimeService.onError((error) => {
        console.error('❌ Erreur WebSocket:', error);
        setRealtimeStatus('error');
      });

    } catch (error) {
      console.error('❌ Erreur lors de la configuration du temps réel:', error);
      setRealtimeStatus('error');
    }
  }, [linkId]);

  // Fonction pour afficher les notifications
  const showRealtimeNotification = (message, type = 'info') => {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium shadow-lg transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(getApiUrl(`/public/${linkId}/live/${liveSlug}`));
        const data = await response.json();
        
        if (response.ok) {
          setLive(data.live);
          setSeller(data.seller);
          setProducts(data.products || []);
          setRealtimeStatus('active');
        } else {
          setError(data.error || 'Erreur lors du chargement des produits du live.');
        }
      } catch (error) {
        console.error('Erreur fetch:', error);
        setError('Erreur lors du chargement des produits du live.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setupRealtime();

    // Nettoyage à la fermeture
    return () => {
      realtimeService.disconnect();
    };
  }, [linkId, liveSlug, setupRealtime]);

  const handleOrderProduct = (productId) => {
    navigate(`/${linkId}/order/${productId}`);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
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

  const shareLive = () => {
    const liveUrl = getPublicLink(linkId) + `/live/${liveSlug}`;
    if (navigator.share) {
      navigator.share({
        title: `Live de ${seller?.name}`,
        text: `Découvrez les produits en live !`,
        url: liveUrl
      });
    } else {
      navigator.clipboard.writeText(liveUrl);
    }
  };

  const handleToggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate(`/${linkId}/checkout`);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.is_pinned === (selectedCategory === 'live'));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-600 font-medium">Chargement du live...</p>
            <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-slate-800">Live non trouvé</h1>
            <p className="text-slate-600 leading-relaxed">{error}</p>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            Réessayer
          </Button>
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
          onShare={shareLive}
          onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          isMenuOpen={isMenuOpen}
          realtimeStatus={realtimeStatus}
          onToggleCart={handleToggleCart}
          liveTitle={live?.title}
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
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  {live?.title || 'En direct'}
                </p>
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
                onClick={shareLive}
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
                : 'Aucun produit disponible pour ce live.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((product) => (
              <MobileProductCard
                key={product.id}
                product={product}
                onOrder={() => handleOrderProduct(product.id)}
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
                : 'Aucun produit disponible pour ce live.'
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

                  {/* Badge LIVE */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                  </div>

                  {product.is_pinned && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        Épinglé
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3">
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

      {/* Modal d'image */}
      {showImageModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeImageModal}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-auto max-h-[60vh] object-cover"
              />
              <button
                onClick={closeImageModal}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedProduct.name}</h3>
              {selectedProduct.description && (
                <p className="text-sm text-gray-500 mb-4">{selectedProduct.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  {selectedProduct.price.toLocaleString()} <span className="text-sm font-medium text-gray-400">FCFA</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(selectedProduct)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Panier
                  </button>
                  <button
                    onClick={() => { closeImageModal(); handleOrderProduct(selectedProduct.id); }}
                    className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-sm font-medium transition-colors"
                  >
                    Commander
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal du panier */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default LiveProductsPageContent;