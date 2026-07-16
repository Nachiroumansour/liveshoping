const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
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
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['new_order', 'order_status_update', 'new_comment', 'system']]
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('data');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('data', JSON.stringify(value));
    }
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  retry_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  max_retries: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  }
}, {
  tableName: 'notifications',
  indexes: [
    {
      fields: ['seller_id', 'read']
    },
    {
      fields: ['type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Notification; 