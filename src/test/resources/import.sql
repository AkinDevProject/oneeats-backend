-- Schema et données de test pour OneEats
-- Utilisé automatiquement par Hibernate en mode test

-- Données de test pour les utilisateurs
INSERT INTO user_account (id, email, password_hash, first_name, last_name, phone, address, is_active, created_at, updated_at, version) 
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'test@oneeats.com', 
    'hashedpassword123',
    'Test', 
    'User',
    '+33123456789',
    '123 Test Street',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO user_account (id, email, password_hash, first_name, last_name, phone, address, is_active, created_at, updated_at, version) 
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'user2@oneeats.com', 
    'hashedpassword456',
    'User', 
    'Two',
    '+33987654321',
    '456 User Avenue',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

-- Données de test pour les restaurants
INSERT INTO restaurant (id, name, description, address, phone, email, cuisine_type, rating, image_url, is_open, is_active, created_at, updated_at, version)
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
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO restaurant (id, name, description, address, phone, email, cuisine_type, rating, image_url, is_open, is_active, created_at, updated_at, version)
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
    'Burger Végétarien',
    'Burger avec steak végétal et légumes frais',
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

-- Données de test pour les administrateurs
INSERT INTO admin (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d485',
    'admin@oneeats.com',
    'hashedadminpass123',
    'Super',
    'Admin',
    'SUPER_ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO admin (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d486',
    'moderator@oneeats.com',
    'hashedmodpass456',
    'Moderator',
    'User',
    'MODERATOR',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

-- Données de test pour les notifications
INSERT INTO notification (id, destinataire_id, titre, message, type, lu, url_action, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d487',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Bienvenue !',
    'Bienvenue sur OneEats ! Votre compte a été créé avec succès.',
    'GENERAL',
    false,
    '/profile',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

-- Données de test pour les commandes
INSERT INTO orders (id, order_number, user_id, restaurant_id, status, total_amount, special_instructions, estimated_pickup_time, actual_pickup_time, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d488',
    'ORD-20250911-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'EN_ATTENTE',
    26.50,
    'Extra cheese on pizza',
    null,
    null,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

-- Données de test pour les items de commande
INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, unit_price, quantity, special_notes, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d489',
    'f47ac10b-58cc-4372-a567-0e02b2c3d488',
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'Pizza Margherita',
    12.50,
    1,
    'Extra cheese',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, unit_price, quantity, special_notes, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d490',
    'f47ac10b-58cc-4372-a567-0e02b2c3d488',
    'f47ac10b-58cc-4372-a567-0e02b2c3d484',
    'Burger Végétarien',
    14.00,
    1,
    'No pickles',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

-- Données de test pour les options de menu
INSERT INTO menu_item_option (id, menu_item_id, name, description, option_type, is_required, display_order, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d491',
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'Taille',
    'Choisissez la taille de votre pizza',
    'CHOICE',
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO menu_item_option (id, menu_item_id, name, description, option_type, is_required, display_order, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d492',
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'Garnitures supplémentaires',
    'Ajoutez des garnitures à votre pizza',
    'EXTRA',
    false,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

-- Données de test pour les choix d'options
INSERT INTO menu_item_choice (id, option_id, name, description, additional_price, is_available, display_order, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d493',
    'f47ac10b-58cc-4372-a567-0e02b2c3d491',
    'Petite (20cm)',
    'Pizza de 20cm de diamètre',
    0.00,
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO menu_item_choice (id, option_id, name, description, additional_price, is_available, display_order, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d494',
    'f47ac10b-58cc-4372-a567-0e02b2c3d491',
    'Moyenne (25cm)',
    'Pizza de 25cm de diamètre',
    3.00,
    true,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO menu_item_choice (id, option_id, name, description, additional_price, is_available, display_order, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d495',
    'f47ac10b-58cc-4372-a567-0e02b2c3d491',
    'Grande (30cm)',
    'Pizza de 30cm de diamètre',
    6.00,
    true,
    3,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO menu_item_choice (id, option_id, name, description, additional_price, is_available, display_order, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d496',
    'f47ac10b-58cc-4372-a567-0e02b2c3d492',
    'Champignons',
    'Champignons frais',
    1.50,
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

INSERT INTO menu_item_choice (id, option_id, name, description, additional_price, is_available, display_order, created_at, updated_at, version)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d497',
    'f47ac10b-58cc-4372-a567-0e02b2c3d492',
    'Olives',
    'Olives noires et vertes',
    1.00,
    true,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);