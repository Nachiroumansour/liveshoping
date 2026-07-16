#!/bin/bash

echo "🚀 Déploiement Production avec système de commentaires..."
echo "======================================================"

# Variables - À MODIFIER AVEC VOS VRAIES INFORMATIONS
SERVER_IP="fitsen.tech"  # Remplacez par votre vraie IP
SSH_USER="root"          # Remplacez par votre user SSH
PROJECT_PATH="/var/www/liveshop-link"  # Vérifiez le chemin

echo "📋 Étape 1: Déploiement des fichiers..."
# Copier les fichiers modifiés
scp -r liveshop-backend/src/models/Comment.js $SSH_USER@$SERVER_IP:$PROJECT_PATH/liveshop-backend/src/models/
scp -r liveshop-backend/src/models/index.js $SSH_USER@$SERVER_IP:$PROJECT_PATH/liveshop-backend/src/models/
scp -r liveshop-backend/src/routes/orders.js $SSH_USER@$SERVER_IP:$PROJECT_PATH/liveshop-backend/src/routes/
scp -r liveshop-backend/src/routes/public.js $SSH_USER@$SERVER_IP:$PROJECT_PATH/liveshop-backend/src/routes/
scp -r liveshop-backend/src/scripts/migrate-production.js $SSH_USER@$SERVER_IP:$PROJECT_PATH/liveshop-backend/src/scripts/

echo "📋 Étape 2: Connexion au serveur..."
ssh $SSH_USER@$SERVER_IP << 'EOF'
cd /var/www/liveshop-link

echo "📋 Étape 3: Arrêt du backend..."
docker compose stop backend

echo "📋 Étape 4: Migration de la base de données..."
cd liveshop-backend
export NODE_ENV=production
export DATABASE_URL="postgresql://liveshop_user:motdepassefort@fitsen-postgresql:5432/liveshop"

echo "🔍 Vérification de la base PostgreSQL..."
node src/scripts/migrate-production.js

echo "📋 Étape 5: Redémarrage du backend..."
cd ..
docker compose up -d backend

echo "📋 Étape 6: Vérification du statut..."
docker compose ps backend

echo "📋 Étape 7: Test de la santé du backend..."
sleep 10
curl -f http://localhost:3001/health || echo "❌ Backend pas encore prêt"

echo "🎉 Déploiement terminé !"
EOF

echo "✅ Déploiement terminé !"
echo "🔍 Vérifiez les logs avec: ssh $SSH_USER@$SERVER_IP 'docker compose logs -f backend'"
