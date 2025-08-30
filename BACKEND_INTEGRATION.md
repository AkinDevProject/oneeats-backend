# OneEats Backend - Intégration Frontend

## 🎯 Résumé des développements

Le backend OneEats a été complètement implémenté pour supporter le dashboard restaurant web. Toutes les APIs nécessaires ont été créées avec une architecture DDD + Event-Driven cohérente.

## ✅ Ce qui a été implémenté

### 1. Architecture DDD + PanacheRepository
- ✅ **BaseRepository** : Classe abstraite commune avec méthodes CRUD
- ✅ **Restaurant Domain** : Entité JPA complète avec logique métier 
- ✅ **MenuItem Domain** : Entité JPA avec options diététiques et gestion disponibilité
- ✅ **Repositories** : PanacheRepository pour Restaurant et MenuItem avec requêtes métier

### 2. API REST complète pour le frontend

#### Restaurant API (`/api/restaurants`)
- ✅ `GET /api/restaurants` - Liste avec filtres (cuisine, statut, pagination)
- ✅ `GET /api/restaurants/active` - Restaurants actifs uniquement
- ✅ `GET /api/restaurants/{id}` - Détails d'un restaurant
- ✅ `POST /api/restaurants` - Création restaurant
- ✅ `PUT /api/restaurants/{id}` - Mise à jour restaurant
- ✅ `DELETE /api/restaurants/{id}` - Suppression restaurant
- ✅ `PUT /api/restaurants/{id}/toggle-open` - Ouvrir/fermer
- ✅ `PUT /api/restaurants/{id}/toggle-active` - Activer/désactiver
- ✅ `GET /api/restaurants/search?q=` - Recherche textuelle
- ✅ `GET /api/restaurants/by-cuisine/{type}` - Par type de cuisine
- ✅ `GET /api/restaurants/{id}/stats/today` - Statistiques mockées

#### Menu API (`/api/menu-items`)
- ✅ `GET /api/menu-items/restaurant/{id}` - Menu complet avec filtres
- ✅ `GET /api/menu-items/restaurant/{id}/available` - Items disponibles
- ✅ `GET /api/menu-items/restaurant/{id}/categories` - Liste catégories
- ✅ `GET /api/menu-items/restaurant/{id}/category/{cat}` - Par catégorie
- ✅ `GET /api/menu-items/{id}` - Détails item
- ✅ `POST /api/menu-items` - Création item
- ✅ `PUT /api/menu-items/{id}` - Mise à jour item
- ✅ `DELETE /api/menu-items/{id}` - Suppression item
- ✅ `PUT /api/menu-items/{id}/availability` - Toggle disponibilité
- ✅ `GET /api/menu-items/restaurant/{id}/search?q=` - Recherche dans menu
- ✅ `GET /api/menu-items/restaurant/{id}/vegetarian` - Items végétariens
- ✅ `GET /api/menu-items/restaurant/{id}/vegan` - Items végétaliens

#### Order API (déjà existante, améliorée)
- ✅ `GET /api/orders/restaurant/{id}/stats/today` - Stats détaillées aujourd'hui
- ✅ `GET /api/orders/restaurant/{id}/pending` - Commandes en attente
- ✅ Toutes les autres APIs orders existantes

### 3. DTOs et Validation
- ✅ **RestaurantDto** : DTO complet avec validation Bean Validation
- ✅ **CreateRestaurantRequest** : DTO création avec contraintes
- ✅ **UpdateRestaurantRequest** : DTO mise à jour
- ✅ **MenuItemDto** : DTO complet avec infos diététiques
- ✅ **CreateMenuItemRequest** : DTO création menu item
- ✅ **Mappers** : Conversion bidirectionnelle Entity ↔ DTO

### 4. Données de test complètes
- ✅ **4 restaurants** : Pizza Palace, Burger King Local, Sushi Zen, Café Français
- ✅ **16 items de menu** : 4 items par restaurant avec catégories
- ✅ **3 commandes d'exemple** avec différents statuts
- ✅ **3 utilisateurs** : 2 clients + 1 admin
- ✅ **Images Unsplash** : URLs d'images réelles pour les items

### 5. Configuration
- ✅ **CORS configuré** : Origins localhost:3000, :5173, :8081
- ✅ **Base de données** : PostgreSQL avec données de dev
- ✅ **OpenAPI** : Documentation API automatique
- ✅ **Health checks** : Monitoring Quarkus
- ✅ **Logs** : Configuration complète avec niveaux

## 🚀 Démarrage rapide

### Prérequis
```bash
# Java 21
java -version

# PostgreSQL running on localhost:5432
# Database: oneeats_dev
# User: oneeats_user / Password: oneeats_password
```

### Lancer le backend
```bash
cd oneeats-backend

# Démarrer PostgreSQL d'abord
docker-compose -f docker-compose.dev.yml up -d

# Lancer l'application (dev mode avec hot reload)
./mvnw quarkus:dev

# Ou sur Windows
mvnw.cmd quarkus:dev
```

### URLs importantes
- **API Backend** : http://localhost:8080
- **API Documentation** : http://localhost:8080/q/swagger-ui  
- **Health Check** : http://localhost:8080/q/health
- **Métriques** : http://localhost:8080/q/metrics

## 🔗 Intégration Frontend

### Authentification temporaire
❌ **Pas d'authentification** pour le moment (comme demandé)
- Toutes les APIs sont ouvertes
- Pas de JWT token requis
- À implémenter plus tard

### APIs prêtes pour le dashboard
Le frontend peut maintenant appeler directement :

1. **Liste restaurants** : `GET http://localhost:8080/api/restaurants`
2. **Menu d'un restaurant** : `GET http://localhost:8080/api/menu-items/restaurant/{id}`  
3. **Stats restaurant** : `GET http://localhost:8080/api/orders/restaurant/{id}/stats/today`
4. **Commandes en attente** : `GET http://localhost:8080/api/orders/restaurant/{id}/pending`

### Exemple d'appel API (JavaScript)
```javascript
// Récupérer tous les restaurants
const restaurants = await fetch('http://localhost:8080/api/restaurants')
  .then(res => res.json());

// Récupérer le menu d'un restaurant  
const menuItems = await fetch('http://localhost:8080/api/menu-items/restaurant/11111111-1111-1111-1111-111111111111')
  .then(res => res.json());

// Stats du jour pour un restaurant
const stats = await fetch('http://localhost:8080/api/orders/restaurant/11111111-1111-1111-1111-111111111111/stats/today')
  .then(res => res.json());
```

## 📊 Données de test disponibles

### Restaurants
1. **Pizza Palace** (ID: `11111111-1111-1111-1111-111111111111`)
   - 4 items : Pizza Margherita, Pizza Pepperoni, Tiramisu, Coca-Cola
   - Ouvert, Actif, Note: 4.5

2. **Burger King Local** (ID: `22222222-2222-2222-2222-222222222222`) 
   - 4 items : Burger Classic, Burger Végétarien, Frites, Milkshake
   - Ouvert, Actif, Note: 4.2

3. **Sushi Zen** (ID: `33333333-3333-3333-3333-333333333333`)
   - 4 items : Assortiment Sushi, Sushi Végétarien, Soupe Miso, Thé Vert  
   - Ouvert, Actif, Note: 4.8

4. **Café Français** (ID: `44444444-4444-4444-4444-444444444444`)
   - 4 items : Coq au Vin, Ratatouille, Tarte Tatin, Vin Rouge
   - **Fermé**, Actif, Note: 4.3

## 🛠 Debugging et Tests

### Vérifier les données
```bash
# Se connecter à PostgreSQL
psql -h localhost -U oneeats_user -d oneeats_dev

# Vérifier les restaurants
SELECT id, name, is_open, is_active FROM restaurant;

# Vérifier les items de menu  
SELECT restaurant_id, name, category, price FROM menu_item;
```

### Tester les APIs avec curl
```bash
# Liste des restaurants
curl http://localhost:8080/api/restaurants

# Menu de Pizza Palace
curl http://localhost:8080/api/menu-items/restaurant/11111111-1111-1111-1111-111111111111

# Stats du jour de Pizza Palace  
curl http://localhost:8080/api/orders/restaurant/11111111-1111-1111-1111-111111111111/stats/today
```

## ⚠️ Limitations actuelles

1. **Pas d'authentification** (sera ajoutée plus tard)
2. **Stats mockées** (revenus calculés avec prix moyen fictif)  
3. **Pas d'upload d'images** (URLs statiques Unsplash)
4. **Users API manquante** (peut être ajoutée si nécessaire)

## 🎯 Prochaines étapes

1. **Tester l'intégration** avec le frontend web
2. **Ajouter l'authentification** JWT + Keycloak
3. **Implémenter les vraies statistiques** avec calculs sur commandes
4. **Ajouter l'upload d'images** pour restaurants et menus
5. **Créer les Users API** si nécessaire pour l'admin

Le backend est maintenant **100% prêt** pour le frontend ! 🚀