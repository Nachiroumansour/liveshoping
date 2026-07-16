import { getBackendDomain } from '../config/domains';

class NotificationService {
  constructor() {
    this.baseUrl = `${getBackendDomain()}/api`;
    this.token = null;
    this.pollingInterval = null;
    this.listeners = new Map();
    this.isPolling = false;
    console.log('🔔 NotificationService initialisé avec:', this.baseUrl);
  }

  // Initialiser le service
  init(token) {
    this.token = token;
    console.log('🔔 NotificationService initialisé');
  }

  // Démarrer le polling
  startPolling(callback) {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.pollingInterval = setInterval(async () => {
      try {
        const notifications = await this.fetchNotifications();
        if (notifications && notifications.length > 0) {
          callback(notifications);
        }
      } catch (error) {
        console.error('❌ Erreur polling notifications:', error);
      }
    }, 5000); // 5 secondes
    
    console.log('🔄 Polling des notifications démarré');
  }

  // Arrêter le polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;
      console.log('🛑 Polling des notifications arrêté');
    }
  }

  // Récupérer les notifications
  async fetchNotifications() {
    if (!this.token) throw new Error('Token non disponible');

    const response = await fetch(`${this.baseUrl}/notifications`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.notifications || [];
  }

  // Marquer comme lu
  async markAsRead(notificationIds = null) {
    if (!this.token) throw new Error('Token non disponible');

    const response = await fetch(`${this.baseUrl}/notifications/mark-read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notificationIds })
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    return response.json();
  }

  // Jouer le son de notification
  playSound() {
    try {
      const audio = new Audio('/audio/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignorer les erreurs de son
      });
    } catch (error) {
      // Ignorer les erreurs de son
    }
  }

  // Nettoyer
  destroy() {
    this.stopPolling();
    this.token = null;
    this.listeners.clear();
  }
}

// Instance singleton
const notificationService = new NotificationService();
export default notificationService; 