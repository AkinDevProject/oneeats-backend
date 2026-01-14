# Architecture OneEats

Vue d'ensemble de l'architecture technique du projet OneEats.

---

## Table des matieres

- [Vue d'ensemble](#vue-densemble)
- [Stack Technologique](#stack-technologique)
- [Structure du Code](#structure-du-code)
- [Domaines Metier](#domaines-metier)
- [Documents Detailles](#documents-detailles)

---

## Vue d'ensemble

**Type** : Monorepo avec architecture hexagonale/DDD
**Structure** : Monolithe modulaire avec separation par domaines

```
oneeats-backend/
├── src/main/java/com/oneeats/    # Backend Quarkus (Hexagonal)
│   ├── common/                   # Utilitaires partages
│   ├── order/                    # Domaine Commandes
│   ├── user/                     # Domaine Utilisateurs
│   ├── restaurant/               # Domaine Restaurants
│   ├── menu/                     # Domaine Menus
│   ├── admin/                    # Domaine Administration
│   └── notification/             # Domaine Notifications
├── apps/web/                     # Dashboard React (Quinoa)
└── apps/mobile/                  # App React Native (Expo)
```

---

## Stack Technologique

### Backend

| Composant | Technologie |
|-----------|-------------|
| Framework | Quarkus 3.24.2 + Java 21 |
| Architecture | Hexagonale + DDD |
| Base de donnees | PostgreSQL 15 + Hibernate |
| API | REST + Jackson |
| Securite | Keycloak OIDC |
| Validation | Bean Validation |
| Tests | JUnit 5 + RestAssured |

### Frontend Web

| Composant | Technologie |
|-----------|-------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5.4 (via Quinoa) |
| Styling | Tailwind CSS |
| Navigation | React Router DOM |

### Frontend Mobile

| Composant | Technologie |
|-----------|-------------|
| Framework | React Native + Expo |
| Navigation | Expo Router |
| State | TanStack Query + AsyncStorage |
| UI | React Native Paper |

---

## Structure du Code

### Pattern Hexagonal par Domaine

```
[domaine]/
├── api/                    # Contrats et DTOs
│   ├── CreateXxxRequest.java
│   └── XxxDto.java
├── domain/                 # Logique metier
│   ├── Xxx.java           # Entite
│   ├── XxxService.java    # Service metier
│   └── events/            # Evenements domaine
└── infrastructure/         # Implementation technique
    ├── XxxRepository.java
    ├── XxxResource.java   # REST Controller
    └── XxxMapper.java
```

### Exemple : Domaine Order

```
order/
├── api/
│   ├── CreateOrderRequest.java
│   ├── OrderDto.java
│   └── UpdateOrderStatusRequest.java
├── domain/
│   ├── Order.java              # Aggregate root
│   ├── OrderItem.java
│   ├── OrderStatus.java        # State machine
│   ├── OrderService.java
│   └── events/
│       ├── OrderCreatedEvent.java
│       └── OrderStatusChangedEvent.java
└── infrastructure/
    ├── OrderRepository.java
    ├── OrderResource.java
    ├── OrderMapper.java
    └── OrderEventHandler.java
```

---

## Domaines Metier

| Domaine | Package | Statut |
|---------|---------|--------|
| Order | `com.oneeats.order` | Complet |
| User | `com.oneeats.user` | Complet |
| Restaurant | `com.oneeats.restaurant` | Complet |
| Menu | `com.oneeats.menu` | Complet |
| Admin | `com.oneeats.admin` | Partiel |
| Notification | `com.oneeats.notification` | Partiel |

---

## Documents Detailles

| Document | Description |
|----------|-------------|
| **[hexagonal-guide.md](hexagonal-guide.md)** | Guide complet DDD/Architecture Hexagonale |
| **[target-architecture.md](target-architecture.md)** | Architecture cible avec diagrammes C4 |
| **[implementation-status.md](implementation-status.md)** | Statut d'implementation |

---

## Patterns Obligatoires

### Entites

- Heriter de `BaseEntity` (UUID, timestamps, audit)
- Validation metier dans l'entite

### Repositories

- Etendre `PanacheRepository<Entity, UUID>`
- Methodes finder personnalisees

### Controllers REST

- `@Path("/api/domaine")`
- Bean Validation sur DTOs
- Gestion erreurs centralisee

### Services

- Logique metier avec CDI Events
- `@Event` pour publier, `@Observes` pour reagir

### DTOs

- Java Records pour immutabilite
- Validation declarative

---

## Configuration

### URLs de Developpement

| Service | URL |
|---------|-----|
| API Backend | http://localhost:8080/api |
| Dashboard Web | http://localhost:8080/restaurant |
| Swagger UI | http://localhost:8080/q/swagger-ui |
| Health | http://localhost:8080/q/health |
| Metrics | http://localhost:8080/q/metrics |

### Base de Donnees

```
Host: localhost:5432
Database: oneeats_dev
User: oneeats_user
Password: oneeats_password
```

---

**Derniere mise a jour** : 2026-01-14
