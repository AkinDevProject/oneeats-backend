-- Fix null version fields in existing data
UPDATE orders SET version = 0 WHERE version IS NULL;
UPDATE restaurants SET version = 0 WHERE version IS NULL;
UPDATE menu_items SET version = 0 WHERE version IS NULL;
UPDATE users SET version = 0 WHERE version IS NULL;
UPDATE order_items SET version = 0 WHERE version IS NULL;