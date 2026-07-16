const Seller = require('./Seller');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Order = require('./Order');
const Live = require('./Live');
const LiveProduct = require('./LiveProduct');
const OTP = require('./OTP');
const Notification = require('./Notification');
const CreditTransaction = require('./CreditTransaction');
const Comment = require('./Comment');
const AdminSetting = require('./AdminSetting');
const PushSubscription = require('./PushSubscription');

// Définition des associations
Seller.hasMany(Product, { 
  foreignKey: 'seller_id', 
  as: 'products',
  onDelete: 'CASCADE'
});

Product.belongsTo(Seller, { 
  foreignKey: 'seller_id', 
  as: 'seller' 
});

// Associations pour les variantes de produits
Product.hasMany(ProductVariant, { 
  foreignKey: 'product_id', 
  as: 'variants',
  onDelete: 'CASCADE'
});

ProductVariant.belongsTo(Product, { 
  foreignKey: 'product_id', 
  as: 'product' 
});

Seller.hasMany(Order, { 
  foreignKey: 'seller_id', 
  as: 'orders' 
});

Order.belongsTo(Seller, { 
  foreignKey: 'seller_id', 
  as: 'seller' 
});

Product.hasMany(Order, { 
  foreignKey: 'product_id', 
  as: 'orders' 
});

Order.belongsTo(Product, { 
  foreignKey: 'product_id', 
  as: 'product' 
});

Seller.hasMany(Live, { foreignKey: 'sellerId' });
Live.belongsTo(Seller, { foreignKey: 'sellerId' });

Live.belongsToMany(Product, { through: LiveProduct, foreignKey: 'liveId', otherKey: 'productId' });
Product.belongsToMany(Live, { through: LiveProduct, foreignKey: 'productId', otherKey: 'liveId' });

// Associations pour les crédits
Seller.hasMany(CreditTransaction, {
  foreignKey: 'seller_id',
  as: 'creditTransactions',
  onDelete: 'CASCADE'
});

CreditTransaction.belongsTo(Seller, {
  foreignKey: 'seller_id',
  as: 'seller'
});

// Associations pour les commentaires
Order.hasOne(Comment, {
  foreignKey: 'order_id',
  as: 'client_comment',
  onDelete: 'CASCADE'
});

Comment.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

Comment.belongsTo(Seller, {
  foreignKey: 'seller_id',
  as: 'seller'
});

Seller.hasMany(Comment, {
  foreignKey: 'seller_id',
  as: 'comments',
  onDelete: 'CASCADE'
});

// Associations pour les push subscriptions
Seller.hasMany(PushSubscription, {
  foreignKey: 'seller_id',
  as: 'pushSubscriptions',
  onDelete: 'CASCADE'
});

PushSubscription.belongsTo(Seller, {
  foreignKey: 'seller_id',
  as: 'seller'
});

module.exports = {
  Seller,
  Product,
  ProductVariant,
  Order,
  Live,
  LiveProduct,
  OTP,
  Notification,
  CreditTransaction,
  Comment,
  AdminSetting,
  PushSubscription
};

