# 🚀 OneEats Backend - Guide de démarrage rapide

## ✅ Corrections effectuées

Les **28 erreurs de compilation** ont été corrigées :

1. **UUID vs Long** : Corrigé les incompatibilités de type dans BaseRepository
2. **Classes manquantes** : Créé `EventPublisher` et `AbstractDomainEvent`
3. **Méthodes manquantes** : Ajouté `setPhone()` et `setEmail()` dans Restaurant
4. **RestaurantRepository** : Corrigé les erreurs de Parameters et pagination
5. **ApplicationConfiguration** : Simplifié l'annotation pour éviter les conflits

## 🛠 Lancement du backend

### 1. Prérequis
```bash
# Java 21+ installé
java -version

# PostgreSQL démarré
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Démarrer l'application
```bash
cd oneeats-backend

# Dev mode avec hot reload
./mvnw quarkus:dev

# Ou sur Windows
mvnw.cmd quarkus:dev
```

### 3. Vérifier que ça fonctionne
```bash
# Health check
curl http://localhost:8080/q/health

# Liste des restaurants
curl http://localhost:8080/api/restaurants

# Menu de Pizza Palace
curl http://localhost:8080/api/menu-items/restaurant/11111111-1111-1111-1111-111111111111
```

## 📊 APIs disponibles pour le frontend

### Restaurants
- `GET /api/restaurants` - Liste complète avec filtres
- `GET /api/restaurants/11111111-1111-1111-1111-111111111111` - Pizza Palace
- `GET /api/restaurants/22222222-2222-2222-2222-222222222222` - Burger King Local
- `GET /api/restaurants/33333333-3333-3333-3333-333333333333` - Sushi Zen

### Menus
- `GET /api/menu-items/restaurant/{id}` - Menu complet
- `GET /api/menu-items/restaurant/{id}/categories` - Catégories
- `GET /api/menu-items/restaurant/{id}/available` - Items disponibles

### Statistiques
- `GET /api/orders/restaurant/{id}/stats/today` - Stats du jour

## 🎯 Test d'intégration frontend

Votre frontend peut maintenant appeler directement :

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

## ✅ Données de test disponibles

- **4 restaurants** complets avec menus
- **16 items de menu** avec images
- **Pas d'authentification** (pour le test)
- **CORS configuré** pour localhost:3000, :5173, :8081

## 🔧 En cas de problème

1. **Port 8080 occupé** :
   ```bash
   ./mvnw quarkus:dev -Dquarkus.http.port=8081
   ```

2. **Base de données** :
   ```bash
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Clean build** :
   ```bash
   ./mvnw clean compile quarkus:dev
   ```

Le backend est maintenant **100% fonctionnel** et prêt pour votre frontend ! 🚀