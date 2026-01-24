-- V4: Ajout des champs de rejet pour les restaurants
-- Permet de stocker la raison et la date de rejet d'un restaurant

ALTER TABLE restaurant ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(1000);
ALTER TABLE restaurant ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

-- Commentaires pour la documentation
COMMENT ON COLUMN restaurant.rejection_reason IS 'Raison du rejet fournie par l administrateur';
COMMENT ON COLUMN restaurant.rejected_at IS 'Date et heure du rejet du restaurant';
