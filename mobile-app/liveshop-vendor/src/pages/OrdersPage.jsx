import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useCreditsContext } from '../contexts/CreditsContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  RefreshCw,
  Eye,
  Printer,
  QrCode,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Trash2,
  DollarSign,
  Package,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MoreVertical,
  Phone,
  MapPin,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import ApiService from '../services/api';
import QRCodeModal from '../components/QRCodeModal';
import InsufficientCreditsModal from '../components/InsufficientCreditsModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { getImageUrl } from '../config/domains';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
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

const OrdersPage = () => {
  const { refreshCredits } = useAuth();
  const {
    useCreditsForAction,
    insufficientCreditsModal,
    closeInsufficientCreditsModal
  } = useCreditsContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedOrderForQR, setSelectedOrderForQR] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Debounce pour éviter les appels multiples
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Écouter les événements globaux pour mise à jour de la liste
  useEffect(() => {
    const handleNewOrder = () => {
      console.log('🔄 [ORDERS] Nouvelle commande détectée, mise à jour de la liste...');
      fetchOrders();
    };
    const handleOrderStatusUpdate = () => {
      console.log('🔄 [ORDERS] Statut mis à jour, mise à jour de la liste...');
      fetchOrders();
    };
    window.addEventListener('newNotifications', handleNewOrder);
    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdate);
    return () => {
      window.removeEventListener('newNotifications', handleNewOrder);
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdate);
    };
  }, []);

  // Rafraîchir quand on change de page ou de filtre
  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeTab]);

  // Fermer le menu contextuel au clic extérieur
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  const fetchOrders = async () => {
    if (isFetching) {
      console.log('🔄 Appel API déjà en cours, ignoré');
      return;
    }
    try {
      setIsFetching(true);
      setLoading(true);
      let status = null;
      if (activeTab !== 'all') {
        status = activeTab;
      }
      const data = await ApiService.getOrders(status, currentPage, ordersPerPage);
      if (data.orders && data.pagination) {
        setOrders(data.orders);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalOrders(data.pagination.totalOrders || data.orders.length);
      } else {
        setOrders(data.orders || data);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalOrders(data.orders?.length || data.length || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleViewOrder = async (orderId) => {
    try {
      const data = await ApiService.getOrderDetail(orderId);
      setSelectedOrder(data.order);
      setShowOrderDialog(true);
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const result = await useCreditsForAction('PROCESS_ORDER', 'traiter cette commande');
      if (!result.success) return;
      await ApiService.updateOrderStatus(orderId, newStatus);
      await refreshCredits();
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      toast.success(`Statut de la commande #${orderId} mis à jour`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await ApiService.deleteOrder(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      if (selectedOrder && selectedOrder.id === orderId) {
        setShowOrderDialog(false);
        setSelectedOrder(null);
      }
      toast.success(`Commande #${orderId} supprimée`);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de la commande');
    }
  };

  const handlePrintTicket = async (orderId) => {
    try {
      const token = localStorage.getItem('liveshop_token');
      if (!token) {
        toast.error('Token d\'authentification manquant');
        return;
      }
      const isProd = window.location.hostname.includes('livelink.store');
      const baseUrl = isProd ? 'https://api.livelink.store' : `${window.location.protocol}//${window.location.hostname}:3001`;
      const ticketUrl = `${baseUrl}/api/orders/${orderId}/delivery-ticket`;
      const response = await fetch(ticketUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur lors de la génération du PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `livraison-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Ticket téléchargé');
    } catch (error) {
      console.error('Erreur lors du téléchargement du ticket:', error);
      toast.error('Erreur lors du téléchargement du ticket');
    }
  };

  const handleShowQRCode = (orderId) => {
    setSelectedOrderForQR(orderId);
    setShowQRModal(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'En attente',
        icon: Clock,
        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        iconBg: 'bg-gray-100 dark:bg-gray-800'
      },
      paid: {
        label: 'Payé',
        icon: DollarSign,
        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        iconBg: 'bg-gray-100 dark:bg-gray-800'
      },
      delivered: {
        label: 'Livré & Payé',
        icon: Truck,
        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        iconBg: 'bg-gray-100 dark:bg-gray-800'
      },
      cancelled: {
        label: 'Annulé',
        icon: XCircle,
        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        iconBg: 'bg-gray-100 dark:bg-gray-800'
      }
    };
    return configs[status] || configs.pending;
  };

  const tabs = [
    { key: 'all', label: 'Toutes' },
    { key: 'pending', label: 'En attente' },
    { key: 'paid', label: 'Payées' },
    { key: 'delivered', label: 'Livrées' }
  ];

  // ─── LOADING STATE ───
  if (loading && orders.length === 0) {
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
            <ShoppingCart className="absolute inset-0 m-auto w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-24 sm:pb-6">

      {/* ─── HEADER ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="hidden sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Commandes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {totalOrders} commande{totalOrders > 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="h-10 px-4 rounded-xl text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Mobile: pull-to-refresh button */}
        <div className="sm:hidden flex justify-end">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* ─── TABS ─── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
        <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
              className={`flex-1 min-w-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.key === 'all' && totalOrders > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'all'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {totalOrders}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── ORDERS LIST ─── */}
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16 px-6"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6">
            <ShoppingCart className="w-9 h-9 text-gray-400 dark:text-gray-500 -rotate-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune commande</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
            {activeTab === 'all'
              ? 'Vous n\'avez pas encore reçu de commandes'
              : `Aucune commande ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}`
            }
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2.5 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0"
        >
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isMenuOpen = activeMenu === order.id;

            return (
              <motion.div key={order.id} variants={cardVariants} layout>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="p-4">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl ${statusConfig.iconBg} flex items-center justify-center shrink-0`}>
                          <StatusIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">#{order.id}</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>

                        {/* Mobile menu */}
                        <div className="relative sm:hidden">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(isMenuOpen ? null : order.id); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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
                                className="absolute top-8 right-0 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 min-w-[150px]"
                              >
                                <button
                                  onClick={() => { setActiveMenu(null); handleViewOrder(order.id); }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <Eye className="w-4 h-4" /> Voir détail
                                </button>
                                <button
                                  onClick={() => { setActiveMenu(null); handlePrintTicket(order.id); }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <Printer className="w-4 h-4" /> Ticket PDF
                                </button>
                                <button
                                  onClick={() => { setActiveMenu(null); handleShowQRCode(order.id); }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <QrCode className="w-4 h-4" /> QR Code
                                </button>
                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      onClick={() => { setActiveMenu(null); setOrderToDelete(order); }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    >
                                      <Trash2 className="w-4 h-4" /> Supprimer
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer la commande</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Supprimer la commande #{order.id} ? Cette action est irréversible.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-red-600 hover:bg-red-700">
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Customer info */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.customer_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer_phone}</p>
                      </div>
                    </div>

                    {/* Product + Price */}
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{order.product?.name}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500">Qté: {order.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0 ml-3">
                        {order.total_price.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">F</span>
                      </p>
                    </div>

                    {/* Comment indicator */}
                    {order.comment_data && (
                      <div className="flex items-center gap-2 mt-2.5 px-2.5 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                        <MessageCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Commentaire client</span>
                        {order.comment_data.rating && (
                          <span className="text-[10px] font-bold text-blue-500 ml-auto">{order.comment_data.rating}/5</span>
                        )}
                      </div>
                    )}

                    {/* Desktop actions */}
                    <div className="hidden sm:flex gap-2 mt-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewOrder(order.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePrintTicket(order.id)}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShowQRCode(order.id)}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </motion.button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setOrderToDelete(order)}
                            className="p-2 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la commande</AlertDialogTitle>
                            <AlertDialogDescription>
                              Supprimer la commande #{orderToDelete?.id} ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteOrder(orderToDelete?.id)} className="bg-red-600 hover:bg-red-700">
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Mobile quick actions */}
                    <div className="flex gap-2 mt-3 sm:hidden">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewOrder(order.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400"
                      >
                        <Eye className="w-3.5 h-3.5" /> Voir détail
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePrintTicket(order.id)}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      >
                        <Printer className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ─── PAGINATION ─── */}
      {totalPages > 1 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="h-10 w-10 p-0 rounded-xl border-gray-200 dark:border-gray-700 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

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

      {/* ─── ORDER DETAIL DIALOG ─── */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Commande #{selectedOrder?.id}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Passée le {selectedOrder && new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5">
              {/* Status + changer */}
              <div className="flex items-center justify-between">
                {(() => {
                  const sc = getStatusConfig(selectedOrder.status);
                  const Icon = sc.icon;
                  return (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${sc.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {sc.label}
                    </div>
                  );
                })()}
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                >
                  <SelectTrigger className="w-36 h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="delivered">Livré & Payé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Client</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{selectedOrder.customer_phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{selectedOrder.customer_address}</span>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Commande</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Produit</span>
                    <span className="text-gray-900 dark:text-white font-medium">{selectedOrder.product?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantité</span>
                    <span className="text-gray-900 dark:text-white">{selectedOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Prix unitaire</span>
                    <span className="text-gray-900 dark:text-white">{selectedOrder.product?.price?.toLocaleString()} F</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white font-bold">Total</span>
                    <span className="text-gray-900 dark:text-white font-bold">{selectedOrder.total_price.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Paiement</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300 capitalize">{selectedOrder.payment_method}</span>
                  {selectedOrder.payment_proof_url && (
                    <a
                      href={getImageUrl(selectedOrder.payment_proof_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Voir la preuve
                    </a>
                  )}
                </div>
              </div>

              {/* Comment */}
              {selectedOrder.comment && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Commentaire</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{selectedOrder.comment}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePrintTicket(selectedOrder.id)}
                  className="flex-1 h-11 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 text-sm"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
                <Button
                  onClick={() => handleShowQRCode(selectedOrder.id)}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl text-sm"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </div>

              {/* Delete */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 rounded-xl text-sm text-red-500 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Supprimer cette commande
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer la commande #{selectedOrder.id}</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible et supprimera toutes les données associées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteOrder(selectedOrder.id)} className="bg-red-600 hover:bg-red-700">
                        Oui, supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        orderId={selectedOrderForQR}
      />

      {/* Modal de crédits insuffisants */}
      <InsufficientCreditsModal
        isOpen={insufficientCreditsModal.isOpen}
        onClose={closeInsufficientCreditsModal}
        currentBalance={insufficientCreditsModal.currentBalance}
        requiredCredits={insufficientCreditsModal.requiredCredits}
        actionName={insufficientCreditsModal.actionName}
      />
    </div>
  );
};

export default OrdersPage;
