import axios from 'axios';
import { getBackendUrl } from '../config/domains';

/**
 * Intercepteur Axios pour gérer les erreurs de crédits insuffisants
 * Intercepte les réponses 402 et déclenche un événement global
 */

// Créer une instance axios personnalisée
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || getBackendUrl()
});

// Callbacks personnalisés
let onInsufficientCredits = null;

/**
 * Enregistrer un callback pour les crédits insuffisants
 * @param {Function} callback - Fonction appelée quand 402 est reçu
 */
export const setOnInsufficientCreditsCallback = (callback) => {
  onInsufficientCredits = callback;
};

/**
 * Intercepteur de réponse
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Vérifier si c'est une erreur 402 (Payment Required)
    if (error.response?.status === 402) {
      const creditsInfo = error.response.data?.creditsInfo || {};
      
      // Déclencher le callback si enregistré
      if (onInsufficientCredits) {
        onInsufficientCredits({
          currentBalance: creditsInfo.currentBalance || 0,
          requiredCredits: creditsInfo.requiredCredits || 0,
          actionType: error.response.data?.actionType || 'UNKNOWN',
          message: error.response.data?.message || 'Crédits insuffisants'
        });
      }
      
      // Passer l'erreur au code appellant
      return Promise.reject({
        status: 402,
        insufficientCredits: true,
        creditsInfo,
        message: error.response.data?.message,
        originalError: error
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
