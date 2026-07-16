#!/bin/bash

echo "🔀 Préparation de Pull Request - LiveShop Link"
echo "=============================================="

# Configuration
BACKEND_DIR="liveshop-backend"
WEB_CLIENT_DIR="web-client/liveshop-client"
MOBILE_APP_DIR="mobile-app/liveshop-vendor"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier le statut git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Ce n'est pas un dépôt git valide !"
    exit 1
fi

# Vérifier s'il y a des modifications non commitées
if ! git diff-index --quiet HEAD --; then
    print_warning "⚠️  Modifications non commitées détectées !"
    echo ""
    echo "📝 Fichiers modifiés :"
    git diff --name-only
    echo ""
    echo "💡 Commitez d'abord vos modifications :"
    echo "   git add ."
    echo "   git commit -m 'Description des modifications'"
    echo ""
    read -p "Voulez-vous continuer quand même ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Vérifier s'il y a des commits non poussés
if [ "$(git rev-list HEAD..origin/main --count)" -gt 0 ]; then
    print_warning "⚠️  Commits non poussés détectés !"
    echo ""
    echo "📤 Poussez d'abord vos commits :"
    echo "   git push origin main"
    echo ""
    read -p "Voulez-vous continuer quand même ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Analyser les modifications depuis la branche main
print_status "🔍 Analyse des modifications depuis main..."

# Obtenir la branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
MAIN_BRANCH="main"

if [ "$CURRENT_BRANCH" = "$MAIN_BRANCH" ]; then
    print_error "Vous êtes déjà sur la branche main !"
    echo "💡 Créez une nouvelle branche pour votre PR :"
    echo "   git checkout -b feature/nom-de-votre-feature"
    exit 1
fi

# Analyser les différences avec main
print_status "📊 Différences avec $MAIN_BRANCH..."

BACKEND_CHANGES=$(git diff --name-only $MAIN_BRANCH..HEAD | grep "^$BACKEND_DIR/" | wc -l)
WEB_CLIENT_CHANGES=$(git diff --name-only $MAIN_BRANCH..HEAD | grep "^$WEB_CLIENT_DIR/" | wc -l)
MOBILE_APP_CHANGES=$(git diff --name-only $MAIN_BRANCH..HEAD | grep "^$MOBILE_APP_DIR/" | wc -l)

TOTAL_CHANGES=$((BACKEND_CHANGES + WEB_CLIENT_CHANGES + MOBILE_APP_CHANGES))

echo ""
print_status "📈 Résumé des modifications :"
echo "  - Backend: $BACKEND_CHANGES modification(s)"
echo "  - Web Client: $WEB_CLIENT_CHANGES modification(s)"
echo "  - Mobile App: $MOBILE_APP_CHANGES modification(s)"
echo "  - Total: $TOTAL_CHANGES modification(s)"

# Afficher les fichiers modifiés par catégorie
echo ""
if [ $BACKEND_CHANGES -gt 0 ]; then
    print_status "🔧 Modifications Backend :"
    git diff --name-only $MAIN_BRANCH..HEAD | grep "^$BACKEND_DIR/" | sed 's/^/  - /'
    echo ""
fi

if [ $WEB_CLIENT_CHANGES -gt 0 ]; then
    print_status "🌐 Modifications Web Client :"
    git diff --name-only $MAIN_BRANCH..HEAD | grep "^$WEB_CLIENT_DIR/" | sed 's/^/  - /'
    echo ""
fi

if [ $MOBILE_APP_CHANGES -gt 0 ]; then
    print_status "📱 Modifications Mobile App :"
    git diff --name-only $MAIN_BRANCH..HEAD | grep "^$MOBILE_APP_DIR/" | sed 's/^/  - /'
    echo ""
fi

# Recommandations pour la PR
echo ""
print_status "🚀 Recommandations pour votre Pull Request :"

if [ $BACKEND_CHANGES -gt 0 ]; then
    echo ""
    echo "🔧 **Backend modifié** :"
    echo "  - ✅ Testez l'API localement avant de créer la PR"
    echo "  - ✅ Vérifiez que les migrations sont compatibles"
    echo "  - ✅ Assurez-vous que les tests passent"
    echo "  - ⚠️  Déployez d'abord le backend, puis les clients"
fi

if [ $WEB_CLIENT_CHANGES -gt 0 ]; then
    echo ""
    echo "🌐 **Web Client modifié** :"
    echo "  - ✅ Testez l'interface localement"
    echo "  - ✅ Vérifiez la compatibilité avec l'API"
    echo "  - ✅ Testez sur différents navigateurs"
fi

if [ $MOBILE_APP_CHANGES -gt 0 ]; then
    echo ""
    echo "📱 **Mobile App modifiée** :"
    echo "  - ✅ Testez sur différents appareils"
    echo "  - ✅ Vérifiez la compatibilité avec l'API"
    echo "  - ✅ Testez les fonctionnalités offline"
fi

# Générer le template de PR
echo ""
print_status "📝 Template de Pull Request :"
echo ""

PR_TITLE=""
if [ $BACKEND_CHANGES -gt 0 ] && [ $WEB_CLIENT_CHANGES -gt 0 ] && [ $MOBILE_APP_CHANGES -gt 0 ]; then
    PR_TITLE="🔄 Mise à jour complète : Backend, Web Client et Mobile App"
elif [ $BACKEND_CHANGES -gt 0 ] && [ $WEB_CLIENT_CHANGES -gt 0 ]; then
    PR_TITLE="🔧 Mise à jour : Backend et Web Client"
elif [ $BACKEND_CHANGES -gt 0 ] && [ $MOBILE_APP_CHANGES -gt 0 ]; then
    PR_TITLE="🔧 Mise à jour : Backend et Mobile App"
elif [ $WEB_CLIENT_CHANGES -gt 0 ] && [ $MOBILE_APP_CHANGES -gt 0 ]; then
    PR_TITLE="🌐 Mise à jour : Web Client et Mobile App"
elif [ $BACKEND_CHANGES -gt 0 ]; then
    PR_TITLE="🔧 Mise à jour Backend"
elif [ $WEB_CLIENT_CHANGES -gt 0 ]; then
    PR_TITLE="🌐 Mise à jour Web Client"
elif [ $MOBILE_APP_CHANGES -gt 0 ]; then
    PR_TITLE="📱 Mise à jour Mobile App"
else
    PR_TITLE="📝 Mise à jour divers"
fi

echo "**Titre de la PR :**"
echo "$PR_TITLE"
echo ""

echo "**Description :**"
echo "## 📋 Résumé des modifications"
echo ""
if [ $BACKEND_CHANGES -gt 0 ]; then
    echo "- 🔧 **Backend** : $BACKEND_CHANGES modification(s)"
fi
if [ $WEB_CLIENT_CHANGES -gt 0 ]; then
    echo "- 🌐 **Web Client** : $WEB_CLIENT_CHANGES modification(s)"
fi
if [ $MOBILE_APP_CHANGES -gt 0 ]; then
    echo "- 📱 **Mobile App** : $MOBILE_APP_CHANGES modification(s)"
fi
echo ""
echo "## 🧪 Tests effectués"
echo "- [ ] Tests locaux réussis"
echo "- [ ] Compatibilité API vérifiée"
echo "- [ ] Tests de régression effectués"
echo ""
echo "## 🚀 Impact du déploiement"
echo "- **Services affectés** : [Listez les services]"
echo "- **Ordre de déploiement recommandé** : [Backend → Clients]"
echo "- **Rollback possible** : [Oui/Non]"
echo ""
echo "## 📝 Notes supplémentaires"
echo "[Ajoutez ici toute information importante]"

echo ""
print_success "🎉 Template de PR généré !"
echo ""
echo "💡 **Prochaines étapes :**"
echo "1. Copiez le template ci-dessus"
echo "2. Créez votre Pull Request sur GitHub"
echo "3. Collez le template dans la description"
echo "4. Assignez les reviewers appropriés"
echo "5. Le CI/CD se déclenchera automatiquement"
echo ""
echo "🔗 **Liens utiles :**"
echo "- GitHub Actions: .github/workflows/"
echo "- Déploiement: Vérifiez votre pipeline CI/CD"
echo "- Monitoring: Surveillez le déploiement"
