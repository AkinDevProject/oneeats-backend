-- Script de données de développement pour OneEats
-- Ce fichier contient toutes les données nécessaires pour le développement et les tests

-- Mise à jour des colonnes version pour avoir une valeur par défaut (pour corriger le problème Hibernate)
ALTER TABLE orders ALTER COLUMN version SET DEFAULT 0;
ALTER TABLE restaurant ALTER COLUMN version SET DEFAULT 0;
ALTER TABLE menu_item ALTER COLUMN version SET DEFAULT 0;
ALTER TABLE user_account ALTER COLUMN version SET DEFAULT 0;
ALTER TABLE order_items ALTER COLUMN version SET DEFAULT 0;

-- Mise à jour des champs version null existants
UPDATE orders SET version = 0 WHERE version IS NULL;
UPDATE restaurant SET version = 0 WHERE version IS NULL;
UPDATE menu_item SET version = 0 WHERE version IS NULL;
UPDATE user_account SET version = 0 WHERE version IS NULL;
UPDATE order_items SET version = 0 WHERE version IS NULL;

-- Create tables for menu item options
CREATE TABLE IF NOT EXISTS menu_item_option (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_id UUID NOT NULL REFERENCES menu_item(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    option_type VARCHAR(50) NOT NULL CHECK (option_type IN ('choice', 'remove', 'extra')),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    max_choices INTEGER,
    display_order INTEGER DEFAULT 0,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_item_choice (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_option_id UUID NOT NULL REFERENCES menu_item_option(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    display_order INTEGER DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants
INSERT INTO restaurant (id, name, description, address, phone, email, cuisine_type, rating, image_url, is_open, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Pizza Palace', 'Les meilleures pizzas italiennes de la ville', '123 Rue de la Pizza', '0123456789', 'contact@pizzapalace.fr', 'PIZZA', 4.5, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', true, true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Burger House', 'Burgers artisanaux et frites maison', '456 Avenue des Burgers', '0198765432', 'info@burgerhouse.fr', 'AMERICAIN', 4.2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', true, true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Sushi Express', 'Sushis frais préparés quotidiennement', '789 Boulevard Tokyo', '0156789012', 'commande@sushiexpress.fr', 'JAPONAIS', 4.7, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', true, true, NOW(), NOW());

-- Utilisateurs
INSERT INTO user_account (id, email, password_hash, first_name, last_name, phone, address, created_at, updated_at, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user1@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean2', 'Dupont', '0612345678', '10 Rue de la Paix', NOW(), NOW(), true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'marie@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Martin', '0623456789', '20 Avenue des Fleurs', NOW(), NOW(), true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'paul@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Paul', 'Durand', '0634567890', '30 Place du Marché', NOW(), NOW(), true);

-- Menu items pour Pizza Palace
INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, preparation_time_minutes, allergens, created_at, updated_at) VALUES
('91111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Pizza Margherita', 'Tomate, mozzarella, basilic frais', 12.50, 'Pizza', 'https://images.unsplash.com/photo-1604382354936-07c5b6d5c5b0', true, true, false, 15, 'gluten,lactose', NOW(), NOW()),
('91111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Pizza Pepperoni', 'Tomate, mozzarella, pepperoni épicé', 14.00, 'Pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e', true, false, false, 18, 'gluten,lactose', NOW(), NOW()),
('91111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Tiramisu', 'Dessert italien traditionnel', 7.00, 'Dessert', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', true, true, false, 5, 'gluten,lactose,eggs', NOW(), NOW()),
('91111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Coca-Cola', 'Boisson gazeuse 33cl', 3.00, 'Boisson', null, true, true, true, 1, '', NOW(), NOW()),
('91111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 'Pizza 4 Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 15.50, 'Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', true, true, false, 20, 'gluten,lactose', NOW(), NOW()),
('91111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111111', 'Pizza Personnalisée', 'Base tomate et mozzarella, créez votre pizza', 13.00, 'Pizza', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47', true, true, false, 18, 'gluten,lactose', NOW(), NOW()),
('91111111-1111-1111-1111-111111111117', '11111111-1111-1111-1111-111111111111', 'Salade César', 'Salade romaine, parmesan, croûtons, sauce césar', 9.50, 'Salade', 'https://images.unsplash.com/photo-1546793665-c74683f339c1', true, true, false, 8, 'gluten,lactose,eggs', NOW(), NOW()),
('91111111-1111-1111-1111-111111111118', '11111111-1111-1111-1111-111111111111', 'Pasta Carbonara', 'Spaghetti, lardons, crème, parmesan, œuf', 12.00, 'Pâtes', 'https://images.unsplash.com/photo-1621996346565-e3dbc794d72b', true, false, false, 12, 'gluten,lactose,eggs', NOW(), NOW());

-- Menu items pour Burger House
INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, preparation_time_minutes, allergens, created_at, updated_at) VALUES
('92222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Classic Burger', 'Steak haché, salade, tomate, cornichon', 11.00, 'Burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', true, false, false, 12, 'gluten', NOW(), NOW()),
('92222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Cheese Burger', 'Steak haché, cheddar, salade, tomate', 12.50, 'Burger', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90', true, false, false, 12, 'gluten,lactose', NOW(), NOW()),
('92222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Frites', 'Frites croustillantes maison', 4.50, 'Accompagnement', null, true, true, true, 8, '', NOW(), NOW());

-- Options pour Salade César (91111111-1111-1111-1111-111111111117)
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at) VALUES
('a1111111-1111-1111-1111-111111111117', '91111111-1111-1111-1111-111111111117', 'Taille de salade', 'choice', true, 1, 1, NOW(), NOW()),
('a2222222-2222-2222-2222-222222222227', '91111111-1111-1111-1111-111111111117', 'Protéines', 'choice', false, 1, 2, NOW(), NOW()),
('a3333333-3333-3333-3333-333333333337', '91111111-1111-1111-1111-111111111117', 'Options à retirer', 'remove', false, null, 3, NOW(), NOW());

-- Taille de salade
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('a4444444-4444-4444-4444-444444444447', 'a1111111-1111-1111-1111-111111111117', 'Entrée', 0.00, 1, true, NOW(), NOW()),
('a5555555-5555-5555-5555-555555555557', 'a1111111-1111-1111-1111-111111111117', 'Plat principal', 3.50, 2, true, NOW(), NOW());

-- Protéines pour salade
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('a6666666-6666-6666-6666-666666666667', 'a2222222-2222-2222-2222-222222222227', 'Poulet grillé', 4.00, 1, true, NOW(), NOW()),
('a7777777-7777-7777-7777-777777777777', 'a2222222-2222-2222-2222-222222222227', 'Crevettes', 5.50, 2, true, NOW(), NOW()),
('a8888888-8888-8888-8888-888888888888', 'a2222222-2222-2222-2222-222222222227', 'Saumon fumé', 6.00, 3, true, NOW(), NOW());

-- Options à retirer
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('a9999999-9999-9999-9999-999999999999', 'a3333333-3333-3333-3333-333333333337', 'Sans croûtons', 0.00, 1, true, NOW(), NOW()),
('b1111111-1111-1111-1111-111111111117', 'a3333333-3333-3333-3333-333333333337', 'Sans parmesan', 0.00, 2, true, NOW(), NOW()),
('b2222222-2222-2222-2222-222222222227', 'a3333333-3333-3333-3333-333333333337', 'Sauce à part', 0.00, 3, true, NOW(), NOW());

-- Sample menu item options for Pizza Margherita
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at) VALUES
('a1111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111111', 'Choix de base', 'remove', false, null, 1, NOW(), NOW()),
('a2222222-2222-2222-2222-222222222222', '91111111-1111-1111-1111-111111111111', 'Suppléments payants', 'extra', false, null, 2, NOW(), NOW());

-- Choices for "Choix de base" (remove ingredients)
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Sans basilic', 0.00, 1, true, NOW(), NOW()),
('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Sans mozzarella', 0.00, 2, true, NOW(), NOW());

-- Choices for "Suppléments payants" (extra ingredients)
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('b3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'Extra mozzarella', 2.00, 1, true, NOW(), NOW()),
('b4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'Jambon de Parme', 3.50, 2, true, NOW(), NOW()),
('b5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 'Champignons', 1.50, 3, true, NOW(), NOW());

-- Sample options for Classic Burger
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at) VALUES
('c1111111-1111-1111-1111-111111111111', '92222222-2222-2222-2222-222222222221', 'Cuisson du steak', 'choice', true, 1, 1, NOW(), NOW()),
('c2222222-2222-2222-2222-222222222222', '92222222-2222-2222-2222-222222222221', 'Options gratuites', 'remove', false, null, 2, NOW(), NOW()),
('c3333333-3333-3333-3333-333333333333', '92222222-2222-2222-2222-222222222221', 'Extras', 'extra', false, null, 3, NOW(), NOW());

-- Cuisson choices
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Saignant', 0.00, 1, true, NOW(), NOW()),
('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'À point', 0.00, 2, true, NOW(), NOW()),
('d3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Bien cuit', 0.00, 3, true, NOW(), NOW());

-- Remove options
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('d4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Sans cornichon', 0.00, 1, true, NOW(), NOW()),
('d5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Sans salade', 0.00, 2, true, NOW(), NOW()),
('d6666666-6666-6666-6666-666666666666', 'c2222222-2222-2222-2222-222222222222', 'Sans tomate', 0.00, 3, true, NOW(), NOW());

-- Extra options
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('d7777777-7777-7777-7777-777777777777', 'c3333333-3333-3333-3333-333333333333', 'Fromage cheddar', 1.50, 1, true, NOW(), NOW()),
('d8888888-8888-8888-8888-888888888888', 'c3333333-3333-3333-3333-333333333333', 'Bacon', 2.00, 2, true, NOW(), NOW()),
('d9999999-9999-9999-9999-999999999999', 'c3333333-3333-3333-3333-333333333333', 'Avocat', 2.50, 3, true, NOW(), NOW());

-- Options pour Pizza Personnalisée (91111111-1111-1111-1111-111111111116)
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at) VALUES
('e1111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111116', 'Taille de la pizza', 'choice', true, 1, 1, NOW(), NOW()),
('e2222222-2222-2222-2222-222222222222', '91111111-1111-1111-1111-111111111116', 'Garnitures viandes', 'choice', false, null, 2, NOW(), NOW()),
('e3333333-3333-3333-3333-333333333333', '91111111-1111-1111-1111-111111111116', 'Garnitures légumes', 'choice', false, null, 3, NOW(), NOW()),
('e4444444-4444-4444-4444-444444444444', '91111111-1111-1111-1111-111111111116', 'Fromages supplémentaires', 'extra', false, null, 4, NOW(), NOW());

-- Choix pour taille de pizza
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Petite (26cm)', 0.00, 1, true, NOW(), NOW()),
('f2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Moyenne (30cm)', 3.00, 2, true, NOW(), NOW()),
('f3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'Grande (34cm)', 5.00, 3, true, NOW(), NOW());

-- Garnitures viandes
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('f4444444-4444-4444-4444-444444444444', 'e2222222-2222-2222-2222-222222222222', 'Pepperoni', 2.50, 1, true, NOW(), NOW()),
('f5555555-5555-5555-5555-555555555555', 'e2222222-2222-2222-2222-222222222222', 'Jambon', 2.00, 2, true, NOW(), NOW()),
('f6666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222', 'Chorizo', 3.00, 3, true, NOW(), NOW()),
('f7777777-7777-7777-7777-777777777777', 'e2222222-2222-2222-2222-222222222222', 'Saucisse italienne', 2.50, 4, true, NOW(), NOW());

-- Garnitures légumes
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('f8888888-8888-8888-8888-888888888888', 'e3333333-3333-3333-3333-333333333333', 'Champignons', 1.50, 1, true, NOW(), NOW()),
('f9999999-9999-9999-9999-999999999999', 'e3333333-3333-3333-3333-333333333333', 'Poivrons', 1.50, 2, true, NOW(), NOW()),
('a1111111-1111-1111-1111-111111111118', 'e3333333-3333-3333-3333-333333333333', 'Olives noires', 1.00, 3, true, NOW(), NOW()),
('a2222222-2222-2222-2222-222222222228', 'e3333333-3333-3333-3333-333333333333', 'Roquette', 2.00, 4, true, NOW(), NOW()),
('a3333333-3333-3333-3333-333333333338', 'e3333333-3333-3333-3333-333333333333', 'Tomates cerises', 1.50, 5, true, NOW(), NOW());

-- Fromages supplémentaires
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('a4444444-4444-4444-4444-444444444448', 'e4444444-4444-4444-4444-444444444444', 'Gorgonzola', 2.50, 1, true, NOW(), NOW()),
('a5555555-5555-5555-5555-555555555558', 'e4444444-4444-4444-4444-444444444444', 'Chèvre', 2.00, 2, true, NOW(), NOW()),
('a6666666-6666-6666-6666-666666666668', 'e4444444-4444-4444-4444-444444444444', 'Parmesan', 2.00, 3, true, NOW(), NOW());



-- Options pour Pasta Carbonara (91111111-1111-1111-1111-111111111118)
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at) VALUES
('b3333333-3333-3333-3333-333333333337', '91111111-1111-1111-1111-111111111118', 'Type de pâtes', 'choice', true, 1, 1, NOW(), NOW()),
('b4444444-4444-4444-4444-444444444447', '91111111-1111-1111-1111-111111111118', 'Suppléments', 'extra', false, null, 2, NOW(), NOW()),
('b5555555-5555-5555-5555-555555555557', '91111111-1111-1111-1111-111111111118', 'Modifications', 'remove', false, null, 3, NOW(), NOW());

-- Types de pâtes
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('b6666666-6666-6666-6666-666666666667', 'b3333333-3333-3333-3333-333333333337', 'Spaghetti', 0.00, 1, true, NOW(), NOW()),
('b7777777-7777-7777-7777-777777777777', 'b3333333-3333-3333-3333-333333333337', 'Penne', 0.00, 2, true, NOW(), NOW()),
('b8888888-8888-8888-8888-888888888888', 'b3333333-3333-3333-3333-333333333337', 'Tagliatelles', 1.00, 3, true, NOW(), NOW());

-- Suppléments pâtes
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('b9999999-9999-9999-9999-999999999999', 'b4444444-4444-4444-4444-444444444447', 'Extra lardons', 2.50, 1, true, NOW(), NOW()),
('a1111111-1111-1111-1111-111111111119', 'b4444444-4444-4444-4444-444444444447', 'Extra parmesan', 2.00, 2, true, NOW(), NOW()),
('a2222222-2222-2222-2222-222222222229', 'b4444444-4444-4444-4444-444444444447', 'Champignons', 2.00, 3, true, NOW(), NOW());

-- Modifications
INSERT INTO menu_item_choice (id, menu_item_option_id, name, price, display_order, is_available, created_at, updated_at) VALUES
('a3333333-3333-3333-3333-333333333339', 'b5555555-5555-5555-5555-555555555557', 'Sans lardons', 0.00, 1, true, NOW(), NOW()),
('a4444444-4444-4444-4444-444444444449', 'b5555555-5555-5555-5555-555555555557', 'Sans œuf', 0.00, 2, true, NOW(), NOW()),
('a5555555-5555-5555-5555-555555555559', 'b5555555-5555-5555-5555-555555555557', 'Sauce allégée', 0.00, 3, true, NOW(), NOW());

-- Commandes - 4 par status comme demandé
INSERT INTO orders (id, order_number, user_id, restaurant_id, status, total_amount, special_instructions, created_at, updated_at, estimated_pickup_time) VALUES
-- EN_ATTENTE (4 commandes)
('10101010-1010-1010-1010-101010101010', 'CMD-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'EN_ATTENTE', 29.50, 'Commande pour ce soir', NOW() - INTERVAL '2 minutes', NOW(), NOW() + INTERVAL '25 minutes'),
('10101010-1010-1010-1010-101010101011', 'CMD-002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'EN_ATTENTE', 23.50, 'Pas trop cuit le steak', NOW() - INTERVAL '3 minutes', NOW(), NOW() + INTERVAL '20 minutes'),
('10101010-1010-1010-1010-101010101012', 'CMD-003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'EN_ATTENTE', 18.50, '', NOW() - INTERVAL '1 minute', NOW(), NOW() + INTERVAL '30 minutes'),
('10101010-1010-1010-1010-101010101013', 'CMD-004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'EN_ATTENTE', 16.50, 'Sauce à part svp', NOW() - INTERVAL '4 minutes', NOW(), NOW() + INTERVAL '18 minutes'),

-- EN_PREPARATION (4 commandes)
('11111111-1111-1111-1111-111111111111', 'CMD-005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'EN_PREPARATION', 25.50, 'Pas trop épicé svp', NOW() - INTERVAL '15 minutes', NOW(), NOW() + INTERVAL '10 minutes'),
('14141414-1414-1414-1414-141414141414', 'CMD-006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'EN_PREPARATION', 31.50, 'Extra fromage', NOW() - INTERVAL '12 minutes', NOW(), NOW() + INTERVAL '8 minutes'),
('14141414-1414-1414-1414-141414141415', 'CMD-007', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'EN_PREPARATION', 24.00, 'Bien cuit', NOW() - INTERVAL '10 minutes', NOW(), NOW() + INTERVAL '12 minutes'),
('14141414-1414-1414-1414-141414141416', 'CMD-008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'EN_PREPARATION', 22.50, '', NOW() - INTERVAL '8 minutes', NOW(), NOW() + INTERVAL '15 minutes'),

-- PRETE (4 commandes)
('21212121-2121-2121-2121-212121212121', 'CMD-009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'PRETE', 18.00, '', NOW() - INTERVAL '25 minutes', NOW(), NOW() - INTERVAL '2 minutes'),
('24242424-2424-2424-2424-242424242424', 'CMD-010', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'PRETE', 21.00, 'Sauce à part', NOW() - INTERVAL '30 minutes', NOW(), NOW() - INTERVAL '5 minutes'),
('24242424-2424-2424-2424-242424242425', 'CMD-011', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'PRETE', 28.00, 'Merci beaucoup!', NOW() - INTERVAL '20 minutes', NOW(), NOW() - INTERVAL '1 minute'),
('24242424-2424-2424-2424-242424242426', 'CMD-012', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'PRETE', 19.50, 'Sans cornichon', NOW() - INTERVAL '35 minutes', NOW(), NOW() - INTERVAL '3 minutes'),

-- RECUPEREE (4 commandes)
('31313131-3131-3131-3131-313131313131', 'CMD-013', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'RECUPEREE', 27.00, 'Parfait!', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '25 minutes'),
('34343434-3434-3434-3434-343434343434', 'CMD-014', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'RECUPEREE', 20.50, '', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '30 minutes'),
('34343434-3434-3434-3434-343434343435', 'CMD-015', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'RECUPEREE', 15.50, 'Très bon!', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '20 minutes'),
('34343434-3434-3434-3434-343434343436', 'CMD-016', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'RECUPEREE', 32.00, 'Service rapide', NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '35 minutes');

-- Order Items pour toutes les commandes
INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, unit_price, quantity, special_notes, created_at, updated_at) VALUES
-- Items pour commandes EN_ATTENTE
('10101010-0000-0000-0000-000000000001', '10101010-1010-1010-1010-101010101010', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW()),
('10101010-0000-0000-0000-000000000002', '10101010-1010-1010-1010-101010101010', '91111111-1111-1111-1111-111111111115', 'Pizza 4 Fromages', 15.50, 1, '', NOW(), NOW()),
('10101010-0000-0000-0000-000000000003', '10101010-1010-1010-1010-101010101010', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 1, '', NOW(), NOW()),

('10101010-0000-0000-0000-000000000011', '10101010-1010-1010-1010-101010101011', '92222222-2222-2222-2222-222222222222', 'Cheese Burger', 12.50, 1, 'Pas trop cuit', NOW(), NOW()),
('10101010-0000-0000-0000-000000000012', '10101010-1010-1010-1010-101010101011', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, '', NOW(), NOW()),

('10101010-0000-0000-0000-000000000021', '10101010-1010-1010-1010-101010101012', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW()),
('10101010-0000-0000-0000-000000000022', '10101010-1010-1010-1010-101010101012', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 2, '', NOW(), NOW()),

('10101010-0000-0000-0000-000000000031', '10101010-1010-1010-1010-101010101013', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, 'Sauce à part', NOW(), NOW()),
('10101010-0000-0000-0000-000000000032', '10101010-1010-1010-1010-101010101013', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 1, '', NOW(), NOW()),

-- Items pour commandes EN_PREPARATION
('11111111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, 'Pas trop épicé', NOW(), NOW()),
('11111111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, '', NOW(), NOW()),
('11111111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 2, '', NOW(), NOW()),

('14141414-0000-0000-0000-000000000001', '14141414-1414-1414-1414-141414141414', '91111111-1111-1111-1111-111111111112', 'Pizza Pepperoni', 14.00, 1, 'Extra fromage', NOW(), NOW()),
('14141414-0000-0000-0000-000000000002', '14141414-1414-1414-1414-141414141414', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW()),
('14141414-0000-0000-0000-000000000003', '14141414-1414-1414-1414-141414141414', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 1, '', NOW(), NOW()),
('14141414-0000-0000-0000-000000000004', '14141414-1414-1414-1414-141414141414', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 2.00, 1, '', NOW(), NOW()),

('14141414-0000-0000-0000-000000000011', '14141414-1414-1414-1414-141414141415', '92222222-2222-2222-2222-222222222222', 'Cheese Burger', 12.50, 1, 'Bien cuit', NOW(), NOW()),
('14141414-0000-0000-0000-000000000012', '14141414-1414-1414-1414-141414141415', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, '', NOW(), NOW()),
('14141414-0000-0000-0000-000000000013', '14141414-1414-1414-1414-141414141415', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 1, '', NOW(), NOW()),

('14141414-0000-0000-0000-000000000021', '14141414-1414-1414-1414-141414141416', '91111111-1111-1111-1111-111111111115', 'Pizza 4 Fromages', 15.50, 1, '', NOW(), NOW()),
('14141414-0000-0000-0000-000000000022', '14141414-1414-1414-1414-141414141416', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, '', NOW(), NOW()),

-- Items pour commandes PRETE
('21212121-0000-0000-0000-000000000001', '21212121-2121-2121-2121-212121212121', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW()),
('21212121-0000-0000-0000-000000000002', '21212121-2121-2121-2121-212121212121', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 1, '', NOW(), NOW()),
('21212121-0000-0000-0000-000000000003', '21212121-2121-2121-2121-212121212121', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 2.50, 1, '', NOW(), NOW()),

('24242424-0000-0000-0000-000000000001', '24242424-2424-2424-2424-242424242424', '91111111-1111-1111-1111-111111111112', 'Pizza Pepperoni', 14.00, 1, 'Sauce à part', NOW(), NOW()),
('24242424-0000-0000-0000-000000000002', '24242424-2424-2424-2424-242424242424', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, '', NOW(), NOW()),

('24242424-0000-0000-0000-000000000011', '24242424-2424-2424-2424-242424242425', '92222222-2222-2222-2222-222222222222', 'Cheese Burger', 12.50, 2, '', NOW(), NOW()),
('24242424-0000-0000-0000-000000000012', '24242424-2424-2424-2424-242424242425', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 1, '', NOW(), NOW()),

('24242424-0000-0000-0000-000000000021', '24242424-2424-2424-2424-242424242426', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, 'Sans cornichon', NOW(), NOW()),
('24242424-0000-0000-0000-000000000022', '24242424-2424-2424-2424-242424242426', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, '', NOW(), NOW()),

-- Items pour commandes RECUPEREE
('31313131-0000-0000-0000-000000000001', '31313131-3131-3131-3131-313131313131', '91111111-1111-1111-1111-111111111115', 'Pizza 4 Fromages', 15.50, 1, '', NOW(), NOW()),
('31313131-0000-0000-0000-000000000002', '31313131-3131-3131-3131-313131313131', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW()),

('34343434-0000-0000-0000-000000000001', '34343434-3434-3434-3434-343434343434', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, '', NOW(), NOW()),
('34343434-0000-0000-0000-000000000002', '34343434-3434-3434-3434-343434343434', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 2, '', NOW(), NOW()),

('34343434-0000-0000-0000-000000000011', '34343434-3434-3434-3434-343434343435', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW()),
('34343434-0000-0000-0000-000000000012', '34343434-3434-3434-3434-343434343435', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 1, '', NOW(), NOW()),

('34343434-0000-0000-0000-000000000021', '34343434-3434-3434-3434-343434343436', '92222222-2222-2222-2222-222222222222', 'Cheese Burger', 12.50, 2, '', NOW(), NOW()),
('34343434-0000-0000-0000-000000000022', '34343434-3434-3434-3434-343434343436', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 1, '', NOW(), NOW()),
('34343434-0000-0000-0000-000000000023', '34343434-3434-3434-3434-343434343436', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, '', NOW(), NOW());
