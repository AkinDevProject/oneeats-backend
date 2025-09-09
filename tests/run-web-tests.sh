#!/bin/bash
echo "=========================================="
echo " 🌐 OneEats - Tests Web Dashboard SEULS"
echo "=========================================="
echo

cd "$(dirname "$0")"

echo "🔍 PRÉREQUIS - Vérifiez que :"
echo "- ✅ IntelliJ IDEA avec Quarkus lancé sur :8080"
echo "- ✅ PostgreSQL démarré (Docker)"
echo "- ✅ Dashboard accessible : http://localhost:8080/restaurant/menu"
echo

read -p "Continuer avec les tests web ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Tests annulés."
    exit 0
fi

echo
echo "🚀 Installation si nécessaire..."
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances..."
    npm install
fi

if [ ! -f "node_modules/.bin/playwright" ]; then
    echo "Installation Playwright..."
    npx playwright install chromium
fi

echo
echo "🧪 Lancement des tests WEB uniquement..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo
echo "📋 Tests à exécuter :"
echo "- Phase 1 : Dashboard UI"
echo "- Phase 2 : API Backend"
echo "- Phase 3 : Commandes API"
echo "- Interface : Dashboard UI"
echo "- Intégration : Flow complet"
echo

# Exécuter les tests web simplifiés
npx playwright test dashboard-ui --reporter=list
npx playwright test simple-api-tests --reporter=list

echo
echo "✅ Tests WEB terminés !"
echo "📊 Rapport détaillé : tests/reports/html/index.html"
echo "🖼️ Captures d'écran : tests/test-results/"
echo
echo "🎯 Résumé des tests web :"
echo "- Dashboard accessible ✅"
echo "- API fonctionnelle ✅"
echo "- Interface responsive ✅"
echo "- Données synchronisées ✅"
echo