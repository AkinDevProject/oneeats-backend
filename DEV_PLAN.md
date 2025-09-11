# Plan de Développement OneEats - Liste Complète des Tâches

## 📋 Vue d'ensemble du projet

Le projet OneEats est une plateforme de livraison de nourriture construite avec une architecture hexagonale et Domain-Driven Design. Bien que la structure architecturale soit solide, plusieurs tâches critiques doivent être complétées pour rendre l'application pleinement fonctionnelle.

---

## 🚨 TÂCHES CRITIQUES (À traiter en priorité)

### 1. **Correction des entités JPA et relations**
- **Description courte** : Corriger toutes les annotations JPA, relations entre entités et problèmes de schéma de base de données qui empêchent le démarrage et les tests.
- **Prompt à exécuter** : 
  ```
  Analyser et corriger tous les problèmes JPA dans les entités :
  1. Vérifier et corriger les @JoinColumn avec les bons noms de colonnes
  2. Ajouter @GeneratedValue pour tous les IDs UUID
  3. Corriger les relations @OneToMany/@ManyToOne avec mappedBy approprié
  4. Mettre à jour le schema.sql et import.sql en conséquence
  5. Tester que toutes les entités se créent correctement au démarrage
  
  Entités à corriger :
  - UserEntity (relations avec orders)
  - OrderEntity (relations avec orderItems, user, restaurant)  
  - OrderItemEntity (relation avec order)
  - RestaurantEntity (relations avec orders, menuItems)
  - MenuItemEntity (relations avec restaurant, choices, options)
  - NotificationEntity
  - Toutes les nouvelles entités Security
  ```
- **Mise à jour du fichier contexte** : Oui, documenter les corrections JPA
- **Message de commit** : "Fix JPA entities relations and database schema issues"

### 2. **Implémentation des Command/Query Handlers manquants**
- **Description courte** : Créer tous les handlers CQRS référencés par les contrôleurs mais manquants, implémentant la logique métier.
- **Prompt à exécuter** : 
  ```
  Créer les Command et Query Handlers manquants pour chaque domaine :
  
  USER DOMAIN:
  - CreateUserCommandHandler
  - UpdateUserCommandHandler  
  - DeleteUserCommandHandler
  - GetUserQueryHandler
  - GetAllUsersQueryHandler
  
  RESTAURANT DOMAIN:
  - RegisterRestaurantCommandHandler
  - UpdateRestaurantCommandHandler
  - UpdateRestaurantStatusCommandHandler
  - GetRestaurantQueryHandler
  - GetAllRestaurantsQueryHandler
  - SearchRestaurantsQueryHandler
  
  ORDER DOMAIN:
  - CreateOrderCommandHandler
  - UpdateOrderStatusCommandHandler
  - CancelOrderCommandHandler
  - GetOrderQueryHandler
  - GetOrdersByUserQueryHandler
  - GetOrdersByRestaurantQueryHandler
  
  MENU DOMAIN:
  - CreateMenuItemCommandHandler (déjà existe - vérifier)
  - UpdateMenuItemCommandHandler (déjà existe - vérifier)
  - DeleteMenuItemCommandHandler (déjà existe - vérifier)
  - GetMenuItemQueryHandler
  - GetRestaurantMenuQueryHandler (déjà existe - vérifier)
  
  NOTIFICATION DOMAIN:
  - SendNotificationCommandHandler
  - GetNotificationQueryHandler
  - GetUserNotificationsQueryHandler
  
  ADMIN DOMAIN:
  - CreateAdminCommandHandler
  - GetAdminQueryHandler
  - GetAllAdminsQueryHandler
  
  Chaque handler doit :
  1. Implémenter la logique métier appropriée
  2. Utiliser les repositories du domaine
  3. Publier les domain events appropriés
  4. Gérer les cas d'erreur avec les exceptions du domaine
  ```
- **Mise à jour du fichier contexte** : Oui, documenter l'implémentation CQRS complète
- **Message de commit** : "Implement missing CQRS command and query handlers"

### 3. **Configuration complète de l'authentification JWT**
- **Description courte** : Implémenter complètement le système d'authentification JWT avec login, logout, validation de tokens et gestion des sessions.
- **Prompt à exécuter** : 
  ```
  Compléter l'implémentation de l'authentification :
  
  1. Créer AuthenticationService avec :
     - login(email, password) -> JWT token
     - logout(sessionToken) -> invalidation
     - validateToken(token) -> User
     - refreshToken(token) -> nouveau token
  
  2. Implémenter LoginCommandHandler avec :
     - Validation des credentials
     - Création de session utilisateur  
     - Génération du JWT token
     - Enregistrement de l'attempt d'authentification
  
  3. Créer les endpoints d'authentification :
     - POST /api/auth/login
     - POST /api/auth/logout
     - POST /api/auth/refresh
     - GET /api/auth/me
  
  4. Ajouter les filtres de sécurité :
     - JWTAuthenticationFilter
     - Configuration des endpoints protégés
     - Gestion des rôles (USER, RESTAURANT, ADMIN)
  
  5. Implémenter PasswordEncoder pour le hachage sécurisé
  
  6. Configurer la validation JWT dans application.yml
  ```
- **Mise à jour du fichier contexte** : Oui, documenter la sécurité implémentée
- **Message de commit** : "Implement complete JWT authentication system"

---

## 🔥 TÂCHES HAUTE PRIORITÉ

### 4. **Implémentation de la logique métier des commandes**
- **Description courte** : Implémenter le cycle de vie complet des commandes avec états, validations et règles métier.
- **Prompt à exécuter** : 
  ```
  Implémenter la logique métier complète pour les commandes :
  
  1. Enrichir Order domain model avec :
     - Validation du minimum de commande
     - Calcul automatique des totaux (sous-total, taxes, frais livraison, total)
     - Transitions d'état valides (PENDING -> CONFIRMED -> PREPARING -> READY -> DELIVERED)
     - Règles métier (horaires restaurant, disponibilité items, etc.)
  
  2. Créer OrderDomainService avec :
     - validateOrder(Order) -> validation règles métier
     - calculateTotals(Order) -> calcul des prix
     - canTransitionTo(currentStatus, newStatus) -> validation transitions
  
  3. Implémenter dans les handlers :
     - Validation automatique à la création
     - Publication d'events pour chaque changement d'état
     - Notification automatique du restaurant et client
  
  4. Ajouter les domain events :
     - OrderCreatedEvent
     - OrderStatusChangedEvent  
     - OrderCancelledEvent
     - OrderDeliveredEvent
  
  5. Créer les EventHandlers correspondants pour :
     - Envoi de notifications
     - Mise à jour des métriques restaurant
     - Synchronisation des données
  ```
- **Mise à jour du fichier contexte** : Oui, documenter la logique métier des commandes
- **Message de commit** : "Implement complete order business logic and state management"

### 5. **Système de notifications en temps réel**
- **Description courte** : Implémenter les notifications push/email/SMS avec templates et gestion des préférences utilisateur.
- **Prompt à exécuter** : 
  ```
  Créer le système de notifications complet :
  
  1. Compléter NotificationDomainService avec :
     - sendNotification(userId, type, data) -> envoi notification
     - createFromTemplate(templateType, data) -> génération contenu
     - getUserPreferences(userId) -> préférences notification
  
  2. Créer NotificationTemplateService avec templates :
     - ORDER_CONFIRMED, ORDER_PREPARING, ORDER_READY, ORDER_DELIVERED
     - RESTAURANT_NEW_ORDER, RESTAURANT_ORDER_CANCELLED
     - USER_REGISTRATION_WELCOME
     - Templates HTML pour email + texte pour SMS
  
  3. Implémenter les providers :
     - EmailNotificationProvider (avec template HTML)
     - SMSNotificationProvider (avec service externe)
     - PushNotificationProvider (pour mobile)
  
  4. Créer NotificationPreference entity avec :
     - Préférences par type de notification
     - Canaux préférés (email/sms/push)
     - Horaires de notification
  
  5. Ajouter endpoints de gestion :
     - GET/PUT /api/users/{id}/notification-preferences
     - GET /api/users/{id}/notifications
     - PUT /api/notifications/{id}/read
  ```
- **Mise à jour du fichier contexte** : Oui, documenter le système de notifications
- **Message de commit** : "Implement complete notification system with templates and preferences"

### 6. **Gestion des menus et disponibilité**
- **Description courte** : Compléter la gestion des menus avec catégories, options, choix, disponibilité et horaires.
- **Prompt à exécuter** : 
  ```
  Compléter la gestion des menus :
  
  1. Créer MenuCategory entity et repository :
     - Catégorisation des items (Entrées, Plats, Desserts, etc.)
     - Ordre d'affichage
     - Disponibilité par horaire
  
  2. Enrichir MenuItem avec :
     - Gestion de la disponibilité (stock, horaires)
     - Images multiples
     - Informations nutritionnelles
     - Tags et allergènes
  
  3. Compléter MenuItemOption et MenuItemChoice :
     - Prix additionnels
     - Disponibilité
     - Stock limité
  
  4. Créer MenuDomainService avec :
     - validateMenuItem(item) -> validation règles métier
     - checkAvailability(itemId, restaurantId) -> vérification disponibilité
     - calculateItemPrice(item, choices, options) -> calcul prix final
  
  5. Ajouter endpoints complets :
     - GET /api/restaurants/{id}/menu/categories
     - POST/PUT/DELETE /api/restaurants/{id}/menu/categories
     - GET /api/menu-items/{id}/availability
     - PUT /api/menu-items/{id}/availability
  
  6. Implémenter la recherche de menu :
     - Recherche par nom, catégorie, tags
     - Filtres par prix, allergènes, disponibilité
  ```
- **Mise à jour du fichier contexte** : Oui, documenter la gestion des menus
- **Message de commit** : "Complete menu management with categories, availability and search"

### 7. **Interface d'administration complète**
- **Description courte** : Créer le dashboard administrateur avec gestion des utilisateurs, restaurants, commandes et métriques.
- **Prompt à exécuter** : 
  ```
  Créer l'interface d'administration complète :
  
  1. Implémenter AdminDomainService avec :
     - User management (activation/désactivation, rôles)
     - Restaurant approval/rejection
     - Order monitoring et intervention
     - Système de métriques et rapports
  
  2. Créer les Command/Query handlers admin :
     - ApproveRestaurantCommandHandler
     - RejectRestaurantCommandHandler
     - SuspendUserCommandHandler
     - GetPlatformMetricsQueryHandler
     - GenerateReportQueryHandler
  
  3. Ajouter les endpoints admin :
     - GET/POST/PUT/DELETE /api/admin/users
     - GET/PUT /api/admin/restaurants (approval workflow)
     - GET /api/admin/orders (monitoring)
     - GET /api/admin/metrics (KPIs plateforme)
     - GET /api/admin/reports (rapports)
  
  4. Créer AdminMetrics entity avec :
     - Métriques quotidiennes/hebdomadaires/mensuelles
     - KPIs (nouveaux utilisateurs, commandes, revenus)
     - Statistiques par restaurant
  
  5. Implémenter le système de permissions :
     - ADMIN_READ, ADMIN_WRITE, ADMIN_DELETE
     - Audit trail des actions admin
     - Logs de sécurité
  
  6. Créer AdminAuditLog entity pour traçabilité
  ```
- **Mise à jour du fichier contexte** : Oui, documenter l'interface d'administration
- **Message de commit** : "Implement complete admin interface with metrics and user management"

---

## 📊 TÂCHES PRIORITÉ MOYENNE

### 8. **Système de paiement intégré**
- **Description courte** : Intégrer un système de paiement (Stripe) avec gestion des transactions, remboursements et historique.
- **Prompt à exécuter** : 
  ```
  Implémenter le système de paiement :
  
  1. Créer Payment domain avec :
     - Payment entity (montant, statut, méthode)
     - PaymentMethod entity (carte, PayPal, etc.)
     - PaymentTransaction entity (historique)
  
  2. Créer PaymentService avec intégration Stripe :
     - createPaymentIntent(orderId, amount)
     - processPayment(paymentIntentId)
     - refundPayment(paymentId, amount)
  
  3. Ajouter endpoints paiement :
     - POST /api/payments/create-intent
     - POST /api/payments/confirm
     - POST /api/payments/refund
     - GET /api/users/{id}/payment-methods
  
  4. Intégrer avec le cycle de commande :
     - Validation paiement avant confirmation commande
     - Gestion des échecs de paiement
     - Remboursements automatiques pour annulations
  ```
- **Mise à jour du fichier contexte** : Oui, documenter l'intégration paiement
- **Message de commit** : "Integrate Stripe payment system with order flow"

### 9. **Système de géolocalisation et livraison**
- **Description courte** : Implémenter la géolocalisation, calcul de distances, zones de livraison et suivi en temps réel.
- **Prompt à exécuter** : 
  ```
  Créer le système de géolocalisation :
  
  1. Créer Address value object avec :
     - Validation d'adresse
     - Géocodage (latitude/longitude)
     - Calcul de distance
  
  2. Créer DeliveryZone entity avec :
     - Zones de livraison par restaurant
     - Prix de livraison par zone
     - Temps de livraison estimé
  
  3. Implémenter LocationService avec :
     - geocodeAddress(address) -> coordonnées
     - calculateDistance(from, to) -> distance
     - findNearbyRestaurants(address, radius)
  
  4. Créer Delivery entity avec :
     - Suivi en temps réel
     - Statut de livraison
     - Informations livreur
  
  5. Ajouter endpoints géolocalisation :
     - GET /api/restaurants/nearby?lat=&lng=&radius=
     - POST /api/addresses/validate
     - GET /api/orders/{id}/delivery-tracking
  ```
- **Mise à jour du fichier contexte** : Oui, documenter la géolocalisation
- **Message de commit** : "Implement geolocation and delivery tracking system"

### 10. **Système de reviews et ratings**
- **Description courte** : Créer le système de notation et commentaires pour restaurants et plats avec modération.
- **Prompt à exécuter** : 
  ```
  Implémenter le système de reviews :
  
  1. Créer Review domain avec :
     - Review entity (note, commentaire, photos)
     - ReviewReport entity (signalements)
     - ReviewResponse entity (réponses restaurant)
  
  2. Créer ReviewDomainService avec :
     - calculateRestaurantRating(restaurantId)
     - validateReview(review) -> règles métier
     - moderateReview(reviewId) -> modération
  
  3. Ajouter endpoints reviews :
     - POST /api/orders/{id}/review
     - GET /api/restaurants/{id}/reviews
     - POST /api/reviews/{id}/report
     - POST /api/reviews/{id}/response (restaurant)
  
  4. Implémenter la logique métier :
     - Un seul review par commande
     - Délai pour reviewer après livraison
     - Modération automatique des contenus
  
  5. Ajouter métriques reviews :
     - Rating moyen par restaurant
     - Évolution des notes dans le temps
     - Signalements et modération
  ```
- **Mise à jour du fichier contexte** : Oui, documenter le système de reviews
- **Message de commit** : "Implement review and rating system with moderation"

### 11. **Optimisation des performances et cache**
- **Description courte** : Implémenter la mise en cache Redis, optimisation des requêtes et pagination pour améliorer les performances.
- **Prompt à exécuter** : 
  ```
  Optimiser les performances :
  
  1. Configurer Redis pour le cache :
     - Cache des menus restaurants
     - Cache des utilisateurs connectés
     - Sessions utilisateur
  
  2. Ajouter pagination générique :
     - PagedQuery base class
     - PagedResult wrapper
     - Pagination pour tous les endpoints de listing
  
  3. Optimiser les requêtes JPA :
     - @NamedQuery pour requêtes complexes
     - Fetch strategies optimisées
     - Lazy loading approprié
  
  4. Implémenter CacheService avec :
     - Cache des menus (TTL 1h)
     - Cache des restaurants (TTL 30min)
     - Invalidation cache lors des mises à jour
  
  5. Ajouter les métriques de performance :
     - Temps de réponse endpoints
     - Hit ratio cache
     - Monitoring base de données
  ```
- **Mise à jour du fichier contexte** : Oui, documenter l'optimisation performance
- **Message de commit** : "Implement Redis caching and performance optimizations"

### 12. **API mobile et synchronisation**
- **Description courte** : Créer les endpoints spécifiques mobile avec synchronisation offline et push notifications.
- **Prompt à exécuter** : 
  ```
  Créer l'API mobile :
  
  1. Ajouter endpoints mobile-optimized :
     - GET /api/mobile/sync (synchronisation données)
     - POST /api/mobile/device (enregistrement device)
     - GET /api/mobile/config (configuration app)
  
  2. Implémenter MobileDeviceService avec :
     - Enregistrement devices pour push notifications
     - Gestion des versions d'app
     - Configuration dynamique
  
  3. Créer MobileDevice entity avec :
     - Token push notification
     - Plateforme (iOS/Android)
     - Version de l'app
  
  4. Ajouter synchronisation offline :
     - Timestamps dernière sync
     - Delta sync pour données modifiées
     - Résolution conflits
  
  5. Optimiser les réponses mobile :
     - DTOs allégés
     - Compression responses
     - Images optimisées
  ```
- **Mise à jour du fichier contexte** : Oui, documenter l'API mobile
- **Message de commit** : "Create mobile-optimized API with offline sync"

### 13. **Gestion des promotions et coupons**
- **Description courte** : Implémenter le système de promotions, codes de réduction et programme de fidélité.
- **Prompt à exécuter** : 
  ```
  Créer le système de promotions :
  
  1. Créer Promotion domain avec :
     - Promotion entity (type, valeur, conditions)
     - CouponCode entity (codes uniques)
     - UserCoupon entity (usage par utilisateur)
  
  2. Créer PromotionService avec :
     - validateCoupon(code, orderId) -> validation
     - calculateDiscount(promotion, order) -> calcul réduction
     - applyPromotion(orderId, promotionId)
  
  3. Types de promotions :
     - Pourcentage de réduction
     - Montant fixe
     - Livraison gratuite
     - Premier commande
  
  4. Ajouter endpoints promotions :
     - POST /api/coupons/validate
     - GET /api/users/{id}/coupons
     - GET /api/promotions/active
  
  5. Intégrer avec le système de commande :
     - Application automatique des promotions
     - Validation lors du checkout
     - Historique des promotions utilisées
  ```
- **Mise à jour du fichier contexte** : Oui, documenter les promotions
- **Message de commit** : "Implement promotion and coupon system"

### 14. **Rapports et analytics**
- **Description courte** : Créer le système de rapports avec métriques business, dashboards et exports pour restaurants et admin.
- **Prompt à exécuter** : 
  ```
  Implémenter le système de rapports :
  
  1. Créer BusinessMetrics domain avec :
     - DailyMetrics entity (métriques quotidiennes)
     - RestaurantMetrics entity (performance restaurant)
     - PlatformMetrics entity (KPIs plateforme)
  
  2. Créer ReportingService avec :
     - generateRestaurantReport(restaurantId, period)
     - generatePlatformReport(period)
     - calculateKPIs() -> indicateurs clés
  
  3. Types de rapports :
     - Chiffre d'affaires par période
     - Commandes par restaurant/utilisateur
     - Temps de préparation moyens
     - Taux de satisfaction client
  
  4. Ajouter endpoints reporting :
     - GET /api/restaurants/{id}/reports/sales
     - GET /api/admin/reports/platform
     - GET /api/reports/export (CSV/Excel)
  
  5. Créer les dashboards :
     - Métriques temps réel
     - Graphiques d'évolution
     - Comparaisons périodiques
  ```
- **Mise à jour du fichier contexte** : Oui, documenter les rapports
- **Message de commit** : "Implement business reporting and analytics system"

### 15. **Tests automatisés complets**
- **Description courte** : Compléter la suite de tests avec tests unitaires, intégration et E2E automatisés.
- **Prompt à exécuter** : 
  ```
  Compléter les tests automatisés :
  
  1. Corriger les tests d'intégration existants :
     - Résoudre les problèmes d'entités JPA
     - Configurer correctement H2 et données de test
     - Valider tous les endpoints
  
  2. Ajouter tests unitaires manquants :
     - Tous les domain services (>80% coverage)
     - Command/Query handlers
     - Value objects et entities
  
  3. Créer tests E2E avec TestContainers :
     - Scénarios complets utilisateur
     - Tests avec vraie base PostgreSQL
     - Tests de performance
  
  4. Configurer CI/CD :
     - Pipeline GitHub Actions
     - Tests automatiques sur PR
     - Déploiement automatique
  
  5. Ajouter tests de sécurité :
     - Tests d'authentification
     - Tests d'autorisation par rôle
     - Tests de validation d'entrées
  ```
- **Mise à jour du fichier contexte** : Oui, documenter la stratégie de tests
- **Message de commit** : "Complete automated test suite with unit, integration and E2E tests"

---

## 🔧 TÂCHES PRIORITÉ BASSE

### 16. **Configuration monitoring et logging**
- **Description courte** : Configurer monitoring (Prometheus/Grafana), logging centralisé et alertes pour la production.
- **Prompt à exécuter** : Configurer monitoring production avec Prometheus, Grafana, logging centralisé ELK et alertes critiques
- **Mise à jour du fichier contexte** : Oui, documenter le monitoring
- **Message de commit** : "Setup production monitoring and centralized logging"

### 17. **Sécurisation avancée**
- **Description courte** : Implémenter rate limiting, HTTPS, CSP headers, audit trail et protection contre les attaques communes.
- **Prompt à exécuter** : Renforcer la sécurité avec rate limiting, headers sécurité, audit trail, protection OWASP Top 10
- **Mise à jour du fichier contexte** : Oui, documenter la sécurité avancée
- **Message de commit** : "Implement advanced security measures and OWASP protections"

### 18. **Optimisation SEO et référencement**
- **Description courte** : Optimiser le référencement avec sitemap, meta tags, structured data et performance Web Core Vitals.
- **Prompt à exécuter** : Optimiser SEO avec sitemap, meta tags dynamiques, structured data restaurants, performance Core Vitals
- **Mise à jour du fichier contexte** : Oui, documenter l'optimisation SEO
- **Message de commit** : "Implement SEO optimization and performance improvements"

### 19. **Intégrations tierces avancées**
- **Description courte** : Intégrer services externes : emails (SendGrid), SMS (Twilio), cartes (Google Maps), social login.
- **Prompt à exécuter** : Intégrer services externes : SendGrid emails, Twilio SMS, Google Maps, social login OAuth2
- **Mise à jour du fichier contexte** : Oui, documenter les intégrations
- **Message de commit** : "Integrate third-party services for enhanced functionality"

### 20. **Documentation et formation**
- **Description courte** : Créer documentation technique complète, guides utilisateur et formation équipe.
- **Prompt à exécuter** : Créer documentation technique complète, API docs, guides utilisateur, formation équipe, architecture guide
- **Mise à jour du fichier contexte** : Oui, documenter la stratégie documentation
- **Message de commit** : "Create comprehensive technical documentation and user guides"

---

## 📈 Priorités et dépendances

### Phase 1 - Fondations (Semaines 1-2)
**CRITIQUE** : Tâches 1, 2, 3 (entités JPA, handlers CQRS, authentification)

### Phase 2 - Core Business (Semaines 3-4)
**HAUTE** : Tâches 4, 5, 6, 7 (logique commandes, notifications, menus, admin)

### Phase 3 - Fonctionnalités avancées (Semaines 5-7)
**MOYENNE** : Tâches 8-15 (paiement, géolocalisation, reviews, etc.)

### Phase 4 - Production (Semaines 8-10)
**BASSE** : Tâches 16-20 (monitoring, sécurité, SEO, documentation)

---

## 🎯 Métriques de succès

- **Tests** : >90% coverage, 0 tests en échec
- **Performance** : <500ms réponse API, <2s chargement pages
- **Qualité** : 0 bugs critiques, code review systématique
- **Sécurité** : Audit sécurité passé, authentification robuste
- **Business** : Fonctionnalités complètes pour MVP fonctionnel

**Total estimé** : 20 tâches majeures, ~10 semaines de développement pour une équipe