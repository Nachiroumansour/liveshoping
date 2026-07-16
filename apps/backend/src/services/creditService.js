const { Seller, CreditTransaction } = require('../models');
const { Op } = require('sequelize');
const creditsConfig = require('../config/creditsConfig');
const PaymentIntegrationService = require('./paymentIntegrationService');

// Configuration locale (sera mise à jour dynamiquement depuis la base)
let cachedConfig = { ...creditsConfig };

class CreditService {
  /**
   * Charger la configuration depuis la base de données
   */
  static async loadConfigFromDatabase() {
    try {
      const AdminSetting = require('../models').AdminSetting;
      if (!AdminSetting) {
        return cachedConfig;
      }

      const setting = await AdminSetting.findOne({
        where: { key: 'credits_module' }
      });

      if (setting && setting.value) {
        // Fusionner les ACTION_COSTS de la DB avec les valeurs par défaut
        // pour s'assurer que tous les types d'actions sont définis
        const actionCosts = {
          ...creditsConfig.ACTION_COSTS,  // Valeurs par défaut
          ...(setting.value.actionCosts || {})  // Valeurs de la DB (écrasent les défauts)
        };

        cachedConfig = {
          ENABLED: setting.value.enabled || false,
          MODE: setting.value.mode || 'free',
          INITIAL_CREDITS: setting.value.initialCredits || 0,
          PACKAGES: setting.value.packages || creditsConfig.PACKAGES,
          ACTION_COSTS: actionCosts,
          PAYMENT_METHODS: setting.value.paymentMethods || creditsConfig.PAYMENT_METHODS
        };
      }
      return cachedConfig;
    } catch (error) {
      console.error('Erreur lors du chargement de la config:', error);
      return cachedConfig;
    }
  }

  /**
   * Définir la configuration en mémoire
   */
  static setConfig(config) {
    cachedConfig = {
      ENABLED: config.enabled || false,
      MODE: config.mode || 'free',
      INITIAL_CREDITS: config.initialCredits || 0,
      PACKAGES: config.packages || creditsConfig.PACKAGES,
      ACTION_COSTS: config.actionCosts || creditsConfig.ACTION_COSTS,
      PAYMENT_METHODS: config.paymentMethods || creditsConfig.PAYMENT_METHODS
    };
  }

  /**
   * Récupérer la configuration actuelle
   */
  static getConfig() {
    return cachedConfig;
  }

  /**
   * Vérifier si le module est activé
   */
  static isModuleEnabled() {
    return cachedConfig.ENABLED === true;
  }

  /**
   * Obtenir le mode actuel
   */
  static getMode() {
    return cachedConfig.MODE || 'free';
  }
  /**
   * Vérifier si un vendeur a assez de crédits pour une action
   */
  static async hasEnoughCredits(sellerId, actionType) {
    try {
      const seller = await Seller.findByPk(sellerId);
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      // Bypass complet si le module est désactivé
      if (!cachedConfig.ENABLED) {
        return {
          hasEnough: true,
          currentBalance: seller.credit_balance,
          requiredCredits: 0,
          remainingCredits: seller.credit_balance
        };
      }

      const requiredCredits = cachedConfig.ACTION_COSTS[actionType];
      if (requiredCredits === undefined || requiredCredits === null) {
        console.error(`❌ Action type non reconnue: ${actionType}. ACTION_COSTS disponibles:`, cachedConfig.ACTION_COSTS);
        throw new Error(`Type d'action non reconnu: ${actionType}`);
      }

      console.log(`✅ Vérification crédits - Vendeur: ${sellerId}, Action: ${actionType}, Solde: ${seller.credit_balance}, Requis: ${requiredCredits}`);

      return {
        hasEnough: seller.credit_balance >= requiredCredits,
        currentBalance: seller.credit_balance,
        requiredCredits,
        remainingCredits: seller.credit_balance - requiredCredits
      };
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification des crédits pour ${sellerId}/${actionType}:`, error);
      throw new Error(`Erreur lors de la vérification des crédits: ${error.message}`);
    }
  }

  /**
   * Consommer des crédits pour une action
   */
  static async consumeCredits(sellerId, actionType, metadata = {}) {
    const transaction = await CreditTransaction.sequelize.transaction();
    
    try {
      const seller = await Seller.findByPk(sellerId, { transaction });
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      // Bypass consommation si module désactivé (aucune écriture DB, aucune transaction)
      if (!cachedConfig.ENABLED) {
        await transaction.rollback(); // Annuler la transaction ouverte inutilement
        return {
          success: true,
          transaction: null,
          newBalance: seller.credit_balance,
          consumedCredits: 0,
          bypassed: true
        };
      }

      const requiredCredits = cachedConfig.ACTION_COSTS[actionType];
      if (requiredCredits === undefined || requiredCredits === null) {
        console.error(`❌ Action type non reconnue: ${actionType}. ACTION_COSTS disponibles:`, cachedConfig.ACTION_COSTS);
        throw new Error(`Type d'action non reconnu: ${actionType}`);
      }

      if (seller.credit_balance < requiredCredits) {
        console.warn(`⚠️ Crédits insuffisants - Vendeur: ${sellerId}, Solde: ${seller.credit_balance}, Requis: ${requiredCredits}`);
        throw new Error(`Crédits insuffisants. Solde actuel: ${seller.credit_balance}, requis: ${requiredCredits}`);
      }

      console.log(`💳 Consommation de crédits - Vendeur: ${sellerId}, Action: ${actionType}, Montant: ${requiredCredits}, Solde avant: ${seller.credit_balance}`);

      const balanceBefore = seller.credit_balance;
      const balanceAfter = seller.credit_balance - requiredCredits;

      // Mettre à jour le solde du vendeur
      await seller.update({ credit_balance: balanceAfter }, { transaction });

      // Créer la transaction de consommation
      const creditTransaction = await CreditTransaction.create({
        seller_id: sellerId,
        type: 'consumption',
        action_type: actionType,
        amount: -requiredCredits,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: this.getActionDescription(actionType),
        metadata,
        status: 'completed'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        transaction: creditTransaction,
        newBalance: balanceAfter,
        consumedCredits: requiredCredits
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erreur lors de la consommation des crédits: ${error.message}`);
    }
  }

  /**
   * Acheter des crédits
   */
  static async purchaseCredits(sellerId, packageType, paymentMethod, phoneNumber = null) {
    const transaction = await CreditTransaction.sequelize.transaction();
    
    try {
      const seller = await Seller.findByPk(sellerId, { transaction });
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      // Vérifier que le module de crédits est activé
      if (!cachedConfig.ENABLED && !creditsConfig.ENABLED) {
        throw new Error('Module de crédits désactivé. Veuillez contacter l\'administrateur.');
      }

      const packages = cachedConfig.PACKAGES || creditsConfig.PACKAGES;
      const creditPackage = packages[packageType];
      if (!creditPackage) {
        throw new Error(`Package de crédits non reconnu: ${packageType}`);
      }

      // Vérifier les paramètres de paiement
      const paymentPhoneNumber = phoneNumber || seller.phone_number;
      if (!paymentPhoneNumber) {
        throw new Error('Numéro de téléphone requis pour le paiement');
      }

      // Appeler le vrai service de paiement (pas de simulation)
      const paymentResult = await PaymentIntegrationService.processPayment(
        paymentMethod,
        creditPackage.price,
        paymentPhoneNumber,
        { packageType, sellerId: sellerId, sellerName: seller.name }
      );
      
      if (!paymentResult.success) {
        throw new Error(`Erreur de paiement: ${paymentResult.error}`);
      }

      const balanceBefore = seller.credit_balance;
      const balanceAfter = seller.credit_balance + creditPackage.credits;

      // Mettre à jour le solde du vendeur
      await seller.update({ credit_balance: balanceAfter }, { transaction });

      // Créer la transaction d'achat
      const creditTransaction = await CreditTransaction.create({
        seller_id: sellerId,
        type: 'purchase',
        action_type: null,
        amount: creditPackage.credits,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        payment_method: paymentMethod,
        payment_reference: paymentResult.reference,
        description: `Achat de ${creditPackage.credits} crédits (${packageType})`,
        metadata: {
          packageType,
          price: creditPackage.price,
          paymentMethod,
          phoneNumber: paymentPhoneNumber
        },
        status: 'completed'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        transaction: creditTransaction,
        newBalance: balanceAfter,
        purchasedCredits: creditPackage.credits,
        paymentResult
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erreur lors de l'achat de crédits: ${error.message}`);
    }
  }

  /**
   * Ajouter des crédits bonus
   */
  static async addBonusCredits(sellerId, amount, reason = 'Bonus', metadata = {}) {
    const transaction = await CreditTransaction.sequelize.transaction();
    
    try {
      const seller = await Seller.findByPk(sellerId, { transaction });
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      if (amount <= 0) {
        throw new Error('Le montant du bonus doit être positif');
      }

      const balanceBefore = seller.credit_balance;
      const balanceAfter = seller.credit_balance + amount;

      // Mettre à jour le solde du vendeur
      await seller.update({ credit_balance: balanceAfter }, { transaction });

      // Créer la transaction de bonus
      const creditTransaction = await CreditTransaction.create({
        seller_id: sellerId,
        type: 'bonus',
        action_type: null,
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Bonus: ${reason}`,
        metadata,
        status: 'completed'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        transaction: creditTransaction,
        newBalance: balanceAfter,
        bonusCredits: amount
      };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Erreur lors de l'ajout du bonus: ${error.message}`);
    }
  }

  /**
   * Obtenir le solde de crédits d'un vendeur
   */
  static async getCreditBalance(sellerId) {
    try {
      const seller = await Seller.findByPk(sellerId);
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      return {
        sellerId,
        balance: seller.credit_balance,
        sellerName: seller.name
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du solde: ${error.message}`);
    }
  }

  /**
   * Obtenir l'historique des transactions d'un vendeur
   */
  static async getTransactionHistory(sellerId, limit = 50, offset = 0) {
    try {
      const transactions = await CreditTransaction.findAll({
        where: { seller_id: sellerId },
        order: [['created_at', 'DESC']],
        limit,
        offset,
        include: [{
          model: Seller,
          as: 'seller',
          attributes: ['id', 'name', 'phone_number']
        }]
      });

      const total = await CreditTransaction.count({
        where: { seller_id: sellerId }
      });

      return {
        transactions,
        total,
        limit,
        offset
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique: ${error.message}`);
    }
  }

  /**
   * Obtenir les statistiques de crédits d'un vendeur
   */
  static async getCreditStats(sellerId) {
    try {
      const seller = await Seller.findByPk(sellerId);
      if (!seller) {
        throw new Error('Vendeur non trouvé');
      }

      const stats = await CreditTransaction.findAll({
        where: { seller_id: sellerId },
        attributes: [
          'type',
          [CreditTransaction.sequelize.fn('SUM', CreditTransaction.sequelize.col('amount')), 'totalAmount'],
          [CreditTransaction.sequelize.fn('COUNT', CreditTransaction.sequelize.col('id')), 'count']
        ],
        group: ['type']
      });

      const totalPurchased = stats.find(s => s.type === 'purchase')?.dataValues.totalAmount || 0;
      const totalConsumed = Math.abs(stats.find(s => s.type === 'consumption')?.dataValues.totalAmount || 0);
      const totalBonus = stats.find(s => s.type === 'bonus')?.dataValues.totalAmount || 0;

      return {
        currentBalance: seller.credit_balance,
        totalPurchased,
        totalConsumed,
        totalBonus,
        netCredits: totalPurchased + totalBonus - totalConsumed,
        stats
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  /**
   * Obtenir les packages de crédits disponibles
   */
  static getAvailablePackages() {
    return cachedConfig.PACKAGES || creditsConfig.PACKAGES;
  }

  /**
   * Obtenir les coûts des actions
   */
  static getActionCosts() {
    return cachedConfig.ACTION_COSTS || creditsConfig.ACTION_COSTS;
  }

  /**
   * Vérifier si le module de crédits est activé
   */
  static isCreditsModuleEnabled() {
    return cachedConfig.ENABLED === true;
  }

  /**
   * Obtenir le mode de fonctionnement actuel
   */
  static getCreditsMode() {
    return creditsConfig.MODE;
  }

  /**
   * Simuler un appel de paiement (à remplacer par un vrai prestataire)
   */
  static async simulatePayment(paymentMethod, amount, reference = null) {
    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simuler un succès de paiement (dans la vraie vie, on appellerait Paydunya, CinetPay, etc.)
    const success = Math.random() > 0.1; // 90% de succès

    if (success) {
      return {
        success: true,
        reference: reference || `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount,
        paymentMethod,
        timestamp: new Date()
      };
    } else {
      return {
        success: false,
        error: 'Paiement refusé par le prestataire',
        reference: null
      };
    }
  }

  /**
   * Obtenir la description d'une action
   */
  static getActionDescription(actionType) {
    const descriptions = {
      ADD_PRODUCT: 'Ajout d\'un produit à la vitrine',
      PROCESS_ORDER: 'Traitement d\'une commande avec notification vocale',
      PIN_PRODUCT: 'Épinglage d\'un produit pendant le live',
      GENERATE_CUSTOMER_CARD: 'Génération d\'une fiche client'
    };

    return descriptions[actionType] || `Action: ${actionType}`;
  }
}

module.exports = CreditService; 