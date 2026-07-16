#!/bin/bash

echo "🏠 Déploiement Local - LiveShop Link"
echo "===================================="

# Configuration
BACKEND_DIR="liveshop-backend"
WEB_CLIENT_DIR="web-client/liveshop-client"
MOBILE_APP_DIR="mobile-app/liveshop-vendor"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# Fonction pour vérifier si un dossier a des modifications
has_changes() {
    local dir=$1
    if [ -d "$dir" ]; then
        if git diff --name-only HEAD~1 | grep -q "^$dir/" || \
           git diff --cached --name-only | grep -q "^$dir/" || \
           git ls-files --others --exclude-standard | grep -q "^$dir/"; then
            return 0
        fi
    fi
    return 1
}

# Fonction pour redémarrer un service local
restart_local_service() {
    local service_name=$1
    local service_dir=$2
    
    print_status "Redémarrage de $service_name..."
    
    # Vérifier si le service est en cours d'exécution
    if pgrep -f "$service_name" > /dev/null; then
        print_status "Arrêt de $service_name..."
        pkill -f "$service_name"
        sleep 2
    fi
    
    print_success "$service_name redémarré !"
}

# Vérifier le statut git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Ce n'est pas un dépôt git valide !"
    exit 1
fi

# Détecter les modifications
print_status "🔍 Détection des projets modifiés..."

BACKEND_CHANGED=false
WEB_CLIENT_CHANGED=false
MOBILE_APP_CHANGED=false

if has_changes "$BACKEND_DIR"; then
    BACKEND_CHANGED=true
    print_warning "Backend modifié détecté"
fi

if has_changes "$WEB_CLIENT_DIR"; then
    WEB_CLIENT_CHANGED=true
    print_warning "Web Client modifié détecté"
fi

if has_changes "$MOBILE_APP_DIR"; then
    MOBILE_APP_CHANGED=true
    print_warning "Mobile App modifiée détectée"
fi

# Afficher le résumé
echo ""
print_status "📊 Résumé des modifications détectées :"
echo "  - Backend: $([ "$BACKEND_CHANGED" = true ] && echo "🔄 Modifié" || echo "✅ Aucune modification")"
echo "  - Web Client: $([ "$WEB_CLIENT_CHANGED" = true ] && echo "🔄 Modifié" || echo "✅ Aucune modification")"
echo "  - Mobile App: $([ "$MOBILE_APP_CHANGED" = true ] && echo "🔄 Modifiée" || echo "✅ Aucune modification")"

# Instructions de redémarrage local
echo ""
print_status "🏠 Instructions de redémarrage local :"

if [ "$BACKEND_CHANGED" = true ]; then
    echo ""
    echo "🔧 Backend modifié :"
    echo "  cd $BACKEND_DIR"
    echo "  npm install (si package.json modifié)"
    echo "  npm start"
    echo "  ou"
    echo "  node src/app.js"
fi

if [ "$WEB_CLIENT_CHANGED" = true ]; then
    echo ""
    echo "🌐 Web Client modifié :"
    echo "  cd $WEB_CLIENT_DIR"
    echo "  npm install (si package.json modifié)"
    echo "  npm run dev"
fi

if [ "$MOBILE_APP_CHANGED" = true ]; then
    echo ""
    echo "📱 Mobile App modifiée :"
    echo "  cd $MOBILE_APP_DIR"
    echo "  npm install (si package.json modifié)"
    echo "  npm run dev"
fi

if [ "$BACKEND_CHANGED" = false ] && [ "$WEB_CLIENT_CHANGED" = false ] && [ "$MOBILE_APP_CHANGED" = false ]; then
    echo ""
    print_success "Aucune modification détectée. Aucun redémarrage nécessaire !"
fi

echo ""
print_status "💡 Commandes utiles :"
echo "  - Vérifier les modifications: ./deploy-watch.sh"
echo "  - Déploiement production: ./deploy-smart.sh"
echo "  - Voir les logs: tail -f [service]/logs/*.log"
echo "  - Statut des processus: ps aux | grep node"
echo ""
print_success "🎉 Instructions de déploiement local terminées !"
