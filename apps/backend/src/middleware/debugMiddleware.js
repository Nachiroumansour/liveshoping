const fs = require('fs');
const path = require('path');

class DebugMiddleware {
  constructor() {
    this.isDebugEnabled = process.env.DEBUG === 'true';
    this.startTime = Date.now();
    this.requestCount = 0;
    this.routes = new Set();
  }

  // Logger les variables d'environnement importantes
  logEnvironmentVariables() {
    if (!this.isDebugEnabled) return;

    console.log('\n🔍 DEBUG - Variables d\'environnement importantes :');
    console.log('==================================================');
    
    const importantVars = [
      'NODE_ENV',
      'DB_DIALECT',
      'DB_STORAGE',
      'DATABASE_URL',
      'JWT_SECRET',
      'CORS_ORIGIN',
      'PORT'
    ];

    importantVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        // Masquer les valeurs sensibles
        if (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('PASSWORD')) {
          console.log(`- ${varName}: ✅ Configurée (${value.substring(0, 8)}...)`);
        } else if (varName === 'DATABASE_URL') {
          // Masquer le mot de passe dans l'URL
          const maskedUrl = value.replace(/\/\/.*@/, '//***:***@');
          console.log(`- ${varName}: ✅ Configurée (${maskedUrl})`);
        } else {
          console.log(`- ${varName}: ✅ Configurée (${value})`);
        }
      } else {
        console.log(`- ${varName}: ❌ Manquante`);
      }
    });
    console.log('');
  }

  // Logger la configuration de la base de données
  logDatabaseConfig(sequelize) {
    if (!this.isDebugEnabled) return;

    console.log('🗄️ DEBUG - Configuration de la base de données :');
    console.log('===============================================');
    
    try {
      const dialect = sequelize.getDialect();
      const host = sequelize.config.host;
      const database = sequelize.config.database;
      const username = sequelize.config.username;
      
      console.log(`- Dialect: ${dialect}`);
      console.log(`- Host: ${host}`);
      console.log(`- Database: ${database}`);
      console.log(`- Username: ${username}`);
      
      if (dialect === 'postgres') {
        console.log('✅ PostgreSQL détecté');
      } else if (dialect === 'sqlite') {
        console.log('⚠️ SQLite détecté (vérifiez la configuration de production)');
      } else {
        console.log('🔍 Autre base de données détectée');
      }
      
      console.log('');
    } catch (error) {
      console.log('❌ Impossible de lire la configuration de la base de données');
    }
  }

  // Logger toutes les routes enregistrées
  logRoutes(app) {
    if (!this.isDebugEnabled) return;

    console.log('🛣️ DEBUG - Routes enregistrées :');
    console.log('================================');
    
    const routes = [];
    
    // Fonction récursive pour extraire les routes
    const extractRoutes = (stack, prefix = '') => {
      stack.forEach(layer => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods);
          methods.forEach(method => {
            const route = `${method.toUpperCase()} ${prefix}${layer.route.path}`;
            routes.push(route);
            this.routes.add(route);
          });
        } else if (layer.name === 'router') {
          // Middleware router
          if (layer.regexp) {
            const path = layer.regexp.toString().replace(/^\/\^/, '').replace(/\/\$/, '');
            if (path !== '.*') {
              extractRoutes(layer.handle.stack, prefix + path);
            }
          }
        }
      });
    };

    extractRoutes(app._router.stack);
    
    // Trier et afficher les routes
    routes.sort().forEach(route => {
      console.log(`- ${route}`);
    });
    
    console.log(`📊 Total: ${routes.length} routes enregistrées\n`);
  }

  // Middleware pour logger les requêtes entrantes
  requestLogger() {
    return (req, res, next) => {
      if (!this.isDebugEnabled) {
        next();
        return;
      }

      this.requestCount++;
      const startTime = Date.now();
      
      // Logger la requête entrante
      console.log(`📥 [${this.requestCount}] ${req.method} ${req.path} - ${req.ip}`);
      
      // Logger les headers importants
      if (req.headers.authorization) {
        console.log(`   🔑 Authorization: ${req.headers.authorization.substring(0, 20)}...`);
      }
      if (req.headers.origin) {
        console.log(`   🌐 Origin: ${req.headers.origin}`);
      }
      
      // Logger le body pour les requêtes POST/PUT
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const bodyKeys = Object.keys(req.body);
        if (bodyKeys.length > 0) {
          console.log(`   📦 Body keys: ${bodyKeys.join(', ')}`);
        }
      }
      
      // Intercepter la fin de la réponse
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const status = res.statusCode;
        const statusIcon = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
        
        console.log(`📤 [${this.requestCount}] ${statusIcon} ${req.method} ${req.path} - ${status} (${duration}ms)`);
      });
      
      next();
    };
  }

  // Logger les statistiques de démarrage
  logStartupStats() {
    if (!this.isDebugEnabled) return;

    const uptime = Date.now() - this.startTime;
    console.log('🚀 DEBUG - Statistiques de démarrage :');
    console.log('=====================================');
    console.log(`- Temps de démarrage: ${uptime}ms`);
    console.log(`- Routes enregistrées: ${this.routes.size}`);
    console.log(`- Requêtes traitées: ${this.requestCount}`);
    console.log(`- Uptime: ${Math.floor(uptime / 1000)}s`);
    console.log('');
  }

  // Logger les erreurs
  errorLogger() {
    return (err, req, res, next) => {
      if (this.isDebugEnabled) {
        console.error('❌ DEBUG - Erreur détectée :');
        console.error('============================');
        console.error(`- Route: ${req.method} ${req.path}`);
        console.error(`- Erreur: ${err.message}`);
        console.error(`- Stack: ${err.stack}`);
        console.error('');
      }
      next(err);
    };
  }

  // Initialiser le middleware
  init(app, sequelize) {
    if (!this.isDebugEnabled) {
      console.log('🔇 Debug désactivé (DEBUG=false)');
      return;
    }

    console.log('🔍 Debug activé (DEBUG=true)');
    console.log('================================');
    
    // Logger les informations de démarrage
    this.logEnvironmentVariables();
    this.logDatabaseConfig(sequelize);
    this.logRoutes(app);
    
    // Logger les statistiques toutes les 5 minutes
    setInterval(() => {
      this.logStartupStats();
    }, 5 * 60 * 1000);
    
    console.log('✅ Middleware de debug initialisé\n');
  }
}

module.exports = new DebugMiddleware(); 