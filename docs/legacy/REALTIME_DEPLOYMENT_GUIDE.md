# 🚀 Guide de déploiement - Système de notifications en temps réel

## 📋 Vue d'ensemble

Le système de notifications a été amélioré pour être **scalable**, **fiable** et **robuste** au niveau entreprise.

### ✨ Nouvelles fonctionnalités

- ✅ **Redis Adapter** pour Socket.IO (support multi-instances)
- ✅ **BullMQ** pour retry persistant des notifications
- ✅ **Système ACK** client-serveur pour garantie de livraison
- ✅ **API Delta** pour récupération efficace des notifications manquées
- ✅ **CORS sécurisé** avec whitelist d'origines
- ✅ **Reconnexion automatique** avec backoff exponentiel
- ✅ **Heartbeat** pour détecter les connexions mortes

## 🔧 Prérequis

### Backend
- Node.js >= 18.x
- PostgreSQL >= 12
- Redis >= 6.x (pour Socket.IO adapter et BullMQ)

### Frontend
- Node.js >= 18.x
- React >= 18.x

## 📦 Installation

### 1. Backend

```bash
cd liveshop-backend

# Utiliser Node 18+
nvm use 18

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos valeurs
nano .env
```

### 2. Variables d'environnement critiques

```env
# OBLIGATOIRE en production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=votre_secret_jwt_tres_securise
REDIS_URL=redis://your-redis-host:6379

# CORS - Ajouter vos domaines
CORS_ORIGIN=https://livelink.store,https://space.livelink.store
```

### 3. Démarrer Redis

#### Option A : Docker (recommandé)
```bash
docker run -d \
  --name liveshop-redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes
```

#### Option B : Redis Cloud (production)
Utilisez un service managé comme:
- **Redis Cloud** (gratuit jusqu'à 30MB)
- **AWS ElastiCache**
- **Azure Cache for Redis**
- **Google Cloud Memorystore**

Mettez à jour `REDIS_URL` dans `.env`:
```env
REDIS_URL=redis://username:password@your-redis-host:6379
```

### 4. Démarrer le backend

```bash
# Développement
npm run dev

# Production
npm start
```

### 5. Vérifier le démarrage

Vous devriez voir dans les logs:
```
✅ Base de données synchronisée
✅ Socket.IO Redis Adapter configuré - Mode multi-instances activé
✅ NotificationService utilise BullMQ pour les retries
✅ NotificationQueue BullMQ initialisé
🚀 Serveur LiveShop Link démarré sur le port 3001
```

## 🏗️ Architecture

### Flux de notification

```
Client commande
    ↓
Backend crée notification en DB
    ↓
Tentative envoi Socket.IO immédiat
    ↓
    ├─ ✅ Succès → Marquer sent=true
    │              Client envoie ACK
    │              Marquer received=true
    │
    └─ ❌ Échec → Ajouter à BullMQ
                   Retry avec backoff (3 tentatives)
                   ↓
                   Client reconnecte
                   ↓
                   Demande notifications manquées
                   ↓
                   Récupération delta via API
```

### Composants clés

#### Backend
- `src/config/redis.js` - Gestionnaire Redis
- `src/services/notificationQueue.js` - Service BullMQ
- `src/services/notificationService.js` - Service notifications (mis à jour)
- `src/routes/notifications.js` - API REST (avec delta)
- `src/app.js` - Socket.IO avec ACK et récupération delta

#### Frontend Mobile
- `src/services/websocket.js` - Client Socket.IO (avec ACK)
- `src/contexts/NotificationContext.jsx` - Gestion d'état
- `src/stores/notificationStore.js` - Store Redux-like

## 🔍 Monitoring

### 1. Vérifier Redis

```bash
# Connexion Redis CLI
redis-cli

# Vérifier les clés Socket.IO
KEYS socket.io*

# Vérifier les jobs BullMQ
KEYS bull:notifications:*
```

### 2. API de statut

```bash
# Health check
curl http://localhost:3001/api/health

# Stats notifications (authentifié)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/notifications/stats
```

### 3. Logs

Les logs incluent maintenant:
- `✅ ACK reçu pour notification X` - Confirmation de réception
- `🔄 Récupération delta depuis ID X` - Récupération au reconnect
- `📋 [BullMQ] Notification X ajoutée à la queue` - Retry en cours
- `✅ [BullMQ] Job X complété` - Retry réussi

## 🚀 Déploiement production

### Option 1 : Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: ./liveshop-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis
      - postgres
    deploy:
      replicas: 3  # Multi-instances supporté !
      
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
      
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=liveshop
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  redis-data:
  postgres-data:
```

Démarrer:
```bash
docker-compose up -d --scale backend=3
```

### Option 2 : Kubernetes

Voir `k8s/` pour les manifests (à créer si besoin).

### Option 3 : Services managés

#### Backend
- **Render** (recommandé, support WebSocket)
- **Railway**
- **Fly.io**
- **AWS ECS/EKS**

#### Redis
- **Redis Cloud** (gratuit 30MB)
- **AWS ElastiCache**
- **Upstash** (serverless Redis)

#### Base de données
- **Supabase** (PostgreSQL managé)
- **Neon** (serverless PostgreSQL)
- **AWS RDS**

## 🧪 Tests

### 1. Tester les notifications

```bash
# Envoyer une notification de test
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Tester le retry

```bash
# 1. Arrêter le backend
# 2. Créer une commande (via l'app)
# 3. Redémarrer le backend
# 4. Vérifier que la notification est envoyée via BullMQ
```

### 3. Tester la récupération delta

```bash
# 1. Se déconnecter de l'app
# 2. Créer plusieurs commandes
# 3. Se reconnecter
# 4. Vérifier que toutes les notifications sont récupérées
```

## 📊 Métriques recommandées

À surveiller en production:

- **Connexions Socket.IO actives** par instance
- **Taille de la queue BullMQ** (doit rester < 100)
- **Taux de retry** (doit être < 5%)
- **Latence ACK** (doit être < 500ms)
- **Notifications non reçues** après 3 retries

## 🔒 Sécurité

### Checklist production

- [ ] JWT_SECRET unique et complexe (32+ caractères)
- [ ] CORS configuré avec domaines spécifiques
- [ ] Redis protégé par mot de passe
- [ ] PostgreSQL avec SSL activé
- [ ] Rate limiting activé (déjà présent)
- [ ] Helmet.js activé (déjà présent)
- [ ] Logs sensibles masqués

### Configuration Redis sécurisée

```bash
# redis.conf
requirepass votre_mot_de_passe_fort
bind 127.0.0.1
protected-mode yes
```

Mettre à jour `.env`:
```env
REDIS_URL=redis://:votre_mot_de_passe_fort@localhost:6379
```

## 🐛 Dépannage

### Problème: Socket.IO ne se connecte pas

**Solution:**
1. Vérifier les logs CORS
2. Vérifier que le domaine est dans `allowedOrigins`
3. Tester avec `curl`:
```bash
curl -H "Origin: https://space.livelink.store" \
  http://localhost:3001/api/health
```

### Problème: Redis non disponible

**Solution:**
Le système fonctionne en mode dégradé:
- Socket.IO en mode local (pas de multi-instances)
- Retry en mémoire (perdu au redémarrage)

Logs:
```
⚠️  Socket.IO en mode local - Pas de Redis disponible
⚠️  NotificationService utilise la queue en mémoire (fallback)
```

### Problème: Notifications perdues

**Solution:**
1. Vérifier que BullMQ est actif:
```bash
redis-cli KEYS bull:notifications:*
```

2. Vérifier les jobs échoués:
```bash
# Dans Redis CLI
LRANGE bull:notifications:failed 0 -1
```

3. Relancer les jobs échoués (via Bull Board ou code)

## 📈 Optimisations futures

### Phase 3 : Push notifications natives
- Web Push (PWA)
- Firebase Cloud Messaging (mobile)
- Fallback SMS via Twilio

### Phase 4 : Observabilité
- Prometheus + Grafana
- Sentry pour erreurs
- Bull Board pour monitoring BullMQ
- Logs structurés (Winston + Loki)

## 🆘 Support

En cas de problème:
1. Vérifier les logs backend
2. Vérifier Redis: `redis-cli ping`
3. Vérifier PostgreSQL: `psql $DATABASE_URL -c "SELECT 1"`
4. Tester l'API: `curl http://localhost:3001/api/health`

## 📚 Ressources

- [Socket.IO Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Node.js Production Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

✅ **Système prêt pour la production !**
