/**
 * Configuration du module de crédits
 * Ce fichier centralise tous les paramètres du système de crédits
 */

module.exports = {
  // **ACTIVATION/DÉSACTIVATION DU MODULE**
  // Défini dans .env : CREDITS_MODULE_ENABLED=true ou false
  // Les users ne peuvent acheter des crédits que si ce flag est à true
  // Les admins ont toujours accès au module de gestion des crédits
  ENABLED: process.env.CREDITS_MODULE_ENABLED === 'true',

  // **CRÉDITS INITIAUX POUR LES NOUVEAUX USERS**
  // Si CREDITS_MODULE_ENABLED=false, les users ont des crédits illimités
  INITIAL_CREDITS: parseInt(process.env.INITIAL_CREDITS || '0'),

  // **MODE DE FONCTIONNEMENT**
  // 'paid' = Utilisateurs doivent acheter des crédits
  // 'free' = Les crédits sont illimités (par défaut jusqu'à l'activation)
  MODE: process.env.CREDITS_MODULE_ENABLED === 'true' ? 'paid' : 'free',

  // **PACKAGES DE CRÉDITS**
  PACKAGES: {
    BASIC: { 
      credits: 50, 
      price: 5000,
      label: 'Basique'
    },
    STANDARD: { 
      credits: 150, 
      price: 12000,
      label: 'Standard'
    },
    PREMIUM: { 
      credits: 300, 
      price: 20000,
      label: 'Premium'
    },
    UNLIMITED: { 
      credits: 1000, 
      price: 50000,
      label: 'Illimité'
    }
  },

  // **COÛTS DES ACTIONS EN CRÉDITS**
  ACTION_COSTS: {
    ADD_PRODUCT: 1,
    PROCESS_ORDER: 2,
    PIN_PRODUCT: 3,
    GENERATE_CUSTOMER_CARD: 2
  },

  // **MÉTHODES DE PAIEMENT SUPPORTÉES**
  PAYMENT_METHODS: {
    WAVE: {
      name: 'Wave',
      code: 'wave',
      enabled: true,
      // Les détails d'intégration seront ajoutés plus tard
      config: {
        // apiKey: process.env.WAVE_API_KEY,
        // apiUrl: process.env.WAVE_API_URL
      }
    },
    ORANGE_MONEY: {
      name: 'Orange Money',
      code: 'orange_money',
      enabled: true,
      config: {
        // apiKey: process.env.ORANGE_MONEY_API_KEY,
        // apiUrl: process.env.ORANGE_MONEY_API_URL
      }
    }
  },

  // **STATUTS DES TRANSACTIONS**
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // **TYPES DE TRANSACTIONS**
  TRANSACTION_TYPES: {
    PURCHASE: 'purchase',
    CONSUMPTION: 'consumption',
    BONUS: 'bonus',
    REFUND: 'refund',
    ADJUSTMENT: 'adjustment'
  }
};
