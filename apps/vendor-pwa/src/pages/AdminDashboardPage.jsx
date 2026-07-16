import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Trash2, 
  Search, 
  Filter,
  X,
  Shield,
  Activity,
  Settings,
  BarChart3,
  UserCheck,
  XCircle,
  Pause,
  Play,
  Tag,
  LayoutDashboard,
  CreditCard,
  ArrowUpRight,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboardPage = () => {
  const { seller } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [sellers, setSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);

  // États pour les modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, sellersResponse, ordersResponse, productsResponse] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getAdminSellers(),
        apiService.getAdminOrders(),
        apiService.getAdminProducts()
      ]);

      setDashboardData(dashboardResponse.data);
      setSellers(sellersResponse.data.sellers);
      setOrders(ordersResponse.data.orders);
      setProducts(productsResponse.data.products);
    } catch (error) {
      console.error('Erreur lors du chargement des données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellerDetails = async (sellerId) => {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        apiService.getSellerOrders(sellerId),
        apiService.getSellerProducts(sellerId)
      ]);
      setSellerOrders(ordersResponse.data.orders || []);
      setSellerProducts(productsResponse.data.products || []);
    } catch (error) {
      console.error('Erreur lors du chargement des détails vendeur:', error);
    }
  };

  const handleSellerAction = async (sellerId, action) => {
    try {
      switch (action) {
        case 'suspend':
          await apiService.suspendSeller(sellerId);
          break;
        case 'activate':
          await apiService.activateSeller(sellerId);
          break;
        case 'view':
          const seller = sellers.find(s => s.id === sellerId);
          setSelectedSeller(seller);
          await loadSellerDetails(sellerId);
          break;
      }
      await loadAdminData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'action sur le vendeur:', error);
    }
  };

  const handleProductAction = (productId, action) => {
    alert(`Action ${action} sur produit ${productId}`);
    
    if (action === 'view') {
      const product = products.find(p => p.id === productId);
      setSelectedProduct(product);
      setShowProductModal(true);
    }
  };

  const handleOrderAction = (orderId, action) => {
    alert(`Action ${action} sur commande ${orderId}`);
    
    if (action === 'view') {
      const order = orders.find(o => o.id === orderId);
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-500 text-white';
      case 'admin': return 'bg-blue-500 text-white';
      case 'seller': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8 space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Vue d'ensemble et gestion de votre plateforme.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <div className="hidden md:flex bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Système opérationnel</span>
           </div>
           <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
           </div>
        </div>
      </div>

      {/* Stats Grid - Modern & Clean */}
      {dashboardData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] md:text-xs px-1.5 py-0">
                  Total
                </Badge>
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Vendeurs</p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {dashboardData.sellers?.total || 0}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="p-1.5 md:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Package className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px] md:text-xs px-1.5 py-0">
                  Actifs
                </Badge>
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Produits</p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {dashboardData.products?.total || 0}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="p-1.5 md:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <ShoppingCart className="w-4 h-4 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-[10px] md:text-xs px-1.5 py-0">
                  Commandes
                </Badge>
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total</p>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {dashboardData.orders?.total || 0}
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="p-1.5 md:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[10px] md:text-xs px-1.5 py-0">
                  Revenus
                </Badge>
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Volume</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                  {(dashboardData.revenue?.total || 0).toLocaleString()} <span className="text-[10px] md:text-sm font-normal text-gray-500">FCFA</span>
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="sticky top-0 z-10 bg-gray-50/50 dark:bg-gray-900 py-2 backdrop-blur-sm -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="w-full md:w-auto justify-start overflow-x-auto bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm no-scrollbar">
              <TabsTrigger value="overview" className="flex items-center space-x-2 px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 rounded-lg transition-all">
                <LayoutDashboard className="w-4 h-4" />
                <span>Vue d'ensemble</span>
              </TabsTrigger>
              <TabsTrigger value="sellers" className="flex items-center space-x-2 px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 rounded-lg transition-all">
                <Users className="w-4 h-4" />
                <span>Vendeurs</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center space-x-2 px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 rounded-lg transition-all">
                <ShoppingCart className="w-4 h-4" />
                <span>Commandes</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center space-x-2 px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-700 rounded-lg transition-all">
                <Package className="w-4 h-4" />
                <span>Produits</span>
              </TabsTrigger>
            </TabsList>
        </div>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activité récente */}
            <Card className="lg:col-span-2 border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span>Métriques Clés</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Vendeurs Actifs</span>
                            <UserCheck className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.sellers?.active || 0}</p>
                        <div className="mt-2 h-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${(dashboardData?.sellers?.active / (dashboardData?.sellers?.total || 1)) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Commandes en attente</span>
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.orders?.pending || 0}</p>
                        <p className="text-xs text-orange-500 mt-1 font-medium">Nécessite attention</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Crédits Achetés</span>
                            <CreditCard className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(dashboardData?.credits?.total_purchased || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">Total cumulé</p>
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span>Actions rapides</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setActiveTab('sellers')}
                  className="w-full justify-start h-auto py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm" 
                  variant="ghost"
                >
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Gérer les vendeurs</p>
                    <p className="text-xs text-gray-500">Voir et modérer les comptes</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>

                <Button 
                  onClick={() => setActiveTab('orders')}
                  className="w-full justify-start h-auto py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm" 
                  variant="ghost"
                >
                  <div className="p-2 bg-orange-50 rounded-lg mr-3">
                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Suivre les commandes</p>
                    <p className="text-xs text-gray-500">Vérifier les statuts</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>

                <Button 
                  onClick={() => setActiveTab('products')}
                  className="w-full justify-start h-auto py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm" 
                  variant="ghost"
                >
                  <div className="p-2 bg-green-50 rounded-lg mr-3">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Modérer les produits</p>
                    <p className="text-xs text-gray-500">Gérer le catalogue</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 ml-auto text-gray-400" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gestion des vendeurs */}
        <TabsContent value="sellers" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span>Liste des Vendeurs</span>
                    <Badge variant="secondary" className="ml-2">{sellers.length}</Badge>
                </CardTitle>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un vendeur..." 
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Mobile View (Cards) */}
              <div className="md:hidden space-y-3 p-3">
                {sellers.map((seller) => (
                  <div key={seller.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{seller.name}</p>
                          <Badge className={`${getRoleColor(seller.role)} text-[10px] px-1.5 py-0 h-5`}>
                            {seller.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{seller.phone_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-700 pt-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${seller.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">{seller.is_active ? 'Actif' : 'Suspendu'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 mr-1">Crédits:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{seller.credit_balance}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-3">
                      <Button
                        onClick={() => handleSellerAction(seller.id, 'view')}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" /> Détails
                      </Button>
                      {seller.is_active ? (
                        <Button
                          onClick={() => handleSellerAction(seller.id, 'suspend')}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Pause className="w-3 h-3 mr-1" /> Suspendre
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSellerAction(seller.id, 'activate')}
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-green-600 hover:bg-green-50"
                        >
                          <Play className="w-3 h-3 mr-1" /> Activer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View (Table) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3">Vendeur</th>
                            <th className="px-6 py-3">Rôle</th>
                            <th className="px-6 py-3">Statut</th>
                            <th className="px-6 py-3 text-right">Crédits</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {sellers.map((seller) => (
                            <tr key={seller.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                            {seller.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{seller.name}</p>
                                            <p className="text-xs text-gray-500">{seller.phone_number}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge className={`${getRoleColor(seller.role)} shadow-sm`}>
                                        {seller.role}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${seller.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-gray-700 dark:text-gray-300">{seller.is_active ? 'Actif' : 'Suspendu'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                    {seller.credit_balance}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button
                                            onClick={() => handleSellerAction(seller.id, 'view')}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        {seller.is_active ? (
                                            <Button
                                                onClick={() => handleSellerAction(seller.id, 'suspend')}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:bg-red-50"
                                            >
                                                <Pause className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => handleSellerAction(seller.id, 'activate')}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-green-600 hover:bg-green-50"
                                            >
                                                <Play className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Détails du vendeur sélectionné */}
          {selectedSeller && (
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 mt-6 animate-in slide-in-from-bottom-4">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-purple-500" />
                    <span>Détails de {selectedSeller.name}</span>
                </CardTitle>
                  <Button
                    onClick={() => setSelectedSeller(null)}
                    variant="ghost"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="orders" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    <TabsTrigger value="orders" className="rounded-md">Commandes ({sellerOrders.length})</TabsTrigger>
                    <TabsTrigger value="products" className="rounded-md">Produits ({sellerProducts.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="orders" className="space-y-4">
                    {sellerOrders.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucune commande pour ce vendeur</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sellerOrders.slice(0, 10).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 dark:text-white">#{order.id}</span>
                                <Badge className={getOrderStatusColor(order.status) + " text-[10px] px-1.5 py-0.5"}>
                                    {order.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">{order.customer_name}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {order.total_price?.toLocaleString()} FCFA
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="products" className="space-y-4">
                    {sellerProducts.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun produit pour ce vendeur</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sellerProducts.slice(0, 10).map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <Package className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.price?.toLocaleString()} FCFA</p>
                                </div>
                            </div>
                            <Badge variant={product.is_active ? "default" : "secondary"} className="text-[10px]">
                                {product.is_active ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Commandes */}
        <TabsContent value="orders" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  <span>Suivi des commandes</span>
                  <Badge variant="secondary" className="ml-2">{orders.length}</Badge>
                </CardTitle>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Rechercher une commande..." 
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune commande trouvée</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-3 md:gap-4 border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 font-bold text-xs md:text-sm shrink-0">
                          #{order.id}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate">{order.customer_name}</p>
                            <span className="text-[10px] md:text-xs text-gray-400">• {order.customer_phone}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:gap-x-4 gap-y-0.5 mt-0.5 md:mt-1">
                            <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 truncate">
                                <Users className="w-3 h-3" /> <span className="hidden sm:inline">Vendeur:</span> <span className="font-medium text-gray-700 dark:text-gray-300">{order.seller?.name || 'N/A'}</span>
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 truncate">
                                <Package className="w-3 h-3" /> <span className="hidden sm:inline">Produit:</span> <span className="font-medium text-gray-700 dark:text-gray-300">{order.product?.name || 'N/A'}</span> (x{order.quantity})
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pl-14 md:pl-0">
                        <div className="text-right">
                          <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                            {order.total_price?.toLocaleString()} FCFA
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <Badge className={`${getOrderStatusColor(order.status)} text-[10px] md:text-xs px-1.5 py-0.5 h-5 md:h-6`}>
                            {order.status}
                            </Badge>
                            <Button 
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-blue-600"
                            onClick={() => handleOrderAction(order.id, 'view')}
                            >
                            <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produits */}
        <TabsContent value="products" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-green-500" />
                  <span>Modération des produits</span>
                  <Badge variant="secondary" className="ml-2">{products.length}</Badge>
                </CardTitle>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un produit..." 
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-3 md:p-4">
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun produit trouvé</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${product.image_url ? 'hidden' : 'flex'}`}>
                          <Package className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                        </div>
                        <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2">
                            <Badge variant={product.status === 'active' ? "default" : "secondary"} className="shadow-sm text-[10px] px-1.5 h-5">
                                {product.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                        </div>
                      </div>
                      
                      <div className="p-2.5 md:p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1 md:mb-2">
                            <div className="w-full">
                                <h3 className="font-semibold text-xs md:text-sm text-gray-900 dark:text-white line-clamp-2 h-8 md:h-10 leading-tight" title={product.name}>{product.name}</h3>
                                <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                                    <Users className="w-3 h-3 shrink-0" /> <span className="truncate">{product.seller?.name || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-auto pt-2 flex items-end justify-between">
                            <p className="font-bold text-sm md:text-lg text-gray-900 dark:text-white">
                                {product.price?.toLocaleString()} <span className="text-[10px] md:text-xs font-normal text-gray-500">FCFA</span>
                            </p>
                        </div>
                        
                        <div className="flex gap-1 mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="flex-1 h-7 text-[10px] md:text-xs text-gray-500 hover:text-blue-600 px-0"
                                onClick={() => handleProductAction(product.id, 'view')}
                            >
                                <Eye className="w-3 h-3 mr-1" /> Détails
                            </Button>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 text-gray-400 hover:text-red-600 px-0"
                                onClick={() => handleProductAction(product.id, 'delete')}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative h-48 bg-gray-100">
                {selectedProduct.image_url ? (
                  <img 
                    src={selectedProduct.image_url} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white">
                    <Package className="w-16 h-16 opacity-50" />
                  </div>
                )}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowProductModal(false)}
                    className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white rounded-full"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedProduct.description || "Aucune description disponible."}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Prix</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.price?.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Stock</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.stock_quantity || 0} unités</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Catégorie</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.category || 'Général'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Vendeur</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedProduct.seller?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowProductModal(false)}
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleProductAction(selectedProduct.id, 'delete');
                    setShowProductModal(false);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Commande #{selectedOrder.id}</h3>
                  <p className="text-xs text-gray-500">{new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowOrderModal(false)}
                className="rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedOrder.customer_name}</p>
                        <p className="text-xs text-gray-500">{selectedOrder.customer_phone}</p>
                    </div>
                </div>
                <Badge className={getOrderStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Détails de la commande</p>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.product?.name || 'Produit non spécifié'}</p>
                            <p className="text-sm text-gray-500">Quantité: {selectedOrder.quantity}</p>
                            <p className="text-xs text-gray-400 mt-1">Vendeur: {selectedOrder.seller?.name}</p>
                        </div>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.total_price?.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1"
                >
                  Fermer
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => {
                    handleOrderAction(selectedOrder.id, 'update_status');
                    setShowOrderModal(false);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Mettre à jour
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage; 