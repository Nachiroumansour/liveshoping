import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  ShoppingBag, 
  Search, 
  Filter,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  DollarSign,
  User,
  Calendar,
  X,
  Package,
  TrendingUp,
  ArrowUpRight,
  CreditCard,
  CalendarDays
} from 'lucide-react';
import apiService from '../services/api';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeller, setFilterSeller] = useState('all');
  const [sellers, setSellers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadOrders();
    loadSellers();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminOrders();
      console.log('Commandes reçues:', response.data);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      const response = await apiService.getAdminSellers();
      setSellers(response.data.sellers);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'paid': return <CheckCircle className="w-3 h-3" />;
      case 'delivered': return <Truck className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'paid': return 'Payée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm) ||
      order.id?.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSeller = filterSeller === 'all' || order.seller_id?.toString() === filterSeller;
    
    return matchesSearch && matchesStatus && matchesSeller;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.reduce((sum, o) => sum + (parseInt(o.total_price) || 0), 0)
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Supervision des Commandes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Surveillez et gérez toutes les commandes de la plateforme en temps réel.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {orders.length} Commandes
              </span>
           </div>
           <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stats.totalRevenue.toLocaleString()} FCFA
              </span>
           </div>
        </div>
      </div>

      {/* Statistiques Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-blue-100 text-xs md:text-sm font-medium mb-1 truncate">Total Commandes</p>
                <h3 className="text-2xl md:text-3xl font-bold">{stats.total}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0 ml-2">
                <ShoppingBag className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-blue-100 text-xs md:text-sm">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 shrink-0" />
              <span className="truncate">+12% ce mois</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-yellow-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">En Attente</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shrink-0 ml-2">
                <Clock className="w-4 h-4 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${(stats.pending / stats.total) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-green-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Payées & Livrées</p>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.paid + stats.delivered}</h3>
              </div>
              <div className="p-1.5 md:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg shrink-0 ml-2">
                <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${((stats.paid + stats.delivered) / stats.total) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white dark:bg-gray-800 border-l-4 border-l-purple-500">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start">
              <div className="min-w-0">
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mb-1 truncate">Revenus Total</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">{stats.totalRevenue.toLocaleString()} <span className="text-[10px] md:text-sm font-normal text-gray-500">FCFA</span></h3>
              </div>
              <div className="p-1.5 md:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0 ml-2">
                <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2 md:mt-4 flex items-center text-green-600 text-xs md:text-sm font-medium">
              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 mr-1 shrink-0" />
              <span className="truncate">Performance stable</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et Recherche */}
      <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par client, téléphone ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative min-w-[180px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payées</option>
                  <option value="delivered">Livrées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>

              <div className="relative min-w-[180px]">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterSeller}
                  onChange={(e) => setFilterSeller(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                >
                  <option value="all">Tous les vendeurs</option>
                  {sellers.map(seller => (
                    <option key={seller.id} value={seller.id.toString()}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={loadOrders} variant="outline" className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Filter className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Aucune commande trouvée</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                Aucune commande ne correspond à vos critères de recherche. Essayez de modifier les filtres.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterSeller('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-3 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                    {/* Order Info */}
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg md:rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0 text-sm md:text-base">
                        #{order.id}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg truncate max-w-[150px] sm:max-w-none">{order.customer_name}</h3>
                          <Badge variant="outline" className={`${getStatusColor(order.status)} border text-[10px] md:text-xs px-1.5 py-0 h-5 md:h-6`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {getStatusText(order.status)}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3" /> {order.customer_phone}
                          </span>
                          <span className="hidden sm:inline text-gray-300">•</span>
                          <span className="flex items-center gap-1 truncate">
                            <ShoppingBag className="w-3 h-3" /> <span className="hidden sm:inline">Vendeur:</span> <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px] sm:max-w-none">{order.seller?.name || order.Seller?.name || 'N/A'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 dark:border-gray-700 pt-2 sm:pt-0 mt-1 sm:mt-0">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                          {order.total_price?.toLocaleString()} <span className="text-xs md:text-sm font-normal text-gray-500">FCFA</span>
                        </span>
                        <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        size="sm"
                        className="h-8 text-xs md:text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5" />
                        Détails
                      </Button>
                    </div>
                  </div>

                  {/* Products Preview */}
                  {order.Products && order.Products.length > 0 && (
                    <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                      <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider mr-1 md:mr-2 shrink-0">Produits:</span>
                      {order.Products.map((product, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600 shrink-0 text-[10px] md:text-xs px-1.5 py-0.5">
                          <Package className="w-3 h-3 mr-1 text-gray-400" />
                          {product.name} <span className="ml-1 text-gray-400">x{product.quantity || 1}</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Détails Commande */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
            <div className="sticky top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Commande #{selectedOrder.id}
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Passée le {new Date(selectedOrder.created_at).toLocaleDateString()} à {new Date(selectedOrder.created_at).toLocaleTimeString()}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowOrderModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h5 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Informations Client
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400">Nom</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400">Téléphone</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.customer_phone}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400">Vendeur</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{selectedOrder.seller?.name || selectedOrder.Seller?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h5 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-500" />
                    Paiement
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400">Sous-total</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedOrder.total_price?.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400">Livraison</span>
                      <span className="font-medium text-gray-900 dark:text-white">Inclus</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="font-bold text-green-600 text-lg">
                        {selectedOrder.total_price?.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Produits de la commande */}
              {selectedOrder.Products && selectedOrder.Products.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-500" />
                    Produits commandés ({selectedOrder.Products.length})
                  </h5>
                  <div className="space-y-3">
                    {selectedOrder.Products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                        <div className="flex items-center space-x-4">
                          {/* Image du produit */}
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl ${product.image_url ? 'hidden' : 'flex'}`}>
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {product.price?.toLocaleString()} FCFA x {product.quantity || 1}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {((product.price || 0) * (product.quantity || 1)).toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowOrderModal(false)}
                className="min-w-[100px]"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage; 