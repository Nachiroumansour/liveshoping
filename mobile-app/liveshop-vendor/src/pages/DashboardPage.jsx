import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useCreditsModuleStatus from '../hooks/useCreditsModuleStatus';
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  Copy,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Download,
  Plus,
  Eye,
  FileText,
  Users,
  DollarSign,
  Activity,
  Mic,
  TestTube,
  Coins,
  Share2,
  MessageCircle,
  X,
  Zap,
} from 'lucide-react';
import VoiceControls from '../components/VoiceControls';
import ApiService from '../services/api';
import { getPublicLink, getBackendUrl } from '../config/domains';


export default function DashboardPage() {
  const { seller, loading } = useAuth();
  const navigate = useNavigate();
  const { isEnabled: creditsEnabled } = useCreditsModuleStatus();
  const [stats, setStats] = useState({ 
    totalCA: 0, 
    totalOrders: 0, 
    topProduct: null,
    total_revenue: 0,
    total_orders: 0,
    pending_orders: 0,
    paid_orders: 0
  });
  const [sellerCredits, setSellerCredits] = useState(seller?.credits || 0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoUpdating, setAutoUpdating] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${getBackendUrl()}/api/public/sellers/${seller.id}/report`);
        const csv = await res.text();
        // Simple stats parsing (for demo)
        const lines = csv.split('\n').slice(1).filter(Boolean);
        let totalCA = 0, totalOrders = 0, productCount = {};
        lines.forEach(line => {
          const cols = line.split(',');
          const total = parseFloat(cols[5]) || 0;
          const prod = cols[3];
          totalCA += total;
          totalOrders++;
          productCount[prod] = (productCount[prod] || 0) + 1;
        });
        const topProduct = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        setStats(prev => ({ 
          ...prev,
          totalCA, 
          totalOrders, 
          topProduct,
          total_revenue: totalCA,
          total_orders: totalOrders
        }));
      } catch {
        // Garder les stats existantes en cas d'erreur
      }
    }
    if (seller?.id) fetchStats();
  }, [seller]);

  useEffect(() => {
    fetchDashboardData();
    
    // 🚫 SUPPRIMÉ : Rafraîchissement automatique toutes les 30 secondes
    // ✅ REMPLACÉ PAR : WebSocket en temps réel uniquement
    
    // Pas d'intervalle - on compte sur le WebSocket pour les mises à jour
    // return () => clearInterval(interval);
  }, []);

  // Écouter les événements globaux pour mise à jour du dashboard
  useEffect(() => {
    if (!seller) return;

    console.log('🔧 Configuration des listeners dashboard...');
    
    // Écouter les nouvelles commandes pour mise à jour du dashboard
    const handleNewOrder = () => {
      console.log('🔄 [DASHBOARD] Nouvelle commande détectée, mise à jour...');
      setAutoUpdating(true);
      setTimeout(() => setAutoUpdating(false), 2000);
    };

    // Écouter les mises à jour de statut
    const handleOrderStatusUpdate = () => {
      console.log('🔄 [DASHBOARD] Statut mis à jour, mise à jour...');
      setAutoUpdating(true);
      setTimeout(() => setAutoUpdating(false), 2000);
    };

    // Écouter les événements globaux (pas WebSocket direct)
    window.addEventListener('newNotifications', handleNewOrder);
    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdate);

    return () => {
      console.log('🧹 Nettoyage des listeners dashboard...');
      window.removeEventListener('newNotifications', handleNewOrder);
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdate);
    };
  }, [seller?.id]);

  // Mettre à jour les crédits du vendeur
  useEffect(() => {
    if (seller?.credits !== undefined) {
      setSellerCredits(seller.credits);
    }
  }, [seller?.credits]);

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);
      
      // 🔧 OPTIMISATION : Appels API intelligents
      const [statsData, ordersData] = await Promise.all([
        ApiService.getOrderStats(),
        ApiService.getOrders()
      ]);
      
      // Crédits déjà chargés dans AuthContext, pas besoin de recharger

      // 🔧 OPTIMISATION : Mise à jour conditionnelle
      setStats(prev => {
        const newStats = { ...prev, ...statsData.stats };
        // Ne mettre à jour que si les données ont changé
        return JSON.stringify(prev) === JSON.stringify(newStats) ? prev : newStats;
      });
      
      setRecentOrders(ordersData.orders.slice(0, 5)); // 5 dernières commandes
      
      // Crédits déjà gérés par AuthContext
      
      console.log('✅ Dashboard mis à jour via WebSocket/manuel');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du dashboard:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };


  const copyPublicLink = () => {
    const link = getPublicLink(seller.public_link_id);
    navigator.clipboard.writeText(link).then(() => {
      // Effet visuel du bouton
      setCopied(true);
      
      // Notification de succès
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'success',
          message: 'Lien copié dans le presse-papiers !'
        }
      });
      window.dispatchEvent(event);
      
      // Remettre l'état normal après 2 secondes
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(() => {
      // Notification d'erreur
      const event = new CustomEvent('showToast', {
        detail: {
          type: 'error',
          message: 'Erreur lors de la copie du lien'
        }
      });
      window.dispatchEvent(event);
    });
  };

  const openPublicLink = () => {
    const link = getPublicLink(seller.public_link_id);
    window.open(link, '_blank');
  };

  const handleShareWhatsApp = () => {
    const link = getPublicLink(seller.public_link_id);
    const text = `Découvrez ma boutique en ligne ! 🛍️\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    const link = getPublicLink(seller.public_link_id);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
  };

  const handleDownloadGlobalReport = () => {
    window.open(`${getBackendUrl()}/api/public/sellers/${seller.id}/report`, '_blank');
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'paid': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'delivered': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'En attente',
      'paid': 'Payé',
      'delivered': 'Livré'
    };
    return labels[status] || status;
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full px-4 py-2 lg:py-8">
        {/* Header avec salutation et actions */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-3 lg:p-6 text-white mb-4 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 lg:mb-6">
            <div className="flex items-center justify-between w-full mb-3 lg:mb-0">
              <div>
                <h1 className="text-xl lg:text-3xl font-bold">{seller.name}</h1>
                <p className="text-purple-100 text-sm lg:text-lg">Tableau de bord</p>
              </div>
              <div className="flex items-center gap-2">
                {autoUpdating && (
                  <div className="flex items-center gap-1 text-green-200 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                <button
                  onClick={() => navigate('/lives?create=flash')}
                  className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors lg:hidden"
                >
                  Vente flash
                </button>
                <Button
                  onClick={handleRefresh}
                  variant="secondary"
                  size="sm"
                  disabled={refreshing}
                  className="bg-white/20 hover:bg-white/30"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Lien public + Partage */}
          <div className="bg-white/10 rounded-xl p-2 lg:p-4 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="bg-white/20 px-3 py-2 rounded-lg text-xs lg:text-sm truncate font-mono flex items-center">
                  <span className="text-purple-200">{getPublicLink(seller.public_link_id).replace(`/${seller.public_link_id}`, '/')}</span>
                  <span className="text-white font-bold">{seller.public_link_id}</span>
                </div>
              </div>
              <div className="flex space-x-2 shrink-0">
                <Button
                  onClick={copyPublicLink}
                  size="sm"
                  variant="secondary"
                  className={`transition-all duration-300 ${
                    copied
                      ? 'bg-green-500/80 hover:bg-green-600/80 text-white scale-110'
                      : 'bg-white/20 hover:bg-white/30 hover:scale-105'
                  }`}
                  title={copied ? "Lien copié !" : "Copier le lien"}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={openPublicLink}
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-105"
                  title="Ouvrir la boutique"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setShowShareSheet(true)}
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-105"
                  title="Partager"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">Chiffre d'affaires</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-green-600">
                {stats?.total_revenue?.toLocaleString() || stats.totalCA.toLocaleString()} FCFA
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total des ventes</p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            onClick={() => navigate('/orders')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">Commandes totales</CardTitle>
              <ShoppingBag className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-purple-600">
                {stats?.total_orders || stats.totalOrders}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Toutes les commandes</p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            onClick={() => navigate('/orders?status=pending')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-yellow-600">
                {stats?.pending_orders || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Commandes en cours</p>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            onClick={() => navigate('/orders?status=paid')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-300">Payées</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-blue-600">
                {stats?.paid_orders || 0}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Commandes finalisées</p>
            </CardContent>
          </Card>
        </div>

        {/* Carte des crédits séparée */}
        {/* {credits && (
          <div className="mb-6 lg:mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-100 mb-1">Crédits Disponibles</h3>
                    <p className="text-green-100 text-sm">Solde actuel de votre compte</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white mb-1">
                      {credits.balance}
                    </div>
                    <p className="text-green-100 text-sm">crédits</p>
                  </div>
                  <div className="text-center">
                    <Coins className="w-12 h-12 text-green-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )} */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Commandes récentes */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl dark:text-white">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  Commandes récentes
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Les 5 dernières commandes reçues
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">Aucune commande pour le moment</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Partagez votre lien de boutique pour recevoir vos premières commandes !
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-700/50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{order.customer_name}</h4>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {order.product?.name} × {order.quantity}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-600 text-lg">
                            {order.total_price.toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl dark:text-white">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Actions rapides
                </CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => navigate('/products')}
                    variant="outline" 
                    className="h-auto p-6 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-200 transition-all"
                  >
                    <Plus className="w-8 h-8 text-purple-600" />
                    <span className="font-medium">Gérer les produits</span>
                    <span className="text-xs text-gray-500">Ajouter, modifier, supprimer</span>
                  </Button>

                  <Button 
                    onClick={() => navigate('/orders')}
                    variant="outline" 
                    className="h-auto p-6 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-all"
                  >
                    <ShoppingBag className="w-8 h-8 text-blue-600" />
                    <span className="font-medium">Voir les commandes</span>
                    <span className="text-xs text-gray-500">Gérer et suivre</span>
                  </Button>

                  <Button 
                    onClick={() => navigate('/lives')}
                    variant="outline" 
                    className="h-auto p-6 flex flex-col items-center space-y-2 hover:bg-green-50 hover:border-green-200 transition-all"
                  >
                    <Users className="w-8 h-8 text-green-600" />
                    <span className="font-medium">Gérer les sessions</span>
                    <span className="text-xs text-gray-500">Créer, organiser</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale - Rapports */}
          <div className="space-y-6 lg:space-y-8">
            {/* Contrôles des notifications vocales */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg lg:text-xl">
                  <Mic className="w-5 h-5 mr-2 text-purple-600" />
                  Notifications vocales
                </CardTitle>
                <CardDescription className="text-sm">
                  Configurez les annonces vocales pendant vos sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceControls />
              </CardContent>
            </Card>

            {/* Section Rapports */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg lg:text-xl">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Rapports & Analyses
                </CardTitle>
                <CardDescription className="text-sm">
                  Exportez vos données et visualisez vos performances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleDownloadGlobalReport}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Rapport global (CSV)
                </Button>
                
                <Button 
                  onClick={() => navigate('/lives')}
                  variant="outline" 
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Rapports par session
                </Button>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 lg:p-4 border border-green-100">
                  <h4 className="font-medium text-green-800 mb-2 text-sm lg:text-base">📊 Graphiques à venir</h4>
                  <p className="text-xs lg:text-sm text-green-700">
                    Bientôt disponible : graphiques de ventes, tendances, et analyses détaillées
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Top produit */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="w-4 h-4 mr-2 text-orange-600" />
                  Produit vedette
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {stats.topProduct || 'Aucun produit'}
                  </div>
                  <p className="text-sm text-gray-500">
                    Produit le plus commandé
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vue rapide boutique */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Eye className="w-4 h-4 mr-2 text-purple-600" />
                  Vue rapide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={openPublicLink}
                  variant="outline" 
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir ma boutique
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Sheet Modal */}
      {showShareSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowShareSheet(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Partager ma boutique</h3>
              <button onClick={() => setShowShareSheet(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
              <p className="text-sm font-mono text-gray-600 dark:text-gray-300 truncate">
                {getPublicLink(seller.public_link_id)}
              </p>
            </div>

            <button
              onClick={() => { copyPublicLink(); }}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                copied ? 'bg-gray-900 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200'
              }`}
            >
              {copied ? <><CheckCircle className="w-4 h-4" /> Copié !</> : <><Copy className="w-4 h-4" /> Copier le lien</>}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Partager sur WhatsApp
            </button>

            <button
              onClick={handleShareFacebook}
              className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Partager sur Facebook
            </button>

            <button
              onClick={openPublicLink}
              className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Voir ma boutique
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

