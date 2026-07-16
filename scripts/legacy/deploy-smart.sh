#!/bin/bash

echo "🧠 Déploiement intelligent - LiveShop Link"
echo "=========================================="

# Configuration
BACKEND_DIR="liveshop-backend"
WEB_CLIENT_DIR="web-client/liveshop-client"
MOBILE_APP_DIR="mobile-app/liveshop-vendor"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
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

# Fonction pour vérifier si un dossier a des modifications
has_changes() {
    local dir=$1
    if [ -d "$dir" ]; then
        # Vérifier s'il y a des fichiers modifiés, ajoutés ou supprimés
        if git diff --name-only HEAD~1 | grep -q "^$dir/" || \
           git diff --cached --name-only | grep -q "^$dir/" || \
           git ls-files --others --exclude-standard | grep -q "^$dir/"; then
            return 0 # true - il y a des modifications
        fi
    fi
    return 1 # false - pas de modifications
}

# Fonction pour déployer un service spécifique
deploy_service() {
    local service_name=$1
    local service_dir=$2
    
    print_status "Déploiement de $service_name..."
    
    # Arrêter le service spécifique
    docker-compose stop $service_name
    
    # Rebuilder l'image
    docker-compose build --no-cache $service_name
    
    # Redémarrer le service
    docker-compose up -d $service_name
    
    print_success "$service_name déployé avec succès !"
}

# Vérifier le statut git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Ce n'est pas un dépôt git valide !"
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

# Afficher le résumé des modifications
echo ""
print_status "📊 Résumé des modifications détectées :"
echo "  - Backend: $([ "$BACKEND_CHANGED" = true ] && echo "🔄 Modifié" || echo "✅ Aucune modification")"
echo "  - Web Client: $([ "$WEB_CLIENT_CHANGED" = true ] && echo "🔄 Modifié" || echo "✅ Aucune modification")"
echo "  - Mobile App: $([ "$MOBILE_APP_CHANGED" = true ] && echo "🔄 Modifiée" || echo "✅ Aucune modification")"

# Déterminer la stratégie de déploiement
if [ "$BACKEND_CHANGED" = false ] && [ "$WEB_CLIENT_CHANGED" = false ] && [ "$MOBILE_APP_CHANGED" = false ]; then
    print_warning "Aucune modification détectée. Déploiement complet recommandé."
    echo ""
    echo "Options disponibles :"
    echo "  1. Déploiement complet (recommandé)"
    echo "  2. Déploiement sélectif forcé"
    echo "  3. Annuler"
    echo ""
    read -p "Votre choix (1-3): " choice
    
    case $choice in
        1)
            print_status "🚀 Déploiement complet..."
            docker-compose down
            docker-compose build --no-cache
            docker-compose up -d
            ;;
        2)
            print_warning "Déploiement sélectif forcé..."
            BACKEND_CHANGED=true
            WEB_CLIENT_CHANGED=true
            MOBILE_APP_CHANGED=true
            ;;
        3)
            print_status "Déploiement annulé."
            exit 0
            ;;
        *)
            print_error "Choix invalide. Déploiement annulé."
            exit 1
            ;;
    esac
fi

# Déploiement sélectif
echo ""
print_status "🚀 Déploiement sélectif en cours..."

if [ "$BACKEND_CHANGED" = true ]; then
    deploy_service "backend" "$BACKEND_DIR"
fi

if [ "$WEB_CLIENT_CHANGED" = true ]; then
    deploy_service "dashboard" "$WEB_CLIENT_DIR"
fi

if [ "$MOBILE_APP_CHANGED" = true ]; then
    deploy_service "mobile" "$MOBILE_APP_DIR"
fi

# Vérifier le statut final
echo ""
print_status "🔍 Vérification du statut des services..."
docker-compose ps

# Attendre que les services soient prêts
print_status "⏳ Attente du démarrage des services..."
sleep 5

# Test de santé des services
echo ""
print_status "🏥 Test de santé des services..."

# Test du backend
if curl -s -f "http://localhost:3001/health" > /dev/null 2>&1; then
    print_success "Backend: ✅ Opérationnel"
else
    print_warning "Backend: ⚠️  Vérification manuelle recommandée"
fi

# Test du web client
if curl -s -f "http://localhost:5174" > /dev/null 2>&1; then
    print_success "Web Client: ✅ Opérationnel"
else
    print_warning "Web Client: ⚠️  Vérification manuelle recommandée"
fi

echo ""
print_success "🎉 Déploiement sélectif terminé !"
echo ""
echo "📋 URLs de test :"
echo "  - Backend API: https://api.livelink.store"
echo "  - Web Client: https://livelink.store"
echo "  - Mobile App: https://space.livelink.store"
echo ""
echo "💡 Conseil : Utilisez 'docker-compose logs [service]' pour vérifier les logs"
