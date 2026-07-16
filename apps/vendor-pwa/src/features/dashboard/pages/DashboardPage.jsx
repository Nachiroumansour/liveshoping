import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

// Import des composants modulaires
import StatsOverview from '../components/stats/StatsOverview';
import QuickActions from '../components/actions/QuickActions';
import RecentActivity from '../components/activity/RecentActivity';
import PublicLinkSection from '../components/public/PublicLinkSection';

// Import des hooks
import { useDashboard } from '../hooks/useDashboard';

const DashboardPage = () => {
  const { seller, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { 
    dashboardData, 
    loading, 
    error, 
    refreshDashboard,
    lastUpdate 
  } = useDashboard();

  // Redirection si non authentifié
  React.useEffect(() => {
    if (!authLoading && !seller) {
      navigate('/login');
    }
  }, [seller, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!seller) {
    return null; // Sera redirigé par useEffect
  }

  return (
    <div className="w-full max-w-full mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header avec informations du vendeur */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Bonjour {seller.name} 👋
              </h1>
              <p className="text-purple-100 text-sm md:text-base">
                Gérez vos produits, lives et commandes en toute simplicité
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Bouton de rafraîchissement */}
              <Button
                onClick={refreshDashboard}
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              
              {/* Indicateur de dernière mise à jour */}
              {lastUpdate && (
                <div className="text-xs text-purple-100">
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
        {/* Message d'erreur */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section des statistiques */}
        <StatsOverview />

        {/* Section des actions rapides */}
        <QuickActions />

        {/* Section du lien public */}
        <PublicLinkSection seller={seller} />

        {/* Section de l'activité récente */}
        <RecentActivity />

        {/* Section des commandes en attente */}
        {dashboardData?.pendingOrders && dashboardData.pendingOrders.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Commandes en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.pendingOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {order.customer_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.product?.name} - {order.quantity}x
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        {order.total_price?.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
                {dashboardData.pendingOrders.length > 3 && (
                  <Button
                    onClick={() => navigate('/orders')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Voir toutes les commandes ({dashboardData.pendingOrders.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage; 