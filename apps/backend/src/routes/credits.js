const express = require('express');
const router = express.Router();
const CreditService = require('../services/creditService');
const { requireCredits } = require('../middleware/creditMiddleware');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /credits
 * Consulter les crédits restants pour l'utilisateur connecté
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const balance = await CreditService.getCreditBalance(sellerId);
    
    res.json({
      success: true,
      data: {
        balance: balance.balance,
        sellerName: balance.sellerName,
        sellerId: balance.sellerId
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du solde:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du solde',
      message: error.message
    });
  }
});

/**
 * POST /credits/purchase
 * Acheter des crédits
 */
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const { packageType, paymentMethod, phoneNumber } = req.body;
    const sellerId = req.seller.id;

    // Validation des données
    if (!packageType || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Données manquantes',
        message: 'packageType et paymentMethod sont requis'
      });
    }

    // Vérifier que le package existe
    const availablePackages = CreditService.getAvailablePackages();
    if (!availablePackages[packageType]) {
      return res.status(400).json({
        success: false,
        error: 'Package invalide',
        message: `Package ${packageType} non reconnu`,
        availablePackages: Object.keys(availablePackages)
      });
    }

    // Procéder à l'achat
    const result = await CreditService.purchaseCredits(sellerId, packageType, paymentMethod, phoneNumber);

    res.json({
      success: true,
      data: {
        newBalance: result.newBalance,
        purchasedCredits: result.purchasedCredits,
        transaction: result.transaction,
        paymentResult: result.paymentResult
      },
      message: `Achat de ${result.purchasedCredits} crédits réussi`
    });
  } catch (error) {
    console.error('Erreur lors de l\'achat de crédits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'achat de crédits',
      message: error.message
    });
  }
});

/**
 * POST /credits/consume
 * Consommer des crédits avec un actionType
 */
router.post('/consume', authenticateToken, async (req, res) => {
  try {
    const { actionType, metadata } = req.body;
    const sellerId = req.seller.id;

    // Validation des données
    if (!actionType) {
      return res.status(400).json({
        success: false,
        error: 'Action type manquant',
        message: 'actionType est requis'
      });
    }

    // Vérifier que l'action type est valide
    const actionCosts = CreditService.getActionCosts();
    if (!actionCosts[actionType]) {
      return res.status(400).json({
        success: false,
        error: 'Action type invalide',
        message: `Action type ${actionType} non reconnu`,
        availableActions: Object.keys(actionCosts)
      });
    }

    // Consommer les crédits
    const result = await CreditService.consumeCredits(sellerId, actionType, metadata || {});

    res.json({
      success: true,
      data: {
        newBalance: result.newBalance,
        consumedCredits: result.consumedCredits,
        transaction: result.transaction
      },
      message: `${result.consumedCredits} crédits consommés pour ${actionType}`
    });
  } catch (error) {
    console.error('Erreur lors de la consommation de crédits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la consommation de crédits',
      message: error.message
    });
  }
});

/**
 * POST /credits/bonus
 * Ajouter des crédits (ex : bonus admin, promo...)
 */
router.post('/bonus', authenticateToken, async (req, res) => {
  try {
    const { amount, reason, metadata } = req.body;
    const sellerId = req.seller.id;

    // Validation des données
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Montant invalide',
        message: 'amount doit être un nombre positif'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Raison manquante',
        message: 'reason est requis'
      });
    }

    // Ajouter le bonus
    const result = await CreditService.addBonusCredits(sellerId, amount, reason, metadata || {});

    res.json({
      success: true,
      data: {
        newBalance: result.newBalance,
        bonusCredits: result.bonusCredits,
        transaction: result.transaction
      },
      message: `${result.bonusCredits} crédits bonus ajoutés: ${reason}`
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du bonus:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout du bonus',
      message: error.message
    });
  }
});

/**
 * GET /credits/history
 * Obtenir l'historique des transactions
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const { limit = 50, offset = 0 } = req.query;

    const history = await CreditService.getTransactionHistory(sellerId, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique',
      message: error.message
    });
  }
});

/**
 * GET /credits/stats
 * Obtenir les statistiques de crédits
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const stats = await CreditService.getCreditStats(sellerId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques',
      message: error.message
    });
  }
});

/**
 * GET /credits/packages
 * Obtenir les packages de crédits disponibles
 */
router.get('/packages', async (req, res) => {
  try {
    // Recharger la config depuis la DB pour s'assurer que les modifications du SuperAdmin sont prises en compte
    await CreditService.loadConfigFromDatabase();
    
    const packages = CreditService.getAvailablePackages();
    const actionCosts = CreditService.getActionCosts();
    const isEnabled = CreditService.isCreditsModuleEnabled();
    const mode = CreditService.getCreditsMode();

    res.json({
      success: true,
      data: {
        packages,
        actionCosts,
        isEnabled,
        mode,
        message: isEnabled 
          ? 'Module de crédits activé - utilisateurs doivent acheter des crédits'
          : 'Module de crédits désactivé - utilisateurs ont accès gratuit'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des packages:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des packages',
      message: error.message
    });
  }
});

/**
 * POST /credits/check
 * Vérifier si l'utilisateur a assez de crédits pour une action
 */
router.post('/check', authenticateToken, async (req, res) => {
  try {
    const { actionType } = req.body;
    const sellerId = req.seller.id;

    if (!actionType) {
      return res.status(400).json({
        success: false,
        error: 'Action type manquant',
        message: 'actionType est requis'
      });
    }

    const check = await CreditService.hasEnoughCredits(sellerId, actionType);

    res.json({
      success: true,
      data: {
        ...check,
        actionDescription: CreditService.getActionDescription(actionType)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des crédits:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification des crédits',
      message: error.message
    });
  }
});

module.exports = router; 