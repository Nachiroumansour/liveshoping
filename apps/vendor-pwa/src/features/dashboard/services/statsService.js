import { getBackendDomain } from '../../../config/domains';

class StatsService {
  constructor() {
    this.baseUrl = `${getBackendDomain()}/api`;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Méthode pour gérer le cache
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Méthode pour faire des appels API avec gestion d'erreur
  async makeRequest(endpoint, options = {}) {
    const token = localStorage.getItem('liveshop_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur API ${endpoint}:`, error);
      throw error;
    }
  }

  // Récupérer les statistiques du dashboard
  async getDashboardStats(sellerId) {
    const cacheKey = `dashboard-stats-${sellerId}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const data = await this.makeRequest(`/sellers/${sellerId}/stats`);
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      // En cas d'erreur, retourner des données par défaut
      return {
        total_revenue: 0,
        total_orders: 0,
        total_products: 0,
        active_lives: 0,
        revenue_change: 0,
        orders_change: 0,
        products_change: 0,
        lives_change: 0,
        pending_orders: 0,
        paid_orders: 0,
        delivered_orders: 0
      };
    }
  }

  // Récupérer les statistiques détaillées
  async getDetailedStats(sellerId, period = 'month') {
    const cacheKey = `detailed-stats-${sellerId}-${period}`;
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const data = await this.makeRequest(`/sellers/${sellerId}/stats/detailed?period=${period}`);
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les statistiques en temps réel
  async getRealTimeStats(sellerId) {
    try {
      const data = await this.makeRequest(`/sellers/${sellerId}/stats/realtime`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Nettoyer le cache
  clearCache() {
    this.cache.clear();
  }

  // Nettoyer le cache pour un vendeur spécifique
  clearSellerCache(sellerId) {
    const keysToDelete = [];
    for (const [key] of this.cache) {
      if (key.includes(`-${sellerId}-`) || key.includes(`-${sellerId}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Instance singleton
const statsService = new StatsService();

export { statsService };
export default statsService; 