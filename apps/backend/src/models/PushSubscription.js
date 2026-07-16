const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PushSubscription = sequelize.define('PushSubscription', {
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
  endpoint: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  keys_p256dh: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  keys_auth: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'push_subscriptions',
  indexes: [
    { fields: ['seller_id'] },
    { unique: true, fields: ['endpoint'] }
  ]
});

module.exports = PushSubscription;
