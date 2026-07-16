import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import audioService from '../services/audioService';

const AudioPermissionButton = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioSupported, setAudioSupported] = useState(false);

  useEffect(() => {
    setAudioSupported(audioService.isSupported());
    setAudioEnabled(audioService.enabled);
  }, []);

  const handleEnableAudio = async () => {
    try {
      console.log('🔊 Demande d\'activation audio...');
      
      // Jouer un son test pour activer le contexte audio
      await audioService.playNotificationSound();
      
      setAudioEnabled(true);
      audioService.setEnabled(true);
      
      console.log('✅ Audio activé avec succès');
      
      // Afficher une notification de confirmation
      window.dispatchEvent(new CustomEvent('newNotifications', {
        detail: {
          notifications: [{
            id: `audio-test-${Date.now()}`,
            type: 'system',
            title: '🔊 Audio activé !',
            message: 'Vous recevrez maintenant des notifications sonores',
            created_at: new Date().toISOString(),
            read: false
          }]
        }
      }));
      
    } catch (error) {
      console.error('❌ Erreur activation audio:', error);
    }
  };

  const handleDisableAudio = () => {
    audioService.setEnabled(false);
    setAudioEnabled(false);
    console.log('🔇 Audio désactivé');
  };

  if (!audioSupported) {
    return null; // Ne pas afficher si l'audio n'est pas supporté
  }

  return (
    <div className="flex items-center gap-2">
      {audioEnabled ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisableAudio}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
          title="Désactiver les notifications sonores"
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEnableAudio}
          className="text-gray-400 hover:text-green-600 hover:bg-green-50 animate-pulse"
          title="Activer les notifications sonores"
        >
          <VolumeX className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default AudioPermissionButton;
