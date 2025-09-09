#!/bin/bash
echo "======================================"
echo " 🤖 OneEats - Tests Automatisés E2E"
echo "======================================"
echo

cd "$(dirname "$0")"

echo "🚀 Installation des dépendances..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "🎭 Installation Playwright browsers..."
npx playwright install chromium
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation Playwright"
    exit 1
fi

echo
echo "🔍 Vérification des prérequis..."
echo "- ✅ Quarkus lancé depuis IntelliJ IDEA sur http://localhost:8080"
echo "- ✅ Quinoa intégré sert le dashboard sur http://localhost:8080/restaurant"
echo "- ✅ Base de données PostgreSQL démarrée (Docker)"
echo
echo "⚠️  IMPORTANT: Assurez-vous que Quarkus est lancé depuis IntelliJ !"
echo

read -p "Continuer avec les tests ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Tests annulés."
    exit 0
fi

echo
echo "🧪 Lancement des tests automatisés..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npm test

echo
echo "✅ Tests terminés !"
echo "📊 Consultez le rapport HTML : tests/reports/html/index.html"
echo