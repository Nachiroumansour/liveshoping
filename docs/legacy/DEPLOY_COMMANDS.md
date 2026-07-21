# 🚀 Commandes de déploiement

## 1. Vérifier les fichiers
```bash
git status
git add .
git status
```

## 2. Commit avec message descriptif
```bash
git commit -m "feat: système notifications temps réel niveau entreprise

✅ Redis Adapter Socket.IO (multi-instances)
✅ BullMQ retry persistant des notifications  
✅ Système ACK client-serveur
✅ API Delta récupération efficace (?sinceId=X)
✅ Web Push natif avec clés VAPID
✅ CORS sécurisé whitelist domaines
✅ Client mobile mis à jour (ACK + delta)

PRODUCTION READY:
- Testé et validé en local ✅
- Aucune modification structure DB
- Redis requis en production
- Variables env documentées

Performances: Scalable, Fiable, Rapide
Comparable à Uber Eats/Shopify niveau"
```

## 3. Pousser vers GitHub
```bash
git push origin main
```

## 4. Après déploiement - Vérifications
```bash
# Health check
curl https://api.livelink.store/api/health

# VAPID keys
curl https://api.livelink.store/api/push/vapid-public-key

# Tester une notification (avec token valide)
curl -X POST https://api.livelink.store/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```
