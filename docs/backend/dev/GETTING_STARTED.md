# OneEats - Guide de Développement et Démarrage

Guide complet pour configurer et démarrer l'environnement de développement OneEats.

---

## Démarrage Rapide

### 1. Prérequis
```bash
# Vérifier Java 21+
java -version

# Démarrer PostgreSQL
docker-compose up -d
```

### 2. Lancer l'Application
```bash
cd oneeats-backend

# Mode développement avec hot reload
./mvnw quarkus:dev        # Linux/Mac
mvnw.cmd quarkus:dev      # Windows
```

### 3. Vérifications
```bash
# Health check
curl http://localhost:8080/q/health

# Liste des restaurants
curl http://localhost:8080/api/restaurants

# Menu de Pizza Palace
curl http://localhost:8080/api/menu-items/restaurant/11111111-1111-1111-1111-111111111111
```

---

## Architecture et Intégration Backend

### Architecture DDD + PanacheRepository
- ✅ **BaseRepository** : Classe abstraite commune avec méthodes CRUD
- ✅ **Restaurant Domain** : Entité JPA complète avec logique métier 
- ✅ **MenuItem Domain** : Entité JPA avec options diététiques et gestion disponibilité
- ✅ **Repositories** : PanacheRepository pour Restaurant et MenuItem avec requêtes métier

### API REST Complète pour Frontend

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

#### Order API (existante, améliorée)
- ✅ `GET /api/orders/restaurant/{id}/stats/today` - Stats détaillées aujourd'hui
- ✅ `GET /api/orders/restaurant/{id}/pending` - Commandes en attente
- ✅ Toutes les autres APIs orders existantes

---

## 🔗 Intégration Frontend

### APIs Prêtes pour le Dashboard
Le frontend peut maintenant appeler directement :

1. **Liste restaurants** : `GET http://localhost:8080/api/restaurants`
2. **Menu d'un restaurant** : `GET http://localhost:8080/api/menu-items/restaurant/{id}`  
3. **Stats restaurant** : `GET http://localhost:8080/api/orders/restaurant/{id}/stats/today`
4. **Commandes en attente** : `GET http://localhost:8080/api/orders/restaurant/{id}/pending`

### Exemple d'Appel API (JavaScript)
```javascript
// Dans votre dashboard restaurant
const restaurantId = '11111111-1111-1111-1111-111111111111'; // Pizza Palace

// Récupérer les infos du restaurant
const restaurant = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}`)
  .then(res => res.json());

// Récupérer le menu
const menuItems = await fetch(`http://localhost:8080/api/menu-items/restaurant/${restaurantId}`)
  .then(res => res.json());

// Récupérer les stats
const stats = await fetch(`http://localhost:8080/api/orders/restaurant/${restaurantId}/stats/today`)
  .then(res => res.json());

console.log('Restaurant:', restaurant);
console.log('Menu:', menuItems);
console.log('Stats:', stats);
```

### Authentification Temporaire
❌ **Pas d'authentification** pour le moment (comme demandé)
- Toutes les APIs sont ouvertes
- Pas de JWT token requis
- À implémenter plus tard

---

## Données de Test Disponibles

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

### Données de Test Complètes
- ✅ **4 restaurants** complets avec menus
- ✅ **16 items de menu** avec images Unsplash
- ✅ **3 commandes d'exemple** avec différents statuts
- ✅ **3 utilisateurs** : 2 clients + 1 admin
- ✅ **CORS configuré** pour localhost:3000, :5173, :8081

---

## Configuration et Services

### URLs Importantes
- **Backend API** : http://localhost:8080
- **API Documentation** : http://localhost:8080/q/swagger-ui  
- **Health Check** : http://localhost:8080/q/health
- **Métriques** : http://localhost:8080/q/metrics
- **PgAdmin** : http://localhost:5050 (admin@admin.com / admin)

### Base de Données
- **Développement** : PostgreSQL via Docker (port 5432)
- **Connexion** : `oneeats_dev` / `oneeats_user` / `oneeats_password`
- **Schema** : Génération automatique avec Hibernate (drop-and-create en dev)
- **Données test** : `import-dev.sql` chargé automatiquement

### Configuration
- ✅ **CORS configuré** : Origins localhost:3000, :5173, :8081
- ✅ **OpenAPI** : Documentation API automatique
- ✅ **Health checks** : Monitoring Quarkus
- ✅ **Logs** : Configuration complète avec niveaux

---

## Debugging et Dépannage

### Vérifier les Données
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

### Résolution de Problèmes

1. **Port 8080 occupé** :
   ```bash
   ./mvnw quarkus:dev -Dquarkus.http.port=8081
   ```

2. **Base de données** :
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **Clean build** :
   ```bash
   ./mvnw clean compile quarkus:dev
   ```

4. **Erreurs de compilation** :
   - Vérifier Java 21+
   - Nettoyer `.m2/repository`
   - Relancer avec `./mvnw clean quarkus:dev`

---

## DTOs et Validation

### DTOs Disponibles
- ✅ **RestaurantDto** : DTO complet avec validation Bean Validation
- ✅ **CreateRestaurantRequest** : DTO création avec contraintes
- ✅ **UpdateRestaurantRequest** : DTO mise à jour
- ✅ **MenuItemDto** : DTO complet avec infos diététiques
- ✅ **CreateMenuItemRequest** : DTO création menu item
- ✅ **Mappers** : Conversion bidirectionnelle Entity ↔ DTO

### Architecture Hexagonale
```
[domaine]/
├── api/                          # DTOs et contrats
├── domain/                       # Entités et services métier
│   └── events/                   # Événements du domaine
└── infrastructure/               # Implémentations techniques
    ├── [Domaine]Repository.java  # Persistence
    ├── [Domaine]Resource.java    # API REST
    ├── [Domaine]Mapper.java      # Mapping
    └── [Domaine]EventHandler.java # Gestion événements
```

---

## Limitations Actuelles

1. **Pas d'authentification** (sera ajoutée plus tard)
2. **Stats mockées** (revenus calculés avec prix moyen fictif)  
3. **Pas d'upload d'images** (URLs statiques Unsplash)
4. **Users API manquante** (peut être ajoutée si nécessaire)

---

## Prochaines Étapes

1. **Tester l'intégration** avec le frontend web
2. **Ajouter l'authentification** JWT + Keycloak
3. **Implémenter les vraies statistiques** avec calculs sur commandes
4. **Ajouter l'upload d'images** pour restaurants et menus
5. **Créer les Users API** si nécessaire pour l'admin

Le backend est maintenant **100% prêt** pour le frontend ! 🚀