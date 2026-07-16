import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const { seller } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!seller?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Charger toutes les données du dashboard en parallèle
      const [
        stats,
        recentOrders,
        recentProducts,
        pendingOrders,
        recentActivity
      ] = await Promise.all([
        dashboardService.getStats(seller.id),
        dashboardService.getRecentOrders(seller.id, 5),
        dashboardService.getRecentProducts(seller.id, 5),
        dashboardService.getPendingOrders(seller.id),
        dashboardService.getRecentActivity(seller.id, 10)
      ]);

      setDashboardData({
        stats,
        recentOrders,
        recentProducts,
        pendingOrders,
        recentActivity
      });
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError(err.message || 'Erreur de chargement du dashboard');
    } finally {
      setLoading(false);
    }
  }, [seller?.id]);

  // Chargement initial
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Rafraîchissement automatique toutes les 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Rafraîchissement lors du focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      // Rafraîchir seulement si la dernière mise à jour date de plus de 1 minute
      if (!lastUpdate || Date.now() - lastUpdate.getTime() > 60 * 1000) {
        fetchDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchDashboardData, lastUpdate]);

  const refreshDashboard = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    lastUpdate,
    refreshDashboard,
    refetch: fetchDashboardData
  };
};

export default useDashboard; 