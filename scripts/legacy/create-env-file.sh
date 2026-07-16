#!/bin/bash

echo "🔧 Création du fichier .env pour la production..."
echo "=================================================="

# Créer le fichier .env dans le backend
cat > liveshop-backend/.env << 'EOF'
# Configuration de production pour LiveShop Link
NODE_ENV=production

# Base de données Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:manou24680@db.yxdapixcnkytpspbqiga.supabase.co:5432/postgres

# Configuration Supabase
SUPABASE_URL=https://yxdapixcnkytpspbqiga.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZGFwaXhjbmt5dHBzcGJxaWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZGFwaXhjbmt5dHBzcGJxaWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ3NDk3NCwiZXhwIjoyMDUxMDUwOTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8

# Sécurité
JWT_SECRET=liveshop_jwt_secret_2024_very_long_and_secure_key_for_production

# CORS
CORS_ORIGIN=https://livelink.store,https://space.livelink.store

# Debug
DEBUG=true

# Port
PORT=3001
EOF

echo "✅ Fichier .env créé dans liveshop-backend/.env"
echo ""
echo "📋 Contenu du fichier .env :"
echo "============================"
cat liveshop-backend/.env
echo ""
echo "🚀 Maintenant vous pouvez :"
echo "1. Committer ce fichier (s'il n'est pas dans .gitignore)"
echo "2. Ou le copier manuellement sur votre serveur VPS"
echo "3. Redémarrer le service backend"
echo ""
echo "🔧 Pour copier sur le serveur :"
echo "scp liveshop-backend/.env root@votre-vps-ip:/root/liveshop-link/liveshop-backend/.env" 