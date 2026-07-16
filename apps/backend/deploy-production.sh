#!/bin/bash

echo "🚀 Déploiement en production..."

# Variables d'environnement pour la production
export NODE_ENV=production
export CLOUDINARY_CLOUD_NAME=dp2838ewe
export CLOUDINARY_API_KEY=837659378846734
export CLOUDINARY_API_SECRET=udbbN6TXXOkdwXJ271cSRPVIaq8

# Arrêter les conteneurs existants
echo "📦 Arrêt des conteneurs existants..."
docker-compose down

# Reconstruire les images
echo "🔨 Reconstruction des images..."
docker-compose build --no-cache

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# Vérifier le statut
echo "✅ Vérification du statut..."
docker-compose ps

echo "🎉 Déploiement terminé !"
echo "📋 URLs :"
echo "  - Backend API: https://api.livelink.store"
echo "  - Dashboard: https://space.livelink.store"
echo "  - Client: https://livelink.store" 