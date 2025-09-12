-- Données de test pour OneEats
-- Utilisateur de test
INSERT INTO users (id, created_at, updated_at, first_name, last_name, email, password_hash, status) 
VALUES ('22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'John', 'Doe', 'john.doe@example.com', '$2a$10$dummy.hash', 'ACTIVE');

-- Restaurant Pizza Palace pour les tests
INSERT INTO restaurants (id, created_at, updated_at, name, description, address, phone, email, cuisine_type, operating_hours, status) 
VALUES ('11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Pizza Palace', 'La meilleure pizza en ville', '123 Main Street', '+33123456789', 'contact@pizzapalace.com', 'ITALIAN', '11:00-23:00', 'ACTIVE');

-- Menu items pour Pizza Palace
INSERT INTO menu_items (id, created_at, updated_at, restaurant_id, name, description, price, category, available, vegetarian, vegan, preparation_time, allergens) 
VALUES ('33333333-3333-3333-3333-333333333333', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '11111111-1111-1111-1111-111111111111', 'Margherita', 'Pizza classique tomate mozarella', 12.50, 'PIZZA', true, true, false, 15, ARRAY['GLUTEN', 'DAIRY']);

INSERT INTO menu_items (id, created_at, updated_at, restaurant_id, name, description, price, category, available, vegetarian, vegan, preparation_time, allergens) 
VALUES ('44444444-4444-4444-4444-444444444444', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '11111111-1111-1111-1111-111111111111', 'Pepperoni', 'Pizza pepperoni épicée', 14.50, 'PIZZA', true, false, false, 18, ARRAY['GLUTEN', 'DAIRY']);

INSERT INTO menu_items (id, created_at, updated_at, restaurant_id, name, description, price, category, available, vegetarian, vegan, preparation_time, allergens) 
VALUES ('55555555-5555-5555-5555-555555555555', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '11111111-1111-1111-1111-111111111111', 'Salade César', 'Salade fraîche avec croûtons', 9.50, 'SALAD', true, true, false, 5, ARRAY['GLUTEN', 'DAIRY']);

-- Commande de test
INSERT INTO orders (id, created_at, updated_at, user_id, restaurant_id, status, total_amount, special_instructions, order_date) 
VALUES ('10101010-1010-1010-1010-101010101010', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'EN_ATTENTE', 12.50, 'Pas trop cuite', CURRENT_TIMESTAMP);

-- Item de commande
INSERT INTO order_items (id, created_at, updated_at, order_id, menu_item_id, menu_item_name, unit_price, quantity, special_notes) 
VALUES ('60606060-6060-6060-6060-606060606060', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '10101010-1010-1010-1010-101010101010', '33333333-3333-3333-3333-333333333333', 'Margherita', 12.50, 1, 'Bien cuite');

-- Horaires d'ouverture pour Pizza Palace
INSERT INTO opening_hours (id, restaurant_id, day_of_week, open_time, close_time) 
VALUES 
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'MONDAY', '09:00', '18:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'TUESDAY', '09:00', '18:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'WEDNESDAY', null, null),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'THURSDAY', '09:00', '18:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'FRIDAY', '09:00', '18:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'SATURDAY', '10:00', '17:00'),
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'SUNDAY', null, null);

-- Notification de test
INSERT INTO notifications (id, created_at, updated_at, destinataire, titre, message, type, lu, date_creation) 
VALUES ('70707070-7070-7070-7070-707070707070', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '22222222-2222-2222-2222-222222222222', 'Commande confirmée', 'Votre commande a été confirmée', 'ORDER_CONFIRMATION', false, CURRENT_TIMESTAMP);