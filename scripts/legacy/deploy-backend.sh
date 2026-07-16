#!/bin/bash

echo "🔧 Déploiement rapide - Backend LiveShop"
echo "========================================"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_status "Arrêt du service backend..."
docker-compose stop backend

print_status "Rebuild de l'image backend..."
docker-compose build --no-cache backend

print_status "Redémarrage du service backend..."
docker-compose up -d backend

print_status "Attente du démarrage..."
sleep 3

print_status "Vérification du statut..."
docker-compose ps backend

print_status "Test de santé du backend..."
if curl -s -f "http://localhost:3001/health" > /dev/null 2>&1; then
    print_success "Backend opérationnel !"
else
    print_status "Vérification manuelle recommandée"
fi

echo ""
print_success "🎉 Backend déployé avec succès !"
echo "📋 URL: https://api.livelink.store"
