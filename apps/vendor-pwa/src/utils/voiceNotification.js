// Utilitaire pour les notifications vocales
class VoiceNotification {
  constructor() {
    this.audioContext = null;
    this.speechSynthesis = window.speechSynthesis;
    this.isInitialized = false;
    this.audioElements = new Map();
    this.isEnabled = false; // Désactiver par défaut
    this.volume = 0.8;
    this.voice = null;
    this.wolofAudioAvailable = false; // Désactiver l'audio Wolof par défaut
    
    // Messages audio pré-enregistrés en Wolof
    this.audioMessages = {
      // Messages de base
      'new-order-intro': '/audio/wolof/new-order-intro.mp3', // "Amna kou commander" (Vous avez une commande)
      'customer-name-prefix': '/audio/wolof/customer-name-prefix.mp3', // "Jëkkë bi" (Le client)
      'product-prefix': '/audio/wolof/product-prefix.mp3', // "Dëkk bi" (Le produit)
      'address-prefix': '/audio/wolof/address-prefix.mp3', // "Adres bi" (L'adresse)
      'total-price-prefix': '/audio/wolof/total-price-prefix.mp3', // "Xaalis bi" (Le montant)
      'fcfa-suffix': '/audio/wolof/fcfa-suffix.mp3', // "FCFA"
      
      // Messages de statut
      'order-paid': '/audio/wolof/order-paid.mp3', // "Commande payée"
      'order-delivered': '/audio/wolof/order-delivered.mp3', // "Commande livrée"
      'order-cancelled': '/audio/wolof/order-cancelled.mp3', // "Commande annulée"
    };
  }

  async init() {
    try {
      console.log('🔊 Initialisation des notifications vocales hybrides...');
      
      // Initialiser la synthèse vocale
      await this.initSpeechSynthesis();
      
      // Essayer de précharger les audios Wolof
      await this.preloadWolofAudio();
      
      this.isInitialized = true;
      console.log('✅ Notifications vocales hybrides initialisées');
      
    } catch (error) {
      console.error('❌ Erreur initialisation notifications vocales:', error);
      this.isEnabled = false;
      console.log('🔇 Notifications vocales: désactivées');
    }
  }

  async initSpeechSynthesis() {
    console.log('🎤 Initialisation de la synthèse vocale...');
    
    if (!this.speechSynthesis) {
      console.warn('⚠️ SpeechSynthesis non disponible');
      return;
    }

    // Attendre que les voix soient chargées
    await new Promise((resolve) => {
      if (this.speechSynthesis.getVoices().length > 0) {
        resolve();
      } else {
        this.speechSynthesis.addEventListener('voiceschanged', resolve, { once: true });
      }
    });

    const voices = this.speechSynthesis.getVoices();
    console.log(`📋 ${voices.length} voix disponibles`);

    // Priorité 1: Voix française native
    let selectedVoice = voices.find(voice => 
      voice.lang.startsWith('fr') && voice.localService === true
    );

    // Priorité 2: Voix française (pas forcément native)
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('fr')
      );
    }

    // Priorité 3: Voix anglaise avec bon accent
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && (voice.name.includes('Samantha') || voice.name.includes('Alex'))
      );
    }

    // Priorité 4: Première voix disponible
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      this.voice = selectedVoice;
      console.log(`✅ Voix sélectionnée: ${selectedVoice.name} (${selectedVoice.lang})`);
    } else {
      console.warn('⚠️ Aucune voix disponible');
    }
  }

  async preloadWolofAudio() {
    console.log('🔇 Audio Wolof désactivé - Mode synthèse vocale uniquement');
    this.wolofAudioAvailable = false;
    return false;
  }

  async playWolofAudio(audioKey) {
    if (!this.wolofAudioAvailable) {
      console.log(`🔇 Audio Wolof non disponible: ${audioKey}`);
      return;
    }

    const audio = this.audioElements.get(audioKey);
    if (!audio) {
      console.warn(`⚠️ Audio Wolof non trouvé: ${audioKey}`);
      return;
    }

    try {
      audio.currentTime = 0;
      audio.volume = this.volume;
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('ended', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.play().catch(reject);
      });
      
    } catch (error) {
      console.error(`❌ Erreur lecture audio Wolof ${audioKey}:`, error);
    }
  }

  async speakText(text, lang = 'fr-FR') {
    console.log('🔊 Tentative de synthèse vocale:', text);

    if (!this.speechSynthesis) {
      console.warn('⚠️ SpeechSynthesis non disponible');
      return;
    }

    if (!this.voice) {
      console.warn('⚠️ Aucune voix sélectionnée');
      return;
    }

    try {
      console.log('🗣️ Voix utilisée:', this.voice.name, '(', this.voice.lang, ')');
      console.log('🔊 Volume:', this.volume);

      // Annuler toute synthèse en cours
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.voice;
      utterance.lang = lang;
      utterance.volume = this.volume;
      
      // Paramètres optimisés pour la clarté
      utterance.rate = 0.85;    // Plus lent pour plus de clarté
      utterance.pitch = 1.1;    // Légèrement plus aigu pour plus de clarté
      
      // Pauses pour une meilleure compréhension
      const textWithPauses = text
        .replace(/\./g, '... ')  // Pause après chaque point
        .replace(/:/g, '... ')   // Pause après les deux-points
        .replace(/,/g, '... ');  // Pause après chaque virgule
      
      utterance.text = textWithPauses;

      console.log('🎤 Début de la synthèse vocale...');

      await new Promise((resolve, reject) => {
        utterance.addEventListener('end', () => {
          console.log('✅ Synthèse vocale terminée');
          resolve();
        }, { once: true });

        utterance.addEventListener('error', (error) => {
          console.error('❌ Erreur synthèse vocale:', error);
          reject(error);
        }, { once: true });

        utterance.addEventListener('start', () => {
          console.log('🎤 Synthèse vocale démarrée');
        }, { once: true });

        this.speechSynthesis.speak(utterance);
      });

    } catch (error) {
      console.error('❌ Erreur synthèse vocale:', error);
    }
  }

  async announceNewOrder(orderData) {
    console.log('🔊 Début announceNewOrder...');
    console.log('🔊 isEnabled:', this.isEnabled);

    if (!this.isEnabled) {
      console.log('🔇 Notifications vocales désactivées');
      return;
    }

    try {
      console.log('🔊 Annonce nouvelle commande - Mode synthèse vocale uniquement');

      const order = orderData.order || orderData;
      console.log('📦 Données commande:', order);

      // Mode synthèse vocale uniquement (sans audio Wolof)
      const productName = order.product?.name || 'Produit';
      const message = `Attention... Nouvelle commande reçue... Client: ${order.customer_name || 'Client'}... Produit: ${productName}... Adresse: ${order.customer_address || 'Adresse'}... Montant total: ${order.total_price?.toLocaleString() || 0} FCFA... Merci.`;
      console.log('🗣️ Message complet à synthétiser:', message);
      await this.speakText(message);

      console.log('✅ Annonce nouvelle commande terminée');

    } catch (error) {
      console.error('❌ Erreur annonce nouvelle commande:', error);
    }
  }

  async announceStatusUpdate(orderData) {
    if (!this.isEnabled) return;
    
    try {
      console.log('🔊 Annonce mise à jour de statut hybride...');
      
      const order = orderData.order || orderData;
      const status = order.status;
      
      let statusAudioKey = null;
      let statusText = '';
      
      switch (status) {
        case 'paid':
          statusAudioKey = 'order_paid';
          statusText = 'Commande payée';
          break;
        case 'delivered':
          statusAudioKey = 'order_delivered';
          statusText = 'Commande livrée';
          break;
        case 'cancelled':
          statusAudioKey = 'order_cancelled';
          statusText = 'Commande annulée';
          break;
        default:
          return; // Pas d'annonce pour les autres statuts
      }
      
      if (this.wolofAudioAvailable && statusAudioKey) {
        // Mode hybride
        await this.playWolofAudio(statusAudioKey);
        await this.delay(300);
        
        const detailsText = `Commande numéro ${order.id}`;
        await this.speakText(detailsText);
      } else {
        // Mode synthèse vocale uniquement
        const message = `${statusText}. Commande numéro ${order.id}`;
        await this.speakText(message);
      }
      
      console.log('✅ Annonce mise à jour de statut hybride terminée');
      
    } catch (error) {
      console.error('❌ Erreur annonce mise à jour de statut hybride:', error);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Mettre à jour le volume des audios Wolof
    this.audioElements.forEach(audio => {
      audio.volume = this.volume;
    });
    
    console.log(`🔊 Volume des notifications vocales: ${Math.round(this.volume * 100)}%`);
  }

  enable() {
    this.isEnabled = true;
    console.log('🔊 Notifications vocales hybrides activées');
  }

  disable() {
    this.isEnabled = false;
    console.log('🔇 Notifications vocales hybrides désactivées');
  }

  isEnabled() {
    return this.isEnabled && this.isInitialized;
  }

  // Méthode pour tester les notifications vocales hybrides
  async testVoiceNotification() {
    console.log('🧪 Test des notifications vocales hybrides...');
    
    try {
      if (this.wolofAudioAvailable) {
        // Test audio Wolof
        await this.playWolofAudio('new-order-intro');
        await this.delay(500);
        
        // Test synthèse vocale
        await this.speakText('Test de synthèse vocale');
      } else {
        // Test synthèse vocale uniquement
        await this.speakText('Test des notifications vocales. Mode synthèse vocale uniquement.');
      }
      
      console.log('✅ Test notification vocale hybride réussi');
    } catch (error) {
      console.error('❌ Test notification vocale hybride échoué:', error);
    }
  }
}

// Instance singleton
const voiceNotification = new VoiceNotification();

export default voiceNotification; 