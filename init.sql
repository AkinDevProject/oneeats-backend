-- Script d'initialisation de la base de données OneEats
-- Ce fichier sera exécuté automatiquement lors de la création du conteneur PostgreSQL

-- Création des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Message de confirmation
SELECT 'Base de données OneEats initialisée avec succès!' as message;