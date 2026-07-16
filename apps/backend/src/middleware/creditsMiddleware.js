/**
 * Middleware de vérification des crédits
 * Vérifie si l'utilisateur a assez de crédits pour effectuer une action
 */

const CreditService = require('../services/creditService');
const creditsConfig = require('../config/creditsConfig');

/**
 * Middleware: Vérifier les crédits avant une action
 * Utilisation: router.post('/products', requireCredits('ADD_PRODUCT'), ...)
 */
const requireCredits = (actionType) => {
  return async (req, res, next) => {
    try {
      // Si le module est désactivé, autoriser l'action gratuitement
      if (!creditsConfig.ENABLED) {
        req.creditsInfo = {
          moduleEnabled: false,
          mode: 'free',
          message: 'Module de crédits désactivé - action gratuite'
        };
        return next();
      }

      const sellerId = req.seller?.id;
      if (!sellerId) {
        return res.status(401).json({
          success: false,
          error: 'Non authentifié',
          code: 'NOT_AUTHENTICATED'
        });
      }

      // Vérifier si l'utilisateur a assez de crédits
      const creditCheck = await CreditService.hasEnoughCredits(sellerId, actionType);

      if (!creditCheck.hasEnough) {
        return res.status(402).json({
          success: false,
          error: 'Crédits insuffisants',
          code: 'INSUFFICIENT_CREDITS',
          data: {
            currentBalance: creditCheck.currentBalance,
            requiredCredits: creditCheck.requiredCredits,
            missingCredits: creditCheck.requiredCredits - creditCheck.currentBalance,
            actionType
          }
        });
      }

      // Passer les infos de crédit pour l'étape suivante
      req.creditsInfo = {
        moduleEnabled: true,
        mode: 'paid',
        creditCheck,
        actionType
      };

      next();
    } catch (error) {
      console.error('Erreur dans middleware requireCredits:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la vérification des crédits',
        message: error.message
      });
    }
  };
};

/**
 * Middleware: Autoriser une action si crédits disponibles OU si module désactivé
 * Contrairement à requireCredits, celui-ci n'arrête pas si les crédits manquent
 * mais passe l'info pour que le endpoint décide quoi faire
 */
const checkCreditsInfo = async (req, res, next) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      req.creditsInfo = {
        moduleEnabled: creditsConfig.ENABLED,
        authenticated: false
      };
      return next();
    }

    // Si le module est désactivé, pas besoin de checker
    if (!creditsConfig.ENABLED) {
      req.creditsInfo = {
        moduleEnabled: false,
        mode: 'free',
        authenticated: true
      };
      return next();
    }

    // Charger l'info du vendeur
    const balance = await CreditService.getCreditBalance(sellerId);

    req.creditsInfo = {
      moduleEnabled: true,
      mode: 'paid',
      currentBalance: balance.balance,
      authenticated: true
    };

    next();
  } catch (error) {
    console.error('Erreur dans middleware checkCreditsInfo:', error);
    req.creditsInfo = {
      moduleEnabled: creditsConfig.ENABLED,
      error: error.message
    };
    next();
  }
};

module.exports = {
  requireCredits,
  checkCreditsInfo
};
