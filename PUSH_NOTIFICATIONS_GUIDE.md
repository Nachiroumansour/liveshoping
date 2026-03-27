# 📱 Guide Push Notifications - LiveShop Link

## 🎯 Vue d'ensemble

Push notifications offre aux vendeurs des alertes immédiates sur leur téléphone, même si l'app n'est pas ouverte.

### Architecture

```
┌─────────────────────────┐
│   Nouvelle Commande     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  notificationService    │
└────────────┬────────────┘
             │
    ┌────────┴────────┬──────────┬──────────┐
    │                 │          │          │
    ▼                 ▼          ▼          ▼
SOCKET.IO      WEB PUSH      BULLMQ      MEMORY
(Temps réel)   (Offline)    (Retry)      (Fallback)
```

## ✅ Configuration requise

### 1. Clés VAPID (DÉJÀ CONFIGURÉES)

```bash
# Backend: liveshop-backend/.env
VAPID_PUBLIC_KEY=BOdU1AbzYPUcYe93jfUSGUXCsVybasCOzkPRQLtzYi9GK3tT6EE-1DYK5pZ1dHEXHv83Bwxo6h7wQx_3wHdaklM
VAPID_PRIVATE_KEY=koSngy1RZt0O8lI4853Lr55FRUEPWAHTHRUtiS2hXPU
VAPID_SUBJECT=mailto:contact@livelink.store
```

### 2. Service Worker (DÉJÀ EN PLACE)

Location: `mobile-app/liveshop-vendor/src/sw.js`

Gère:
- ✅ Notifications push reçues
- ✅ Actions utilisateur (clic sur notification)
- ✅ Navigation au démarrage depuis notification

### 3. Push Service Client (DÉJÀ INTÉGRÉ)

Location: `mobile-app/liveshop-vendor/src/services/pushService.js`

Features:
- ✅ Détection support Web Push
- ✅ Demande permission
- ✅ Enregistrement souscription
- ✅ Désenregistrement

### 4. App Initialization (DÉJÀ ACTIVE)

Location: `mobile-app/liveshop-vendor/src/App.jsx`

```javascript
// Subscribe to push notifications when authenticated
useEffect(() => {
  if (isAuthenticated && token && pushService.isSupported()) {
    const timer = setTimeout(() => pushService.subscribe(), 3000);
    return () => clearTimeout(timer);
  }
}, [isAuthenticated, token]);
```

## 🔄 Flux de notification

### 1. Nouvelle Commande

```
Client paie/crée commande
        ↓
POST /api/public/:linkId/orders
        ↓
Order.create() ✅
        ↓
notificationService.sendRealtimeNotification(sellerId, 'new_order', data)
        ↓
if Socket.IO actif:
  → Envoyer par WebSocket (IMMÉDIAT)
else:
  → webPushService.sendPushNotification()
  → Notification push au téléphone ✅
```

### 2. Mise à jour Commande

```
Vendeur change statut
        ↓
PUT /api/orders/:id/status
        ↓
Order.update()
        ↓
notificationService.sendRealtimeNotification(sellerId, 'order_status_update', data)
        ↓
Même flux que ci-dessus
```

## 🧪 Test du système

### 1. Test de souscription push

```bash
# Tester l'endpoint VAPID
curl http://localhost:3001/api/push/vapid-public-key

# Devrait retourner:
{
  "success": true,
  "publicKey": "BOdU1AbzYPUcYe93jfUSGUXCsVybasCOzkPRQLtzYi9GK3tT6EE-1DYK5pZ1dHEXHv83Bwxo6h7wQx_3wHdaklM"
}
```

### 2. Test push notification (Backend)

```bash
# Générer un test de notification
curl -X POST http://localhost:3001/api/push/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Test depuis le frontend

1. Ouvrir l'app mobile
2. Se connecter ✅
3. Autoriser les notifications push
4. Créer une commande depuis le site client
5. ✅ Notification rapide devrait apparaître sur le téléphone

## 📊 Monitoring & Debugging

### Logs Backend

```javascript
// Voir les logs du système de notifications
// grep pour "NOTIF-" ou "PUSH"

🔔 [NOTIF-START] Tentative d'envoi notification
💾 [NOTIF-DB] Création notification en base
✅ [NOTIF-SUCCESS] Notification envoyée en temps réel
📱 [NOTIF-OFFLINE] Vendeur offline, tentative Web Push
✅ [NOTIF-PUSH] Notification envoyée via Web Push
⏳ [NOTIF-QUEUE] Ajout à la queue de retry
✅ [NOTIF-BULLMQ] Notification ajoutée à BullMQ
```

### Client Console

```javascript
// Dans le service worker (Chrome DevTools)
// Application → Service Workers

// La notification reçue s'affiche dans les logs
```

## 🔧 Configuration Avancée

### Exiger interaction pour certaines notifications

```javascript
// webPushService.js ligne ~80
requireInteraction: notification.type === 'new_order' // true pour commandes
```

### Personnaliser les actions

```javascript
// webPushService.js ligne ~85-100
case 'new_order':
  return [
    { action: 'view', title: 'Voir la commande' },
    { action: 'close', title: 'Fermer' }
  ];
```

### Configurer les icônes

```javascript
icon: '/pwa-192x192.png',
badge: '/pwa-192x192.png'
```

## 📈 Prochaines étapes

### Phase 2 (Actuelle)
- ✅ Web Push notifications
- ✅ Retry automatique (BullMQ)
- ✅ Intégration en temps réel

### Phase 3 (À faire)
- Notifications SMS fallback (Twilio)
- Email notifications (pour offline prolongé)
- Dashboard d'audit des notifications

### Phase 4 (À faire)
- Analytics Prometheus
- Monitoring Grafana
- Sentry error tracking

## 📞 Troubleshooting

### "Push not configured - VAPID keys missing"
✅ RÉSOLU : Clés VAPID ajoutées au .env

### "Notification permission denied"
→ Utilisateur a refusé la permission
→ Vérifier: Settings → Notifications → Autoriser

### "No subscription active"
→ L'utilisateur n'a pas souscrit
→ App doit appeler `pushService.subscribe()` après login

### Notifications ne remontent pas après timeout
→ BullMQ retry queue traite le problème
→ Vérifier les logs: `NOTIF-QUEUE`

## 📚 Resources

- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push NPM](https://www.npmjs.com/package/web-push)
- [Workbox by Google](https://developers.google.com/web/tools/workbox)

---

**Status**: ✅ Production Ready (Phase 2)
**Last Updated**: 27 Mars 2026
