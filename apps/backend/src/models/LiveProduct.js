const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;
const Live = require('./Live');
const Product = require('./Product');

const LiveProduct = sequelize.define('LiveProduct', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  liveId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Live,
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  }
}, {
  tableName: 'live_products',
  timestamps: false
});

module.exports = LiveProduct; 