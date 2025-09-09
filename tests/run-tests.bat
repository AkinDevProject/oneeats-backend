@echo off
echo ====================================
echo  🤖 OneEats - Tests Automatisés E2E
echo ====================================
echo.

cd /d "%~dp0"

echo 🚀 Installation des dépendances...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances
    exit /b 1
)

echo 🎭 Installation Playwright browsers...
call npx playwright install chromium
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de l'installation Playwright
    exit /b 1
)

echo.
echo 🔍 Vérification des prérequis...
echo - ✅ Quarkus lancé depuis IntelliJ IDEA sur http://localhost:8080
echo - ✅ Quinoa intégré sert le dashboard sur http://localhost:8080/restaurant
echo - ✅ Base de données PostgreSQL démarrée (Docker)
echo.
echo ⚠️  IMPORTANT: Assurez-vous que Quarkus est lancé depuis IntelliJ !
echo.

set /p continue="Continuer avec les tests ? (y/N): "
if /i not "%continue%"=="y" (
    echo Tests annulés.
    exit /b 0
)

echo.
echo 🧪 Lancement des tests automatisés...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

call npm test

echo.
echo ✅ Tests terminés !
echo 📊 Consultez le rapport HTML : tests\reports\html\index.html
echo.
pause