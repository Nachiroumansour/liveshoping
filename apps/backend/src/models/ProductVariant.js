const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  // Nom de la variante (ex: "Rouge - M", "Bleu - L")
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // Attributs de la variante (ex: {color: "rouge", size: "M"})
  attributes: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Attributs spécifiques de cette variante'
  },
  // Prix spécifique à la variante (optionnel)
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Prix spécifique à cette variante (si différent du produit principal)'
  },
  // Stock spécifique à la variante
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  // Image spécifique à la variante
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Statut de la variante
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive', 'out_of_stock']]
    }
  },
  // Code SKU unique
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  }
}, {
  tableName: 'product_variants'
});

module.exports = ProductVariant; 