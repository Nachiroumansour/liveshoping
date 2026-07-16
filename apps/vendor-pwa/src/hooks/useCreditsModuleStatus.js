import { useEffect, useState } from 'react';
import apiService from '../services/api';

/**
 * Hook pour vérifier si le module de crédits est activé
 * Utilise une route PUBLIQUE (pas besoin d'authentification)
 */
export const useCreditsModuleStatus = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getCreditsModuleStatus();
      setIsEnabled(data.data?.enabled || false);
      setError(null);
      console.log('✅ Module crédits status:', data.data?.enabled);
    } catch (err) {
      console.error('❌ Erreur vérification module crédits:', err);
      setIsEnabled(false);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await checkStatus();
  };

  return { isEnabled, isLoading, error, refresh };
};

export default useCreditsModuleStatus;
