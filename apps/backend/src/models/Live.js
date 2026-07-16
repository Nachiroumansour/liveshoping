const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;
const Seller = require('./Seller');

const Live = sequelize.define('Live', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Seller,
      key: 'id'
    }
  }
}, {
  tableName: 'lives',
  timestamps: true
});

module.exports = Live; 