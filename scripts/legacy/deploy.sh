#!/bin/bash

echo "🚀 Déploiement de LiveShop Link..."

# Arrêter les conteneurs existants
echo "📦 Arrêt des conteneurs existants..."
docker-compose down

# Rebuilder les images avec la nouvelle configuration nginx
echo "🔨 Rebuild des images..."
docker-compose build --no-cache dashboard mobile

# Redémarrer les services
echo "🔄 Redémarrage des services..."
docker-compose up -d

# Vérifier le statut
echo "✅ Vérification du statut..."
docker-compose ps

echo "🎉 Déploiement terminé !"
echo ""
echo "📋 URLs de test :"
echo "- Espace vendeur: https://space.livelink.store"
echo "- Web-client: https://livelink.store"
echo "- API: https://api.livelink.store"
echo ""
echo "🔍 Testez le routing SPA en actualisant les pages !" 