# 🗺️ Roadmap du Projet OneEats

## 📍 Tâche en cours

> **Sprint 1 — Restructuration Documentation**
>
> Actuellement : Réorganisation de la documentation selon les bonnes pratiques Claude Code
> Fichiers concernés : `/docs/` (tous les fichiers de documentation)
>
> **Prochaine étape** : Intégration frontend web et mobile avec les APIs backend

---

## ✅ Phase 1 — Architecture Backend (Terminé)

### 🏗️ Architecture Monolithique Modulaire
- [x] Structure de packages par domaines métier (DDD)
- [x] Configuration Quarkus multi-profils (dev/prod/test)
- [x] Intégration Quinoa pour servir le frontend web
- [x] Base de données PostgreSQL avec Docker
- [x] Hibernate ORM + PanacheRepository
- [x] Configuration Keycloak OIDC (documentée)
- [x] Monitoring avec Micrometer + Prometheus
- [x] Health checks et métriques

### 📦 Domaine User (100% Complet)
- [x] Entité `User` avec authentification
- [x] Repository avec requêtes métier (email, recherche, comptage)
- [x] API REST `/api/users` CRUD complète
- [x] Mapper bidirectionnel DTO ↔ Entity
- [x] Validation Bean Validation
- [x] Gestion profil utilisateur
- [x] Update et delete user commands
- [x] Analytics utilisateurs dans admin dashboard

### 🏪 Domaine Restaurant (100% Complet)
- [x] Entité `Restaurant` avec logique ouverture/fermeture
- [x] API REST `/api/restaurants` CRUD complète
- [x] Upload et gestion d'images
- [x] Repository avec requêtes par propriétaire, restaurants actifs
- [x] Mapper bidirectionnel complet
- [x] Frontend RestaurantSettingsPage.tsx opérationnel
- [x] Gestion des horaires hebdomadaires
- [x] Gestion du rating et des statistiques
- [x] Tests d'intégration pour création, récupération, update et status management

### 🍽️ Domaine Menu (100% Complet)
- [x] Entité `MenuItem` avec options diététiques
- [x] API REST `/api/menu-items` CRUD complète
- [x] Upload et suppression d'images
- [x] Optimisation d'images automatique
- [x] Repository avec requêtes par restaurant, catégorie, disponibilité
- [x] Mapper bidirectionnel complet
- [x] Frontend MenuPage.tsx avec interface responsive
- [x] Gestion des allergènes et préférences alimentaires
- [x] Gestion disponibilité temps réel

### 📦 Domaine Order (100% Complet - Référence)
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

## 🔄 Phase 2 — Intégration Frontend-Backend (En cours 40%)

### 🌐 Dashboard Restaurant Web
- [x] Interface complète avec React + TypeScript + Vite
- [x] Tailwind CSS pour le styling
- [x] Pages : Dashboard, Menu, Commandes, Paramètres
- [x] Components UI réutilisables
- [ ] **➡️ Connexion aux vraies APIs** ← EN COURS
- [ ] Remplacement des mock data
- [ ] Gestion des états loading/error
- [ ] Configuration environnement (.env.local)
- [ ] Tests E2E des flux principaux

### 📱 Application Mobile Client
- [x] Architecture Expo + React Native
- [x] Navigation avec Expo Router
- [x] Gestion des thèmes (light/dark)
- [x] Pages principales : Home, Restaurant, Cart, Profile, Orders
- [x] Contextes : Auth, Cart, Order, Notifications, Theme, Settings
- [x] UI/UX professionnelle avec React Native Paper
- [x] Animations avec Reanimated
- [x] Mock data complet
- [x] Page paramètres avancée complète
- [x] Page compte utilisateur complète
- [x] Système de notifications push Expo
- [x] Optimisations de performance avancées
- [ ] **➡️ Connexion aux vraies APIs** ← EN COURS
- [ ] Services API complets avec cache
- [ ] Synchronisation temps réel avec backend
- [ ] Mode offline avec cache intelligent
- [ ] Tests d'intégration mobile

---

## 🚧 Phase 3 — Authentification et Sécurité (À venir 30%)

### 🔐 Authentification JWT
- [x] Configuration Keycloak documentée
- [ ] **Implémentation JWT dans backend**
- [ ] Endpoints `/auth/login` et `/auth/register`
- [ ] Génération et validation tokens JWT
- [ ] Refresh token automatique
- [ ] Middleware d'authentification sur routes protégées
- [ ] Gestion des rôles (CLIENT, RESTAURANT, ADMIN)

### 🌐 Frontend Web Authentication
- [ ] Page login/register restaurant
- [ ] Stockage sécurisé tokens (localStorage/cookies)
- [ ] Intercepteur Axios pour JWT headers
- [ ] Gestion expiration token
- [ ] Redirection automatique si non authentifié
- [ ] Logout et nettoyage session

### 📱 Mobile Authentication
- [ ] Écran login/register client
- [ ] Stockage sécurisé tokens (SecureStore)
- [ ] Service API avec gestion tokens
- [ ] Mode invité (navigation limitée)
- [ ] Biométrie pour reconnexion (Face ID, Touch ID)
- [ ] Gestion refresh token en arrière-plan

---

## 📅 Phase 4 — Fonctionnalités Temps Réel (À venir)

### 🔔 Système de Notifications
- [x] Configuration Expo Push Notifications (mobile)
- [x] Contexte PushNotificationContext avec templates
- [x] Page de test notifications
- [x] Intégration OrderContext pour événements
- [ ] **Backend WebSocket pour temps réel**
- [ ] NotificationService backend
- [ ] Envoi notifications serveur vers mobile
- [ ] Notifications web (dashboard restaurant)
- [ ] Historique des notifications
- [ ] Préférences notifications utilisateur

### 📡 WebSocket et Synchronisation
- [ ] Configuration WebSocket backend (Quarkus)
- [ ] Channels par restaurant pour commandes
- [ ] Broadcast changements statuts en temps réel
- [ ] Reconnexion automatique
- [ ] Synchronisation état entre clients
- [ ] Indicateurs "en ligne" pour utilisateurs

---

## 📅 Phase 5 — Fonctionnalités Avancées (À venir)

### 🔍 Recherche et Filtres
- [x] Recherche basique restaurants (mobile)
- [ ] **Écran de recherche avancée mobile**
- [ ] Filtres détaillés (prix, cuisine, note, distance)
- [ ] Historique de recherche
- [ ] Suggestions automatiques
- [ ] Recherche full-text backend (ElasticSearch/Meilisearch)
- [ ] Autocomplete intelligent

### ⭐ Système de Reviews et Notes
- [ ] Domaine backend `Review`
- [ ] API REST `/api/reviews`
- [ ] Page review mobile (noter restaurant et plats)
- [ ] Upload photos dans reviews
- [ ] Calcul automatique rating restaurant
- [ ] Modération reviews (admin)
- [ ] Réponses restaurants aux avis

### 🗺️ Géolocalisation et Carte
- [ ] Intégration Expo Location (permissions GPS)
- [ ] Écran carte interactive (MapView)
- [ ] Markers restaurants sur la carte
- [ ] Calcul distance temps réel
- [ ] Navigation GPS vers restaurant
- [ ] Filtrage par rayon de distance
- [ ] Backend : calcul distances avec PostGIS

### ❤️ Système de Favoris Complet
- [x] UI favoris dans profil mobile
- [ ] **FavoritesContext avec persistance**
- [ ] Synchronisation favoris avec backend
- [ ] API `/api/favorites`
- [ ] Notifications pour favoris (promotions)
- [ ] Tri restaurants par favoris

### 📤 Partage Social et Deep Linking
- [ ] Intégration Expo Sharing
- [ ] Boutons partage restaurants et plats
- [ ] Génération images partage dynamiques
- [ ] Deep linking (ouvrir app via liens)
- [ ] URL schemes OneEats custom
- [ ] Tracking partages (analytics)

### 🌐 Mode Offline et Cache
- [x] Optimisations performance mobile avancées
- [ ] **CacheService avec stratégies intelligentes**
- [ ] Détection connectivité (NetInfo)
- [ ] Synchronisation en arrière-plan
- [ ] Indicateurs UI mode offline
- [ ] Queue requêtes pendant offline
- [ ] Mise en cache images avec react-native-fast-image

---

## 📅 Phase 6 — Administration et Analytics (À venir)

### 🔐 Domaine Admin
- [ ] Entité `Admin` avec permissions avancées
- [ ] API REST `/api/admin`
- [ ] Page dashboard admin web
- [ ] Gestion utilisateurs et restaurants
- [ ] Modération contenus (menus, images, reviews)
- [ ] Statistiques globales plateforme
- [ ] Logs et audit trail

### 📊 Analytics et Métriques
- [ ] Dashboard analytics restaurant
- [ ] Métriques commandes (volume, CA, temps moyen)
- [ ] Analytics clients (fidélité, panier moyen)
- [ ] Exports CSV/Excel des données
- [ ] Graphiques interactifs (Recharts)
- [ ] KPIs temps réel
- [ ] Rapports personnalisés

---

## 📅 Phase 7 — Optimisations et Production (À venir)

### ⚡ Optimisations Backend
- [ ] Cache Hibernate niveau 2
- [ ] Query optimization avec indexes
- [ ] Connection pooling avancé
- [ ] Compression réponses HTTP (Gzip)
- [ ] Rate limiting API
- [ ] CDN pour images statiques

### 📱 Optimisations Mobile
- [x] React.memo sur composants coûteux
- [x] Lazy loading images avec cache
- [x] FlatList virtualisées
- [x] Monitoring performance temps réel
- [ ] **Bundle optimization avec Metro**
- [ ] Code splitting et lazy loading
- [ ] Compression images automatique
- [ ] Analyse bundle size

### 🔧 Configuration Production
- [ ] Variables d'environnement production
- [ ] Configuration CI/CD (GitHub Actions)
- [ ] Docker images optimisées
- [ ] Kubernetes deployment specs
- [ ] SSL/TLS configuration
- [ ] Backup automatique base de données
- [ ] Monitoring production (Sentry, Datadog)
- [ ] App Store et Play Store configuration

---

## 🐛 Bugs Connus

| ID  | Description                              | Priorité | Status       | Assigné à |
|-----|------------------------------------------|----------|--------------|-----------|
| #01 | Mock data encore utilisé dans web/mobile | Haute    | ➡️ En cours  | Sprint 1  |
| #02 | Auth JWT non implémentée                 | Haute    | 📋 Backlog   | Sprint 3  |
| #03 | WebSocket temps réel manquant            | Moyenne  | 📋 Backlog   | Sprint 4  |
| #04 | Mode offline non implémenté (mobile)     | Moyenne  | 📋 Backlog   | Sprint 5  |
| #05 | Tests E2E incomplets                     | Basse    | 📋 Backlog   | Sprint 7  |

---

## 📝 Notes de Session

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

## 🎯 Objectifs à Court Terme (2 semaines)

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

## 🎯 Objectifs à Moyen Terme (1-2 mois)

- Système de notifications temps réel (WebSocket)
- Recherche avancée et filtres
- Système de reviews et notes
- Géolocalisation et carte
- Mode offline mobile
- Dashboard admin complet
- Analytics et métriques

---

## 🚀 Vision Long Terme (3-6 mois)

- **Paiement en ligne** : Intégration Stripe/PayPal
- **Livraison à domicile** : Partenariat livreurs ou système interne
- **Programme de fidélité** : Points, récompenses, cashback
- **Recommandations IA** : Machine learning pour suggestions personnalisées
- **Application restaurant native** : Alternative au dashboard web
- **Multi-langues** : i18n complet (FR, EN, ES, IT)
- **Multi-devises** : Support EUR, USD, GBP
- **API publique** : Ouverture API pour intégrations tierces

---

## 📊 Métriques de Progression

### Backend
- **Architecture** : ✅ 100% (Complet)
- **APIs Domaines** : ✅ 95% (Order, User, Restaurant, Menu complets)
- **Tests** : ⚠️ 70% (Unit tests OK, intégration à compléter)
- **Sécurité** : ❌ 30% (Documenté mais non implémenté)

### Frontend Web
- **UI/UX** : ✅ 90% (Interface complète)
- **Intégration API** : ❌ 10% (Mock data encore utilisé)
- **Tests** : ❌ 20% (Tests unitaires basiques)

### Frontend Mobile
- **UI/UX** : ✅ 95% (Très complet avec features avancées)
- **Intégration API** : ❌ 15% (Mock data encore utilisé)
- **Performance** : ✅ 85% (Optimisations avancées implémentées)
- **Tests** : ❌ 10% (À implémenter)

### Global MVP
**Progression globale** : ⚠️ **65%**

---

## 📅 Dernière mise à jour

**Date** : 2025-12-12
**Version** : MVP 0.7
**Responsable** : Équipe OneEats
**Prochaine revue** : 2025-12-19
