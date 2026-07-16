 import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  Eye,
  Play, 
  Pause, 
  MoreHorizontal,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AdminSellersPage = () => {
  const { seller } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerDetails, setSellerDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [sellersRevenue, setSellersRevenue] = useState({});

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminSellers();
      const sellersData = response.data.sellers;
      setSellers(sellersData);
      
      // Charger les chiffres d'affaires pour tous les vendeurs
      const revenueData = {};
      for (const seller of sellersData) {
        try {
          const ordersResponse = await apiService.getSellerOrders(seller.id);
          const orders = ordersResponse.data.orders || [];
          revenueData[seller.id] = calculateRevenueStats(orders);
        } catch (error) {
          console.error(`Erreur lors du chargement des commandes pour ${seller.name}:`, error);
          revenueData[seller.id] = {
            totalRevenue: 0,
            paidRevenue: 0,
            deliveredRevenue: 0,
            paidOrdersCount: 0,
            deliveredOrdersCount: 0,
            totalOrdersCount: 0
          };
        }
      }
      setSellersRevenue(revenueData);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
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
      
      const orders = ordersResponse.data.orders || [];
      const products = productsResponse.data.products || [];
      
      // Calculer les chiffres d'affaires
      const revenueStats = calculateRevenueStats(orders);
      
      setSellerDetails({
        orders: orders,
        products: products,
        revenue: revenueStats
      });
    } catch (error) {
      console.error('Erreur lors du chargement des détails vendeur:', error);
    }
  };

  const calculateRevenueStats = (orders) => {
    const paidOrders = orders.filter(order => order.status === 'paid');
    const deliveredOrders = orders.filter(order => order.status === 'delivered');
    
    const paidRevenue = paidOrders.reduce((sum, order) => sum + (parseInt(order.total_price) || 0), 0);
    const deliveredRevenue = deliveredOrders.reduce((sum, order) => sum + (parseInt(order.total_price) || 0), 0);
    const totalRevenue = paidRevenue + deliveredRevenue;
    
    return {
      totalRevenue,
      paidRevenue,
      deliveredRevenue,
      paidOrdersCount: paidOrders.length,
      deliveredOrdersCount: deliveredOrders.length,
      totalOrdersCount: orders.length
    };
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
      await loadSellers();
    } catch (error) {
      console.error('Erreur lors de l\'action sur le vendeur:', error);
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

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.phone_number.includes(searchTerm) ||
                         seller.public_link_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && seller.is_active;
    if (activeTab === 'inactive') return matchesSearch && !seller.is_active;
    return matchesSearch;
  });

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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Gestion des Vendeurs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Administrez les comptes vendeurs et suivez leurs performances.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {sellers.length} Vendeurs Total
              </span>
           </div>
           <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {sellers.filter(s => s.is_active).length} Actifs
              </span>
           </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, téléphone ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveTab('all')}
                size="sm"
                className={activeTab === 'all' ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
              >
                Tous
                <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-900">{sellers.length}</Badge>
              </Button>
              <Button
                variant={activeTab === 'active' ? 'default' : 'outline'}
                onClick={() => setActiveTab('active')}
                size="sm"
                className={activeTab === 'active' ? 'bg-green-600 text-white hover:bg-green-700 border-transparent' : ''}
              >
                Actifs
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">{sellers.filter(s => s.is_active).length}</Badge>
              </Button>
              <Button
                variant={activeTab === 'inactive' ? 'default' : 'outline'}
                onClick={() => setActiveTab('inactive')}
                size="sm"
                className={activeTab === 'inactive' ? 'bg-red-600 text-white hover:bg-red-700 border-transparent' : ''}
              >
                Inactifs
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">{sellers.filter(s => !s.is_active).length}</Badge>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des vendeurs */}
        <div className="lg:col-span-2 space-y-4">
          {filteredSellers.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun vendeur trouvé</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Essayez de modifier vos filtres de recherche.</p>
              </CardContent>
            </Card>
          ) : (
            filteredSellers.map((seller) => (
              <div 
                key={seller.id} 
                className={`group relative bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  selectedSeller?.id === seller.id 
                    ? 'border-blue-500 ring-1 ring-blue-500 shadow-md' 
                    : 'border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                }`}
                onClick={() => handleSellerAction(seller.id, 'view')}
              >
                <div className="p-3 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                  {/* Avatar & Info */}
                  <div className="flex items-start sm:items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold text-base md:text-xl shadow-sm transform group-hover:scale-105 transition-transform duration-200">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white dark:border-gray-800 ${seller.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between sm:block">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-lg group-hover:text-blue-600 transition-colors truncate pr-2">
                          {seller.name}
                        </h3>
                        {/* Mobile Role Badge */}
                        <Badge className={`${getRoleColor(seller.role)} shadow-sm text-[10px] px-1.5 py-0 h-5 sm:hidden`}>
                          {seller.role}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5 md:mt-1 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1 truncate">
                          <Phone className="w-3 h-3" /> {seller.phone_number}
                        </span>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span className="hidden sm:flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3" /> ID: {seller.public_link_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 dark:border-gray-700 pt-2 sm:pt-0 mt-1 sm:mt-0">
                    <div className="text-left sm:text-right mr-2 flex-1 sm:flex-none">
                      <p className="text-[10px] md:text-xs text-gray-500 uppercase font-semibold tracking-wider">Crédits</p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm md:text-lg">{seller.credit_balance}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${getRoleColor(seller.role)} shadow-sm hidden sm:inline-flex`}>
                        {seller.role}
                      </Badge>
                      
                      <div className="flex gap-1">
                        {seller.is_active ? (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSellerAction(seller.id, 'suspend');
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                            title="Suspendre"
                          >
                            <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSellerAction(seller.id, 'activate');
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                            title="Activer"
                          >
                            <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 md:h-8 md:w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Revenue Mini-Stats (if available) */}
                {sellersRevenue[seller.id] && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 px-3 md:px-5 py-2 md:py-3 flex items-center justify-between text-xs md:text-sm border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-2 md:gap-4">
                      <span className="text-gray-500">
                        <span className="font-medium text-gray-900 dark:text-white">{sellersRevenue[seller.id].totalOrdersCount}</span> <span className="hidden sm:inline">commandes</span><span className="sm:hidden">cmd</span>
                      </span>
                      <span className="text-gray-500">
                        <span className="font-medium text-green-600">{sellersRevenue[seller.id].paidOrdersCount}</span> <span className="hidden sm:inline">payées</span><span className="sm:hidden">ok</span>
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      {sellersRevenue[seller.id].totalRevenue.toLocaleString()} <span className="hidden sm:inline">FCFA</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Détails du vendeur sélectionné (Sticky Sidebar) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {selectedSeller ? (
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                  <Button
                    onClick={() => setSelectedSeller(null)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full"
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
                <div className="px-6 pb-6">
                  <div className="relative -mt-12 mb-4 flex justify-center">
                    <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-lg">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
                        {selectedSeller.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSeller.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedSeller.phone_number}</p>
                    <div className="flex justify-center gap-2 mt-3">
                      <Badge className={getRoleColor(selectedSeller.role)}>{selectedSeller.role}</Badge>
                      <Badge variant={selectedSeller.is_active ? "default" : "destructive"} className={selectedSeller.is_active ? "bg-green-500 hover:bg-green-600" : ""}>
                        {selectedSeller.is_active ? 'Compte Actif' : 'Compte Suspendu'}
                      </Badge>
                    </div>
                  </div>

                  {sellerDetails ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center border border-blue-100 dark:border-blue-800">
                          <Package className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{sellerDetails.products.length}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Produits</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl text-center border border-purple-100 dark:border-purple-800">
                          <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{sellerDetails.revenue.totalOrdersCount}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Commandes</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          Performance Financière
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-500">Chiffre d'affaires</span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              {sellerDetails.revenue.totalRevenue.toLocaleString()} <span className="text-xs font-normal text-gray-400">FCFA</span>
                            </span>
                          </div>
                          
                          <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-green-500" 
                              style={{ width: `${sellerDetails.revenue.totalRevenue > 0 ? (sellerDetails.revenue.paidRevenue / sellerDetails.revenue.totalRevenue) * 100 : 0}%` }}
                            ></div>
                            <div 
                              className="h-full bg-blue-500" 
                              style={{ width: `${sellerDetails.revenue.totalRevenue > 0 ? (sellerDetails.revenue.deliveredRevenue / sellerDetails.revenue.totalRevenue) * 100 : 0}%` }}
                            ></div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-gray-600 dark:text-gray-400">Payé: {sellerDetails.revenue.paidRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-gray-600 dark:text-gray-400">Livré: {sellerDetails.revenue.deliveredRevenue.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={() => handleSellerAction(selectedSeller.id, selectedSeller.is_active ? 'suspend' : 'activate')}
                          variant={selectedSeller.is_active ? 'destructive' : 'default'}
                          className="w-full shadow-sm"
                        >
                          {selectedSeller.is_active ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Suspendre le compte
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Activer le compte
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Chargement des détails...</p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 bg-transparent shadow-none hidden lg:block">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                  <Eye className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">Sélectionnez un vendeur pour voir ses détails complets</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSellersPage; 