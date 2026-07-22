const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Journal d'événements de boutique (append-only).
// Source de vérité de la page "Le pouls de ma boutique" et,
// plus tard, des workflows et de la mesure de valeur.
const Event = sequelize.define('Event', {
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
  // Liste fermée v1 : order_created, order_paid, order_delivered,
  // product_created, stock_low, stock_out, comment_added
  type: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  }
}, {
  tableName: 'events',
  updatedAt: false,
  indexes: [
    { fields: ['seller_id', 'created_at'] },
    { fields: ['seller_id', 'type'] }
  ]
});

module.exports = Event;
