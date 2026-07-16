const CreditService = require('../services/creditService');

/**
 * Middleware pour vérifier si un vendeur a assez de crédits pour une action
 * @param {string} actionType - Type d'action (ADD_PRODUCT, PROCESS_ORDER, etc.)
 */
const requireCredits = (actionType) => {
  return async (req, res, next) => {
    try {
      // Recharger la config depuis la DB pour avoir l'état actuel du module
      await CreditService.loadConfigFromDatabase();
      
      const sellerId = req.seller.id; // Assurez-vous que req.seller est défini par le middleware d'auth

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          error: 'Vendeur non authentifié'
        });
      }

      // Si module désactivé, bypass complet
      if (!CreditService.isModuleEnabled()) {
        return next();
      }

      // Vérifier si l'utilisateur a assez de crédits
      const creditCheck = await CreditService.hasEnoughCredits(sellerId, actionType);

      if (!creditCheck.hasEnough) {
        return res.status(403).json({
          success: false,
          error: 'Crédits insuffisants',
          details: {
            currentBalance: creditCheck.currentBalance,
            requiredCredits: creditCheck.requiredCredits,
            actionType,
            actionDescription: CreditService.getActionDescription(actionType)
          },
          message: `Vous n'avez pas assez de crédits pour cette action. Solde actuel: ${creditCheck.currentBalance}, requis: ${creditCheck.requiredCredits}`
        });
      }

      // Ajouter les informations de crédits à la requête pour utilisation ultérieure
      req.creditInfo = {
        ...creditCheck,
        actionType
      };

      next();
    } catch (error) {
      console.error('Erreur dans le middleware de crédits:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la vérification des crédits',
        message: error.message
      });
    }
  };
};

/**
 * Middleware pour consommer automatiquement les crédits après une action réussie
 * @param {string} actionType - Type d'action
 * @param {function} metadataExtractor - Fonction pour extraire les métadonnées de la requête
 */
const consumeCredits = (actionType, metadataExtractor = null) => {
  return async (req, res, next) => {
    try {
      const sellerId = req.seller.id;
      
      // Extraire les métadonnées si une fonction est fournie
      const metadata = metadataExtractor ? metadataExtractor(req) : {};
      
      // Si module désactivé, ne rien consommer
      if (!CreditService.isModuleEnabled()) {
        res.locals.creditConsumption = {
          success: true,
          consumedCredits: 0,
          newBalance: undefined,
          actionType,
          bypassed: true
        };
        return next();
      }

      // Consommer les crédits
      const result = await CreditService.consumeCredits(sellerId, actionType, metadata);

      // Ajouter le résultat à la réponse
      res.locals.creditConsumption = {
        success: true,
        consumedCredits: result.consumedCredits,
        newBalance: result.newBalance,
        actionType
      };

      next();
    } catch (error) {
      console.error('Erreur lors de la consommation des crédits:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la consommation des crédits',
        message: error.message
      });
    }
  };
};

/**
 * Middleware pour vérifier et consommer les crédits en une seule étape
 * @param {string} actionType - Type d'action
 * @param {function} metadataExtractor - Fonction pour extraire les métadonnées
 */
const requireAndConsumeCredits = (actionType, metadataExtractor = null) => {
  return [
    requireCredits(actionType),
    consumeCredits(actionType, metadataExtractor)
  ];
};

/**
 * Middleware pour obtenir le solde de crédits
 */
const getCreditBalance = async (req, res, next) => {
  try {
    const sellerId = req.seller.id;
    const balance = await CreditService.getCreditBalance(sellerId);
    
    res.locals.creditBalance = balance;
    next();
  } catch (error) {
    console.error('Erreur lors de la récupération du solde:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du solde',
      message: error.message
    });
  }
};

module.exports = {
  requireCredits,
  consumeCredits,
  requireAndConsumeCredits,
  getCreditBalance
}; 