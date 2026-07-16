const express = require('express');
const router = express.Router();
const { authenticateToken, adminOnly } = require('../middleware/auth');
const AdminSetting = require('../models/AdminSetting');
const CreditService = require('../services/creditService');

/**
 * GET /admin/settings/credits/status
 * Route PUBLIQUE pour vérifier si le module de crédits est activé (pas besoin d'authentification)
 */
router.get('/credits/status', async (req, res) => {
  try {
    const settings = await AdminSetting.findOne({
      where: { key: 'credits_module' }
    });

    const isEnabled = settings?.value?.enabled || false;

    res.json({
      success: true,
      data: {
        enabled: isEnabled
      }
    });
  } catch (error) {
    console.error('Erreur vérification statut module crédits:', error);
    // Retourner désactivé par défaut en cas d'erreur
    res.json({
      success: true,
      data: {
        enabled: false
      }
    });
  }
});

/**
 * GET /admin/settings/credits
 * Récupérer les paramètres actuels du module de crédits
 */
router.get('/credits', authenticateToken, adminOnly, async (req, res) => {
  try {
    const settings = await AdminSetting.findOne({
      where: { key: 'credits_module' }
    });

    // Valeurs par défaut
    const defaultConfig = {
      enabled: false,
      mode: 'free',
      initialCredits: 0,
      packages: {
        BASIC: { credits: 50, price: 5000 },
        STANDARD: { credits: 150, price: 12000 },
        PREMIUM: { credits: 300, price: 20000 },
        UNLIMITED: { credits: 1000, price: 50000 }
      },
      actionCosts: {
        ADD_PRODUCT: 1,
        PROCESS_ORDER: 2,
        PIN_PRODUCT: 3,
        GENERATE_CUSTOMER_CARD: 2
      },
      paymentMethods: {
        WAVE: { enabled: true },
        ORANGE_MONEY: { enabled: true },
        FREE_MONEY: { enabled: true },
        CASH: { enabled: true }
      }
    };

    // Fusionner les valeurs de la DB avec les valeurs par défaut
    const creditsConfig = settings?.value ? {
      ...defaultConfig,
      ...settings.value,
      // Fusionner actionCosts pour garantir que toutes les actions sont présentes
      actionCosts: {
        ...defaultConfig.actionCosts,
        ...(settings.value.actionCosts || {})
      },
      // Fusionner packages
      packages: {
        ...defaultConfig.packages,
        ...(settings.value.packages || {})
      },
      // Fusionner paymentMethods
      paymentMethods: {
        ...defaultConfig.paymentMethods,
        ...(settings.value.paymentMethods || {})
      }
    } : defaultConfig;

    res.json({
      success: true,
      data: creditsConfig,
      message: 'Paramètres du module de crédits récupérés'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

/**
 * PUT /admin/settings/credits
 * Mettre à jour les paramètres du module de crédits
 */
router.put('/credits', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { enabled, initialCredits, packages, actionCosts, paymentMethods } = req.body;

    // Validation
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        message: 'Le paramètre "enabled" doit être un booléen'
      });
    }

    const creditsConfig = {
      enabled,
      mode: enabled ? 'paid' : 'free',
      initialCredits: initialCredits || 0,
      packages: packages || {
        BASIC: { credits: 50, price: 5000 },
        STANDARD: { credits: 150, price: 12000 },
        PREMIUM: { credits: 300, price: 20000 },
        UNLIMITED: { credits: 1000, price: 50000 }
      },
      actionCosts: actionCosts || {
        ADD_PRODUCT: 1,
        PROCESS_ORDER: 2,
        PIN_PRODUCT: 3,
        GENERATE_CUSTOMER_CARD: 2
      },
      paymentMethods: paymentMethods || {
        WAVE: { enabled: true },
        ORANGE_MONEY: { enabled: true },
        FREE_MONEY: { enabled: true },
        CASH: { enabled: true }
      }
    };

    // Créer ou mettre à jour le paramètre
    await AdminSetting.upsert({
      key: 'credits_module',
      value: creditsConfig,
      updatedAt: new Date()
    });

    // Mettre à jour aussi le service en mémoire
    CreditService.setConfig(creditsConfig);

    res.json({
      success: true,
      data: creditsConfig,
      message: `Module de crédits ${enabled ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

/**
 * POST /admin/settings/credits/toggle
 * Activer/Désactiver rapidement le module de crédits
 */
router.post('/credits/toggle', authenticateToken, adminOnly, async (req, res) => {
  try {
    const settings = await AdminSetting.findOne({
      where: { key: 'credits_module' }
    });

    let creditsConfig = settings?.value || {
      enabled: false,
      mode: 'free'
    };

    // Toggle l'état
    const newEnabled = !creditsConfig.enabled;
    creditsConfig.enabled = newEnabled;
    creditsConfig.mode = newEnabled ? 'paid' : 'free';

    // Sauvegarder
    await AdminSetting.upsert({
      key: 'credits_module',
      value: creditsConfig,
      updatedAt: new Date()
    });

    // Mettre à jour le service
    CreditService.setConfig(creditsConfig);

    res.json({
      success: true,
      data: {
        enabled: newEnabled,
        mode: creditsConfig.mode,
        message: `Module de crédits ${newEnabled ? 'activé' : 'désactivé'}`
      }
    });
  } catch (error) {
    console.error('Erreur lors du toggle:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

/**
 * PUT /admin/settings/credits/package/:packageType
 * Modifier le prix d'un package
 */
router.put('/credits/package/:packageType', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { packageType } = req.params;
    const { price, credits } = req.body;

    const settings = await AdminSetting.findOne({
      where: { key: 'credits_module' }
    });

    let creditsConfig = settings?.value || {};

    if (!creditsConfig.packages) {
      creditsConfig.packages = {};
    }

    // Mettre à jour le package
    creditsConfig.packages[packageType] = {
      ...creditsConfig.packages[packageType],
      credits: credits || creditsConfig.packages[packageType]?.credits,
      price: price || creditsConfig.packages[packageType]?.price
    };

    await AdminSetting.upsert({
      key: 'credits_module',
      value: creditsConfig,
      updatedAt: new Date()
    });

    // Recharger la config complète depuis la base de données
    await CreditService.loadConfigFromDatabase();

    res.json({
      success: true,
      data: creditsConfig.packages[packageType],
      message: `Package ${packageType} mise à jour`
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du package:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

/**
 * PUT /admin/settings/credits/action-cost/:actionType
 * Modifier le coût d'une action
 */
router.put('/credits/action-cost/:actionType', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { actionType } = req.params;
    const { cost } = req.body;

    if (typeof cost !== 'number' || cost < 0) {
      return res.status(400).json({
        success: false,
        error: 'Donnée invalide',
        message: 'Le coût doit être un nombre positif'
      });
    }

    const settings = await AdminSetting.findOne({
      where: { key: 'credits_module' }
    });

    let creditsConfig = settings?.value || {};

    if (!creditsConfig.actionCosts) {
      creditsConfig.actionCosts = {};
    }

    creditsConfig.actionCosts[actionType] = cost;

    await AdminSetting.upsert({
      key: 'credits_module',
      value: creditsConfig,
      updatedAt: new Date()
    });

    // Recharger la config complète depuis la base de données
    await CreditService.loadConfigFromDatabase();

    res.json({
      success: true,
      data: {
        actionType,
        cost,
        ...creditsConfig.actionCosts
      },
      message: `Coût de ${actionType} mis à jour à ${cost} crédits`
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du coût:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

/**
 * GET /admin/settings/credits/stats
 * Statistiques sur l'utilisation des crédits
 */
router.get('/credits/stats', authenticateToken, adminOnly, async (req, res) => {
  try {
    const CreditTransaction = require('../models/CreditTransaction');
    const Seller = require('../models/Seller');

    const totalTransactions = await CreditTransaction.count();
    const completedTransactions = await CreditTransaction.count({
      where: { status: 'completed' }
    });
    const totalCreditsUsed = await CreditTransaction.sum('amount', {
      where: { type: 'consumption' }
    }) || 0;
    const totalRevenue = await CreditTransaction.sum('amount', {
      where: { type: 'purchase' }
    }) || 0;
    const sellersWithCredits = await Seller.count({
      where: { credits: { [require('sequelize').Op.gt]: 0 } }
    });

    res.json({
      success: true,
      data: {
        totalTransactions,
        completedTransactions,
        totalCreditsUsed,
        totalRevenue,
        sellersWithCredits
      },
      message: 'Statistiques récupérées'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

module.exports = router;
