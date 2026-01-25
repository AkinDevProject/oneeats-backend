-- V7: Ajouter le champ push_token pour les notifications Expo Push
-- Ce champ stocke le token Expo Push (format: ExponentPushToken[xxx])

ALTER TABLE user_account ADD COLUMN IF NOT EXISTS push_token VARCHAR(500);
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS push_token_updated_at TIMESTAMP;

-- Index pour rechercher rapidement les utilisateurs avec un token push
CREATE INDEX IF NOT EXISTS idx_user_account_push_token ON user_account(push_token) WHERE push_token IS NOT NULL;

COMMENT ON COLUMN user_account.push_token IS 'Token Expo Push pour les notifications mobiles (format: ExponentPushToken[xxx])';
COMMENT ON COLUMN user_account.push_token_updated_at IS 'Date de derniere mise a jour du token push';
