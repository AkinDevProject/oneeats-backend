# Roadmap du Projet OneEats

## Table des matières

- [Tâche en cours](#tâche-en-cours)
- [Phase 1 - Architecture Backend](#phase-1--architecture-backend-terminé)
- [Phase 2 - Intégration Frontend-Backend](#phase-2--intégration-frontend-backend-en-cours-40)
- [Phase 3 - Authentification et Sécurité](#phase-3--authentification-et-sécurité-à-venir-30)
- [Phase 4 - Fonctionnalités Temps Réel](#phase-4--fonctionnalités-temps-réel-à-venir)
- [Phase 5 - Fonctionnalités Avancées](#phase-5--fonctionnalités-avancées-à-venir)
- [Phase 6 - Administration et Analytics](#phase-6--administration-et-analytics-à-venir)
- [Phase 7 - Optimisations et Production](#phase-7--optimisations-et-production-à-venir)
- [Phase 8 - Validation UAT](#phase-8--validation-uat-en-cours)
- [Bugs Connus](#bugs-connus)
- [Backlog Post-UAT](#backlog-post-uat)
- [Métriques de Progression](#métriques-de-progression)

---

## Tâche en cours

> **Sprint 3 — Validation UAT & Fonctionnalités Manquantes** 🔄 **EN COURS**
>
> Suite à l'analyse UAT du 2026-01-24, des lacunes ont été identifiées :
>
> **Epic 9 - Mobile UAT Gap** (6 stories, ~20h) :
> - [ ] Formulaire inscription utilisateur (P0)
> - [ ] Login email/password direct (P0)
> - [ ] Mode hors connexion (P1)
> - [ ] Affichage allergènes/diététique (P2)
> - [ ] Message restaurant fermé amélioré (P2)
> - [ ] Notifications push réelles (P3)
>
> **Epic 10 - Admin UAT Gap** (10 stories, ~24h) :
> - [ ] Statut REJECTED + raison rejet restaurant (P0)
> - [ ] UI validation/rejet restaurant (P0)
> - [ ] Raison blocage + gestion commandes (P0)
> - [ ] Suspension utilisateur avec durée (P1)
> - [ ] Alertes admin temps réel (P1)
> - [ ] Export CSV/Excel/PDF (P2)
>
> **Référence** : `docs/shared/pm/sprint-status.yaml` et `docs/shared/pm/epics-and-stories.md`
>
> **Prochaine étape** : Implémenter les tâches P0 pour débloquer les tests UAT

---

## Phase 1 - Architecture Backend (Terminé)

### Architecture Monolithique Modulaire
- [x] Structure de packages par domaines métier (DDD)
- [x] Configuration Quarkus multi-profils (dev/prod/test)
- [x] Intégration Quinoa pour servir le frontend web
- [x] Base de données PostgreSQL avec Docker
- [x] Hibernate ORM + PanacheRepository
- [x] Configuration Keycloak OIDC (documentée)
- [x] Monitoring avec Micrometer + Prometheus
- [x] Health checks et métriques

### Domaine User (100% Complet)
- [x] Entité `User` avec authentification
- [x] Repository avec requêtes métier (email, recherche, comptage)
- [x] API REST `/api/users` CRUD complète
- [x] Mapper bidirectionnel DTO ↔ Entity
- [x] Validation Bean Validation
- [x] Gestion profil utilisateur
- [x] Update et delete user commands
- [x] Analytics utilisateurs dans admin dashboard

### Domaine Restaurant (100% Complet)
- [x] Entité `Restaurant` avec logique ouverture/fermeture
- [x] API REST `/api/restaurants` CRUD complète
- [x] Upload et gestion d'images
- [x] Repository avec requêtes par propriétaire, restaurants actifs
- [x] Mapper bidirectionnel complet
- [x] Frontend RestaurantSettingsPage.tsx opérationnel
- [x] Gestion des horaires hebdomadaires
- [x] Gestion du rating et des statistiques
- [x] Tests d'intégration pour création, récupération, update et status management

### Domaine Menu (100% Complet)
- [x] Entité `MenuItem` avec options diététiques
- [x] API REST `/api/menu-items` CRUD complète
- [x] Upload et suppression d'images
- [x] Optimisation d'images automatique
- [x] Repository avec requêtes par restaurant, catégorie, disponibilité
- [x] Mapper bidirectionnel complet
- [x] Frontend MenuPage.tsx avec interface responsive
- [x] Gestion des allergènes et préférences alimentaires
- [x] Gestion disponibilité temps réel

### Domaine Order (100% Complet - Référence)
- [x] Entités `Order` + `OrderItem` avec logique métier riche
- [x] State Machine `OrderStatus` avec transitions validées
- [x] Service `OrderService` pour use cases complexes
- [x] Repository PanacheRepository + requêtes métier
- [x] API REST `/api/orders` avec validation Bean
- [x] Event Handler pour notifications et métriques
- [x] Mapper bidirectionnel complet
- [x] Gestion des transitions de statuts
- [x] Calcul automatique des totaux

---

## Phase 2 - Intégration Frontend-Backend (Terminé 100%)

### Dashboard Restaurant Web (100% Complet)
- [x] Interface complète avec React + TypeScript + Vite
- [x] Tailwind CSS pour le styling
- [x] Pages : Dashboard, Menu, Commandes, Paramètres
- [x] Components UI réutilisables
- [x] Connexion aux vraies APIs
- [x] Remplacement des mock data (fichier mockData.ts supprimé)
- [x] Gestion des états loading/error
- [x] Configuration environnement (.env.local)
- [x] Tests E2E des flux principaux (Playwright - 11 specs)

### Application Mobile Client (100% Complet)
- [x] Architecture Expo + React Native
- [x] Navigation avec Expo Router
- [x] Gestion des thèmes (light/dark)
- [x] Pages principales : Home, Restaurant, Cart, Profile, Orders
- [x] Contextes : Auth, Cart, Order, Notifications, Theme, Settings
- [x] UI/UX professionnelle avec React Native Paper
- [x] Animations avec Reanimated
- [x] Page paramètres avancée complète
- [x] Page compte utilisateur complète
- [x] Système de notifications push Expo
- [x] Optimisations de performance avancées
- [x] Connexion aux vraies APIs (restaurants, menus, commandes, favoris)
- [x] Services API complets avec cache de restaurants
- [x] Types extraits dans src/types/index.ts
- [x] Fichier mockData.ts supprimé
- [x] Synchronisation temps réel avec backend (WebSocket)
- [x] Tests E2E mobile (Maestro - 6 flows)
- [ ] Mode offline avec cache intelligent (basique implémenté)

---

## Phase 3 - Authentification et Sécurité (En cours 95%)

### Authentification Keycloak + OIDC
- [x] Configuration Keycloak documentée
- [x] **ADR-005 - Stratégie d'authentification détaillée**
- [x] Docker Compose avec Keycloak + PostgreSQL dédié
- [x] Configuration realm oneeats (import automatique)
- [x] Clients configurés : oneeats-web, oneeats-mobile, oneeats-backend
- [x] Configuration quarkus-oidc mode hybrid
- [x] AuthService avec mapping Keycloak → DB
- [x] Endpoint `/api/auth/me` (infos utilisateur + permissions)
- [x] Entité RestaurantStaffEntity (rôles par restaurant)
- [x] **Intégration frontend web (login page avec SSO)**
- [x] **Intégration mobile (expo-auth-session + PKCE)**
- [x] **Tests d'authentification RBAC (RbacSecurityIT.java)**

### RBAC - Role-Based Access Control ✅ IMPLÉMENTÉ
- [x] **ADR-006 - RBAC MVP** (3 rôles : ADMIN, RESTAURANT, USER)
- [x] Annotations @RolesAllowed sur AdminUserController
- [x] Annotations @RolesAllowed/@PermitAll sur RestaurantController
- [x] Annotations @RolesAllowed/@PermitAll sur MenuController
- [x] Annotations @RolesAllowed/@Authenticated sur OrderController
- [x] Annotations @RolesAllowed sur AnalyticsController
- [x] Annotations @RolesAllowed sur UserFavoriteController
- [x] AuthService helpers: requireRestaurantAccess(), requireCurrentUser()
- [x] Tests d'intégration RBAC (50+ tests)

### Frontend Web Authentication ✅ COMPLET
- [x] Page login avec SSO Keycloak
- [x] Stockage sécurisé tokens (cookies gérés par Quarkus)
- [x] Mode web-app avec sessions Quarkus OIDC
- [x] Gestion expiration token (automatique)
- [x] Redirection automatique vers callback après login
- [x] Logout et nettoyage session (/api/auth/logout)
- [x] Redirection par rôle (admin → /admin, restaurant → /restaurant)
- [x] Thème Keycloak personnalisé (oneeats)

### Mobile Authentication ✅ COMPLET
- [x] **Dual-mode OIDC : web-app (cookies) + service (Bearer JWT)**
- [x] **OidcTenantResolver pour routing automatique des requêtes**
- [x] Écran login/register client avec bouton SSO Keycloak
- [x] Stockage sécurisé tokens (expo-secure-store)
- [x] Service authService.ts avec OAuth PKCE flow
- [x] Service API avec Bearer token automatique
- [x] Mode invité disponible (navigation restaurants publiques)
- [x] Gestion refresh token automatique
- [ ] Biométrie pour reconnexion (Face ID, Touch ID)

---

## Phase 4 - Fonctionnalités Temps Réel (Terminé 90%)

### Système de Notifications
- [x] Configuration Expo Push Notifications (mobile)
- [x] Contexte PushNotificationContext avec templates
- [x] Page de test notifications
- [x] Intégration OrderContext pour événements
- [x] **Backend WebSocket pour temps réel** (NotificationWebSocket.java, RestaurantWebSocket.java)
- [x] WebSocketNotificationService backend
- [x] Notifications web (dashboard restaurant)
- [ ] Historique des notifications
- [ ] Préférences notifications utilisateur

### WebSocket et Synchronisation (100% Implémenté)
- [x] Configuration WebSocket backend (Quarkus Jakarta WebSocket)
- [x] Channels par restaurant pour commandes (`/ws/restaurant/{restaurantId}`)
- [x] Channels par utilisateur pour notifications (`/ws/notifications/{userId}`)
- [x] Broadcast changements statuts en temps réel
- [x] Frontend mobile : WebSocketContext.tsx + useWebSocket.ts
- [x] Frontend web : useRealtimeUpdates.ts (polling fallback)
- [ ] Tests WebSocket (unitaires et intégration)

---

## Phase 5 - Fonctionnalités Avancées (À venir)

### Recherche et Filtres
- [x] Recherche basique restaurants (mobile)
- [ ] **Écran de recherche avancée mobile**
- [ ] Filtres détaillés (prix, cuisine, note, distance)
- [ ] Historique de recherche
- [ ] Suggestions automatiques
- [ ] Recherche full-text backend (ElasticSearch/Meilisearch)
- [ ] Autocomplete intelligent

### Système de Reviews et Notes
- [ ] Domaine backend `Review`
- [ ] API REST `/api/reviews`
- [ ] Page review mobile (noter restaurant et plats)
- [ ] Upload photos dans reviews
- [ ] Calcul automatique rating restaurant
- [ ] Modération reviews (admin)
- [ ] Réponses restaurants aux avis

### Géolocalisation et Carte
- [ ] Intégration Expo Location (permissions GPS)
- [ ] Écran carte interactive (MapView)
- [ ] Markers restaurants sur la carte
- [ ] Calcul distance temps réel
- [ ] Navigation GPS vers restaurant
- [ ] Filtrage par rayon de distance
- [ ] Backend : calcul distances avec PostGIS

### Système de Favoris Complet
- [x] UI favoris dans profil mobile
- [ ] **FavoritesContext avec persistance**
- [ ] Synchronisation favoris avec backend
- [ ] API `/api/favorites`
- [ ] Notifications pour favoris (promotions)
- [ ] Tri restaurants par favoris

### Partage Social et Deep Linking
- [ ] Intégration Expo Sharing
- [ ] Boutons partage restaurants et plats
- [ ] Génération images partage dynamiques
- [ ] Deep linking (ouvrir app via liens)
- [ ] URL schemes OneEats custom
- [ ] Tracking partages (analytics)

### Mode Offline et Cache
- [x] Optimisations performance mobile avancées
- [ ] **CacheService avec stratégies intelligentes**
- [ ] Détection connectivité (NetInfo)
- [ ] Synchronisation en arrière-plan
- [ ] Indicateurs UI mode offline
- [ ] Queue requêtes pendant offline
- [ ] Mise en cache images avec react-native-fast-image

---

## Phase 6 - Administration et Analytics (À venir)

### Domaine Admin
- [ ] Entité `Admin` avec permissions avancées
- [ ] API REST `/api/admin`
- [ ] Page dashboard admin web
- [ ] Gestion utilisateurs et restaurants
- [ ] Modération contenus (menus, images, reviews)
- [ ] Statistiques globales plateforme
- [ ] Logs et audit trail

### Analytics et Métriques
- [ ] Dashboard analytics restaurant
- [ ] Métriques commandes (volume, CA, temps moyen)
- [ ] Analytics clients (fidélité, panier moyen)
- [ ] Exports CSV/Excel des données
- [ ] Graphiques interactifs (Recharts)
- [ ] KPIs temps réel
- [ ] Rapports personnalisés

---

## Phase 7 - Optimisations et Production (À venir)

### Optimisations Backend
- [ ] Cache Hibernate niveau 2
- [ ] Query optimization avec indexes
- [ ] Connection pooling avancé
- [ ] Compression réponses HTTP (Gzip)
- [ ] Rate limiting API
- [ ] CDN pour images statiques

### Optimisations Mobile
- [x] React.memo sur composants coûteux
- [x] Lazy loading images avec cache
- [x] FlatList virtualisées
- [x] Monitoring performance temps réel
- [ ] **Bundle optimization avec Metro**
- [ ] Code splitting et lazy loading
- [ ] Compression images automatique
- [ ] Analyse bundle size

### Configuration Production
- [ ] Variables d'environnement production
- [ ] Configuration CI/CD (GitHub Actions)
- [ ] Docker images optimisées
- [ ] Kubernetes deployment specs
- [ ] SSL/TLS configuration
- [ ] Backup automatique base de données
- [ ] Monitoring production (Sentry, Datadog)
- [ ] App Store et Play Store configuration

---

## Phase 8 - Validation UAT (En cours)

> **Objectif** : Combler les lacunes identifiées lors de l'analyse des guides UAT pour permettre la validation complète avant release.
>
> **Documents de référence** :
> - `docs/UAT_GUIDE_MOBILE.md` (24 scénarios)
> - `docs/UAT_GUIDE_RESTAURANT.md`
> - `docs/shared/pm/epics-and-stories.md` (Epics 9 et 10)
> - `docs/shared/pm/sprint-status.yaml`

### Epic 9 : Mobile UAT Gap (~20h)

**P0 - Bloquant UAT** :
- [ ] **9.1** Formulaire inscription (nom, email, password, CGU) - 4h
- [ ] **9.2** Login email/password direct (+ gestion erreurs) - 3h

**P1 - Important** :
- [ ] **9.3** Mode hors connexion (détection réseau, bannière, cache) - 6h

**P2 - Amélioration** :
- [ ] **9.4** Affichage allergènes et infos diététiques sur plats - 2h
- [ ] **9.5** Message restaurant fermé avec horaires réouverture - 1h

**P3 - Optionnel** :
- [ ] **9.6** Notifications push réelles (Expo + backend) - 4h

### Epic 10 : Admin UAT Gap (~24h)

**P0 - Bloquant UAT** :
- [ ] **10.1** Statut REJECTED pour restaurants - 1h
- [ ] **10.2** Raison de rejet restaurant (champ + endpoint) - 2h
- [ ] **10.3** UI modales validation/rejet restaurant - 2h
- [ ] **10.4** Raison de blocage restaurant - 1h
- [ ] **10.5** Gestion commandes lors blocage restaurant - 3h

**P1 - Important** :
- [ ] **10.6** Durée et raison suspension utilisateur - 2h
- [ ] **10.7** UI suspension utilisateur avec sélection durée - 2h
- [ ] **10.8** Endpoint alertes admin temps réel - 3h

**P2 - Amélioration** :
- [ ] **10.9** Export CSV/Excel (restaurants, users, orders) - 4h
- [ ] **10.10** Export PDF rapport statistiques - 4h

### Progression Phase 8
- **Epic 9** : 0/6 stories (0%)
- **Epic 10** : 0/10 stories (0%)
- **Total P0** : 0/7 stories bloquantes
- **Effort restant** : ~44h

---

## Bugs Connus

| ID  | Description                              | Priorité | Status       | Assigné à |
|-----|------------------------------------------|----------|--------------|-----------|
| #01 | Mock data encore utilisé dans web/mobile | Haute    | ✅ Résolu    | Sprint 2  |
| #02 | Auth Keycloak backend implémentée        | Haute    | ✅ Résolu    | Sprint 3  |
| #03 | WebSocket temps réel manquant            | Moyenne  | ✅ Résolu    | Sprint 4  |
| #04 | Mode offline non implémenté (mobile)     | Moyenne  | ⚠️ Partiel   | Sprint 5  |
| #05 | Tests E2E incomplets                     | Basse    | ✅ Résolu    | Sprint 7  |
| #06 | Tests WebSocket manquants                | Moyenne  | 📋 Backlog   | -         |
| #07 | Tests Auth Backend limités               | Basse    | 📋 Backlog   | -         |

---

## Backlog Post-UAT

> Tâches identifiées lors de la revue UAT du 2026-01-24 (Agent BMAD TEA)
> Ces améliorations ne sont **pas bloquantes** pour le MVP mais améliorent l'UX.

| ID | Tâche | Fichier(s) | Priorité | Effort | Status |
|----|-------|------------|----------|--------|--------|
| DEV-01 | **Bouton "Annuler" sur OrderCard** - Ajouter le bouton "Annuler" directement sur les cartes de commandes EN_PREPARATION (actuellement visible uniquement dans la modal de détails) | `OrderCard.tsx` | P1 - UX | ~1h | 📋 À faire |
| DEV-02 | **Présets options diététiques** - Ajouter des présets Végétarien, Végan, Allergènes dans le formulaire d'ajout/modification de plat | `MenuItemOptionsForm.tsx` | P2 - Feature | ~2h | 📋 À faire |
| DEV-03 | **Connecter Analytics API** - Remplacer les données mockées par les vraies données API dans la page statistiques restaurant | `AnalyticsPage.tsx` | P2 - Feature | ~3h | 📋 À faire |

**Origine** : Analyse de traçabilité UAT_GUIDE_RESTAURANT.md vs Code (session 2026-01-24)

---

## Notes de Session

### Session 2026-01-24 : Analyse UAT et Planification Dev (Phase 8)

**Objectif** : Analyser les guides UAT et identifier les développements manquants

**Travail effectué** :

**1. Analyse Guide UAT Mobile avec Agent BMAD TEA**
- ✅ Évaluation complétude guide UAT Mobile vs Use Cases MVP
- ✅ Identification 7 scénarios manquants (inscription, login, annulation, favoris, etc.)
- ✅ Enrichissement `docs/UAT_GUIDE_MOBILE.md` : 17 → 24 scénarios
- ✅ Couverture Use Cases : 62.5% → 100%

**2. Analyse Code Mobile vs UAT**
- ✅ Audit complet code `apps/mobile/` vs 24 scénarios UAT
- ✅ Identification 6 fonctionnalités manquantes (Epic 9)
- ✅ Priorisation P0-P3 avec effort estimé (~20h)

**3. Identification Lacunes Admin (Epic 10)**
- ✅ Analyse guide UAT Restaurant/Admin
- ✅ Identification 10 fonctionnalités manquantes
- ✅ Priorisation P0-P2 avec effort estimé (~24h)

**4. Documentation et Planification**
- ✅ Création Epic 9 et 10 dans `sprint-status.yaml`
- ✅ Ajout 16 User Stories détaillées dans `epics-and-stories.md`
- ✅ Création Phase 8 dans ROADMAP.md
- ✅ Mise à jour métriques de progression

**Fichiers créés/modifiés** :
- `docs/UAT_GUIDE_MOBILE.md` (+7 scénarios, total 24)
- `docs/shared/pm/sprint-status.yaml` (Epic 9 et 10 ajoutés)
- `docs/shared/pm/epics-and-stories.md` (16 stories ajoutées)
- `docs/ROADMAP.md` (Phase 8, métriques, cette note)

**Prochaines étapes** :
- Implémenter Epic 9.1 : Formulaire inscription (P0)
- Implémenter Epic 9.2 : Login email/password (P0)
- Implémenter Epic 10.1-10.3 : Validation/rejet restaurants (P0)

---

### Session 2026-01-23 : Implémentation RBAC MVP (Phase 3)

**Objectif** : Ajouter les annotations de sécurité @RolesAllowed sur tous les endpoints backend

**Travail effectué** :

**1. Documentation Architecture**
- ✅ Création ADR-006-rbac-mvp.md avec décision architecturale complète
- ✅ Matrice des permissions par endpoint documentée
- ✅ Stratégie d'évolution post-MVP définie

**2. Implémentation AuthService**
- ✅ Ajout méthode `requireRestaurantAccess(UUID)` - lance ForbiddenException si pas d'accès
- ✅ Ajout méthode `requireCurrentUser()` - retourne UserEntity ou lance NotAuthorizedException
- ✅ Ajout méthode `isCurrentUser(UUID)` - vérifie si l'utilisateur courant est le propriétaire

**3. Annotations Sécurité sur Controllers**
- ✅ `AdminUserController` : @RolesAllowed(ADMIN) sur la classe
- ✅ `RestaurantController` :
  - @PermitAll sur GET (liste, détail, active)
  - @RolesAllowed(RESTAURANT, ADMIN) sur POST, PUT, PATCH + vérification accès restaurant
  - @RolesAllowed(ADMIN) sur DELETE et PUT /status
- ✅ `MenuController` :
  - @PermitAll sur GET (recherche, détail, menu restaurant)
  - @RolesAllowed(RESTAURANT, ADMIN) sur POST, PUT, DELETE + vérification accès restaurant
- ✅ `OrderController` :
  - @RolesAllowed(USER) sur POST (création commande)
  - @Authenticated sur GET (avec vérification ownership)
  - @RolesAllowed(RESTAURANT, ADMIN) sur PUT /status
- ✅ `AnalyticsController` :
  - @RolesAllowed(ADMIN) sur /platform
  - @RolesAllowed(RESTAURANT, ADMIN) sur /dashboard, /revenue, /trends
- ✅ `UserFavoriteController` :
  - @RolesAllowed(USER) sur la classe
  - Vérification que l'utilisateur accède à ses propres favoris

**4. Tests d'Intégration**
- ✅ Création `RbacSecurityIT.java` avec 50+ tests
- ✅ Tests par controller (AdminUser, Restaurant, Menu, Order, Analytics, Favorites)
- ✅ Tests cross-cutting (endpoints publics vs protégés)
- ✅ Tests par rôle (ADMIN, RESTAURANT, USER, anonymous)

**Fichiers créés** :
- `docs/shared/architect/adr/ADR-006-rbac-mvp.md`
- `src/test/java/com/oneeats/integration/security/RbacSecurityIT.java`

**Fichiers modifiés** :
- `AuthService.java` (+50 lignes)
- `AdminUserController.java`
- `RestaurantController.java`
- `MenuController.java`
- `OrderController.java`
- `AnalyticsController.java`
- `UserFavoriteController.java`

**Prochaines étapes** :
- Configurer les rôles dans Keycloak (admin, restaurant, user)
- Tester avec un vrai login Keycloak
- Ajouter vérification restaurant sur OrderController.updateOrderStatus()

---

### Session 2026-01-21 : Résolution BUG-013 - Auth Playwright/Keycloak

**Objectif** : Résoudre le problème d'authentification Keycloak dans les tests Playwright

**Problème identifié** :
- Les tests Playwright envoyaient les formulaires avec `Content-Type: application/json`
- Keycloak attend `Content-Type: application/x-www-form-urlencoded`
- Résultat : "Invalid username or password" même avec les bons credentials

**Cause racine** :
Configuration globale dans `playwright.config.ts` :
```typescript
extraHTTPHeaders: {
  'Content-Type': 'application/json', // ← Problème !
}
```

**Solution appliquée** :
1. Override des headers pour le projet `setup` : `extraHTTPHeaders: {}`
2. Utilisation de Edge (`channel: 'msedge'`) au lieu de Chromium bundled

**Résultats** :
- ✅ Authentification Keycloak fonctionne
- ✅ 53 tests passés en 6.8 minutes
- ✅ BUG-013 résolu

**Fichiers modifiés** :
- `tests/playwright.config.ts`
- `tests/specs/auth.setup.ts`
- `docs/BUGS.md`

---

### Session 2026-01-20 : Setup UAT Automatisé (Claude Code + Playwright + Maestro)

**Objectif** : Permettre à Claude Code de tester automatiquement l'application web ET mobile, détecter les bugs, et générer des rapports.

**Discussion réalisée** :
- ✅ Analyse des capacités de test de Claude Code
- ✅ Choix des outils : **Playwright MCP** (web) + **Maestro** (mobile)
- ✅ Architecture définie pour tests cross-platform
- ✅ Documentation créée : `docs/UAT_SETUP.md`

**Architecture UAT cible** :
```
Claude Code
    │
    ├── Playwright MCP → Chrome → Dashboard Web (localhost:8080/restaurant)
    ├── Maestro (Bash) → Émulateur Android → App Mobile
    └── Backend Logs → PostgreSQL + API
```

**Prochaines étapes** :
1. [ ] Vérifier si Android Studio / émulateur est installé
2. [ ] Installer Playwright MCP (`npm install -g @playwright/mcp`)
3. [ ] Configurer Claude Code pour Playwright (`~/.claude/settings.json`)
4. [ ] Installer Maestro
5. [ ] Créer les premiers scripts de test
6. [ ] Tester un flow complet (commande mobile → dashboard web)

**Fichiers créés** :
- `docs/UAT_SETUP.md` - Guide complet pour reprendre le setup

**Pour reprendre** : Dire à Claude "Continue le setup UAT" ou "Lis docs/UAT_SETUP.md"

---

### Session 2026-01-16 : Audit MVP et Mise à jour ROADMAP

**Travail effectué** :
- ✅ Audit complet du projet pour vérifier l'état réel du MVP
- ✅ Découverte : Tests E2E déjà implémentés (Playwright + Maestro)
- ✅ Découverte : WebSocket backend + mobile déjà implémentés
- ✅ Mise à jour ROADMAP.md avec état corrigé
- ✅ Mise à jour BUGS.md avec bugs résolus

**Fichiers E2E trouvés** :
- `tests/specs/` : 11 specs Playwright (web)
- `apps/mobile/.maestro/` : 6 flows Maestro (mobile)

**WebSocket implémenté** :
- Backend : `NotificationWebSocket.java`, `RestaurantWebSocket.java`, `WebSocketNotificationService.java`
- Mobile : `WebSocketContext.tsx`, `useWebSocket.ts`
- Web : `useRealtimeUpdates.ts` (polling fallback)

**Progression MVP corrigée** : 88% → **95%**

**Reste à faire** :
- Tests WebSocket (pas de tests pour cette fonctionnalité)
- Tests Auth Backend (limités)
- Mode offline complet (optionnel)
- Biométrie mobile (optionnel)

---

### Session 2026-01-16 : Corrections Flux Commande Mobile + Tests

**Travail effectué** :

**Tests Mobile (134 tests passés)** :
- ✅ 8 suites de tests Jest implémentées
- ✅ Tests Contexts : AuthContext, CartContext, OrderContext
- ✅ Tests Services : apiService, authService
- ✅ Tests Components et Hooks

**Corrections Flux de Commande** :
- ✅ `cart.tsx` : Détection erreurs auth (401/token expired) + redirection login
- ✅ `CartContext.tsx` : Format `Order` corrigé avec objets `restaurant` et `CartItem[]`
- ✅ `OrderContext.tsx` :
  - `addOrder` ne crée plus de doublon API (commande déjà créée par CartContext)
  - `updateOrderStatus` appelle maintenant l'API backend avant mise à jour locale
  - Suppression `CustomEvent` (API browser non disponible en React Native)
- ✅ `api.ts` : Correction `{ status }` → `{ newStatus }` pour endpoint PUT /orders/{id}/status

**Fichiers modifiés** :
- `apps/mobile/app/(tabs)/cart.tsx`
- `apps/mobile/src/contexts/CartContext.tsx`
- `apps/mobile/src/contexts/OrderContext.tsx`
- `apps/mobile/src/services/api.ts`

**Fonctionnalités opérationnelles** :
- ✅ Authentification Keycloak (SSO) avec refresh token
- ✅ Création de commande (persistée backend)
- ✅ Annulation de commande (persistée backend)
- ✅ Polling statuts commandes (toutes les 15s)
- ✅ Push notifications locales

**Reste à faire (Mobile)** :
- ⏳ WebSocket temps réel (remplacer polling)
- ⏳ Tests E2E Maestro
- ⏳ Mode offline avec synchronisation
- ⏳ Optimisations cache images

**Prochaine étape** : Travail sur Web App Restaurant (Dashboard)

---

### Session du 2025-12-12
**Objectif** : Restructurer la documentation du projet selon les bonnes pratiques Claude Code

**Réalisé** :
- ✅ Analyse de la structure actuelle du dossier `docs/`
- ✅ Renommage `ARCHITECTURE_GUIDE.md` → `ARCHITECTURE.md`
- ✅ Renommage `API_REFERENCE.md` → `API_SPECS.md`
- ✅ Création `BUSINESS_RULES.md` complet avec toutes les règles métier
- ✅ Création `ROADMAP.md` consolidé (MVP_BACKLOG + MOBILE_ROADMAP)
- ⏳ En cours : Création `DATA_MODEL.md` avec schéma BDD
- ⏳ En cours : Création `BUGS.md` pour tracking problèmes
- ⏳ En cours : Organisation fichiers restants dans sous-dossiers

**Problèmes** : Aucun

**Prochaine étape** :
1. Finaliser restructuration documentation
2. Mettre à jour `CLAUDE.md` avec liens vers nouvelle structure
3. Commencer intégration frontend web avec APIs backend

---

### Session du 2025-12-11
**Objectif** : Implémenter tests d'intégration pour restaurant management

**Réalisé** :
- ✅ Tests d'intégration pour création restaurant
- ✅ Tests pour récupération, update, et status management
- ✅ Amélioration validation API et gestion erreurs
- ✅ Enhancement des endpoints restaurant

**Problèmes** : Aucun

**Prochaine étape** : Restructuration documentation

---

### Session du 2025-12-10
**Objectif** : Finaliser upload et deletion d'images pour menu items

**Réalisé** :
- ✅ API endpoints pour upload et delete images
- ✅ Commands et handlers pour gestion images
- ✅ Intégration optimisation d'images
- ✅ Enhancement du menu item management controller

**Problèmes** : Aucun

**Prochaine étape** : Tests d'intégration restaurant

---

## Objectifs à Court Terme

0. **Setup UAT Automatisé** (En cours)
   - Installer Playwright MCP pour tests web automatisés
   - Installer Maestro pour tests mobile automatisés
   - Configurer émulateur Android
   - Créer scénarios de test cross-platform
   - Voir `docs/UAT_SETUP.md` pour détails

1. **Finir restructuration documentation** (1 jour)
   - Créer `DATA_MODEL.md` et `BUGS.md`
   - Organiser fichiers dans sous-dossiers `guides/`, `concepts/`, etc.
   - Mettre à jour `CLAUDE.md`

2. **Intégration frontend web** (3-4 jours)
   - Connecter dashboard aux vraies APIs
   - Remplacer mock data
   - Gestion erreurs et loading states
   - Tests E2E basiques

3. **Intégration frontend mobile** (3-4 jours)
   - Services API complets
   - Connexion contexts aux vraies APIs
   - Tests flux complet client → backend → dashboard

4. **Authentification JWT** (4-5 jours)
   - Backend auth endpoints
   - Frontend web login/register
   - Mobile authentication
   - Tests sécurité

---

## Objectifs à Moyen Terme

- Système de notifications temps réel (WebSocket)
- Recherche avancée et filtres
- Système de reviews et notes
- Géolocalisation et carte
- Mode offline mobile
- Dashboard admin complet
- Analytics et métriques

---

## Vision Long Terme

- **Paiement en ligne** : Intégration Stripe/PayPal
- **Livraison à domicile** : Partenariat livreurs ou système interne
- **Programme de fidélité** : Points, récompenses, cashback
- **Recommandations IA** : Machine learning pour suggestions personnalisées
- **Application restaurant native** : Alternative au dashboard web
- **Multi-langues** : i18n complet (FR, EN, ES, IT)
- **Multi-devises** : Support EUR, USD, GBP
- **API publique** : Ouverture API pour intégrations tierces

---

## Métriques de Progression

### Backend
- **Architecture** : ✅ 100% (Complet)
- **APIs Domaines** : ✅ 95% (Order, User, Restaurant, Menu complets)
- **WebSocket** : ✅ 100% (NotificationWebSocket, RestaurantWebSocket implémentés)
- **Tests** : ✅ 85% (Unit tests OK, RBAC tests OK, tests WebSocket manquants)
- **Sécurité** : ✅ 95% (Keycloak + RBAC complet, ADR-006 implémenté)

### Frontend Web
- **UI/UX** : ✅ 95% (Interface complète avec améliorations admin)
- **Intégration API** : ✅ 100% (Toutes les pages connectées aux APIs)
- **Tests E2E** : ✅ 90% (11 specs Playwright)

### Frontend Mobile
- **UI/UX** : ✅ 95% (Très complet avec features avancées)
- **Intégration API** : ✅ 100% (Toutes les pages connectées aux APIs)
- **WebSocket** : ✅ 100% (WebSocketContext + useWebSocket)
- **Performance** : ✅ 85% (Optimisations avancées implémentées)
- **Tests** : ✅ 85% (134 tests Jest + 6 flows Maestro E2E)

### Validation UAT
- **Guide UAT Mobile** : ✅ 100% (24 scénarios documentés)
- **Guide UAT Restaurant** : ✅ 100% (documenté)
- **Code Mobile vs UAT** : ⚠️ 71% (6 fonctionnalités manquantes - Epic 9)
- **Code Admin vs UAT** : ⚠️ 60% (10 fonctionnalités manquantes - Epic 10)

### Global MVP
**Progression globale** : ⚠️ **88%** (bloqué par validation UAT)

### Reste à faire pour 100%
- [ ] **Epic 9** : Mobile UAT Gap (7 stories P0-P1) - ~13h
- [ ] **Epic 10** : Admin UAT Gap (7 stories P0-P1) - ~14h
- [ ] Tests WebSocket (backend + mobile) - 1-2 jours
- [ ] Tests Auth Backend complets - 1 jour
- [ ] Mode offline complet (Epic 9.3) - inclus ci-dessus
- [ ] Biométrie mobile (optionnel) - 1 jour

---

### Session 2026-01-15 : Implémentation Authentification Keycloak (Phase 3)

**Travail effectué** :
- ✅ Discussion architecture avec agent BMAD Architect
- ✅ Création ADR-005 : Stratégie d'authentification détaillée
  - Identity Providers : Google (MVP), Email/Password, Facebook, Apple
  - Flows OIDC : Authorization Code (web) + PKCE (mobile)
  - Tokens : Access 15min, Refresh 7j, Remember Me 30j
  - Architecture hybride Keycloak + DB pour rôles métier
- ✅ Docker Compose : Keycloak 24.0 + PostgreSQL dédié (port 8180)
- ✅ Realm oneeats configuré avec import automatique
  - 3 clients : oneeats-web, oneeats-mobile, oneeats-backend
  - 3 rôles realm : user, restaurant, admin
  - 3 utilisateurs de test (admin, restaurant, client)
- ✅ Configuration quarkus-oidc mode hybrid
- ✅ Backend Java :
  - UserEntity + keycloak_id
  - RestaurantStaffEntity (rôles OWNER/MANAGER/STAFF par restaurant)
  - JpaRestaurantStaffRepository
  - AuthService (mapping Keycloak → contexte métier)
  - AuthController (/api/auth/me, /api/auth/status, /api/auth/restaurants)

**Fichiers créés/modifiés** :
- `docs/shared/architect/adr/ADR-005-authentication-strategy.md` (nouveau)
- `docker-compose.dev.yml` (Keycloak ajouté)
- `keycloak/realms/oneeats-realm.json` (nouveau)
- `application.yml` (config OIDC)
- `UserEntity.java` (keycloak_id ajouté)
- `RestaurantStaffEntity.java` (nouveau)
- `JpaRestaurantStaffRepository.java` (nouveau)
- `AuthService.java` (nouveau)
- `AuthController.java` (nouveau)
- `JpaUserRepository.java` (findByKeycloakId ajouté)

**Prochaines étapes** :
- Intégration frontend web (login page + interceptor)
- Intégration mobile (expo-auth-session + PKCE)
- Tests d'authentification

---

### Session 2026-01-15 : Finalisation Intégration API Mobile

**Travail effectué** :
- ✅ Création de `apps/mobile/src/types/index.ts` avec toutes les interfaces
- ✅ Création de `apps/mobile/src/config/categories.ts` pour les catégories UI
- ✅ Nettoyage de CartContext.tsx (suppression mockMenuItems)
- ✅ Correction de OrderContext.tsx avec cache de restaurants et fetch API
- ✅ Correction de cart.tsx avec useRestaurant hook
- ✅ Mise à jour de tous les imports (10+ fichiers) vers ../types
- ✅ Suppression complète de `apps/mobile/src/data/mockData.ts` (650+ lignes)

**Architecture finale** :
- Types centralisés dans `src/types/index.ts`
- Catégories UI dans `src/config/categories.ts`
- Cache de restaurants dans OrderContext pour éviter les requêtes répétées
- Tous les hooks utilisent les vraies APIs backend

**Fichiers modifiés** :
- CartContext.tsx, OrderContext.tsx, AuthContext.tsx
- useRestaurants.ts, useRestaurant.ts, useMenuItems.ts
- cart.tsx, index.tsx (home)
- order/[id].tsx, menu/[id].tsx, restaurant/[id].tsx
- MenuItemOptions.tsx

**Bug #01 résolu** : Plus aucun mock data dans web ET mobile

---

### Session 2026-01-15 : Finalisation Intégration API Dashboard Web

**Travail effectué** :
- ✅ Audit complet du dashboard web - intégration API déjà réalisée (commit 512f70a)
- ✅ Suppression du fichier `apps/web/src/data/mockData.ts` (obsolète, non utilisé)
- ✅ Nettoyage de `apps/web/src/hooks/useApi.ts` (suppression de 2 hooks référençant des méthodes API inexistantes)
- ✅ Vérification du build npm : OK

**Architecture API validée** :
- Service API centralisé (`api.ts`) avec singleton pattern
- Hooks personnalisés pour chaque domaine (useRestaurants, useOrders, useUsers, useDashboard)
- Auto-refresh toutes les 30 secondes pour les données temps réel
- Gestion des états loading/error sur toutes les pages

**Pages connectées aux APIs** :
- AdminDashboard, RestaurantsManagementPage, UsersPage, OrdersSupervisionPage
- MenuPage, OrdersManagementPage, RestaurantSettingsPage, StatsPage, AnalyticsSystemPage

**Ce qui suit** :
- Intégration frontend mobile avec les APIs backend
- Tests E2E pour le dashboard web

---

### Session 2026-01-15 : Harmonisation Complete BMAD

**Travail effectue (Phase 1 - Nettoyage)** :
- ✅ Analyse complete de la documentation (52 fichiers actifs + 11 archives)
- ✅ Suppression de 8 fichiers obsoletes/doublons dans /archive/
  - DEV_PLAN.md, MVP_BACKLOG.md, MOBILE_ROADMAP.md (fusionnes dans ROADMAP.md)
  - PROJECT_CHECKLIST.md, TECHNICAL_PROPOSAL.md (obsoletes - projet "DelishGo")
  - TESTS_*.md, WEB_REFACTORING_SUMMARY.md (syntheses anciennes)

**Travail effectue (Phase 2 - Harmonisation BMAD)** :
- ✅ Ajout frontmatter YAML BMAD a prd.md avec stepsCompleted et inputDocuments
- ✅ Restructuration complete epics-and-stories.md selon template BMAD :
  - Requirements Inventory (17 FR + 6 NFR)
  - FR Coverage Map
  - 8 Epics avec 22 User Stories au format "As a X, I want Y, So that Z"
  - Acceptance Criteria au format Given/When/Then
- ✅ Migration sprint-status.yaml vers format BMAD standard :
  - Structure development_status avec statuts (backlog, in-progress, done)
  - Tracking par epic et story
- ✅ Creation docs/shared/architect/architecture.md conforme BMAD (remplace target-architecture.md)
- ✅ Mise a jour bmm-workflow-status.yaml avec nouveaux chemins

**Structure finale docs/shared/pm/** :
```
docs/shared/pm/
├── prd.md                    # PRD avec frontmatter BMAD
├── epics-and-stories.md      # Epics restructurees format BMAD
├── USER_STORIES.md           # Stories utilisateur
└── sprint-status.yaml        # Suivi sprint format BMAD
```

**Structure finale docs/shared/architect/** :
```
docs/shared/architect/
├── README.md                 # Index architecture
├── architecture.md           # Document BMAD
├── hexagonal-guide.md        # Guide DDD
├── implementation-status.md  # Statut implementation
└── adr/                      # Architecture Decision Records
```

**Impact** :
- Tous les documents de planification sont conformes aux templates BMAD
- Workflows BMAD peuvent maintenant tracker correctement l'etat des artefacts
- Navigation et liens croises mis a jour dans docs/README.md
- bmm-workflow-status.yaml synchronise avec les nouveaux chemins

**Ce qui suit** :
- Utiliser `/bmad:bmm:workflows:workflow-status` pour verifier l'etat
- Creer les fichiers story individuels avec `/bmad:bmm:workflows:create-story`
- Continuer Sprint 2 : Integration frontend-backend

---

### Session 2025-12-13 : Amélioration Navigation Documentation

**Travail effectué** :
- ✅ Ajout de liens croisés bidirectionnels entre BUSINESS_RULES.md et USE_CASES.md
- ✅ Chaque use case (UC-001 à UC-205) contient maintenant un lien vers les règles métier associées
- ✅ Chaque section de règles métier renvoie vers les use cases pertinents
- ✅ Format blockquote avec émojis pour meilleure visibilité

**Impact** :
- Navigation facilitée entre documentation conceptuelle et procédurale
- Claude Code peut rapidement accéder aux informations contextuelles
- Amélioration de la cohérence entre règles métier et implémentation

**Ce qui suit** :
- Prêt pour Sprint 2 : Intégration frontend-backend
- Documentation bien structurée pour supporter le développement

---

## Dernière mise à jour

**Date** : 2026-01-24
**Version** : MVP 0.97
**Responsable** : Équipe OneEats
**Prochaine revue** : 2026-01-28
