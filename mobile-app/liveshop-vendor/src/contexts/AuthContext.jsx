import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import webSocketService from '../services/websocket';
import audioService from '../services/audioService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState({ balance: 0, transactions: [] });
  const [isAdmin, setIsAdmin] = useState(false);
  const [listenersConfigured, setListenersConfigured] = useState(false);

  // 🎯 Configuration simple des listeners WebSocket
  const setupWebSocketListeners = () => {
    // Permettre la configuration AVANT la connexion (listeners en attente)
    if (listenersConfigured) {
      console.log('⚠️ Listeners déjà configurés, skip');
      return;
    }
    
    console.log('🎯 Configuration des listeners WebSocket (même si pas encore connecté)...');
    
    // Écouter les nouvelles commandes avec ACK
    webSocketService.on('new_order', (data, ackCallback) => {
      console.log('🔔 [CLIENT-RECV] Nouvelle commande reçue:', data);
      
      try {
        if (data.order) {
          console.log('🔊 [CLIENT-SOUND] Lecture son notification...');
          // Son de notification
          audioService.playNotificationSound();
          
          // Créer la notification avec un ID unique
          const notification = {
            id: `order-${data.order.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'new_order',
            title: '🛍️ Nouvelle commande !',
            message: `Commande de ${data.order.customer_name} - ${data.order.product?.name || 'Produit'}`,
            data: data,
            created_at: new Date().toISOString(),
            read: false
          };

          console.log('📦 [CLIENT-NOTIF] Notification créée:', notification);

          // Ajouter au store de notifications
          console.log('📥 [CLIENT-STORE] Émission updateNotificationStore...');
          window.dispatchEvent(new CustomEvent('updateNotificationStore', {
            detail: { notifications: [notification] }
          }));

          // Déclencher les toasts
          console.log('🎊 [CLIENT-TOAST] Émission newNotifications...');
          window.dispatchEvent(new CustomEvent('newNotifications', {
            detail: { notifications: [notification] }
          }));
          
          // Sauvegarder l'ID pour éviter de récupérer cette notification plus tard
          if (data.notification?.id) {
            const notifId = parseInt(data.notification.id);
            localStorage.setItem('lastNotificationId', notifId.toString());
            console.log(`💾 [CLIENT-SAVE] ID notification temps réel sauvegardé: ${notifId}`);
          }
          
          console.log('✅ [CLIENT-SUCCESS] Notification traitée et émise');
          
          // Envoyer ACK de confirmation au serveur
          if (typeof ackCallback === 'function') {
            ackCallback({ ok: true, notificationId: data.notification?.id });
            console.log(`📤 [CLIENT-ACK] ACK envoyé pour notification ${data.notification?.id}`);
          }
        } else {
          console.error('❌ [CLIENT-ERROR] Pas de données order dans la notification');
          if (typeof ackCallback === 'function') {
            ackCallback({ ok: false, error: 'No order data' });
          }
        }
      } catch (error) {
        console.error('❌ [CLIENT-ERROR] Erreur traitement notification:', error);
        if (typeof ackCallback === 'function') {
          ackCallback({ ok: false, error: error.message });
        }
      }
    });
    
    // Écouter les mises à jour de statut
    webSocketService.on('order_status_update', (data) => {
      console.log('🔄 Statut commande mis à jour:', data);
      window.dispatchEvent(new CustomEvent('orderStatusUpdated', { detail: data }));
    });
    
    setListenersConfigured(true);
  };

  // 🔄 Récupérer les notifications manquées avec retry
  const requestMissedNotifications = async (retryCount = 0) => {
    try {
      console.log(`🔄 [MISSED-START] Début récupération notifications manquées (tentative ${retryCount + 1})...`);
      
      // Vérifier WebSocket
      console.log('🔍 [MISSED-CHECK] WebSocket connecté:', webSocketService.isConnected);
      if (!webSocketService.isConnected) {
        console.warn('⚠️ [MISSED-ABORT] WebSocket non connecté, abandon récupération');
        return;
      }
      
      // Récupérer le dernier ID de notification traité (en nombre)
      const lastNotificationIdStr = localStorage.getItem('lastNotificationId') || '0';
      const lastNotificationId = parseInt(lastNotificationIdStr);
      console.log(`🔍 [MISSED-ID] Dernier ID traité: ${lastNotificationId} (type: ${typeof lastNotificationId})`);
      
      console.log('📡 [MISSED-REQUEST] Appel webSocketService.requestMissedNotifications...');
      const missedNotifications = await webSocketService.requestMissedNotifications(lastNotificationId);
      console.log(`📥 [MISSED-RESPONSE] Réponse reçue - ${missedNotifications?.length || 0} notifications:`, missedNotifications);
      
      if (missedNotifications?.length > 0) {
        console.log(`📥 ${missedNotifications.length} notifications manquées récupérées`);
        
        // Formater les notifications manquées
        const formattedNotifications = missedNotifications.map(notif => {
          console.log(`🔍 [MISSED-PARSE] Parsing notification ${notif.id}, data type:`, typeof notif.data, notif.data);
          
          let parsedData = null;
          try {
            if (notif.data) {
              // Si c'est déjà un objet, pas besoin de parser
              if (typeof notif.data === 'object') {
                parsedData = notif.data;
              } else if (typeof notif.data === 'string') {
                parsedData = JSON.parse(notif.data);
              }
            }
          } catch (parseError) {
            console.error(`❌ [MISSED-PARSE] Erreur parsing data pour notification ${notif.id}:`, parseError);
            parsedData = null;
          }
          
          return {
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            data: parsedData,
            created_at: notif.created_at,
            read: notif.read
          };
        });
        
        console.log('🎊 [MISSED-EMIT] Émission événements pour notifications manquées...');
        
        // Émettre pour le store (le store gère maintenant les doublons)
        window.dispatchEvent(new CustomEvent('updateNotificationStore', {
          detail: { notifications: formattedNotifications }
        }));
        console.log('✅ [MISSED-STORE] Événement updateNotificationStore émis');
        
        // Forcer des refresh réguliers pendant 5 secondes pour garantir que l'UI se met à jour
        // Cela gère le cas où les composants ne sont pas encore montés
        let refreshCount = 0;
        const refreshInterval = setInterval(() => {
          refreshCount++;
          console.log(`🔄 [MISSED-REFRESH-${refreshCount}] Force refresh du store...`);
          window.dispatchEvent(new CustomEvent('forceRefreshNotifications'));
          
          // Arrêter après 5 secondes (25 tentatives à 200ms)
          if (refreshCount >= 25) {
            clearInterval(refreshInterval);
            console.log('✅ [MISSED-REFRESH] Refresh terminé après 25 tentatives');
          }
        }, 200);
        
        // Émettre pour les toasts (seulement les non lues)
        const unreadNotifications = formattedNotifications.filter(n => !n.read);
        if (unreadNotifications.length > 0) {
          console.log(`🎊 [MISSED-TOAST] ${unreadNotifications.length} notifications non lues pour toasts`);
          window.dispatchEvent(new CustomEvent('newNotifications', {
            detail: { notifications: unreadNotifications }
          }));
          console.log('✅ [MISSED-TOAST] Événement newNotifications émis');
        }
        
        // Sauvegarder le dernier ID traité (en nombre)
        const lastId = Math.max(...missedNotifications.map(n => parseInt(n.id)));
        localStorage.setItem('lastNotificationId', lastId.toString());
        console.log(`💾 [MISSED-SAVE] Dernier ID sauvegardé: ${lastId}`);
      } else {
        console.log('📭 [MISSED-EMPTY] Aucune notification manquée');
      }
    } catch (error) {
      console.error('❌ [MISSED-ERROR] Erreur récupération notifications manquées:', error);
      
      // Retry avec backoff si pas trop de tentatives
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 [MISSED-RETRY] Retry dans ${delay}ms...`);
        setTimeout(() => requestMissedNotifications(retryCount + 1), delay);
      }
    }
  };

  const refreshSeller = async () => {
    try {
      const response = await apiService.getProfile();
      setSeller(response.data);
    } catch (err) {
      console.error('refreshSeller error:', err);
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('liveshop_token');
      
      if (token) {
        console.log('🔍 checkAuth - Token trouvé, vérification du profil...');
        try {
          const response = await apiService.getProfile();
          console.log('🔍 checkAuth - Données reçues:', response.data);
          console.log('🔍 checkAuth - Rôle:', response.data.role);
          
          setSeller(response.data);
          const isAdminUser = ['admin', 'superadmin'].includes(response.data.role);
          console.log('🔍 checkAuth - isAdmin:', isAdminUser);
          setIsAdmin(isAdminUser);
          
          // 🔌 Connecter automatiquement le WebSocket après authentification
          console.log('🔌 Configuration WebSocket automatique...');
          try {
            // 🎯 IMPORTANT : Configurer les listeners AVANT la connexion
            console.log('📡 [AUTH] Configuration des listeners...');
            setupWebSocketListeners();
            
            // Connexion WebSocket
            console.log('🔌 [AUTH] Connexion WebSocket...');
            await webSocketService.connect(token);
            console.log('✅ WebSocket connecté automatiquement');
            
            // Attendre que les composants UI soient montés
            console.log('⏳ [AUTH] Attente 2s pour que les composants soient montés...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Récupérer les notifications manquées
            console.log('📥 [AUTH] Récupération des notifications manquées...');
            await requestMissedNotifications();
          } catch (wsError) {
            console.error('❌ Erreur connexion WebSocket:', wsError);
          }
          
          // Charger les crédits seulement pour les vendeurs (pas les admins)
          if (!isAdmin) {
            try {
              const creditsResponse = await apiService.getCredits();
              setCredits(creditsResponse.data);
            } catch (error) {
              console.error('Erreur lors du chargement des crédits:', error);
            }
          }
          //   try {
          //     const creditsResponse = await apiService.getCredits();
          //     setCredits(creditsResponse.data);
          //   } catch (error) {
          //     console.error('Erreur lors du chargement des crédits:', error);
          //   }
          // } // Désactivé temporairement
        } catch (profileError) {
          console.error('Erreur profil, déconnexion:', profileError);
          localStorage.removeItem('liveshop_token');
          setSeller(null);
          // setCredits(null); // Désactivé temporairement
          setIsAdmin(false);
        }
      } else {
        console.log('🔍 checkAuth - Aucun token trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      localStorage.removeItem('liveshop_token');
      setSeller(null);
      // setCredits(null); // Désactivé temporairement
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (phoneNumber, pin, rememberMe = false) => {
    try {
      console.log('🔐 Login - Tentative de connexion...');
      const response = await apiService.login(phoneNumber, pin);
      console.log('🔐 Login - Réponse reçue:', response);
      
      const { token, seller: sellerData } = response;
      console.log('🔐 Login - Token:', token ? 'présent' : 'manquant');
      console.log('🔐 Login - Seller data:', sellerData);
      
      if (!token || !sellerData) {
        throw new Error('Réponse invalide du serveur');
      }
      
      localStorage.setItem('liveshop_token', token);
      
      // Sauvegarder l'état "Se souvenir de moi"
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        localStorage.setItem('remembered_phone', phoneNumber);
      } else {
        localStorage.removeItem('remember_me');
        localStorage.removeItem('remembered_phone');
      }
      
      setSeller(sellerData);
      const isAdminUser = ['admin', 'superadmin'].includes(sellerData.role);
      setIsAdmin(isAdminUser);
      
      // 🔌 Connecter WebSocket et récupérer notifications après login
      try {
        // 🎯 IMPORTANT : Configurer les listeners AVANT la connexion
        console.log('📡 [LOGIN] Configuration des listeners...');
        setupWebSocketListeners();
        
        console.log('🔌 [LOGIN] Connexion WebSocket...');
        await webSocketService.connect(token);
        console.log('✅ [LOGIN] WebSocket connecté');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('📥 [LOGIN] Récupération notifications...');
        await requestMissedNotifications();
      } catch (wsError) {
        console.error('❌ [LOGIN] Erreur WebSocket:', wsError);
      }
      
      console.log('✅ Login - Connexion réussie');
      return { success: true, data: response };
    } catch (error) {
      console.error('❌ Login - Erreur:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (phoneNumber, name) => {
    try {
      const response = await apiService.register(phoneNumber, name);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('liveshop_token');
    
    // Note: On ne supprime PAS les infos "Se souvenir de moi" ici.
    // Elles sont gérées uniquement lors du login (si l'utilisateur décoche la case).
    // Cela permet de pré-remplir le numéro même après une déconnexion explicite.
    
    // 🔌 Déconnecter le WebSocket
    console.log('🔌 Déconnexion WebSocket...');
    webSocketService.disconnect();
    
    setSeller(null);
    // setCredits(null); // Désactivé temporairement
    setIsAdmin(false);
  };

  // Rafraîchir les crédits (version compatible, même si l'état crédits est inactif)
  const refreshCredits = async () => {
    // Ne pas rafraîchir pour les admins
    if (isAdmin) return null;
    try {
      const response = await apiService.getCredits();
      setCredits(response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des crédits:', error);
      return null;
    }
  };

  // Récupérer le token depuis localStorage
  const token = localStorage.getItem('liveshop_token');

  const value = {
    seller,
    // credits, // Désactivé temporairement
    loading,
    isAdmin,
    token, // Ajouter le token
    login,
    register,
    logout,
    refreshCredits,
    isAuthenticated: !!seller
  };

  return (
    <AuthContext.Provider value={{
      seller,
      loading,
      credits,
      isAdmin,
      token, // ← AJOUTER LE TOKEN ICI
      login,
      logout,
      refreshCredits,
      refreshSeller,
      requestMissedNotifications, // Exposer pour debug
      isAuthenticated: !!seller // AJOUTER isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
