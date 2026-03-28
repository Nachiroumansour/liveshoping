#!/bin/bash
# Script à exécuter après un déploiement pour notifier les vendeurs
# Usage: ./scripts/notify-update.sh [message optionnel]

API_URL="${API_URL:-https://api.livelink.store}"
DEPLOY_SECRET="${DEPLOY_SECRET:-liveshop-deploy-2024}"
MESSAGE="${1:-Nouvelle version disponible ! Ouvrez l'app pour profiter des améliorations.}"

echo "📢 Envoi notification de mise à jour à tous les vendeurs..."

curl -s -X POST "$API_URL/api/push/notify-update" \
  -H "Content-Type: application/json" \
  -H "X-Deploy-Secret: $DEPLOY_SECRET" \
  -d "{\"message\": \"$MESSAGE\"}" | python3 -m json.tool 2>/dev/null || echo "(réponse brute ci-dessus)"

echo ""
echo "✅ Done"
