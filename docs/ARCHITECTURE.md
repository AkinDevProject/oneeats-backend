# OneEats - Guide Complet du Projet

Guide principal pour comprendre et développer sur la plateforme OneEats.

## 🎯 Objectif du Projet

OneEats est une **plateforme de commande de plats à récupérer sur place** (MVP).  
Les objectifs principaux sont :
- Permettre aux **clients** de commander facilement via une application mobile
- Permettre aux **restaurants** de gérer leurs menus et commandes via une interface web
- Permettre aux **administrateurs** de gérer la plateforme et consulter les statistiques

**Vision MVP** : Pas de livraison, pas de paiement en ligne - uniquement la récupération sur place avec paiement sur place.

---

## 🏗️ Architecture Technique

### Architecture Générale
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
│   ├── restaurant/                    # Domaine Restaurants
│   ├── menu/                          # Domaine Menus
│   ├── admin/                         # Domaine Administration
│   └── notification/                  # Domaine Notifications
├── src/main/resources/
│   ├── application.yml                # Configuration principale
│   ├── application-dev.yml            # Configuration développement
│   ├── application-prod.yml           # Configuration production
│   └── import-dev.sql                 # Données de test
├── apps/web/                          # Frontend restaurant (React)
└── apps/mobile/                       # Frontend client (React Native)
```

### Stack Technologique

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

---

## 🏢 Acteurs et Fonctionnalités

### Acteurs Principaux
- **Client** : Consulte les restaurants, passe des commandes, récupère sur place
- **Restaurant** : Gère son menu, ses commandes et son profil  
- **Administrateur** : Supervise la plateforme, gère les comptes restaurants, accède aux statistiques

### Fonctionnalités

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

## 🔧 Commandes de Développement

### Backend (Quarkus)
```bash
# Start development server with hot reload
./mvnw quarkus:dev        # Linux/Mac
mvnw.cmd quarkus:dev      # Windows

# Run tests
./mvnw test

# Build for production
./mvnw clean package

# Build native executable
./mvnw package -Dnative
```

### Web Frontend (React/Vite)
```bash
cd apps/web

# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Mobile App (React Native/Expo)
```bash
cd apps/mobile

# Start Expo development server
npm start

# Start for Android
npm run android

# Start for iOS
npm run ios

# Start for web
npm run web

# Lint code
npm run lint
```

### Database Setup
```bash
# Start PostgreSQL + PgAdmin with Docker
docker-compose -f docker-compose.dev.yml up -d

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Full Application Setup
```bash
# Quick setup (Windows)
start-dev.bat

# Quick setup (Linux/Mac)
./start-dev.sh
```

---

## 🏗️ Architecture Monolithique Modulaire

### Structure du Code Source Organisé par Domaines
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

### Exemple Complet : Domaine Order
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

### Avantages du Monolith Modulaire
- **Simplicité** : Un seul POM Maven, déploiement unique
- **Performance** : Pas de latence réseau entre modules
- **Développement** : Hot reload et debug plus faciles
- **Transactions** : Transactions ACID simples sur toute l'application
- **Organisation** : Code structuré par domaines métier
- **Évolutivité** : Possible migration vers microservices si nécessaire

---

## 📦 Domaines Métier

### Common (com.oneeats.common)
- **BaseEntity** : Classe abstraite avec UUID, timestamps et audit JPA
- **DomainEvent** : Interface pour événements métier avec CDI
- **BusinessException** : Exception de base pour erreurs métier

### Order (com.oneeats.order) ✅ COMPLET
- **Entités** : `Order` (aggregate root), `OrderItem`
- **State Machine** : `OrderStatus` (EN_ATTENTE → EN_PREPARATION → PRETE → RECUPEREE)
- **Événements** : `OrderCreatedEvent`, `OrderStatusChangedEvent`
- **Services** : `OrderService` pour use cases métier
- **API REST** : Controller complet `/api/orders`
- **Repository** : `OrderRepository` PanacheRepository

### User (com.oneeats.user) ✅ STRUCTURE CRÉÉE
- **Entité** : `User` avec authentification
- **Propriétés** : email, passwordHash, firstName, lastName, phone, address
- **API REST** : CRUD `/api/users` avec recherche
- **Repository** : Requêtes par email, recherche, comptage

### Restaurant (com.oneeats.restaurant) 🔨 PARTIELLEMENT CRÉÉ
- **Entité** : `Restaurant` avec gestion d'état
- **Propriétés** : nom, description, adresse, cuisineType, rating
- **État** : isOpen, isActive
- **À compléter** : API REST, Repository, Mapper

### Menu (com.oneeats.menu) 🔨 PARTIELLEMENT CRÉÉ
- **Entité** : `MenuItem` avec options diététiques
- **Propriétés** : nom, description, prix, category, restaurantId
- **Options** : isVegetarian, isVegan, allergens, preparationTime
- **À compléter** : API REST, Repository, Mapper

### Admin (com.oneeats.admin) 🔨 À CRÉER
- **Entité** : `Admin` avec permissions
- **Use Cases** : Gestion restaurants, supervision commandes

### Notification (com.oneeats.notification) 🔨 À CRÉER  
- **Entité** : `Notification` pour messages push
- **Use Cases** : Notifications commandes, push mobile Expo

---

## ⚙️ Configuration et Environnements

### Configuration
- **Développement** : PostgreSQL via Docker (port 5432)
- **Connexion** : `oneeats_dev` / `oneeats_user` / `oneeats_password`
- **Admin** : PgAdmin sur http://localhost:5050
- **Schema** : Génération automatique avec Hibernate

### Applications et Services
- **Backend principal** : http://localhost:8080
- **Frontend Web** : Intégré via Quinoa depuis le backend  
- **Mobile** : Expo Development Server
- **API Documentation** : http://localhost:8080/q/swagger-ui
- **Health Check** : http://localhost:8080/q/health
- **Métriques** : http://localhost:8080/q/metrics

### Profils de Configuration
- **Développement** (application-dev.yml) : Hot reload, logs DEBUG, drop-and-create DB
- **Production** (application-prod.yml) : Package natif, logs JSON, validation schéma
- **Test** (à créer) : Base H2 en mémoire, données isolées

---

## 📋 Standards et Conventions

### Code
- **Java** : Conventions Oracle, CamelCase
- **TypeScript** : ESLint + Prettier, camelCase
- **Base de données** : snake_case pour tables/colonnes
- **UUID** : Identifiants uniques pour toutes les entités

### API REST
- **Endpoints** : `/api/{domain}` (ex: /api/restaurants)
- **HTTP Methods** : GET/POST/PUT/DELETE standards
- **Réponses** : DTOs JSON + codes HTTP appropriés
- **Validation** : Bean Validation côté backend

### Tests
- **Backend** : Tests unitaires (Use Cases) + intégration (REST)
- **Coverage** : Jacoco pour métriques de couverture  
- **Frontend** : Tests composants (à implémenter)

---

## 🚀 Workflow de Développement

### Setup Projet
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
```

### Développement de Nouveaux Domaines
1. **Structure package** : Créer `com.oneeats.[domaine]` avec sous-packages api, domain, infrastructure
2. **Domaine** : Créer entités + services + événements dans `domain/`
3. **API** : Créer DTOs de requête/réponse dans `api/`
4. **Infrastructure** : Créer repository + controller + mapper dans `infrastructure/`
5. **Tests** : Tests unitaires domaine + tests intégration REST
6. **Hot Reload** : Quarkus recharge automatiquement les nouveaux packages

### Patterns à Suivre
- **Entités** : Hériter de `BaseEntity` pour UUID/timestamps automatiques
- **Repository** : Étendre `PanacheRepository<Entity, UUID>` avec méthodes métier
- **Controllers** : `@Path("/api/domaine")` avec validation Bean et gestion erreurs
- **Services** : Logique métier avec événements CDI (@Event/@Observes)
- **Mappers** : Conversion bidirectionnelle Entity ↔ DTO avec @ApplicationScoped
- **Events** : Créer événements métier + handlers pour actions automatiques
- **Validation** : Bean Validation sur DTOs + logique métier dans entités

### Patterns Obligatoires à Respecter
- **BaseEntity** : Toutes les entités héritent pour UUID/audit/equals/hashCode
- **PanacheRepository** : Interface avec méthodes finder personnalisées métier
- **CDI Events** : Événements métier avec @Event/@Observes pour découplage
- **Records DTOs** : Java records pour immutabilité et concision
- **Bean Validation** : Validation déclarative sur DTOs + validation métier entités
- **Hexagonal** : Séparation stricte API (contrats) / Domain (métier) / Infrastructure (technique)

---

## 📊 État Actuel de l'Implémentation

### ✅ Complètement Implémenté
- **Architecture monolithique modulaire** : POM unique, structure packages, hot reload
- **Domaine Order** : Référence complète avec entités, services, API REST, événements
- **Domaine User** : Structure complète avec authentification et gestion profil
- **Configuration et sécurité** : Keycloak OIDC, base PostgreSQL, données de test

### 🔨 Partiellement Implémenté
- **Domaine Restaurant** : Entité avec logique métier, manque API REST/Repository/Mapper
- **Domaine Menu** : Entité avec options diététiques, manque API REST/Repository/Mapper

### 🔨 À Créer
- **Domaines restants** : Admin (administration), Notification (push notifications)
- **Frontend existant** : Apps web/mobile à connecter aux nouvelles APIs REST

### 🚀 Prochaines Étapes Prioritaires
1. **Compléter Restaurant** : API REST + Repository + Mapper
2. **Compléter Menu** : API REST + Repository + Mapper  
3. **Créer Admin** : Domaine complet pour administration
4. **Créer Notification** : Push notifications + gestion événements
5. **Tests complets** : Coverage pour tous les domaines
6. **Frontend integration** : Adapter apps web/mobile aux nouvelles APIs

### 📱 Nouvelles Fonctionnalités Mobile Ajoutées
- **Paramètres Avancés Complets** : SettingsContext avec persistance, préférences alimentaires, notifications push, confidentialité
- **Système de Notifications Push Expo** : Configuration complète, templates, historique, intégration OrderContext
- **Optimisations de Performance Mobile** : Hooks de monitoring, composants optimisés, contextes performants, lazy loading

---

## 🎯 Objectifs Long Terme
- **Notifications temps réel** : WebSocket + push Expo intégrés
- **Monitoring avancé** : Métriques détaillées Prometheus + dashboards
- **Recherche avancée** : Recherche full-text restaurants + menus
- **Gestion d'images** : Upload + optimisation automatique photos
- **Analytics** : Dashboard administrateur avec KPIs complets

**🏆 Le projet OneEats dispose maintenant d'une architecture monolithique moderne, performante et maintenable avec des optimisations de performance mobile avancées. La structure modulaire par packages facilite le développement tout en gardant la simplicité d'un déploiement unique.**