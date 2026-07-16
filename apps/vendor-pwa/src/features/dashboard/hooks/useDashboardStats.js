import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { statsService } from '../services/statsService';

export const useDashboardStats = () => {
  const { seller } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!seller?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await statsService.getDashboardStats(seller.id);
      setStats(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err.message || 'Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [seller?.id]);

  // Chargement initial
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Rafraîchissement automatique toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchStats]);

  // Rafraîchissement lors du focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      // Rafraîchir seulement si la dernière mise à jour date de plus de 2 minutes
      if (!lastUpdate || Date.now() - lastUpdate.getTime() > 2 * 60 * 1000) {
        fetchStats();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchStats, lastUpdate]);

  const refreshStats = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    lastUpdate,
    refreshStats,
    refetch: fetchStats
  };
};

export default useDashboardStats; 