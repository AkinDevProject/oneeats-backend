-- Script d'initialisation de la base de données OneEats
-- Ce fichier sera exécuté automatiquement lors de la création du conteneur PostgreSQL

-- Création des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création de la base de données Keycloak (si elle n'existe pas)
-- Note: PostgreSQL ne permet pas CREATE DATABASE dans un script init,
-- donc Keycloak utilisera sa propre base via variable d'environnement
-- La base keycloak sera créée automatiquement par le conteneur keycloak-db

-- Message de confirmation
SELECT 'Base de données OneEats initialisée avec succès!' as message;