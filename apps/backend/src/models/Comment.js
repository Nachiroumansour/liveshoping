const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    },
    comment: 'ID de la commande liée au commentaire'
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sellers',
      key: 'id'
    },
    comment: 'ID du vendeur'
  },
  customer_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    },
    comment: 'Nom du client'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 500]
    },
    comment: 'Contenu du commentaire'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Note de 1 à 5 étoiles'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si le commentaire est visible publiquement'
  }
}, {
  tableName: 'comments',
  timestamps: true,
  indexes: [
    {
      fields: ['seller_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Comment;
