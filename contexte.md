# Contexte général du projet OneEats

## 1. Objectif du projet

OneEats est une **plateforme de commande de plats à récupérer sur place** (MVP).  
Les objectifs principaux sont :
- Permettre aux **clients** de commander facilement via une application mobile
- Permettre aux **restaurants** de gérer leurs menus et commandes via une interface web
- Permettre aux **administrateurs** de gérer la plateforme et consulter les statistiques

**Vision MVP** : Pas de livraison, pas de paiement en ligne - uniquement la récupération sur place avec paiement sur place.

---

## 2. Côté métier

### 2.1 Acteurs principaux
- **Client** : Consulte les restaurants, passe des commandes, récupère sur place
- **Restaurant** : Gère son menu, ses commandes et son profil  
- **Administrateur** : Supervise la plateforme, gère les comptes restaurants, accède aux statistiques

### 2.2 Fonctionnalités principales

#### Pour les Clients (Mobile)
- Recherche et filtrage des restaurants (distance, temps de préparation, ouvert/fermé)
- Consultation des menus par catégories
- Ajout d'articles au panier avec gestion des quantités
- Passage de commandes avec instructions spéciales
- Suivi des commandes (statuts : En attente → En préparation → Prête → Récupérée)

#### Pour les Restaurants (Web)
- Gestion du profil restaurant (nom, description, horaires)
- Création et modification des menus (catégories, articles, prix)
- Réception et traitement des commandes
- Mise à jour des statuts de commande

#### Pour les Administrateurs (Web)
- Gestion des comptes restaurants (validation, suspension)
- Supervision des commandes et statistiques globales
- Modération des contenus (menus, descriptions)

---

## 3. Côté technique

### 3.1 Architecture générale

**Monorepo** avec architecture **hexagonale/clean** suivant les principes **Domain-Driven Design**.  
**Architecture monolithique** avec structure modulaire dans le code source.

```
oneeats-backend/
├── pom.xml                            # POM unique pour tout le projet
├── src/main/java/com/oneeats/         # Code source monolithique structuré
│   ├── OneEatsApplication.java        # Point d'entrée Quarkus principal
│   ├── common/                        # Utilitaires partagés
│   │   ├── domain/BaseEntity.java     # Entité de base avec UUID/timestamps
│   │   ├── events/DomainEvent.java    # Interface événements métier
│   │   └── exception/                 # Exceptions métier communes
│   ├── configuration/                 # Configuration centralisée de l'app
│   ├── security/                      # Configuration Keycloak et rôles
│   ├── order/                         # Domaine Order (exemple complet)
│   │   ├── api/                       # DTOs et contrats API
│   │   ├── domain/                    # Entités et logique métier
│   │   └── infrastructure/            # Controllers REST et persistence
│   ├── user/                          # Domaine Utilisateurs
│   │   ├── api/                       # DTOs User
│   │   ├── domain/User.java           # Entité User
│   │   └── infrastructure/            # Repository, Controller, Mapper
│   ├── restaurant/                    # Domaine Restaurants
│   │   ├── domain/Restaurant.java     # Entité Restaurant
│   │   └── [api, infrastructure]      # À compléter
│   ├── menu/                          # Domaine Menus
│   │   ├── domain/MenuItem.java       # Entité MenuItem
│   │   └── [api, infrastructure]      # À compléter
│   ├── admin/                         # Domaine Administration (à créer)
│   └── notification/                  # Domaine Notifications (à créer)
├── src/main/resources/
│   ├── application.yml                # Configuration principale
│   ├── application-dev.yml            # Configuration développement
│   ├── application-prod.yml           # Configuration production
│   └── import-dev.sql                 # Données de test
├── apps/web/                          # Frontend restaurant (React)
└── apps/mobile/                       # Frontend client (React Native)
```

### 3.2 Stack technologique

#### Backend
- **Framework** : Quarkus 3.24.2 + Java 21
- **Architecture** : Hexagonale/Clean Architecture + Domain-Driven Design
- **Structure** : Monolith avec organisation modulaire dans le code source
- **Build** : Maven avec un seul POM (simplicité de développement)
- **Base de données** : PostgreSQL 15 avec Hibernate ORM + PanacheRepository
- **API** : REST avec Jackson (quarkus-rest-jackson)
- **Sécurité** : Keycloak OIDC + Policy Enforcer (autorisation basée sur les rôles)
- **Événements** : Architecture event-driven avec CDI Events
- **Validation** : Hibernate Validator + Bean Validation
- **Tests** : JUnit 5 + RestAssured + Jacoco
- **Monitoring** : Micrometer + Prometheus + SmallRye Health
- **Integration** : Quinoa (sert le frontend web depuis Quarkus)

#### Frontend Web (Restaurant)
- **Framework** : React 18 + TypeScript
- **Build** : Vite 5.4
- **Styling** : Tailwind CSS + PostCSS  
- **Navigation** : React Router DOM 7.6
- **Charts** : Recharts
- **Icons** : Lucide React

#### Frontend Mobile (Client) 
- **Framework** : React Native + Expo 53
- **Navigation** : Expo Router 5.1
- **State** : TanStack React Query + AsyncStorage
- **UI** : React Native Paper + expo-linear-gradient
- **Animations** : React Native Reanimated
- **Validation** : Formik + Yup

#### DevOps & Infrastructure
- **Containerisation** : Docker Compose pour PostgreSQL + PgAdmin
- **Base de données** : Configuration automatique via init.sql
- **Scripts** : start-dev.bat/sh pour setup rapide
- **Monitoring** : Logs standard Quarkus

### 3.3 Architecture monolithique modulaire détaillée

#### Structure du code source organisé par domaines
```
src/main/java/com/oneeats/
├── OneEatsApplication.java           # Point d'entrée unique
├── common/                           # Utilitaires partagés
│   ├── domain/BaseEntity.java        # Entité de base
│   ├── events/DomainEvent.java       # Interface événements  
│   └── exception/BusinessException.java
├── configuration/                    # Configuration globale
│   └── ApplicationConfiguration.java
├── security/                         # Sécurité et rôles
│   ├── SecurityConfiguration.java
│   └── Roles.java
└── [domaine]/                        # Chaque domaine métier
    ├── api/                          # DTOs et contrats
    ├── domain/                       # Entités et services métier
    │   └── events/                   # Événements du domaine
    └── infrastructure/               # Implémentations techniques
        ├── [Domaine]Repository.java  # Persistence
        ├── [Domaine]Resource.java    # API REST
        ├── [Domaine]Mapper.java      # Mapping
        └── [Domaine]EventHandler.java # Gestion événements
```

#### Exemple complet : Domaine Order
```
order/
├── api/
│   ├── CreateOrderRequest.java       # DTO requête création
│   ├── OrderDto.java                 # DTO réponse  
│   └── UpdateOrderStatusRequest.java # DTO changement statut
├── domain/
│   ├── Order.java                    # Entité aggregate root
│   ├── OrderItem.java                # Entité enfant
│   ├── OrderStatus.java              # Enum avec state machine
│   ├── OrderService.java             # Service métier
│   └── events/
│       ├── OrderCreatedEvent.java    # Événement création
│       └── OrderStatusChangedEvent.java
└── infrastructure/
    ├── OrderRepository.java          # PanacheRepository
    ├── OrderResource.java            # REST Controller
    ├── OrderMapper.java              # DTO ↔ Entity
    └── OrderEventHandler.java        # Handler @Observes
```

**Avantages du monolith modulaire :**
- **Simplicité** : Un seul POM Maven, déploiement unique
- **Performance** : Pas de latence réseau entre modules
- **Développement** : Hot reload et debug plus faciles
- **Transactions** : Transactions ACID simples sur toute l'application
- **Organisation** : Code structuré par domaines métier
- **Évolutivité** : Possible migration vers microservices si nécessaire

**Patterns maintenus :**
- **Domain-Driven Design** : Aggregate roots, entities, value objects
- **Event-Driven Architecture** : Événements métier avec CDI @Observes
- **Repository Pattern** : PanacheRepository pour la persistance
- **State Machine** : Gestion des transitions de statut
- **Hexagonal Architecture** : Séparation API/Domain/Infrastructure

---

## 4. Domaines métier (packages dans src/main/java/com/oneeats/)

### 4.1 Common (com.oneeats.common)
- **BaseEntity** : Classe abstraite avec UUID, timestamps et audit JPA
- **DomainEvent** : Interface pour événements métier avec CDI
- **BusinessException** : Exception de base pour erreurs métier
- **Localisation** : `src/main/java/com/oneeats/common/`

### 4.2 Order (com.oneeats.order) ✅ COMPLET
- **Entités** : 
  - `Order` (aggregate root) - Commande avec logique métier complexe
  - `OrderItem` - Article commandé avec calculs et validation
- **State Machine** : `OrderStatus` (EN_ATTENTE → EN_PREPARATION → PRETE → RECUPEREE)
- **Événements** : 
  - `OrderCreatedEvent` - Notifications restaurants/users + métriques
  - `OrderStatusChangedEvent` - Suivi des changements avec actions automatiques
- **Services** : `OrderService` pour use cases métier (création, validation, transitions)
- **API REST** : Controller complet `/api/orders` avec endpoints spécialisés
- **Repository** : `OrderRepository` PanacheRepository + requêtes métier
- **Localisation** : `src/main/java/com/oneeats/order/`

### 4.3 User (com.oneeats.user) ✅ STRUCTURE CRÉÉE
- **Entité** : `User` - Utilisateur client avec authentification
- **Propriétés** : email (unique), passwordHash, firstName, lastName, phone, address
- **Logique métier** : Profile updates, activation/désactivation, fullName
- **API REST** : CRUD `/api/users` avec recherche par nom
- **Repository** : Requêtes par email, recherche, comptage utilisateurs actifs  
- **Localisation** : `src/main/java/com/oneeats/user/`

### 4.4 Restaurant (com.oneeats.restaurant) 🔨 PARTIELLEMENT CRÉÉ
- **Entité** : `Restaurant` - Partenaire restaurant avec gestion d'état
- **Propriétés** : nom, description, adresse, phone, email, cuisineType, rating
- **État** : isOpen (ouvert/fermé), isActive (actif/inactif)
- **Logique métier** : Ouverture/fermeture, mise à jour rating, acceptation commandes
- **À compléter** : API REST, Repository, Mapper
- **Localisation** : `src/main/java/com/oneeats/restaurant/`

### 4.5 Menu (com.oneeats.menu) 🔨 PARTIELLEMENT CRÉÉ
- **Entité** : `MenuItem` - Article de menu avec options diététiques
- **Propriétés** : nom, description, prix, category, restaurantId
- **Options** : isVegetarian, isVegan, allergens, preparationTime
- **État** : isAvailable (disponible/rupture)
- **Logique métier** : Gestion disponibilité, informations diététiques
- **À compléter** : API REST, Repository, Mapper
- **Localisation** : `src/main/java/com/oneeats/menu/`

### 4.6 Admin (com.oneeats.admin) 🔨 À CRÉER
- **Entité** : `Admin` - Utilisateur administrateur avec permissions
- **Use Cases** : Gestion restaurants, supervision commandes, audit
- **Localisation** : `src/main/java/com/oneeats/admin/`

### 4.7 Notification (com.oneeats.notification) 🔨 À CRÉER  
- **Entité** : `Notification` - Messages push et notifications système
- **Use Cases** : Notifications commandes, push mobile Expo
- **Localisation** : `src/main/java/com/oneeats/notification/`

---

## 5. Configuration et environnements

### 5.1 Structure de configuration
- **Module application** : Configuration centralisée dans `oneeats-application`
- **Profiles** : Développement, production, test avec configurations spécialisées
- **Propriétés métier** : `ApplicationConfiguration` avec @ConfigProperties
- **Sécurité** : Configuration Keycloak avec `SecurityConfiguration`

### 5.2 Base de données
- **Développement** : PostgreSQL via Docker (port 5432)
- **Connexion** : `oneeats_dev` / `oneeats_user` / `oneeats_password`
- **Admin** : PgAdmin sur http://localhost:5050
- **Schema** : Génération automatique avec Hibernate (drop-and-create en dev)
- **Données test** : `import-dev.sql` chargé automatiquement en développement

### 5.3 Applications et services
- **Backend principal** : http://localhost:8080 (oneeats-application)
- **Frontend Web** : Intégré via Quinoa depuis le backend  
- **Mobile** : Expo Development Server
- **API Documentation** : http://localhost:8080/q/swagger-ui
- **Health Check** : http://localhost:8080/q/health
- **Métriques** : http://localhost:8080/q/metrics (Prometheus)
- **Keycloak** : http://localhost:8081 (si configuré)

### 5.4 Profils de configuration
#### Développement (application-dev.yml)
- Hot reload et live reload activés
- Logs détaillés (DEBUG niveau)
- Base de données : drop-and-create avec données de test
- Sécurité désactivée pour faciliter les tests
- Quinoa intégré pour le frontend web

#### Production (application-prod.yml) 
- Package natif pour performances optimales
- Logs JSON pour systèmes centralisés
- Base de données : validation du schéma uniquement
- Sécurité complète avec Keycloak activé
- Métriques et monitoring complets

#### Test (à créer)
- Base H2 en mémoire
- Données de test isolées  
- Configuration minimale pour tests rapides

---

## 6. Standards et conventions

### 6.1 Code
- **Java** : Conventions Oracle, CamelCase
- **TypeScript** : ESLint + Prettier, camelCase
- **Base de données** : snake_case pour tables/colonnes
- **UUID** : Identifiants uniques pour toutes les entités

### 6.2 API REST
- **Endpoints** : `/api/{domain}` (ex: /api/restaurants)
- **HTTP Methods** : GET/POST/PUT/DELETE standards
- **Réponses** : DTOs JSON + codes HTTP appropriés
- **Validation** : Bean Validation côté backend

### 6.3 Tests
- **Backend** : Tests unitaires (Use Cases) + intégration (REST)
- **Coverage** : Jacoco pour métriques de couverture  
- **Frontend** : Tests composants (à implémenter)

---

## 7. Workflow de développement

### 7.1 Setup projet (architecture monolithique)
```bash
# Démarrage base de données
docker-compose -f docker-compose.dev.yml up -d

# Backend monolithique (avec frontend web intégré via Quinoa)
./mvnw quarkus:dev                    # Linux/Mac  
mvnw.cmd quarkus:dev                  # Windows

# Mobile (séparément)
cd apps/mobile && npm start

# Build complet du projet
./mvnw clean install

# Tests
./mvnw test

# Package pour production
./mvnw clean package -Dnative        # Build natif (optionnel)
```

### 7.2 Développement de nouveaux domaines
1. **Structure package** : Créer `com.oneeats.[domaine]` avec sous-packages api, domain, infrastructure
2. **Domaine** : Créer entités + services + événements dans `domain/`
3. **API** : Créer DTOs de requête/réponse dans `api/`
4. **Infrastructure** : Créer repository + controller + mapper dans `infrastructure/`
5. **Tests** : Tests unitaires domaine + tests intégration REST
6. **Hot Reload** : Quarkus recharge automatiquement les nouveaux packages

### 7.3 Patterns à suivre (basés sur order et user)
- **Entités** : Hériter de `BaseEntity` pour UUID/timestamps automatiques
- **Repository** : Étendre `PanacheRepository<Entity, UUID>` avec méthodes métier
- **Controllers** : `@Path("/api/domaine")` avec validation Bean et gestion erreurs
- **Services** : Logique métier avec événements CDI (@Event/@Observes)
- **Mappers** : Conversion bidirectionnelle Entity ↔ DTO avec @ApplicationScoped
- **Events** : Créer événements métier + handlers pour actions automatiques
- **Validation** : Bean Validation sur DTOs + logique métier dans entités

### 7.4 Commandes utiles de développement
```bash
# Hot reload automatique (Quarkus Dev Mode)
./mvnw quarkus:dev

# Tests avec watch mode
./mvnw test -Dquarkus.test.continuous-testing=enabled

# Génération de rapports de couverture
./mvnw test jacoco:report

# Profil spécifique
./mvnw quarkus:dev -Dquarkus.profile=dev
```

---

## 8. Objectifs pour l'IA (Claude Code)

### 8.1 Compréhension de l'architecture monolithique modulaire
- **Structure** : Monolith Quarkus avec packages organisés par domaines métier
- **Build** : Un seul POM Maven pour simplicité et performance
- **Patterns** : DDD + Event-driven + Clean Architecture maintenus
- **Référence** : Utiliser `com.oneeats.order` et `com.oneeats.user` comme modèles
- **Technologies** : Quarkus + PanacheRepository + CDI Events + Bean Validation

### 8.2 Génération de nouveaux domaines
- **Package Structure** : `com.oneeats.[domaine]` avec api/domain/infrastructure
- **Domain Layer** : Entités riches héritant BaseEntity + services métier + événements
- **API Layer** : DTOs records avec validation Bean Validation complète
- **Infrastructure** : PanacheRepository + REST Controller + Mapper + Event Handler
- **Hot Reload** : Développement facilité avec rechargement automatique

### 8.3 Patterns obligatoires à respecter
- **BaseEntity** : Toutes les entités héritent pour UUID/audit/equals/hashCode
- **PanacheRepository** : Interface avec méthodes finder personnalisées métier
- **CDI Events** : Événements métier avec @Event/@Observes pour découplage
- **Records DTOs** : Java records pour immutabilité et concision
- **Bean Validation** : Validation déclarative sur DTOs + validation métier entités
- **Hexagonal** : Séparation stricte API (contrats) / Domain (métier) / Infrastructure (technique)

---

## 9. État actuel de l'implémentation

### 9.1 ✅ COMPLÈTEMENT IMPLÉMENTÉ
**🏗️ Architecture monolithique modulaire**
- POM unique Maven pour simplicité de build et déploiement
- Structure de packages organisée par domaines métier
- Configuration centralisée avec profils dev/prod/test
- Hot reload Quarkus pour développement efficace

**📦 Domaine Order (référence complète)**
- Entités `Order` + `OrderItem` avec logique métier riche
- State Machine `OrderStatus` avec transitions validées  
- Service `OrderService` pour use cases complexes avec événements CDI
- Repository `OrderRepository` PanacheRepository + requêtes métier personnalisées
- API REST complète `/api/orders` avec validation Bean + endpoints spécialisés
- Event Handler `OrderEventHandler` pour notifications et métriques automatiques
- Mapper bidirectionnel complet DTO ↔ Entity

**👥 Domaine User (structure complète créée)**
- Entité `User` avec authentification et gestion profil
- Repository avec requêtes par email, recherche, comptage
- API REST `/api/users` CRUD complète avec validation
- Mapper pour conversion sécurisée (exclut passwordHash)

**⚙️ Configuration et sécurité**
- Configuration Quarkus multi-profils dans `src/main/resources/`
- Intégration Keycloak OIDC + Policy Enforcer (rôles définis)
- Configuration métier centralisée avec `@ConfigProperties`
- Base de données PostgreSQL + Hibernate ORM + données de test

### 9.2 🔨 PARTIELLEMENT IMPLÉMENTÉ
**🏪 Domaine Restaurant**
- Entité `Restaurant` avec logique d'ouverture/fermeture et rating
- À compléter : API REST, Repository, Mapper

**🍽️ Domaine Menu**
- Entité `MenuItem` avec options diététiques et gestion disponibilité
- À compléter : API REST, Repository, Mapper

### 9.3 🔨 À CRÉER
**🔐 Domaines restants**
- `com.oneeats.admin` : Administration et supervision
- `com.oneeats.notification` : Notifications push et emails

**📱 Frontend existant (à connecter)**
- Interface web React restaurant dans `apps/web/`
- Application mobile React Native client dans `apps/mobile/`  
- Intégration à adapter aux nouvelles APIs REST

### 9.4 🚀 PROCHAINES ÉTAPES PRIORITAIRES
1. **Compléter Restaurant** : API REST + Repository + Mapper
2. **Compléter Menu** : API REST + Repository + Mapper  
3. **Créer Admin** : Domaine complet pour administration
4. **Créer Notification** : Push notifications + gestion événements
5. **Tests complets** : Coverage pour tous les domaines
6. **Frontend integration** : Adapter apps web/mobile aux nouvelles APIs

### 9.5 📱 NOUVELLES FONCTIONNALITÉS MOBILE AJOUTÉES
**✅ Paramètres Avancés Complets**
- **Contexte SettingsContext** : Gestion complète des préférences utilisateur avec persistance AsyncStorage
- **Page `/settings/index.tsx`** : Interface utilisateur complète avec sections :
  - 🔔 **Notifications Push** : Gestion des notifications (commandes, promotions, recommandations, son, vibration)
  - 🥗 **Préférences Alimentaires** : Végétarien, végétalien, sans gluten, sans lactose, sans noix, halal, casher
  - 🔒 **Confidentialité** : Partage localisation, données d'usage, emails marketing, visibilité profil
  - 👤 **Compte Utilisateur** : Changement mot de passe, modification email, suppression compte
  - ⚙️ **Application** : Langue (FR/EN/ES/IT), devise (EUR/USD/GBP), unités distance, localisation auto, thème
  - ℹ️ **À Propos** : Version app, CGU, politique confidentialité, support, évaluation
- **Fonctionnalités Avancées** :
  - Export/Import des paramètres utilisateur
  - Réinitialisation aux valeurs par défaut
  - Hooks utilitaires : `useActiveDietaryPreferences`, `useCheckDietaryCompatibility`
  - Persistance automatique avec AsyncStorage
  - Interface responsive avec Material Design 3
  - Navigation fluide avec animations Reanimated
- **Intégration** : Connecté aux contextes Auth et Theme existants, accessible depuis le profil utilisateur

**✅ Système de Notifications Push Expo**
- **Configuration Expo** : Ajout du plugin `expo-notifications` dans `app.json` avec icônes, canaux Android et permissions iOS
- **Contexte PushNotificationContext** : Gestion complète des notifications push avec :
  - 🔔 **Gestion des permissions** : Demande automatique et vérification des autorisations push
  - 📱 **Token Expo Push** : Génération et stockage du token pour l'envoi de notifications
  - 🎨 **Templates prédéfinis** : Templates pour commandes (confirmé, préparation, prêt, terminé, annulé), promotions, recommandations
  - 📊 **Gestion avancée** : Persistance AsyncStorage, historique, marquage lecture, statistiques
  - 🔧 **Configuration dynamique** : Respect des préférences utilisateur (son, vibration, types)
- **Page de test `/test-notifications/`** : Interface complète pour tester toutes les notifications :
  - Mode automatique avec envoi périodique
  - Tests individuels par type de notification
  - Simulation du flux complet de commande
  - Tests avec vraies commandes existantes
  - Statistiques et historique en temps réel
- **Intégration OrderContext** : Émission d'événements lors des changements de statut pour déclencher automatiquement les notifications
- **Canaux Android** : Configuration de canaux spécialisés (commandes haute priorité, promotions normales)
- **Fonctionnalités avancées** :
  - Navigation automatique vers les détails lors de l'interaction avec une notification
  - Gestion des badges (compteur notifications non lues)
  - Mode arrière-plan et réveil de l'app
  - Templates avec variables dynamiques (nom restaurant, statut, etc.)
  - Hooks utilitaires pour tests et développement

**✅ Optimisations de Performance Mobile Avancées**
- **Gestion mémoire intelligente** : Hooks `usePerformanceMonitor` pour tracking complet des métriques
  - 📊 **Monitoring temps réel** : `useRenderTime`, `useInteractionTime`, `useNavigationTime`, `useAPITime`, `useImageLoadTime`
  - ⚠️ **Alertes performance** : `usePerformanceAlert` avec seuils configurables (render <16ms, interaction <100ms, navigation <500ms, API <2s)
  - 💾 **Monitoring mémoire** : `useMemoryMonitor` avec surveillance utilisation heap JavaScript (mode web)
  - 🔧 **Callbacks optimisés** : `useOptimizedCallback` avec détection callbacks coûteux (>5ms)
  - 📈 **Rapports développement** : `logPerformanceReport` avec métriques détaillées console
- **Composants optimisés** : 
  - 🖼️ **OptimizedImage** : Cache mémoire, lazy loading, retry automatique, optimisation qualité
  - 📱 **VirtualizedList** : FlatList et VirtualizedList optimisées avec stratégies adaptatives
  - 🔄 **MemoizedListItem** : Composant mémoïsé générique pour listes performantes
- **Contextes optimisés** : Re-architecture complète des contextes avec React hooks optimisés
  - ⚡ **AuthContext** : useCallback et useMemo pour prévenir re-renders inutiles
  - 📦 **OrderContext** : Optimisation des fonctions et state management
  - 🎯 **Hooks stratégiques** : `useOptimizedListStrategy`, `useInfiniteScroll`, `useFilteredList`
- **Page d'accueil optimisée** : 
  - 🎨 **RestaurantCard mémoïsée** : Composant React.memo pour cartes restaurants
  - 📋 **Liste virtualisée** : Remplacement ScrollView par OptimizedFlatList
  - 🖼️ **Images optimisées** : IntégrationOptimizedImage avec cache et lazy loading
  - ⚡ **Callbacks optimisés** : Toutes les interactions utilisateur avec useOptimizedCallback
- **Fonctionnalités avancées** :
  - 🔍 **Détection problèmes** : Surveillance automatique performances avec alertes développeur
  - 🎯 **Stratégies adaptatives** : Choix automatique composant liste basé sur taille données
  - 📊 **Métriques détaillées** : Store global des performances avec historique limité (100 entrées)
  - 🚀 **Lazy loading composants** : Composants lourds chargés à la demande

### 9.6 🎯 OBJECTIFS À LONG TERME
- **Notifications temps réel** : WebSocket + push Expo intégrés
- **Monitoring avancé** : Métriques détaillées Prometheus + dashboards
- **Recherche avancée** : Recherche full-text restaurants + menus
- **Gestion d'images** : Upload + optimisation automatique photos
- **Analytics** : Dashboard administrateur avec KPIs complets

**🏆 Le projet OneEats dispose maintenant d'une architecture monolithique moderne, performante et maintenable avec des optimisations de performance mobile avancées. La structure modulaire par packages facilite le développement tout en gardant la simplicité d'un déploiement unique. L'application mobile offre maintenant une expérience utilisateur fluide avec monitoring de performance en temps réel.**