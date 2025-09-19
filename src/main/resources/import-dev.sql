-- Script de données de développement pour OneEats (corrigé pour la nouvelle architecture)
-- Ce fichier contient toutes les données nécessaires pour le développement et les tests

-- Restaurants (table 'restaurant')
INSERT INTO restaurant (id, name, description, address, phone, email, cuisine_type, rating, image_url, is_open, is_active, created_at, updated_at, version) VALUES
('11111111-1111-1111-1111-111111111111', 'Pizza Palace', 'Les meilleures pizzas italiennes de la ville', '123 Rue de la Pizza', '0123456789', 'contact@pizzapalace.fr', 'PIZZA', 4.5, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', true, true, NOW(), NOW(), 0),
('22222222-2222-2222-2222-222222222222', 'Burger House', 'Burgers artisanaux et frites maison', '456 Avenue des Burgers', '0198765432', 'info@burgerhouse.fr', 'AMERICAIN', 4.2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', true, true, NOW(), NOW(), 0),
('33333333-3333-3333-3333-333333333333', 'Sushi Express', 'Sushis frais préparés quotidiennement', '789 Boulevard Tokyo', '0156789012', 'commande@sushiexpress.fr', 'JAPONAIS', 4.7, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', true, true, NOW(), NOW(), 0);

-- Horaires d'ouverture pour Pizza Palace
INSERT INTO opening_hours (id, restaurant_id, day_of_week, open_time, close_time) VALUES 
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MONDAY', '09:00', '18:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TUESDAY', '09:00', '18:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'WEDNESDAY', null, null),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'THURSDAY', '09:00', '18:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'FRIDAY', '09:00', '18:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'SATURDAY', '10:00', '17:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'SUNDAY', null, null);

-- Horaires d'ouverture pour Burger House
INSERT INTO opening_hours (id, restaurant_id, day_of_week, open_time, close_time) VALUES 
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'MONDAY', '11:00', '22:00'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'TUESDAY', '11:00', '22:00'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'WEDNESDAY', '11:00', '22:00'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'THURSDAY', '11:00', '22:00'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'FRIDAY', '11:00', '23:00'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'SATURDAY', '11:00', '23:00'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'SUNDAY', '12:00', '21:00');

-- Horaires d'ouverture pour Sushi Express
INSERT INTO opening_hours (id, restaurant_id, day_of_week, open_time, close_time) VALUES 
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'MONDAY', null, null),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'TUESDAY', '18:00', '23:00'),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'WEDNESDAY', '18:00', '23:00'),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'THURSDAY', '18:00', '23:00'),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'FRIDAY', '18:00', '00:00'),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'SATURDAY', '18:00', '00:00'),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'SUNDAY', '18:00', '22:00');

-- Utilisateurs (table 'user_account')
INSERT INTO user_account (id, email, password_hash, first_name, last_name, phone, address, created_at, updated_at, status, is_active, version) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user1@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean2', 'Dupont', '0612345678', '10 Rue de la Paix', NOW(), NOW(), 'ACTIVE', true, 0),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'marie@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Martin', '0623456789', '20 Avenue des Fleurs', NOW(), NOW(), 'ACTIVE', true, 0),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'paul@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Paul', 'Durand', '0634567890', '30 Place du Marché', NOW(), NOW(), 'ACTIVE', true, 0),
('12345678-1234-1234-1234-123456789012', 'mobile@oneeats.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Utilisateur', 'Mobile', '0645678901', '40 Boulevard Mobile', NOW(), NOW(), 'ACTIVE', true, 0),
('4ffe5398-4599-4c33-98ec-18a96fd9e200', 'jean.dupont@oneats.dev', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean', 'Dupont', '+33 6 12 34 56 78', '123 Rue de la Paix, 75001 Paris', NOW(), NOW(), 'ACTIVE', true, 0);

-- Menu items pour Pizza Palace
INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, preparation_time_minutes, allergens, created_at, updated_at, version) VALUES
('91111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Pizza Margherita', 'Tomate, mozzarella, basilic frais', 12.50, 'PIZZA', 'https://images.unsplash.com/photo-1604382354936-07c5b6d5c5b0', true, true, false, 15, 'gluten,dairy', NOW(), NOW(), 0),
('91111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Pizza Pepperoni', 'Tomate, mozzarella, pepperoni épicé', 14.00, 'PIZZA', 'https://images.unsplash.com/photo-1628840042765-356cda07504e', true, false, false, 18, 'gluten,dairy', NOW(), NOW(), 0),
('91111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Tiramisu', 'Dessert italien traditionnel', 7.00, 'DESSERT', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', true, true, false, 5, 'gluten,dairy,eggs', NOW(), NOW(), 0),
('91111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Coca-Cola', 'Boisson gazeuse 33cl', 3.00, 'BEVERAGE', null, true, true, true, 1, '', NOW(), NOW(), 0),
('91111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 'Pizza 4 Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 15.50, 'PIZZA', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', true, true, false, 20, 'gluten,dairy', NOW(), NOW(), 0),
('91111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111111', 'Pizza Personnalisée', 'Base tomate et mozzarella, créez votre pizza', 13.00, 'PIZZA', 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47', true, true, false, 18, 'gluten,dairy', NOW(), NOW(), 0),
('91111111-1111-1111-1111-111111111117', '11111111-1111-1111-1111-111111111111', 'Salade César', 'Salade romaine, parmesan, croûtons, sauce césar', 9.50, 'SALAD', 'https://images.unsplash.com/photo-1546793665-c74683f339c1', true, true, false, 8, 'gluten,dairy,eggs', NOW(), NOW(), 0),
('91111111-1111-1111-1111-111111111118', '11111111-1111-1111-1111-111111111111', 'Pasta Carbonara', 'Spaghetti, lardons, crème, parmesan, œuf', 12.00, 'PASTA', 'https://images.unsplash.com/photo-1621996346565-e3dbc794d72b', true, false, false, 12, 'gluten,dairy,eggs', NOW(), NOW(), 0);

-- Menu items pour Burger House
INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, preparation_time_minutes, allergens, created_at, updated_at, version) VALUES
('92222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Classic Burger', 'Steak haché, salade, tomate, cornichon', 11.00, 'BURGER', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', true, false, false, 12, 'gluten', NOW(), NOW(), 0),
('92222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Cheese Burger', 'Steak haché, cheddar, salade, tomate', 12.50, 'BURGER', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90', true, false, false, 12, 'gluten,dairy', NOW(), NOW(), 0),
('92222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Frites', 'Frites croustillantes maison', 4.50, 'SIDE', null, true, true, true, 8, '', NOW(), NOW(), 0);

-- Options pour Salade César (91111111-1111-1111-1111-111111111117)
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at, version) VALUES
('a1111111-1111-1111-1111-111111111117', '91111111-1111-1111-1111-111111111117', 'Taille de salade', 'CHOICE', true, 1, 1, NOW(), NOW(), 0),
('a2222222-2222-2222-2222-222222222227', '91111111-1111-1111-1111-111111111117', 'Protéines', 'CHOICE', false, 1, 2, NOW(), NOW(), 0),
('a3333333-3333-3333-3333-333333333337', '91111111-1111-1111-1111-111111111117', 'Options à retirer', 'MODIFICATION', false, null, 3, NOW(), NOW(), 0);

-- Taille de salade
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('a4444444-4444-4444-4444-444444444447', 'a1111111-1111-1111-1111-111111111117', 'Entrée', 0.00, 1, true, NOW(), NOW(), 0),
('a5555555-5555-5555-5555-555555555557', 'a1111111-1111-1111-1111-111111111117', 'Plat principal', 3.50, 2, true, NOW(), NOW(), 0);

-- Protéines pour salade
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('a6666666-6666-6666-6666-666666666667', 'a2222222-2222-2222-2222-222222222227', 'Poulet grillé', 4.00, 1, true, NOW(), NOW(), 0),
('a7777777-7777-7777-7777-777777777777', 'a2222222-2222-2222-2222-222222222227', 'Crevettes', 5.50, 2, true, NOW(), NOW(), 0),
('a8888888-8888-8888-8888-888888888888', 'a2222222-2222-2222-2222-222222222227', 'Saumon fumé', 6.00, 3, true, NOW(), NOW(), 0);

-- Options à retirer
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('a9999999-9999-9999-9999-999999999999', 'a3333333-3333-3333-3333-333333333337', 'Sans croûtons', 0.00, 1, true, NOW(), NOW(), 0),
('b1111111-1111-1111-1111-111111111117', 'a3333333-3333-3333-3333-333333333337', 'Sans parmesan', 0.00, 2, true, NOW(), NOW(), 0),
('b2222222-2222-2222-2222-222222222227', 'a3333333-3333-3333-3333-333333333337', 'Sauce à part', 0.00, 3, true, NOW(), NOW(), 0);

-- Sample menu item options for Pizza Margherita
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at, version) VALUES
('a1111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111111', 'Choix de base', 'MODIFICATION', false, null, 1, NOW(), NOW(), 0),
('a2222222-2222-2222-2222-222222222222', '91111111-1111-1111-1111-111111111111', 'Suppléments payants', 'EXTRA', false, null, 2, NOW(), NOW(), 0);

-- Choices for "Choix de base" (remove ingredients)
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Sans basilic', 0.00, 1, true, NOW(), NOW(), 0),
('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Sans mozzarella', 0.00, 2, true, NOW(), NOW(), 0);

-- Choices for "Suppléments payants" (extra ingredients)
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('b3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'Extra mozzarella', 2.00, 1, true, NOW(), NOW(), 0),
('b4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'Jambon de Parme', 3.50, 2, true, NOW(), NOW(), 0),
('b5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 'Champignons', 1.50, 3, true, NOW(), NOW(), 0);

-- Sample options for Classic Burger
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at, version) VALUES
('c1111111-1111-1111-1111-111111111111', '92222222-2222-2222-2222-222222222221', 'Cuisson du steak', 'CHOICE', true, 1, 1, NOW(), NOW(), 0),
('c2222222-2222-2222-2222-222222222222', '92222222-2222-2222-2222-222222222221', 'Options gratuites', 'MODIFICATION', false, null, 2, NOW(), NOW(), 0),
('c3333333-3333-3333-3333-333333333333', '92222222-2222-2222-2222-222222222221', 'Extras', 'EXTRA', false, null, 3, NOW(), NOW(), 0);

-- Cuisson choices
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Saignant', 0.00, 1, true, NOW(), NOW(), 0),
('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'À point', 0.00, 2, true, NOW(), NOW(), 0),
('d3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Bien cuit', 0.00, 3, true, NOW(), NOW(), 0);

-- Remove options
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('d4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Sans cornichon', 0.00, 1, true, NOW(), NOW(), 0),
('d5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Sans salade', 0.00, 2, true, NOW(), NOW(), 0),
('d6666666-6666-6666-6666-666666666666', 'c2222222-2222-2222-2222-222222222222', 'Sans tomate', 0.00, 3, true, NOW(), NOW(), 0);

-- Extra options
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('d7777777-7777-7777-7777-777777777777', 'c3333333-3333-3333-3333-333333333333', 'Fromage cheddar', 1.50, 1, true, NOW(), NOW(), 0),
('d8888888-8888-8888-8888-888888888888', 'c3333333-3333-3333-3333-333333333333', 'Bacon', 2.00, 2, true, NOW(), NOW(), 0),
('d9999999-9999-9999-9999-999999999999', 'c3333333-3333-3333-3333-333333333333', 'Avocat', 2.50, 3, true, NOW(), NOW(), 0);

-- Options pour Pizza Personnalisée (91111111-1111-1111-1111-111111111116)
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at, version) VALUES
('e1111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111116', 'Taille de la pizza', 'CHOICE', true, 1, 1, NOW(), NOW(), 0),
('e2222222-2222-2222-2222-222222222222', '91111111-1111-1111-1111-111111111116', 'Garnitures viandes', 'CHOICE', false, null, 2, NOW(), NOW(), 0),
('e3333333-3333-3333-3333-333333333333', '91111111-1111-1111-1111-111111111116', 'Garnitures légumes', 'CHOICE', false, null, 3, NOW(), NOW(), 0),
('e4444444-4444-4444-4444-444444444444', '91111111-1111-1111-1111-111111111116', 'Fromages supplémentaires', 'EXTRA', false, null, 4, NOW(), NOW(), 0);

-- Choix pour taille de pizza
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Petite (26cm)', 0.00, 1, true, NOW(), NOW(), 0),
('f2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'Moyenne (30cm)', 3.00, 2, true, NOW(), NOW(), 0),
('f3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'Grande (34cm)', 5.00, 3, true, NOW(), NOW(), 0);

-- Garnitures viandes
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('f4444444-4444-4444-4444-444444444444', 'e2222222-2222-2222-2222-222222222222', 'Pepperoni', 2.50, 1, true, NOW(), NOW(), 0),
('f5555555-5555-5555-5555-555555555555', 'e2222222-2222-2222-2222-222222222222', 'Jambon', 2.00, 2, true, NOW(), NOW(), 0),
('f6666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222', 'Chorizo', 3.00, 3, true, NOW(), NOW(), 0),
('f7777777-7777-7777-7777-777777777777', 'e2222222-2222-2222-2222-222222222222', 'Saucisse italienne', 2.50, 4, true, NOW(), NOW(), 0);

-- Garnitures légumes
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('f8888888-8888-8888-8888-888888888888', 'e3333333-3333-3333-3333-333333333333', 'Champignons', 1.50, 1, true, NOW(), NOW(), 0),
('f9999999-9999-9999-9999-999999999999', 'e3333333-3333-3333-3333-333333333333', 'Poivrons', 1.50, 2, true, NOW(), NOW(), 0),
('a1111111-1111-1111-1111-111111111118', 'e3333333-3333-3333-3333-333333333333', 'Olives noires', 1.00, 3, true, NOW(), NOW(), 0),
('a2222222-2222-2222-2222-222222222228', 'e3333333-3333-3333-3333-333333333333', 'Roquette', 2.00, 4, true, NOW(), NOW(), 0),
('a3333333-3333-3333-3333-333333333338', 'e3333333-3333-3333-3333-333333333333', 'Tomates cerises', 1.50, 5, true, NOW(), NOW(), 0);

-- Fromages supplémentaires
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('a4444444-4444-4444-4444-444444444448', 'e4444444-4444-4444-4444-444444444444', 'Gorgonzola', 2.50, 1, true, NOW(), NOW(), 0),
('a5555555-5555-5555-5555-555555555558', 'e4444444-4444-4444-4444-444444444444', 'Chèvre', 2.00, 2, true, NOW(), NOW(), 0),
('a6666666-6666-6666-6666-666666666668', 'e4444444-4444-4444-4444-444444444444', 'Parmesan', 2.00, 3, true, NOW(), NOW(), 0);

-- Options pour Pasta Carbonara (91111111-1111-1111-1111-111111111118)
INSERT INTO menu_item_option (id, menu_item_id, name, option_type, is_required, max_choices, display_order, created_at, updated_at, version) VALUES
('b3333333-3333-3333-3333-333333333337', '91111111-1111-1111-1111-111111111118', 'Type de pâtes', 'CHOICE', true, 1, 1, NOW(), NOW(), 0),
('b4444444-4444-4444-4444-444444444447', '91111111-1111-1111-1111-111111111118', 'Suppléments', 'EXTRA', false, null, 2, NOW(), NOW(), 0),
('b5555555-5555-5555-5555-555555555557', '91111111-1111-1111-1111-111111111118', 'Modifications', 'MODIFICATION', false, null, 3, NOW(), NOW(), 0);

-- Types de pâtes
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('b6666666-6666-6666-6666-666666666667', 'b3333333-3333-3333-3333-333333333337', 'Spaghetti', 0.00, 1, true, NOW(), NOW(), 0),
('b7777777-7777-7777-7777-777777777777', 'b3333333-3333-3333-3333-333333333337', 'Penne', 0.00, 2, true, NOW(), NOW(), 0),
('b8888888-8888-8888-8888-888888888888', 'b3333333-3333-3333-3333-333333333337', 'Tagliatelles', 1.00, 3, true, NOW(), NOW(), 0);

-- Suppléments pâtes
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('b9999999-9999-9999-9999-999999999999', 'b4444444-4444-4444-4444-444444444447', 'Extra lardons', 2.50, 1, true, NOW(), NOW(), 0),
('a1111111-1111-1111-1111-111111111119', 'b4444444-4444-4444-4444-444444444447', 'Extra parmesan', 2.00, 2, true, NOW(), NOW(), 0),
('a2222222-2222-2222-2222-222222222229', 'b4444444-4444-4444-4444-444444444447', 'Champignons', 2.00, 3, true, NOW(), NOW(), 0);

-- Modifications
INSERT INTO menu_item_choice (id, menu_item_option_id, name, additional_price, display_order, is_available, created_at, updated_at, version) VALUES
('a3333333-3333-3333-3333-333333333339', 'b5555555-5555-5555-5555-555555555557', 'Sans lardons', 0.00, 1, true, NOW(), NOW(), 0),
('a4444444-4444-4444-4444-444444444449', 'b5555555-5555-5555-5555-555555555557', 'Sans œuf', 0.00, 2, true, NOW(), NOW(), 0),
('a5555555-5555-5555-5555-555555555559', 'b5555555-5555-5555-5555-555555555557', 'Sauce allégée', 0.00, 3, true, NOW(), NOW(), 0);

-- Commandes - 4 par status comme demandé (correction des statuts)
INSERT INTO orders (id, order_number, user_id, restaurant_id, status, total_amount, special_instructions, created_at, updated_at, estimated_pickup_time, version) VALUES
-- PENDING (4 commandes) 
('10101010-1010-1010-1010-101010101010', 'CMD-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'PENDING', 29.50, 'Commande pour ce soir', NOW() - INTERVAL '2 minutes', NOW(), NOW() + INTERVAL '25 minutes', 0),
('10101010-1010-1010-1010-101010101011', 'CMD-002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'PENDING', 23.50, 'Pas trop cuit le steak', NOW() - INTERVAL '3 minutes', NOW(), NOW() + INTERVAL '20 minutes', 0),
('10101010-1010-1010-1010-101010101012', 'CMD-003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'PENDING', 18.50, '', NOW() - INTERVAL '1 minute', NOW(), NOW() + INTERVAL '30 minutes', 0),
('10101010-1010-1010-1010-101010101013', 'CMD-004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'PENDING', 16.50, 'Sauce à part svp', NOW() - INTERVAL '4 minutes', NOW(), NOW() + INTERVAL '18 minutes', 0),

-- PREPARING (4 commandes)
('11111111-1111-1111-1111-111111111111', 'CMD-005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'PREPARING', 25.50, 'Pas trop épicé svp', NOW() - INTERVAL '15 minutes', NOW(), NOW() + INTERVAL '10 minutes', 0),
('14141414-1414-1414-1414-141414141414', 'CMD-006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'PREPARING', 31.50, 'Extra fromage', NOW() - INTERVAL '12 minutes', NOW(), NOW() + INTERVAL '8 minutes', 0),
('14141414-1414-1414-1414-141414141415', 'CMD-007', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'PREPARING', 24.00, 'Bien cuit', NOW() - INTERVAL '10 minutes', NOW(), NOW() + INTERVAL '12 minutes', 0),
('14141414-1414-1414-1414-141414141416', 'CMD-008', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'PREPARING', 22.50, '', NOW() - INTERVAL '8 minutes', NOW(), NOW() + INTERVAL '15 minutes', 0),

-- READY (4 commandes)
('21212121-2121-2121-2121-212121212121', 'CMD-009', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'READY', 18.00, '', NOW() - INTERVAL '25 minutes', NOW(), NOW() - INTERVAL '2 minutes', 0),
('24242424-2424-2424-2424-242424242424', 'CMD-010', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'READY', 21.00, 'Sauce à part', NOW() - INTERVAL '30 minutes', NOW(), NOW() - INTERVAL '5 minutes', 0),
('24242424-2424-2424-2424-242424242425', 'CMD-011', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'READY', 28.00, 'Merci beaucoup!', NOW() - INTERVAL '20 minutes', NOW(), NOW() - INTERVAL '1 minute', 0),
('24242424-2424-2424-2424-242424242426', 'CMD-012', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'READY', 19.50, 'Sans cornichon', NOW() - INTERVAL '35 minutes', NOW(), NOW() - INTERVAL '3 minutes', 0),

-- COMPLETED (4 commandes) 
('31313131-3131-3131-3131-313131313131', 'CMD-013', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'COMPLETED', 27.00, 'Parfait!', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '25 minutes', 0),
('34343434-3434-3434-3434-343434343434', 'CMD-014', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'COMPLETED', 20.50, '', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '30 minutes', 0),
('34343434-3434-3434-3434-343434343435', 'CMD-015', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'COMPLETED', 15.50, 'Très bon!', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '20 minutes', 0),
('34343434-3434-3434-3434-343434343436', 'CMD-016', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'COMPLETED', 32.00, 'Service rapide', NOW() - INTERVAL '55 minutes', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '35 minutes', 0),

-- Commandes utilisateur mobile
('12340101-0101-0101-0101-010101010101', 'CMD-017', '12345678-1234-1234-1234-123456789012', '11111111-1111-1111-1111-111111111111', 'PENDING', 19.50, 'Commande depuis mobile', NOW() - INTERVAL '2 minutes', NOW(), NOW() + INTERVAL '20 minutes', 0),
('12340202-0202-0202-0202-020202020202', 'CMD-018', '12345678-1234-1234-1234-123456789012', '22222222-2222-2222-2222-222222222222', 'PREPARING', 16.50, 'Test app mobile', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '10 minutes', 0),

-- Commandes utilisateur Jean Dupont (dev)
('4ffe0001-0001-0001-0001-000000000001', 'CMD-019', '4ffe5398-4599-4c33-98ec-18a96fd9e200', '11111111-1111-1111-1111-111111111111', 'COMPLETED', 25.50, 'Première commande', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 0),
('4ffe0002-0002-0002-0002-000000000002', 'CMD-020', '4ffe5398-4599-4c33-98ec-18a96fd9e200', '22222222-2222-2222-2222-222222222222', 'COMPLETED', 18.00, 'Super burger!', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 0),
('4ffe0003-0003-0003-0003-000000000003', 'CMD-021', '4ffe5398-4599-4c33-98ec-18a96fd9e200', '11111111-1111-1111-1111-111111111111', 'READY', 32.50, 'Commande du soir', NOW() - INTERVAL '30 minutes', NOW(), NOW() + INTERVAL '5 minutes', 0);

-- Order Items pour toutes les commandes
INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, unit_price, quantity, special_notes, created_at, updated_at, version) VALUES
-- Items pour commandes PENDING
('10101010-0000-0000-0000-000000000001', '10101010-1010-1010-1010-101010101010', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW(), 0),
('10101010-0000-0000-0000-000000000002', '10101010-1010-1010-1010-101010101010', '91111111-1111-1111-1111-111111111115', 'Pizza 4 Fromages', 15.50, 1, '', NOW(), NOW(), 0),
('10101010-0000-0000-0000-000000000003', '10101010-1010-1010-1010-101010101010', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 1, '', NOW(), NOW(), 0),

('10101010-0000-0000-0000-000000000011', '10101010-1010-1010-1010-101010101011', '92222222-2222-2222-2222-222222222222', 'Cheese Burger', 12.50, 1, 'Pas trop cuit', NOW(), NOW(), 0),
('10101010-0000-0000-0000-000000000012', '10101010-1010-1010-1010-101010101011', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, '', NOW(), NOW(), 0),

('10101010-0000-0000-0000-000000000021', '10101010-1010-1010-1010-101010101012', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW(), 0),
('10101010-0000-0000-0000-000000000022', '10101010-1010-1010-1010-101010101012', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 2, '', NOW(), NOW(), 0),

('10101010-0000-0000-0000-000000000031', '10101010-1010-1010-1010-101010101013', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, 'Sauce à part', NOW(), NOW(), 0),
('10101010-0000-0000-0000-000000000032', '10101010-1010-1010-1010-101010101013', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 1, '', NOW(), NOW(), 0),

-- Items pour commandes PREPARING
('11111111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, 'Pas trop épicé', NOW(), NOW(), 0),
('11111111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, '', NOW(), NOW(), 0),
('11111111-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 2, '', NOW(), NOW(), 0),

('14141414-0000-0000-0000-000000000001', '14141414-1414-1414-1414-141414141414', '91111111-1111-1111-1111-111111111112', 'Pizza Pepperoni', 14.00, 1, 'Extra fromage', NOW(), NOW(), 0),
('14141414-0000-0000-0000-000000000002', '14141414-1414-1414-1414-141414141414', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW(), 0),
('14141414-0000-0000-0000-000000000003', '14141414-1414-1414-1414-141414141414', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 1, '', NOW(), NOW(), 0),
('14141414-0000-0000-0000-000000000004', '14141414-1414-1414-1414-141414141414', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 2.00, 1, '', NOW(), NOW(), 0),

('14141414-0000-0000-0000-000000000011', '14141414-1414-1414-1414-141414141415', '92222222-2222-2222-2222-222222222222', 'Cheese Burger', 12.50, 1, 'Bien cuit', NOW(), NOW(), 0),
('14141414-0000-0000-0000-000000000012', '14141414-1414-1414-1414-141414141415', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, '', NOW(), NOW(), 0),
('14141414-0000-0000-0000-000000000013', '14141414-1414-1414-1414-141414141415', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 1, '', NOW(), NOW(), 0),

('14141414-0000-0000-0000-000000000021', '14141414-1414-1414-1414-141414141416', '91111111-1111-1111-1111-111111111115', 'Pizza 4 Fromages', 15.50, 1, '', NOW(), NOW(), 0),
('14141414-0000-0000-0000-000000000022', '14141414-1414-1414-1414-141414141416', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, '', NOW(), NOW(), 0),

-- Items pour commandes READY
('21212121-0000-0000-0000-000000000001', '21212121-2121-2121-2121-212121212121', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW(), 0),
('21212121-0000-0000-0000-000000000002', '21212121-2121-2121-2121-212121212121', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 1, '', NOW(), NOW(), 0),
('21212121-0000-0000-0000-000000000003', '21212121-2121-2121-2121-212121212121', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 2.50, 1, '', NOW(), NOW(), 0),

('24242424-0000-0000-0000-000000000001', '24242424-2424-2424-2424-242424242424', '91111111-1111-1111-1111-111111111112', 'Pizza Pepperoni', 14.00, 1, 'Sauce à part', NOW(), NOW(), 0),
('24242424-0000-0000-0000-000000000002', '24242424-2424-2424-2424-242424242424', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, '', NOW(), NOW(), 0),

('24242424-0000-0000-0000-000000000011', '24242424-2424-2424-2424-242424242425', '92222222-2222-2222-2222-222222222222', 'Cheese Burger', 12.50, 2, '', NOW(), NOW(), 0),
('24242424-0000-0000-0000-000000000012', '24242424-2424-2424-2424-242424242425', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 1, '', NOW(), NOW(), 0),

('24242424-0000-0000-0000-000000000021', '24242424-2424-2424-2424-242424242426', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, 'Sans cornichon', NOW(), NOW(), 0),
('24242424-0000-0000-0000-000000000022', '24242424-2424-2424-2424-242424242426', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, '', NOW(), NOW(), 0),

-- Items pour commandes COMPLETED
('31313131-0000-0000-0000-000000000001', '31313131-3131-3131-3131-313131313131', '91111111-1111-1111-1111-111111111115', 'Pizza 4 Fromages', 15.50, 1, '', NOW(), NOW(), 0),
('31313131-0000-0000-0000-000000000002', '31313131-3131-3131-3131-313131313131', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW(), 0),

('34343434-0000-0000-0000-000000000001', '34343434-3434-3434-3434-343434343434', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, '', NOW(), NOW(), 0),
('34343434-0000-0000-0000-000000000002', '34343434-3434-3434-3434-343434343434', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 2, '', NOW(), NOW(), 0),

('34343434-0000-0000-0000-000000000011', '34343434-3434-3434-3434-343434343435', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW(), 0),
('34343434-0000-0000-0000-000000000012', '34343434-3434-3434-3434-343434343435', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 1, '', NOW(), NOW(), 0),

('34343434-0000-0000-0000-000000000021', '34343434-3434-3434-3434-343434343436', '92222222-2222-2222-2222-222222222222', 'Cheese Burger', 12.50, 2, '', NOW(), NOW(), 0),
('34343434-0000-0000-0000-000000000022', '34343434-3434-3434-3434-343434343436', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 1, '', NOW(), NOW(), 0),
('34343434-0000-0000-0000-000000000023', '34343434-3434-3434-3434-343434343436', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, '', NOW(), NOW(), 0),

-- Items pour commandes utilisateur mobile
('12340001-0001-0001-0001-000000000001', '12340101-0101-0101-0101-010101010101', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, 'Commande mobile', NOW(), NOW(), 0),
('12340001-0001-0001-0001-000000000002', '12340101-0101-0101-0101-010101010101', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.50, 2, '', NOW(), NOW(), 0),

('12340002-0002-0002-0002-000000000001', '12340202-0202-0202-0202-020202020202', '92222222-2222-2222-2222-222222222221', 'Classic Burger', 11.00, 1, 'Test mobile', NOW(), NOW(), 0),
('12340002-0002-0002-0002-000000000002', '12340202-0202-0202-0202-020202020202', '92222222-2222-2222-2222-222222222223', 'Frites', 5.50, 1, '', NOW(), NOW(), 0),

-- Items pour commandes Jean Dupont (dev)
('4ffe0001-0001-0001-0001-000000000001', '4ffe0001-0001-0001-0001-000000000001', '91111111-1111-1111-1111-111111111115', 'Pizza 4 Fromages', 15.50, 1, '', NOW(), NOW(), 0),
('4ffe0001-0001-0001-0001-000000000002', '4ffe0001-0001-0001-0001-000000000001', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, '', NOW(), NOW(), 0),
('4ffe0001-0001-0001-0001-000000000003', '4ffe0001-0001-0001-0001-000000000001', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 1, '', NOW(), NOW(), 0),

('4ffe0002-0002-0002-0002-000000000001', '4ffe0002-0002-0002-0002-000000000002', '92222222-2222-2222-2222-222222222222', 'Cheese Burger', 12.50, 1, '', NOW(), NOW(), 0),
('4ffe0002-0002-0002-0002-000000000002', '4ffe0002-0002-0002-0002-000000000002', '92222222-2222-2222-2222-222222222223', 'Frites', 4.50, 1, '', NOW(), NOW(), 0),

('4ffe0003-0003-0003-0003-000000000001', '4ffe0003-0003-0003-0003-000000000003', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, '', NOW(), NOW(), 0),
('4ffe0003-0003-0003-0003-000000000002', '4ffe0003-0003-0003-0003-000000000003', '91111111-1111-1111-1111-111111111112', 'Pizza Pepperoni', 14.00, 1, '', NOW(), NOW(), 0),
('4ffe0003-0003-0003-0003-000000000003', '4ffe0003-0003-0003-0003-000000000003', '91111111-1111-1111-1111-111111111114', 'Coca-Cola', 3.00, 2, '', NOW(), NOW(), 0);