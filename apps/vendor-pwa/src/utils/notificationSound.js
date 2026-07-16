// Utilitaire pour générer un son de notification
class NotificationSound {
  constructor() {
    this.audioContext = null;
    this.isSupported = typeof window !== 'undefined' && 'AudioContext' in window;
    this.isInitialized = false;
  }

  // Initialiser l'AudioContext avec gestion des permissions
  async init() {
    if (!this.isSupported) {
      console.warn('AudioContext non supporté');
      return false;
    }
    
    try {
      // Créer l'AudioContext
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Résumer l'AudioContext si il est suspendu (nécessaire pour Chrome)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
      console.log('✅ AudioContext initialisé avec succès');
      return true;
    } catch (error) {
      console.warn('❌ Erreur initialisation AudioContext:', error);
      return false;
    }
  }

  // Générer un son de notification simple
  async playNotificationSound() {
    if (!this.isSupported) {
      console.warn('AudioContext non supporté');
      return;
    }

    try {
      // Initialiser si nécessaire
      if (!this.isInitialized) {
        await this.init();
      }

      // Vérifier l'état de l'AudioContext
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Créer un oscillateur pour générer le son
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connecter les nœuds
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configuration du son (bip court et agréable)
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.2);
      
      // Configuration du volume (plus fort)
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);

      // Type d'onde
      oscillator.type = 'sine';

      // Démarrer et arrêter le son
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);

      console.log('🔊 Son de notification joué');

    } catch (error) {
      console.warn('❌ Erreur lors de la génération du son:', error);
      // Fallback : essayer avec un son HTML5 simple
      this.playFallbackSound();
    }
  }

  // Son de fallback avec HTML5 Audio
  playFallbackSound() {
    try {
      // Créer un élément audio temporaire
      const audio = new Audio();
      
      // Générer un son simple avec Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      oscillator.type = 'sine';
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
      
      console.log('🔊 Son de fallback joué');
    } catch (error) {
      console.warn('❌ Impossible de jouer le son:', error);
    }
  }

  // Jouer un son de notification double (pour les nouvelles commandes)
  async playNewOrderSound() {
    try {
      // Premier bip
      await this.playNotificationSound();
      // Deuxième bip après 200ms
      setTimeout(async () => {
        await this.playNotificationSound();
      }, 200);
    } catch (error) {
      console.warn('❌ Erreur lors de la génération du son double:', error);
    }
  }

  // Tester le son
  async testSound() {
    console.log('🧪 Test du son de notification...');
    await this.playNotificationSound();
  }

  // Nettoyer l'AudioContext
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.isInitialized = false;
    }
  }
}

// Instance singleton
const notificationSound = new NotificationSound();

export default notificationSound; 