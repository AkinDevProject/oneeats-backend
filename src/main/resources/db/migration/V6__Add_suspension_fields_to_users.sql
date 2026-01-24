-- V6: Ajout des champs de suspension pour les utilisateurs
-- Permet de stocker la raison, date de début et date de fin de suspension

ALTER TABLE user_account ADD COLUMN IF NOT EXISTS suspension_reason VARCHAR(1000);
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP;
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP;

-- Commentaires pour la documentation
COMMENT ON COLUMN user_account.suspension_reason IS 'Raison de la suspension (obligatoire lors de la suspension)';
COMMENT ON COLUMN user_account.suspended_at IS 'Date et heure du debut de la suspension';
COMMENT ON COLUMN user_account.suspended_until IS 'Date et heure de fin de suspension (NULL = indefinie)';
