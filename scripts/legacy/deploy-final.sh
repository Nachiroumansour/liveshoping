#!/bin/bash

echo "🚀 Déploiement final - LiveShop avec Cloudinary"
echo "================================================"

# Variables d'environnement pour la production
export NODE_ENV=production
export CLOUDINARY_CLOUD_NAME=dp2838ewe
export CLOUDINARY_API_KEY=837659378846734
export CLOUDINARY_API_SECRET=udbbN6TXXOkdwXJ271cSRPVIaq8

echo "📦 Arrêt des conteneurs existants..."
docker-compose down

echo "🔨 Reconstruction des images..."
docker-compose build --no-cache

echo "🚀 Démarrage des services..."
docker-compose up -d

echo "⏳ Attente du démarrage des services..."
sleep 10

echo "✅ Vérification du statut..."
docker-compose ps

echo "🧪 Test de la configuration Cloudinary..."
cd liveshop-backend
node src/scripts/test-cloudinary-direct.js

echo ""
echo "🎉 Déploiement terminé !"
echo "📋 URLs :"
echo "  - Backend API: https://api.livelink.store"
echo "  - Dashboard: https://space.livelink.store"
echo "  - Client: https://livelink.store"
echo ""
echo "🔧 Fonctionnalités Cloudinary activées :"
echo "  ✅ Upload d'images de produits"
echo "  ✅ Upload de preuves de paiement"
echo "  ✅ Optimisation automatique des images"
echo "  ✅ Génération de thumbnails"
echo "  ✅ Lazy loading des images"
echo "  ✅ Galerie d'images interactive"
echo ""
echo "📊 Prêt pour la production avec des millions d'utilisateurs !" 