# API Requirements pour le Dashboard Restaurant Web

## Vue d'ensemble

Le dashboard restaurant dans `apps/web` contient des fonctionnalités complètement mockées qui nécessitent une implémentation backend réelle. Ce document liste tous les endpoints REST et commandes/queries CQRS nécessaires par domaine métier.

---

## Domaine Authentication & Security

### Endpoints REST nécessaires

#### POST /api/auth/login
- **Description** : Authentification utilisateur avec JWT
- **Body** : `{ email: string, password: string }`
- **Response** : `{ token: string, user: UserDto, expiresIn: number }`
- **Mock actuel** : Credentials hard-codées (`admin@delishgo.com`/`admin123`, `luigi@restaurant.com`/`resto123`)

#### POST /api/auth/refresh
- **Description** : Renouvellement du token JWT
- **Headers** : `Authorization: Bearer <refresh_token>`
- **Response** : `{ token: string, expiresIn: number }`

#### POST /api/auth/logout
- **Description** : Invalidation du token
- **Headers** : `Authorization: Bearer <token>`

#### GET /api/auth/me
- **Description** : Récupération du profil utilisateur connecté
- **Headers** : `Authorization: Bearer <token>`
- **Response** : `UserDto`

#### PUT /api/auth/push-token ✅ IMPLÉMENTÉ (2026-01-25)
- **Description** : Enregistre le token Expo Push de l'utilisateur pour les notifications mobiles
- **Headers** : `Authorization: Bearer <token>`
- **Body** : `{ pushToken: string }` (format: `ExponentPushToken[xxx]`)
- **Response** : `{ success: boolean, message: string, userId: string }`
- **Erreurs** :
  - `400 Bad Request` : Token vide ou invalide
  - `401 Unauthorized` : Non authentifié
  - `404 Not Found` : Utilisateur non trouvé

#### DELETE /api/auth/push-token ✅ IMPLÉMENTÉ (2026-01-25)
- **Description** : Supprime le token push de l'utilisateur (à appeler lors de la déconnexion)
- **Headers** : `Authorization: Bearer <token>`
- **Response** : `{ success: boolean, message: string, userId: string }`
- **Erreurs** :
  - `401 Unauthorized` : Non authentifié
  - `404 Not Found` : Utilisateur non trouvé

### Commands/Queries CQRS

#### Commands
- `AuthenticateUserCommand` : Vérification credentials et génération JWT
- `RefreshTokenCommand` : Renouvellement token
- `LogoutUserCommand` : Invalidation token

#### Queries
- `GetCurrentUserQuery` : Récupération profil utilisateur connecté

---

## Domaine Restaurant

### Endpoints REST nécessaires

#### GET /api/restaurants
- **Description** : Liste de tous les restaurants (Admin)
- **Query params** : `?status=pending|approved|blocked&page=0&size=10`
- **Response** : `{ content: RestaurantDto[], totalElements: number }`
- **Mock actuel** : Liste statique de 5 restaurants

#### POST /api/restaurants
- **Description** : Création nouveau restaurant
- **Body** : `CreateRestaurantDto`
- **Response** : `RestaurantDto`

#### GET /api/restaurants/{id}
- **Description** : Détails d'un restaurant
- **Response** : `RestaurantDto`

#### PUT /api/restaurants/{id}
- **Description** : Mise à jour restaurant
- **Body** : `UpdateRestaurantDto`
- **Response** : `RestaurantDto`

#### DELETE /api/restaurants/{id}
- **Description** : Suppression restaurant
- **Response** : `204 No Content`

#### GET /api/restaurants/owner/{ownerId}
- **Description** : Restaurant appartenant à un propriétaire
- **Response** : `RestaurantDto`

#### PUT /api/restaurants/{id}/status
- **Description** : Changement de statut restaurant
- **Body** : `{ status: "pending"|"approved"|"blocked" }`
- **Response** : `RestaurantDto`

#### GET /api/restaurants/{id}/stats/today
- **Description** : Statistiques du jour pour un restaurant
- **Response** : `{ orders: number, revenue: number, avgOrderValue: number }`

#### POST /api/restaurants/{id}/upload-logo
- **Description** : Upload logo restaurant
- **Content-Type** : `multipart/form-data`
- **Body** : `{ logo: File }`
- **Contraintes** : max 5 Mo, formats jpg/png/webp, validation MIME/extension, nommage sécurisé
- **Stockage** : FS local en dev; cible storage objet (S3/GCS) derrière une abstraction
- **Response** : `{ logoUrl: string }`

### DTOs nécessaires

```typescript
interface RestaurantDto {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisineType: string;
  logoUrl?: string;
  status: "pending" | "approved" | "blocked";
  isOpen: boolean;
  rating: number;
  openingHours: OpeningHoursDto;
  createdAt: string;
  updatedAt: string;
}

interface OpeningHoursDto {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}
```

### Commands/Queries CQRS

#### Commands
- `CreateRestaurantCommand` : Création restaurant
- `UpdateRestaurantCommand` : Mise à jour profil
- `ChangeRestaurantStatusCommand` : Approbation/blocage (Admin)
- `UpdateOpeningHoursCommand` : Modification horaires
- `ToggleRestaurantOpenCommand` : Ouverture/fermeture temporaire

#### Queries
- `GetAllRestaurantsQuery` : Liste restaurants (Admin)
- `GetRestaurantByIdQuery` : Détails restaurant
- `GetRestaurantByOwnerQuery` : Restaurant par propriétaire
- `GetRestaurantStatsQuery` : Statistiques restaurant

---

## Domaine Menu

### Endpoints REST nécessaires

#### GET /api/menu-items/restaurant/{restaurantId}
- **Description** : Tous les items du menu d'un restaurant
- **Query params** : `?category=string&available=true|false`
- **Response** : `MenuItemDto[]`
- **Mock actuel** : 8 items de menu avec catégories

#### GET /api/menu-items/restaurant/{restaurantId}/categories
- **Description** : Liste des catégories de menu
- **Response** : `string[]`

#### POST /api/menu-items
- **Description** : Création nouvel item de menu
- **Body** : `CreateMenuItemDto`
- **Response** : `MenuItemDto`

#### PUT /api/menu-items/{id}
- **Description** : Mise à jour item de menu
- **Body** : `UpdateMenuItemDto`
- **Response** : `MenuItemDto`

#### DELETE /api/menu-items/{id}
- **Description** : Suppression item de menu
- **Response** : `204 No Content`

#### PUT /api/menu-items/{id}/availability
- **Description** : Toggle disponibilité item
- **Body** : `{ available: boolean }`
- **Response** : `MenuItemDto`

#### POST /api/menu-items/{id}/upload-image
- **Description** : Upload image item de menu
- **Content-Type** : `multipart/form-data`
- **Body** : `{ image: File }`
- **Contraintes** : max 5 Mo, formats jpg/png/webp, validation MIME/extension, nommage sécurisé
- **Stockage** : FS local en dev; cible storage objet (S3/GCS) derrière une abstraction
- **Response** : `{ imageUrl: string }`

### DTOs nécessaires

```typescript
interface MenuItemDto {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number; // minutes
  options: MenuItemOptionDto[];
  dietaryInfo: {
    isVegetarian: boolean;
    isVegan: boolean;
    allergens: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface MenuItemOptionDto {
  id: string;
  name: string;
  type: "remove" | "choice" | "extra";
  required: boolean;
  choices: MenuItemChoiceDto[];
}

interface MenuItemChoiceDto {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
}
```

### Commands/Queries CQRS

#### Commands
- `CreateMenuItemCommand` : Création item de menu
- `UpdateMenuItemCommand` : Mise à jour item
- `DeleteMenuItemCommand` : Suppression item
- `ToggleMenuItemAvailabilityCommand` : Gestion disponibilité
- `UpdateMenuItemOptionsCommand` : Gestion des options complexes

#### Queries
- `GetMenuItemsByRestaurantQuery` : Menu complet restaurant
- `GetMenuCategoriesQuery` : Liste catégories
- `GetAvailableMenuItemsQuery` : Items disponibles seulement
- `GetMenuItemsByCategory` : Items par catégorie

---

## Domaine Order

### Endpoints REST nécessaires

#### GET /api/orders/restaurant/{restaurantId}
- **Description** : Toutes les commandes d'un restaurant
- **Query params** : `?status=pending|preparing|ready|delivered&page=0&size=20&date=2024-01-01`
- **Response** : `{ content: OrderDto[], totalElements: number }`
- **Mock actuel** : 12 commandes avec différents statuts

#### GET /api/orders/restaurant/{restaurantId}/pending
- **Description** : Commandes en attente pour un restaurant
- **Response** : `OrderDto[]`

#### PUT /api/orders/{id}/status
- **Description** : Mise à jour statut de commande
- **Body** : `{ status: "pending"|"preparing"|"ready"|"delivered"|"cancelled", estimatedTime?: number }`
- **Response** : `OrderDto`

#### GET /api/orders/restaurant/{restaurantId}/stats/today
- **Description** : Statistiques commandes du jour
- **Response** : `{ total: number, pending: number, preparing: number, ready: number, delivered: number, revenue: number }`

#### GET /api/orders/restaurant/{restaurantId}/stats/period
- **Description** : Statistiques sur une période
- **Query params** : `?startDate=2024-01-01&endDate=2024-01-31`
- **Response** : `RestaurantStatsDto`

### DTOs nécessaires

```typescript
interface OrderDto {
  id: string;
  restaurantId: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItemDto[];
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  totalAmount: number;
  specialInstructions?: string;
  estimatedReadyTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItemDto {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  selectedOptions: SelectedOptionDto[];
  totalPrice: number;
}

interface RestaurantStatsDto {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  topDishes: { menuItemId: string; name: string; count: number }[];
  dailyStats: { date: string; orders: number; revenue: number }[];
}
```

### Commands/Queries CQRS

#### Commands
- `UpdateOrderStatusCommand` : Changement statut commande
- `AcceptOrderCommand` : Acceptation commande par restaurant
- `CancelOrderCommand` : Annulation commande
- `SetEstimatedTimeCommand` : Définition temps de préparation

#### Queries
- `GetOrdersByRestaurantQuery` : Commandes par restaurant
- `GetPendingOrdersQuery` : Commandes en attente
- `GetOrderStatsQuery` : Statistiques commandes
- `GetOrdersByStatusQuery` : Commandes par statut

---

## Domaine User & Admin

### Endpoints REST nécessaires

#### GET /api/users
- **Description** : Liste des utilisateurs (Admin)
- **Query params** : `?role=admin|restaurant|customer&page=0&size=10&search=string`
- **Response** : `{ content: UserDto[], totalElements: number }`
- **Mock actuel** : Liste statique de 8 utilisateurs

#### POST /api/users
- **Description** : Création utilisateur (Admin)
- **Body** : `CreateUserDto`
- **Response** : `UserDto`

#### PUT /api/users/{id}
- **Description** : Mise à jour utilisateur
- **Body** : `UpdateUserDto`
- **Response** : `UserDto`

#### DELETE /api/users/{id}
- **Description** : Suppression utilisateur
- **Response** : `204 No Content`

#### GET /api/users/role/{role}
- **Description** : Utilisateurs par rôle
- **Response** : `UserDto[]`

### DTOs nécessaires

```typescript
interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "admin" | "restaurant" | "customer";
  isActive: boolean;
  restaurantId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Commands/Queries CQRS

#### Commands
- `CreateUserCommand` : Création utilisateur
- `UpdateUserCommand` : Mise à jour profil
- `DeactivateUserCommand` : Désactivation compte
- `AssignRoleCommand` : Attribution rôle

#### Queries
- `GetAllUsersQuery` : Liste utilisateurs (Admin)
- `GetUsersByRoleQuery` : Utilisateurs par rôle
- `SearchUsersQuery` : Recherche utilisateurs

---

## Domaine Analytics & Statistics

### Endpoints REST nécessaires

#### GET /api/analytics/platform
- **Description** : Analytiques plateforme (Admin)
- **Query params** : `?period=today|week|month|year`
- **Response** : `PlatformAnalyticsDto`
- **Mock actuel** : Statistiques plateforme complètes

#### GET /api/analytics/restaurant/{restaurantId}
- **Description** : Analytiques restaurant
- **Query params** : `?period=today|week|month|year`
- **Response** : `RestaurantAnalyticsDto`
- **Mock actuel** : Dashboard avec métriques détaillées

### DTOs nécessaires

```typescript
interface PlatformAnalyticsDto {
  totalRestaurants: number;
  activeRestaurants: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  growth: {
    restaurants: number;
    users: number;
    orders: number;
    revenue: number;
  };
  topRestaurants: { id: string; name: string; orders: number; revenue: number }[];
  orderTrends: { date: string; orders: number }[];
  revenueTrends: { date: string; revenue: number }[];
}

interface RestaurantAnalyticsDto {
  todayStats: {
    orders: number;
    revenue: number;
    avgOrderValue: number;
    customers: number;
  };
  weeklyTrends: { date: string; orders: number; revenue: number }[];
  topDishes: { menuItemId: string; name: string; count: number; revenue: number }[];
  customerSatisfaction: number;
  completionRate: number;
  averagePreparationTime: number;
}
```

### Commands/Queries CQRS

#### Queries
- `GetPlatformAnalyticsQuery` : Statistiques globales plateforme
- `GetRestaurantAnalyticsQuery` : Statistiques restaurant
- `GetRevenueReportQuery` : Rapport revenus
- `GetPerformanceMetricsQuery` : Métriques performance

---

## Domaine Notification

### Endpoints REST nécessaires

#### GET /api/notifications/user/{userId}
- **Description** : Notifications pour un utilisateur
- **Query params** : `?unread=true&page=0&size=10`
- **Response** : `{ content: NotificationDto[], totalElements: number }`

#### PUT /api/notifications/{id}/read
- **Description** : Marquer notification comme lue
- **Response** : `NotificationDto`

#### GET /api/notifications/restaurant/{restaurantId}/unread-count
- **Description** : Nombre de notifications non lues
- **Response** : `{ count: number }`

### Real-time Requirements

#### WebSocket /ws/notifications
- **Description** : Notifications en temps réel pour commandes
- **Events** : `order.created`, `order.status.changed`, `order.cancelled`

---

## Priorités d'implémentation

### Phase 1 - MVP Core (Critique)
1. **Authentication** : Login/logout avec JWT
2. **Restaurant CRUD** : Gestion profil restaurant
3. **Menu Management** : CRUD items de menu
4. **Order Processing** : Gestion cycle de vie commandes
5. **Basic Analytics** : Statistiques essentielles

### Phase 2 - Dashboard Complet
1. **User Management** : Administration utilisateurs
2. **Advanced Analytics** : Tableaux de bord détaillés
3. **File Upload** : Images restaurant/menu
4. **Restaurant Status** : Workflow approbation
5. **Search & Filters** : Recherche avancée

### Phase 3 - Fonctionnalités Avancées
1. **Real-time Notifications** : WebSocket
2. **Performance Metrics** : Monitoring avancé
3. **Audit Logging** : Traçabilité actions
4. **Export Functions** : Rapports CSV/PDF
5. **Advanced Security** : Rate limiting, RBAC granulaire

---

## Notes techniques importantes

1. **Pagination** : Tous les endpoints de liste doivent supporter la pagination
2. **Validation** : Validation Bean sur tous les DTOs
3. **Error Handling** : Gestion d'erreurs standardisée avec codes HTTP appropriés
4. **CORS** : Configuration pour développement web
5. **Security** : Tous les endpoints protégés par JWT sauf `/auth/login`
6. **File Upload** : Support images avec validation taille/format
7. **Real-time** : WebSocket pour notifications commandes temps réel
