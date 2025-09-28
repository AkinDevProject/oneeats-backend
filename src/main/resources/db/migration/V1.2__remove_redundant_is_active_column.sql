-- Migration pour supprimer la colonne is_active redondante
-- La logique d'activation est déjà gérée par l'enum UserStatus

-- Supprimer la colonne is_active de la table user_account
ALTER TABLE user_account DROP COLUMN IF EXISTS is_active;