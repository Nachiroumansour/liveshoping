# 🔄 Guide du Workflow GitHub Actions - LiveShop Link

## 🎯 Comment Fonctionne Votre Déploiement Automatique

### 📋 **Votre Workflow Actuel**

```
Code → Commit → Push → GitHub Actions → Déploiement Automatique sur VPS
```

### 🔍 **Analyse de votre Workflow**

D'après `.github/workflows/deploy.yml`, voici ce qui se passe :

1. **🚀 Déclenchement** : Sur chaque `push` vers la branche `main`
2. **📦 Checkout** : Récupération du code sur un runner Ubuntu
3. **📤 Transfert** : Copie des fichiers vers votre VPS via SCP
4. **🐳 Déploiement** : Exécution de `docker compose up -d --build` sur le serveur

### ⚠️ **Important : Différence avec les Scripts Créés**

| Aspect | Votre CI/CD (GitHub Actions) | Scripts Créés |
|--------|------------------------------|---------------|
| **Déclenchement** | Automatique sur push | Manuel |
| **Environnement** | Production (VPS) | Local/Développement |
| **Usage** | Déploiement final | Tests et développement |
| **Fréquence** | À chaque merge | Quand vous voulez |

## 🚀 **Workflow Recommandé avec vos Scripts**

### 1. **Développement Local**
```bash
# Voir ce qui a changé
./deploy-watch.sh

# Tester localement
./deploy-local.sh

# Ou déployer un service spécifique
./deploy-backend.sh
./deploy-web-client.sh
./deploy-mobile.sh
```

### 2. **Préparation de la PR**
```bash
# Préparer votre Pull Request
./prepare-pr.sh

# Cela vous donnera :
# - Résumé des modifications
# - Template de PR
# - Recommandations de déploiement
```

### 3. **Déploiement Automatique**
```bash
# 1. Commitez vos changements
git add .
git commit -m "Description des modifications"

# 2. Poussez vers votre branche
git push origin votre-branche

# 3. Créez une Pull Request sur GitHub
# 4. Le CI/CD se déclenchera automatiquement
# 5. Mergez quand les tests passent
```

## 🔧 **Configuration de votre VPS**

Votre workflow déploie sur `/srv/projects/livelink` et exécute :

```bash
cd /srv/projects/livelink
docker compose pull
docker compose up -d --build
```

### 📁 **Structure sur le VPS**
```
/srv/projects/livelink/
├── liveshop-backend/
├── web-client/liveshop-client/
├── mobile-app/liveshop-vendor/
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

## 💡 **Optimisations Possibles**

### 1. **Déploiement Sélectif sur le VPS**
Modifiez votre workflow pour ne déployer que les services modifiés :

```yaml
# Dans .github/workflows/deploy.yml
- name: Deploy with SSH
  uses: appleboy/ssh-action@v1.0.3
  with:
    script: |
      cd /srv/projects/livelink
      
      # Déterminer quels services ont changé
      if git diff HEAD~1 --name-only | grep -q "liveshop-backend"; then
        echo "Backend modifié, redémarrage..."
        docker compose up -d --build backend
      fi
      
      if git diff HEAD~1 --name-only | grep -q "web-client"; then
        echo "Web Client modifié, redémarrage..."
        docker compose up -d --build dashboard
      fi
      
      if git diff HEAD~1 --name-only | grep -q "mobile-app"; then
        echo "Mobile App modifiée, redémarrage..."
        docker compose up -d --build mobile
      fi
```

### 2. **Tests Avant Déploiement**
Ajoutez des tests dans votre workflow :

```yaml
- name: Run tests
  run: |
    cd liveshop-backend && npm test
    cd ../web-client/liveshop-client && npm test
    cd ../mobile-app/liveshop-vendor && npm test

- name: Deploy only if tests pass
  if: success()
  # ... votre déploiement
```

### 3. **Notifications**
Ajoutez des notifications Slack/Discord :

```yaml
- name: Notify deployment
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: "Déploiement LiveShop Link ${{ job.status }}"
```

## 🎯 **Quand Utiliser Quoi**

### ✅ **Utilisez les Scripts Locaux Pour :**
- **Développement** : Tester avant de commiter
- **Débogage** : Résoudre des problèmes localement
- **Tests** : Vérifier que tout fonctionne
- **Déploiements d'urgence** : Si le CI/CD est cassé

### ✅ **Laissez GitHub Actions Gérer :**
- **Déploiement en production** : Automatique et fiable
- **Tests automatisés** : Qualité du code
- **Déploiement sur VPS** : Environnement de production
- **Rollback** : Via git revert

## 🔍 **Monitoring de votre Déploiement**

### 1. **Sur GitHub**
- Actions → Voir l'historique des déploiements
- Pull Requests → Statut des checks
- Commits → Statut des workflows

### 2. **Sur votre VPS**
```bash
# Vérifier le statut des services
docker compose ps

# Voir les logs
docker compose logs -f [service]

# Vérifier les ressources
docker stats
```

## 🚨 **Dépannage**

### **Si le déploiement échoue :**
1. Vérifiez les logs GitHub Actions
2. Vérifiez la connectivité SSH vers votre VPS
3. Vérifiez l'espace disque sur le VPS
4. Vérifiez que Docker fonctionne sur le VPS

### **Si un service ne démarre pas :**
1. Utilisez `./deploy-local.sh` pour tester localement
2. Vérifiez les logs Docker sur le VPS
3. Vérifiez les variables d'environnement
4. Testez avec `./deploy-smart.sh` localement

## 📚 **Résumé des Commandes**

```bash
# 🏠 Développement local
./deploy-watch.sh          # Voir les modifications
./deploy-local.sh          # Instructions de redémarrage local
./deploy-smart.sh          # Déploiement local intelligent

# 🔀 Préparation PR
./prepare-pr.sh            # Préparer votre Pull Request

# 🔍 Analyse
./check-ci-cd.sh           # Analyser votre configuration CI/CD

# 🚀 Production (automatique via GitHub Actions)
git push origin main       # Déclenche le déploiement automatique
```

---

**💡 Conseil :** Utilisez les scripts locaux pour le développement, laissez GitHub Actions gérer la production !
