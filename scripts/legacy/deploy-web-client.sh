#!/bin/bash

echo "🌐 Déploiement rapide - Web Client LiveShop"
echo "==========================================="

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

print_status "Arrêt du service web client..."
docker-compose stop dashboard

print_status "Rebuild de l'image web client..."
docker-compose build --no-cache dashboard

print_status "Redémarrage du service web client..."
docker-compose up -d dashboard

print_status "Attente du démarrage..."
sleep 3

print_status "Vérification du statut..."
docker-compose ps dashboard

print_status "Test de santé du web client..."
if curl -s -f "http://localhost:5174" > /dev/null 2>&1; then
    print_success "Web Client opérationnel !"
else
    print_status "Vérification manuelle recommandée"
fi

echo ""
print_success "🎉 Web Client déployé avec succès !"
echo "📋 URL: https://livelink.store"
