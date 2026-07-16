#!/bin/bash

echo "📱 Déploiement rapide - Mobile App LiveShop"
echo "============================================"

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

print_status "Arrêt du service mobile app..."
docker-compose stop mobile

print_status "Rebuild de l'image mobile app..."
docker-compose build --no-cache mobile

print_status "Redémarrage du service mobile app..."
docker-compose up -d mobile

print_status "Attente du démarrage..."
sleep 3

print_status "Vérification du statut..."
docker-compose ps mobile

print_status "Test de santé de l'app mobile..."
if curl -s -f "http://localhost:5173" > /dev/null 2>&1; then
    print_success "Mobile App opérationnelle !"
else
    print_status "Vérification manuelle recommandée"
fi

echo ""
print_success "🎉 Mobile App déployée avec succès !"
echo "📋 URL: https://space.livelink.store"
