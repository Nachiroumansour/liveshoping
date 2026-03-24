const { Sequelize } = require('sequelize');
const path = require('path');

// Détecter l'environnement
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 DEBUG - Configuration de la base de données :');
  console.log('===============================================');
  console.log('📋 Variables d\'environnement détectées :');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurée' : '❌ Manquante');
  console.log('');
}

// Configuration commune
const commonOptions = {
  logging: isDevelopment ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};

let sequelize;

if (isProduction) {
  // PRODUCTION : PostgreSQL (fitsen-postgresql)
  if (process.env.NODE_ENV !== 'production') console.log('🚀 Configuration Production : PostgreSQL (fitsen-postgresql)');
  
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    throw new Error('❌ DATABASE_URL manquant en production.');
  }

  if (process.env.NODE_ENV !== 'production') console.log('🔗 URL de connexion:', connectionUrl.replace(/\/\/.*@/, '//***:***@'));

  sequelize = new Sequelize(connectionUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: false // ⚠️ mets true si tu es sur Render/Heroku
    },
    ...commonOptions,
    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  });
  
} else {
  // DÉVELOPPEMENT : SQLite avec volume persistant
  console.log('🛠️ Configuration Développement : SQLite avec volume persistant');

  // Utiliser le volume persistant si disponible, sinon fallback local
  const storagePath = process.env.DB_STORAGE || path.join(__dirname, '../../database/database.sqlite');
  if (process.env.NODE_ENV !== 'production') console.log('📁 Fichier SQLite:', storagePath);
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    ...commonOptions
  });
}

// Test de la connexion
const testConnection = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') console.log('🔍 Test de connexion à la base de données...');
    await sequelize.authenticate();

    if (process.env.NODE_ENV !== 'production') {
      // Debug: afficher le dialecte détecté
      console.log('🔧 Dialecte détecté:', sequelize.getDialect());

      // Vérifier le dialecte plutôt que NODE_ENV (plus fiable)
      if (sequelize.getDialect() === 'sqlite') {
        console.log(`✅ Connexion SQLite établie avec succès.`);
        console.log(`📁 Fichier SQLite: ${sequelize.options.storage}`);

        // Test simple pour SQLite
        const [results] = await sequelize.query('SELECT sqlite_version() as version');
        console.log('🔧 Version SQLite:', results[0].version);
      } else {
        // Vérifier les informations de la base PostgreSQL
        const [results] = await sequelize.query(
          'SELECT current_database() as db_name, current_user as user, version() as version'
        );
        console.log('📊 Base de données:', results[0].db_name);
        console.log('👤 Utilisateur:', results[0].user);
        console.log('🔧 Version PostgreSQL:', results[0].version.split(' ')[0]);

        // Compter les produits (si table existe)
        try {
          const [productCount] = await sequelize.query('SELECT COUNT(*) as count FROM products');
          console.log('📦 Nombre de produits:', productCount[0].count);
        } catch (err) {
          console.warn('⚠️ Table "products" introuvable, skip compteur.');
        }
      }
    }
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error.message);
    console.error('🔍 Détails de l\'erreur:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
