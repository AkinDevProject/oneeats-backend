# 📋 Structure de Tests OneEats

## 🎯 **Séparation Tests Unitaires vs Tests d'Intégration**

### **📂 Structure des Répertoires**

```
src/test/java/com/oneeats/
├── unit/                           # ✅ TESTS UNITAIRES (Rapides, Isolés)
│   ├── [domain]/
│   │   ├── domain/                 # Tests des entités métier
│   │   │   └── RestaurantTest.java           # Logique métier pure
│   │   ├── application/            # Tests des use cases
│   │   │   └── UpdateRestaurantCommandHandlerTest.java  # Use cases mockés
│   │   └── infrastructure/
│   │       └── mapper/             # Tests des mappers
│   │           └── RestaurantMapperTest.java # Conversion DTO ↔ Entity
│   │
└── integration/                    # ✅ TESTS D'INTÉGRATION (Plus lents, Composants réels)
    ├── [domain]/
    │   ├── repository/             # Tests Repository + Database
    │   │   └── RestaurantRepositoryIntegrationTest.java  # @QuarkusTest + DB
    │   └── web/                    # Tests API REST End-to-End
    │       └── RestaurantControllerIntegrationTest.java  # HTTP + DB + Use Cases
    │
└── [legacy]/                       # Anciens tests (à migrer progressivement)
```

---

## 🔍 **Différences Clés**

| Aspect | Tests Unitaires | Tests d'Intégration |
|--------|----------------|---------------------|
| **📍 Localisation** | `src/test/java/com/oneeats/unit/` | `src/test/java/com/oneeats/integration/` |
| **⚡ Vitesse** | Très rapide (<1ms) | Plus lent (100ms-1s) |
| **🎯 Isolation** | Une classe testée | Plusieurs couches |
| **🔗 Dépendances** | Mocks seulement | Vraies dépendances |
| **🗄️ Base données** | Jamais | PostgreSQL réel |
| **📝 Annotations** | `@ExtendWith(MockitoExtension.class)` | `@QuarkusTest` |
| **🎯 Objectif** | Logique métier | Intégration composants |

---

## ✅ **Tests Unitaires** (unit/)

### **🏗️ Tests Domain Model**
```java
// ✅ Teste UNIQUEMENT la logique métier de l'entité
@DisplayName("Restaurant Unit Tests - Pure Domain Logic")
class RestaurantTest {
    
    @Test
    void shouldActivateRestaurant() {
        // Given - Aucune dépendance externe
        Restaurant restaurant = new Restaurant(...);
        
        // When - Test méthode pure
        restaurant.activate();
        
        // Then - Vérification comportement
        assertEquals(RestaurantStatus.ACTIVE, restaurant.getStatus());
        // PAS de DB, PAS de Spring context
    }
}
```

### **🎛️ Tests Use Cases (Application Layer)**
```java
// ✅ Teste la logique des use cases avec MOCKS
@ExtendWith(MockitoExtension.class)
@DisplayName("UpdateRestaurantCommandHandler Unit Tests")
class UpdateRestaurantCommandHandlerTest {
    
    @Mock private IRestaurantRepository repository; // MOCK
    @Mock private RestaurantMapper mapper;          // MOCK
    
    @Test
    void shouldUpdateRestaurant() {
        // Given - Tous les collaborateurs MOCKÉS
        when(repository.findById(any())).thenReturn(Optional.of(restaurant));
        
        // When - Test use case isolé
        handler.handle(command);
        
        // Then - Vérification interactions
        verify(repository).save(any());
        // PAS de vraie DB, PAS de vrai réseau
    }
}
```

---

## 🔄 **Tests d'Intégration** (integration/)

### **🗄️ Tests Repository**
```java
// ✅ Teste l'intégration Repository ↔ Database
@QuarkusTest  // ← Démarre le contexte complet
@DisplayName("Restaurant Repository Integration Tests")
class RestaurantRepositoryIntegrationTest {
    
    @Inject JpaRestaurantRepository repository;  // Vraie injection
    @Inject EntityManager entityManager;         // Vraie DB
    
    @Test
    @Transactional  // ← Vraie transaction
    void shouldSaveRestaurant() {
        // When - Vraie interaction avec PostgreSQL
        Restaurant saved = repository.save(restaurant);
        
        // Then - Vérification dans vraie DB
        entityManager.flush();
        RestaurantEntity entity = entityManager.find(RestaurantEntity.class, saved.getId());
        assertNotNull(entity);
    }
}
```

### **🌐 Tests API REST**
```java
// ✅ Teste le flux complet HTTP → Controller → UseCase → Repository → DB
@QuarkusTest  // ← Serveur HTTP complet
@DisplayName("Restaurant Controller Integration Tests")
class RestaurantControllerIntegrationTest {
    
    @Test
    @Transactional
    void shouldCreateRestaurant() {
        // When - Vraie requête HTTP
        given()
            .contentType(ContentType.JSON)
            .body(command)
        .when()
            .post("/api/restaurants")  // ← Vrai appel REST
        .then()
            .statusCode(201);
            
        // Teste: HTTP → Controller → UseCase → Repository → DB
    }
}
```

---

## 🎯 **Quand utiliser quoi ?**

### **✅ Tests Unitaires** pour :
- 🏗️ **Règles métier** des entités (Restaurant.activate())
- 🎛️ **Logique use cases** avec mocks (CommandHandlers)
- 🔢 **Calculs et validations** (Rating.isValid())
- 🔄 **Machines à états** (OrderStatus transitions)
- 🗺️ **Mappers purs** (Entity ↔ DTO)

### **✅ Tests d'Intégration** pour :
- 🗄️ **Requêtes SQL** complexes (findByStatusAndCuisine())
- 🌐 **Endpoints REST** complets (POST /api/restaurants)
- 🔄 **Flux E2E** (HTTP request → Database)
- 💾 **Persistance complexe** (Schedule avec relations)
- 🔒 **Comportement transactionnel** (rollback, isolation)

---

## 🚀 **Commandes de Test**

### **Tests Unitaires Seulement** (Rapide)
```bash
./mvnw test -Dtest="com.oneeats.unit.**"
```

### **Tests d'Intégration Seulement** (Plus lent mais complet)
```bash  
./mvnw test -Dtest="com.oneeats.integration.**"
```

### **Tous les Tests**
```bash
./mvnw test
```

### **Coverage par Type**
```bash
# Unitaires seulement
./mvnw test jacoco:report -Dtest="com.oneeats.unit.**"

# Intégration seulement  
./mvnw test jacoco:report -Dtest="com.oneeats.integration.**"
```

---

## 📊 **Métriques et Objectifs**

| Type de Test | Objectif Coverage | Temps d'Exécution | Priorité |
|--------------|------------------|-------------------|----------|
| **Tests Unitaires** | > 90% Domain Logic | < 10 secondes | 🔥 Haute |
| **Tests Intégration Repository** | > 80% Data Layer | < 30 secondes | 🟡 Moyenne |
| **Tests Intégration API** | > 70% Endpoints | < 60 secondes | 🟡 Moyenne |

---

## 🔄 **Migration des Tests Existants**

### **Étapes de Migration**
1. **Identifier le type** : Unitaire vs Intégration
2. **Déplacer vers le bon répertoire** : `unit/` ou `integration/`
3. **Ajuster les annotations** : `@ExtendWith` vs `@QuarkusTest`
4. **Nettoyer les dépendances** : Mocks vs Injections réelles

### **Exemples de Migration**

**❌ Avant** (Mélangé)
```
src/test/java/com/oneeats/restaurant/
├── domain/model/RestaurantTest.java           # Unitaire mais dans mauvais endroit
├── infrastructure/web/RestaurantControllerIntegrationTest.java  # Intégration
```

**✅ Après** (Séparé)
```
src/test/java/com/oneeats/
├── unit/restaurant/domain/RestaurantTest.java            # ✅ Unitaire
├── integration/restaurant/web/RestaurantControllerIntegrationTest.java  # ✅ Intégration
```

---

## 📚 **Conventions et Standards**

### **Nommage**
- **Tests Unitaires** : `[Entity]Test.java`, `[UseCase]Test.java`
- **Tests Intégration** : `[Component]IntegrationTest.java`

### **Structure des Tests**
```java
@DisplayName("Clear description of what is being tested")
class SomeTest {
    
    @Nested
    @DisplayName("Logical group of related tests")
    class LogicalGroup {
        
        @Test
        @DisplayName("Should do X when Y condition")
        void shouldDoXWhenYCondition() {
            // Given - Arrange
            // When - Act
            // Then - Assert
        }
    }
}
```

### **Annotations Obligatoires**
- **Tests Unitaires** : `@ExtendWith(MockitoExtension.class)`
- **Tests Intégration** : `@QuarkusTest` + `@Transactional`

---

Cette nouvelle structure garantit :
- ✅ **Séparation claire** des responsabilités
- ⚡ **Tests rapides** pour développement quotidien  
- 🔍 **Tests complets** pour validation d'intégration
- 📊 **Métriques précises** par couche
- 🚀 **Feedback rapide** avec tests unitaires
- 🛡️ **Confiance** avec tests d'intégration