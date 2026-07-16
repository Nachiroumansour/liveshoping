import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '../hooks/useNotificationStore';
import audioService from '../services/audioService';
import NotificationToast from './NotificationToast';

const NotificationIndicator = ({ 
  showNotifications: externalShowNotifications, 
  setShowNotifications: externalSetShowNotifications 
}) => {
  const [forceUpdate, setForceUpdate] = useState(0);
  const [internalShowNotifications, setInternalShowNotifications] = useState(false);
  const [activeToasts, setActiveToasts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastProcessedEventId, setLastProcessedEventId] = useState(null);
  
  // Relire le store à chaque forceUpdate
  const storeData = useNotificationStore();
  const { notifications = [], unreadCount = 0, markAsRead, isConnected } = storeData;

  // Log à chaque render pour debug
  console.log('🎨 [INDICATOR-RENDER] NotificationIndicator render, forceUpdate:', forceUpdate, 'notifications:', notifications.length, 'unreadCount:', unreadCount);

  // Utiliser les props externes si disponibles, sinon l'état interne
  const showNotifications = externalShowNotifications !== undefined ? externalShowNotifications : internalShowNotifications;
  const setShowNotifications = externalSetShowNotifications || setInternalShowNotifications;

  // Force update au montage et écoute des refresh
  useEffect(() => {
    console.log('🎊 [INDICATOR-MOUNT] NotificationIndicator monté, notifications actuelles:', notifications.length);
    
    // Écouter les demandes de force refresh et FORCER un re-render
    const handleForceRefresh = () => {
      console.log('🔄 [INDICATOR-REFRESH] Force refresh reçu, force re-render...');
      setForceUpdate(prev => {
        const newValue = prev + 1;
        console.log('🔄 [INDICATOR-FORCE-UPDATE] forceUpdate:', prev, '→', newValue);
        return newValue;
      });
    };
    
    window.addEventListener('forceRefreshNotifications', handleForceRefresh);
    
    return () => {
      window.removeEventListener('forceRefreshNotifications', handleForceRefresh);
    };
  }, []); // Dépendances vides pour ne s'abonner qu'une fois

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <AlertCircle className="w-4 h-4 text-green-600" />;
      case 'order_status_update':
        return <Check className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_order':
        return 'bg-green-50 border-green-200';
      case 'order_status_update':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Marquage automatique comme lu à l'ouverture + activation audio
  useEffect(() => {
    if (showNotifications && unreadCount > 0) {
      // Activer l'audio au premier clic (requis par les navigateurs)
      if (!audioService.enabled) {
        audioService.setEnabled(true);
        console.log('🔊 Audio activé automatiquement');
      }
      
      // Marquer automatiquement toutes les notifications comme lues
      markAsRead();
    }
  }, [showNotifications, unreadCount, markAsRead]);

  const handleMarkAllAsRead = () => {
    markAsRead();
    setShowNotifications(false);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead([notificationId]);
  };

  // Écouter les nouvelles notifications pour afficher les toasts
  useEffect(() => {
    console.log('🎊 NotificationIndicator - Configuration listener newNotifications');
    
    const handleNewNotifications = (event) => {
      console.log('🎊 NotificationIndicator - Événement newNotifications reçu:', event.detail);
      const { notifications: newNotifications } = event.detail;
      
      // Créer un ID unique pour cet événement
      const eventId = `${Date.now()}-${JSON.stringify(newNotifications)}`;
      
      // Vérifier si on a déjà traité cet événement
      if (lastProcessedEventId === eventId) {
        console.log('⚠️ Événement déjà traité, ignoré:', eventId);
        return;
      }
      
      setLastProcessedEventId(eventId);
      console.log('🎊 NotificationIndicator - Nombre de notifications:', newNotifications?.length);
      
      if (newNotifications && newNotifications.length > 0) {
        newNotifications.forEach((notification, index) => {
          console.log('🎊 NotificationIndicator - Création toast pour:', notification);
          const toastId = `toast-${notification.id}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
          
          setActiveToasts(prev => {
            // Vérifier si un toast avec cette notification existe déjà
            const existingToast = prev.find(toast => toast.notification.id === notification.id);
            if (existingToast) {
              console.log('⚠️ Toast déjà existant pour notification:', notification.id);
              return prev;
            }
            
            console.log('🎊 NotificationIndicator - Ajout toast, total:', prev.length + 1);
            return [...prev, { id: toastId, notification }];
          });
          
          // Supprimer le toast après 8 secondes
          setTimeout(() => {
            setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
          }, 8000);
        });
        
        // 🔔 Mettre à jour le store de notifications pour le badge
        console.log('🔔 Mise à jour du store de notifications...');
        // Émettre un événement pour mettre à jour le store
        window.dispatchEvent(new CustomEvent('updateNotificationStore', {
          detail: { notifications: newNotifications }
        }));
      } else {
        console.warn('⚠️ NotificationIndicator - Pas de notifications dans l\'événement');
      }
    };

    window.addEventListener('newNotifications', handleNewNotifications);
    return () => {
      console.log('🎊 NotificationIndicator - Suppression listener newNotifications');
      window.removeEventListener('newNotifications', handleNewNotifications);
    };
  }, []);

  const handleViewOrder = (orderId) => {
    // Navigation vers la page des commandes
    window.location.href = `/orders/${orderId}`;
  };

  const handleViewAllOrders = () => {
    // Navigation vers la page générale des commandes
    window.location.href = '/orders';
  };

  const handleCloseToast = (toastId) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  return (
    <div className="relative">

      {/* Overlay pour fermer le panneau */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Panneau de notifications — minimal & moderne */}
      {showNotifications && (
        <div className="fixed top-14 right-3 left-3 sm:left-auto sm:w-80 md:w-96 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header simple */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenu */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <Bell className="w-8 h-8 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {notifications.slice(0, 10).map((notification) => (
                    <button
                      key={notification.id}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !notification.read ? 'bg-gray-50/50 dark:bg-gray-700/30' : ''
                      }`}
                      onClick={() => {
                        if (notification.type === 'new_order' && notification.data?.order?.id) {
                          handleMarkAsRead(notification.id);
                          handleViewOrder(notification.data.order.id);
                        } else {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      {/* Icône */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        notification.type === 'new_order'
                          ? 'bg-green-50 dark:bg-green-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                          {notification.message}
                        </p>
                        <span className="text-[11px] text-gray-300 dark:text-gray-500 mt-1 block">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleViewAllOrders}
                  className="w-full py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Voir toutes les commandes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toasts */}
      {activeToasts.map((toast, index) => (
        <div
          key={toast.id}
          className="fixed z-50 left-3 right-3 sm:left-auto sm:right-4 sm:w-80"
          style={{
            top: isMobile
              ? `${4.5 + (index * 4.5)}rem`
              : `${1 + (index * 5)}rem`,
            zIndex: 50 + index,
          }}
        >
          <NotificationToast
            notification={toast.notification}
            onClose={() => handleCloseToast(toast.id)}
            onViewOrder={handleViewOrder}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationIndicator; 