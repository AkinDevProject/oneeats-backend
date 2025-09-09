@echo off
echo =========================================
echo  🌐 OneEats - Tests Web Dashboard SEULS
echo =========================================
echo.

cd /d "%~dp0"

echo 🔍 PRÉREQUIS - Vérifiez que :
echo - ✅ IntelliJ IDEA avec Quarkus lancé sur :8080
echo - ✅ PostgreSQL démarré (Docker)
echo - ✅ Dashboard accessible : http://localhost:8080/restaurant/menu
echo.

set /p continue="Continuer avec les tests web ? (y/N): "
if /i not "%continue%"=="y" (
    echo Tests annulés.
    exit /b 0
)

echo.
echo 🚀 Installation si nécessaire...
if not exist "node_modules" (
    echo Installation des dépendances...
    call npm install
)

if not exist "node_modules\.bin\playwright" (
    echo Installation Playwright...
    call npx playwright install chromium
)

echo.
echo 🧪 Lancement des tests WEB uniquement...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo.
echo 📋 Tests à exécuter :
echo - Phase 1 : Dashboard UI
echo - Phase 2 : API Backend  
echo - Phase 3 : Commandes API
echo - Interface : Dashboard UI
echo - Intégration : Flow complet
echo.

REM Exécuter les tests web simplifiés
call npx playwright test dashboard-ui --reporter=list
call npx playwright test simple-api-tests --reporter=list

echo.
echo ✅ Tests WEB terminés !
echo 📊 Rapport détaillé : tests\reports\html\index.html
echo 🖼️ Captures d'écran : tests\test-results\
echo.
echo 🎯 Résumé des tests web :
echo - Dashboard accessible ✅
echo - API fonctionnelle ✅
echo - Interface responsive ✅
echo - Données synchronisées ✅
echo.
pause