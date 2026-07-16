#!/bin/bash

echo "🌐 Déploiement rapide - Landing Page (Web Client)"
echo "================================================="

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

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erreur: docker-compose.yml non trouvé"
    echo "Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

print_status "Arrêt du service dashboard (landing page)..."
docker-compose stop dashboard

print_status "Rebuild de l'image dashboard avec cache bust..."
docker-compose build --no-cache dashboard

print_status "Redémarrage du service dashboard..."
docker-compose up -d dashboard

print_status "Attente du démarrage (10 secondes)..."
sleep 10

print_status "Vérification du statut..."
docker-compose ps dashboard

print_status "Vérification des logs récents..."
docker-compose logs --tail=20 dashboard

print_status "Test de santé de la landing page..."
echo ""
if curl -s -f "https://livelink.store" > /dev/null 2>&1; then
    print_success "Landing Page opérationnelle !"
else
    print_warning "La landing page semble inaccessible, vérification manuelle recommandée"
fi

echo ""
print_success "🎉 Déploiement terminé !"
echo ""
echo "📋 URLs:"
echo "  - Landing Page: https://livelink.store"
echo "  - Dashboard Admin: https://space.livelink.store"
echo "  - Backend API: https://api.livelink.store"
echo ""
print_status "Pour vérifier les logs en temps réel:"
echo "  docker-compose logs -f dashboard"
