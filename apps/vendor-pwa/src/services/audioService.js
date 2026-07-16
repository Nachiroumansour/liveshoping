// Service audio pour les notifications
class AudioService {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.7;
    
    // Initialiser le contexte audio
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      // Créer le contexte audio de manière compatible
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('🔊 AudioService initialisé');
    } catch (error) {
      console.warn('⚠️ AudioContext non supporté:', error);
    }
  }

  // Jouer un son de notification simple (bip)
  async playNotificationSound() {
    if (!this.enabled || !this.audioContext) {
      console.log('🔇 Son désactivé ou AudioContext indisponible');
      return;
    }

    try {
      // Reprendre le contexte si suspendu (requis par les navigateurs)
      if (this.audioContext.state === 'suspended') {
        console.log('🔊 Activation du contexte audio...');
        await this.audioContext.resume();
        console.log('🔊 Contexte audio activé');
      }

      // Créer un oscillateur pour un son de notification
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Configuration du son (deux bips rapides)
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Fréquence agréable pour notification
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);

      // Volume avec fade in/out
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);

      // Jouer le son
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);

      console.log('🔊 Son de notification joué');
    } catch (error) {
      console.error('❌ Erreur lecture son:', error);
    }
  }

  // Jouer un son d'alerte plus fort (commande importante)
  async playAlertSound() {
    if (!this.enabled || !this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Son plus complexe pour alerte
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Deux fréquences pour un son plus riche
      oscillator1.frequency.setValueAtTime(600, this.audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(900, this.audioContext.currentTime);

      // Pattern rythmé
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);

      oscillator1.start(this.audioContext.currentTime);
      oscillator1.stop(this.audioContext.currentTime + 0.3);
      oscillator2.start(this.audioContext.currentTime);
      oscillator2.stop(this.audioContext.currentTime + 0.3);

      console.log('🚨 Son d\'alerte joué');
    } catch (error) {
      console.error('❌ Erreur lecture son d\'alerte:', error);
    }
  }

  // Activer/désactiver les sons
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`🔊 Sons ${enabled ? 'activés' : 'désactivés'}`);
  }

  // Régler le volume (0.0 à 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Volume réglé à ${Math.round(this.volume * 100)}%`);
  }

  // Vérifier si les sons sont supportés
  isSupported() {
    return !!this.audioContext;
  }
}

// Instance singleton
const audioService = new AudioService();

export default audioService;
