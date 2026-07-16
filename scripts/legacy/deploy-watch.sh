#!/bin/bash

echo "👀 Surveillance des modifications - LiveShop Link"
echo "==============================================="

# Configuration
BACKEND_DIR="liveshop-backend"
WEB_CLIENT_DIR="web-client/liveshop-client"
MOBILE_APP_DIR="mobile-app/liveshop-vendor"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Fonction pour vérifier les modifications depuis le dernier commit
check_changes() {
    local dir=$1
    local service_name=$2
    
    if [ -d "$dir" ]; then
        # Vérifier les modifications depuis le dernier commit
        local changes=$(git diff --name-only HEAD~1 | grep "^$dir/" | wc -l)
        local staged=$(git diff --cached --name-only | grep "^$dir/" | wc -l)
        local untracked=$(git ls-files --others --exclude-standard | grep "^$dir/" | wc -l)
        
        local total=$((changes + staged + untracked))
        
        if [ $total -gt 0 ]; then
            print_warning "$service_name: $total modification(s) détectée(s)"
            echo "  - Modifiés: $changes"
            echo "  - Stagés: $staged"
            echo "  - Non suivis: $untracked"
            return 0
        else
            print_success "$service_name: Aucune modification"
            return 1
        fi
    fi
}

# Fonction pour afficher les fichiers modifiés
show_changed_files() {
    local dir=$1
    local service_name=$2
    
    echo ""
    print_status "📁 Fichiers modifiés dans $service_name :"
    
    # Fichiers modifiés depuis le dernier commit
    local modified=$(git diff --name-only HEAD~1 | grep "^$dir/")
    if [ ! -z "$modified" ]; then
        echo "  🔄 Modifiés depuis le dernier commit :"
        echo "$modified" | sed 's/^/    - /'
    fi
    
    # Fichiers stagés
    local staged=$(git diff --cached --name-only | grep "^$dir/")
    if [ ! -z "$staged" ]; then
        echo "  📦 Stagés :"
        echo "$staged" | sed 's/^/    - /'
    fi
    
    # Fichiers non suivis
    local untracked=$(git ls-files --others --exclude-standard | grep "^$dir/")
    if [ ! -z "$untracked" ]; then
        echo "  🆕 Non suivis :"
        echo "$untracked" | sed 's/^/    - /'
    fi
}

# Vérifier le statut git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Ce n'est pas un dépôt git valide !"
    exit 1
fi

# Vérifier s'il y a des commits
if git rev-list --count HEAD 2>/dev/null | grep -q "^0$"; then
    print_warning "Aucun commit trouvé. Vérifiez l'historique git."
    exit 1
fi

echo ""
print_status "🔍 Vérification des modifications depuis le dernier commit..."

# Vérifier chaque service
BACKEND_CHANGED=false
WEB_CLIENT_CHANGED=false
MOBILE_APP_CHANGED=false

if check_changes "$BACKEND_DIR" "Backend"; then
    BACKEND_CHANGED=true
    show_changed_files "$BACKEND_DIR" "Backend"
fi

if check_changes "$WEB_CLIENT_DIR" "Web Client"; then
    WEB_CLIENT_CHANGED=true
    show_changed_files "$WEB_CLIENT_DIR" "Web Client"
fi

if check_changes "$MOBILE_APP_DIR" "Mobile App"; then
    MOBILE_APP_CHANGED=true
    show_changed_files "$MOBILE_APP_DIR" "Mobile App"
fi

# Résumé et recommandations
echo ""
print_status "📊 Résumé des modifications :"
echo "  - Backend: $([ "$BACKEND_CHANGED" = true ] && echo "🔄 Modifié" || echo "✅ Aucune modification")"
echo "  - Web Client: $([ "$WEB_CLIENT_CHANGED" = true ] && echo "🔄 Modifié" || echo "✅ Aucune modification")"
echo "  - Mobile App: $([ "$MOBILE_APP_CHANGED" = true ] && echo "🔄 Modifiée" || echo "✅ Aucune modification")"

echo ""
print_status "🚀 Recommandations de déploiement :"

if [ "$BACKEND_CHANGED" = true ]; then
    echo "  🔧 Backend modifié → ./deploy-backend.sh"
fi

if [ "$WEB_CLIENT_CHANGED" = true ]; then
    echo "  🌐 Web Client modifié → ./deploy-web-client.sh"
fi

if [ "$MOBILE_APP_CHANGED" = true ]; then
    echo "  📱 Mobile App modifiée → ./deploy-mobile.sh"
fi

if [ "$BACKEND_CHANGED" = true ] || [ "$WEB_CLIENT_CHANGED" = true ] || [ "$MOBILE_APP_CHANGED" = true ]; then
    echo ""
    echo "  🧠 Déploiement intelligent → ./deploy-smart.sh"
    echo "  🚀 Déploiement complet → ./deploy.sh"
else
    echo ""
    print_success "Aucun déploiement nécessaire !"
fi

echo ""
print_status "💡 Commandes utiles :"
echo "  - Voir les logs: docker-compose logs [service]"
echo "  - Statut des services: docker-compose ps"
echo "  - Redémarrer un service: docker-compose restart [service]"
echo "  - Voir les modifications: git diff HEAD~1"
