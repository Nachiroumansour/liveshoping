#!/bin/bash

echo "🌱 Seeding Manuel - LiveShop Link"
echo "=================================="

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

# Vérifier que Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution"
    exit 1
fi

# Vérifier que les conteneurs sont en cours d'exécution
print_status "🔍 Vérification des conteneurs..."
if ! docker compose ps | grep -q "backend.*Up"; then
    echo "❌ Le conteneur backend n'est pas en cours d'exécution"
    echo "💡 Démarrez d'abord vos services avec: docker compose up -d"
    exit 1
fi

print_success "✅ Conteneur backend en cours d'exécution"

# Options de seeding
echo ""
echo "🎯 Options de seeding disponibles :"
echo "1. 🌱 Seeding complet (vendeurs + produits)"
echo "2. 🏪 Seeding vendeurs uniquement"
echo "3. 📦 Seeding produits uniquement"
echo "4. 🔄 Reset complet (ATTENTION: supprime tout!)"
echo ""

read -p "Choisissez une option (1-4): " choice

case $choice in
    1)
        print_status "🌱 Seeding complet en cours..."
        docker compose exec -T backend node src/scripts/seed-production.js
        ;;
    2)
        print_status "🏪 Seeding vendeurs uniquement..."
        docker compose exec -T backend node -e "
          const { seedProduction } = require('./src/scripts/seed-production');
          seedProduction().then(() => console.log('✅ Seeding vendeurs terminé'));
        "
        ;;
    3)
        print_status "📦 Seeding produits uniquement..."
        docker compose exec -T backend node -e "
          const { seedProduction } = require('./src/scripts/seed-production');
          seedProduction().then(() => console.log('✅ Seeding produits terminé'));
        "
        ;;
    4)
        print_warning "🚨 ATTENTION: Reset complet va supprimer TOUTES les données!"
        read -p "Êtes-vous sûr ? (oui/non): " confirm
        if [ "$confirm" = "oui" ]; then
            print_status "🗑️ Reset complet en cours..."
            docker compose exec -T backend node -e "
              const { sequelize } = require('./src/config/database');
              sequelize.sync({ force: true }).then(() => {
                console.log('✅ Base de données réinitialisée');
                require('./src/scripts/seed-production').seedProduction();
              });
            "
        else
            echo "❌ Reset annulé"
            exit 0
        fi
        ;;
    *)
        echo "❌ Option invalide"
        exit 1
        ;;
esac

echo ""
print_success "🎉 Seeding terminé !"
echo ""
echo "💡 URLs de test :"
echo "  - Boutique Mode Paris: https://livelink.store/boutique-mode-paris"
echo "  - Tech Store Dakar: https://livelink.store/tech-store-dakar"
echo "  - Artisanat Local: https://livelink.store/artisanat-local"
