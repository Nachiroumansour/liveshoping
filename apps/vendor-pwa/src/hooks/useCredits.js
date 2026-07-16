import { useState, useCallback, useEffect } from 'react';
import ClientCreditService from '../services/clientCreditService';

/**
 * Hook personnalisé pour gérer les crédits
 * Fournit les outils pour vérifier et consommer des crédits
 */
const useCredits = () => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insufficientCreditsInfo, setInsufficientCreditsInfo] = useState(null);

  /**
   * Charger le solde actuel
   */
  const loadBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ClientCreditService.getBalance();
      setBalance(data?.balance || 0);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement du solde');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Charger les packages disponibles
   */
  const loadPackages = useCallback(async () => {
    try {
      const data = await ClientCreditService.getPackages();
      return data?.packages || [];
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement des packages');
      return [];
    }
  }, []);

  /**
   * Vérifier si on a assez de crédits
   */
  const checkCredits = useCallback(async (actionType) => {
    setError(null);
    try {
      const result = await ClientCreditService.checkCredits(actionType);
      if (!result.hasCredits) {
        setInsufficientCreditsInfo({
          currentBalance: result.currentBalance,
          requiredCredits: result.requiredCredits,
          actionType
        });
      }
      return result;
    } catch (err) {
      const errorMsg = err?.message || 'Erreur lors de la vérification des crédits';
      setError(errorMsg);
      throw err;
    }
  }, []);

  /**
   * Utiliser des crédits pour effectuer une action
   * Retourne { success, insufficientCredits, ... } si le check échoue
   * Retourne { success: true } si succès
   */
  const useCreditsForAction = useCallback(async (actionType) => {
    setError(null);
    setInsufficientCreditsInfo(null);
    
    try {
      const result = await ClientCreditService.useCreditsForAction(actionType);
      
      if (!result.success && result.insufficientCredits) {
        setInsufficientCreditsInfo({
          currentBalance: result.currentBalance,
          requiredCredits: result.requiredCredits,
          actionType
        });
      } else if (result.success) {
        // Rafraîchir le solde si consommation réussie
        await loadBalance();
      }
      
      return result;
    } catch (err) {
      const errorMsg = err?.message || 'Erreur lors de l\'utilisation des crédits';
      setError(errorMsg);
      throw err;
    }
  }, [loadBalance]);

  /**
   * Acheter des crédits
   */
  const buyCredits = useCallback(async (packageType, paymentMethod, phoneNumber) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ClientCreditService.purchaseCredits(
        packageType,
        paymentMethod,
        phoneNumber
      );
      
      if (result.success) {
        // Mettre à jour le solde local
        setBalance(result.data?.newBalance || 0);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err?.message || 'Erreur lors de l\'achat de crédits';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Charger l'historique des transactions
   */
  const loadTransactionHistory = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ClientCreditService.getTransactionHistory(options);
      return data?.transactions || [];
    } catch (err) {
      const errorMsg = err?.message || 'Erreur lors du chargement de l\'historique';
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialiser - charger le solde au montage
   */
  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  return {
    // État
    balance,
    isLoading,
    error,
    insufficientCreditsInfo,

    // Méthodes
    loadBalance,
    loadPackages,
    checkCredits,
    useCreditsForAction,
    buyCredits,
    loadTransactionHistory,

    // Utilitaires
    clearError: () => setError(null),
    clearInsufficientCreditsInfo: () => setInsufficientCreditsInfo(null)
  };
};

export default useCredits;
