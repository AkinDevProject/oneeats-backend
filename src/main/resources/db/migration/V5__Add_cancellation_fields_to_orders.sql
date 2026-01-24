-- V5: Ajout des champs d'annulation pour les commandes
-- Permet de stocker la raison et la date d'annulation d'une commande

ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Commentaires pour la documentation
COMMENT ON COLUMN orders.cancellation_reason IS 'Raison de l annulation (ex: Restaurant blocked, User request)';
COMMENT ON COLUMN orders.cancelled_at IS 'Date et heure de l annulation de la commande';
