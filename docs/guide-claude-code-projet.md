# 🚀 Guide Complet : Structurer ton Projet pour Claude Code

## Vue d'ensemble

Ce guide te donne une structure optimale pour que **Claude Code comprenne ton projet à chaque session** : contexte, architecture, règles métier et tâches en cours.

---

## 📁 Structure de dossiers recommandée

```
/mon-projet/
│
├── CLAUDE.md                    ← 🔑 FICHIER CLÉ (lu automatiquement)
│
├── docs/
│   ├── ARCHITECTURE.md          ← Structure technique
│   ├── BUSINESS_RULES.md        ← Règles métier détaillées
│   ├── ROADMAP.md               ← Étapes et progression
│   ├── API_SPECS.md             ← Spécifications des endpoints
│   ├── DATA_MODEL.md            ← Schéma de base de données
│   └── BUGS.md                  ← Problèmes connus et historique
│
├── src/
│   ├── frontend/                ← Application mobile web
│   └── backend/                 ← API et logique serveur
│
├── tests/
│   ├── unit/
│   └── integration/
│
└── scripts/                     ← Scripts utilitaires
```

---

## 📄 Les 6 Documents Essentiels

### 1️⃣ CLAUDE.md — Le fichier maître

> **Claude Code lit ce fichier automatiquement à chaque session.** C'est ton point d'entrée principal.

```markdown
# 📱 [Nom du Projet]

## 🎯 Vision
[Une phrase décrivant l'objectif principal de l'application]

## 🛠 Stack Technique
| Couche      | Technologie        | Version |
|-------------|--------------------|---------|
| Frontend    | React Native Web   | 0.72    |
| Backend     | Node.js + Express  | 20 LTS  |
| Base données| PostgreSQL         | 15      |
| Auth        | JWT + Refresh Token|         |
| Hébergement | Vercel / Railway   |         |

## 📂 Structure du projet
- `/src/frontend/` → Application React Native Web
- `/src/backend/` → API REST Node.js
- `/docs/` → Documentation complète

## 🚀 Commandes essentielles
```bash
# Développement
npm run dev:frontend     # Lance le frontend (port 3000)
npm run dev:backend      # Lance le backend (port 4000)
npm run dev              # Lance les deux en parallèle

# Base de données
npm run db:migrate       # Applique les migrations
npm run db:seed          # Charge les données de test

# Tests
npm run test             # Tests unitaires
npm run test:e2e         # Tests end-to-end
```

## 📖 Documentation à consulter
| Document | Description |
|----------|-------------|
| [BUSINESS_RULES.md](docs/BUSINESS_RULES.md) | Règles métier et logique applicative |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture technique détaillée |
| [ROADMAP.md](docs/ROADMAP.md) | **📍 Tâche en cours et prochaines étapes** |
| [API_SPECS.md](docs/API_SPECS.md) | Documentation des endpoints |
| [DATA_MODEL.md](docs/DATA_MODEL.md) | Schéma de base de données |

## ⚙️ Conventions de code
- **Langue** : Commentaires et commits en français
- **Nommage JS/TS** : camelCase pour variables, PascalCase pour composants
- **Nommage DB** : snake_case pour tables et colonnes
- **Commits** : Format conventionnel (`feat:`, `fix:`, `docs:`, `refactor:`)

## 🔴 Points d'attention actuels
- [ ] Bug #12 : Problème de refresh token sur iOS Safari
- [ ] Performance : Optimiser la requête de listing (>500ms)

## 📅 Dernière mise à jour
[Date] — [Brève description de la dernière session]
```

---

### 2️⃣ BUSINESS_RULES.md — Les règles métier

```markdown
# 📋 Règles Métier

## 👤 Gestion des Utilisateurs

### Inscription
- Email unique et validé par regex
- Mot de passe : minimum 8 caractères, 1 majuscule, 1 chiffre
- Confirmation par email obligatoire avant activation

### Rôles et permissions
| Rôle     | Permissions                                    |
|----------|------------------------------------------------|
| admin    | Tout accès, gestion utilisateurs, configuration|
| vendeur  | CRUD produits, voir commandes, gérer stock     |
| client   | Passer commandes, voir historique, profil      |

### Règles de validation
- Un utilisateur ne peut pas supprimer son propre compte admin
- Après 5 tentatives de connexion échouées → blocage 15 min

---

## 🛒 Gestion des Commandes

### Cycle de vie d'une commande
```
[BROUILLON] → [VALIDÉE] → [PAYÉE] → [EN PRÉPARATION] → [EXPÉDIÉE] → [LIVRÉE]
                  ↓
             [ANNULÉE]
```

### Règles de transition
| De            | Vers           | Condition                          |
|---------------|----------------|------------------------------------|
| BROUILLON     | VALIDÉE        | Panier non vide + stock disponible |
| VALIDÉE       | PAYÉE          | Paiement Stripe confirmé           |
| PAYÉE         | EN PRÉPARATION | Automatique après paiement         |
| EN PRÉPARATION| EXPÉDIÉE       | Numéro de suivi renseigné          |
| *             | ANNULÉE        | Uniquement si pas encore EXPÉDIÉE  |

### Règles de calcul
- TVA : 20% (France métropolitaine)
- Frais de livraison : Gratuit > 50€, sinon 4.90€
- Réduction fidélité : 5% après 5 commandes

---

## 💳 Paiement

### Modes acceptés
- Carte bancaire (Stripe)
- PayPal (phase 2)

### Règles de sécurité
- Pas de stockage de données de carte côté serveur
- Webhook Stripe pour confirmation asynchrone
- Remboursement possible uniquement dans les 14 jours
```

---

### 3️⃣ ROADMAP.md — Suivi de progression

```markdown
# 🗺️ Roadmap du Projet

## 📍 Tâche en cours
> **Sprint 3 — Système de commandes**
> 
> Actuellement : Endpoint de création de commande
> Fichiers concernés : `/src/backend/routes/orders.js`, `/src/backend/models/Order.js`

---

## ✅ Phase 1 — MVP Authentification (Terminé)
- [x] Inscription utilisateur avec validation email
- [x] Connexion / Déconnexion avec JWT
- [x] Refresh token automatique
- [x] Page profil utilisateur
- [x] Middleware d'authentification backend

---

## 🔄 Phase 2 — Catalogue Produits (Terminé)
- [x] CRUD produits (admin)
- [x] Listing avec pagination et filtres
- [x] Page détail produit
- [x] Gestion des images (upload Cloudinary)
- [x] Système de catégories

---

## 🚧 Phase 3 — Système de Commandes (En cours)
- [x] Panier côté frontend (localStorage)
- [x] Synchronisation panier avec backend
- [ ] **➡️ Création de commande** ← EN COURS
- [ ] Intégration Stripe Checkout
- [ ] Webhook de confirmation paiement
- [ ] Page historique commandes
- [ ] Email de confirmation

---

## 📅 Phase 4 — Fonctionnalités Avancées (À venir)
- [ ] Système de notifications push
- [ ] Recherche full-text (Algolia ou MeiliSearch)
- [ ] Avis et notes produits
- [ ] Programme de fidélité
- [ ] Dashboard analytics admin

---

## 🐛 Bugs connus
| ID  | Description                           | Priorité | Status    |
|-----|---------------------------------------|----------|-----------|
| #12 | Refresh token échoue sur iOS Safari   | Haute    | À traiter |
| #15 | Image floue sur écrans Retina         | Moyenne  | En cours  |
| #18 | Pagination reset après filtre         | Basse    | Backlog   |

---

## 📝 Notes de session

### Session du [DATE]
**Objectif** : [Ce qui était prévu]
**Réalisé** : [Ce qui a été fait]
**Problèmes** : [Difficultés rencontrées]
**Prochaine étape** : [Ce qu'il reste à faire]
```

---

### 4️⃣ ARCHITECTURE.md — Structure technique

```markdown
# 🏗️ Architecture Technique

## Vue d'ensemble
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│   Database      │
│  React Native   │     │  Node/Express   │     │   PostgreSQL    │
│      Web        │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       
        │                       ▼                       
        │               ┌─────────────────┐            
        │               │   Services      │            
        │               │  Stripe, S3...  │            
        │               └─────────────────┘            
        ▼                                              
┌─────────────────┐                                    
│   Cloudinary    │                                    
│   (Images)      │                                    
└─────────────────┘                                    
```

---

## 📱 Frontend (`/src/frontend/`)

```
frontend/
├── components/           # Composants réutilisables
│   ├── ui/              # Boutons, inputs, modals...
│   ├── layout/          # Header, Footer, Navigation
│   └── forms/           # Formulaires spécifiques
│
├── screens/             # Pages/écrans de l'app
│   ├── auth/            # Login, Register, ForgotPassword
│   ├── products/        # List, Detail, Search
│   ├── cart/            # Cart, Checkout
│   └── profile/         # Profile, Orders, Settings
│
├── services/            # Appels API
│   ├── api.js           # Configuration Axios
│   ├── authService.js   # Authentification
│   ├── productService.js
│   └── orderService.js
│
├── store/               # État global (Zustand/Redux)
│   ├── authStore.js
│   ├── cartStore.js
│   └── uiStore.js
│
├── hooks/               # Custom hooks
│   ├── useAuth.js
│   └── useCart.js
│
├── utils/               # Fonctions utilitaires
│   ├── formatters.js    # Format prix, dates...
│   └── validators.js    # Validation formulaires
│
└── constants/           # Constantes et config
    ├── routes.js
    └── config.js
```

---

## ⚙️ Backend (`/src/backend/`)

```
backend/
├── routes/              # Définition des endpoints
│   ├── auth.js          # POST /auth/login, /register...
│   ├── users.js         # GET/PUT /users/:id
│   ├── products.js      # CRUD /products
│   └── orders.js        # CRUD /orders
│
├── controllers/         # Logique métier
│   ├── authController.js
│   ├── userController.js
│   ├── productController.js
│   └── orderController.js
│
├── models/              # Modèles Sequelize/Prisma
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── index.js         # Relations et export
│
├── middlewares/         # Middlewares Express
│   ├── auth.js          # Vérification JWT
│   ├── validation.js    # Validation des inputs
│   ├── errorHandler.js  # Gestion centralisée erreurs
│   └── rateLimiter.js   # Protection anti-spam
│
├── services/            # Services externes
│   ├── stripe.js        # Paiement
│   ├── email.js         # Envoi d'emails
│   └── cloudinary.js    # Upload images
│
├── utils/               # Utilitaires
│   ├── logger.js
│   └── helpers.js
│
└── config/              # Configuration
    ├── database.js
    └── constants.js
```

---

## 🗄️ Base de données

### Schéma relationnel
```
users
├── id (PK)
├── email (unique)
├── password_hash
├── role (enum)
├── created_at
└── updated_at

products
├── id (PK)
├── name
├── description
├── price
├── stock
├── category_id (FK)
└── image_url

orders
├── id (PK)
├── user_id (FK)
├── status (enum)
├── total_amount
├── created_at
└── updated_at

order_items
├── id (PK)
├── order_id (FK)
├── product_id (FK)
├── quantity
└── unit_price
```
```

---

### 5️⃣ API_SPECS.md — Documentation API

```markdown
# 📡 Spécifications API

## Base URL
- **Dev** : `http://localhost:4000/api/v1`
- **Prod** : `https://api.monprojet.com/v1`

## Authentification
Header requis : `Authorization: Bearer <token>`

---

## 🔐 Auth

### POST /auth/register
Inscription d'un nouvel utilisateur.

**Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Réponses**
| Code | Description              |
|------|--------------------------|
| 201  | Utilisateur créé         |
| 400  | Données invalides        |
| 409  | Email déjà utilisé       |

---

### POST /auth/login
Connexion utilisateur.

**Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Réponse 200**
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "dGhpcy...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "client"
  }
}
```

---

## 📦 Products

### GET /products
Liste des produits avec pagination et filtres.

**Query params**
| Param    | Type   | Description              |
|----------|--------|--------------------------|
| page     | number | Page (défaut: 1)         |
| limit    | number | Items par page (max: 50) |
| category | string | Filtrer par catégorie    |
| search   | string | Recherche textuelle      |
| sort     | string | Tri (price, -price, name)|

**Réponse 200**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 🛒 Orders

### POST /orders
Créer une commande.

**Body**
```json
{
  "items": [
    { "productId": "uuid", "quantity": 2 },
    { "productId": "uuid", "quantity": 1 }
  ],
  "shippingAddress": {
    "street": "123 rue Example",
    "city": "Paris",
    "postalCode": "75001",
    "country": "FR"
  }
}
```

**Réponse 201**
```json
{
  "orderId": "uuid",
  "status": "PENDING_PAYMENT",
  "total": 59.90,
  "stripeSessionUrl": "https://checkout.stripe.com/..."
}
```
```

---

### 6️⃣ DATA_MODEL.md — Schéma de données

```markdown
# 🗃️ Modèle de Données

## Diagramme ERD

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   products   │       │  categories  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ name         │       │ name         │
│ password_hash│       │ description  │       │ slug         │
│ first_name   │       │ price        │       │ parent_id    │
│ last_name    │       │ stock        │       └──────────────┘
│ role         │       │ category_id ─┼───────────────┘
│ is_active    │       │ image_url    │
│ created_at   │       │ created_at   │
│ updated_at   │       │ updated_at   │
└──────┬───────┘       └──────┬───────┘
       │                      │
       │ 1:N                  │ N:M
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│    orders    │       │ order_items  │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │
│ user_id (FK) │◀──────│ order_id(FK) │
│ status       │       │ product_id   │───────┘
│ total_amount │       │ quantity     │
│ shipping_addr│       │ unit_price   │
│ created_at   │       └──────────────┘
│ updated_at   │
└──────────────┘
```

## Détail des tables

### users
| Colonne       | Type         | Contraintes           |
|---------------|--------------|-----------------------|
| id            | UUID         | PK, default uuid_v4() |
| email         | VARCHAR(255) | UNIQUE, NOT NULL      |
| password_hash | VARCHAR(255) | NOT NULL              |
| first_name    | VARCHAR(100) |                       |
| last_name     | VARCHAR(100) |                       |
| role          | ENUM         | 'admin','vendeur','client' |
| is_active     | BOOLEAN      | DEFAULT true          |
| created_at    | TIMESTAMP    | DEFAULT NOW()         |
| updated_at    | TIMESTAMP    | ON UPDATE NOW()       |

### Index
- `idx_users_email` sur `email`
- `idx_users_role` sur `role`

---

## Migrations

```sql
-- Migration 001: Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'client',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```
```

---

## 💡 Bonnes pratiques

| Pratique | Pourquoi |
|----------|----------|
| Mettre à jour `ROADMAP.md` après chaque session | Claude saura exactement où tu en es |
| Utiliser des `// TODO:` dans le code | Claude les détecte et peut les lister |
| Documenter les bugs dans `BUGS.md` | Historique des problèmes et solutions |
| Ajouter des notes de session | Contexte pour reprendre le travail |
| Garder `CLAUDE.md` à jour | Point d'entrée toujours synchronisé |

---

## 🎯 Workflow recommandé avec Claude Code

1. **Début de session** : Claude lit automatiquement `CLAUDE.md`
2. **Demande-lui** : "Lis `docs/ROADMAP.md` pour voir la tâche en cours"
3. **Travaille** sur la tâche avec Claude
4. **Fin de session** : Demande à Claude de mettre à jour la roadmap

**Exemple de prompt efficace** :
> "Regarde la roadmap et continue la tâche en cours. Quand tu as terminé, mets à jour le fichier ROADMAP.md avec ce qui a été fait."

---

## ✅ Résumé

| Document | Rôle | Fréquence de mise à jour |
|----------|------|--------------------------|
| `CLAUDE.md` | Point d'entrée, config | À chaque changement majeur |
| `BUSINESS_RULES.md` | Règles métier | Quand les règles changent |
| `ROADMAP.md` | Progression et tâches | **Après chaque session** |
| `ARCHITECTURE.md` | Structure technique | Quand l'archi évolue |
| `API_SPECS.md` | Documentation API | À chaque nouvel endpoint |
| `DATA_MODEL.md` | Schéma BDD | À chaque migration |
