# 📄 CONTEXTE\_GITHUB\_COPILOT.md

Ce fichier sert à fournir le **contexte global** du projet SaaS "OneEats" à GitHub Copilot ou tout autre outil d'IA de génération de code. Place-le à la racine du dépôt Git pour que l'IA comprenne l'architecture, les rôles, les modules et les technologies.

---

## 🧠 Objectif du Projet

Créer une plateforme de commande de repas **sans livraison**, accessible sur mobile et web, permettant aux clients de commander **à emporter** ou **sur place** dans des restaurants partenaires. Le projet s'inspire de l'expérience utilisateur d'Uber Eats et des bornes McDonald's.

**Nom du projet** : OneEats
**Branding** : "oneeats" (packages, domaines, etc.)

---

## 👥 Utilisateurs cibles

- **CLIENT** : passe des commandes via l'app mobile React Native
- **RESTAURANT** : reçoit et gère les commandes via l'interface web React
- **ADMIN** : supervise l'ensemble via un dashboard admin web

---

## 🏗️ Stack technique utilisée

| Élément          | Technologie                   | Configuration spécifique |
| ---------------- | ----------------------------- | ------------------------ |
| Mobile           | React Native + Expo SDK 51    | TypeScript, Expo Router |
| Web frontend     | React.js + Vite               | TypeScript, Tailwind CSS |
| Backend          | Java 17+ (Quarkus 3.x)       | Maven, JPA/Hibernate Panache |
| Authentification | Keycloak + OAuth Google/Apple | OIDC, JWT, realm: oneeats |
| Base de données  | PostgreSQL 15+                | Docker container |
| Notifications    | Firebase Cloud Messaging      | Push notifications mobile |
| Conteneurs       | Docker, Docker Compose        | Multi-stage builds |
| CI/CD            | GitHub Actions                | Tests auto, déploiement |

---

## 🧩 Architecture hexagonale détaillée

Chaque domaine métier suit cette structure dans `src/main/java/com/oneeats/` :

```
<domaine>/
├── domain/         # Entités JPA, Value Objects, interfaces Repository
├── application/    # Use Cases, Services métier avec @ApplicationScoped
├── infrastructure/ # Implémentations Repository, intégrations externes
├── api/            # Resources REST avec @Path, DTOs, Mappers
```

**Exemple concret** pour le domaine User :
```
user/
├── domain/
│   ├── User.java (@Entity)
│   ├── UserRole.java (Enum)
│   └── UserRepository.java (Interface)
├── application/
│   ├── CreateUserUseCase.java
│   └── AuthenticateUserUseCase.java
├── infrastructure/
│   ├── UserRepositoryImpl.java (extends PanacheRepository)
│   └── KeycloakUserService.java
└── api/
    ├── UserResource.java (@Path("/api/users"))
    ├── UserDto.java (Record)
    └── UserMapper.java (@Mapper)
```

---

## 📦 Domaines métier principaux

### 🧑‍🤝‍🧑 User Domain
- Gestion des utilisateurs et authentification
- Rôles : CLIENT, RESTAURANT_OWNER, ADMIN
- Intégration Keycloak pour OAuth

### 🏪 Restaurant Domain
- Profils restaurants (nom, adresse, horaires, photos)
- Validation et modération par les admins
- Statuts : PENDING, ACTIVE, SUSPENDED

### 🍽️ Menu Domain
- Gestion des plats par restaurant
- Catégories, prix, descriptions, photos
- Disponibilité et stock en temps réel

### 📋 Order Domain
- Cycle de vie complet des commandes
- États : PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED
- Calcul automatique prix total + taxes

### 🔔 Notification Domain
- Notifications push via FCM
- Alertes par email/SMS
- Templates personnalisables

### ⚙️ Admin Domain
- Dashboard analytics et métriques
- Gestion des utilisateurs et restaurants
- Support client et modération

---

## 📱 Structure Frontend détaillée

### Mobile App (apps/mobile/)
```
app/
├── _layout.tsx                # Layout racine avec navigation
├── index.tsx                  # Écran d'accueil
├── (tabs)/                    # Navigation par onglets
│   ├── index.tsx             # Home tab - liste restaurants
│   ├── search.tsx            # Recherche et filtres
│   ├── orders.tsx            # Historique commandes
│   └── profile.tsx           # Profil utilisateur
├── auth/                      # Authentification
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── restaurant/
│   ├── [id].tsx              # Détails restaurant
│   └── menu/[id].tsx         # Détail plat
└── order-tracking/
    └── [orderId].tsx         # Suivi commande temps réel

context/                       # State management global
├── AuthContext.tsx           # État authentification
├── CartContext.tsx           # Panier d'achat
└── OrderContext.tsx          # Gestion commandes

hooks/
└── useFrameworkReady.ts      # Hook initialisation app
```

### Web App (apps/web/)
```
src/
├── App.tsx                   # Application principale
├── main.tsx                  # Point d'entrée
├── components/
│   ├── ui/                   # Composants réutilisables
│   ├── forms/                # Formulaires spécialisés
│   └── layout/               # Layouts (sidebar, header)
├── pages/
│   ├── Dashboard/            # Tableau de bord
│   ├── Orders/               # Gestion commandes
│   ├── Menu/                 # Édition menu
│   └── Settings/             # Paramètres restaurant
├── hooks/                    # Hooks personnalisés
│   ├── useAuth.ts
│   ├── useOrders.ts
│   └── useMenu.ts
├── data/
│   ├── api.ts               # Client API centralisé
│   └── types.ts             # Types TypeScript partagés
└── types/                   # Définitions de types
    ├── user.ts
    ├── restaurant.ts
    └── order.ts
```

---

## 🔐 Sécurité et authentification

### Configuration Keycloak
- **Realm** : `oneeats`
- **Clients** :
  - `oneeats-mobile` (public, PKCE pour mobile)
  - `oneeats-web` (confidential pour web admin)
  - `oneeats-backend` (bearer-only pour API)

### Rôles et permissions
```yaml
CLIENT:
  - Consulter restaurants et menus
  - Passer et suivre commandes
  - Gérer profil personnel

RESTAURANT_OWNER:
  - Gérer menu de son restaurant
  - Traiter commandes reçues
  - Consulter ses statistiques

ADMIN:
  - Gérer tous les utilisateurs
  - Modérer restaurants
  - Accès analytics globales
  - Support client
```

### Sécurisation API (Quarkus)
```java
@RolesAllowed("CLIENT")
@Path("/api/orders")
public class OrderResource {

    @POST
    @Authenticated
    public Response createOrder(@Valid CreateOrderDto dto) {
        // Seuls les clients peuvent créer des commandes
    }
}
```

---

## 📋 Conventions de développement

### Backend (Java/Quarkus)
- **Entities** : `@Entity` avec Hibernate Panache
- **Resources** : `@Path` pour endpoints REST
- **Services** : `@ApplicationScoped` pour injection
- **DTOs** : Records Java pour immutabilité
- **Tests** : `@QuarkusTest` avec TestContainers

### Frontend (TypeScript)
- **Composants** : PascalCase (`RestaurantCard.tsx`)
- **Hooks** : camelCase préfixe `use` (`useAuth.ts`)
- **Types** : Interfaces TypeScript strictes
- **State** : Context API + hooks personnalisés

### Base de données
- **Tables** : snake_case (`restaurant_menu`, `order_items`)
- **Colonnes** : snake_case (`created_at`, `user_id`)
- **Index** : Performance queries fréquentes

---

## 🔎 Tests et qualité

### Backend Testing
```java
@QuarkusTest
@TestProfile(TestProfile.class)
class RestaurantResourceTest {

    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    void shouldCreateRestaurant() {
        // Test avec mock sécurité
    }
}
```

### Frontend Testing
- **Unit Tests** : Jest + React Testing Library
- **E2E Tests** : Playwright pour parcours critiques
- **Linting** : ESLint + Prettier avec hooks pre-commit

### Métriques qualité
- **Couverture code** : Minimum 80% (Jacoco backend, c8 frontend)
- **Performance** : Core Web Vitals pour web, 60fps mobile
- **Accessibilité** : WCAG AA compliance

---

## 🚀 CI/CD et déploiement

### GitHub Actions Pipeline
```yaml
# Workflow automatisé
- Lint et tests backend (Maven)
- Lint et tests frontend (npm)
- Build Docker images
- Deploy staging sur push develop
- Deploy production sur release
```

### Docker Configuration
- **Backend** : Multi-stage build avec Quarkus
- **PostgreSQL** : Container avec volumes persistants
- **Keycloak** : Configuration automatisée
- **Reverse Proxy** : Nginx avec SSL/TLS

---

## 🔄 Objectifs avec GitHub Copilot

GitHub Copilot doit comprendre ce contexte pour :

1. **Générer du code backend Quarkus** respectant l'architecture hexagonale
2. **Créer des composants React/React Native** cohérents avec le design system
3. **Proposer des tests** appropriés (JUnit, Jest, TestContainers)
4. **Suivre les conventions** de nommage et de sécurité
5. **Intégrer les APIs** existantes (Keycloak, FCM, PostgreSQL)

### Exemples de prompts optimisés

```
// Backend
"Créer une entité Order avec statuts et relations vers User et Restaurant"

// Frontend Mobile
"Générer un écran React Native pour afficher la liste des restaurants avec recherche"

// Frontend Web
"Créer un composant React pour gérer les commandes en temps réel côté restaurateur"

// Tests
"Écrire un test d'intégration Quarkus pour l'endpoint de création de commande"
```

---

## 📊 Métriques et analytics

### KPIs techniques
- **Performance** : Temps réponse API < 200ms
- **Disponibilité** : 99.9% uptime
- **Sécurité** : Zéro vulnérabilité critique

### KPIs business
- **Adoption** : Nombre d'utilisateurs actifs
- **Conversion** : Taux de commandes completées
- **Satisfaction** : Notes restaurants et app

---

📝 **Note importante** : Ce contexte est maintenu à jour avec l'évolution du projet. Toute modification d'architecture, ajout de domaine ou changement de stack doit être reflétée ici pour garantir la cohérence des suggestions Copilot.
