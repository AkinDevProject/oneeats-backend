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

```
oneeats-backend/
├── src/main/java/com/oneeats/          # Backend Quarkus
│   ├── admin/                          # Domaine administration
│   ├── user/                           # Domaine utilisateurs
│   ├── restaurant/                     # Domaine restaurants  
│   ├── menu/                           # Domaine menus
│   ├── order/                          # Domaine commandes
│   └── notification/                   # Domaine notifications
├── apps/web/                           # Frontend restaurant (React)
└── apps/mobile/                        # Frontend client (React Native)
```

### 3.2 Stack technologique

#### Backend
- **Framework** : Quarkus 3.24.2 + Java 21
- **Base de données** : PostgreSQL 15 avec Hibernate/Panache
- **API** : REST avec Jackson (quarkus-rest-jackson)
- **Validation** : Hibernate Validator
- **Tests** : JUnit 5 + RestAssured + Jacoco
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

### 3.3 Architecture hexagonale détaillée

Chaque domaine métier suit la structure :

```
domain/
├── api/                               # Couche Application (ports)
│   ├── cqrs/                         # Commands et Queries (CQRS)
│   ├── interface_/                   # Interfaces repository 
│   └── model/                        # DTOs
├── adapter/                          # Couche Infrastructure
│   └── web/                          # REST Controllers
└── internal/                         # Couche Domaine
    ├── application/                  # Use Cases métier
    ├── client/                       # Implémentations repository
    ├── entity/                       # Entités métier
    └── mapper/                       # Mappers DTO ↔ Entity
```

**Patterns utilisés :**
- **CQRS** : Séparation commandes/requêtes
- **Repository** : Abstraction de la persistance
- **Use Case** : Logique métier encapsulée  
- **Mapper** : Transformation DTO ↔ Domain
- **Dependency Injection** : CDI/Arc Quarkus

---

## 4. Domaines métier

### 4.1 Admin
- **Entité** : `Admin` (id, nom, email, role)
- **Use Cases** : CRUD complet + authentification
- **Repository** : InMemoryAdminRepository (MVP)

### 4.2 User  
- **Entité** : `User` (id, nom, email, telephone)
- **Use Cases** : CRUD utilisateurs clients
- **Repository** : InMemoryUserRepository (MVP)

### 4.3 Restaurant
- **Entité** : `Restaurant` (id, nom, description, adresse, horaires)
- **Value Objects** : `Adresse` (rue, ville, codePostal)
- **Use Cases** : CRUD + validation restaurant
- **Repository** : InMemoryRestaurantRepository (MVP)

### 4.4 Menu
- **Entité** : `MenuItem` (id, nom, description, prix, category, restaurantId)
- **Use Cases** : CRUD articles menu par restaurant
- **Repository** : InMemoryMenuRepository (MVP)

### 4.5 Order
- **Entités** : `Order` (commande) + `OrderItem` (article commandé)
- **Statuts** : En attente → En préparation → Prête → Récupérée → Annulée
- **Use Cases** : Création, suivi, mise à jour statuts
- **Repository** : InMemoryOrderRepository (MVP)

### 4.6 Notification
- **Entité** : `Notification` (id, titre, message, userId, type, read)
- **Use Cases** : Envoi notifications, marquage lecture
- **Service** : Interface pour notifications push future
- **Repository** : InMemoryNotificationRepository (MVP)

---

## 5. Configuration et environnements

### 5.1 Base de données
- **Développement** : PostgreSQL via Docker (port 5432)
- **Connexion** : `oneeats_dev` / `oneeats_user` / `oneeats_password`
- **Admin** : PgAdmin sur http://localhost:5050
- **Migration** : Script init.sql pour setup initial

### 5.2 Applications
- **Backend** : http://localhost:8080
- **Frontend Web** : Servi via Quinoa depuis le backend
- **Mobile** : Expo Development Server
- **API Docs** : http://localhost:8080/q/swagger-ui (si activé)

### 5.3 Profils
- **Développement** : application-dev.yml (hot reload, debug)
- **Production** : application-prod.yml (optimisations)
- **Test** : application-test.yml (H2 in-memory)

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

### 7.1 Setup projet
```bash
# Démarrage base de données
docker-compose -f docker-compose.dev.yml up -d

# Backend (avec frontend web intégré)
./mvnw quarkus:dev                    # Linux/Mac  
mvnw.cmd quarkus:dev                  # Windows

# Mobile (séparément)
cd apps/mobile && npm start
```

### 7.2 Structure des tâches
1. **Nouveaux domaines** : Suivre l'architecture hexagonale existante
2. **Nouvelles fonctionnalités** : Créer Use Cases + Tests + Controllers
3. **Migration données** : Utiliser scripts SQL pour évolution schéma
4. **Documentation** : Tenir ce fichier à jour pour chaque évolution

---

## 8. Objectifs pour l'IA (Claude Code)

### 8.1 Compréhension du contexte
- **Architecture** : Respecter la structure hexagonale et DDD
- **Patterns** : Utiliser CQRS, Repository, Use Case
- **Technologies** : Maîtriser la stack Quarkus/React/React Native

### 8.2 Génération de code
- **Backend** : Créer domaines complets avec couches API/Internal/Adapter
- **Frontend** : Respecter les conventions React/TypeScript existantes
- **Tests** : Générer tests unitaires et d'intégration appropriés

### 8.3 Évolution du projet
- **Nouvelles fonctionnalités** : Suivre les patterns établis
- **Refactoring** : Maintenir la cohérence architecturale
- **Documentation** : Mettre à jour ce contexte.md si nécessaire

---

## 9. État actuel (MVP)

### 9.1 Implémenté
✅ **Architecture** : Structure hexagonale complète  
✅ **Domaines** : 6 domaines métier avec CRUD de base  
✅ **Frontend Web** : Interface restaurant basique  
✅ **Frontend Mobile** : Application client avec panier/commandes  
✅ **Base de données** : Setup PostgreSQL + Docker  

### 9.2 En cours / À développer
🔨 **Authentification** : Keycloak integration  
🔨 **Notifications** : Push notifications Expo  
🔨 **Tests** : Couverture tests complète  
🔨 **Persistence** : Migration vers repositories JPA/Hibernate  
🔨 **Validation** : Business rules et contraintes métier  

### 9.3 Prochaines étapes
📋 **Authentification** Google/Apple via Keycloak  
📋 **Notifications** temps réel pour nouvelles commandes  
📋 **Statistiques** dashboard administrateur  
📋 **Recherche** avancée restaurants/menus  
📋 **Gestion d'images** upload photos plats/restaurants  

Le projet OneEats suit une architecture moderne, scalable et maintenable, prêt pour une évolution progressive vers une plateforme complète de commande alimentaire.