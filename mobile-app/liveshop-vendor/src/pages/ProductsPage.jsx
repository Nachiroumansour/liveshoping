import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApiService from '../services/api';
import realtimeService from '../services/realtimeService';
import { useAuth } from '../contexts/AuthContext';
import { useCreditsContext } from '../contexts/CreditsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Package,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Camera,
  Tag,
  Maximize2,
  Search,
  X,
  MoreVertical,
  TrendingUp,
  Eye
} from 'lucide-react';
import ProductForm from '../components/ProductForm';
import ImageLightbox from '../components/ImageLightbox';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';
import { Input } from '@/components/ui/input';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const ProductsPage = () => {
  const { refreshCredits } = useAuth();
  const {
    useCreditsForAction,
    insufficientCreditsModal,
    closeInsufficientCreditsModal
  } = useCreditsContext();
  const [products, setProducts] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // État pour la recherche
  const [searchQuery, setSearchQuery] = useState('');

  // État pour le menu contextuel mobile
  const [activeMenu, setActiveMenu] = useState(null);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsPerPage] = useState(6);

  useEffect(() => {
    fetchProducts();
    setupRealtime();

    return () => {
      // Nettoyer les listeners à la fermeture
      realtimeService.off('product_created', handleProductCreated);
      realtimeService.off('product_updated', handleProductUpdated);
      realtimeService.off('product_deleted', handleProductDeleted);
    };
  }, []);

  // Fermer le menu contextuel au clic extérieur
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  // Configuration du temps réel
  const setupRealtime = () => {
    // Connexion WebSocket
    realtimeService.connect();

    // Écouter les événements de produits
    realtimeService.on('product_created', handleProductCreated);
    realtimeService.on('product_updated', handleProductUpdated);
    realtimeService.on('product_deleted', handleProductDeleted);
  };

  // Gestion des événements temps réel
  const handleProductCreated = (data) => {
    // Le WebSocket envoie { product, seller_id, seller_name }
    const newProduct = data?.product || data;
    if (!newProduct?.id) {
      console.warn('⚠️ Produit reçu sans ID valide:', data);
      return;
    }
    console.log('🆕 Nouveau produit créé:', newProduct);
    setProducts(prev => [newProduct, ...prev.slice(0, -1)]); // Ajouter au début, retirer le dernier
    setTotalProducts(prev => prev + 1);

    // Notification toast
    showNotification('Nouveau produit ajouté', 'success');
  };

  const handleProductUpdated = (data) => {
    // Le WebSocket envoie { product, seller_id, seller_name }
    const updatedProduct = data?.product || data;
    if (!updatedProduct?.id) {
      console.warn('⚠️ Produit mis à jour sans ID valide:', data);
      return;
    }
    console.log('✏️ Produit mis à jour:', updatedProduct);
    setProducts(prev => prev.map(product =>
      product.id === updatedProduct.id ? updatedProduct : product
    ));

    // Notification toast
    showNotification('Produit mis à jour', 'info');
  };

  const handleProductDeleted = (data) => {
    // Le WebSocket peut envoyer { product_id } ou { id }
    const deletedId = data?.product_id || data?.id || data;
    if (!deletedId) {
      console.warn('⚠️ Suppression reçue sans ID valide:', data);
      return;
    }
    console.log('🗑️ Produit supprimé:', deletedId);
    setProducts(prev => prev.filter(product => product.id !== deletedId));
    setTotalProducts(prev => prev - 1);

    // Notification toast
    showNotification('Produit supprimé', 'warning');
  };


  // Fonction pour afficher les notifications
  const showNotification = (message, type = 'info') => {
    // Vous pouvez utiliser une librairie de toast comme react-hot-toast
    console.log(`📢 ${type.toUpperCase()}: ${message}`);

    // Exemple simple avec alert (à remplacer par un toast)
    if (type === 'success') {
      // alert(`✅ ${message}`);
    }
  };

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const data = await ApiService.getProducts(page, productsPerPage);

      // Gérer les deux formats de réponse
      if (data.products && data.pagination) {
        // Format avec pagination
      setProducts(data.products);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalProducts(data.pagination.totalProducts);
      } else {
        // Format sans pagination (fallback)
        setProducts(Array.isArray(data) ? data : []);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalProducts(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = async () => {
    // Plus de vérification de crédits - ouverture directe du dialogue
    setEditingProduct(null);
    setShowDialog(true);
  };

  // Déterminer si on est en desktop (>= sm)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 640px)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 640px)');
    const handler = (e) => setIsDesktop(e.matches);
    try { mq.addEventListener('change', handler); } catch { mq.addListener(handler); }
    return () => { try { mq.removeEventListener('change', handler); } catch { mq.removeListener(handler); } };
  }, []);

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setShowDialog(true);
  };

  const handleSubmit = async (productData) => {
    try {
      console.log('🔄 Début handleSubmit - Mode:', editingProduct ? 'Modification' : 'Création');
      console.log('🔄 ID produit à modifier:', editingProduct?.id);
      console.log('🔄 Données reçues:', productData);

      if (editingProduct) {
        console.log('📝 Modification du produit:', editingProduct.id);
        await ApiService.updateProduct(editingProduct.id, productData);
        console.log('✅ Produit modifié avec succès');
        showNotification('Produit modifié avec succès', 'success');
      } else {
        console.log('➕ Création d\'un nouveau produit');

        // Vérifier les crédits avant de créer le produit
        const result = await useCreditsForAction('ADD_PRODUCT', 'ajouter ce produit');

        if (!result.success) {
          // Le modal s'affiche automatiquement si crédits insuffisants
          throw new Error('Crédits insuffisants pour ajouter un produit');
        }

        const response = await ApiService.createProduct(productData);
        const createdProduct = response?.product || response;
        console.log('✅ Produit créé avec succès:', createdProduct);

        // Afficher le code produit généré au vendeur
        if (createdProduct?.product_code) {
          alert(`✅ Produit créé avec succès !\n\n📦 Code produit: ${createdProduct.product_code}\n\nNotez ce numéro pour retrouver facilement ce produit pendant vos lives.`);
        } else {
          showNotification('Produit créé avec succès', 'success');
        }

        // Rafraîchir les crédits après création d'un produit
        await refreshCredits();
      }

      await fetchProducts(currentPage);
      setShowDialog(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      console.error('❌ Message d\'erreur:', error.message);
      console.error('❌ Stack trace:', error.stack);
      throw error; // Laisser ProductForm gérer l'erreur
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setEditingProduct(null);
  };

  const handleDelete = async (productId) => {
    if (!productId) {
      console.error('❌ Impossible de supprimer: ID du produit manquant');
      alert('Erreur: ID du produit manquant. Veuillez rafraîchir la page.');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      await ApiService.deleteProduct(productId);
      await fetchProducts(currentPage);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du produit');
    }
  };

  const handleTogglePin = async (productId) => {
    try {
      // Utiliser les crédits via le contexte
      const result = await useCreditsForAction('PIN_PRODUCT', 'épingler ce produit');

      if (!result.success) {
        // Le modal s'affiche automatiquement si crédits insuffisants
        return;
      }

      // Si succès, effectuer l'action
      await ApiService.togglePinProduct(productId);
      await fetchProducts(currentPage);
      await refreshCredits();
    } catch (error) {
      console.error('Erreur lors de l\'épinglage:', error);

      // Vérifier si c'est une erreur de crédits
      if (error.response?.status === 402) {
        // Le modal est déjà géré par le contexte
        return;
      }

      alert('Erreur lors de l\'épinglage du produit');
    }
  };

  // Fonctions de pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchProducts(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Filtrer les produits par recherche (code, nom, catégorie)
  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const queryNumber = query.replace('#', ''); // Pour recherche par numéro seul

    // Recherche par code produit (#001, #002, ou juste 1, 2)
    if (product.product_code) {
      const code = product.product_code.toLowerCase();
      if (code.includes(query) || code.includes(`#${queryNumber}`)) {
        return true;
      }
      // Recherche par numéro sans le #
      const codeNumber = code.replace('#', '');
      if (codeNumber === queryNumber || codeNumber.endsWith(queryNumber)) {
        return true;
      }
    }

    // Recherche par nom
    if (product.name?.toLowerCase().includes(query)) {
      return true;
    }

    // Recherche par catégorie
    if (product.category?.toLowerCase().includes(query)) {
      return true;
    }

    return false;
  });

  // Helper: extraire toutes les URLs d'images d'un produit
  const getAllImageUrls = (product) => {
    let images = product.images;
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { images = []; }
    }
    if (!Array.isArray(images)) images = [];

    const urls = images.map(img => {
      if (typeof img === 'object' && img.url) return img.url;
      if (typeof img === 'string') return img;
      return null;
    }).filter(Boolean);

    if (urls.length === 0 && product.image_url) {
      urls.push(product.image_url);
    }
    return urls;
  };

  // Helper: extraire l'URL d'image principale
  const getMainImageUrl = (product) => {
    const urls = getAllImageUrls(product);
    return urls.length > 0 ? urls[0] : null;
  };

  // Helper: compter les produits avec images
  const productsWithImages = products.filter(p => {
    let images = p.images;
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { images = []; }
    }
    return Array.isArray(images) && images.length > 0;
  }).length;

  // Helper: parse attributs
  const parseAttributes = (attrs) => {
    if (typeof attrs === 'string') {
      try { return JSON.parse(attrs); } catch { return {}; }
    }
    return attrs || {};
  };

  // Helper: parse tags
  const parseTags = (tags) => {
    if (typeof tags === 'string') {
      try { return JSON.parse(tags); } catch { return []; }
    }
    return Array.isArray(tags) ? tags : [];
  };

  const getAttributeColor = (key) => {
    const colorMap = {
      size: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      taille: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
      couleur: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
      material: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      matériel: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      weight: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      poids: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
    };
    return colorMap[key.toLowerCase()] || 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  };

  const formatKey = (key) => {
    const keyMap = { size: 'Taille', color: 'Couleur', material: 'Matériel', weight: 'Poids' };
    return keyMap[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  // ─── PRODUCT CARD (Mobile: horizontal list item / Desktop: vertical card) ───
  const renderProductCard = (product, index) => {
    const mainImageUrl = getMainImageUrl(product);
    const attributes = parseAttributes(product.attributes);
    const tags = parseTags(product.tags);
    const isMenuOpen = activeMenu === product.id;

    return (
      <motion.div
        key={product.id}
        variants={cardVariants}
        layout
      >
        {/* ── Mobile: Horizontal card ── */}
        <div className="sm:hidden">
          <div className="flex gap-3 bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-800 relative">
            {/* Image */}
            <div
              className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
              onClick={() => mainImageUrl && setLightboxImage({ url: mainImageUrl, images: getAllImageUrls(product), name: product.name })}
            >
              {mainImageUrl ? (
                <img
                  src={mainImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center ${mainImageUrl ? 'hidden' : ''}`}>
                <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>

              {/* Product code badge */}
              {product.product_code && (
                <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {product.product_code}
                </div>
              )}

              {/* Pin star */}
              {product.is_pinned && (
                <div className="absolute top-1.5 right-1.5 bg-amber-400 rounded-full p-1">
                  <Star className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              )}

              {/* Out of stock overlay */}
              {product.stock_quantity === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">Rupture</span>
                </div>
              )}

              {/* Multi-image counter */}
              {getAllImageUrls(product).length > 1 && (
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                  {getAllImageUrls(product).length}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  {/* 3-dot menu */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(isMenuOpen ? null : product.id); }}
                    className="shrink-0 p-1 -mr-1 -mt-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-transform"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Category tag */}
                {product.category && product.category !== 'general' && (
                  <span className="inline-block mt-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                    {product.price?.toLocaleString()} <span className="text-xs font-medium text-gray-400">FCFA</span>
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Stock: <span className={`font-semibold ${product.stock_quantity <= 5 ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400'}`}>
                      {product.stock_quantity}
                    </span>
                  </p>
                </div>

                {/* Quick actions row */}
                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleTogglePin(product.id)}
                    className={`p-2 rounded-xl transition-colors ${product.is_pinned
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                  >
                    <Star className={`w-3.5 h-3.5 ${product.is_pinned ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => openEditDialog(product)}
                    className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Context menu dropdown */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-12 right-3 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 min-w-[140px]"
                >
                  <button
                    onClick={() => { setActiveMenu(null); openEditDialog(product); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Edit className="w-4 h-4" /> Modifier
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); handleTogglePin(product.id); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Star className="w-4 h-4" /> {product.is_pinned ? 'Désépingler' : 'Épingler'}
                  </button>
                  <button
                    onClick={() => { setActiveMenu(null); mainImageUrl && setLightboxImage({ url: mainImageUrl, images: getAllImageUrls(product), name: product.name }); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Eye className="w-4 h-4" /> Voir image
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                  <button
                    onClick={() => { setActiveMenu(null); handleDelete(product.id); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Desktop/Tablet: Vertical card ── */}
        <div className="hidden sm:block group">
          <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300">
            {/* Image */}
            <div
              className="relative aspect-square overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-800"
              onClick={() => mainImageUrl && setLightboxImage({ url: mainImageUrl, images: getAllImageUrls(product), name: product.name })}
            >
              {mainImageUrl ? (
                <img
                  src={mainImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex flex-col items-center justify-center ${mainImageUrl ? 'hidden' : ''}`}>
                <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs text-gray-400 dark:text-gray-500 px-4 text-center line-clamp-1">{product.name}</p>
              </div>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Zoom icon on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-2.5 shadow-lg backdrop-blur-sm">
                  <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
              </div>

              {/* Top badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.product_code && (
                  <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    {product.product_code}
                  </span>
                )}
                {product.category && product.category !== 'general' && (
                  <span className="bg-purple-600/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Stock badge */}
              {product.stock_quantity === 0 && (
                <div className="absolute top-3 right-3">
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    Rupture
                  </span>
                </div>
              )}

              {/* Pin indicator */}
              {product.is_pinned && (
                <div className="absolute bottom-3 right-3 bg-amber-400 rounded-full p-1.5 shadow-md">
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); openEditDialog(product); }}
                  className="flex-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900 shadow-lg text-xs h-9 rounded-xl"
                >
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Modifier
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shadow-lg h-9 w-9 p-0 rounded-xl"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                  {product.name}
                </h3>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleTogglePin(product.id)}
                  className={`shrink-0 p-1.5 rounded-lg transition-colors ${product.is_pinned
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
                    : 'text-gray-300 dark:text-gray-600 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'}`}
                >
                  <Star className={`w-4 h-4 ${product.is_pinned ? 'fill-current' : ''}`} />
                </motion.button>
              </div>

              {product.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="flex items-end justify-between">
                <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {product.price?.toLocaleString()} <span className="text-xs font-normal text-gray-400">FCFA</span>
                </p>
                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                  product.stock_quantity === 0
                    ? 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400'
                    : product.stock_quantity <= 5
                      ? 'bg-orange-50 text-orange-500 dark:bg-orange-950/30 dark:text-orange-400'
                      : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {product.stock_quantity} en stock
                </span>
              </div>

              {/* Attributes */}
              {Object.keys(attributes).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                  {Object.entries(attributes).slice(0, 3).map(([key, value]) => (
                    <span key={key} className={`${getAttributeColor(key)} text-[10px] font-medium px-2 py-0.5 rounded-md`}>
                      {formatKey(key)}: {value}
                    </span>
                  ))}
                  {Object.keys(attributes).length > 3 && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                      +{Object.keys(attributes).length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-[10px] text-gray-400 px-2 py-0.5">+{tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Variants */}
              {product.has_variants && product.variants && product.variants.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 mb-1">
                    {product.variants.length} variante{product.variants.length > 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.variants.slice(0, 3).map((variant, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] h-5 rounded-md">{variant.name}</Badge>
                    ))}
                    {product.variants.length > 3 && (
                      <Badge variant="outline" className="text-[10px] h-5 rounded-md">+{product.variants.length - 3}</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ─── LOADING STATE ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-[3px] border-purple-100 dark:border-purple-900/30" />
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-purple-600 animate-spin" />
            <Package className="absolute inset-0 m-auto w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-24 sm:pb-6">

      {/* ─── HEADER: Desktop ─── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="hidden md:flex md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Mes Produits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {totalProducts} produit{totalProducts > 1 ? 's' : ''} dans votre catalogue
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-5 h-11 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </motion.div>

      {/* ─── SEARCH BAR ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-11 w-full bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/30 focus:bg-white dark:focus:bg-gray-800 transition-all"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </motion.button>
          )}
        </div>

        {/* Search results indicator */}
        <AnimatePresence>
          {searchQuery && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1"
            >
              {filteredProducts.length === 0 ? (
                <span className="text-red-400">Aucun produit pour &laquo; {searchQuery} &raquo;</span>
              ) : (
                <span>{filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouv&eacute;{filteredProducts.length > 1 ? 's' : ''}</span>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── KPI STRIP ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden">
          {[
            { label: 'Produits', value: totalProducts },
            { label: 'Épinglés', value: products.filter(p => p.is_pinned).length },
            { label: 'Catégories', value: new Set(products.map(p => p.category)).size },
            { label: 'Photos', value: productsWithImages, hideOnMobile: true },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white dark:bg-gray-900 p-4 ${stat.hideOnMobile ? 'hidden sm:block' : ''}`}>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── PRODUCTS LIST/GRID ─── */}
      {filteredProducts.length === 0 && !searchQuery ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16 px-6"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6">
            <Package className="w-9 h-9 text-gray-400 dark:text-gray-500 -rotate-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun produit</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto leading-relaxed">
            Commencez par ajouter votre premier produit pour le rendre visible à vos clients
          </p>
          <Button
            onClick={openCreateDialog}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 h-12 px-8 rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un produit
          </Button>
        </motion.div>
      ) : filteredProducts.length === 0 && searchQuery ? (
        /* No search results */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-6"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-9 h-9 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun résultat</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Aucun produit ne correspond à &laquo; {searchQuery} &raquo;
          </p>
          <Button
            onClick={() => setSearchQuery('')}
            variant="outline"
            className="h-10 px-6 rounded-xl text-sm"
          >
            <X className="w-3.5 h-3.5 mr-2" />
            Effacer la recherche
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Mobile: vertical list / Desktop: grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2.5 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4"
          >
            {filteredProducts.map((product, index) => renderProductCard(product, index))}
          </motion.div>

          {/* ─── PAGINATION ─── */}
          {totalPages > 1 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-center gap-2 pt-4"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-10 w-10 p-0 rounded-xl border-gray-200 dark:border-gray-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-10 min-w-[40px] px-3 rounded-xl text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-10 w-10 p-0 rounded-xl border-gray-200 dark:border-gray-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* ─── FAB: Mobile ─── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
        className="fixed bottom-24 right-4 z-50 sm:hidden"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={openCreateDialog}
          className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 pl-4 pr-5 h-12 rounded-full shadow-lg shadow-gray-900/20 dark:shadow-white/20 active:shadow-md transition-shadow"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-semibold">Ajouter</span>
        </motion.button>
      </motion.div>

      {/* ─── DIALOG: Desktop ─── */}
      <Dialog open={showDialog && isDesktop} onOpenChange={setShowDialog}>
        <DialogContent className="hidden sm:block max-w-2xl max-h-[90vh] overflow-y-auto mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={editingProduct}
          />
        </DialogContent>
      </Dialog>

      {/* ─── CREDITS MODAL ─── */}
      <InsufficientCreditsModal
        isOpen={insufficientCreditsModal.isOpen}
        onClose={closeInsufficientCreditsModal}
        currentBalance={insufficientCreditsModal.currentBalance}
        requiredCredits={insufficientCreditsModal.requiredCredits}
        actionName={insufficientCreditsModal.actionName}
      />

      {/* ─── FULLSCREEN MOBILE: ProductForm ─── */}
      <AnimatePresence>
        {showDialog && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sm:hidden fixed inset-0 z-[70] flex"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDialog(false)}
            />
            {/* Sheet content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative flex flex-col bg-white dark:bg-gray-900 w-full h-full overscroll-contain"
            >
              {/* Header mobile */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  aria-label="Fermer"
                  onClick={() => setShowDialog(false)}
                  className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </div>
                <div className="w-9" />
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4">
                  <ProductForm
                    onSubmit={handleSubmit}
                    onCancel={() => setShowDialog(false)}
                    initialData={editingProduct}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LIGHTBOX ─── */}
      <ImageLightbox
        imageUrl={lightboxImage?.url}
        images={lightboxImage?.images || []}
        productName={lightboxImage?.name}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};

export default ProductsPage;
