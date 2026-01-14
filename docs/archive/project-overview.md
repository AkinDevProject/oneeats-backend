# OneEats - Project Overview

> Documentation générée automatiquement par BMAD Document-Project Workflow
> Date: 2026-01-14 | Scan Level: Quick

---

## 📋 Résumé Exécutif

**OneEats** est une plateforme de commande de nourriture pour le retrait en magasin (Click & Collect). Le projet comprend un backend API, un dashboard web pour les restaurants/admins, et une application mobile pour les clients.

| Attribut | Valeur |
|----------|--------|
| **Nom du Projet** | oneeats-backend |
| **Type de Repository** | Monorepo Multi-Part |
| **Architecture** | Hexagonale (Ports & Adapters) + DDD |
| **Langage Principal** | Java 21 (Backend), TypeScript (Frontend) |
| **Framework Backend** | Quarkus 3.24.2 |
| **Framework Frontend** | React 18 + Vite |
| **Framework Mobile** | React Native 0.81 + Expo 54 |

---

## 🏗️ Structure du Repository

```
oneeats-backend/                    # Monorepo racine
├── src/                            # Backend Java/Quarkus
│   ├── main/java/com/oneeats/      # Code source
│   └── test/java/com/oneeats/      # Tests unitaires
├── apps/
│   ├── web/                        # Dashboard React
│   └── mobile/                     # App React Native/Expo
└── docs/                           # Documentation
```

### Parties du Projet

| Partie | Chemin | Type | Technologies |
|--------|--------|------|--------------|
| **Backend API** | `/` | backend | Java 21, Quarkus 3.24.2, PostgreSQL, Keycloak |
| **Dashboard Web** | `apps/web/` | web | React 18, TypeScript, Vite, Tailwind CSS |
| **App Mobile** | `apps/mobile/` | mobile | React Native 0.81, Expo 54, TypeScript |

---

## 🎯 Domaines Métier (DDD)

Le backend est organisé en domaines métier suivant le pattern DDD:

| Domaine | Description | Entités Principales |
|---------|-------------|---------------------|
| **user** | Gestion des utilisateurs clients | User, UserStatus |
| **restaurant** | Gestion des restaurants partenaires | Restaurant, OpeningHours, WeeklySchedule |
| **menu** | Gestion des menus et items | MenuItem, MenuItemOption, MenuItemChoice |
| **order** | Gestion des commandes | Order, OrderItem, OrderStatus |
| **admin** | Administration plateforme | Admin, AdminRole |
| **notification** | Système de notifications | Notification, NotificationType |
| **security** | Authentification et sessions | UserSession, AuthenticationAttempt |
| **analytics** | Statistiques et métriques | PlatformStats, DailyStats |
| **favorite** | Favoris utilisateurs | UserFavorite |

---

## 📊 Stack Technologique

### Backend (Java/Quarkus)

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Langage | Java | 21 |
| Framework | Quarkus | 3.24.2 |
| ORM | Hibernate Panache | - |
| Database | PostgreSQL | - |
| Auth | Keycloak (OIDC) | - |
| API | REST Jackson | - |
| WebSocket | Quarkus WebSockets | - |
| Monitoring | Micrometer + Prometheus | - |

### Frontend Web (React)

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Langage | TypeScript | 5.5.3 |
| Framework | React | 18.3.1 |
| Build | Vite | 5.4.2 |
| Styling | Tailwind CSS | 3.4.1 |
| Routing | React Router DOM | 7.6.3 |

### Mobile (React Native/Expo)

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Langage | TypeScript | 5.9.2 |
| Framework | React Native | 0.81.4 |
| Platform | Expo | 54.0.7 |
| Navigation | Expo Router | 6.0.4 |
| State | React Query | 5.85.5 |

---

## 🔗 Intégration entre Parties

```
┌─────────────────┐     REST API      ┌─────────────────┐
│  Dashboard Web  │◄────────────────►│   Backend API   │
│  (React/Vite)   │                   │  (Quarkus)      │
└─────────────────┘                   └────────┬────────┘
                                               │
┌─────────────────┐     REST API              │
│   App Mobile    │◄──────────────────────────┘
│  (Expo/RN)      │
└─────────────────┘
```

- **Backend → Web**: Quinoa sert le dashboard en mode dev
- **Backend → Mobile**: API REST consommée par React Query
- **Auth**: Keycloak OIDC pour tous les clients

---

## 📁 Documentation Existante

Le projet dispose d'une documentation complète:

- [Architecture](./ARCHITECTURE.md) - Architecture système
- [Architecture Hexagonale](./ARCHITECTURE_HEXAGONALE.md) - Détails DDD
- [API Specs](./API_SPECS.md) - Spécifications API
- [Data Model](./DATA_MODEL.md) - Modèle de données
- [Business Rules](./BUSINESS_RULES.md) - Règles métier
- [Roadmap](./ROADMAP.md) - Feuille de route

---

## 🚀 Démarrage Rapide

### Prérequis

- Java 21 (JDK)
- Docker (pour PostgreSQL)
- Node.js 18+ (pour frontend)
- IntelliJ IDEA (recommandé)

### Lancer le Backend

```bash
# 1. Démarrer la base de données
docker-compose -f docker-compose.dev.yml up -d

# 2. Lancer Quarkus (via IntelliJ IDEA)
# Note: ./mvnw n'est pas disponible en CLI
```

### Lancer le Mobile

```bash
cd apps/mobile
npm install
npm start
```

---

## 📈 Métriques du Projet

| Métrique | Valeur |
|----------|--------|
| Controllers API | 12 |
| Domain Models | 24 |
| Repositories | 19 |
| DTOs | 19 |
| Web Components | 22 |
| Web Pages | 22 |
| Mobile Screens | 16 |
| Unit Tests | 16 |
| Docs Files | 32 |

---

*Généré par BMAD Document-Project Workflow v1.2.0*
