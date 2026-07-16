import apiService from './api';

/**
 * Service client pour gérer les crédits
 * Le backend gère la logique complète (bypass si module désactivé)
 * Le frontend se contente de récupérer l'état et gérer l'affichage
 */

// Cache pour éviter les appels répétés
let moduleStateCache = {
  isEnabled: null,
  lastFetch: 0,
  ttl: 30000 // 30 secondes de cache
};

class ClientCreditService {
  /**
   * Helper pour effectuer les requêtes avec fetch
   * @private
   */
  static async _request(endpoint, options = {}) {
    const url = `${apiService.baseURL}${endpoint}`;
    const config = {
      headers: apiService.getAuthHeaders(),
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || data.message || 'Erreur API');
      error.status = response.status;
      error.response = { data, status: response.status };
      throw error;
    }

    return { data };
  }

  /**
   * Récupérer l'état du module (avec cache)
   * @returns {Promise<{isEnabled: boolean, actionCosts: Object}>}
   */
  static async getModuleState() {
    const now = Date.now();
    
    // Utiliser le cache si valide
    if (moduleStateCache.isEnabled !== null && (now - moduleStateCache.lastFetch) < moduleStateCache.ttl) {
      return {
        isEnabled: moduleStateCache.isEnabled,
        actionCosts: moduleStateCache.actionCosts
      };
    }
    
    try {
      const response = await this._request('/credits/packages');
      const data = response.data?.data || response.data;
      
      moduleStateCache = {
        isEnabled: data?.isEnabled === true,
        actionCosts: data?.actionCosts || {},
        lastFetch: now,
        ttl: 30000
      };
      
      return {
        isEnabled: moduleStateCache.isEnabled,
        actionCosts: moduleStateCache.actionCosts
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'état du module:', error);
      // En cas d'erreur, considérer le module comme désactivé (comportement sûr)
      return { isEnabled: false, actionCosts: {} };
    }
  }

  /**
   * Invalider le cache (à appeler après achat de crédits ou changement de config)
   */
  static invalidateCache() {
    moduleStateCache.lastFetch = 0;
  }

  /**
   * Acheter des crédits
   */
  static async purchaseCredits(packageType, paymentMethod, phoneNumber) {
    try {
      const response = await this._request('/credits/purchase', {
        method: 'POST',
        body: JSON.stringify({
          packageType,
          paymentMethod,
          phoneNumber
        })
      });
      this.invalidateCache();
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Récupérer le solde actuel de crédits
   */
  static async getBalance() {
    try {
      const response = await this._request('/credits');
      return response.data?.data || response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Récupérer les packages disponibles
   */
  static async getPackages() {
    try {
      const response = await this._request('/credits/packages');
      return response.data?.data || response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Récupérer l'historique des transactions
   */
  static async getTransactionHistory(options = {}) {
    try {
      const params = new URLSearchParams(options);
      const response = await this._request(`/credits/transactions?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Vérifier si l'utilisateur a assez de crédits pour une action
   * Utilise le cache du module pour éviter les appels inutiles
   */
  static async checkCredits(actionType) {
    try {
      const moduleState = await this.getModuleState();
      
      // Si module désactivé, pas besoin de vérifier
      if (!moduleState.isEnabled) {
        return {
          hasCredits: true,
          currentBalance: 0,
          requiredCredits: 0,
          actionType,
          moduleDisabled: true,
          message: 'Module de crédits désactivé - action gratuite'
        };
      }

      // Module activé: récupérer le solde et vérifier
      const balance = await this.getBalance();
      const currentBalance = balance?.balance || 0;
      const requiredCredits = moduleState.actionCosts[actionType] || 0;
      const hasCredits = currentBalance >= requiredCredits;

      return {
        hasCredits,
        currentBalance,
        requiredCredits,
        actionType,
        moduleDisabled: false,
        message: hasCredits
          ? `Vous avez ${currentBalance} crédits`
          : `Crédits insuffisants: ${currentBalance}/${requiredCredits}`
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des crédits:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Utiliser des crédits pour effectuer une action
   * Le backend gère tout (bypass si module désactivé, consommation si activé)
   * Cette méthode est appelée AVANT l'action pour pré-vérifier côté frontend
   */
  static async useCreditsForAction(actionType) {
    try {
      const moduleState = await this.getModuleState();
      
      // Si module désactivé, succès immédiat (le backend fera le bypass aussi)
      if (!moduleState.isEnabled) {
        return {
          success: true,
          creditsConsumed: 0,
          moduleDisabled: true,
          message: 'Module de crédits désactivé - action gratuite'
        };
      }
      
      // Module activé: vérifier les crédits côté frontend avant l'action
      const check = await this.checkCredits(actionType);
      
      if (!check.hasCredits) {
        return {
          success: false,
          insufficientCredits: true,
          currentBalance: check.currentBalance,
          requiredCredits: check.requiredCredits,
          actionType,
          message: `Crédits insuffisants pour ${actionType}`
        };
      }

      // Crédits suffisants - l'action peut continuer
      // La consommation sera faite par le backend via le middleware
      return {
        success: true,
        preCheck: true,
        currentBalance: check.currentBalance,
        requiredCredits: check.requiredCredits,
        message: 'Crédits vérifiés - action autorisée'
      };
    } catch (error) {
      console.error('Erreur dans useCreditsForAction:', error);
      throw this._handleError(error);
    }
  }

  /**
   * Gestion centralisée des erreurs
   * @private
   */
  static _handleError(error) {
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        error: error.response.data?.error || 'Erreur serveur',
        message: error.response.data?.message || error.message,
        details: error.response.data?.details
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'Pas de réponse du serveur',
        message: 'Vérifiez votre connexion internet'
      };
    } else {
      return {
        success: false,
        error: 'Erreur client',
        message: error.message
      };
    }
  }
}

export default ClientCreditService;
