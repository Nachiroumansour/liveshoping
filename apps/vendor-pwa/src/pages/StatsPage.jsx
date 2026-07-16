import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  DollarSign,
  Calendar,
  Clock,
  Users,
  Star,
  BarChart3,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const [statsData, ordersData, productsData] = await Promise.all([
        ApiService.getOrderStats(),
        ApiService.getOrders(),
        ApiService.getProducts()
      ]);

      setStats(statsData.stats);
      setOrders(ordersData.orders || ordersData);
      // Gérer les deux formats possibles de réponse pour les produits
      const productsArray = productsData.products || productsData;
      setProducts(Array.isArray(productsArray) ? productsArray : []);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopProducts = () => {
    const productSales = {};
    
    if (!Array.isArray(orders)) return [];
    
    orders.forEach(order => {
      if (order.product) {
        const productId = order.product.id;
        if (!productSales[productId]) {
          productSales[productId] = {
            product: order.product,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        productSales[productId].totalQuantity += order.quantity || 0;
        productSales[productId].totalRevenue += order.total_price || 0;
        productSales[productId].orderCount += 1;
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  };

  const getRecentActivity = () => {
    if (!Array.isArray(orders)) return [];
    
    return orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  };

  const getMonthlyStats = () => {
    if (!Array.isArray(orders)) return { orders: 0, revenue: 0 };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    
    return {
      orders: monthlyOrders.length,
      revenue: monthlyRevenue
    };
  };

  const topProducts = getTopProducts();
  const recentActivity = getRecentActivity();
  const monthlyStats = getMonthlyStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="px-4 py-6 space-y-6">
        {/* Header moderne et doux */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Statistiques</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Analyse des performances commerciales et évolution des revenus
          </p>
      </div>

        {/* Métriques principales avec design doux */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-500" />
            Chiffre d'affaires détaillé
          </h2>
          
          {/* Info banner - Clarification */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-4">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <span className="font-semibold">💡 Comprendre votre CA:</span> Le CA affiché inclut uniquement les commandes <strong>payées et livrées</strong>. Les commandes en attente de paiement ne sont pas comptabilisées.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* CA Finalisé (Payé + Livré) */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">CA Finalisé</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{stats?.total_revenue?.toLocaleString() || 0} FCFA</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Payé + Livré</p>
                </div>
          </CardContent>
        </Card>

            {/* CA Payé uniquement */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">CA Payé</p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {Array.isArray(orders) ? 
                      (orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (parseInt(o.total_price) || 0), 0)).toLocaleString() 
                      : '0'} FCFA
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">{stats?.paid_orders || 0} commandes</p>
                </div>
          </CardContent>
        </Card>

            {/* CA En attente */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <ArrowDownRight className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">En attente</p>
                  <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                    {Array.isArray(orders) ? 
                      (orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + (parseInt(o.total_price) || 0), 0)).toLocaleString() 
                      : '0'} FCFA
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">{stats?.pending_orders || 0} commandes</p>
                </div>
          </CardContent>
        </Card>

            {/* Valeur Moyenne Commande */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-purple-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Panier moyen</p>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {stats?.total_orders > 0 ? Math.round((stats?.total_revenue || 0) / stats.total_orders).toLocaleString() : 0} FCFA
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Valeur moyenne</p>
                </div>
          </CardContent>
        </Card>
          </div>
      </div>

        {/* Section Top Produits avec design moderne */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Top produits
          </h2>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-4">
            {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Aucune vente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.slice(0, 3).map((item, index) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{item.product.name}</h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.totalQuantity} vendus</div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-purple-600 dark:text-purple-400 text-sm">
                          {item.totalRevenue.toLocaleString()} FCFA
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Section Activité Récente avec design moderne */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
            Activité récente
          </h2>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-4">
            {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Aucune activité</p>
                </div>
            ) : (
                <div className="space-y-3">
                {recentActivity.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{order.customer_name}</span>
                          <Badge 
                            className={`text-xs ${
                              order.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' 
                                : order.status === 'paid' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            }`}
                          >
                        {order.status === 'pending' ? 'En attente' : order.status === 'paid' ? 'Payé' : 'Livré'}
                      </Badge>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.product?.name} × {order.quantity}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                          {order.total_price.toLocaleString()} FCFA
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Section Répartition par statut avec design moderne */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
            Répartition par statut
          </h2>
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl">
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.pending_orders || 0}</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">En attente</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats?.paid_orders || 0}</div>
                  <div className="text-xs text-green-700 dark:text-green-300 font-medium">Payées</div>
            </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {(stats?.total_orders || 0) - (stats?.pending_orders || 0) - (stats?.paid_orders || 0)}
            </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Livrées</div>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;

