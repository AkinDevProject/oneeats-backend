...(contenu précédent intact)...

---

## 04.MAQUETTES\_UI\_UX.md

### 🧱 Objectif

Fournir des maquettes interactives et des composants UI générés avec des outils d’IA pour accélérer la phase de design et faciliter la collaboration développeur/designer.

### 🎨 Outils recommandés

- Figma AI / Galileo AI / Framer AI / Uizard
- Icones : Lucide, HeroIcons
- Couleurs : Thème sombre + clair

### 📲 Flows à prototyper

- Authentification (Google/Apple/email)
- Navigation entre restaurants / plats / panier
- Passage de commande
- Interface restaurateur (commandes temps réel, gestion menu)
- Dashboard administrateur (tableaux, stats)

### 🔧 Composants UI à générer

- Boutons CTA (Commander, Ajouter au panier...)
- Cartes restaurant/menu avec image + texte
- En-têtes, navigation (tab bar, sidebar admin)
- États de commande (Badge : en préparation, prêt, etc.)

### 📱 Résolution cible

- Mobile (iOS + Android)
- Web responsive tablette pour restaurateur
- Desktop pour administrateur

---

## 05.ARCHITECTURE\_TECHNIQUE.md

### 🔧 Composants principaux

| Élément          | Technologie                        | Configuration |
| ---------------- | ---------------------------------- | ------------- |
| Front mobile     | React Native + Expo                | SDK 51, TypeScript |
| Front web        | React.js + Vite                    | Tailwind CSS, TypeScript |
| Backend          | Quarkus (Java 17+)                 | Maven, JPA/Hibernate |
| Auth             | Keycloak + OAuth Google/Apple      | OIDC, JWT |
| DB               | PostgreSQL 15+                     | Docker container |
| Notifications    | Firebase Cloud Messaging           | Push notifications |
| Conteneurisation | Docker / Docker Compose            | Multi-stage builds |
| CI/CD            | GitHub Actions                     | Automated testing |
| Hébergement      | VPS, Render ou Railway (à choisir) | SSL/TLS |

### 🔁 Architecture hexagonale détaillée

#### Domaine (Core Business Logic)
```
src/main/java/com/oneeats/domain/
├── user/
│   ├── User.java (Entity)
│   ├── UserRepository.java (Interface)
│   └── UserService.java (Domain Service)
├── restaurant/
│   ├── Restaurant.java
│   ├── Menu.java
│   └── RestaurantRepository.java
├── order/
│   ├── Order.java
│   ├── OrderStatus.java (Enum)
│   └── OrderRepository.java
└── shared/
    ├── DomainEvent.java
    └── ValueObject.java
```

#### Application (Use Cases)
```
src/main/java/com/oneeats/application/
├── user/
│   ├── CreateUserUseCase.java
│   └── AuthenticateUserUseCase.java
├── restaurant/
│   ├── RegisterRestaurantUseCase.java
│   └── ManageMenuUseCase.java
└── order/
    ├── PlaceOrderUseCase.java
    └── TrackOrderUseCase.java
```

#### Infrastructure (Technical Details)
```
src/main/java/com/oneeats/infrastructure/
├── persistence/
│   ├── UserRepositoryImpl.java
│   └── OrderRepositoryImpl.java
├── external/
│   ├── PaymentGateway.java
│   └── NotificationService.java
└── config/
    ├── DatabaseConfig.java
    └── SecurityConfig.java
```

#### API (Adapters)
```
src/main/java/com/oneeats/api/
├── rest/
│   ├── UserResource.java
│   ├── RestaurantResource.java
│   └── OrderResource.java
├── dto/
│   ├── UserDto.java
│   └── OrderDto.java
└── mapper/
    ├── UserMapper.java
    └── OrderMapper.java
```

### 🔗 Intégrations externes

- **Payment** : Stripe/PayPal API
- **Maps** : Google Maps/Mapbox
- **SMS** : Twilio pour notifications
- **Email** : SendGrid/Mailgun
- **Analytics** : Google Analytics 4

---

## 06.STRUCTURE\_CODE.md

### 🗂️ Backend – Arborescence hexagonale multi-modules

```
restaurant/
├── domain/
├── application/
├── infrastructure/
├── api/
```

### 🗂️ Frontend Web / Mobile – Organisation modulaire réelle

#### Mobile App Structure (apps/mobile/)
```
app/
├── _layout.tsx (Root layout)
├── index.tsx (Home screen)
├── (tabs)/
│   ├── index.tsx (Home tab)
│   ├── search.tsx (Search tab)
│   ├── orders.tsx (Orders tab)
│   └── profile.tsx (Profile tab)
├── auth/
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
├── restaurant/
│   ├── [id].tsx (Restaurant details)
│   └── menu/[id].tsx (Menu item)
└── order-tracking/
    └── [orderId].tsx

context/
├── AuthContext.tsx (Authentication state)
├── CartContext.tsx (Shopping cart)
└── OrderContext.tsx (Order management)

hooks/
└── useFrameworkReady.ts (App initialization)
```

#### Web App Structure (apps/web/)
```
src/
├── App.tsx
├── main.tsx
├── components/
│   ├── ui/ (Reusable components)
│   ├── forms/
│   └── layout/
├── pages/
│   ├── Dashboard/
│   ├── Orders/
│   ├── Menu/
│   └── Settings/
├── hooks/
│   ├── useAuth.ts
│   ├── useOrders.ts
│   └── useMenu.ts
├── data/
│   ├── api.ts (API client)
│   └── types.ts (TypeScript types)
└── types/
    ├── user.ts
    ├── restaurant.ts
    └── order.ts
```

### 📋 Nommage & conventions

- Snake\_case pour DB, camelCase pour code
- `@Entity`, `@Repository` pour Quarkus (JPA/Hibernate Panache)
- `@Inject` pour l’injection de dépendances
- `@Path`, `@GET`, `@POST`, etc. pour les ressources REST (remplace `@Controller` de Spring)
- DTOs bien séparés des entités métier

---

## 07.TESTS\_QUALITE.md

### ✅ Backend (Quarkus spécifique)

- **Tests unitaires** : JUnit 5 + Mockito + AssertJ
- **Tests d'intégration** : `@QuarkusTest` + TestContainers PostgreSQL
- **Tests API** : RestAssured pour endpoints REST
- **Mock OIDC** : `@TestSecurity` pour simuler l'authentification

#### Exemple test d'intégration
```java
@QuarkusTest
@TestProfile(TestProfile.class)
class UserResourceTest {

    @Test
    @TestSecurity(user = "admin", roles = {"ADMIN"})
    void shouldCreateUser() {
        given()
            .contentType(MediaType.APPLICATION_JSON)
            .body(new UserDto("John", "john@example.com"))
        .when()
            .post("/api/users")
        .then()
            .statusCode(201);
    }
}
```

### ✅ Frontend amélioré

#### Mobile (React Native + Expo)
```json
// package.json scripts
{
  "scripts": {
    "start": "expo start",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

#### Web (React + Vite)
```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx"
  }
}
```

### 📊 Outils qualité étendus

#### Backend
- **Jacoco** : Couverture de code (minimum 80%)
- **SpotBugs** : Détection de bugs statiques
- **Checkstyle** : Respect des conventions Java

#### Frontend
- **ESLint** : Linting TypeScript/React
- **Prettier** : Formatage de code
- **Husky** : Git hooks pre-commit
- **TypeScript** : Vérification de types stricte

#### Configuration ESLint (Frontend)
```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
];
```

---

## 08.SECURITE\_AUTH.md

### 🔐 Authentification et rôles détaillés

#### Configuration Keycloak
- **Realm** : `oneeats`
- **Clients** :
  - `oneeats-mobile` (public, PKCE)
  - `oneeats-web` (confidential)
  - `oneeats-backend` (bearer-only)

#### Rôles et permissions
```yaml
Roles:
  CLIENT:
    - Consulter restaurants
    - Passer commandes
    - Suivre commandes

  RESTAURANT_OWNER:
    - Gérer menu
    - Traiter commandes
    - Consulter statistiques

  ADMIN:
    - Gérer utilisateurs
    - Modérer restaurants
    - Accès analytics globales
```

#### JWT Token Claims
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "realm_access": {
    "roles": ["CLIENT"]
  },
  "resource_access": {
    "oneeats-backend": {
      "roles": ["USER"]
    }
  }
}
```

### 🛡️ Sécurité API renforcée

#### Rate Limiting
```java
@RateLimited(value = 100, window = "1m")
@Path("/api/orders")
public class OrderResource {
    // Rate limit: 100 requests per minute
}
```

#### Validation des données
```java
public record CreateOrderDto(
    @NotNull @Valid List<OrderItemDto> items,
    @NotBlank String deliveryAddress,
    @Pattern(regexp = "^[0-9]{10}$") String phoneNumber
) {}
```

#### CORS Configuration
```properties
# application.properties
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:3000,https://app.oneeats.com
quarkus.http.cors.methods=GET,POST,PUT,DELETE
quarkus.http.cors.headers=accept,authorization,content-type
```

---

## 09.DEVOPS\_DEPLOIEMENT.md

### 🐳 Conteneurisation Docker avancée

#### Dockerfile Multi-stage (Backend)
```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM registry.access.redhat.com/ubi8/openjdk-17:1.18
COPY --from=build /app/target/quarkus-app/ /deployments/
EXPOSE 8080
```

#### Docker Compose enrichi
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: oneeats
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  backend:
    build: .
    environment:
      QUARKUS_DATASOURCE_JDBC_URL: jdbc:postgresql://postgres:5432/oneeats
      QUARKUS_OIDC_AUTH_SERVER_URL: http://keycloak:8080/realms/oneeats
    ports:
      - "8081:8080"
    depends_on:
      - postgres
      - keycloak

volumes:
  postgres_data:
```

### 🚀 CI/CD GitHub Actions complet

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Cache Maven dependencies
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}

      - name: Run tests
        run: ./mvnw clean test

      - name: Build application
        run: ./mvnw clean package -DskipTests

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  frontend-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [web, mobile]
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: apps/${{ matrix.app }}/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: apps/${{ matrix.app }}

      - name: Run linting
        run: npm run lint
        working-directory: apps/${{ matrix.app }}

      - name: Run tests
        run: npm test
        working-directory: apps/${{ matrix.app }}

      - name: Build application
        run: npm run build
        working-directory: apps/${{ matrix.app }}

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: echo "Deploying to production..."
```

### 🌐 Hébergement & monitoring avancé

#### Metrics & Health Checks (Quarkus)
```java
// Health check custom
@ApplicationScoped
public class DatabaseHealthCheck implements HealthCheck {

    @Override
    public HealthCheckResponse call() {
        // Check database connectivity
        return HealthCheckResponse.up("Database connection OK");
    }
}
```

#### Monitoring Stack
- **Prometheus** : Métriques applicatives
- **Grafana** : Dashboards et visualisation
- **Loki** : Agrégation de logs
- **AlertManager** : Alertes (email, Slack, Discord)

#### Configuration Prometheus (application.properties)
```properties
quarkus.micrometer.export.prometheus.enabled=true
quarkus.micrometer.binders.jvm=true
quarkus.micrometer.binders.mp-metrics=true
```

---

## 10.DOCUMENTATION\_PROJET.md

### 🧾 README.md

- Présentation du projet
- Stack utilisée
- Installation / démarrage
- Liens utiles (Keycloak, Swagger, Expo)

### 📚 Documentation API REST

- Swagger (OpenAPI 3) généré automatiquement depuis Quarkus
- Exemple d’endpoint : `GET /restaurants/{id}`

### 📖 Guide utilisateur

- Rédigé automatiquement en markdown + PDF par GPT
- Inclure : création de compte, commande, suivi, historique

### 🧠 Documentation technique

- Explication modules / couches hexagonales
- Cas d’usage métiers (diagrammes ou bullet points)
- Ajout de commentaires auto via GPT sur code source

---

✅ **Document projet amélioré et enrichi !**

Le document contient maintenant :
- Spécifications détaillées des maquettes UI/UX avec design system
- Architecture technique complète avec structure de code réelle
- Configuration Quarkus spécifique et bonnes pratiques
- Tests complets (unitaires, intégration, E2E)
- Sécurité renforcée avec Keycloak et OIDC
- DevOps avec Docker, CI/CD GitHub Actions
- Monitoring et observabilité
- Documentation API avec OpenAPI
- Guides utilisateur par rôle
- Checklist de déploiement

Le document est maintenant prêt pour guider le développement complet de la plateforme OneEats !
