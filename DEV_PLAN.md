# Plan de Développement OneEats MVP

## Vue d'ensemble
Après analyse complète du projet OneEats, voici la liste des tâches restantes pour finaliser la version MVP de la plateforme de commande de nourriture pickup-only avec trois types d'utilisateurs : clients (mobile), restaurants (web), et admins (web).

---

## 🏗️ BACKEND - API REST QUARKUS

### 1. Authentification et Sécurité JWT
- **Description courte** : Implémente le système d'authentification JWT pour sécuriser les endpoints API et gérer les sessions utilisateurs.
- **Prompt à exécuter** : Implémenter l'authentification JWT complète avec les endpoints `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, et sécuriser tous les endpoints existants avec les annotations `@RolesAllowed`. Créer les middleware de validation JWT et les filtres de sécurité.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Implement JWT authentication system and secure API endpoints"

### ✅ 2. Endpoint Commandes par Utilisateur - COMPLÉTÉ
- **Description courte** : ~~Créer l'endpoint manquant pour récupérer les commandes d'un utilisateur spécifique côté mobile.~~ **DÉJÀ IMPLÉMENTÉ**
- **Statut** : L'endpoint `GET /api/orders?userId={userId}` existe déjà avec GetOrdersByUserQuery et GetOrdersByUserQueryHandler complets.
- **Vérification** : OrderController.java lignes 84-86 - Fonctionnel et prêt pour l'app mobile.
- **Action** : Aucune action requise, cette fonctionnalité est opérationnelle.

### ✅ 3. Endpoints Notifications WebSocket - COMPLÉTÉ
- **Description courte** : ~~Finaliser le système de notifications temps réel via WebSocket.~~ **DÉJÀ IMPLÉMENTÉ ET TRÈS AVANCÉ**
- **Statut** : Système WebSocket complet avec `ws://localhost:8080/ws/notifications/{userId}`, gestion événements, heartbeat, et intégration Order domain events.
- **Vérification** : NotificationWebSocket.java + WebSocketNotificationService.java + OrderStatusChangedEventHandler.java - Architecture event-driven complète.
- **Action** : Aucune action requise, système temps réel opérationnel avec notifications automatiques sur changements statut commandes.

### ✅ 4. Validation Données et Gestion Erreurs - COMPLÉTÉ
- **Description courte** : ~~Ajouter la validation robuste des données d'entrée et la gestion centralisée des erreurs.~~ **100% IMPLÉMENTÉ**
- **Statut** : Validation Jakarta Bean + 60+ validations métier + 4 ExceptionMappers complets (EntityNotFound, Validation, ConstraintViolation, Global).
- **Vérification** : ValidationExceptionMapper.java, ConstraintViolationExceptionMapper.java, GlobalExceptionMapper.java créés avec réponses JSON standardisées et détectés par Quarkus.
- **Fichiers créés** :
  - `src/main/java/com/oneeats/shared/exception/ValidationExceptionMapper.java` - Gestion ValidationException avec BAD_REQUEST
  - `src/main/java/com/oneeats/shared/exception/ConstraintViolationExceptionMapper.java` - Gestion ConstraintViolationException avec détails des violations
  - `src/main/java/com/oneeats/shared/exception/GlobalExceptionMapper.java` - Gestion générale avec INTERNAL_SERVER_ERROR sécurisé
- **Action** : ✅ COMPLÉTÉ - Système de validation et gestion d'erreurs 100% opérationnel avec réponses JSON standardisées.

### ✅ 5. Endpoints Images et Upload - COMPLÉTÉ
- **Description courte** : ~~Finaliser la gestion des images pour restaurants et éléments de menu avec stockage local et URLs publiques.~~ **100% IMPLÉMENTÉ**
- **Statut** : Système d'upload complet pour restaurants ET menu items avec redimensionnement automatique, serving statique, et proxy d'images externes.
- **Fonctionnalités créées** :
  - **Restaurants** : `POST /api/restaurants/{id}/image`, `DELETE /api/restaurants/{id}/image`
  - **Menu Items** : `POST /api/menu-items/{id}/image`, `DELETE /api/menu-items/{id}/image`
  - **Serving statique** : `GET /uploads/{directory}/{filename}`
  - **Proxy images** : `GET /api/proxy/image?url=`
  - **Redimensionnement** : Optimisation automatique 800x800 max avec qualité préservée
- **Fichiers créés/modifiés** :
  - `UploadMenuItemImageCommand.java` + `DeleteMenuItemImageCommand.java` - Commandes menu items
  - `UploadMenuItemImageCommandHandler.java` + `DeleteMenuItemImageCommandHandler.java` - Handlers
  - `ImageResizingService.java` - Service redimensionnement avec thumbnails/medium/large
  - `FileStorageService.java` - Extended avec `saveMenuItemImage()` et redimensionnement auto
  - `MenuController.java` - Endpoints upload/delete avec multipart/form-data
- **Sécurité** : Validation extensions (JPG/PNG/WebP), taille max 5MB, stockage sécurisé UUID
- **Action** : ✅ COMPLÉTÉ - Système d'images 100% opérationnel pour restaurants et menu items avec redimensionnement automatique.

---

## 🌐 FRONTEND WEB - INTERFACE RESTAURANTS & ADMINS

### 6. Authentification Restaurant/Admin
- **Description courte** : Créer le système de login pour restaurants et admins avec redirection selon le rôle utilisateur.
- **Prompt à exécuter** : Implémenter la page de login unique avec redirection automatique vers dashboard restaurant ou admin selon le rôle, gérer le stockage du token JWT, et créer les hooks d'authentification useAuth.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Implement restaurant and admin authentication with role-based routing"

### ✅ 7. Gestion Menu Restaurant - COMPLÉTÉ
- **Description courte** : ~~Finaliser les pages de gestion du menu restaurant avec ajout/édition/suppression d'articles et upload d'images.~~ **100% IMPLÉMENTÉ**
- **Statut** : Interface complète avec CRUD complet, gestion catégories, upload d'images, filtres avancés, et interface responsive.
- **Fonctionnalités réalisées** :
  - **Interface MenuPage.tsx** : Interface responsive (mobile/tablet/desktop) avec design moderne
  - **CRUD complet** : Création, lecture, modification, suppression des plats avec formulaires modaux
  - **Gestion catégories** : Catégories dynamiques, filtres par catégorie, affichage groupé
  - **Upload d'images** : Composant ImageUpload avec drag-drop, redimensionnement automatique, preview
  - **Filtres avancés** : Recherche par nom/description, filtres par disponibilité
  - **Options plats** : Gestion complète des options (choix, extras) avec MenuItemOptionsForm
  - **Toggle disponibilité** : Activation/désactivation instantanée des plats
  - **API Services** : Tous endpoints CRUD implémentés avec gestion d'erreurs
- **Fichiers créés/modifiés** :
  - `apps/web/src/components/ui/ImageUpload.tsx` - Composant upload d'images avec drag-drop
  - `apps/web/src/services/api.ts` - Ajout méthodes uploadImage/deleteImage pour menu items
  - `apps/web/src/pages/restaurant/MenuPage.tsx` - Interface complète mise à jour
- **Action** : ✅ COMPLÉTÉ - Fonctionnalité 100% opérationnelle et prête pour la production

### 8. Dashboard Analytics Restaurant
- **Description courte** : Finaliser le dashboard analytics restaurant avec métriques de ventes, graphiques, et données en temps réel.
- **Prompt à exécuter** : Compléter AnalyticsPage.tsx avec integration de l'API analytics, affichage des revenus par période, graphiques des commandes, top items vendus, et métriques temps réel.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Complete restaurant analytics dashboard with sales metrics and real-time data"

### 9. Profile et Paramètres Restaurant
- **Description courte** : Finaliser la page de profil restaurant avec édition des informations, horaires, et paramètres de commande.
- **Prompt à exécuter** : Compléter RestaurantProfilePage.tsx et RestaurantSettingsPage.tsx avec formulaires d'édition du profil, gestion des horaires d'ouverture, paramètres de commande (délais, seuils), et upload logo restaurant.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Complete restaurant profile and settings management pages"

### 10. Gestion Utilisateurs Admin
- **Description courte** : Finaliser la page admin de gestion des utilisateurs avec CRUD complet et filtres avancés.
- **Prompt à exécuter** : Compléter UsersPage.tsx avec tableaux paginés, filtres par rôle/statut, formulaires création/édition utilisateur, actions en lot, et export des données.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Complete admin user management with CRUD operations and advanced filtering"

### 11. Système Analytics Admin
- **Description courte** : Finaliser AnalyticsSystemPage.tsx avec métriques globales de la plateforme et rapports exportables.
- **Prompt à exécuter** : Compléter AnalyticsSystemPage.tsx avec métriques de la plateforme (revenus totaux, nombre restaurants actifs, commandes par période), graphiques de croissance, rapports exportables PDF/CSV, et données temps réel.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Complete admin analytics system with platform metrics and exportable reports"

---

## 📱 MOBILE APP - APPLICATION CLIENT REACT NATIVE

### 12. Écrans de Navigation Mobile
- **Description courte** : Créer tous les écrans manquants pour la navigation complète de l'app mobile (accueil, recherche, profil, historique).
- **Prompt à exécuter** : Créer les écrans HomeScreen.tsx, SearchScreen.tsx, ProfileScreen.tsx, OrderHistoryScreen.tsx avec navigation Expo Router, intégration des contextes Auth/Cart, et design responsive iOS/Android.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Create core mobile app screens with Expo Router navigation"

### 13. Écrans Restaurant et Menu Mobile
- **Description courte** : Créer les écrans de browse restaurants, détail restaurant, et menu avec système de filtres et ajout au panier.
- **Prompt à exécuter** : Créer RestaurantsListScreen.tsx, RestaurantDetailScreen.tsx, MenuScreen.tsx avec liste restaurants, filtres par catégorie/localisation, affichage menu avec options, et intégration panier via CartContext.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Create restaurant browsing and menu screens with cart integration"

### 14. Écrans Commande et Paiement Mobile
- **Description courte** : Créer les écrans de panier, checkout, confirmation, et suivi de commande avec validation pickup-only.
- **Prompt à exécuter** : Créer CartScreen.tsx, CheckoutScreen.tsx, OrderConfirmationScreen.tsx, OrderTrackingScreen.tsx avec validation panier, formulaire checkout pickup-only, confirmation commande, et suivi temps réel via WebSocket.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Create order flow screens with pickup-only checkout and real-time tracking"

### 15. Services API Mobile
- **Description courte** : Créer le service API complet pour l'app mobile avec gestion offline et cache.
- **Prompt à exécuter** : Créer `apps/mobile/src/services/api.ts` avec tous les endpoints nécessaires, gestion cache AsyncStorage, mode offline avec queue de synchronisation, et gestion erreurs réseau.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Create comprehensive mobile API service with offline support and caching"

### 16. Système Favoris Mobile
- **Description courte** : Intégrer complètement le système de favoris avec synchronisation serveur et interface utilisateur.
- **Prompt à exécuter** : Finaliser FavoritesContext.tsx avec synchronisation API, créer l'écran FavoritesScreen.tsx, intégrer les boutons favoris dans les écrans restaurant/menu, et gérer la persistance locale.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Complete favorites system with server sync and mobile UI"

---

## 🔧 CONFIGURATION & DÉPLOIEMENT

### 17. Configuration Environnements
- **Description courte** : Finaliser les configurations pour développement, test, et production avec variables d'environnement appropriées.
- **Prompt à exécuter** : Créer application-prod.yml pour Quarkus, configurer les variables d'environnement Vite pour le frontend, setup des variables Expo pour mobile, et documenter toutes les configurations dans CONTEXT.md.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Complete environment configurations for dev, test, and production"

### 18. Scripts de Démarrage et Build
- **Description courte** : Créer les scripts de build et démarrage pour tous les environnements avec documentation complète.
- **Prompt à exécuter** : Améliorer start-dev.bat/.sh, créer build-prod.bat/.sh, ajouter scripts npm/yarn pour frontend/mobile, et documenter tous les commands dans README.md.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Create comprehensive build and deployment scripts with documentation"

### 19. Tests Integration et E2E
- **Description courte** : Implémenter les tests d'intégration backend et tests E2E frontend pour validation MVP.
- **Prompt à exécuter** : Créer tests d'intégration RestAssured pour tous les endpoints API, tests React Testing Library pour composants critiques frontend, et tests Detox basiques pour mobile app.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Implement integration and E2E tests for MVP validation"

### 20. Documentation Technique
- **Description courte** : Finaliser la documentation API, architecture, et guide développeur pour faciliter maintenance et évolutions.
- **Prompt à exécuter** : Générer documentation Swagger/OpenAPI complète, créer diagrammes architecture dans CONTEXT.md, documenter les workflows métier, et ajouter guide contribution développeur.
- **Mise à jour du fichier contexte** : Oui, ajouter les changements au fichier `CONTEXT.md` en fin de tâche.
- **Message de commit** : "Complete technical documentation with API specs and architecture diagrams"

---

## 🎯 PRIORITÉ MVP - TÂCHES CRITIQUES

Les tâches **1, 5, 6, 12, 15** sont critiques pour avoir un MVP fonctionnel :
- **Tâche 1** : Authentification JWT (backend)
- ~~**Tâche 2** : Endpoints commandes utilisateur (backend)~~ ✅ **COMPLÉTÉ**
- ~~**Tâche 3** : Notifications WebSocket (backend)~~ ✅ **COMPLÉTÉ**
- ~~**Tâche 4** : Validation données (backend)~~ ✅ **COMPLÉTÉ**
- **Tâche 5** : Upload images (backend)
- **Tâche 6** : Authentification web (frontend)
- **Tâche 12** : Écrans navigation mobile (mobile)
- **Tâche 15** : Services API mobile (mobile)

Les autres tâches ajoutent des fonctionnalités importantes mais peuvent être développées en post-MVP.

---

## 📊 ÉTAT ACTUEL

**✅ Complété :**
- Architecture hexagonale backend avec domaines User, Restaurant, Menu, Order, Admin, Analytics
- Pages admin supervision commandes et gestion restaurants
- Contextes React Native (Auth, Cart, Notifications, WebSocket)
- API REST Quarkus avec la plupart des endpoints
- Configuration Docker et base de données PostgreSQL

**🔄 En cours :**
- Intégration frontend/backend pour certaines pages
- Système de notifications temps réel
- Application mobile avec écrans de base

**❌ Manquant :**
- Authentification JWT complète
- Écrans mobiles principaux
- Tests et validation
- Documentation technique