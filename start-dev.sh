#!/bin/bash

# Script de démarrage pour OneEats en mode développement

echo "🍽️  OneEats - Démarrage de l'application"
echo "======================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si Java est installé
if ! command -v java &> /dev/null; then
    echo "❌ Java n'est pas installé. Veuillez installer Java 17+ d'abord."
    exit 1
fi

# Installer les dépendances frontend si nécessaire
echo "📦 Installation des dépendances frontend..."
cd apps/web
npm install
cd ../..

echo "✅ Configuration terminée!"
echo ""
echo "Pour démarrer l'application :"
echo "1. Démarrez PostgreSQL :"
echo "   docker run -d --name postgres -e POSTGRES_DB=oneeats_dev -e POSTGRES_USER=oneeats_user -e POSTGRES_PASSWORD=oneeats_password -p 5432:5432 postgres:15"
echo ""
echo "2. Démarrez le backend Quarkus :"
echo "   ./mvnw quarkus:dev"
echo ""
echo "3. L'application sera accessible sur :"
echo "   - Backend API: http://localhost:8080"
echo "   - Frontend Web: http://localhost:5173"
echo "   - Documentation API: http://localhost:8080/q/swagger-ui"