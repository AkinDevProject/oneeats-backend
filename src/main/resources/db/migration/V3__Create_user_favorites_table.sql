-- V3__Create_user_favorites_table.sql
-- Migration script to create the user_favorites table

CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    restaurant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_user_favorites_user_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_favorites_restaurant_id
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,

    -- Unique constraint to prevent duplicate favorites
    CONSTRAINT uk_user_favorites_user_restaurant
        UNIQUE (user_id, restaurant_id)
);

-- Indexes for better query performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_restaurant_id ON user_favorites(restaurant_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at);

-- Add some sample data for testing
INSERT INTO user_favorites (user_id, restaurant_id) VALUES
    ((SELECT id FROM users LIMIT 1), (SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1)),
    ((SELECT id FROM users LIMIT 1), (SELECT id FROM restaurants WHERE name = 'Burger Barn' LIMIT 1))
ON CONFLICT (user_id, restaurant_id) DO NOTHING;