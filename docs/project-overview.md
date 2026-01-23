# OneEats - Vue d'Ensemble du Projet

**Date de génération:** 2026-01-21
**Version:** MVP 0.7
**Workflow:** document-project (full_rescan)

---

## Résumé Exécutif

OneEats est une plateforme de commande alimentaire pour le retrait en magasin (pas de livraison dans le MVP). Le projet suit une architecture monorepo avec trois parties distinctes :

| Partie | Technologie | Description |
|--------|-------------|-------------|
| **Backend** | Java 21 + Quarkus 3.24.2 | API REST avec architecture hexagonale, PostgreSQL, Keycloak |
| **Web Dashboard** | React 18 + TypeScript + Vite | Interface de gestion pour restaurateurs et administrateurs |
| **Mobile App** | React Native 0.81 + Expo 54 | Application cliente pour les utilisateurs finaux |

---

## Classification du Projet

- **Type de Repository:** Monorepo
- **Nombre de Parties:** 3
- **Stack Technologique Principal:** Java/Quarkus + React + React Native/Expo

---

## Stack Technologique Détaillé

### Backend (Java/Quarkus)

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Langage | Java | 21 |
| Framework | Quarkus | 3.24.2 |
| Base de données | PostgreSQL | - |
| ORM | Hibernate ORM Panache | - |
| Authentification | Keycloak (OIDC) | - |
| Validation | Hibernate Validator | - |
| WebSocket | Quarkus WebSockets | - |
| Métriques | Micrometer + Prometheus | - |
| Tests | JUnit 5, Mockito, REST Assured | - |
| Frontend Integration | Quinoa | 2.6.2 |

### Web Dashboard (React)

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | React | 18.3.1 |
| Langage | TypeScript | 5.5.3 |
| Build Tool | Vite | 5.4.2 |
| Styling | Tailwind CSS | 3.4.1 |
| Routing | React Router DOM | 7.6.3 |
| Charts | Recharts | 3.1.0 |
| Icons | Lucide React | 0.344.0 |
| Date Utils | date-fns | 4.1.0 |

### Mobile App (React Native/Expo)

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | React Native | 0.81.4 |
| Platform | Expo | 54.0.7 |
| Langage | TypeScript | 5.9.2 |
| State Management | React Query | 5.85.5 |
| Routing | Expo Router | 6.0.4 |
| Authentication | Expo Auth Session | 7.0.10 |
| Forms | Formik + Yup | 2.4.6 / 1.7.0 |
| UI Components | React Native Paper | 5.14.5 |
| Tests | Jest, Testing Library | 29.7.0 |
| E2E Tests | Maestro | - |

---

## Architecture Backend (Hexagonale/DDD)

### Domaines Métier

| Domaine | Description | Statut |
|---------|-------------|--------|
| **user** | Gestion des utilisateurs et profils | 100% |
| **restaurant** | Gestion des restaurants et horaires | 100% |
| **menu** | Gestion des menus et items | 100% |
| **order** | Gestion des commandes (référence) | 100% |
| **favorite** | Favoris utilisateurs | 100% |
| **notification** | Système de notifications | 80% |
| **admin** | Administration plateforme | 80% |
| **analytics** | Métriques et statistiques | 70% |
| **security** | Authentification OIDC/JWT | 90% |
| **configuration** | Configuration applicative | 100% |
| **shared** | Utilitaires partagés | 100% |

### Statistiques Backend

- **Controllers:** 13
- **Repositories:** 19
- **Domain Models:** 24
- **APIs Endpoints:** ~50 (estimé)

---

## Architecture Frontend

### Web Dashboard - Pages Principales

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Authentification Keycloak |
| Callback | `/callback` | Redirection post-auth |
| Dashboard Restaurant | `/restaurant` | Tableau de bord restaurateur |
| Menu Management | `/restaurant/menu` | Gestion des items du menu |
| Orders Management | `/restaurant/orders` | Gestion des commandes |
| Analytics | `/restaurant/analytics` | Statistiques du restaurant |
| Settings | `/restaurant/settings` | Paramètres du restaurant |
| Admin Dashboard | `/admin` | Tableau de bord administrateur |
| Users Management | `/admin/users` | Gestion des utilisateurs |
| Restaurants Management | `/admin/restaurants` | Supervision restaurants |
| Orders Supervision | `/admin/orders` | Supervision commandes |
| System Analytics | `/admin/analytics` | Métriques système |

### Mobile App - Écrans Principaux

| Écran | Route | Description |
|-------|-------|-------------|
| Home | `/(tabs)/` | Liste des restaurants |
| Cart | `/(tabs)/cart` | Panier utilisateur |
| Favorites | `/(tabs)/favorites` | Restaurants favoris |
| Profile | `/(tabs)/profile` | Profil utilisateur |
| Restaurant Detail | `/restaurant/[id]` | Détail restaurant + menu |
| Menu Item | `/menu/[id]` | Détail d'un plat |
| Order Detail | `/order/[id]` | Suivi de commande |
| Orders History | `/orders/` | Historique commandes |
| Login | `/auth/login` | Authentification |
| Settings | `/settings/` | Paramètres application |

---

## Tests et Qualité

### Tests Backend (JUnit/Mockito)

- **Tests Unitaires:** 16 fichiers
- **Tests d'Intégration:** Configuration Failsafe
- **Couverture:** JaCoCo activé

### Tests Web (Playwright)

- **Tests E2E:** 80 tests
- **Status:** 6/80 passent (BUG-017 en cours)

### Tests Mobile (Jest/Maestro)

- **Tests Unitaires:** Jest + Testing Library
- **Tests E2E:** Maestro flows

---

## Statut Actuel du Projet

| Composant | Progression | Notes |
|-----------|-------------|-------|
| Backend APIs | 95% | User, Restaurant, Menu, Order complets |
| Web Dashboard | 90% | Intégration API complète |
| Mobile App | 95% | Intégration API complète |
| Authentication | 90% | OIDC web + JWT mobile fonctionnels |
| Tests E2E | 30% | BUG-017 bloquant |

---

## Bugs Critiques

| ID | Description | Impact |
|----|-------------|--------|
| BUG-017 | Tests E2E Dashboard échouent (74/80) | CI/CD bloqué |
| BUG-018 | Policy `authenticated` incompatible OIDC web-app | Contourné avec role-policy |

Voir [BUGS.md](./BUGS.md) pour la liste complète.

---

## Liens Utiles

- [CLAUDE.md](../CLAUDE.md) - Instructions pour Claude Code
- [CONTEXT.md](../CONTEXT.md) - Contexte complet du projet
- [ROADMAP.md](./ROADMAP.md) - Progression et phases
- [README.md](./README.md) - Index de la documentation
