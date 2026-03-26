// Charger les variables d'environnement EN PREMIER
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redisManager = require('./config/redis');
const { Notification } = require('./models');

// Configuration par défaut pour le déploiement #8
const defaultConfig = {
  NODE_ENV: 'development', // Par défaut en développement
  PORT: 3001,
  DATABASE_URL: 'postgresql://liveshop_user:motdepassefort@fitsen-postgresql:5432/liveshop', // Pour production
  JWT_SECRET: 'production_secret_key_very_secure',
  CORS_ORIGIN: 'https://livelink.store,https://space.livelink.store',
  CLOUDINARY_CLOUD_NAME: 'dp2838ewe',
  CLOUDINARY_API_KEY: '837659378846734',
  CLOUDINARY_API_SECRET: 'udbbN6TXXOkdwXJ271cSRPVIaq8'
};

// Appliquer les valeurs par défaut si pas définies
Object.keys(defaultConfig).forEach(key => {
  if (!process.env[key]) {
    process.env[key] = defaultConfig[key];
  }
});

// Diagnostic des fichiers .env présents et des variables OTP
if (process.env.NODE_ENV !== 'production') {
  try {
    const fs = require('fs');
    const envCandidates = [
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), '.env.local'),
      path.join(process.cwd(), '.env.development'),
      path.join(process.cwd(), '.env.production'),
      path.join(process.cwd(), '.env.sqlite.dev'),
    ];
    const existingEnvFiles = envCandidates.filter(p => {
      try { return fs.existsSync(p); } catch { return false; }
    });
    console.log('🗃️  Fichiers .env détectés dans le répertoire courant:', existingEnvFiles.map(f => path.basename(f)));
    console.log('🔐 OTP_PROVIDER:', process.env.OTP_PROVIDER || '(non défini)');
    console.log('🔐 NEXTERANGA_API_URL:', process.env.NEXTERANGA_API_URL ? '✅ Défini' : '❌ Manquant');
    console.log('🔐 NEXTERANGA_BUSINESS_NAME:', process.env.NEXTERANGA_BUSINESS_NAME ? '✅ Défini' : '❌ Manquant');
    console.log('🔐 NEXTERANGA_SECRET:', process.env.NEXTERANGA_SECRET ? '✅ Présent' : '❌ Manquant');
  } catch (e) {
    console.log('⚠️  Impossible de lister les fichiers .env:', e.message);
  }

  console.log('🔧 Configuration appliquée:');
  console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurée' : '❌ Manquante');
  console.log('🔧 FRONTEND_URL:', process.env.FRONTEND_URL ? '✅ Configurée' : '❌ Manquante');
  console.log('🔧 VENDOR_URL:', process.env.VENDOR_URL ? '✅ Configurée' : '❌ Manquante');
}

const { sequelize, testConnection } = require('./config/database');
const { Seller, Product, Order } = require('./models');

// Import du middleware de debug
const debugMiddleware = require('./middleware/debugMiddleware');

// Import des routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const publicRoutes = require('./routes/public');
const liveRoutes = require('./routes/lives');
const notificationRoutes = require('./routes/notifications');
const creditRoutes = require('./routes/credits');
// const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const adminSettingsRoutes = require('./routes/admin-settings');
const sellerRoutes = require('./routes/sellers');
const uploadRoutes = require('./routes/upload');
const pushRoutes = require('./routes/push');

const notificationService = require('./services/notificationService');

if (process.env.NODE_ENV !== 'production') {
  console.log('🚀 Démarrage de LiveShop Link API...');
  console.log('=====================================');
  console.log('📋 Informations système :');
  console.log('- Node.js version:', process.version);
  console.log('- Plateforme:', process.platform);
  console.log('- Architecture:', process.arch);
  console.log('- Répertoire de travail:', process.cwd());
  console.log('- Variables d\'environnement chargées:', Object.keys(process.env).filter(key => key.includes('DB') || key.includes('NODE_ENV')).length);
  console.log('');
}

const app = express();

// Security headers (helmet)
app.use(helmet());

const server = http.createServer(app);

// Configuration Socket.IO avec origines sécurisées
const allowedOrigins = [
  'https://livelink.store',
  'https://space.livelink.store',
  'https://api.livelink.store'
];

if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000');
}

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const PORT = process.env.PORT || 3001;

// Middleware CORS unifié
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (Postman, curl, apps mobiles)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Vérifier si l'origine est dans la liste ou est un sous-domaine livelink.store
    if (allowedOrigins.includes(origin) || origin.endsWith('.livelink.store') || origin === 'https://livelink.store') {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV !== 'production') console.log('🚫 CORS - Origine refusée:', origin);
      callback(new Error('CORS non autorisé'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
};

// Pre-flight requests AVANT tout autre middleware
app.options('*', cors(corsOptions));

// Appliquer CORS middleware
app.use(cors(corsOptions));

// Middleware de debug pour logger les requêtes
app.use(debugMiddleware.requestLogger());

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('🚨 ERREUR GLOBALE:', err);
  console.error('🚨 URL:', req.url);
  console.error('🚨 Méthode:', req.method);
  console.error('🚨 Headers:', req.headers);
  
  if (err.message === 'CORS non autorisé') {
    return res.status(403).json({ 
      error: 'CORS Error', 
      message: 'Origine non autorisée',
      origin: req.headers.origin 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (uploads) avec CORS
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Health check (seul endpoint public sans info sensible)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route de test (dev uniquement)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test', (req, res) => {
    res.json({
      message: 'API fonctionne !',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    });
  });
}

// Stockage des connexions WebSocket par vendeur (Set de socket IDs)
// Permet de gérer plusieurs connexions simultanées par vendeur (plusieurs onglets)
const sellerConnections = new Map();

// Gestion des connexions WebSocket
io.on('connection', (socket) => {
  if (process.env.NODE_ENV !== 'production') console.log('Nouvelle connexion WebSocket:', socket.id);

  // Authentification du vendeur
  socket.on('authenticate', async (data) => {
    try {
      if (process.env.NODE_ENV !== 'production') console.log('🔐 Tentative d\'authentification WebSocket...');
      const { token } = data;
      if (!token) {
        if (process.env.NODE_ENV !== 'production') console.log('❌ Token manquant');
        socket.emit('error', { message: 'Token requis' });
        return;
      }

      if (process.env.NODE_ENV !== 'production') console.log('🔑 Token reçu, vérification...');
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'liveshop_secret_key');
      if (process.env.NODE_ENV !== 'production') console.log('✅ Token décodé:', decoded);

      // Le token contient 'id', pas 'sellerId'
      const sellerId = decoded.id || decoded.sellerId;
      if (process.env.NODE_ENV !== 'production') console.log('🔍 SellerId extrait:', sellerId);

      const seller = await Seller.findByPk(sellerId);
      if (process.env.NODE_ENV !== 'production') console.log('🔍 Recherche vendeur:', seller ? 'Trouvé' : 'Non trouvé');

      if (!seller) {
        if (process.env.NODE_ENV !== 'production') console.log('❌ Vendeur non trouvé pour ID:', decoded.sellerId);
        socket.emit('error', { message: 'Vendeur non trouvé' });
        return;
      }

      // Associer le socket au vendeur
      socket.sellerId = seller.id;
      socket.join(`seller_${seller.id}`);

      if (!sellerConnections.has(seller.id)) {
        sellerConnections.set(seller.id, new Set());
      }
      sellerConnections.get(seller.id).add(socket.id);

      if (process.env.NODE_ENV !== 'production') console.log(`✅ Vendeur ${seller.name} (ID: ${seller.id}) connecté via WebSocket (Total connexions: ${sellerConnections.get(seller.id).size})`);
      socket.emit('authenticated', { 
        message: 'Authentification réussie',
        seller: {
          id: seller.id,
          name: seller.name,
          public_link_id: seller.public_link_id
        }
      });



    } catch (error) {
      console.error('❌ Erreur d\'authentification WebSocket:', error);
      socket.emit('error', { message: 'Erreur d\'authentification' });
    }
  });

  // Gestion du ping/pong
  socket.on('ping', () => {
    const startTime = Date.now();
    socket.emit('pong', Date.now() - startTime);
  });

  // ACK de réception de notification
  socket.on('notification_ack', async (data) => {
    try {
      const { notificationId } = data;
      if (!notificationId) return;

      if (process.env.NODE_ENV !== 'production') console.log(`✅ ACK reçu pour notification ${notificationId} du vendeur ${socket.sellerId}`);

      // Pour l'instant, on log juste l'ACK (à implémenter plus tard avec colonnes DB)
      if (process.env.NODE_ENV !== 'production') console.log(`📝 ACK traité pour notification ${notificationId} du vendeur ${socket.sellerId}`);
    } catch (error) {
      console.error('❌ Erreur traitement ACK notification:', error);
    }
  });

  // Récupération delta au reconnect
  socket.on('request_missed_notifications', async (data, callback) => {
    try {
      const { lastNotificationId } = data;
      if (process.env.NODE_ENV !== 'production') console.log(`🔄 [MISSED-REQ] Demande notifications manquées depuis ID ${lastNotificationId} pour vendeur ${socket.sellerId}`);
      
      if (!socket.sellerId) {
        console.error('❌ [MISSED-AUTH] Pas de sellerId sur la socket');
        callback({ success: false, error: 'not_ready', message: 'Socket non authentifiée' });
        return;
      }
      
      // Vérifier que lastNotificationId est un nombre valide
      const lastId = parseInt(lastNotificationId) || 0;
      if (isNaN(lastId) || lastId < 0) {
        console.error('❌ [MISSED-PARAM] lastNotificationId invalide:', lastNotificationId);
        callback({ success: false, error: 'invalid_param', message: 'lastNotificationId invalide' });
        return;
      }
      
      const { Op } = require('sequelize');
      if (process.env.NODE_ENV !== 'production') console.log(`🔍 [MISSED-QUERY] Recherche notifications pour vendeur ${socket.sellerId} avec ID > ${lastId}`);
      
      const missedNotifications = await Notification.findAll({
        where: {
          seller_id: socket.sellerId,
          id: { [Op.gt]: lastId }
        },
        order: [['id', 'ASC']],
        limit: 50
      });

      if (process.env.NODE_ENV !== 'production') console.log(`📤 [MISSED-FOUND] ${missedNotifications.length} notifications trouvées:`,
        missedNotifications.map(n => ({ id: n.id, type: n.type, title: n.title, sent: n.sent })));
      
      callback({ 
        success: true, 
        notifications: missedNotifications,
        lastId: lastId,
        count: missedNotifications.length
      });
    } catch (error) {
      console.error('❌ Erreur récupération notifications manquées:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Déconnexion
  socket.on('disconnect', (reason) => {
    if (socket.sellerId) {
      const connections = sellerConnections.get(socket.sellerId);
      if (connections) {
        connections.delete(socket.id);
        const remainingConnections = connections.size;
        if (remainingConnections === 0) {
          sellerConnections.delete(socket.sellerId);
          if (process.env.NODE_ENV !== 'production') console.log(`🔌 Vendeur ${socket.sellerId} complètement déconnecté (${reason})`);
        } else {
          if (process.env.NODE_ENV !== 'production') console.log(`🔌 Socket déconnectée pour vendeur ${socket.sellerId} (${reason}) - ${remainingConnections} connexion(s) restante(s)`);
        }
      }
    }
  });
});

// Nettoyage périodique des connexions mortes
setInterval(() => {
  const now = Date.now();
  let totalConnections = 0;
  let activeSellers = 0;

  sellerConnections.forEach((connections, sellerId) => {
    totalConnections += connections.size;
    if (connections.size > 0) {
      activeSellers++;
    }
  });

  if (process.env.NODE_ENV !== 'production') console.log(`📊 WebSocket Stats: ${activeSellers} vendeurs actifs, ${totalConnections} connexions totales`);
}, 60000); // Toutes les minutes

    // Fonction pour notifier un vendeur spécifique avec ACK
    global.notifySeller = (sellerId, type, data) => {
      return new Promise((resolve) => {
        const connections = sellerConnections.get(sellerId);
        
        if (!connections || connections.size === 0) {
          if (process.env.NODE_ENV !== 'production') console.log(`❌ [NOTIF-EMIT] Vendeur ${sellerId} non connecté (aucune socket active)`);
          resolve(false);
          return;
        }
        
        const notificationId = data.notification?.id;
        if (process.env.NODE_ENV !== 'production') console.log(`📤 [NOTIF-EMIT] Envoi notification ${type} (ID: ${notificationId}) au vendeur ${sellerId} (${connections.size} connexion(s))`);
        
        // Envoyer à TOUTES les sockets du vendeur via Room
        // Cela garantit que tous les onglets/connexions reçoivent la notification
        io.to(`seller_${sellerId}`).emit(type, data);
        
        // Attendre l'ACK d'AU MOINS UNE socket avec timeout court
        // Pour ne pas bloquer le système, on résout à true après 1 seconde (fallback)
        let ackReceived = false;
        
        const timeout = setTimeout(() => {
          if (!ackReceived) {
            // Considérer comme succès car envoyé via Room (fiable)
            if (process.env.NODE_ENV !== 'production') console.log(`✅ [NOTIF-FALLBACK] Notification ${type} (ID: ${notificationId}) envoyée au vendeur ${sellerId} via Room`);
            resolve(true);
          }
        }, 1000);
        
        // Écouter l'ACK de la première socket qui répond
        if (notificationId) {
          connections.forEach(socketId => {
            const socket = io.sockets.sockets.get(socketId);
            if (socket && !ackReceived) {
              // Listener temporaire pour ACK
              const ackHandler = (ackData) => {
                if (ackData.notificationId === notificationId && !ackReceived) {
                  ackReceived = true;
                  clearTimeout(timeout);
                  if (process.env.NODE_ENV !== 'production') console.log(`✅ [NOTIF-ACK] ACK reçu pour notification ${notificationId} de vendeur ${sellerId}`);
                  resolve(true);
                  // Nettoyer les listeners
                  connections.forEach(sid => {
                    const s = io.sockets.sockets.get(sid);
                    if (s) s.off('notification_ack', ackHandler);
                  });
                }
              };
              
              socket.once('notification_ack', ackHandler);
            }
          });
        } else {
          // Pas d'ID de notification, résoudre immédiatement
          clearTimeout(timeout);
          resolve(true);
        }
      });
    };

    // Fonction pour envoyer des notifications à tous les vendeurs connectés
    global.notifyAllSellers = (event, data) => {
      io.emit(event, data);
      if (process.env.NODE_ENV !== 'production') console.log('Notification envoyée à tous les vendeurs:', event);
    };

// Middleware pour détecter les scrapers (WhatsApp, Facebook, Twitter, etc.)
// et servir du HTML avec meta tags au lieu de la SPA
const isScraperBot = (userAgent) => {
  if (!userAgent) return false;
  const scrapers = [
    'facebookexternalhit',
    'whatsapp',
    'twitterbot',
    'linkedinbot',
    'slurp',
    'bingbot',
    'googlebot',
    'yandexbot',
    'baiduspider',
    'pinterestbot',
    'discordbot',
    'telegrambot',
    'slackbot',
    'vimeobot'
  ];
  return scrapers.some(bot => userAgent.toLowerCase().includes(bot));
};

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/lives', liveRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/credits', creditRoutes);
// app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/push', pushRoutes);

// Initialiser le middleware de debug après l'enregistrement des routes
if (debugMiddleware.init) {
  debugMiddleware.init(app, sequelize);
}

// Servir le frontend (pour la production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée'
  });
});

// Gestion globale des erreurs
app.use(debugMiddleware.errorLogger());
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur'
  });
});

// Initialisation de la base de données et démarrage du serveur
const startServer = async () => {
  try {
    // Test de la connexion à la base de données
    await testConnection();
    
    // Synchronisation des modèles avec la base de données
    await sequelize.sync({ force: false });
    console.log('✅ Base de données synchronisée');
    
    // Initialiser Redis adapter pour Socket.IO (mode scalable)
    try {
      const redisClients = await redisManager.connect();
      if (redisClients) {
        io.adapter(createAdapter(redisClients.pubClient, redisClients.subClient));
        console.log('✅ Socket.IO Redis Adapter configuré - Mode multi-instances activé');
      } else {
        console.warn('⚠️  Socket.IO en mode local - Pas de Redis disponible');
      }
    } catch (error) {
      console.warn('⚠️  Impossible de configurer Redis adapter:', error.message);
      console.warn('⚠️  Socket.IO fonctionnera en mode local uniquement');
    }
    
    // Initialiser le service de notifications avec BullMQ
    if (process.env.NODE_ENV !== 'production') console.log('🔔 Initialisation du service de notifications...');
    await notificationService.initializeQueue();
    
    // Démarrer le processeur de retry
    notificationService.startRetryProcessor();
    console.log('🔄 Processeur de retry démarré');
    
    // Initialiser la configuration des crédits
    const { initializeCreditsConfig } = require('./services/initializationService');
    try {
      await initializeCreditsConfig();
    } catch (error) {
      console.error('❌ Erreur initialisation crédits:', error);
    }
    
    // Initialiser le compte superadmin au démarrage
    const { initSuperAdmin } = require('./scripts/initSuperAdmin');
    try {
      await initSuperAdmin();
    } catch (error) {
      console.error('❌ Erreur initialisation superadmin:', error);
    }
    
    // Nettoyer les anciennes notifications (une fois par jour)
    setInterval(async () => {
      try {
        await notificationService.cleanupOldNotifications(30);
      } catch (error) {
        console.error('❌ Erreur nettoyage notifications:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 heures
    
    // Endpoint de test pour notifications (dev uniquement)
    if (process.env.NODE_ENV !== 'production') {
      app.post('/api/test/create-notification', async (req, res) => {
        try {
          const notification = await Notification.create(req.body);
          res.json({ success: true, notification });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });
    }
    
    // Démarrer le serveur
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📱 URL locale: http://localhost:${PORT}`);
        console.log(`🌐 CORS autorisé pour: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
        console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
  }
};

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  try {
    // Arrêter le processeur de retry
    notificationService.stopRetryProcessor();
    
    // Déconnecter Redis
    await redisManager.disconnect();
    
    // Fermer Socket.IO
    io.close();
    
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
    process.exit(1);
  }
});

// Démarrer le serveur
startServer();

module.exports = app;

