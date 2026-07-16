#!/bin/bash

echo "🚨 DÉPLOIEMENT D'URGENCE - CORRECTION CORS ET SERVEUR"
echo "======================================================"

# 1. Committer les changements
echo "📝 Committing les corrections..."
git add .
git commit -m "URGENT: Fix CORS et serveur - Accepter toutes les origines"

# 2. Pousser vers develop
echo "📤 Pushing vers develop..."
git push origin develop

# 3. Créer un PR vers main pour déclencher le déploiement
echo "🔄 Création d'une branche de déploiement..."
git checkout -b urgent-cors-fix
git push origin urgent-cors-fix

echo ""
echo "✅ Déploiement déclenché !"
echo ""
echo "🔧 Instructions pour le serveur VPS :"
echo "====================================="
echo ""
echo "1. Connectez-vous à votre VPS :"
echo "   ssh root@votre-vps-ip"
echo ""
echo "2. Allez dans le dossier du projet :"
echo "   cd /root/liveshop-link/liveshop-backend"
echo ""
echo "3. Créez le fichier .env avec ces variables :"
echo "   cat > .env << 'EOF'"
echo "NODE_ENV=production"
echo "DATABASE_URL=postgresql://postgres:manou24680@db.yxdapixcnkytpspbqiga.supabase.co:5432/postgres"
echo "SUPABASE_URL=https://yxdapixcnkytpspbqiga.supabase.co"
echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZGFwaXhjbmt5dHBzcGJxaWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzQ5NzQsImV4cCI6MjA1MTA1MDk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
echo "SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZGFwaXhjbmt5dHBzcGJxaWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ3NDk3NCwiZXhwIjoyMDUxMDUwOTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
echo "JWT_SECRET=liveshop_jwt_secret_2024_very_long_and_secure_key_for_production"
echo "CORS_ORIGIN=https://livelink.store,https://space.livelink.store"
echo "DEBUG=true"
echo "EOF"
echo ""
echo "4. Redémarrez le service :"
echo "   sudo systemctl restart liveshop-backend"
echo ""
echo "5. Vérifiez les logs :"
echo "   sudo journalctl -u liveshop-backend -f"
echo ""
echo "6. Testez l'API :"
echo "   curl https://api.livelink.store/api/health"
echo ""
echo "🎯 Le serveur devrait maintenant fonctionner !" 