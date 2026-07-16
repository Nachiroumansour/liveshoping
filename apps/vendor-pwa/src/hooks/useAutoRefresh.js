import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export const useAutoRefresh = (fetchFunction, dependencies = [], interval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const { lastUpdate, hasRecentUpdates } = useNotifications();

  // Fonction de récupération des données
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      setData(result);
      setLastFetch(new Date());
      
      console.log('✅ Données actualisées:', new Date().toLocaleTimeString());
    } catch (err) {
      console.error('❌ Erreur récupération données:', err);
      setError(err.message || 'Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  // Actualisation initiale
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // Actualisation automatique par intervalle
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval]);

  // Actualisation basée sur les notifications
  useEffect(() => {
    if (lastUpdate && hasRecentUpdates()) {
      console.log('🔄 Actualisation basée sur notification');
      fetchData();
    }
  }, [lastUpdate, hasRecentUpdates, fetchData]);

  // Écouter les événements de mise à jour spécifiques
  useEffect(() => {
    const handleOrderUpdate = () => {
      console.log('📦 Actualisation commandes déclenchée');
      fetchData();
    };

    const handleProductUpdate = () => {
      console.log('📦 Actualisation produits déclenchée');
      fetchData();
    };

    const handleStatsUpdate = () => {
      console.log('📊 Actualisation statistiques déclenchée');
      fetchData();
    };

    const handleCreditsUpdate = () => {
      console.log('💰 Actualisation crédits déclenchée');
      fetchData();
    };

    const handleForceRefresh = () => {
      console.log('🔄 Actualisation forcée déclenchée');
      fetchData();
    };

    // S'abonner aux événements
    window.addEventListener('orderUpdated', handleOrderUpdate);
    window.addEventListener('productUpdated', handleProductUpdate);
    window.addEventListener('statsUpdated', handleStatsUpdate);
    window.addEventListener('creditsUpdated', handleCreditsUpdate);
    window.addEventListener('forceRefresh', handleForceRefresh);

    // Nettoyage
    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate);
      window.removeEventListener('productUpdated', handleProductUpdate);
      window.removeEventListener('statsUpdated', handleStatsUpdate);
      window.removeEventListener('creditsUpdated', handleCreditsUpdate);
      window.removeEventListener('forceRefresh', handleForceRefresh);
    };
  }, [fetchData]);

  // Actualisation lors du retour en ligne
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connexion rétablie, actualisation des données');
      fetchData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchData]);

  // Actualisation lors du focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      // Actualiser seulement si la dernière actualisation date de plus de 5 minutes
      if (!lastFetch || Date.now() - lastFetch.getTime() > 5 * 60 * 1000) {
        console.log('👁️ Fenêtre focalisée, actualisation des données');
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, lastFetch]);

  return {
    data,
    loading,
    error,
    lastFetch,
    refresh: fetchData,
    isLoading: loading
  };
}; 