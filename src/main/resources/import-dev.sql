-- Données de développement pour OneEats
-- Ce fichier est chargé automatiquement en mode dev avec drop-and-create

-- Restaurants de test
INSERT INTO restaurant (id, name, description, address, phone, email, cuisine_type, rating, image_url, is_open, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Pizza Palace', 'Les meilleures pizzas de la ville', '123 Rue de la Pizza, 75001 Paris', '0123456789', 'contact@pizzapalace.fr', 'PIZZA', 4.5, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Burger King Local', 'Burgers gourmets faits maison', '456 Avenue des Burgers, 75002 Paris', '0123456790', 'hello@burgerking.local.fr', 'BURGER', 4.2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Sushi Zen', 'Sushi frais et traditionnel', '789 Boulevard du Japon, 75003 Paris', '0123456791', 'zen@sushi.fr', 'JAPONAISE', 4.8, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351', true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Café Français', 'Cuisine française authentique', '321 Rue de France, 75004 Paris', '0123456792', 'bonjour@cafefrancais.fr', 'FRANCAISE', 4.3, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', false, NOW(), NOW());

-- Utilisateurs de test
INSERT INTO user_account (id, email, password_hash, first_name, last_name, phone, address, created_at, updated_at, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user1@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean', 'Dupont', '0612345678', '10 Rue de la Paix, 75001 Paris', NOW(), NOW(), true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user2@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marie', 'Martin', '0612345679', '20 Avenue des Champs, 75002 Paris', NOW(), NOW(), true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'System', '0612345680', '1 Place de l''Admin, 75000 Paris', NOW(), NOW(), true);

-- Commandes d'exemple pour tester le système
INSERT INTO order_entity (id, user_id, restaurant_id, status, total_amount, special_instructions, created_at, updated_at, estimated_pickup_time) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'EN_PREPARATION', 25.50, 'Pas trop épicé svp', NOW() - INTERVAL '10 minutes', NOW(), NOW() + INTERVAL '15 minutes'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'PRETE', 18.00, 'Sans oignons', NOW() - INTERVAL '25 minutes', NOW(), NOW() - INTERVAL '2 minutes'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'RECUPEREE', 32.80, '', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '35 minutes');

-- Items des commandes (exemples)
INSERT INTO order_item (id, order_id, menu_item_id, menu_item_name, unit_price, quantity, special_notes) VALUES
-- Commande 1 (Pizza Palace)
('10000000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '91111111-1111-1111-1111-111111111111', 'Pizza Margherita', 12.50, 1, ''),
('10000000-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '91111111-1111-1111-1111-111111111112', 'Coca-Cola', 3.00, 2, ''),
('10000000-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '91111111-1111-1111-1111-111111111113', 'Tiramisu', 7.00, 1, ''),

-- Commande 2 (Burger King Local)
('20000000-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '92222222-2222-2222-2222-222222222221', 'Burger Classic', 15.00, 1, 'Cuisson à point'),
('20000000-0000-0000-0000-000000000002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '92222222-2222-2222-2222-222222222222', 'Frites', 3.00, 1, ''),

-- Commande 3 (Sushi Zen)  
('30000000-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '93333333-3333-3333-3333-333333333331', 'Assortiment Sushi 12 pièces', 24.80, 1, ''),
('30000000-0000-0000-0000-000000000002', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '93333333-3333-3333-3333-333333333332', 'Soupe Miso', 4.50, 1, ''),
('30000000-0000-0000-0000-000000000003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '93333333-3333-3333-3333-333333333333', 'Thé Vert', 3.50, 1, '');

-- Items de menu pour Pizza Palace
INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, preparation_time_minutes, allergens, created_at, updated_at) VALUES
('91111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Pizza Margherita', 'Tomate, mozzarella, basilic frais', 12.50, 'Pizza', 'https://images.unsplash.com/photo-1604382354936-07c5b6d5c5b0', true, true, false, 15, 'gluten,lactose', NOW(), NOW()),
('91111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Pizza Pepperoni', 'Tomate, mozzarella, pepperoni', 14.00, 'Pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e', true, false, false, 15, 'gluten,lactose', NOW(), NOW()),
('91111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Tiramisu', 'Dessert italien traditionnel', 7.00, 'Dessert', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', true, true, false, 5, 'gluten,lactose,eggs', NOW(), NOW()),
('91111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Coca-Cola', 'Boisson gazeuse 33cl', 3.00, 'Boisson', null, true, true, true, 1, '', NOW(), NOW());

-- Items de menu pour Burger King Local
INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, preparation_time_minutes, allergens, created_at, updated_at) VALUES
('92222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Burger Classic', 'Steak de bœuf, salade, tomate, oignon, cornichon', 15.00, 'Burger', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add', true, false, false, 12, 'gluten,sesame', NOW(), NOW()),
('92222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Burger Végétarien', 'Steak végétal, salade, tomate, avocat', 13.50, 'Burger', 'https://images.unsplash.com/photo-1525059696034-4967a729002e', true, true, true, 12, 'gluten,sesame', NOW(), NOW()),
('92222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Frites', 'Frites de pomme de terre croustillantes', 4.50, 'Accompagnement', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877', true, true, true, 8, '', NOW(), NOW()),
('92222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'Milkshake Vanille', 'Milkshake onctueux à la vanille', 5.50, 'Boisson', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699', true, true, false, 3, 'lactose', NOW(), NOW());

-- Items de menu pour Sushi Zen
INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, preparation_time_minutes, allergens, created_at, updated_at) VALUES
('93333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Assortiment Sushi 12 pièces', 'Sélection de sushi frais du chef', 24.80, 'Sushi', 'https://images.unsplash.com/photo-1553621042-f6e147245754', true, false, false, 20, 'fish,sesame', NOW(), NOW()),
('93333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Sushi Végétarien 8 pièces', 'Sushi aux légumes et avocat', 18.50, 'Sushi', 'https://images.unsplash.com/photo-1563612116625-3012372fccce', true, true, false, 15, 'sesame', NOW(), NOW()),
('93333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Soupe Miso', 'Soupe traditionnelle japonaise', 4.50, 'Entrée', 'https://images.unsplash.com/photo-1547592166-23ac45744acd', true, true, true, 5, 'soy', NOW(), NOW()),
('93333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'Thé Vert', 'Thé vert japonais premium', 3.50, 'Boisson', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc', true, true, true, 2, '', NOW(), NOW());

-- Items de menu pour Café Français
INSERT INTO menu_item (id, restaurant_id, name, description, price, category, image_url, is_available, is_vegetarian, is_vegan, preparation_time_minutes, allergens, created_at, updated_at) VALUES
('94444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', 'Coq au Vin', 'Plat traditionnel français au vin rouge', 22.00, 'Plat Principal', 'https://images.unsplash.com/photo-1574484284002-952d92456975', true, false, false, 25, '', NOW(), NOW()),
('94444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', 'Ratatouille', 'Légumes du soleil mijotés', 16.50, 'Plat Principal', 'https://images.unsplash.com/photo-1572441713132-51c75654db73', true, true, true, 20, '', NOW(), NOW()),
('94444444-4444-4444-4444-444444444443', '44444444-4444-4444-4444-444444444444', 'Tarte Tatin', 'Tarte aux pommes caramélisées', 8.00, 'Dessert', 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c', true, true, false, 10, 'gluten,lactose,eggs', NOW(), NOW()),
('94444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Vin Rouge de Loire', 'Verre de vin rouge local', 6.50, 'Boisson', null, true, true, true, 1, 'sulfites', NOW(), NOW());

-- Log pour vérifier le chargement
INSERT INTO system_log (message, created_at) VALUES ('✅ Données de développement chargées avec succès', NOW()) ON CONFLICT DO NOTHING;