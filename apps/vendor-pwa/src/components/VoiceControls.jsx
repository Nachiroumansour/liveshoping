import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import voiceNotification from '../utils/voiceNotification';

const VoiceControls = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wolofAudioAvailable, setWolofAudioAvailable] = useState(false);

  useEffect(() => {
    // Initialiser le système vocal
    const initVoice = async () => {
      try {
        await voiceNotification.init();
        setIsInitialized(true);
        
        // Rendre voiceNotification disponible globalement
        window.voiceNotification = voiceNotification;
        
        // Vérifier que voiceNotification est bien initialisé avant d'appeler isEnabled
        if (voiceNotification && typeof voiceNotification.isEnabled === 'function') {
          setIsEnabled(voiceNotification.isEnabled());
        } else {
          setIsEnabled(false); // Désactiver par défaut
        }
        
        setVolume(0.8);
        
        // Vérifier si les audios Wolof sont disponibles
        setWolofAudioAvailable(false); // Forcer à false pour désactiver Wolof
      } catch (error) {
        console.error('❌ Erreur initialisation contrôles vocaux:', error);
        // En cas d'erreur, désactiver par défaut
        setIsEnabled(false);
        setIsInitialized(true);
      }
    };

    initVoice();
  }, []);

  const handleToggleVoice = (enabled) => {
    setIsEnabled(enabled);
    if (enabled) {
      voiceNotification.enable();
    } else {
      voiceNotification.disable();
    }
    
    // Émettre un événement pour informer le NotificationStore
    window.dispatchEvent(new CustomEvent('voiceNotificationToggle', {
      detail: { enabled }
    }));
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    voiceNotification.setVolume(newVolume);
  };

  const handleTestVoice = async () => {
    try {
      await voiceNotification.testVoiceNotification();
    } catch (error) {
      console.error('❌ Erreur test vocal:', error);
    }
  };

  const handleStopVoice = () => {
    // Arrêter la synthèse vocale en cours
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  if (!isInitialized) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg ">
        <div className="flex items-center gap-2 text-blue-800 ">
          <Settings className="w-4 h-4 animate-spin " />
          <span className="text-sm ">Initialisation des notifications vocales...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <Mic className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <MicOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
          <span className="font-medium text-gray-900 dark:text-white">Notifications vocales</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggleVoice}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {/* Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Volume</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={([value]) => handleVolumeChange(value)}
              max={1}
              min={0}
              step={0.1}
              className="w-full "
            />
          </div>

          {/* État */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div>État : {isEnabled ? 'Activé' : 'Désactivé'}</div>
          </div>

          {/* Boutons de test */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestVoice}
              disabled={!isEnabled}
              className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Volume2 className="w-4 h-4 mr-1" />
              Test
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleStopVoice}
              className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <VolumeX className="w-4 h-4 mr-1" />
              Arrêter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceControls; 