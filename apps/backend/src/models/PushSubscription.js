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
  // 'webpush' : endpoint = URL push du navigateur, keys_* requis
  // 'expo'    : endpoint = ExponentPushToken[...], keys_* null
  type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'webpush',
    validate: {
      isIn: [['webpush', 'expo']]
    }
  },
  keys_p256dh: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  keys_auth: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'push_subscriptions',
  indexes: [
    { fields: ['seller_id'] },
    { unique: true, fields: ['endpoint'] },
    { fields: ['seller_id', 'type'] }
  ]
});

module.exports = PushSubscription;
