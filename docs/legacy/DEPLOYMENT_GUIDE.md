# 🚀 Guide de Déploiement Sélectif - LiveShop Link

Ce guide explique comment utiliser les nouveaux scripts de déploiement intelligent qui permettent de déployer seulement les projets modifiés.

## 📋 Scripts Disponibles

### 🧠 `deploy-smart.sh` - Déploiement Intelligent
**Fonctionnalité principale :** Détecte automatiquement les projets modifiés et ne déploie que ceux-ci.

**Utilisation :**
```bash
./deploy-smart.sh
```

**Ce qu'il fait :**
- 🔍 Analyse les modifications git depuis le dernier commit
- 🎯 Identifie quels services ont été modifiés
- 🚀 Déploie seulement les services modifiés
- ✅ Teste la santé des services après déploiement
- 💡 Propose des options si aucune modification n'est détectée

### 👀 `deploy-watch.sh` - Surveillance des Modifications
**Fonctionnalité :** Affiche un rapport détaillé des modifications et recommande le déploiement approprié.

**Utilisation :**
```bash
./deploy-watch.sh
```

**Ce qu'il fait :**
- 📊 Liste tous les fichiers modifiés par service
- 🔍 Différencie les modifications commitées, stagées et non suivies
- 🚀 Suggère le script de déploiement approprié
- 💡 Fournit des commandes utiles

### 🔧 `deploy-backend.sh` - Déploiement Backend
**Fonctionnalité :** Déploie rapidement uniquement le service backend.

**Utilisation :**
```bash
./deploy-backend.sh
```

**Quand l'utiliser :**
- ✅ Modifications dans `liveshop-backend/`
- ✅ Changements de configuration serveur
- ✅ Mise à jour des modèles de données
- ✅ Modification des routes API

### 🌐 `deploy-web-client.sh` - Déploiement Web Client
**Fonctionnalité :** Déploie rapidement uniquement le web client.

**Utilisation :**
```bash
./deploy-web-client.sh
```

**Quand l'utiliser :**
- ✅ Modifications dans `web-client/liveshop-client/`
- ✅ Changements d'interface utilisateur
- ✅ Mise à jour des composants React
- ✅ Modification du CSS/styling

### 📱 `deploy-mobile.sh` - Déploiement Mobile App
**Fonctionnalité :** Déploie rapidement uniquement l'application mobile.

**Utilisation :**
```bash
./deploy-mobile.sh
```

**Quand l'utiliser :**
- ✅ Modifications dans `mobile-app/liveshop-vendor/`
- ✅ Changements d'interface mobile
- ✅ Mise à jour des composants React Native
- ✅ Modification des fonctionnalités mobiles

## 🎯 Workflow Recommandé

### 1. **Avant le Déploiement**
```bash
# Vérifier les modifications
./deploy-watch.sh

# Commiter les changements si nécessaire
git add .
git commit -m "Description des modifications"
```

### 2. **Choisir la Stratégie de Déploiement**

#### 🚀 **Déploiement Sélectif (Recommandé)**
```bash
./deploy-smart.sh
```
- ✅ Plus rapide
- ✅ Moins de risque
- ✅ Déploie seulement ce qui a changé

#### 🔧 **Déploiement Spécifique**
```bash
# Si seul le backend a changé
./deploy-backend.sh

# Si seul le web client a changé
./deploy-web-client.sh

# Si seule l'app mobile a changé
./deploy-mobile.sh
```

#### 🚀 **Déploiement Complet (Si nécessaire)**
```bash
./deploy.sh
```
- ⚠️ Plus lent
- ⚠️ Plus de risque
- ✅ Garantit la cohérence globale

## 📊 Exemples d'Utilisation

### Exemple 1 : Modification du Backend
```bash
# 1. Vérifier les modifications
./deploy-watch.sh

# 2. Déployer seulement le backend
./deploy-backend.sh

# 3. Vérifier le statut
docker-compose ps backend
```

### Exemple 2 : Modification du Web Client
```bash
# 1. Vérifier les modifications
./deploy-watch.sh

# 2. Déployer seulement le web client
./deploy-web-client.sh

# 3. Vérifier le statut
docker-compose ps dashboard
```

### Exemple 3 : Modifications Multiples
```bash
# 1. Vérifier les modifications
./deploy-watch.sh

# 2. Utiliser le déploiement intelligent
./deploy-smart.sh
```

## 🔍 Commandes de Diagnostic

### Vérifier le Statut des Services
```bash
docker-compose ps
```

### Voir les Logs d'un Service
```bash
# Backend
docker-compose logs backend

# Web Client
docker-compose logs dashboard

# Mobile App
docker-compose logs mobile
```

### Vérifier les Modifications Git
```bash
# Modifications depuis le dernier commit
git diff HEAD~1

# Fichiers modifiés par dossier
git diff --name-only HEAD~1 | grep "liveshop-backend/"
git diff --name-only HEAD~1 | grep "web-client/"
git diff --name-only HEAD~1 | grep "mobile-app/"
```

## ⚠️ Points d'Attention

### 1. **Dépendances entre Services**
- Si le backend change, vérifiez que le web client et mobile app sont compatibles
- Si l'API change, déployez d'abord le backend, puis les clients

### 2. **Ordre de Déploiement**
- **Backend en premier** si l'API change
- **Clients ensuite** si l'interface change
- **Déploiement complet** si les changements sont majeurs

### 3. **Tests Post-Déploiement**
- Vérifiez que les services répondent
- Testez les fonctionnalités critiques
- Surveillez les logs pour détecter les erreurs

## 🚨 Dépannage

### Service Ne Démarre Pas
```bash
# Voir les logs d'erreur
docker-compose logs [service]

# Redémarrer le service
docker-compose restart [service]

# Rebuilder l'image
docker-compose build --no-cache [service]
```

### Problème de Connexion
```bash
# Vérifier les ports
docker-compose ps

# Vérifier les réseaux
docker network ls

# Redémarrer tous les services
docker-compose down && docker-compose up -d
```

## 📈 Avantages du Déploiement Sélectif

- ⚡ **Plus rapide** : Pas de rebuild des services inchangés
- 🔒 **Plus sûr** : Moins de risque de casser les services stables
- 💰 **Plus économique** : Moins de ressources utilisées
- 🎯 **Plus précis** : Déploiement ciblé selon les besoins

## 🔄 Mise à Jour des Scripts

Pour mettre à jour les scripts de déploiement :
```bash
git pull origin main
chmod +x deploy-*.sh
```

---

**💡 Conseil :** Commencez toujours par `./deploy-watch.sh` pour comprendre ce qui a changé, puis choisissez la stratégie de déploiement appropriée !
