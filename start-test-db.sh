#!/bin/bash

echo "Démarrage de la base de données PostgreSQL pour les tests..."

# Arrêter le conteneur de test s'il existe déjà
docker stop oneeats-postgres-test 2>/dev/null
docker rm oneeats-postgres-test 2>/dev/null

# Démarrer seulement le service postgres-test
docker-compose -f docker-compose.dev.yml up -d postgres-test

echo "Attente de l'initialisation de la base de données..."
sleep 10

echo "Base de données de test prête sur le port 5433"
echo "Connexion: postgresql://localhost:5433/oneeats_test"
echo "Utilisateur: oneeats_test_user"
echo "Mot de passe: oneeats_test_password"