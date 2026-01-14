# 🧪 Stratégie de Tests - Guide Complet et Générique

**Document de référence pour écrire tous les tests d'un projet**

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Les 3 Types de Tests](#les-3-types-de-tests)
3. [Documents Sources](#documents-sources)
4. [Méthodologie : Comment Écrire les Tests](#méthodologie--comment-écrire-les-tests)
5. [Répartition des Tests (Règle 70-20-10)](#répartition-des-tests-règle-70-20-10)
6. [Matrice de Décision](#matrice-de-décision)
7. [Templates de Tests](#templates-de-tests)
8. [Workflow Complet](#workflow-complet)
9. [Checklist de Validation](#checklist-de-validation)

---

## Vue d'Ensemble

### 🎯 Objectif de ce Document

Ce document fournit une **stratégie complète et générique** pour écrire tous les tests d'un projet backend, quelle que soit sa nature.

### 📊 Pyramide des Tests

```
                    /\
                   /  \
                  / E2E \          ← 10% - Lents, coûteux, fragiles
                 /--------\           (Parcours utilisateur complets)
                /          \
               / Intégration\      ← 20% - Moyens, fiables
              /--------------\        (Components + DB + Services)
             /                \
            /    Unitaires     \   ← 70% - Rapides, fiables, isolés
           /____________________\      (Logique métier pure)
```

**Principe** : Plus on monte, moins il y a de tests, mais plus ils couvrent de terrain.

---

## Les 3 Types de Tests

### 1️⃣ Tests Unitaires (Unit Tests)

#### Définition
Teste **une seule unité de code isolée** (méthode, classe) sans aucune dépendance externe.

#### Caractéristiques
- ⚡ **Très rapides** : < 10ms par test
- 🎯 **Isolés** : Pas de DB, pas de réseau, pas de fichiers
- 🔍 **Précis** : Identifie exactement la ligne qui échoue
- 🔄 **Fiables** : Pas de faux positifs dus à l'environnement

#### Ce qu'on teste
- Logique métier pure (calculs, algorithmes)
- Règles de validation
- Value Objects (objets immuables avec logique)
- Transformations de données
- Machines à états

#### Ce qu'on NE teste PAS
- ❌ Interactions avec la base de données
- ❌ Appels HTTP ou API externes
- ❌ Lecture/écriture de fichiers
- ❌ Plusieurs composants ensemble

#### Exemple Générique

```java
// Classe testée : Calcul de prix avec remise
class PriceCalculator {
    public BigDecimal calculateFinalPrice(BigDecimal basePrice, BigDecimal discountPercent) {
        if (basePrice == null || basePrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le prix doit être positif");
        }
        if (discountPercent == null || discountPercent.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("La remise ne peut pas être négative");
        }

        BigDecimal discount = basePrice.multiply(discountPercent).divide(BigDecimal.valueOf(100));
        return basePrice.subtract(discount);
    }
}

// Test unitaire
class PriceCalculatorTest {

    private PriceCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new PriceCalculator(); // Pas de dépendances
    }

    @Test
    @DisplayName("Calcul correct avec remise de 10%")
    void shouldCalculateCorrectly_WithTenPercentDiscount() {
        // GIVEN
        BigDecimal basePrice = BigDecimal.valueOf(100);
        BigDecimal discount = BigDecimal.valueOf(10);

        // WHEN
        BigDecimal result = calculator.calculateFinalPrice(basePrice, discount);

        // THEN
        assertThat(result).isEqualByComparingTo("90.00");
    }

    @Test
    @DisplayName("Erreur si prix négatif")
    void shouldThrowException_WhenPriceIsNegative() {
        // GIVEN
        BigDecimal negativePrice = BigDecimal.valueOf(-100);
        BigDecimal discount = BigDecimal.valueOf(10);

        // WHEN / THEN
        assertThatThrownBy(() -> calculator.calculateFinalPrice(negativePrice, discount))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("prix doit être positif");
    }

    @Test
    @DisplayName("Pas de remise si discount = 0")
    void shouldReturnBasePrice_WhenDiscountIsZero() {
        // GIVEN
        BigDecimal basePrice = BigDecimal.valueOf(100);
        BigDecimal noDiscount = BigDecimal.ZERO;

        // WHEN
        BigDecimal result = calculator.calculateFinalPrice(basePrice, noDiscount);

        // THEN
        assertThat(result).isEqualByComparingTo(basePrice);
    }
}
```

---

### 2️⃣ Tests d'Intégration (Integration Tests)

#### Définition
Teste **plusieurs composants qui interagissent ensemble** avec des dépendances réelles (DB, services).

#### Caractéristiques
- 🐢 **Moyennement rapides** : 100-500ms par test
- 🔗 **Connectés** : Utilise une vraie DB (ou DB de test)
- 🎯 **Scope moyen** : Teste un Use Case complet
- ⚙️ **Configuration** : Nécessite setup (DB, transactions)

#### Ce qu'on teste
- Use Cases complets (Command/Query Handlers)
- Repositories (requêtes SQL)
- Services qui interagissent avec la DB
- Mappers (Entity ↔ DTO)
- Transactions et rollbacks

#### Ce qu'on NE teste PAS
- ❌ Requêtes HTTP (c'est E2E)
- ❌ Authentification JWT (c'est E2E)
- ❌ Parcours multi-étapes (c'est E2E)

#### Exemple Générique

```java
// Test d'intégration : Handler + Repository + DB
@QuarkusTest // ou @SpringBootTest selon le framework
@TestTransaction // Rollback automatique après chaque test
class CreateEntityUseCaseIntegrationTest {

    @Inject
    CreateEntityCommandHandler handler;

    @Inject
    EntityRepository repository;

    @Test
    @DisplayName("INTEGRATION: Création d'une entité en base de données")
    void shouldCreateEntity_AndPersistToDatabase() {
        // GIVEN - Commande valide
        var command = new CreateEntityCommand(
            "Nom de l'entité",
            "Description",
            BigDecimal.valueOf(100)
        );

        // WHEN - Exécution du handler (qui persiste en DB)
        var entityId = handler.handle(command);

        // THEN - Vérification en DB
        var savedEntity = repository.findById(entityId);
        assertThat(savedEntity).isNotNull();
        assertThat(savedEntity.getName()).isEqualTo("Nom de l'entité");
        assertThat(savedEntity.getStatus()).isEqualTo(Status.ACTIVE);

        // Vérification que la DB contient bien l'entité
        var allEntities = repository.listAll();
        assertThat(allEntities).hasSize(1);
    }

    @Test
    @DisplayName("INTEGRATION: Échec si entité avec même nom existe déjà")
    void shouldFail_WhenDuplicateNameExists() {
        // GIVEN - Une entité existe déjà en DB
        var existingEntity = new Entity("Nom Existant", "Description", 100);
        repository.persist(existingEntity);

        var duplicateCommand = new CreateEntityCommand(
            "Nom Existant", // Même nom
            "Autre description",
            BigDecimal.valueOf(200)
        );

        // WHEN / THEN - Doit échouer avec exception
        assertThatThrownBy(() -> handler.handle(duplicateCommand))
            .isInstanceOf(DuplicateEntityException.class)
            .hasMessageContaining("existe déjà");
    }

    @Test
    @DisplayName("INTEGRATION: Rollback si erreur pendant la transaction")
    void shouldRollback_WhenErrorOccursDuringTransaction() {
        // GIVEN - Commande invalide (violation contrainte)
        var invalidCommand = new CreateEntityCommand(
            null, // NOT NULL violation
            "Description",
            BigDecimal.valueOf(100)
        );

        // WHEN
        assertThatThrownBy(() -> handler.handle(invalidCommand));

        // THEN - Vérifier qu'aucune entité n'a été créée (rollback)
        var entities = repository.listAll();
        assertThat(entities).isEmpty();
    }
}
```

---

### 3️⃣ Tests End-to-End (E2E Tests)

#### Définition
Teste **l'application complète** du point de vue utilisateur (HTTP → Backend → DB → HTTP).

#### Caractéristiques
- 🐌 **Lents** : 1-5 secondes par test
- 🌐 **Complets** : Tout le stack (API REST, Auth, DB)
- 🎭 **Réalistes** : Simule un vrai utilisateur
- 🔧 **Fragiles** : Sensibles aux changements (UI, API)

#### Ce qu'on teste
- Parcours utilisateur complets (plusieurs APIs)
- Authentification et autorisations
- Sérialisation/Désérialisation JSON
- Codes de statut HTTP
- CORS, Headers, Cookies

#### Ce qu'on NE teste PAS
- ❌ Logique métier détaillée (c'est unitaire)
- ❌ Requêtes SQL (c'est intégration)

#### Exemple Générique

```java
// Test E2E : Requête HTTP → API → Backend → DB → Réponse
@QuarkusTest
class EntityRestAPIE2ETest {

    @Test
    @DisplayName("E2E: Créer une entité via API REST")
    void shouldCreateEntity_ViaRestAPI() {
        // GIVEN - Préparation des données (optionnel)
        var requestBody = """
            {
                "name": "Nouvelle Entité",
                "description": "Description complète",
                "price": 150.00
            }
            """;

        // WHEN - Requête HTTP POST réelle
        var response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + getValidJWT())
            .body(requestBody)
        .when()
            .post("/api/entities")
        .then()
            .statusCode(201) // Created
            .contentType(ContentType.JSON)
            .extract().response();

        // THEN - Vérifier la réponse
        var entityId = response.jsonPath().getLong("id");
        assertThat(entityId).isNotNull();

        var name = response.jsonPath().getString("name");
        assertThat(name).isEqualTo("Nouvelle Entité");

        // Vérifier que l'entité est accessible via GET
        given()
            .header("Authorization", "Bearer " + getValidJWT())
        .when()
            .get("/api/entities/" + entityId)
        .then()
            .statusCode(200)
            .body("name", equalTo("Nouvelle Entité"));
    }

    @Test
    @DisplayName("E2E: Échec 400 si données invalides")
    void shouldReturn400_WhenInvalidData() {
        // GIVEN - Body invalide (nom manquant)
        var invalidBody = """
            {
                "description": "Sans nom",
                "price": 150.00
            }
            """;

        // WHEN / THEN
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + getValidJWT())
            .body(invalidBody)
        .when()
            .post("/api/entities")
        .then()
            .statusCode(400); // Bad Request
    }

    @Test
    @DisplayName("E2E: Échec 401 si non authentifié")
    void shouldReturn401_WhenNotAuthenticated() {
        // GIVEN
        var validBody = """
            {
                "name": "Test",
                "description": "Test",
                "price": 100.00
            }
            """;

        // WHEN / THEN - Pas de header Authorization
        given()
            .contentType(ContentType.JSON)
            .body(validBody)
        .when()
            .post("/api/entities")
        .then()
            .statusCode(401); // Unauthorized
    }

    @Test
    @DisplayName("E2E: Parcours complet création + consultation + modification")
    void shouldCompleteFullCRUDJourney() {
        // 1. Créer
        var entityId = given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + getValidJWT())
            .body("""
                {
                    "name": "Entité Test",
                    "description": "Description initiale",
                    "price": 100.00
                }
                """)
        .when()
            .post("/api/entities")
        .then()
            .statusCode(201)
            .extract().jsonPath().getLong("id");

        // 2. Consulter
        var entity = given()
            .header("Authorization", "Bearer " + getValidJWT())
        .when()
            .get("/api/entities/" + entityId)
        .then()
            .statusCode(200)
            .extract().as(EntityDTO.class);

        assertThat(entity.name()).isEqualTo("Entité Test");

        // 3. Modifier
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + getValidJWT())
            .body("""
                {
                    "description": "Description modifiée",
                    "price": 200.00
                }
                """)
        .when()
            .put("/api/entities/" + entityId)
        .then()
            .statusCode(200);

        // 4. Vérifier la modification
        given()
            .header("Authorization", "Bearer " + getValidJWT())
        .when()
            .get("/api/entities/" + entityId)
        .then()
            .statusCode(200)
            .body("description", equalTo("Description modifiée"))
            .body("price", equalTo(200.00f));
    }
}
```

---

## Documents Sources

### 📄 Quels Documents Utiliser pour Écrire les Tests ?

| Document | Utilisation pour Tests |
|----------|------------------------|
| **USE_CASES.md** | ✅ **Source principale pour tests d'intégration et E2E**<br>- Chaque use case = 1 suite de tests d'intégration<br>- Flux principal = test happy path<br>- Flux alternatifs = tests d'erreur<br>- Parcours critiques = tests E2E |
| **BUSINESS_RULES.md** | ✅ **Source principale pour tests unitaires**<br>- Chaque règle métier (RG-XXX) = 1 test unitaire minimum<br>- Validations, calculs, contraintes<br>- Machines à états |
| **DATA_MODEL.md** | ✅ **Source pour tests d'intégration des repositories**<br>- Contraintes DB (NOT NULL, UNIQUE, FK)<br>- Requêtes complexes<br>- Indexes et performances |
| **API_SPECS.md** | ✅ **Source pour tests E2E des endpoints**<br>- Contrats API (request/response)<br>- Codes de statut HTTP<br>- Validation JSON Schema |
| **ARCHITECTURE.md** | ℹ️ Contexte sur la structure du code |

---

## Méthodologie : Comment Écrire les Tests

### 🔄 Processus en 5 Étapes

```
1. LIRE le document source (USE_CASES.md ou BUSINESS_RULES.md)
                ↓
2. IDENTIFIER les scénarios à tester
                ↓
3. CHOISIR le type de test (Unitaire / Intégration / E2E)
                ↓
4. ÉCRIRE les tests en TDD (Red → Green → Refactor)
                ↓
5. VÉRIFIER la couverture et la qualité
```

---

### Étape 1️⃣ : LIRE le Document Source

#### Pour Tests Unitaires → BUSINESS_RULES.md

1. Ouvrir `BUSINESS_RULES.md`
2. Chercher toutes les règles métier (format `RG-XXX`)
3. Pour chaque règle, noter :
   - La logique de validation
   - Les cas limites (edge cases)
   - Les exceptions à lever

**Exemple :**
```markdown
## BUSINESS_RULES.md

RG-016 : Prix total = Somme(quantité × prix unitaire)
RG-017 : Pas de frais de livraison
RG-018 : Instructions spéciales limitées à 500 caractères
```

**→ Tests à créer :**
- RG-016 : Test calcul prix (2 items, 3 items, 0 items)
- RG-017 : Test qu'il n'y a jamais de frais additionnels
- RG-018 : Test validation longueur (499 OK, 500 OK, 501 KO)

---

#### Pour Tests d'Intégration → USE_CASES.md

1. Ouvrir `USE_CASES.md`
2. Choisir un use case (ex: UC-004)
3. Lire :
   - Flux principal (étapes numérotées)
   - Flux alternatifs (cas d'erreur)
   - Règles métier associées
   - Préconditions et postconditions

**Exemple :**
```markdown
## USE_CASES.md - UC-004

Flux Principal :
1. Le client consulte la page détail
2. Le système affiche les informations
...
17. Le système crée l'entité avec statut PENDING
18. Le système calcule le temps estimé

Flux Alternatifs :
17a. Si condition non respectée → Erreur X
17b. Si autre problème → Erreur Y
```

**→ Tests à créer :**
- 1 test pour flux principal (happy path)
- 1 test pour chaque flux alternatif (17a, 17b, etc.)
- Tests des règles métier référencées

---

#### Pour Tests E2E → USE_CASES.md (Parcours Critiques)

1. Identifier les use cases **critiques** ou **prioritaires**
2. Lire le flux complet de bout en bout
3. Noter les dépendances entre use cases

**Exemple :**
```markdown
UC-004 (Créer entité) → UC-005 (Consulter statut) → UC-006 (Modifier)
```

**→ Test E2E à créer :**
- 1 test parcours complet : POST → GET → PUT

---

### Étape 2️⃣ : IDENTIFIER les Scénarios à Tester

#### Template de Découpage

Pour chaque use case, créer :

```
UC-XXX : [Titre du Use Case]
├─ TEST 1: Flux principal (Happy Path)
├─ TEST 2: Flux alternatif 2a
├─ TEST 3: Flux alternatif 2b
├─ TEST 4: Flux alternatif 5a
├─ TEST 5: Règle RG-XXX
├─ TEST 6: Règle RG-YYY
└─ TEST 7: Règle RG-ZZZ
```

#### Exemple Concret

```
UC-004 : Créer une commande
├─ TEST 1: Création réussie avec données valides (Flux principal)
├─ TEST 2: Échec si entité parente fermée (Flux 2a)
├─ TEST 3: Échec si entité parente inactive (Flux 2b)
├─ TEST 4: Échec si panier vide (Flux 8a)
├─ TEST 5: Échec si entité fermée entre-temps (Flux 17a)
├─ TEST 6: Validation RG-013 (panier non vide)
├─ TEST 7: Validation RG-015 (entité ouverte ET active)
└─ TEST 8: Calcul correct RG-016 (prix total)
```

---

### Étape 3️⃣ : CHOISIR le Type de Test

#### Arbre de Décision

```
Question 1: Est-ce de la logique pure SANS dépendances ?
    ├─ OUI → TEST UNITAIRE
    └─ NON → Question 2

Question 2: Est-ce un use case complet avec DB ?
    ├─ OUI → TEST D'INTÉGRATION
    └─ NON → Question 3

Question 3: Est-ce un parcours multi-étapes via HTTP ?
    ├─ OUI → TEST E2E
    └─ NON → Réévaluer ou combiner plusieurs types
```

#### Matrice de Décision Rapide

| Scénario | Type de Test |
|----------|--------------|
| Validation d'une règle métier (calcul, format) | Unitaire |
| Transformation de données | Unitaire |
| Machine à états (transitions) | Unitaire |
| Use case avec création en DB | Intégration |
| Use case avec requête SQL complexe | Intégration |
| Vérification de contraintes DB (UNIQUE, FK) | Intégration |
| Appel API REST avec authentification | E2E |
| Parcours utilisateur multi-étapes | E2E |
| Vérification codes HTTP et JSON | E2E |

---

### Étape 4️⃣ : ÉCRIRE les Tests en TDD

#### Méthodologie TDD (Test-Driven Development)

```
🔴 RED     → Écrire un test qui échoue (le code n'existe pas encore)
🟢 GREEN   → Écrire le code minimal pour faire passer le test
🔵 REFACTOR → Améliorer le code sans changer le comportement
```

#### Processus Détaillé

**1. RED - Écrire le test qui échoue**

```java
@Test
@DisplayName("RG-016: Calcul correct du prix total")
void shouldCalculateTotalPriceCorrectly() {
    // GIVEN
    var item1 = new Item("Pizza", 12.50);
    var item2 = new Item("Coca", 3.00);
    var items = List.of(
        new CartItem(item1, 2),  // 12.50 × 2 = 25.00
        new CartItem(item2, 1)   //  3.00 × 1 =  3.00
    );

    // WHEN
    var total = priceCalculator.calculate(items);

    // THEN
    assertThat(total).isEqualByComparingTo("28.00");
}
```

→ **Lancer le test** : ❌ Échec (la méthode `calculate()` n'existe pas)

---

**2. GREEN - Écrire le code minimal**

```java
class PriceCalculator {
    public BigDecimal calculate(List<CartItem> items) {
        return items.stream()
            .map(item -> item.price().multiply(BigDecimal.valueOf(item.quantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

→ **Relancer le test** : ✅ Succès

---

**3. REFACTOR - Améliorer le code**

```java
class PriceCalculator {
    public BigDecimal calculate(List<CartItem> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return items.stream()
            .map(this::calculateItemTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateItemTotal(CartItem item) {
        return item.price().multiply(BigDecimal.valueOf(item.quantity()));
    }
}
```

→ **Relancer tous les tests** : ✅ Tous passent

---

### Étape 5️⃣ : VÉRIFIER la Couverture et la Qualité

#### Checklist de Validation

- [ ] **Couverture** : Au moins 80% de code coverage (unitaire + intégration)
- [ ] **Tous les flux** : Flux principal + tous les flux alternatifs testés
- [ ] **Toutes les règles** : Chaque RG-XXX a au moins 1 test
- [ ] **Cas limites** : Edge cases testés (null, vide, max, min)
- [ ] **Nommage** : Noms explicites (`shouldDoX_WhenY`)
- [ ] **Assertions** : Au moins 1 assertion par test
- [ ] **Indépendance** : Tests peuvent s'exécuter dans n'importe quel ordre
- [ ] **Rapidité** : Tests unitaires < 10ms, intégration < 500ms

#### Commandes de Vérification

```bash
# Coverage
./mvnw test jacoco:report
# Ouvrir: target/site/jacoco/index.html

# Exécuter tous les tests
./mvnw test

# Exécuter seulement les tests unitaires
./mvnw test -Dtest="*Test"

# Exécuter seulement les tests d'intégration
./mvnw test -Dtest="*IT"

# Exécuter seulement les tests E2E
./mvnw test -Dtest="*E2E"
```

---

## Répartition des Tests (Règle 70-20-10)

### 📊 Distribution Recommandée

```
        TOTAL = 100% des tests

70% Tests Unitaires (Rapides, Isolés)
│
├─ Règles métier (toutes les RG-XXX)
├─ Value Objects
├─ Validations
├─ Calculs et algorithmes
└─ Machines à états

20% Tests d'Intégration (DB + Services)
│
├─ Tous les use cases (UC-XXX)
├─ CommandHandlers / QueryHandlers
├─ Repositories
├─ Mappers
└─ Transactions

10% Tests E2E (HTTP + Auth + DB)
│
├─ Parcours critiques (3-5 use cases prioritaires)
├─ Tests de sécurité
├─ Tests de non-régression
└─ Smoke tests
```

### 🎯 Quantité de Tests par Type

Si vous avez **100 tests au total** :

- **70 tests unitaires** (règles métier, validations, calculs)
- **20 tests d'intégration** (use cases complets avec DB)
- **10 tests E2E** (parcours utilisateur via API)

---

### 📋 Mapping Documents → Tests

#### À partir de BUSINESS_RULES.md

Si vous avez **90 règles métier** (RG-001 à RG-090) :

- **90 tests unitaires minimum** (1 par règle)
- Certaines règles complexes peuvent nécessiter **2-3 tests** (edge cases)

**Total estimé : ~120 tests unitaires**

---

#### À partir de USE_CASES.md

Si vous avez **19 use cases** :

- **19 suites de tests d'intégration** (1 par use case)
- Chaque suite contient :
  - 1 test flux principal
  - N tests flux alternatifs (moyenne : 3-5)
  - M tests règles métier (déjà couverts en unitaire, mais validés en intégration)

**Total estimé : ~40 tests d'intégration**

---

#### Parcours E2E

Parmi les 19 use cases, identifier **3-5 use cases critiques** :

- **3-5 tests E2E** (parcours complets)
- **2-3 tests de sécurité** (auth, autorisations)
- **1 smoke test** (vérification basique après déploiement)

**Total estimé : ~10 tests E2E**

---

### 🎯 Exemple Concret de Répartition

```
Projet avec:
- 90 règles métier (BUSINESS_RULES.md)
- 19 use cases (USE_CASES.md)

Distribution:
├─ 120 tests unitaires (70%)
│   ├─ 90 tests pour règles métier RG-XXX
│   ├─ 20 tests pour Value Objects
│   └─ 10 tests pour machines à états
│
├─ 40 tests d'intégration (23%)
│   ├─ 19 tests happy path (1 par use case)
│   └─ 21 tests flux alternatifs
│
└─ 10 tests E2E (7%)
    ├─ 5 parcours critiques
    ├─ 3 tests sécurité
    └─ 2 smoke tests

TOTAL = 170 tests
```

---

## Matrice de Décision

### 🔍 "Quel Type de Test Écrire ?"

| Critère | Unitaire | Intégration | E2E |
|---------|----------|-------------|-----|
| **Source** | BUSINESS_RULES.md | USE_CASES.md | USE_CASES.md (critiques) |
| **Scope** | 1 méthode/classe | Use case complet | Parcours multi-étapes |
| **Dépendances** | ❌ Aucune | ✅ DB, Services | ✅ HTTP, DB, Auth |
| **Vitesse** | ⚡ <10ms | 🐢 100-500ms | 🐌 1-5s |
| **Quand ?** | Règles métier, calculs | Flux use case | Parcours utilisateur |

### 🎯 Exemples de Classification

| Scénario | Type | Raison |
|----------|------|--------|
| "Le prix ne peut pas être négatif" | Unitaire | Validation simple, pas de DB |
| "Le total = somme des items" | Unitaire | Calcul pur, pas de DB |
| "Créer une commande en DB" | Intégration | Use case avec persistance |
| "Requête SQL avec JOIN complexe" | Intégration | Repository, besoin DB |
| "POST /api/orders retourne 201" | E2E | API REST complète |
| "Parcours: Créer → Consulter → Modifier" | E2E | Multi-étapes via HTTP |
| "Utilisateur non auth → 401" | E2E | Sécurité, besoin auth |

---

## Templates de Tests

### 📝 Template Test Unitaire

```java
/**
 * Tests unitaires pour [NomClasse]
 *
 * Règles métier testées:
 * - RG-XXX: [Description]
 * - RG-YYY: [Description]
 */
class [NomClasse]Test {

    private [NomClasse] [instance];

    @BeforeEach
    void setUp() {
        // Initialisation sans dépendances
        [instance] = new [NomClasse]();
    }

    @Test
    @DisplayName("RG-XXX: [Description de la règle]")
    void shouldDoSomething_WhenCondition() {
        // GIVEN - Données de test
        var input = ...;

        // WHEN - Appel méthode
        var result = [instance].methodUnderTest(input);

        // THEN - Assertions
        assertThat(result).isEqualTo(expected);
    }

    @Test
    @DisplayName("RG-XXX: Erreur si [condition invalide]")
    void shouldThrowException_WhenInvalidCondition() {
        // GIVEN
        var invalidInput = ...;

        // WHEN / THEN
        assertThatThrownBy(() -> [instance].methodUnderTest(invalidInput))
            .isInstanceOf([ExceptionType].class)
            .hasMessageContaining("message attendu");
    }

    @ParameterizedTest
    @CsvSource({
        "input1, expected1",
        "input2, expected2",
        "input3, expected3"
    })
    @DisplayName("RG-XXX: Test avec plusieurs cas")
    void shouldHandleMultipleCases(String input, String expected) {
        // WHEN
        var result = [instance].methodUnderTest(input);

        // THEN
        assertThat(result).isEqualTo(expected);
    }
}
```

---

### 📝 Template Test d'Intégration

```java
/**
 * Tests d'intégration pour UC-XXX: [Titre Use Case]
 *
 * Source: USE_CASES.md - UC-XXX
 *
 * Tests inclus:
 * - Flux principal (Happy Path)
 * - Flux alternatifs (cas d'erreur)
 * - Règles métier associées
 */
@QuarkusTest  // ou @SpringBootTest
@TestTransaction  // Rollback automatique
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UCXXX_[TitreUseCase]IT {

    @Inject
    [CommandHandler] commandHandler;

    @Inject
    [Repository] repository;

    // === FLUX PRINCIPAL (Happy Path) ===

    @Test
    @Order(1)
    @DisplayName("UC-XXX: Flux principal - [Description]")
    void shouldSucceed_WhenAllConditionsMet() {
        // GIVEN - Préconditions du use case
        var prerequisite = createPrerequisite();
        repository.persist(prerequisite);

        var command = new [Command](
            validParam1,
            validParam2
        );

        // WHEN - Exécution use case
        var result = commandHandler.handle(command);

        // THEN - Postconditions vérifiées
        assertThat(result).isNotNull();

        var savedEntity = repository.findById(result);
        assertThat(savedEntity.getStatus()).isEqualTo(EXPECTED_STATUS);
    }

    // === FLUX ALTERNATIFS (Cas d'Erreur) ===

    @Test
    @Order(2)
    @DisplayName("UC-XXX [Flux 2a]: Échec si [condition]")
    void shouldFail_WhenConditionNotMet() {
        // GIVEN - Condition non respectée
        var invalidCommand = new [Command](
            invalidParam
        );

        // WHEN / THEN
        assertThatThrownBy(() -> commandHandler.handle(invalidCommand))
            .isInstanceOf([ExceptionType].class)
            .hasMessageContaining("message attendu");
    }

    @Test
    @Order(3)
    @DisplayName("UC-XXX [Flux 17a]: Rollback si erreur transaction")
    void shouldRollback_WhenErrorOccurs() {
        // GIVEN
        var commandThatWillFail = ...;

        // WHEN
        assertThatThrownBy(() -> commandHandler.handle(commandThatWillFail));

        // THEN - Vérifier rollback
        var entities = repository.listAll();
        assertThat(entities).isEmpty();
    }

    // === RÈGLES MÉTIER ===

    @Test
    @Order(4)
    @DisplayName("RG-XXX: [Description règle métier]")
    void shouldEnforceBusinessRule_RGXXX() {
        // Test de la règle métier en contexte d'intégration
    }
}
```

---

### 📝 Template Test E2E

```java
/**
 * Tests End-to-End pour [Parcours Utilisateur]
 *
 * Source: USE_CASES.md - UC-XXX → UC-YYY → UC-ZZZ
 *
 * Parcours testé:
 * 1. [Étape 1]
 * 2. [Étape 2]
 * 3. [Étape 3]
 */
@QuarkusTest
class [ParcoursName]E2ETest {

    @Test
    @DisplayName("E2E: [Description parcours complet]")
    void shouldCompleteFullJourney() {
        // ÉTAPE 1: [Action utilisateur]
        var step1Response = given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + getValidJWT())
            .body(requestBody1)
        .when()
            .post("/api/endpoint1")
        .then()
            .statusCode(201)
            .extract().response();

        var resourceId = step1Response.jsonPath().getLong("id");

        // ÉTAPE 2: [Action suivante]
        var step2Response = given()
            .header("Authorization", "Bearer " + getValidJWT())
        .when()
            .get("/api/endpoint2/" + resourceId)
        .then()
            .statusCode(200)
            .extract().as([DTO].class);

        assertThat(step2Response.status()).isEqualTo(EXPECTED_STATUS);

        // ÉTAPE 3: [Action finale]
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + getValidJWT())
            .body(updateRequest)
        .when()
            .put("/api/endpoint3/" + resourceId)
        .then()
            .statusCode(200);

        // VÉRIFICATION FINALE
        given()
            .header("Authorization", "Bearer " + getValidJWT())
        .when()
            .get("/api/endpoint2/" + resourceId)
        .then()
            .statusCode(200)
            .body("field", equalTo(expectedValue));
    }

    @Test
    @DisplayName("E2E: Échec 401 si non authentifié")
    void shouldReturn401_WhenNotAuthenticated() {
        given()
            .contentType(ContentType.JSON)
            .body(validBody)
        .when()
            .post("/api/endpoint")
        .then()
            .statusCode(401);
    }

    @Test
    @DisplayName("E2E: Échec 403 si pas autorisé")
    void shouldReturn403_WhenNotAuthorized() {
        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer " + getInsufficientRoleJWT())
            .body(validBody)
        .when()
            .post("/api/admin/endpoint")
        .then()
            .statusCode(403);
    }
}
```

---

## Workflow Complet

### 🔄 Processus Étape par Étape

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: PRÉPARATION                                        │
└─────────────────────────────────────────────────────────────┘
    1. Lire USE_CASES.md et BUSINESS_RULES.md
    2. Créer un tableur de planification:
       - Colonne 1: ID (UC-XXX ou RG-XXX)
       - Colonne 2: Description
       - Colonne 3: Type de test (Unit/Integration/E2E)
       - Colonne 4: Statut (TODO/IN_PROGRESS/DONE)
    3. Prioriser les tests critiques

┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: TESTS UNITAIRES (70%)                             │
└─────────────────────────────────────────────────────────────┘
    4. Pour chaque règle RG-XXX dans BUSINESS_RULES.md:
       a. Créer fichier [NomClasse]Test.java
       b. Écrire test en TDD (Red → Green → Refactor)
       c. Vérifier coverage > 90% pour cette classe
       d. Marquer comme DONE dans le tableur

┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: TESTS D'INTÉGRATION (20%)                         │
└─────────────────────────────────────────────────────────────┘
    5. Pour chaque use case UC-XXX dans USE_CASES.md:
       a. Créer fichier UCXXX_[Titre]IT.java
       b. Écrire test flux principal
       c. Écrire tests flux alternatifs
       d. Vérifier que les règles métier fonctionnent en intégration
       e. Marquer comme DONE

┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: TESTS E2E (10%)                                   │
└─────────────────────────────────────────────────────────────┘
    6. Identifier 3-5 use cases critiques
    7. Pour chaque parcours critique:
       a. Créer fichier [Parcours]E2ETest.java
       b. Écrire test parcours complet (multi-étapes)
       c. Ajouter tests sécurité (401, 403)
       d. Marquer comme DONE

┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: VALIDATION                                        │
└─────────────────────────────────────────────────────────────┘
    8. Exécuter tous les tests: ./mvnw test
    9. Vérifier coverage global: ./mvnw jacoco:report
    10. Vérifier distribution 70-20-10
    11. Code review des tests
    12. Documentation des tests complexes
```

---

## Checklist de Validation

### ✅ Checklist Globale

Avant de considérer les tests terminés, vérifier :

#### Couverture

- [ ] **Coverage global ≥ 80%** (unitaire + intégration)
- [ ] **Chaque règle métier (RG-XXX) a au moins 1 test**
- [ ] **Chaque use case (UC-XXX) a au moins 1 test d'intégration**
- [ ] **Les 3-5 use cases critiques ont des tests E2E**

#### Distribution

- [ ] **~70% de tests unitaires**
- [ ] **~20% de tests d'intégration**
- [ ] **~10% de tests E2E**

#### Qualité

- [ ] **Tous les tests passent** (`./mvnw test`)
- [ ] **Noms explicites** (`shouldDoX_WhenY`)
- [ ] **Chaque test a au moins 1 assertion**
- [ ] **Pas de tests flaky** (résultats instables)
- [ ] **Tests indépendants** (ordre d'exécution n'importe pas)

#### Performance

- [ ] **Tests unitaires < 10ms en moyenne**
- [ ] **Tests intégration < 500ms en moyenne**
- [ ] **Tests E2E < 5s en moyenne**
- [ ] **Suite complète < 5 minutes**

#### Documentation

- [ ] **Javadoc sur les classes de tests complexes**
- [ ] **README.md dans src/test/java expliquant l'organisation**
- [ ] **Commentaires sur les cas limites non évidents**

---

### ✅ Checklist par Use Case

Pour chaque use case UC-XXX :

- [ ] **Flux principal testé** (happy path)
- [ ] **Tous les flux alternatifs testés** (un test par flux)
- [ ] **Règles métier associées testées**
- [ ] **Préconditions vérifiées** (setup correct)
- [ ] **Postconditions vérifiées** (assertions)
- [ ] **Cas limites testés** (null, vide, max, min)

---

## 📊 Exemple Complet de Planning

### Projet Exemple : 19 Use Cases, 90 Règles Métier

```
┌─────────────────────────────────────────────────────────────┐
│ PLANNING TESTS                                              │
├─────────────────────────────────────────────────────────────┤
│ Estimation: 170 tests à écrire                             │
│ Temps estimé: 3-4 semaines (selon équipe)                  │
└─────────────────────────────────────────────────────────────┘

SEMAINE 1: Tests Unitaires (RG-001 à RG-045)
├─ Jour 1-2: RG-001 à RG-020 (règles validation)
├─ Jour 3-4: RG-021 à RG-040 (règles calcul)
└─ Jour 5:   RG-041 à RG-045 (machines à états)

SEMAINE 2: Tests Unitaires (RG-046 à RG-090) + Début Intégration
├─ Jour 1-2: RG-046 à RG-070
├─ Jour 3-4: RG-071 à RG-090
└─ Jour 5:   UC-001 à UC-003 (tests intégration)

SEMAINE 3: Tests Intégration (UC-004 à UC-106)
├─ Jour 1:   UC-004 à UC-008 (domaine 1)
├─ Jour 2-3: UC-101 à UC-106 (domaine 2)
├─ Jour 4:   UC-201 à UC-203 (domaine 3)
└─ Jour 5:   UC-204 à UC-205 + Revue

SEMAINE 4: Tests E2E + Validation
├─ Jour 1-2: Parcours critiques E2E (5 tests)
├─ Jour 3:   Tests sécurité E2E (3 tests)
├─ Jour 4:   Vérification coverage + corrections
└─ Jour 5:   Documentation + Code review
```

---

## 🎯 Résumé : Les 10 Commandements des Tests

1. **Tu liras USE_CASES.md et BUSINESS_RULES.md** avant d'écrire un test
2. **Tu suivras la règle 70-20-10** (Unitaire/Intégration/E2E)
3. **Tu écriras en TDD** (Red → Green → Refactor)
4. **Tu nommeras explicitement** (`shouldDoX_WhenY`)
5. **Tu testeras les cas limites** (null, vide, max, min)
6. **Tu maintiendras les tests rapides** (<10ms unitaire, <500ms intégration)
7. **Tu rendras les tests indépendants** (pas d'ordre requis)
8. **Tu asserteras toujours** (au moins 1 assertion par test)
9. **Tu viseras 80%+ de coverage** (global)
10. **Tu documenteras les tests complexes** (Javadoc)

---

## 📅 Dernière Mise à Jour

**Date** : 2025-12-12
**Version** : 1.0
**Statut** : Document générique réutilisable pour tout projet

---

**Fin du document TEST_STRATEGY.md**
