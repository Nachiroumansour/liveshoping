# 🚀 Système de Déploiement Complet - LiveShop Link

## 🎯 Vue d'Ensemble

Ce projet utilise un **système hybride** de déploiement :
- **🔄 CI/CD Automatique** : GitHub Actions pour la production
- **🏠 Déploiement Local** : Scripts intelligents pour le développement

## 📋 **Scripts Disponibles**

### 🔍 **Surveillance et Analyse**
| Script | Usage | Description |
|--------|-------|-------------|
| `./deploy-watch.sh` | **Surveillance** | Détecte les modifications et recommande le déploiement |
| `./check-ci-cd.sh` | **Analyse CI/CD** | Analyse votre configuration GitHub Actions |
| `./prepare-pr.sh` | **Préparation PR** | Prépare votre Pull Request avec template |

### 🏠 **Déploiement Local (Développement)**
| Script | Usage | Description |
|--------|-------|-------------|
| `./deploy-local.sh` | **Développement** | Instructions pour redémarrer localement |
| `./deploy-smart.sh` | **Local intelligent** | Déploie automatiquement les services modifiés |
| `./deploy-backend.sh` | **Backend** | Déploie uniquement le backend |
| `./deploy-web-client.sh` | **Web Client** | Déploie uniquement le web client |
| `./deploy-mobile.sh` | **Mobile App** | Déploie uniquement l'app mobile |

### 🚀 **Production (Automatique)**
| Script | Usage | Description |
|--------|-------|-------------|
| `./deploy.sh` | **Production complète** | Déploiement complet (ancien script) |
| `./deploy-final.sh` | **Production Cloudinary** | Déploiement avec configuration Cloudinary |

## 🔄 **Votre Workflow de Production**

### **GitHub Actions (Automatique)**
```
Code → Commit → Push → Pull Request → Merge → Déploiement Automatique sur VPS
```

**Configuration** : `.github/workflows/deploy.yml`
- Se déclenche sur `push` vers `main`
- Copie les fichiers vers votre VPS
- Exécute `docker compose up -d --build`

## 🎯 **Quand Utiliser Quoi**

### ✅ **Développement Local**
```bash
# Voir ce qui a changé
./deploy-watch.sh

# Tester localement
./deploy-local.sh

# Déploiement intelligent local
./deploy-smart.sh
```

### ✅ **Préparation de PR**
```bash
# Préparer votre Pull Request
./prepare-pr.sh

# Cela génère :
# - Résumé des modifications
# - Template de PR
# - Recommandations
```

### ✅ **Production (Automatique)**
```bash
# 1. Commitez et poussez
git add .
git commit -m "Description"
git push origin votre-branche

# 2. Créez une PR sur GitHub
# 3. Le CI/CD se déclenche automatiquement
# 4. Mergez quand les tests passent
```

## 🚀 **Workflow Recommandé**

### 1. **Développement**
```bash
# Vérifier les modifications
./deploy-watch.sh

# Tester localement
./deploy-local.sh

# Ou déployer un service spécifique
./deploy-backend.sh
./deploy-web-client.sh
./deploy-mobile.sh
```

### 2. **Préparation PR**
```bash
# Préparer votre PR
./prepare-pr.sh

# Copier le template généré
# Créer la PR sur GitHub
```

### 3. **Déploiement Automatique**
```bash
# Le CI/CD se déclenche automatiquement
# Surveillez sur GitHub Actions
# Mergez quand tout est vert
```

## 💡 **Avantages du Système Hybride**

### 🏠 **Scripts Locaux**
- ⚡ **Plus rapide** : Pas de rebuild des services inchangés
- 🔒 **Plus sûr** : Tests avant de commiter
- 💰 **Plus économique** : Moins de ressources utilisées
- 🎯 **Plus précis** : Déploiement ciblé selon les besoins

### 🔄 **CI/CD Automatique**
- 🤖 **Automatique** : Pas d'intervention manuelle
- 🔄 **Reproductible** : Même processus à chaque fois
- 📊 **Traçable** : Historique complet des déploiements
- 🚀 **Production** : Environnement stable et contrôlé

## 🔍 **Monitoring et Debugging**

### **Sur GitHub**
- Actions → Historique des déploiements
- Pull Requests → Statut des checks
- Commits → Statut des workflows

### **Sur votre VPS**
```bash
# Statut des services
docker compose ps

# Logs des services
docker compose logs -f [service]

# Ressources utilisées
docker stats
```

### **Localement**
```bash
# Voir les modifications
./deploy-watch.sh

# Analyser votre CI/CD
./check-ci-cd.sh

# Tester localement
./deploy-local.sh
```

## 🚨 **Dépannage**

### **Si le déploiement CI/CD échoue :**
1. Vérifiez les logs GitHub Actions
2. Vérifiez la connectivité SSH vers votre VPS
3. Vérifiez l'espace disque sur le VPS
4. Utilisez `./deploy-local.sh` pour tester localement

### **Si un service local ne fonctionne pas :**
1. Utilisez `./deploy-watch.sh` pour voir les modifications
2. Utilisez `./deploy-smart.sh` pour redéployer
3. Vérifiez les logs avec `docker compose logs [service]`
4. Redémarrez avec `./deploy-[service].sh`

## 📚 **Documentation Complète**

- **`GITHUB_WORKFLOW_GUIDE.md`** - Guide spécifique GitHub Actions
- **`DEPLOYMENT_GUIDE.md`** - Guide complet des scripts locaux
- **`README-DEPLOYMENT.md`** - Résumé rapide

## 🔧 **Configuration Requise**

### **Local**
- Docker et Docker Compose
- Git
- Bash (pour les scripts)

### **Production**
- VPS avec Docker
- Secrets GitHub configurés :
  - `HOST` : IP de votre VPS
  - `USERNAME` : Utilisateur SSH
  - `SSH_KEY` : Clé SSH privée
  - `PORT` : Port SSH (généralement 22)

## 🎯 **Prochaines Étapes**

1. **Testez localement** : `./deploy-watch.sh` puis `./deploy-local.sh`
2. **Préparez une PR** : `./prepare-pr.sh`
3. **Surveillez le CI/CD** : GitHub Actions
4. **Optimisez** : Modifiez le workflow pour le déploiement sélectif

---

**💡 Conseil Principal :** 
- **Développement** → Utilisez les scripts locaux
- **Production** → Laissez GitHub Actions gérer automatiquement
- **Avant chaque PR** → Utilisez `./prepare-pr.sh`

**🎉 Résultat :** Déploiement plus rapide, plus sûr et plus intelligent !
