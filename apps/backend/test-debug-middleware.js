require('dotenv').config({ path: '.env' });

console.log('🧪 Test du middleware de debug');
console.log('==============================');

// Importer le middleware
const debugMiddleware = require('./src/middleware/debugMiddleware');

// Simuler une app Express
const mockApp = {
  _router: {
    stack: [
      {
        route: {
          path: '/api/health',
          methods: { get: true }
        }
      },
      {
        route: {
          path: '/api/products',
          methods: { get: true, post: true }
        }
      },
      {
        name: 'router',
        regexp: /^\/api\/public/,
        handle: {
          stack: [
            {
              route: {
                path: '/seller/:id/products',
                methods: { get: true }
              }
            }
          ]
        }
      }
    ]
  }
};

// Simuler Sequelize
const mockSequelize = {
  getDialect: () => 'postgres',
  config: {
    host: 'db.yxdapixcnkytpspbqiga.supabase.co',
    database: 'postgres',
    username: 'postgres'
  }
};

// Tester le middleware
console.log('🔍 Test des variables d\'environnement...');
debugMiddleware.logEnvironmentVariables();

console.log('🗄️ Test de la configuration de la base de données...');
debugMiddleware.logDatabaseConfig(mockSequelize);

console.log('🛣️ Test des routes...');
debugMiddleware.logRoutes(mockApp);

console.log('✅ Tests terminés !');
console.log('');
console.log('💡 Pour activer le debug en production, ajoutez :');
console.log('   DEBUG=true dans votre fichier .env');
console.log('');
console.log('💡 Pour désactiver le debug :');
console.log('   DEBUG=false ou supprimez la variable'); 