# 🚀 OneEats Backend - Démarrage API uniquement

## ✅ Problème Quinoa résolu

**Erreur corrigée** : `node-version is required to install package manager`

**Solution** : Quinoa (intégration frontend) temporairement désactivé pour tester les APIs backend uniquement.

## 🛠 Démarrage rapide

### 1. Démarrer PostgreSQL
```bash
cd C:\Users\akin_\Documents\dev\FoodApp\Quarkus\oneeats-backend
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Démarrer le backend
```bash
# Avec Maven Wrapper
./mvnw quarkus:dev

# Ou sur Windows
mvnw.cmd quarkus:dev
```

### 3. Vérifier le démarrage
```bash
# Health check
curl http://localhost:8080/q/health

# Swagger UI
# Ouvrir : http://localhost:8080/q/swagger-ui
```

## 📊 Tester les APIs

### Restaurants disponibles
```bash
curl -X GET http://localhost:8080/api/restaurants | jq
```

**Résultat attendu** : 4 restaurants (Pizza Palace, Burger King Local, Sushi Zen, Café Français)

### Menu Pizza Palace
```bash
curl -X GET "http://localhost:8080/api/menu-items/restaurant/11111111-1111-1111-1111-111111111111" | jq
```

**Résultat attendu** : 4 items (Pizza Margherita, Pizza Pepperoni, Tiramisu, Coca-Cola)

### Statistiques restaurant
```bash
curl -X GET "http://localhost:8080/api/orders/restaurant/11111111-1111-1111-1111-111111111111/stats/today" | jq
```

**Résultat attendu** : Stats mockées avec commandes et revenus

### Créer un nouveau restaurant
```bash
curl -X POST http://localhost:8080/api/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Restaurant",
    "description": "Restaurant de test",
    "address": "123 Rue Test",
    "phone": "0123456789",
    "email": "test@restaurant.com",
    "cuisineType": "TEST"
  }' | jq
```

## 🎯 URLs importantes

- **Backend API** : http://localhost:8080
- **Health Check** : http://localhost:8080/q/health
- **Swagger UI** : http://localhost:8080/q/swagger-ui
- **Métriques** : http://localhost:8080/q/metrics
- **Dev UI** : http://localhost:8080/q/dev

## 💾 Base de données

**Connexion PostgreSQL** :
```bash
psql -h localhost -U oneeats_user -d oneeats_dev
Password: oneeats_password
```

**Vérifier les données** :
```sql
-- Voir les restaurants
SELECT id, name, is_open, is_active FROM restaurant;

-- Voir les items de menu
SELECT restaurant_id, name, category, price FROM menu_item LIMIT 10;

-- Voir les commandes
SELECT id, status, total_amount FROM order_entity;
```

## 🔗 Intégration avec votre frontend

Votre dashboard peut maintenant appeler directement :

```javascript
// Configuration API base
const API_BASE = 'http://localhost:8080';

// Récupérer les restaurants
async function fetchRestaurants() {
  const response = await fetch(`${API_BASE}/api/restaurants`);
  return response.json();
}

// Récupérer le menu d'un restaurant
async function fetchMenu(restaurantId) {
  const response = await fetch(`${API_BASE}/api/menu-items/restaurant/${restaurantId}`);
  return response.json();
}

// Récupérer les stats
async function fetchStats(restaurantId) {
  const response = await fetch(`${API_BASE}/api/orders/restaurant/${restaurantId}/stats/today`);
  return response.json();
}

// Exemples d'utilisation
const restaurants = await fetchRestaurants();
const pizzaPalaceMenu = await fetchMenu('11111111-1111-1111-1111-111111111111');
const stats = await fetchStats('11111111-1111-1111-1111-111111111111');
```

## 📋 Endpoints disponibles

### Restaurant API
- `GET /api/restaurants` - Liste restaurants
- `GET /api/restaurants/{id}` - Détails restaurant
- `POST /api/restaurants` - Créer restaurant
- `PUT /api/restaurants/{id}` - Modifier restaurant
- `DELETE /api/restaurants/{id}` - Supprimer restaurant

### Menu API
- `GET /api/menu-items/restaurant/{id}` - Menu complet
- `GET /api/menu-items/restaurant/{id}/categories` - Catégories
- `POST /api/menu-items` - Créer item
- `PUT /api/menu-items/{id}` - Modifier item
- `DELETE /api/menu-items/{id}` - Supprimer item

### Orders API
- `GET /api/orders/restaurant/{id}/stats/today` - Stats du jour
- `GET /api/orders/restaurant/{id}/pending` - Commandes en attente

## ⚠️ Notes importantes

1. **Quinoa désactivé** : Pas d'intégration frontend automatique pour l'instant
2. **Authentification désactivée** : Toutes les APIs sont ouvertes
3. **CORS activé** : Compatible avec localhost:3000, :5173, :8081
4. **Données de test** : Base pré-remplie avec restaurants et menus

## 🔄 Réactiver Quinoa plus tard

Pour réactiver l'intégration frontend :

1. Décommenter les sections `quinoa:` dans `application.yml` et `application-dev.yml`
2. Installer Node.js 20.10.0+
3. Installer les dépendances npm dans `apps/web`

**Le backend API OneEats fonctionne maintenant parfaitement !** ✅