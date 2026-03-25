const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Seller = sequelize.define('Seller', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  public_link_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  pin_hash: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Hash du code PIN à 4 chiffres'
  },
  credit_balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: {
      min: 0
    },
    comment: 'Solde de crédits du vendeur (100 crédits gratuits à l\'inscription)'
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'seller',
    validate: {
      isIn: [['seller', 'admin', 'superadmin']]
    },
    comment: 'Rôle de l\'utilisateur: seller (vendeur), admin (gestionnaire), superadmin (administrateur global)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Statut actif/inactif du vendeur'
  },
  // Configuration des méthodes de paiement
  payment_settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Configuration des méthodes de paiement (Wave, Orange Money, etc.)'
  },
  wave_qr_code_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL du QR code Wave uploadé par le vendeur'
  },
  orange_money_qr_code_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL du QR code Orange Money uploadé par le vendeur'
  },
  payment_methods_enabled: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ['manual'],
    comment: 'Méthodes de paiement activées par le vendeur'
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL du logo de la boutique'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Description courte de la boutique'
  }
}, {
  tableName: 'sellers',
  indexes: [
    { unique: true, fields: ['phone_number'] },
    { unique: true, fields: ['public_link_id'] },
    { fields: ['role'] },
    { fields: ['is_active'] }
  ],
  hooks: {
    beforeCreate: async (seller) => {
      // Générer un ID de lien public unique
      seller.public_link_id = await generateUniquePublicLinkId();
      // Attribuer 100 crédits gratuits à l'inscription
      seller.credit_balance = 100;
    }
  }
});

// Fonction pour générer un ID de lien public unique
const generateUniquePublicLinkId = async () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let linkId;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    // Générer un ID de 10 caractères pour plus de combinaisons
    linkId = '';
    for (let i = 0; i < 10; i++) {
      linkId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Vérifier l'unicité
    const existingSeller = await Seller.findOne({ where: { public_link_id: linkId } });
    if (!existingSeller) {
      return linkId;
    }
    
    attempts++;
  }
  
  // Si on n'a pas trouvé après maxAttempts, utiliser un timestamp
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `v${timestamp}${randomSuffix}`;
};

module.exports = Seller;

