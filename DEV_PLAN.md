# Plan de développement OneEats Backend

## Vue d'ensemble du projet

OneEats est une plateforme de commande de plats à récupérer sur place (MVP) avec architecture monolithique modulaire basée sur Quarkus. Le projet présente une **inconsistance architecturale critique** : les domaines Order et User suivent le pattern DDD + Event-Driven (selon `contexte.md`), tandis que Restaurant, Menu, Admin et Notification utilisent Clean Architecture + CQRS avec persistance en mémoire.

**Objectif**: Standardiser l'architecture sur le pattern DDD + Event-Driven et compléter l'implémentation MVP.

---

## Tâches prioritaires (ordre d'exécution recommandé)

### 1. Corriger la classe BaseRepository manquante
- **Description courte** : Créer la classe abstraite BaseRepository référencée mais inexistante, causant des erreurs de compilation.
- **Prompt à exécuter** : Créer la classe `BaseRepository` dans `src/main/java/com/oneeats/common/repository/BaseRepository.java`. Analyser les références existantes dans le code pour déterminer l'interface attendue. Implémenter une classe abstraite générique avec les méthodes CRUD de base utilisant PanacheRepository comme fondation.
- **Mise à jour du fichier contexte** : Oui, ajouter la nouvelle classe commune dans la section architecture.
- **Message de commit** : "Add missing BaseRepository class to fix compilation errors"

### 2. Standardiser l'architecture sur DDD + Event-Driven
- **Description courte** : Refactorer les domaines Restaurant, Menu, Admin et Notification pour adopter l'architecture DDD + Event-Driven cohérente avec Order et User.
- **Prompt à exécuter** : Refactorer les domaines Restaurant, Menu, Admin et Notification pour suivre le pattern DDD + Event-Driven utilisé dans Order et User. Pour chaque domaine : 1) Supprimer les Use Cases CQRS, 2) Migrer vers PanacheRepository, 3) Créer des services métier simples, 4) Implémenter les événements CDI, 5) Adapter les controllers REST. Utiliser le domaine Order comme référence complète pour l'architecture cible.
- **Mise à jour du fichier contexte** : Oui, mettre à jour l'état des domaines de "MIXED ARCHITECTURE" vers "DDD + Event-Driven".
- **Message de commit** : "Standardize architecture: migrate domains to DDD + Event-Driven pattern"

### 3. Implémenter la persistance Database pour Restaurant
- **Description courte** : Remplacer le repository en mémoire par PanacheRepository avec persistance PostgreSQL pour le domaine Restaurant.
- **Prompt à exécuter** : Implémenter la persistance complète pour le domaine Restaurant. 1) Créer `RestaurantRepository` étendant `PanacheRepository<Restaurant, UUID>`, 2) Ajouter les méthodes finder métier (by name, by cuisine type, by location, active restaurants), 3) Remplacer InMemoryRestaurantRepository, 4) Créer `RestaurantMapper` pour conversion DTO↔Entity, 5) Adapter le controller REST pour utiliser la nouvelle persistance, 6) Ajouter validation Bean sur les DTOs.
- **Mise à jour du fichier contexte** : Oui, marquer Restaurant comme "✅ PERSISTANCE COMPLÈTE".
- **Message de commit** : "Implement database persistence for Restaurant domain"

### 4. Implémenter la persistance Database pour Menu
- **Description courte** : Remplacer le repository en mémoire par PanacheRepository avec persistance PostgreSQL pour le domaine Menu.
- **Prompt à exécuter** : Implémenter la persistance complète pour le domaine Menu. 1) Créer `MenuItemRepository` étendant `PanacheRepository<MenuItem, UUID>`, 2) Ajouter les méthodes finder métier (by restaurant, by category, available items, dietary filters), 3) Remplacer InMemoryMenuItemRepository, 4) Créer `MenuItemMapper` pour conversion DTO↔Entity, 5) Adapter le controller REST, 6) Implémenter la relation avec Restaurant (FK), 7) Ajouter validation Bean complète.
- **Mise à jour du fichier contexte** : Oui, marquer Menu comme "✅ PERSISTANCE COMPLÈTE".
- **Message de commit** : "Implement database persistence for Menu domain"

### 5. Implémenter la persistance Database pour Admin
- **Description courte** : Remplacer le repository en mémoire par PanacheRepository avec persistance PostgreSQL pour le domaine Admin.
- **Prompt à exécuter** : Implémenter la persistance complète pour le domaine Admin. 1) Créer `AdminRepository` étendant `PanacheRepository<Admin, UUID>`, 2) Ajouter les méthodes finder métier (by role, active admins, search by name), 3) Remplacer InMemoryAdminRepository, 4) Créer `AdminMapper` pour conversion DTO↔Entity, 5) Adapter le controller REST, 6) Implémenter la logique de permissions et supervision, 7) Ajouter validation Bean et hash password sécurisé.
- **Mise à jour du fichier contexte** : Oui, marquer Admin comme "✅ PERSISTANCE COMPLÈTE".
- **Message de commit** : "Implement database persistence for Admin domain"

### 6. Implémenter la persistance Database pour Notification
- **Description courte** : Remplacer le repository en mémoire par PanacheRepository avec persistance PostgreSQL pour le domaine Notification.
- **Prompt à exécuter** : Implémenter la persistance complète pour le domaine Notification. 1) Créer `NotificationRepository` étendant `PanacheRepository<Notification, UUID>`, 2) Ajouter les méthodes finder métier (by user, by type, unread, recent), 3) Remplacer InMemoryNotificationRepository, 4) Créer `NotificationMapper` pour conversion DTO↔Entity, 5) Adapter le controller REST, 6) Implémenter les relations avec User et Restaurant (FK), 7) Ajouter validation Bean.
- **Mise à jour du fichier contexte** : Oui, marquer Notification comme "✅ PERSISTANCE COMPLÈTE".
- **Message de commit** : "Implement database persistence for Notification domain"

### 7. Créer l'intégration Event-Driven Order → Notification
- **Description courte** : Connecter le système d'événements Order avec le domaine Notification pour les notifications automatiques.
- **Prompt à exécuter** : Implémenter l'intégration event-driven entre Order et Notification. 1) Créer `NotificationEventHandler` avec @ApplicationScoped, 2) Implémenter `@Observes OrderCreatedEvent` pour notifier le restaurant, 3) Implémenter `@Observes OrderStatusChangedEvent` pour notifier le client à chaque changement de statut, 4) Créer `NotificationService` pour la logique métier de création de notifications, 5) Ajouter les types de notification (ORDER_CREATED, ORDER_READY, etc.), 6) Tester l'intégration end-to-end.
- **Mise à jour du fichier contexte** : Oui, ajouter l'intégration événementielle dans la section architecture.
- **Message de commit** : "Add event-driven integration: Order events trigger Notifications"

### 8. Standardiser les APIs REST avec préfixe /api
- **Description courte** : Unifier tous les endpoints REST avec le préfixe `/api/` et standardiser les réponses/erreurs.
- **Prompt à exécuter** : Standardiser toutes les APIs REST du projet. 1) Vérifier et corriger les @Path pour utiliser `/api/restaurants`, `/api/menu-items`, `/api/admins`, `/api/notifications`, 2) Créer une classe `GlobalExceptionHandler` pour gestion unifiée des erreurs, 3) Standardiser les codes de réponse HTTP, 4) Ajouter validation Bean complète sur tous les DTOs, 5) Implémenter pagination cohérente sur les endpoints de liste, 6) Ajouter CORS configuration si nécessaire, 7) Documenter avec OpenAPI annotations.
- **Mise à jour du fichier contexte** : Oui, noter la standardisation API dans la section configuration.
- **Message de commit** : "Standardize REST APIs: unified paths, error handling and validation"

### 9. Implémenter l'authentification et la sécurité
- **Description courte** : Activer l'authentification Keycloak et implémenter la sécurité avec hachage des mots de passe BCrypt.
- **Prompt à exécuter** : Implémenter la sécurité complète du système. 1) Créer `PasswordService` avec hachage BCrypt pour remplacer le hachage temporaire, 2) Mettre à jour User et Admin pour utiliser le vrai hachage, 3) Configurer l'authentification Keycloak en développement (application-dev.yml), 4) Ajouter annotations de sécurité sur les endpoints (@RolesAllowed), 5) Implémenter la logique de rôles (CLIENT, RESTAURANT, ADMIN), 6) Créer `AuthenticationService` pour gestion des tokens JWT, 7) Ajouter middleware de validation des rôles métier.
- **Mise à jour du fichier contexte** : Oui, marquer la sécurité comme "✅ ACTIVÉE".
- **Message de commit** : "Implement authentication: Keycloak integration and BCrypt password hashing"

### 10. Créer la logique métier Restaurant avancée
- **Description courte** : Implémenter la logique métier avancée pour les restaurants (horaires, disponibilité, gestion commandes).
- **Prompt à exécuter** : Développer la logique métier avancée du domaine Restaurant. 1) Créer `RestaurantService` avec logique d'ouverture/fermeture basée sur les horaires, 2) Implémenter `OpeningHours` value object avec validation des créneaux, 3) Ajouter méthodes `canAcceptOrders()` et `updateRating()` dans Restaurant, 4) Créer `RestaurantStatisticsService` pour métriques (commandes, revenus, temps moyen), 5) Implémenter événements `RestaurantOpenedEvent`, `RestaurantClosedEvent`, 6) Ajouter endpoint `/api/restaurants/{id}/statistics` pour les stats, 7) Valider les contraintes métier (horaires cohérents, temps de préparation réalistes).
- **Mise à jour du fichier contexte** : Oui, ajouter les services métier avancés du Restaurant.
- **Message de commit** : "Add advanced Restaurant business logic: hours, availability, statistics"

### 11. Créer la logique métier Menu avancée
- **Description courte** : Implémenter la logique métier avancée pour les menus (disponibilité, options diététiques, gestion stock).
- **Prompt à exécuter** : Développer la logique métier avancée du domaine Menu. 1) Créer `MenuService` avec gestion de disponibilité dynamique, 2) Implémenter `DietaryInfo` value object pour options (végétarien, végan, allergènes), 3) Ajouter logique de stock et rupture avec `StockLevel`, 4) Créer `CategoryService` pour gestion des catégories de menu, 5) Implémenter événements `MenuItemOutOfStockEvent`, `MenuItemAvailableEvent`, 6) Ajouter endpoints de recherche avancée (par prix, catégorie, options diététiques), 7) Valider temps de préparation et contraintes prix.
- **Mise à jour du fichier contexte** : Oui, ajouter les services métier avancés du Menu.
- **Message de commit** : "Add advanced Menu business logic: stock, dietary options, search"

### 12. Implémenter la logique Admin de supervision
- **Description courte** : Créer les fonctionnalités de supervision et administration pour la gestion de la plateforme.
- **Prompt à exécuter** : Développer les fonctionnalités d'administration complètes. 1) Créer `AdminService` avec logiques de supervision (validation restaurants, modération), 2) Implémenter `DashboardService` pour statistiques globales de la plateforme, 3) Ajouter endpoints `/api/admins/dashboard` avec KPIs (utilisateurs actifs, commandes, revenus), 4) Créer `ModerationService` pour validation des contenus restaurants/menus, 5) Implémenter permissions granulaires (SUPER_ADMIN, MODERATOR), 6) Ajouter audit trail des actions admin avec événements, 7) Créer rapports CSV export des statistiques, 8) Valider les actions avec log d'audit.
- **Mise à jour du fichier contexte** : Oui, ajouter les services d'administration avancés.
- **Message de commit** : "Add Admin supervision: dashboard, moderation, audit trail"

### 13. Intégrer les notifications push Expo
- **Description courte** : Connecter le système de notifications avec Expo Push Notifications pour les notifications temps réel sur mobile.
- **Prompt à exécuter** : Intégrer Expo Push Notifications au système. 1) Ajouter dépendance expo-server-sdk-java dans pom.xml, 2) Créer `ExpoPushService` pour envoi notifications push, 3) Configurer les tokens Expo dans User (champ `expoPushToken`), 4) Modifier `NotificationEventHandler` pour déclencher push notifications, 5) Créer `PushNotificationService` avec retry logic et gestion d'erreurs, 6) Ajouter configuration Expo dans application.yml (access token), 7) Implémenter templates de notifications (commande créée, prête, etc.), 8) Ajouter endpoint pour register/unregister push tokens, 9) Tester l'intégration avec l'app mobile.
- **Mise à jour du fichier contexte** : Oui, noter l'intégration Expo Push dans la section notifications.
- **Message de commit** : "Integrate Expo Push Notifications for real-time mobile alerts"

### 14. Créer une suite de tests complète
- **Description courte** : Développer une couverture de tests complète (unitaires, intégration, end-to-end) pour tous les domaines.
- **Prompt à exécuter** : Créer une suite de tests complète pour le projet. 1) Configurer TestContainers pour PostgreSQL dans les tests d'intégration, 2) Créer tests unitaires pour chaque service métier (OrderService, RestaurantService, etc.), 3) Créer tests d'intégration REST pour tous les endpoints avec @QuarkusTest, 4) Créer tests de repository avec données de test, 5) Créer tests d'événements CDI (@Observes), 6) Ajouter tests de validation Bean Validation, 7) Créer tests de sécurité (authentification, autorisation), 8) Configurer Jacoco pour couverture de code (objectif 80%+), 9) Ajouter tests de performance basiques (charge), 10) Créer profile `test` avec H2 pour tests rapides.
- **Mise à jour du fichier contexte** : Oui, ajouter la section tests avec couverture complète.
- **Message de commit** : "Add comprehensive test suite: unit, integration, security tests"

### 15. Optimiser les performances et le monitoring
- **Description courte** : Implémenter l'optimisation des performances, le caching et le monitoring avancé pour la production.
- **Prompt à exécuter** : Optimiser les performances et monitoring du système. 1) Ajouter cache Caffeine sur les requêtes fréquentes (restaurants, menus), 2) Implémenter pagination optimisée avec @QueryHint, 3) Ajouter index database sur colonnes de recherche fréquente, 4) Créer métriques Micrometer personnalisées (temps réponse, commandes/min), 5) Configurer health checks personnalisés pour chaque domaine, 6) Ajouter logging structuré JSON en production, 7) Implémenter rate limiting sur les APIs publiques, 8) Ajouter monitoring des événements CDI, 9) Optimiser les requêtes N+1 avec @EntityGraph, 10) Configurer connection pooling optimale.
- **Mise à jour du fichier contexte** : Oui, ajouter la section optimisation et monitoring.
- **Message de commit** : "Add performance optimization: caching, monitoring, database tuning"

### 16. Valider l'intégration Frontend Web et Mobile
- **Description courte** : Vérifier et adapter l'intégration entre les APIs backend et les applications frontend existantes.
- **Prompt à exécuter** : Valider et corriger l'intégration frontend-backend. 1) Analyser les applications frontend existantes (apps/web et apps/mobile), 2) Vérifier la compatibilité des APIs REST avec les appels frontend, 3) Corriger les endpoints manquants ou incompatibles, 4) Tester l'authentification end-to-end depuis les frontends, 5) Valider les flux de données (création commande, statuts, notifications), 6) Ajuster CORS si nécessaire pour le développement, 7) Créer documentation API OpenAPI complète, 8) Tester les notifications push sur mobile, 9) Valider l'interface web restaurant, 10) Corriger les bugs d'intégration identifiés.
- **Mise à jour du fichier contexte** : Oui, marquer l'intégration frontend comme "✅ VALIDÉE".
- **Message de commit** : "Validate and fix frontend integration: web and mobile apps connected"

### 17. Finaliser la configuration Production
- **Description courte** : Préparer la configuration de production avec sécurité, performance et déploiement optimisés.
- **Prompt à exécuter** : Finaliser la configuration production. 1) Compléter application-prod.yml avec toutes les propriétés production, 2) Configurer la sécurité Keycloak complète (realm, clients, rôles), 3) Optimiser la configuration database pour production (pool size, timeouts), 4) Configurer les secrets externes (variables d'environnement), 5) Ajouter configuration SSL/TLS, 6) Préparer Dockerfile optimisé pour build natif, 7) Configurer logging production (rotation, niveau), 8) Ajouter configuration backup database, 9) Créer scripts de déploiement et migration, 10) Documenter les prérequis production.
- **Mise à jour du fichier contexte** : Oui, marquer la configuration production comme "✅ PRÊTE".
- **Message de commit** : "Finalize production configuration: security, performance, deployment"

---

## Résumé par priorité

### 🚨 **CRITIQUE (Sprint 1)**
- Tâches 1-2 : Correction architecture et compilation
- Tâches 3-6 : Persistance database complète

### ⚡ **HAUTE (Sprint 2)**
- Tâches 7-8 : Intégration événementielle et APIs
- Tâche 9 : Sécurité et authentification

### 🎯 **MOYENNE (Sprint 3)**
- Tâches 10-12 : Logique métier avancée
- Tâche 13 : Notifications push
- Tâche 14 : Tests complets

### 🏁 **FINALISATION (Sprint 4)**
- Tâches 15-17 : Performance, intégration frontend, production

**Total estimé** : 4 sprints de développement pour MVP complet et prêt pour production.

---

## Notes importantes

1. **Architecture** : Le projet doit suivre uniquement le pattern DDD + Event-Driven pour cohérence
2. **Persistance** : Tous les domaines doivent utiliser PanacheRepository + PostgreSQL  
3. **Tests** : Couverture minimale 80% requise avant production
4. **Sécurité** : Authentification obligatoire en production avec rôles appropriés
5. **Performance** : Caching et optimisation database critiques pour l'expérience utilisateur