@echo off
echo.
echo 🍽️  OneEats - Démarrage de l'application
echo =======================================

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Vérifier si Java est installé
java --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java n'est pas installé. Veuillez installer Java 17+ d'abord.
    pause
    exit /b 1
)

echo 📦 Installation des dépendances frontend...
cd apps\web
call npm install
cd ..\..

echo ✅ Configuration terminée!
echo.
echo Pour démarrer l'application :
echo 1. Démarrez PostgreSQL :
echo    docker run -d --name postgres -e POSTGRES_DB=oneeats_dev -e POSTGRES_USER=oneeats_user -e POSTGRES_PASSWORD=oneeats_password -p 5432:5432 postgres:15
echo.
echo 2. Démarrez le backend Quarkus :
echo    mvnw.cmd quarkus:dev
echo.
echo 3. L'application sera accessible sur :
echo    - Backend API: http://localhost:8080
echo    - Frontend Web: http://localhost:5173
echo    - Documentation API: http://localhost:8080/q/swagger-ui
echo.
pause