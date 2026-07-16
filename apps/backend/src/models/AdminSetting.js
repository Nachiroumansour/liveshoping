const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminSetting = sequelize.define('AdminSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.JSON,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sellers',
      key: 'id'
    }
  }
}, {
  tableName: 'admin_settings',
  timestamps: true
});

module.exports = AdminSetting;
