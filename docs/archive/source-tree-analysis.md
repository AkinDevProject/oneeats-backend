# OneEats - Source Tree Analysis

> Analyse de la structure du code source
> Date: 2026-01-14 | Scan Level: Quick

---

## 🗂️ Structure Complète

```
oneeats-backend/
│
├── 📄 pom.xml                          # Maven POM (Quarkus 3.24.2)
├── 📄 CLAUDE.md                        # Instructions Claude Code
├── 📄 CONTEXT.md                       # Contexte projet complet
├── 📄 README.md                        # Documentation principale
│
├── 📁 src/                             # ══════ BACKEND JAVA ══════
│   ├── 📁 main/
│   │   ├── 📁 java/com/oneeats/
│   │   │   │
│   │   │   ├── 📁 user/                # 👤 Domaine Utilisateur
│   │   │   │   ├── 📁 application/     # Commands, Queries, DTOs
│   │   │   │   ├── 📁 domain/          # Model, Repository, Service
│   │   │   │   └── 📁 infrastructure/  # Controller, JPA Repository
│   │   │   │
│   │   │   ├── 📁 restaurant/          # 🍽️ Domaine Restaurant
│   │   │   │   ├── 📁 application/
│   │   │   │   ├── 📁 domain/
│   │   │   │   └── 📁 infrastructure/
│   │   │   │
│   │   │   ├── 📁 menu/                # 📋 Domaine Menu
│   │   │   │   ├── 📁 application/
│   │   │   │   ├── 📁 domain/
│   │   │   │   └── 📁 infrastructure/
│   │   │   │
│   │   │   ├── 📁 order/               # 🛒 Domaine Commande
│   │   │   │   ├── 📁 application/
│   │   │   │   ├── 📁 domain/
│   │   │   │   └── 📁 infrastructure/
│   │   │   │
│   │   │   ├── 📁 admin/               # 👑 Domaine Administration
│   │   │   │   ├── 📁 application/
│   │   │   │   ├── 📁 domain/
│   │   │   │   └── 📁 infrastructure/
│   │   │   │
│   │   │   ├── 📁 notification/        # 🔔 Domaine Notification
│   │   │   │   ├── 📁 application/
│   │   │   │   ├── 📁 domain/
│   │   │   │   └── 📁 infrastructure/
│   │   │   │
│   │   │   ├── 📁 security/            # 🔐 Domaine Sécurité
│   │   │   │   ├── 📁 application/
│   │   │   │   ├── 📁 domain/
│   │   │   │   └── 📁 infrastructure/
│   │   │   │
│   │   │   ├── 📁 analytics/           # 📊 Domaine Analytics
│   │   │   │   ├── 📁 application/
│   │   │   │   └── 📁 infrastructure/
│   │   │   │
│   │   │   ├── 📁 favorite/            # ⭐ Domaine Favoris
│   │   │   │   ├── 📁 adapter/
│   │   │   │   ├── 📁 application/
│   │   │   │   ├── 📁 domain/
│   │   │   │   └── 📁 infrastructure/
│   │   │   │
│   │   │   ├── 📁 shared/              # 🔧 Code Partagé
│   │   │   │   ├── 📁 domain/          # Exceptions, Value Objects
│   │   │   │   ├── 📁 infrastructure/  # Controllers utilitaires
│   │   │   │   └── 📁 repository/      # BaseRepository
│   │   │   │
│   │   │   ├── 📁 configuration/       # ⚙️ Configuration
│   │   │   └── 📁 web/                 # 🌐 Web Controller (SPA)
│   │   │
│   │   └── 📁 resources/
│   │       ├── 📄 application.yml          # Config principale
│   │       ├── 📄 application-dev.yml      # Config développement
│   │       ├── 📄 application-test.yml     # Config tests
│   │       ├── 📄 application-prod.yml     # Config production
│   │       └── 📄 application-web.yml      # Config web
│   │
│   └── 📁 test/java/com/oneeats/       # 🧪 Tests Unitaires
│       └── 📁 unit/
│           ├── 📁 user/domain/
│           ├── 📁 order/domain/
│           ├── 📁 menu/domain/
│           ├── 📁 restaurant/
│           ├── 📁 admin/domain/
│           └── 📁 notification/domain/
│
├── 📁 apps/                            # ══════ FRONTENDS ══════
│   │
│   ├── 📁 web/                         # 🖥️ Dashboard React
│   │   ├── 📄 package.json
│   │   ├── 📄 vite.config.ts
│   │   ├── 📄 tailwind.config.js
│   │   └── 📁 src/
│   │       ├── 📁 components/          # Composants réutilisables
│   │       │   ├── 📁 ui/              # Button, Card, Modal, Input...
│   │       │   ├── 📁 dashboard/       # MetricCard, QuickMetrics...
│   │       │   ├── 📁 forms/           # MenuItemOptionsForm
│   │       │   ├── 📁 layouts/         # AdminLayout, RestaurantLayout
│   │       │   └── 📁 modals/          # UserModal, OrderDetailModal
│   │       ├── 📁 pages/
│   │       │   ├── 📁 admin/           # Dashboard admin (6 pages)
│   │       │   │   ├── AdminDashboard.tsx
│   │       │   │   ├── UsersPage.tsx
│   │       │   │   ├── RestaurantsManagementPage.tsx
│   │       │   │   ├── OrdersSupervisionPage.tsx
│   │       │   │   ├── StatsPage.tsx
│   │       │   │   └── AnalyticsSystemPage.tsx
│   │       │   └── 📁 restaurant/      # Dashboard restaurant (8+ pages)
│   │       │       ├── MenuPage.tsx
│   │       │       ├── OrdersManagementPage.tsx
│   │       │       ├── AnalyticsPage.tsx
│   │       │       ├── RestaurantProfilePage.tsx
│   │       │       ├── RestaurantSettingsPage.tsx
│   │       │       └── 📁 designs/     # 5 designs commandes
│   │       ├── 📁 services/            # API services
│   │       ├── 📁 hooks/               # Custom hooks
│   │       ├── 📁 types/               # TypeScript types
│   │       └── 📁 utils/               # Utilitaires
│   │
│   └── 📁 mobile/                      # 📱 App React Native/Expo
│       ├── 📄 package.json
│       ├── 📄 app.json                 # Config Expo
│       ├── 📁 app/                     # Expo Router (file-based)
│       │   ├── 📄 _layout.tsx          # Root layout
│       │   ├── 📁 (tabs)/              # Navigation principale
│       │   │   ├── 📄 index.tsx        # Home (restaurants)
│       │   │   ├── 📄 cart.tsx         # Panier
│       │   │   ├── 📄 favorites.tsx    # Favoris
│       │   │   └── 📄 profile.tsx      # Profil
│       │   ├── 📁 auth/
│       │   │   └── 📄 login.tsx        # Connexion
│       │   ├── 📁 restaurant/
│       │   │   └── 📄 [id].tsx         # Détail restaurant
│       │   ├── 📁 menu/
│       │   │   └── 📄 [id].tsx         # Détail menu item
│       │   ├── 📁 order/
│       │   │   └── 📄 [id].tsx         # Suivi commande
│       │   └── 📁 settings/
│       │       └── 📄 index.tsx        # Paramètres
│       └── 📁 components/              # Composants partagés
│           ├── 📁 ui/                  # IconSymbol, TabBarBackground
│           └── 📄 MenuItemOptions.tsx
│
├── 📁 docs/                            # 📚 Documentation
│   ├── 📄 README.md                    # Index documentation
│   ├── 📄 ARCHITECTURE.md
│   ├── 📄 API_SPECS.md
│   ├── 📄 DATA_MODEL.md
│   ├── 📄 BUSINESS_RULES.md
│   ├── 📁 guides/
│   ├── 📁 business/
│   ├── 📁 mobile/
│   └── 📁 tests/
│
├── 📁 .github/workflows/               # 🔄 CI/CD
│   └── 📄 ci.yml
│
└── 📁 docker-compose files             # 🐳 Docker
    ├── 📄 docker-compose.yml
    └── 📄 docker-compose.dev.yml
```

---

## 📐 Architecture Hexagonale par Domaine

Chaque domaine suit la même structure:

```
domain/
├── 📁 application/           # 🎯 Use Cases
│   ├── 📁 command/           # Commands (write operations)
│   │   ├── CreateXxxCommand.java
│   │   └── CreateXxxCommandHandler.java
│   ├── 📁 query/             # Queries (read operations)
│   │   ├── GetXxxQuery.java
│   │   └── GetXxxQueryHandler.java
│   ├── 📁 dto/               # Data Transfer Objects
│   └── 📁 mapper/            # Application mappers
│
├── 📁 domain/                # 💎 Core Business
│   ├── 📁 model/             # Entities & Aggregates
│   ├── 📁 repository/        # Repository interfaces (ports)
│   ├── 📁 service/           # Domain services
│   ├── 📁 event/             # Domain events
│   ├── 📁 vo/                # Value Objects
│   └── 📁 specification/     # Business rules
│
└── 📁 infrastructure/        # 🔌 Adapters
    ├── 📁 web/               # REST Controllers
    ├── 📁 repository/        # JPA implementations
    ├── 📁 entity/            # JPA Entities
    └── 📁 mapper/            # Infrastructure mappers
```

---

## 🎯 Points d'Entrée

| Application | Point d'Entrée | Description |
|-------------|----------------|-------------|
| **Backend** | `OneEatsApplication.java` | Main Quarkus |
| **Web** | `src/main.tsx` | React entry |
| **Mobile** | `app/_layout.tsx` | Expo Router root |

---

## 🔗 Flux d'Intégration

```
Mobile App                    Web Dashboard
     │                              │
     │   HTTP/REST                  │   HTTP/REST (via Quinoa)
     ▼                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Controllers (API)                     │
│  UserController, OrderController, RestaurantController   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Application Layer                        │
│           Commands, Queries, Handlers, DTOs              │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Domain Layer                          │
│          Entities, Services, Repositories (interfaces)   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                Infrastructure Layer                      │
│              JPA Repositories, Entities                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                     PostgreSQL
```

---

*Généré par BMAD Document-Project Workflow v1.2.0*
