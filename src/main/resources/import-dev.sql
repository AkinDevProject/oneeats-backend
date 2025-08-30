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

-- Log pour vérifier le chargement
INSERT INTO system_log (message, created_at) VALUES ('✅ Données de développement chargées avec succès', NOW()) ON CONFLICT DO NOTHING;