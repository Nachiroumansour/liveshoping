import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // 1 seconde
    this.maxReconnectDelay = 30000; // 30 secondes max
    this.currentToken = null;
    this.isConnecting = false;
    this.reconnectTimer = null;
    this.heartbeatInterval = null;
    this.lastPing = null;
    this.connectionTimeout = 15000;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      console.log('🔗 WebSocket déjà connecté');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.log('🔄 WebSocket en cours de connexion...');
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.currentToken = token;

    return new Promise((resolve, reject) => {
      try {
        console.log('🔗 Tentative de connexion WebSocket...');
        
        // URL WebSocket robuste (support env et IP privées)
        const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) ? import.meta.env.VITE_BACKEND_URL : null;
        const envPort = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_PORT) ? import.meta.env.VITE_BACKEND_PORT : null;
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        
        // 🔍 DEBUG COMPLET
        console.log('🔍 [WS-DEBUG] Variables environnement:');
        console.log('  - envUrl:', envUrl);
        console.log('  - envPort:', envPort);
        console.log('  - hostname:', hostname);
        console.log('  - protocol:', protocol);
        console.log('  - import.meta.env:', import.meta?.env);
        const isPrivateIp = (h) => {
          return (
            h === 'localhost' ||
            h === '127.0.0.1' ||
            /^10\./.test(h) ||
            /^192\.168\./.test(h) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)
          );
        };

        let wsUrl;
        console.log('🔍 [WS-DEBUG] Début logique de décision URL...');
        
        if (envUrl) {
          console.log('🟢 [WS-DEBUG] CAS 1: envUrl détecté →', envUrl);
          wsUrl = envUrl.replace(/\/$/, '').replace(/\/api$/, '');
          console.log('🟢 [WS-DEBUG] URL nettoyée →', wsUrl);
        } else if (hostname.includes('livelink.store')) {
          console.log('🟢 [WS-DEBUG] CAS 2: hostname contient livelink.store');
          wsUrl = 'https://api.livelink.store';
          console.log('🌐 WebSocket - Forçage production livelink.store');
        } else if (isPrivateIp(hostname)) {
          console.log('🟡 [WS-DEBUG] CAS 3: IP privée détectée');
          const port = envPort || '3001';
          wsUrl = `${protocol}//${hostname}:${port}`;
          console.log('🟡 [WS-DEBUG] URL locale →', wsUrl);
        } else {
          console.log('🟠 [WS-DEBUG] CAS 4: Fallback API publique');
          wsUrl = 'https://api.livelink.store';
        }
        
        console.log('✅ [WS-DEBUG] URL FINALE:', wsUrl);
        
        // Connexion au serveur WebSocket avec configuration robuste
        this.socket = io(wsUrl, {
          transports: ['websocket', 'polling'],
          timeout: this.connectionTimeout,
          reconnection: false, // On gère la reconnexion manuellement
          reconnectionAttempts: 0,
          forceNew: true,
          upgrade: true,
          rememberUpgrade: false
        });

        // Timeout de connexion
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error('⏰ Timeout de connexion WebSocket');
            this.isConnecting = false;
          }
        }, this.connectionTimeout);

        // Gestion des événements de connexion
        this.socket.on('connect', () => {
          console.log('✅ WebSocket connecté avec succès');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          
          // Configurer les listeners en attente
          this.setupPendingListeners();
          
          if (this.currentToken) {
            console.log('🔐 Authentification WebSocket...');
            this.socket.emit('authenticate', { token: this.currentToken });
          } else {
            console.log('❌ Pas de token pour l\'authentification WebSocket');
          }

          // Démarrer le heartbeat
          this.startHeartbeat();
        });

        this.socket.on('authenticated', async (data) => {
          console.log('✅ WebSocket authentifié:', data.message);
          
          // Note: Les notifications manquées seront récupérées par AuthContext
          // pour éviter les appels en double
          
          resolve(data);
        });

        this.socket.on('authentication_error', (error) => {
          console.error('❌ Erreur d\'authentification WebSocket:', error);
          this.isConnecting = false;
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('❌ Erreur WebSocket:', error);
          this.isConnecting = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 WebSocket déconnecté:', reason);
          this.isConnected = false;
          this.isConnecting = false;
          this.stopHeartbeat();
          
          // Reconnexion automatique seulement si ce n'est pas une déconnexion volontaire
          if (reason !== 'io client disconnect' && this.currentToken) {
            this.scheduleReconnect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Erreur de connexion WebSocket:', error);
          this.isConnecting = false;
          reject(error);
        });

        // Gestion du ping/pong
        this.socket.on('pong', (latency) => {
          this.lastPing = Date.now();
          console.log(`🏓 Pong reçu, latence: ${latency}ms`);
        });

      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation WebSocket:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Reconnexion automatique avec backoff exponentiel
  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`);
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect(this.currentToken);
        console.log('✅ Reconnexion réussie');
      } catch (error) {
        console.error('❌ Échec de la reconnexion:', error);
        this.scheduleReconnect();
      }
    }, delay);
  }

  // Heartbeat pour détecter les connexions mortes
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.isConnected) {
        this.socket.emit('ping');
        console.log('🏓 Ping envoyé');
      }
    }, 30000); // Ping toutes les 30 secondes
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.socket) {
      console.log('🔌 Déconnexion WebSocket manuelle');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.currentToken = null;
      this.listeners.clear();
      this.reconnectAttempts = 0;
    }
  }

  // Écouter les nouvelles commandes
  onNewOrder(callback) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️  WebSocket non connecté pour onNewOrder - Listener en attente...');
      // Stocker le callback pour l'utiliser quand la connexion sera établie
      this.pendingListeners = this.pendingListeners || {};
      this.pendingListeners.new_order = callback;
      return;
    }

    // Supprimer l'ancien listener s'il existe
    this.socket.off('new_order');

    // Ajouter le listener
    this.socket.on('new_order', (data) => {
      console.log('🛍️ Nouvelle commande reçue:', data);
      try {
        // Envoyer ACK au serveur
        if (data.notification?.id) {
          this.sendNotificationAck(data.notification.id);
        }
        callback(data);
      } catch (error) {
        console.error('❌ Erreur dans callback new_order:', error);
      }
    });

    this.listeners.set('new_order', callback);
  }

  // Écouter les notifications générales
  onNotification(callback) {
    if (!this.socket) {
      console.warn('⚠️  WebSocket non connecté pour onNotification');
      return;
    }

    // Supprimer l'ancien listener s'il existe
    this.socket.off('notification');
    
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification reçue:', data);
      try {
        // Envoyer ACK au serveur
        if (data.notification?.id) {
          this.sendNotificationAck(data.notification.id);
        }
        callback(data);
      } catch (error) {
        console.error('❌ Erreur dans callback notification:', error);
      }
    });

    this.listeners.set('notification', callback);
  }

  // Configurer les listeners en attente
  setupPendingListeners() {
    if (!this.pendingListeners || !this.socket || !this.isConnected) {
      console.log('⚠️ [setupPendingListeners] Impossible de configurer:', {
        hasPending: !!this.pendingListeners,
        hasSocket: !!this.socket,
        isConnected: this.isConnected
      });
      return;
    }
    
    const eventNames = Object.keys(this.pendingListeners);
    if (eventNames.length === 0) {
      console.log('✅ [setupPendingListeners] Aucun listener en attente');
      return;
    }
    
    console.log(`🔧 [setupPendingListeners] Configuration de ${eventNames.length} listener(s) en attente:`, eventNames);
    
    // Configurer TOUS les listeners en attente
    eventNames.forEach(event => {
      const callback = this.pendingListeners[event];
      console.log(`🔧 Configuration listener: ${event}`);
      
      // Supprimer l'ancien listener
      this.socket.off(event);
      
      // Ajouter le nouveau listener avec wrapper pour ACK
      this.socket.on(event, (data) => {
        console.log(`📥 Événement ${event} reçu:`, data);
        try {
          // Envoyer ACK si notification
          if (data.notification?.id) {
            this.sendNotificationAck(data.notification.id);
          }
          callback(data);
        } catch (error) {
          console.error(`❌ Erreur dans callback ${event}:`, error);
        }
      });
      
      this.listeners.set(event, callback);
    });
    
    console.log(`✅ [setupPendingListeners] ${eventNames.length} listener(s) configuré(s)`);
    
    // Nettoyer les listeners en attente
    this.pendingListeners = {};
  }

  // Écouter les mises à jour de statut de commande
  onOrderStatusUpdate(callback) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️  WebSocket non connecté pour onOrderStatusUpdate - Listener en attente...');
      // Stocker le callback pour l'utiliser quand la connexion sera établie
      this.pendingListeners = this.pendingListeners || {};
      this.pendingListeners.order_status_update = callback;
      return;
    }

    // Supprimer l'ancien listener s'il existe
    this.socket.off('order_status_update');
    
    this.socket.on('order_status_update', (data) => {
      console.log('📦 Statut commande mis à jour:', data);
      try {
        // Envoyer ACK au serveur
        if (data.notification?.id) {
          this.sendNotificationAck(data.notification.id);
        }
        callback(data);
      } catch (error) {
        console.error('❌ Erreur dans callback order_status_update:', error);
      }
    });

    this.listeners.set('order_status_update', callback);
  }

  // Ajouter un listener générique
  on(event, callback) {
    // Stocker le callback dans tous les cas
    this.listeners.set(event, callback);
    
    if (!this.socket) {
      console.warn(`⚠️ [on] WebSocket non connecté pour ${event} - Listener stocké en attente`);
      // Stocker dans pendingListeners pour configuration ultérieure
      this.pendingListeners = this.pendingListeners || {};
      this.pendingListeners[event] = callback;
      return;
    }
    
    // Socket existe, configurer le listener immédiatement
    console.log(`✅ [on] Configuration listener: ${event}`);
    
    // Supprimer l'ancien listener s'il existe
    this.socket.off(event);
    
    // Ajouter le nouveau listener
    this.socket.on(event, callback);
  }

  // Supprimer un listener
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event);
      this.listeners.delete(event);
      console.log(`🗑️ Listener supprimé: ${event}`);
    }
  }

  // Supprimer tous les listeners
  offAll() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event);
      });
      this.listeners.clear();
      console.log('🗑️ Tous les listeners supprimés');
    }
  }

  // Vérifier si connecté
  getIsConnected() {
    return this.isConnected;
  }

  // Obtenir l'ID du socket
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }

  // Obtenir les statistiques de connexion
  getConnectionStats() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      lastPing: this.lastPing,
      socketId: this.getSocketId()
    };
  }

  // Forcer une reconnexion
  forceReconnect() {
    console.log('🔄 Reconnexion forcée WebSocket');
    this.disconnect();
    setTimeout(() => {
      if (this.currentToken) {
        this.connect(this.currentToken);
      }
    }, 1000);
  }

  // Envoyer ACK de réception de notification
  sendNotificationAck(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('notification_ack', { notificationId });
      console.log(`✅ ACK envoyé pour notification ${notificationId}`);
    }
  }

  // Demander les notifications manquées
  async requestMissedNotifications(lastNotificationId = 0) {
    return new Promise((resolve, reject) => {
      console.log(`🔄 [DEBUG] requestMissedNotifications appelé avec ID: ${lastNotificationId}`);
      
      if (!this.socket || !this.isConnected) {
        console.warn('⚠️ [DEBUG] WebSocket non connecté, impossible de récupérer les notifications manquées');
        console.log('🔍 [DEBUG] Socket exists:', !!this.socket);
        console.log('🔍 [DEBUG] Is connected:', this.isConnected);
        resolve([]);
        return;
      }

      console.log(`📡 [DEBUG] Émission request_missed_notifications avec ID ${lastNotificationId}`);
      
      // Timeout pour éviter les blocages
      const timeout = setTimeout(() => {
        console.error('⏰ [DEBUG] Timeout récupération notifications manquées');
        resolve([]);
      }, 10000);
      
      this.socket.emit('request_missed_notifications', { lastNotificationId }, (response) => {
        clearTimeout(timeout);
        console.log('📥 [WS-RESPONSE] Réponse reçue:', response);
        
        if (response?.success) {
          console.log(`✅ [WS-SUCCESS] ${response.notifications?.length || 0} notifications manquées récupérées`);
          console.log('📋 [WS-DETAIL] Détail notifications:', response.notifications);
          resolve(response.notifications || []);
        } else {
          console.error('❌ [WS-ERROR] Erreur récupération notifications manquées:', response?.error);
          
          // Gestion spécifique des erreurs
          if (response?.error === 'not_ready') {
            console.warn('⚠️ [WS-NOT-READY] Socket pas encore authentifiée, retry recommandé');
          } else if (response?.error === 'invalid_param') {
            console.error('❌ [WS-INVALID-PARAM] Paramètre invalide:', response?.message);
          }
          
          resolve([]);
        }
      });
    });
  }
}

// Instance singleton
const webSocketService = new WebSocketService();

export default webSocketService; 