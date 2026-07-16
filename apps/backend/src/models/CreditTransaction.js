const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CreditTransaction = sequelize.define('CreditTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sellers',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['purchase', 'consumption', 'bonus', 'refund']]
    },
    comment: 'Type de transaction: purchase (achat), consumption (consommation), bonus (bonus), refund (remboursement)'
  },
  action_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Type d\'action pour les consommations: add_product, process_order, pin_product, generate_customer_card'
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Montant de crédits (positif pour ajout, négatif pour consommation)'
  },
  balance_before: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Solde avant la transaction'
  },
  balance_after: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Solde après la transaction'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      isIn: [['wave', 'orange_money', 'free_money', 'cash', 'bank_transfer', null]]
    },
    comment: 'Méthode de paiement pour les achats'
  },
  payment_reference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Référence de paiement externe'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description détaillée de la transaction'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Données supplémentaires (ID produit, ID commande, etc.)'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'completed',
    validate: {
      isIn: [['pending', 'completed', 'failed', 'cancelled']]
    }
  }
}, {
  tableName: 'credit_transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['seller_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = CreditTransaction; 