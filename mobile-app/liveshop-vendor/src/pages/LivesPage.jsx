import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LiveDetail from './LiveDetail';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Copy,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Share2,
  Eye,
  Users,
  Calendar,
  Package,
  Link,
  Globe,
  Radio,
  Zap,
  Heart,
  MessageCircle,
  Send,
  CheckCircle,
  ShoppingCart,
  CopyPlus,
  Cog,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MoreVertical
} from 'lucide-react';
import { getPublicLink } from '../config/domains';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function LivesPage() {
  const { seller } = useAuth();
  const [lives, setLives] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [liveCreated, setLiveCreated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLive, setSelectedLive] = useState(null);
  const [copiedLiveId, setCopiedLiveId] = useState(null);
  const [search] = useState('');
  const [pageSize] = useState(5);
  const [deletingId, setDeletingId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);

  // Récupérer tous les lives du vendeur
  useEffect(() => {
    if (!seller?.id) return;
    async function fetchLives() {
      try {
        setLoading(true);
        const res = await api.getLives(seller.id);
        setLives(Array.isArray(res) ? res : (res.lives || []));
      } catch {
        setLives([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLives();
  }, [seller, liveCreated]);

  // Récupérer les produits du vendeur pour le formulaire
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await api.getProducts();
        setProducts(Array.isArray(res) ? res : (res.products || []));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Fermer le menu contextuel au clic extérieur
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  const handleProductSelect = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleCreateLive = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !date || selectedProducts.length === 0) {
      setError('Remplis tous les champs et sélectionne au moins un produit.');
      return;
    }
    try {
      setLoading(true);
      const sellerId = seller?.id;
      const liveRes = await api.createLive({ title, date, sellerId });
      await api.associateProductsToLive(liveRes.id, selectedProducts);
      setLiveCreated(liveRes);
      setShowCreate(false);
      setTitle('');
      setDate('');
      setSelectedProducts([]);
      setSuccess('Session créée avec succès !');
    } catch {
      setError('Erreur lors de la création de la session.');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un live
  const handleDeleteLive = async (liveId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette session ?')) return;
    setDeletingId(liveId);
    try {
      await api.deleteLive(liveId);
      setLives(lives => lives.filter(l => l.id !== liveId));
    } catch {
      alert('Erreur lors de la suppression de la session.');
    } finally {
      setDeletingId(null);
    }
  };

  // Recherche/tri
  const [sortField] = useState('date');
  const [sortDirection] = useState('desc');
  const advancedFilteredLives = lives
    .filter(live => live.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'date') {
        valA = new Date(valA);
        valB = new Date(valB);
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  const totalPages = Math.ceil(advancedFilteredLives.length / pageSize);
  const advancedPaginatedLives = advancedFilteredLives.slice((page - 1) * pageSize, page * pageSize);

  // Badge statut live
  const getLiveStatus = (live) => {
    const now = new Date();
    const liveDate = new Date(live.date);
    return liveDate >= new Date(now.toDateString()) ? 'En cours' : 'Terminé';
  };

  // Handler duplication
  const handleDuplicateLive = (live) => {
    setTitle(live.title + ' (copie)');
    setDate('');
    setSelectedProducts(live.products ? live.products.map(p => p.id) : []);
    setShowCreate(true);
  };

  // Lien public de la boutique
  const getPublicShopLink = () => {
    if (!seller?.public_link_id) return '#';
    return getPublicLink(seller.public_link_id);
  };

  // Lien public d'un live
  const getLivePublicLink = (live) => {
    if (!seller?.public_link_id) return '#';
    return `${getPublicLink(seller.public_link_id)}/live/${live.slug}`;
  };

  const handleCopyLink = async (url, liveId = null) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } catch (err) { console.error('Erreur lors de la copie:', err); }
        document.body.removeChild(textArea);
      }
      setCopiedLiveId(liveId);
      setSuccess('Lien copié !');
      setTimeout(() => { setSuccess(''); setCopiedLiveId(null); }, 1500);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      setError('Erreur lors de la copie du lien');
      setTimeout(() => { setError(''); }, 3000);
    }
  };

  // Dernier live créé (le plus récent)
  const lastLive = lives.length > 0 ? [...lives].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;

  // Stats
  const activeLives = lives.filter(l => getLiveStatus(l) === 'En cours').length;
  const totalLives = lives.length;

  return (
    <div className="space-y-4 md:space-y-6 pb-24 sm:pb-6">

      {/* ─── HEADER ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        {/* Desktop header */}
        <div className="hidden md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Mes Sessions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {totalLives} session{totalLives > 1 ? 's' : ''} de vente
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md shadow-purple-600/20 px-5 h-11 rounded-xl text-sm font-medium"
          >
            {showCreate ? (
              <><X className="w-4 h-4 mr-2" /> Annuler</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Nouvelle session</>
            )}
          </Button>
        </div>
      </motion.div>

      {/* ─── SUCCESS/ERROR TOASTS ─── */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-medium text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm font-medium text-red-600 dark:text-red-400"
          >
            <X className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── KPI STRIP ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-3 sm:p-4 text-white">
            <Radio className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-xl sm:text-2xl font-bold leading-none">{totalLives}</p>
            <p className="text-[10px] sm:text-xs mt-1 opacity-70 font-medium">Sessions</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-3 sm:p-4 text-white">
            <Zap className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-xl sm:text-2xl font-bold leading-none">{activeLives}</p>
            <p className="text-[10px] sm:text-xs mt-1 opacity-70 font-medium">En cours</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3 sm:p-4 text-white">
            <Package className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-xl sm:text-2xl font-bold leading-none">
              {lives.reduce((sum, l) => sum + (l.products ? l.products.length : 0), 0)}
            </p>
            <p className="text-[10px] sm:text-xs mt-1 opacity-70 font-medium">Produits</p>
          </div>
        </div>
      </motion.div>

      {/* ─── QUICK LINKS ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        {/* Shop link */}
        {seller?.public_link_id && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">Lien de la boutique</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{getPublicShopLink()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopyLink(getPublicShopLink(), 'shop')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  copiedLiveId === 'shop'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {copiedLiveId === 'shop' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLiveId === 'shop' ? 'Copié !' : 'Copier'}
              </motion.button>
              <a
                href={getPublicShopLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Voir la page
              </a>
            </div>
          </div>
        )}

        {/* Last live link */}
        {lastLive && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">{lastLive.title}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(lastLive.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopyLink(getLivePublicLink(lastLive), lastLive.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  copiedLiveId === lastLive.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {copiedLiveId === lastLive.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLiveId === lastLive.id ? 'Copié !' : 'Copier'}
              </motion.button>
              <a
                href={getLivePublicLink(lastLive)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Voir la page
              </a>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── CREATE FORM ─── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <form onSubmit={handleCreateLive} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Nouvelle session de vente</h3>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Titre de la session</label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="Ex: Vente Flash Bijoux"
                  className="h-11 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date et heure
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full h-11 bg-gray-50 dark:bg-gray-800 border-0 rounded-xl px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Produits ({selectedProducts.length} sélectionné{selectedProducts.length > 1 ? 's' : ''})
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                  {products.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">Aucun produit disponible</p>
                  )}
                  {products.map(prod => (
                    <label
                      key={prod.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                        selectedProducts.includes(prod.id)
                          ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(prod.id)}
                        onChange={() => handleProductSelect(prod.id)}
                        className="accent-purple-600 w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-900 dark:text-white flex-1 line-clamp-1">{prod.name}</span>
                      {prod.price && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{prod.price?.toLocaleString()} F</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false);
                    setTitle('');
                    setDate('');
                    setSelectedProducts([]);
                    setError('');
                  }}
                  className="flex-1 h-11 rounded-xl text-sm"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md shadow-purple-600/20"
                >
                  {loading ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" /> Création...</>
                  ) : (
                    <><Zap className="w-4 h-4 mr-2" /> Créer la session</>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SESSIONS LIST ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Toutes les sessions
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {advancedFilteredLives.length} session{advancedFilteredLives.length > 1 ? 's' : ''}
          </span>
        </div>

        {advancedPaginatedLives.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6">
              <Radio className="w-9 h-9 text-purple-500 dark:text-purple-400 -rotate-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune session</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto leading-relaxed">
              Créez votre première session de vente pour commencer à vendre en direct
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md shadow-purple-600/20 h-12 px-8 rounded-xl text-sm font-medium"
            >
              <Zap className="w-4 h-4 mr-2" /> Créer une session
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2.5"
          >
            {advancedPaginatedLives.map(live => {
              const status = getLiveStatus(live);
              const isActive = status === 'En cours';
              const isMenuOpen = activeMenu === live.id;

              return (
                <motion.div key={live.id} variants={cardVariants} layout>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-sm transition-shadow">
                    {/* Card content */}
                    <div className="p-4">
                      {/* Top row: title + status + menu */}
                      <div className="flex items-start gap-3">
                        {/* Status indicator */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isActive
                            ? 'bg-red-50 dark:bg-red-950/30'
                            : 'bg-gray-50 dark:bg-gray-800'
                        }`}>
                          {isActive ? (
                            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {live.title}
                            </h3>
                            {isActive ? (
                              <span className="shrink-0 inline-flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                LIVE
                              </span>
                            ) : (
                              <span className="shrink-0 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                Terminé
                              </span>
                            )}
                          </div>

                          {/* Meta info */}
                          <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(live.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {live.products ? live.products.length : '?'} produit{(live.products?.length || 0) > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Mobile: 3-dot menu */}
                        <div className="relative sm:hidden">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(isMenuOpen ? null : live.id); }}
                            className="p-1.5 -mr-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </motion.button>

                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-8 right-0 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 min-w-[160px]"
                              >
                                <button
                                  onClick={() => { setActiveMenu(null); handleCopyLink(getLivePublicLink(live), live.id); }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <Share2 className="w-4 h-4" /> Partager
                                </button>
                                <a
                                  href={getLivePublicLink(live)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setActiveMenu(null)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <Eye className="w-4 h-4" /> Voir
                                </a>
                                <button
                                  onClick={() => { setActiveMenu(null); setSelectedLive(live); }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <Cog className="w-4 h-4" /> Paramètres
                                </button>
                                <button
                                  onClick={() => { setActiveMenu(null); handleDuplicateLive(live); }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <CopyPlus className="w-4 h-4" /> Dupliquer
                                </button>
                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                                <button
                                  onClick={() => { setActiveMenu(null); handleDeleteLive(live.id); }}
                                  disabled={deletingId === live.id}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" /> Supprimer
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      {/* Mobile: Quick share + view */}
                      <div className="flex gap-2 mt-3 sm:hidden">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopyLink(getLivePublicLink(live), live.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            copiedLiveId === live.id
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {copiedLiveId === live.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                          {copiedLiveId === live.id ? 'Copié !' : 'Partager'}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedLive(live)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
                        >
                          <Cog className="w-3.5 h-3.5" /> Gérer
                        </motion.button>
                      </div>

                      {/* Desktop: Full action row */}
                      <div className="hidden sm:flex gap-2 mt-3">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopyLink(getLivePublicLink(live), live.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            copiedLiveId === live.id
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {copiedLiveId === live.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                          {copiedLiveId === live.id ? 'Copié !' : 'Partager'}
                        </motion.button>
                        <a
                          href={getLivePublicLink(live)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </a>
                        <button
                          onClick={() => setSelectedLive(live)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                        >
                          <Cog className="w-3.5 h-3.5" /> Paramètres
                        </button>
                        <button
                          onClick={() => handleDuplicateLive(live)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <CopyPlus className="w-3.5 h-3.5" /> Dupliquer
                        </button>
                        <button
                          onClick={() => handleDeleteLive(live.id)}
                          disabled={deletingId === live.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* ─── PAGINATION ─── */}
      {totalPages > 1 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-10 w-10 p-0 rounded-xl border-gray-200 dark:border-gray-700 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`h-10 min-w-[40px] px-3 rounded-xl text-sm font-medium transition-all ${
                    page === pageNum
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-10 w-10 p-0 rounded-xl border-gray-200 dark:border-gray-700 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* ─── FAB: Mobile ─── */}
      {!showCreate && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
          className="fixed bottom-24 right-4 z-50 sm:hidden"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white pl-4 pr-5 h-12 rounded-full shadow-lg shadow-amber-500/30 active:shadow-md transition-shadow"
          >
            <Zap className="w-5 h-5" />
            <span className="text-sm font-semibold">Nouvelle</span>
          </motion.button>
        </motion.div>
      )}

      {/* ─── LIVE DETAIL MODAL ─── */}
      {selectedLive && <LiveDetail live={selectedLive} onClose={() => setSelectedLive(null)} />}
    </div>
  );
}
