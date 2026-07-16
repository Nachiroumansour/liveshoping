import { useState, useEffect } from 'react';
import notificationStore from '../stores/notificationStore';

export const useNotificationStore = () => {
  const [state, setState] = useState(notificationStore.getState());

  useEffect(() => {
    // Relire immédiatement l'état au montage (cas où le store a déjà des données)
    const currentState = notificationStore.getState();
    console.log('🔍 [HOOK-MOUNT] useNotificationStore monté, état actuel:', currentState.notifications?.length || 0, 'notifications');
    setState({ ...currentState }); // Nouvel objet pour forcer re-render
    
    // S'abonner aux changements du store
    const unsubscribe = notificationStore.subscribe((newState) => {
      console.log('🔄 [HOOK-UPDATE] Store mis à jour, nouvelles notifications:', newState.notifications?.length || 0);
      setState({ ...newState }); // Nouvel objet pour forcer re-render
    });
    
    // Écouter les demandes de force refresh
    const handleForceRefresh = () => {
      const latestState = notificationStore.getState();
      console.log('🔄 [HOOK-FORCE] Force refresh reçu, relecture du store:', latestState.notifications?.length || 0, 'notifications');
      // Forcer un nouvel objet pour que React détecte le changement
      setState({ ...latestState });
    };
    
    window.addEventListener('forceRefreshNotifications', handleForceRefresh);
    
    // Nettoyer l'abonnement
    return () => {
      unsubscribe();
      window.removeEventListener('forceRefreshNotifications', handleForceRefresh);
    };
  }, []);

  return {
    ...state,
    markAsRead: notificationStore.markAsRead.bind(notificationStore),
    playSound: notificationStore.playSound.bind(notificationStore),
    setToken: notificationStore.setToken.bind(notificationStore)
  };
}; 