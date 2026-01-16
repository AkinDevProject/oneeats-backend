-- Schema et données de test pour OneEats
-- Utilisé automatiquement par Hibernate en mode test
-- Simplifié pour correspondre au schéma actuel des entités

-- Données de test pour les utilisateurs
INSERT INTO user_account (id, email, password_hash, first_name, last_name, phone, address, status, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'test@oneeats.com',
    'hashedpassword123',
    'Test',
    'User',
    '+33123456789',
    '123 Test Street',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO user_account (id, email, password_hash, first_name, last_name, phone, address, status, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'user2@oneeats.com',
    'hashedpassword456',
    'User',
    'Two',
    '+33987654321',
    '456 User Avenue',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

-- Données de test pour les restaurants
INSERT INTO restaurant (id, name, description, address, phone, email, cuisine_type, rating, image_url, is_open, is_active, status, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Restaurant Test',
    'Un restaurant de test',
    '789 Restaurant Street',
    '+33555666777',
    'test@restaurant.com',
    'ITALIAN',
    4.5,
    'https://example.com/restaurant.jpg',
    true,
    true,
    'APPROVED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO restaurant (id, name, description, address, phone, email, cuisine_type, rating, image_url, is_open, is_active, status, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'Pizza Paradise',
    'Les meilleures pizzas de la ville',
    '321 Pizza Lane',
    '+33111222333',
    'info@pizzaparadise.com',
    'ITALIAN',
    4.2,
    'https://example.com/pizza.jpg',
    true,
    true,
    'APPROVED',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

-- Données de test pour les items de menu
INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, allergens, preparation_time_minutes, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Pizza Margherita',
    'Pizza classique avec tomate, mozzarella et basilic',
    12.50,
    'PIZZA',
    'https://example.com/margherita.jpg',
    true,
    true,
    false,
    'GLUTEN,DAIRY',
    15,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, allergens, preparation_time_minutes, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d484',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Burger Vegetarien',
    'Burger avec steak vegetal et legumes frais',
    14.00,
    'BURGER',
    'https://example.com/veggie-burger.jpg',
    true,
    true,
    true,
    'GLUTEN',
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);
