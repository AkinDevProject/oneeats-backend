# OneEats - Analyse de l'Arbre Source

**Date de génération:** 2026-01-21
**Version:** MVP 0.7

---

## Structure Globale du Monorepo

```
oneeats-backend/
├── apps/                           # Applications Frontend
│   ├── web/                        # Dashboard React (Part: web)
│   └── mobile/                     # App React Native (Part: mobile)
├── src/                            # Backend Java/Quarkus (Part: backend)
│   ├── main/java/com/oneeats/      # Code source backend
│   └── test/java/com/oneeats/      # Tests backend
├── docs/                           # Documentation du projet
├── tests/                          # Tests E2E Playwright
├── keycloak/                       # Configuration Keycloak
├── scripts/                        # Scripts utilitaires
├── _bmad/                          # Configuration BMAD
└── _bmad-output/                   # Artefacts BMAD générés
```

---

## Backend (Java/Quarkus) - Architecture Hexagonale

```
src/main/java/com/oneeats/
├── OneEatsApplication.java         # Point d'entrée Quarkus
│
├── admin/                          # Domaine Administration
│   ├── api/                        # DTOs publics
│   ├── domain/
│   │   ├── model/                  # Admin, AdminRole, AdminStatus
│   │   └── repository/             # IAdminRepository
│   └── infrastructure/
│       ├── repository/             # JpaAdminRepository
│       └── web/                    # AdminController
│
├── analytics/                      # Domaine Analytics
│   └── infrastructure/
│       └── web/                    # AnalyticsController
│
├── configuration/                  # Configuration applicative
│
├── favorite/                       # Domaine Favoris
│   ├── adapter/web/                # UserFavoriteController
│   ├── domain/
│   │   ├── model/                  # UserFavorite
│   │   └── repository/             # IUserFavoriteRepository
│   └── infrastructure/
│       └── repository/             # JpaUserFavoriteRepository
│
├── menu/                           # Domaine Menu
│   ├── api/                        # DTOs (CreateMenuItemRequest, etc.)
│   ├── domain/
│   │   ├── model/                  # MenuItem, MenuItemOption, etc.
│   │   └── repository/             # IMenuItemRepository
│   └── infrastructure/
│       ├── persistence/mapper/     # MenuItemPersistenceMapper
│       └── web/                    # MenuController
│
├── notification/                   # Domaine Notifications
│   ├── domain/
│   │   ├── model/                  # Notification, NotificationType, etc.
│   │   └── repository/             # INotificationRepository
│   └── infrastructure/
│       ├── repository/             # JpaNotificationRepository
│       └── web/                    # NotificationController
│
├── order/                          # Domaine Commandes (RÉFÉRENCE)
│   ├── api/                        # DTOs complets
│   ├── application/                # OrderService, EventHandler
│   ├── domain/
│   │   ├── model/                  # Order, OrderItem, OrderStatus
│   │   └── repository/             # IOrderRepository
│   └── infrastructure/
│       ├── mapper/                 # OrderMapper
│       ├── repository/             # JpaOrderRepository
│       └── web/                    # OrderController
│
├── restaurant/                     # Domaine Restaurant
│   ├── api/                        # DTOs
│   ├── domain/
│   │   ├── model/                  # Restaurant, OpeningHours, etc.
│   │   └── repository/             # IRestaurantRepository
│   └── infrastructure/
│       ├── mapper/                 # RestaurantMapper
│       ├── repository/             # JpaRestaurantRepository
│       └── web/                    # RestaurantController
│
├── security/                       # Domaine Sécurité
│   ├── application/                # AuthService
│   ├── domain/
│   │   ├── model/                  # UserSession, AuthenticationAttempt
│   │   └── repository/             # IUserSessionRepository, etc.
│   └── infrastructure/
│       ├── controller/             # AuthController
│       ├── repository/             # JpaUserSessionRepository, etc.
│       └── OidcTenantResolver.java # Résolution tenant OIDC
│
├── shared/                         # Utilitaires Partagés
│   ├── domain/entity/              # BaseEntity
│   ├── infrastructure/web/         # StaticResourceController, etc.
│   └── repository/                 # BaseRepository
│
├── user/                           # Domaine Utilisateur
│   ├── api/                        # DTOs
│   ├── domain/
│   │   ├── model/                  # User, UserStatus
│   │   └── repository/             # IUserRepository
│   └── infrastructure/
│       ├── mapper/                 # UserMapper
│       ├── repository/             # JpaUserRepository
│       └── web/                    # UserController, AdminUserController
│
└── web/                            # Contrôleurs Web (SPA)
```

---

## Web Dashboard (React/Vite)

```
apps/web/
├── src/
│   ├── main.tsx                    # Point d'entrée React
│   ├── App.tsx                     # Router principal
│   │
│   ├── components/
│   │   ├── ui/                     # Composants UI réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── TimerBadge.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── ImageWithFallback.tsx
│   │   │   └── MenuItemImage.tsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── RestaurantLayout.tsx # Layout dashboard restaurateur
│   │   │   └── AdminLayout.tsx      # Layout dashboard admin
│   │   │
│   │   ├── dashboard/              # Composants dashboard
│   │   │   ├── MetricCard.tsx
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── QuickMetrics.tsx
│   │   │   └── StatusDistribution.tsx
│   │   │
│   │   ├── admin/                  # Composants admin
│   │   │   ├── AdminMetricCard.tsx
│   │   │   ├── AdminFilterTabs.tsx
│   │   │   ├── AdminSearchFilter.tsx
│   │   │   ├── SystemStatusCard.tsx
│   │   │   ├── AdminSkeleton.tsx
│   │   │   ├── AdminAlertZone.tsx
│   │   │   ├── AdminMapView.tsx
│   │   │   ├── AdminNotificationCenter.tsx
│   │   │   ├── AdminPageHeader.tsx
│   │   │   ├── AdminQuickActions.tsx
│   │   │   ├── AdminShortcutsHelp.tsx
│   │   │   ├── AdminInsights.tsx
│   │   │   └── AdminComparison.tsx
│   │   │
│   │   ├── orders/                 # Composants commandes
│   │   │   ├── FilterTabs.tsx
│   │   │   └── OrderCard.tsx
│   │   │
│   │   ├── menu/                   # Composants menu
│   │   │   └── CategoryTabs.tsx
│   │   │
│   │   ├── forms/                  # Composants formulaires
│   │   │   └── MenuItemOptionsForm.tsx
│   │   │
│   │   ├── modals/                 # Modales
│   │   │   ├── UserModal.tsx
│   │   │   └── OrderDetailModal.tsx
│   │   │
│   │   ├── ProtectedRoute.tsx      # Route protégée
│   │   ├── NotificationCenter.tsx  # Centre de notifications
│   │   └── OrderBoard.tsx          # Tableau commandes
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx           # /login
│   │   ├── CallbackPage.tsx        # /callback
│   │   │
│   │   ├── restaurant/             # Pages restaurateur
│   │   │   ├── AnalyticsPage.tsx   # /restaurant/analytics
│   │   │   ├── MenuPage.tsx        # /restaurant/menu
│   │   │   ├── OrdersManagementPage.tsx # /restaurant/orders
│   │   │   ├── RestaurantProfilePage.tsx # /restaurant/profile
│   │   │   ├── RestaurantSettingsPage.tsx # /restaurant/settings
│   │   │   └── components/         # Composants spécifiques
│   │   │       ├── OrderStatusBoard.tsx
│   │   │       ├── QuickMetrics.tsx
│   │   │       └── OrderDetailModal.tsx
│   │   │
│   │   └── admin/                  # Pages admin
│   │       ├── AdminDashboard.tsx  # /admin
│   │       ├── UsersPage.tsx       # /admin/users
│   │       ├── RestaurantsManagementPage.tsx # /admin/restaurants
│   │       ├── OrdersSupervisionPage.tsx # /admin/orders
│   │       ├── AnalyticsSystemPage.tsx # /admin/analytics
│   │       └── StatsPage.tsx       # /admin/stats
│   │
│   ├── hooks/                      # Hooks personnalisés (API)
│   ├── services/                   # Services API
│   ├── types/                      # Types TypeScript
│   └── utils/                      # Utilitaires
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Mobile App (React Native/Expo)

```
apps/mobile/
├── app/                            # Expo Router (file-based routing)
│   ├── _layout.tsx                 # Layout racine
│   ├── +not-found.tsx              # Page 404
│   │
│   ├── (tabs)/                     # Navigation par onglets
│   │   ├── _layout.tsx             # Tab navigator
│   │   ├── index.tsx               # Home (restaurants)
│   │   ├── cart.tsx                # Panier
│   │   ├── favorites.tsx           # Favoris
│   │   └── profile.tsx             # Profil
│   │
│   ├── auth/                       # Authentification
│   │   ├── login.tsx               # Écran login
│   │   ├── callback.tsx            # Callback OAuth
│   │   └── debug.tsx               # Debug auth
│   │
│   ├── restaurant/
│   │   └── [id].tsx                # Détail restaurant
│   │
│   ├── menu/
│   │   └── [id].tsx                # Détail menu item
│   │
│   ├── order/
│   │   ├── _layout.tsx
│   │   └── [id].tsx                # Détail commande
│   │
│   ├── orders/
│   │   ├── _layout.tsx
│   │   └── index.tsx               # Historique commandes
│   │
│   ├── account/
│   │   ├── _layout.tsx
│   │   └── index.tsx               # Compte utilisateur
│   │
│   ├── settings/
│   │   ├── _layout.tsx
│   │   └── index.tsx               # Paramètres
│   │
│   ├── aide-support.tsx            # Aide et support
│   └── test-notifications/
│       └── index.tsx               # Test notifications
│
├── src/
│   ├── components/                 # Composants React Native
│   ├── contexts/                   # React Contexts
│   ├── hooks/                      # Hooks personnalisés
│   ├── services/                   # Services API
│   ├── types/                      # Types TypeScript
│   └── utils/                      # Utilitaires
│
├── .maestro/                       # Tests E2E Maestro
│   └── flows/
│
├── tests/                          # Tests Jest
│   ├── unit/
│   ├── integration/
│   └── components/
│
├── app.json                        # Config Expo
├── tsconfig.json
└── package.json
```

---

## Documentation

```
docs/
├── README.md                       # Index principal
├── ROADMAP.md                      # Progression projet
├── BUGS.md                         # Bugs connus
├── project-overview.md             # Vue d'ensemble (généré)
├── source-tree-analysis.md         # Ce fichier
├── project-scan-report.json        # État du workflow
│
├── shared/                         # Documentation partagée
│   ├── analyst/                    # Règles métier, use cases
│   ├── architect/                  # Architecture, ADRs
│   ├── architect-dev/              # API, Data Model, Security
│   ├── pm/                         # PRD, Epics, Stories
│   ├── tea/                        # Tests strategy
│   ├── bmad/                       # Documentation BMAD
│   └── concepts/                   # Concepts futurs
│
├── backend/dev/                    # Guides développeur backend
├── mobile/                         # Documentation mobile
│   ├── dev/                        # Guides développeur
│   ├── ux-designer/                # Specs UI
│   └── tea/                        # Tests mobile
│
├── web/                            # Documentation web
│   ├── ux-designer/                # Specs UI
│   └── tea/                        # Tests web
│
├── reports/                        # Rapports UAT
└── archive/                        # Anciens fichiers
```

---

## Points d'Intégration

### Backend → Web Dashboard

- **API REST:** Backend expose `/api/*` consommé par le dashboard
- **Quinoa:** Sert les fichiers statiques du build Vite
- **Auth:** Cookies de session Quarkus OIDC
- **Routes protégées:** `/restaurant/*`, `/admin/*`

### Backend → Mobile App

- **API REST:** Même endpoints que web
- **Auth:** Bearer tokens JWT (tenant OIDC "mobile")
- **Headers:** `Authorization: Bearer <jwt>`

### Web Dashboard → Keycloak

- **Flow:** Authorization Code avec PKCE
- **Cookies:** `q_session`, `q_session_at`, `q_session_rt`

### Mobile App → Keycloak

- **Flow:** Authorization Code avec PKCE (Expo Auth Session)
- **Tokens:** Stockés dans Expo SecureStore
