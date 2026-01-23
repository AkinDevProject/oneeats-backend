# ADR-006 — RBAC MVP (Role-Based Access Control)

## Contexte

- L'authentification Keycloak est configurée (ADR-001, ADR-005)
- Les endpoints API sont actuellement non protégés
- Le fichier `Roles.java` définit 5 rôles : ADMIN, USER, RESTAURANT, RESTAURANT_MANAGER, SUPPORT
- `RestaurantStaffEntity` gère les rôles par restaurant : OWNER, MANAGER, STAFF
- `AuthService` fournit déjà des helpers : `hasRole()`, `hasAccessToRestaurant()`, `canManageMenu()`, `canManageStaff()`
- Pour le MVP, une implémentation simplifiée est requise

## Décision

### Stratégie à 2 niveaux pour le MVP

**Niveau 1 : Rôles Keycloak (3 rôles MVP)**

| Rôle | Constante | Description |
|------|-----------|-------------|
| Admin | `Roles.ADMIN` | Accès complet plateforme |
| Restaurant | `Roles.RESTAURANT` | Gestion de son/ses restaurant(s) |
| Client | `Roles.USER` | Passer commandes, gérer profil |

**Niveau 2 : Vérification contextuelle**

Pour les endpoints restaurant, après validation du rôle Keycloak, vérifier l'accès au restaurant spécifique via `AuthService.hasAccessToRestaurant()`.

### Annotations par type d'endpoint

| Type | Annotation | Exemple |
|------|------------|---------|
| Public | `@PermitAll` | Consultation menus, restaurants |
| Utilisateur connecté | `@Authenticated` | Voir ses commandes |
| Client uniquement | `@RolesAllowed(Roles.USER)` | Passer commande |
| Restaurateur | `@RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})` | Gérer menu |
| Admin uniquement | `@RolesAllowed(Roles.ADMIN)` | Gestion utilisateurs |

### Implémentation

```java
// Exemple endpoint restaurant avec double vérification
@PUT
@Path("/{id}")
@RolesAllowed({Roles.RESTAURANT, Roles.ADMIN})
public Response updateRestaurant(@PathParam("id") UUID id, ...) {
    // Admin bypass la vérification restaurant
    if (!authService.hasRole(Roles.ADMIN)) {
        authService.requireRestaurantAccess(id);
    }
    // Business logic...
}
```

### Matrice des permissions par endpoint

#### AdminUserController (`/api/admin/users`)
| Endpoint | Annotation |
|----------|------------|
| ALL | `@RolesAllowed(Roles.ADMIN)` |

#### RestaurantController (`/api/restaurants`)
| Endpoint | Méthode | Annotation | Vérification |
|----------|---------|------------|--------------|
| `/` | GET | `@PermitAll` | - |
| `/{id}` | GET | `@PermitAll` | - |
| `/active` | GET | `@PermitAll` | - |
| `/` | POST | `@RolesAllowed(RESTAURANT, ADMIN)` | - |
| `/{id}` | PUT | `@RolesAllowed(RESTAURANT, ADMIN)` | + hasAccess |
| `/{id}/toggle-status` | PATCH | `@RolesAllowed(RESTAURANT, ADMIN)` | + hasAccess |
| `/{id}/image` | POST/DELETE | `@RolesAllowed(RESTAURANT, ADMIN)` | + hasAccess |
| `/{id}` | DELETE | `@RolesAllowed(ADMIN)` | - |
| `/{id}/status` | PUT | `@RolesAllowed(ADMIN)` | - |

#### MenuController (`/api/menu-items`)
| Endpoint | Méthode | Annotation | Vérification |
|----------|---------|------------|--------------|
| `/`, `/{id}`, `/restaurant/{id}`, `/search` | GET | `@PermitAll` | - |
| `/` | POST | `@RolesAllowed(RESTAURANT, ADMIN)` | + hasAccess(restaurantId) |
| `/{id}` | PUT/DELETE | `@RolesAllowed(RESTAURANT, ADMIN)` | + hasAccess |
| `/{id}/image` | POST/DELETE | `@RolesAllowed(RESTAURANT, ADMIN)` | + hasAccess |

#### OrderController (`/api/orders`)
| Endpoint | Méthode | Annotation | Vérification |
|----------|---------|------------|--------------|
| `/` | POST | `@RolesAllowed(Roles.USER)` | - |
| `/{id}` | GET | `@Authenticated` | + isOwnerOrRestaurant |
| `/` | GET | `@Authenticated` | filtré par userId/restaurantId |
| `/{id}/status` | PUT | `@RolesAllowed(RESTAURANT, ADMIN)` | + hasAccess |

#### AnalyticsController (`/api/analytics`)
| Endpoint | Annotation |
|----------|------------|
| `/platform` | `@RolesAllowed(ADMIN)` |
| `/dashboard`, `/revenue`, `/trends` | `@RolesAllowed(RESTAURANT, ADMIN)` |

#### UserFavoriteController (`/api/users/{userId}/favorites`)
| Endpoint | Annotation | Vérification |
|----------|------------|--------------|
| ALL | `@RolesAllowed(Roles.USER)` | + isOwner(userId) |

## Évolution Future (Post-MVP)

Les rôles staff (`OWNER`, `MANAGER`, `STAFF`) pourront être activés quand :
- Des restaurants auront plusieurs employés avec permissions différentes
- La granularité actuelle sera insuffisante

L'infrastructure est déjà en place :
- `RestaurantStaffEntity` avec `StaffRole` enum
- JSONB permissions pour override fin
- Méthodes `canManageMenu()`, `canManageStaff()` dans AuthService

## Conséquences

### Positives
- Implémentation simple et maintenable
- Sécurité déclarative avec `@RolesAllowed`
- Double vérification pour endpoints restaurant
- Évolutif vers rôles staff sans refactoring majeur

### Négatives
- Tous les restaurateurs ont accès complet (pas de distinction OWNER/MANAGER/STAFF)
- Vérification restaurant dupliquée dans chaque méthode (acceptable pour MVP)

### Actions requises
1. Ajouter `requireRestaurantAccess()` dans AuthService
2. Décommenter `@RolesAllowed` dans AdminUserController
3. Ajouter annotations sur tous les controllers
4. Créer tests d'intégration sécurité

## Status

**Accepted** (2026-01-23)

## Références

- ADR-001: Authentification Keycloak
- ADR-005: Authentication Strategy
- `com.oneeats.security.Roles`
- `com.oneeats.security.application.AuthService`