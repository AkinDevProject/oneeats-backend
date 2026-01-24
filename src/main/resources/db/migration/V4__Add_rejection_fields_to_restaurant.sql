-- V4: Ajout des champs de rejet et blocage pour les restaurants
-- Permet de stocker la raison et la date de rejet/blocage d'un restaurant

-- Champs de rejet
ALTER TABLE restaurant ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(1000);
ALTER TABLE restaurant ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- Champs de blocage
ALTER TABLE restaurant ADD COLUMN IF NOT EXISTS blocking_reason VARCHAR(1000);
ALTER TABLE restaurant ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;

-- Commentaires pour la documentation
COMMENT ON COLUMN restaurant.rejection_reason IS 'Raison du rejet fournie par l administrateur';
COMMENT ON COLUMN restaurant.rejected_at IS 'Date et heure du rejet du restaurant';
COMMENT ON COLUMN restaurant.blocking_reason IS 'Raison du blocage fournie par l administrateur';
COMMENT ON COLUMN restaurant.blocked_at IS 'Date et heure du blocage du restaurant';
