console.log('🔍 Test des variables d\'environnement');
console.log('=====================================');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.production' });

console.log('📋 Variables d\'environnement :');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurée' : '❌ Manquante');
console.log('- DB_DIALECT:', process.env.DB_DIALECT);
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- DB_NAME:', process.env.DB_NAME);

// Tester la logique de détection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log('');
console.log('🔍 Détection d\'environnement :');
console.log('- isDevelopment:', isDevelopment);
console.log('- isProduction:', isProduction);

if (isProduction) {
  console.log('✅ Mode production détecté');
} else {
  console.log('❌ Mode développement détecté (devrait être production)');
}

// Tester la configuration de base de données
const { sequelize } = require('./src/config/database');

console.log('');
console.log('📊 Configuration de la base de données :');
console.log('- Dialect:', sequelize.getDialect());
console.log('- Host:', sequelize.config.host);
console.log('- Database:', sequelize.config.database);
console.log('- Username:', sequelize.config.username); 