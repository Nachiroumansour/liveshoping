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
    type: DataTypes.STRING(100),
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
      // Générer un slug à partir du nom de la boutique
      if (!seller.public_link_id || /^[a-z0-9]{8,12}$/.test(seller.public_link_id)) {
        seller.public_link_id = await generateUniqueSlug(seller.name || 'boutique');
      }
      // Attribuer 100 crédits gratuits à l'inscription
      seller.credit_balance = 100;
    }
  }
});

// Slugify : convertir un nom en slug URL-safe
const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD')                   // Décomposer accents (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '')    // Supprimer les diacritiques
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')      // Garder que alphanum, espaces, tirets
    .replace(/[\s_]+/g, '-')            // Espaces/underscores → tirets
    .replace(/-+/g, '-')               // Multiples tirets → un seul
    .replace(/^-|-$/g, '');            // Pas de tiret au début/fin
};

// Générer un slug unique à partir du nom
const generateUniqueSlug = async (name) => {
  const baseSlug = slugify(name);

  // Si le slug est vide (nom avec que des caractères spéciaux), fallback
  if (!baseSlug) {
    const timestamp = Date.now().toString(36);
    return `boutique-${timestamp}`;
  }

  // Vérifier si le slug de base est disponible
  const existing = await Seller.findOne({ where: { public_link_id: baseSlug } });
  if (!existing) return baseSlug;

  // Sinon, ajouter un suffixe numérique
  for (let i = 2; i <= 50; i++) {
    const candidate = `${baseSlug}-${i}`;
    const found = await Seller.findOne({ where: { public_link_id: candidate } });
    if (!found) return candidate;
  }

  // Dernier recours : slug + random
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSuffix}`;
};

// Fonction legacy pour compatibilité
const generateUniquePublicLinkId = async () => {
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `boutique-${timestamp}${randomSuffix}`;
};

module.exports = Seller;
module.exports.slugify = slugify;
module.exports.generateUniqueSlug = generateUniqueSlug;

