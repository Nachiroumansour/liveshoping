#!/bin/bash

echo "🔍 Analyse CI/CD - LiveShop Link"
echo "================================"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier la présence de GitHub Actions
if [ -d ".github/workflows" ]; then
    print_success "GitHub Actions détecté !"
    echo ""
    print_status "📁 Workflows disponibles :"
    
    for workflow in .github/workflows/*.yml .github/workflows/*.yaml; do
        if [ -f "$workflow" ]; then
            echo "  - $(basename "$workflow")"
        fi
    done
    
    echo ""
    print_status "🔍 Analyse des workflows :"
    
    for workflow in .github/workflows/*.yml .github/workflows/*.yaml; do
        if [ -f "$workflow" ]; then
            echo ""
            echo "📋 **$(basename "$workflow")** :"
            
            # Extraire les triggers
            if grep -q "on:" "$workflow"; then
                echo "  🚀 Triggers :"
                grep -A 10 "on:" "$workflow" | grep -E "(push|pull_request|workflow_dispatch)" | sed 's/^/    - /'
            fi
            
            # Extraire les jobs
            if grep -q "jobs:" "$workflow"; then
                echo "  ⚙️  Jobs :"
                grep -A 20 "jobs:" "$workflow" | grep "^\s*[a-zA-Z].*:" | head -5 | sed 's/^/    - /'
            fi
            
            # Extraire les étapes de déploiement
            if grep -q "deploy\|docker\|build" "$workflow"; then
                echo "  🚀 Déploiement détecté :"
                grep -i "deploy\|docker\|build" "$workflow" | head -3 | sed 's/^/    - /'
            fi
        fi
    done
else
    print_warning "Aucun GitHub Actions détecté"
fi

# Vérifier la présence d'autres outils CI/CD
echo ""
print_status "🔍 Autres outils CI/CD :"

# Vercel
if [ -f "vercel.json" ]; then
    print_success "Vercel détecté !"
    echo "  - Déploiement automatique sur Vercel"
    echo "  - Se déclenche sur push vers main"
fi

# Netlify
if [ -f "netlify.toml" ] || [ -f "_redirects" ]; then
    print_success "Netlify détecté !"
    echo "  - Déploiement automatique sur Netlify"
    echo "  - Se déclenche sur push vers main"
fi

# Docker Hub
if [ -f "docker-compose.yml" ] || [ -f "Dockerfile" ]; then
    print_status "Docker détecté !"
    echo "  - Images Docker à construire"
    echo "  - Vérifiez si vous avez un registry configuré"
fi

# Vérifier les variables d'environnement
echo ""
print_status "🔐 Variables d'environnement :"

if [ -f ".env.example" ]; then
    print_success ".env.example trouvé"
    echo "  - Variables nécessaires pour le déploiement"
fi

if [ -f ".github/secrets" ] || [ -d ".github/secrets" ]; then
    print_success "Secrets GitHub détectés"
    echo "  - Variables sensibles stockées dans GitHub"
fi

# Vérifier les scripts de déploiement
echo ""
print_status "📜 Scripts de déploiement :"

DEPLOY_SCRIPTS=$(ls deploy*.sh 2>/dev/null | wc -l)
if [ $DEPLOY_SCRIPTS -gt 0 ]; then
    print_success "$DEPLOY_SCRIPTS script(s) de déploiement trouvé(s)"
    echo "  - Ces scripts sont pour le déploiement manuel"
    echo "  - Votre CI/CD utilise probablement d'autres méthodes"
fi

# Explication du workflow
echo ""
print_status "📚 Comment fonctionne votre déploiement :"
echo ""
echo "🔄 **Workflow Automatique (CI/CD) :**"
echo "  1. Vous faites un commit et push"
echo "  2. Vous créez une Pull Request"
echo "  3. Le CI/CD se déclenche automatiquement"
echo "  4. Les tests s'exécutent"
echo "  5. Si les tests passent, le déploiement se fait"
echo "  6. Vous mergez la PR"
echo "  7. Le déploiement en production se fait"
echo ""
echo "🏠 **Déploiement Local (Scripts créés) :**"
echo "  - Pour tester avant de créer la PR"
echo "  - Pour le développement local"
echo "  - Pour le débogage"
echo "  - Pour les déploiements d'urgence"
echo ""

# Recommandations
echo ""
print_status "💡 Recommandations :"
echo ""
echo "✅ **Avant de créer une PR :**"
echo "  - Utilisez ./deploy-watch.sh pour voir les modifications"
echo "  - Utilisez ./deploy-local.sh pour tester localement"
echo "  - Utilisez ./prepare-pr.sh pour préparer votre PR"
echo ""
echo "🚀 **Pour le déploiement :**"
echo "  - Laissez votre CI/CD gérer le déploiement automatique"
echo "  - Les scripts créés sont pour le développement local"
echo "  - Vérifiez que votre pipeline CI/CD est bien configuré"
echo ""
echo "🔍 **Pour comprendre votre CI/CD :**"
echo "  - Regardez dans .github/workflows/"
echo "  - Vérifiez les secrets GitHub"
echo "  - Testez avec une petite PR"
echo ""

print_success "🎉 Analyse CI/CD terminée !"
echo ""
echo "💡 **Prochaines étapes :**"
echo "1. Vérifiez votre configuration CI/CD dans .github/workflows/"
echo "2. Testez avec une petite PR pour voir le déploiement automatique"
echo "3. Utilisez les scripts créés pour le développement local"
echo "4. Configurez des notifications pour vos déploiements"
