const { createClient } = require('redis');

class RedisManager {
  constructor() {
    this.pubClient = null;
    this.subClient = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      console.log('🔌 Connexion à Redis:', redisUrl.replace(/:[^:]*@/, ':****@'));
      
      // Client pour publication
      this.pubClient = createClient({ 
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ Redis: Nombre maximum de tentatives de reconnexion atteint');
              return new Error('Trop de tentatives de reconnexion');
            }
            const delay = Math.min(retries * 100, 3000);
            console.log(`🔄 Redis: Tentative de reconnexion ${retries} dans ${delay}ms`);
            return delay;
          }
        }
      });

      // Client pour souscription (dupliqué)
      this.subClient = this.pubClient.duplicate();

      // Gestion des erreurs
      this.pubClient.on('error', (err) => {
        console.error('❌ Redis Pub Client Error:', err);
      });

      this.subClient.on('error', (err) => {
        console.error('❌ Redis Sub Client Error:', err);
      });

      // Événements de connexion
      this.pubClient.on('connect', () => {
        console.log('✅ Redis Pub Client connecté');
      });

      this.subClient.on('connect', () => {
        console.log('✅ Redis Sub Client connecté');
      });

      this.pubClient.on('ready', () => {
        console.log('✅ Redis Pub Client prêt');
      });

      this.subClient.on('ready', () => {
        console.log('✅ Redis Sub Client prêt');
      });

      // Connexion
      await Promise.all([
        this.pubClient.connect(),
        this.subClient.connect()
      ]);

      this.isConnected = true;
      console.log('✅ Redis Manager initialisé avec succès');

      return { pubClient: this.pubClient, subClient: this.subClient };
    } catch (error) {
      console.error('❌ Erreur connexion Redis:', error);
      console.warn('⚠️ Mode dégradé: Socket.IO fonctionnera en mode local uniquement');
      this.isConnected = false;
      return null;
    }
  }

  async disconnect() {
    try {
      if (this.pubClient) {
        await this.pubClient.quit();
      }
      if (this.subClient) {
        await this.subClient.quit();
      }
      this.isConnected = false;
      console.log('✅ Redis déconnecté proprement');
    } catch (error) {
      console.error('❌ Erreur déconnexion Redis:', error);
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      pubClientReady: this.pubClient?.isReady || false,
      subClientReady: this.subClient?.isReady || false
    };
  }
}

// Instance singleton
const redisManager = new RedisManager();

module.exports = redisManager;
