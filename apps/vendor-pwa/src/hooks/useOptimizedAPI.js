import { useState, useEffect, useRef } from 'react';

// Hook pour optimiser les appels API avec cache intelligent
export const useOptimizedAPI = (apiCall, dependencies = [], cacheTime = 300000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Vérifier si les données sont encore valides
  const isDataValid = () => {
    return Date.now() - lastFetch < cacheTime;
  };

  // Obtenir les données du cache
  const getCachedData = (key) => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  };

  // Mettre en cache les données
  const setCachedData = (key, data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  };

  // Fonction de récupération optimisée
  const fetchData = async (force = false) => {
    // Annuler la requête précédente si elle est en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache si pas de forçage
      if (!force && isDataValid() && data) {
        console.log('📋 Utilisation des données en cache');
        return data;
      }

      // Générer une clé de cache basée sur les dépendances
      const cacheKey = JSON.stringify(dependencies);
      const cachedData = getCachedData(cacheKey);

      if (!force && cachedData) {
        console.log('📋 Données récupérées du cache');
        setData(cachedData);
        setLastFetch(Date.now());
        return cachedData;
      }

      // Appel API réel
      console.log('🌐 Appel API réel effectué');
      const result = await apiCall(abortControllerRef.current.signal);
      
      // Mettre en cache
      setCachedData(cacheKey, result);
      setData(result);
      setLastFetch(Date.now());
      
      return result;

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🚫 Appel API annulé');
        return;
      }
      
      console.error('❌ Erreur API:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Effet pour récupérer les données initiales
  useEffect(() => {
    fetchData();
    
    // Nettoyage
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  // Fonction pour forcer le rafraîchissement
  const refresh = () => fetchData(true);

  // Fonction pour mettre à jour les données manuellement
  const updateData = (newData) => {
    setData(newData);
    setLastFetch(Date.now());
    
    // Mettre à jour le cache
    const cacheKey = JSON.stringify(dependencies);
    setCachedData(cacheKey, newData);
  };

  // Fonction pour vider le cache
  const clearCache = () => {
    cacheRef.current.clear();
    setLastFetch(0);
  };

  return {
    data,
    loading,
    error,
    lastFetch,
    fetchData,
    refresh,
    updateData,
    clearCache,
    isDataValid: isDataValid()
  };
};

// Hook spécialisé pour les statistiques du dashboard
export const useDashboardStats = (sellerId) => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastUpdateRef = useRef(0);
  const updateIntervalRef = useRef(null);

  // Fonction pour récupérer toutes les données du dashboard
  const fetchDashboardData = async () => {
    if (!sellerId) return;

    try {
      setLoading(true);
      
      // Appels API parallèles
      const [statsData, ordersData, creditsData] = await Promise.all([
        fetch(`/api/orders/stats/summary`).then(r => r.json()),
        fetch(`/api/orders?page=1&limit=6`).then(r => r.json()),
        fetch(`/api/credits`).then(r => r.json()).catch(() => null)
      ]);

      // Mise à jour conditionnelle
      setStats(prev => {
        const newStats = { ...prev, ...statsData.stats };
        return JSON.stringify(prev) === JSON.stringify(newStats) ? prev : newStats;
      });

      setOrders(ordersData.orders || []);
      
      if (creditsData) {
        setCredits(creditsData.data);
      }

      lastUpdateRef.current = Date.now();
      console.log('✅ Dashboard mis à jour intelligemment');

    } catch (error) {
      console.error('❌ Erreur mise à jour dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour initiale
  useEffect(() => {
    if (sellerId) {
      fetchDashboardData();
    }
  }, [sellerId]);

  // Fonction de rafraîchissement manuel
  const refresh = () => {
    fetchDashboardData();
  };

  // Fonction pour mettre à jour via WebSocket
  const updateFromWebSocket = (newData, type) => {
    switch (type) {
      case 'stats':
        setStats(prev => ({ ...prev, ...newData }));
        break;
      case 'orders':
        setOrders(prev => [newData, ...prev.slice(0, 5)]);
        break;
      case 'credits':
        setCredits(newData);
        break;
      default:
        break;
    }
    
    lastUpdateRef.current = Date.now();
  };

  return {
    stats,
    orders,
    credits,
    loading,
    lastUpdate: lastUpdateRef.current,
    refresh,
    updateFromWebSocket
  };
}; 