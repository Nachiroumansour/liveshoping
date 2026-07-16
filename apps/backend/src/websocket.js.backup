const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map pour stocker les connexions clients
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      console.log('🔌 Nouvelle connexion WebSocket');
      
      // Authentification via token dans l'URL
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('❌ Connexion WebSocket rejetée: pas de token');
        ws.close(1008, 'Token manquant');
        return;
      }

      try {
        // Vérifier le token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const sellerId = decoded.sellerId;
        
        console.log(`✅ WebSocket authentifié pour le vendeur: ${sellerId}`);
        
        // Stocker la connexion
        this.clients.set(sellerId, ws);
        
        // Envoyer confirmation de connexion
        this.sendToClient(ws, 'connection', { status: 'connected' });
        
        // Gérer les messages du client
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            console.log('📨 Message reçu du client:', data);
            this.handleClientMessage(sellerId, data);
          } catch (error) {
            console.error('❌ Erreur parsing message client:', error);
          }
        });
        
        // Gérer la déconnexion
        ws.on('close', () => {
          console.log(`🔌 Déconnexion WebSocket pour le vendeur: ${sellerId}`);
          this.clients.delete(sellerId);
        });
        
        // Gérer les erreurs
        ws.on('error', (error) => {
          console.error(`❌ Erreur WebSocket pour le vendeur ${sellerId}:`, error);
          this.clients.delete(sellerId);
        });
        
      } catch (error) {
        console.log('❌ Connexion WebSocket rejetée: token invalide');
        ws.close(1008, 'Token invalide');
      }
    });
  }

  // Gérer les messages du client
  handleClientMessage(sellerId, data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'ping':
        this.sendToClient(this.clients.get(sellerId), 'pong', { timestamp: Date.now() });
        break;
      default:
        console.log(`📨 Message non géré du vendeur ${sellerId}:`, type);
    }
  }

  // Envoyer un message à un client spécifique
  sendToClient(ws, type, payload = {}) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      ws.send(message);
    }
  }

  // Envoyer un message à tous les clients
  broadcast(type, payload = {}) {
    const message = JSON.stringify({ type, payload });
    
    this.clients.forEach((ws, sellerId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Envoyer un message à un vendeur spécifique
  sendToSeller(sellerId, type, payload = {}) {
    const ws = this.clients.get(sellerId);
    if (ws) {
      this.sendToClient(ws, type, payload);
    }
  }

  // Notifier la création d'un produit
  notifyProductCreated(product) {
    console.log('📢 Notification: produit créé', product.id);
    this.broadcast('product_created', product);
  }

  // Notifier la mise à jour d'un produit
  notifyProductUpdated(product) {
    console.log('📢 Notification: produit mis à jour', product.id);
    this.broadcast('product_updated', product);
  }

  // Notifier la suppression d'un produit
  notifyProductDeleted(productId) {
    console.log('📢 Notification: produit supprimé', productId);
    this.broadcast('product_deleted', { id: productId });
  }

  // Notifier la création d'une commande
  notifyOrderCreated(order) {
    console.log('📢 Notification: commande créée', order.id);
    this.broadcast('order_created', order);
  }

  // Notifier la mise à jour d'une commande
  notifyOrderUpdated(order) {
    console.log('📢 Notification: commande mise à jour', order.id);
    this.broadcast('order_updated', order);
  }

  // Notifier le début d'un live
  notifyLiveStarted(live) {
    console.log('📢 Notification: live démarré', live.id);
    this.broadcast('live_started', live);
  }

  // Notifier la fin d'un live
  notifyLiveEnded(live) {
    console.log('📢 Notification: live terminé', live.id);
    this.broadcast('live_ended', live);
  }

  // Envoyer une notification
  sendNotification(sellerId, notification) {
    console.log('📢 Notification envoyée au vendeur', sellerId);
    this.sendToSeller(sellerId, 'notification', notification);
  }

  // Obtenir le nombre de clients connectés
  getConnectedClientsCount() {
    return this.clients.size;
  }

  // Obtenir la liste des vendeurs connectés
  getConnectedSellers() {
    return Array.from(this.clients.keys());
  }
}

module.exports = WebSocketServer; 