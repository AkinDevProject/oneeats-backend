# Modèle de Données - OneEats

## Diagramme ERD (Entity Relationship Diagram)

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      users       │       │   restaurants    │       │    categories    │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ email            │       │ name             │       │ name             │
│ password_hash    │       │ description      │       │ slug             │
│ first_name       │       │ address          │       │ parent_id (FK)   │
│ last_name        │       │ phone            │       └──────────────────┘
│ phone            │       │ email            │                │
│ address          │       │ cuisine_type     │                │
│ is_active        │       │ rating           │                │
│ created_at       │       │ is_open          │                │
│ updated_at       │       │ is_active        │                │
└────────┬─────────┘       │ schedule         │                │
         │                 │ image_url        │                │
         │ 1:N             │ owner_id (FK)    │                │
         │                 │ created_at       │                │
         ▼                 │ updated_at       │                │
┌──────────────────┐       └────────┬─────────┘                │
│      orders      │                │                          │
├──────────────────┤                │ 1:N                      │
│ id (PK)          │                ▼                          │
│ user_id (FK)     │◀──────┌──────────────────┐               │
│ restaurant_id(FK)│       │    menu_items    │               │
│ status           │       ├──────────────────┤               │
│ total_amount     │       │ id (PK)          │               │
│ special_instr.   │       │ restaurant_id(FK)│───────────────┘
│ created_at       │       │ name             │
│ updated_at       │       │ description      │
└────────┬─────────┘       │ price            │
         │                 │ category         │
         │ 1:N             │ is_vegetarian    │
         ▼                 │ is_vegan         │
┌──────────────────┐       │ allergens        │
│   order_items    │       │ preparation_time │
├──────────────────┤       │ is_available     │
│ id (PK)          │       │ image_url        │
│ order_id (FK)    │       │ created_at       │
│ menu_item_id(FK) │───────│ updated_at       │
│ quantity         │       └──────────────────┘
│ unit_price       │
│ special_requests │
└──────────────────┘
```

---

## 📋 Détail des Tables

### 👤 Table : `users`

Table des utilisateurs clients de la plateforme.

| Colonne        | Type           | Contraintes                    | Description                          |
|----------------|----------------|--------------------------------|--------------------------------------|
| id             | UUID           | PK, DEFAULT uuid_generate_v4() | Identifiant unique                   |
| email          | VARCHAR(255)   | UNIQUE, NOT NULL               | Email de connexion                   |
| password_hash  | VARCHAR(255)   | NOT NULL                       | Mot de passe hashé (BCrypt)          |
| first_name     | VARCHAR(100)   | NOT NULL                       | Prénom                               |
| last_name      | VARCHAR(100)   | NOT NULL                       | Nom de famille                       |
| phone          | VARCHAR(20)    | NULL                           | Numéro de téléphone                  |
| address        | TEXT           | NULL                           | Adresse complète                     |
| is_active      | BOOLEAN        | DEFAULT true                   | Compte actif/désactivé               |
| created_at     | TIMESTAMP      | DEFAULT NOW()                  | Date de création                     |
| updated_at     | TIMESTAMP      | DEFAULT NOW()                  | Date de dernière modification        |

**Index** :
- `idx_users_email` sur `email` (recherche rapide par email)
- `idx_users_active` sur `is_active` (filtrage utilisateurs actifs)

**Règles métier** :
- Email doit être unique et valide (format email)
- Mot de passe stocké uniquement hashé (jamais en clair)
- Phone et address optionnels lors de l'inscription
- is_active permet désactivation sans suppression (soft delete)

---

### 🏪 Table : `restaurants`

Table des restaurants partenaires de la plateforme.

| Colonne        | Type           | Contraintes                    | Description                          |
|----------------|----------------|--------------------------------|--------------------------------------|
| id             | UUID           | PK, DEFAULT uuid_generate_v4() | Identifiant unique                   |
| name           | VARCHAR(255)   | UNIQUE, NOT NULL               | Nom du restaurant                    |
| description    | TEXT           | NOT NULL                       | Description du restaurant            |
| address        | TEXT           | NOT NULL                       | Adresse complète                     |
| phone          | VARCHAR(20)    | NOT NULL                       | Téléphone de contact                 |
| email          | VARCHAR(255)   | NOT NULL                       | Email de contact                     |
| cuisine_type   | VARCHAR(100)   | NOT NULL                       | Type de cuisine                      |
| rating         | DECIMAL(3,2)   | DEFAULT 0.00                   | Note moyenne (0.00 à 5.00)           |
| is_open        | BOOLEAN        | DEFAULT false                  | Ouvert/fermé (contrôle manuel)       |
| is_active      | BOOLEAN        | DEFAULT true                   | Actif/inactif (contrôle admin)       |
| schedule       | JSONB          | NULL                           | Horaires hebdomadaires (JSON)        |
| image_url      | VARCHAR(500)   | NULL                           | URL image de couverture              |
| owner_id       | UUID           | FK(users.id), NULL             | Propriétaire du restaurant           |
| created_at     | TIMESTAMP      | DEFAULT NOW()                  | Date de création                     |
| updated_at     | TIMESTAMP      | DEFAULT NOW()                  | Date de dernière modification        |

**Index** :
- `idx_restaurants_name` sur `name` (recherche par nom)
- `idx_restaurants_active` sur `is_active` (filtrage restaurants actifs)
- `idx_restaurants_open` sur `is_open` (filtrage restaurants ouverts)
- `idx_restaurants_cuisine` sur `cuisine_type` (filtrage par type cuisine)
- `idx_restaurants_owner` sur `owner_id` (requêtes par propriétaire)

**Règles métier** :
- Name doit être unique dans la plateforme
- is_open contrôlé par le restaurant, is_active contrôlé par admin
- schedule au format JSON : `{"lundi": {"ouverture": "11:00", "fermeture": "22:00"}, ...}`
- rating calculé automatiquement depuis les avis (fonctionnalité future)
- owner_id référence un utilisateur (à implémenter avec rôles)

---

### 🍽️ Table : `menu_items`

Table des articles de menu disponibles dans les restaurants.

| Colonne          | Type           | Contraintes                    | Description                          |
|------------------|----------------|--------------------------------|--------------------------------------|
| id               | UUID           | PK, DEFAULT uuid_generate_v4() | Identifiant unique                   |
| restaurant_id    | UUID           | FK(restaurants.id), NOT NULL   | Restaurant propriétaire              |
| name             | VARCHAR(255)   | NOT NULL                       | Nom du plat                          |
| description      | TEXT           | NULL                           | Description détaillée                |
| price            | DECIMAL(10,2)  | NOT NULL, CHECK (price > 0)    | Prix TTC en euros                    |
| category         | VARCHAR(100)   | NOT NULL                       | Catégorie (Entrée, Plat, Dessert...) |
| is_vegetarian    | BOOLEAN        | DEFAULT false                  | Plat végétarien                      |
| is_vegan         | BOOLEAN        | DEFAULT false                  | Plat végétalien                      |
| allergens        | TEXT[]         | NULL                           | Tableau des allergènes               |
| preparation_time | INTEGER        | NULL                           | Temps de préparation (minutes)       |
| is_available     | BOOLEAN        | DEFAULT true                   | Disponible/rupture de stock          |
| image_url        | VARCHAR(500)   | NULL                           | URL image du plat                    |
| created_at       | TIMESTAMP      | DEFAULT NOW()                  | Date de création                     |
| updated_at       | TIMESTAMP      | DEFAULT NOW()                  | Date de dernière modification        |

**Index** :
- `idx_menu_items_restaurant` sur `restaurant_id` (requêtes par restaurant)
- `idx_menu_items_category` sur `category` (filtrage par catégorie)
- `idx_menu_items_available` sur `is_available` (filtrage articles disponibles)
- `idx_menu_items_vegetarian` sur `is_vegetarian` (filtrage végétarien)
- `idx_menu_items_vegan` sur `is_vegan` (filtrage végétalien)

**Règles métier** :
- (restaurant_id, name) doit être unique (pas de doublons de nom dans un même restaurant)
- price doit être strictement positif
- allergens : tableau de chaînes, ex: `{"gluten", "lactose", "arachides"}`
- is_vegan implique is_vegetarian (à valider en logique métier)
- is_available permet de marquer temporairement indisponible sans supprimer

---

### 📦 Table : `orders`

Table des commandes passées par les clients.

| Colonne           | Type           | Contraintes                    | Description                          |
|-------------------|----------------|--------------------------------|--------------------------------------|
| id                | UUID           | PK, DEFAULT uuid_generate_v4() | Identifiant unique                   |
| user_id           | UUID           | FK(users.id), NOT NULL         | Client ayant passé la commande       |
| restaurant_id     | UUID           | FK(restaurants.id), NOT NULL   | Restaurant concerné                  |
| status            | VARCHAR(50)    | NOT NULL                       | Statut de la commande (enum)         |
| total_amount      | DECIMAL(10,2)  | NOT NULL, CHECK (total >= 0)   | Montant total TTC                    |
| special_instructions | TEXT        | NULL                           | Instructions spéciales client        |
| created_at        | TIMESTAMP      | DEFAULT NOW()                  | Date de création                     |
| updated_at        | TIMESTAMP      | DEFAULT NOW()                  | Date de dernière modification        |

**Index** :
- `idx_orders_user` sur `user_id` (commandes par client)
- `idx_orders_restaurant` sur `restaurant_id` (commandes par restaurant)
- `idx_orders_status` sur `status` (filtrage par statut)
- `idx_orders_created` sur `created_at` DESC (tri chronologique)

**Énumération status** (OrderStatus) :
- `EN_ATTENTE` : Commande créée, en attente de confirmation restaurant
- `EN_PREPARATION` : Restaurant a confirmé et prépare la commande
- `PRETE` : Commande prête à être récupérée
- `RECUPEREE` : Client a récupéré la commande (terminé)
- `ANNULEE` : Commande annulée (client ou restaurant)

**Règles métier** :
- total_amount calculé automatiquement depuis order_items
- Transitions de statuts validées par state machine
- Une commande ne peut contenir que des items d'un seul restaurant
- special_instructions optionnel (allergies, cuisson, etc.)

---

### 🛒 Table : `order_items`

Table de liaison entre commandes et articles de menu (détail de commande).

| Colonne          | Type           | Contraintes                    | Description                          |
|------------------|----------------|--------------------------------|--------------------------------------|
| id               | UUID           | PK, DEFAULT uuid_generate_v4() | Identifiant unique                   |
| order_id         | UUID           | FK(orders.id), NOT NULL        | Commande parente                     |
| menu_item_id     | UUID           | FK(menu_items.id), NOT NULL    | Article commandé                     |
| quantity         | INTEGER        | NOT NULL, CHECK (quantity > 0) | Quantité commandée                   |
| unit_price       | DECIMAL(10,2)  | NOT NULL, CHECK (price > 0)    | Prix unitaire au moment de la commande |
| special_requests | TEXT           | NULL                           | Demandes spéciales pour cet article  |

**Index** :
- `idx_order_items_order` sur `order_id` (articles d'une commande)
- `idx_order_items_menu_item` sur `menu_item_id` (statistiques article)

**Règles métier** :
- quantity doit être > 0
- unit_price copié depuis menu_items au moment de la commande (historisation prix)
- special_requests par article (ex: "Sans oignons", "Bien cuit")
- Calcul ligne : quantity × unit_price

---

### 📂 Table : `categories` (Optionnel - À implémenter)

Table des catégories de menus (pour remplacer le champ `category` simple).

| Colonne        | Type           | Contraintes                    | Description                          |
|----------------|----------------|--------------------------------|--------------------------------------|
| id             | UUID           | PK, DEFAULT uuid_generate_v4() | Identifiant unique                   |
| name           | VARCHAR(100)   | UNIQUE, NOT NULL               | Nom de la catégorie                  |
| slug           | VARCHAR(100)   | UNIQUE, NOT NULL               | Slug URL-friendly                    |
| parent_id      | UUID           | FK(categories.id), NULL        | Catégorie parente (sous-catégories)  |
| display_order  | INTEGER        | DEFAULT 0                      | Ordre d'affichage                    |

**Règles métier** :
- Hiérarchie possible (parent_id permet sous-catégories)
- slug généré automatiquement depuis name
- Exemples : "Entrées", "Plats principaux", "Desserts", "Boissons"

---

## 🔄 Relations entre Tables

### Relations principales :

1. **User → Orders** : Un utilisateur peut passer plusieurs commandes (1:N)
   - `orders.user_id` → `users.id`

2. **Restaurant → Menu Items** : Un restaurant possède plusieurs articles de menu (1:N)
   - `menu_items.restaurant_id` → `restaurants.id`

3. **Restaurant → Orders** : Un restaurant reçoit plusieurs commandes (1:N)
   - `orders.restaurant_id` → `restaurants.id`

4. **Order → Order Items** : Une commande contient plusieurs articles (1:N)
   - `order_items.order_id` → `orders.id`

5. **Menu Item → Order Items** : Un article peut être dans plusieurs commandes (1:N)
   - `order_items.menu_item_id` → `menu_items.id`

6. **User → Restaurant** (Futur) : Un utilisateur peut être propriétaire de plusieurs restaurants (1:N)
   - `restaurants.owner_id` → `users.id`

---

## 📐 Types de Données PostgreSQL

### Types personnalisés utilisés :

```sql
-- Enum pour statuts de commandes
CREATE TYPE order_status AS ENUM (
  'EN_ATTENTE',
  'EN_PREPARATION',
  'PRETE',
  'RECUPEREE',
  'ANNULEE'
);

-- Enum pour rôles utilisateurs (futur)
CREATE TYPE user_role AS ENUM (
  'CLIENT',
  'RESTAURANT',
  'ADMIN'
);
```

### Types standards :

- **UUID** : Identifiants uniques (génération via `uuid_generate_v4()`)
- **VARCHAR(n)** : Chaînes de caractères avec limite
- **TEXT** : Texte illimité (descriptions, adresses)
- **DECIMAL(p,s)** : Nombres décimaux précis (prix, montants)
- **BOOLEAN** : Vrai/Faux (is_active, is_open, etc.)
- **TIMESTAMP** : Date et heure avec timezone
- **INTEGER** : Nombres entiers (quantités, temps)
- **JSONB** : Données JSON binaire (horaires restaurants)
- **TEXT[]** : Tableaux de texte (allergènes)

---

## 🔧 Migrations

### Migration 001 : Création table `users`

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Trigger pour mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### Migration 002 : Création table `restaurants`

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cuisine_type VARCHAR(100) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  is_open BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  schedule JSONB,
  image_url VARCHAR(500),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_restaurants_name ON restaurants(name);
CREATE INDEX idx_restaurants_active ON restaurants(is_active);
CREATE INDEX idx_restaurants_open ON restaurants(is_open);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);

CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON restaurants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### Migration 003 : Création table `menu_items`

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  category VARCHAR(100) NOT NULL,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  allergens TEXT[],
  preparation_time INTEGER CHECK (preparation_time > 0),
  is_available BOOLEAN DEFAULT true,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (restaurant_id, name)
);

CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_vegetarian ON menu_items(is_vegetarian);
CREATE INDEX idx_menu_items_vegan ON menu_items(is_vegan);

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON menu_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

### Migration 004 : Création tables `orders` et `order_items`

```sql
CREATE TYPE order_status AS ENUM (
  'EN_ATTENTE',
  'EN_PREPARATION',
  'PRETE',
  'RECUPEREE',
  'ANNULEE'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL NOT NULL,
  status order_status NOT NULL DEFAULT 'EN_ATTENTE',
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
  special_requests TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item ON order_items(menu_item_id);
```

---

## 📊 Données de Test (import-dev.sql)

```sql
-- Insertion utilisateurs de test
INSERT INTO users (id, email, password_hash, first_name, last_name, phone) VALUES
('4ffe5398-4599-4c33-98ec-18a96fd9e200', 'client@test.com', '$2a$10$...', 'Jean', 'Dupont', '+33612345678'),
('5ffe5398-4599-4c33-98ec-18a96fd9e201', 'restaurant@test.com', '$2a$10$...', 'Marie', 'Martin', '+33698765432');

-- Insertion restaurants de test
INSERT INTO restaurants (id, name, description, address, phone, email, cuisine_type, owner_id) VALUES
('6ffe5398-4599-4c33-98ec-18a96fd9e202', 'Chez Luigi', 'Authentique cuisine italienne', '15 rue de la Paix, Paris', '+33143210987', 'luigi@test.com', 'Italienne', '5ffe5398-4599-4c33-98ec-18a96fd9e201'),
('7ffe5398-4599-4c33-98ec-18a96fd9e203', 'Le Sushi Bar', 'Sushis frais et ramen', '8 avenue des Champs, Lyon', '+33478901234', 'sushi@test.com', 'Japonaise', '5ffe5398-4599-4c33-98ec-18a96fd9e201');

-- Insertion articles de menu
INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES
('6ffe5398-4599-4c33-98ec-18a96fd9e202', 'Pizza Margherita', 'Tomates, mozzarella, basilic', 12.50, 'Plats'),
('6ffe5398-4599-4c33-98ec-18a96fd9e202', 'Tiramisu', 'Dessert italien traditionnel', 6.50, 'Desserts'),
('7ffe5398-4599-4c33-98ec-18a96fd9e203', 'Ramen Tonkotsu', 'Bouillon de porc, nouilles, œuf', 14.00, 'Plats');
```

---

## 🔍 Requêtes SQL Utiles

### Statistiques restaurant

```sql
-- Nombre de commandes et CA par restaurant
SELECT
  r.name,
  COUNT(DISTINCT o.id) AS total_orders,
  SUM(o.total_amount) AS total_revenue,
  AVG(o.total_amount) AS average_order
FROM restaurants r
LEFT JOIN orders o ON r.id = o.restaurant_id
WHERE o.status IN ('RECUPEREE')
GROUP BY r.id, r.name
ORDER BY total_revenue DESC;
```

### Articles les plus commandés

```sql
-- Top 10 articles les plus vendus
SELECT
  mi.name,
  r.name AS restaurant,
  SUM(oi.quantity) AS total_sold,
  COUNT(DISTINCT oi.order_id) AS orders_count
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
JOIN restaurants r ON mi.restaurant_id = r.id
GROUP BY mi.id, mi.name, r.name
ORDER BY total_sold DESC
LIMIT 10;
```

### Commandes en attente par restaurant

```sql
-- Commandes à traiter pour un restaurant
SELECT
  o.id,
  o.created_at,
  u.first_name || ' ' || u.last_name AS customer,
  o.status,
  o.total_amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.restaurant_id = '6ffe5398-4599-4c33-98ec-18a96fd9e202'
  AND o.status IN ('EN_ATTENTE', 'EN_PREPARATION', 'PRETE')
ORDER BY o.created_at ASC;
```

---

## 📅 Évolutions Futures du Schéma

### Tables à créer :

1. **admins** : Utilisateurs administrateurs avec permissions
2. **notifications** : Historique des notifications envoyées
3. **reviews** : Avis et notes des clients sur restaurants/plats
4. **favorites** : Restaurants favoris des clients
5. **promotions** : Codes promo et offres spéciales
6. **delivery_addresses** : Adresses de livraison multiples par utilisateur (futur)
7. **payments** : Transactions de paiement (futur)

### Modifications prévues :

- Ajouter `role` ENUM sur `users` (CLIENT, RESTAURANT, ADMIN)
- Ajouter `loyalty_points` INTEGER sur `users` (programme fidélité)
- Ajouter `delivery_fee` DECIMAL sur `orders` (livraison future)
- Transformer `category` en foreign key vers table `categories`
- Ajouter `image_urls` TEXT[] sur `reviews` (photos avis)

---

## 📅 Dernière mise à jour

**Date** : 2025-12-12
**Version** : MVP 1.0
**Responsable** : Équipe OneEats
**Base de données** : PostgreSQL 15
