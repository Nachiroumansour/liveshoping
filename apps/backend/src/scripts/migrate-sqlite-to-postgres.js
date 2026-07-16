const { Sequelize } = require('sequelize');
const path = require('path');

async function migrate() {
  const sqlite = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false
  });

  // Postgres depuis env
  const pgUrl = process.env.DATABASE_URL;
  const pg = pgUrl
    ? new Sequelize(pgUrl, { dialect: 'postgres', logging: false, dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {} })
    : new Sequelize(process.env.DB_NAME || 'liveshop', process.env.DB_USERNAME || 'postgres', process.env.DB_PASSWORD || 'postgres', {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres',
        logging: false,
        dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {}
      });

  const defineModels = (sequelize) => {
    const Seller = sequelize.define('Seller', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      phone_number: { type: Sequelize.STRING(20) },
      name: { type: Sequelize.STRING(200) },
      public_link_id: { type: Sequelize.STRING(100) },
      pin_hash: { type: Sequelize.STRING(255) },
      credit_balance: Sequelize.INTEGER,
      role: { type: Sequelize.STRING(50) },
      is_active: Sequelize.BOOLEAN,
      payment_settings: Sequelize.TEXT,
      wave_qr_code_url: Sequelize.TEXT,
      orange_money_qr_code_url: Sequelize.TEXT,
      payment_methods_enabled: Sequelize.TEXT
    }, { tableName: 'sellers', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    const Product = sequelize.define('Product', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      seller_id: Sequelize.INTEGER,
      name: { type: Sequelize.STRING(500) },
      price: Sequelize.FLOAT,
      description: Sequelize.TEXT,
      image_url: Sequelize.TEXT,
      stock_quantity: Sequelize.INTEGER,
      is_pinned: Sequelize.BOOLEAN,
      category: { type: Sequelize.STRING(100) },
      attributes: Sequelize.TEXT,
      images: Sequelize.TEXT,
      tags: Sequelize.TEXT,
      has_variants: Sequelize.BOOLEAN,
      status: { type: Sequelize.STRING(50) },
      weight: Sequelize.FLOAT,
      dimensions: Sequelize.TEXT
    }, { tableName: 'products', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    const ProductVariant = sequelize.define('ProductVariant', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: Sequelize.INTEGER,
      name: { type: Sequelize.STRING(200) },
      price: Sequelize.FLOAT,
      stock_quantity: Sequelize.INTEGER
    }, { tableName: 'product_variants', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    const Order = sequelize.define('Order', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      product_id: Sequelize.INTEGER,
      seller_id: Sequelize.INTEGER,
      customer_name: { type: Sequelize.STRING(200) },
      customer_phone: { type: Sequelize.STRING(20) },
      customer_address: { type: Sequelize.STRING(500) },
      quantity: Sequelize.INTEGER,
      total_price: Sequelize.FLOAT,
      payment_method: { type: Sequelize.STRING(50) },
      payment_proof_url: Sequelize.TEXT,
      status: { type: Sequelize.STRING(50) },
      comment: Sequelize.TEXT
    }, { tableName: 'orders', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    const Live = sequelize.define('Live', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      sellerId: Sequelize.INTEGER,
      title: { type: Sequelize.STRING(200) }
    }, { tableName: 'lives', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    const LiveProduct = sequelize.define('LiveProduct', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      liveId: Sequelize.INTEGER,
      productId: Sequelize.INTEGER
    }, { tableName: 'live_products', timestamps: false });

    const Notification = sequelize.define('Notification', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      seller_id: Sequelize.INTEGER,
      type: { type: Sequelize.STRING(50) },
      title: { type: Sequelize.STRING(200) },
      message: Sequelize.TEXT,
      data: Sequelize.TEXT,
      read: Sequelize.BOOLEAN,
      sent: Sequelize.BOOLEAN,
      retry_count: Sequelize.INTEGER,
      max_retries: Sequelize.INTEGER,
      sent_at: Sequelize.DATE
    }, { tableName: 'notifications', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    const CreditTransaction = sequelize.define('CreditTransaction', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      seller_id: Sequelize.INTEGER,
      amount: Sequelize.INTEGER,
      type: { type: Sequelize.STRING(50) },
      metadata: Sequelize.TEXT
    }, { tableName: 'credit_transactions', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    const OTP = sequelize.define('OTP', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      phone_number: { type: Sequelize.STRING(20) },
      otp: { type: Sequelize.STRING(10) },
      expires_at: Sequelize.DATE,
      type: { type: Sequelize.STRING(50) },
      used: Sequelize.BOOLEAN
    }, { tableName: 'otps', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

    return { Seller, Product, ProductVariant, Order, Live, LiveProduct, Notification, CreditTransaction, OTP };
  };

  const src = defineModels(sqlite);
  const dst = defineModels(pg);

  await pg.authenticate();
  await sqlite.authenticate();
  await pg.sync(); // crée les tables si absentes

  const copy = async (modelName, where = {}, transform = (r) => r) => {
    const rows = await src[modelName].findAll({ where, raw: true });
    if (!rows.length) return 0;
    const data = rows.map(transform);
    await dst[modelName].bulkCreate(data, { ignoreDuplicates: true, validate: false });
    return rows.length;
  };

  // Ordre respectant les FK
  console.log('➡️  Migration des sellers'); await copy('Seller');
  console.log('➡️  Migration des products'); await copy('Product');
  console.log('➡️  Migration des product_variants'); await copy('ProductVariant');
  console.log('➡️  Migration des orders'); await copy('Order');
  console.log('➡️  Migration des lives'); await copy('Live');
  console.log('➡️  Migration des live_products'); await copy('LiveProduct');
  console.log('➡️  Migration des credit_transactions'); await copy('CreditTransaction');
  console.log('➡️  Migration des notifications'); await copy('Notification');
  console.log('➡️  Migration des otps'); await copy('OTP');

  console.log('✅ Migration terminée');
  await pg.close();
  await sqlite.close();
}

if (require.main === module) {
  migrate().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = migrate; 