---
title: 'Tests MVP - WebSocket & Auth Backend'
slug: 'tests-mvp-websocket-auth'
created: '2026-01-16'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - Quarkus 3.24.2
  - JUnit 5
  - Mockito
  - RestAssured
  - Jakarta WebSocket
files_to_modify:
  - src/test/java/com/oneeats/unit/websocket/NotificationWebSocketTest.java (new)
  - src/test/java/com/oneeats/unit/websocket/RestaurantWebSocketTest.java (new)
  - src/test/java/com/oneeats/unit/websocket/WebSocketNotificationServiceTest.java (new)
  - src/test/java/com/oneeats/unit/security/AuthServiceTest.java (new)
  - src/test/java/com/oneeats/integration/security/AuthControllerIT.java (new)
  - src/test/java/com/oneeats/integration/websocket/WebSocketIT.java (new)
code_patterns:
  - JUnit 5 @Nested classes for organization
  - @DisplayName for readable test names
  - Mockito @Mock and @InjectMocks
  - @QuarkusTest for integration tests
  - Given/When/Then structure
test_patterns:
  - Unit tests: Mock dependencies, test logic in isolation
  - Integration tests: @QuarkusTest with real server
  - WebSocket tests: Client WebSocket for connection testing
---

# Tech-Spec: Tests MVP - WebSocket & Auth Backend

**Created:** 2026-01-16
**Status:** Implementation Complete
**Effort estimé:** 2-3 jours

---

## Overview

### Problem Statement

Le MVP OneEats est à 95% complet. Les fonctionnalités WebSocket (notifications temps réel) et Auth (Keycloak integration) sont **implémentées mais non testées**. Cela représente un risque de régression et empêche la validation complète du MVP.

### Solution

Créer des suites de tests complètes (unitaires + intégration) pour :
1. **WebSocket Backend** : 3 classes (NotificationWebSocket, RestaurantWebSocket, WebSocketNotificationService)
2. **Auth Backend** : 2 classes (AuthService, AuthController)

Approche : Mocks pour tests unitaires rapides, tests d'intégration pour validation end-to-end.

### Scope

**In Scope:**
- Tests unitaires WebSocket (logique de connexion, heartbeat, notifications)
- Tests unitaires Auth (mapping Keycloak, rôles, permissions restaurant)
- Tests d'intégration AuthController (4 endpoints REST)
- Tests d'intégration WebSocket (connexion réelle)

**Out of Scope:**
- Tests mobile WebSocket (déjà couverts par Jest)
- Tests E2E Playwright (déjà implémentés)
- Tests Keycloak complets (DevServices trop lourd pour MVP)

---

## Context for Development

### Codebase Patterns

**Pattern de test unitaire existant (voir OrderTest.java):**
```java
@DisplayName("Feature Unit Tests")
class FeatureTest {

    @Nested
    @DisplayName("Scenario Group")
    class ScenarioGroup {

        @Test
        @DisplayName("Should do something when condition")
        void shouldDoSomethingWhenCondition() {
            // Given
            // When
            // Then
        }
    }
}
```

**Pattern d'intégration existant (voir AdminUserControllerIT.java):**
```java
@QuarkusTest
@TestProfile(IntegrationTestProfile.class)
@DisplayName("Feature Integration Tests")
class FeatureIT {

    @Test
    @DisplayName("Should return expected response")
    void shouldReturnExpectedResponse() {
        given()
            .contentType(ContentType.JSON)
        .when()
            .get("/api/endpoint")
        .then()
            .statusCode(200)
            .body("field", equalTo("value"));
    }
}
```

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `src/main/java/com/oneeats/notification/infrastructure/websocket/NotificationWebSocket.java` | WebSocket utilisateur - connexions, heartbeat, notifications |
| `src/main/java/com/oneeats/notification/infrastructure/websocket/RestaurantWebSocket.java` | WebSocket restaurant - multi-sessions, notifications commandes |
| `src/main/java/com/oneeats/notification/infrastructure/websocket/WebSocketNotificationService.java` | Service envoi notifications JSON |
| `src/main/java/com/oneeats/security/application/AuthService.java` | Service auth - mapping Keycloak/DB, permissions |
| `src/main/java/com/oneeats/security/infrastructure/controller/AuthController.java` | REST API auth - /me, /status, /restaurants |
| `src/test/java/com/oneeats/unit/order/domain/OrderTest.java` | Exemple pattern tests unitaires |
| `src/test/java/com/oneeats/integration/AdminUserControllerIT.java` | Exemple pattern tests intégration |

### Technical Decisions

1. **Mocking Keycloak** : Utiliser `@InjectMock` pour `SecurityIdentity` et `JsonWebToken` - évite la dépendance Keycloak DevServices
2. **WebSocket Testing** : Tests unitaires mockent `Session`, tests d'intégration utilisent client WebSocket Java
3. **Coverage** : Viser 80%+ sur les classes testées
4. **Pas de tests E2E WebSocket** : Trop complexe pour le MVP, les tests unitaires + intégration suffisent

---

## Implementation Plan

### Phase 1: Tests Unitaires WebSocket (~1 jour)

#### Task 1.1: Créer NotificationWebSocketTest.java

- **File:** `src/test/java/com/oneeats/unit/websocket/NotificationWebSocketTest.java`
- **Action:** Créer la classe de test avec les scénarios suivants

```java
package com.oneeats.unit.websocket;

import com.oneeats.notification.infrastructure.websocket.NotificationWebSocket;
import jakarta.websocket.*;
import org.junit.jupiter.api.*;
import org.mockito.*;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@DisplayName("NotificationWebSocket Unit Tests")
class NotificationWebSocketTest {

    private NotificationWebSocket webSocket;

    @Mock private Session session;
    @Mock private RemoteEndpoint.Async asyncRemote;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        webSocket = new NotificationWebSocket();
        when(session.getAsyncRemote()).thenReturn(asyncRemote);
        when(session.getId()).thenReturn("test-session-id");
        when(session.isOpen()).thenReturn(true);
    }

    @Nested
    @DisplayName("Connection Lifecycle")
    class ConnectionLifecycle {
        // Tests: onOpen valid, onOpen invalid UUID, onClose, onError
    }

    @Nested
    @DisplayName("Message Handling")
    class MessageHandling {
        // Tests: heartbeat, echo, invalid message
    }

    @Nested
    @DisplayName("Notification Sending")
    class NotificationSending {
        // Tests: sendNotificationToUser with/without active session
    }

    @Nested
    @DisplayName("Connection Status")
    class ConnectionStatus {
        // Tests: isUserConnected, getActiveConnectionsCount
    }
}
```

**Scénarios implémentés:**
- [x] `shouldAddSessionOnValidUserIdConnection` - onOpen avec UUID valide
- [x] `shouldRejectInvalidUserIdFormat` - onOpen avec UUID invalide
- [x] `shouldRemoveSessionOnClose` - onClose supprime la session
- [x] `shouldRemoveSessionOnError` - onError supprime la session
- [x] `shouldRespondToHeartbeat` - onMessage heartbeat → réponse
- [x] `shouldEchoOtherMessages` - onMessage autre → écho
- [x] `shouldSendNotificationToConnectedUser` - sendNotificationToUser avec session active
- [x] `shouldSkipNotificationForDisconnectedUser` - sendNotificationToUser sans session
- [x] `shouldReturnCorrectConnectionStatus` - isUserConnected true/false
- [x] `shouldCountActiveConnections` - getActiveConnectionsCount

---

#### Task 1.2: Créer RestaurantWebSocketTest.java

- **File:** `src/test/java/com/oneeats/unit/websocket/RestaurantWebSocketTest.java`
- **Action:** Créer la classe de test pour multi-sessions restaurant

**Scénarios implémentés:**
- [x] `shouldAddSessionToRestaurantSet` - onOpen ajoute au Set
- [x] `shouldSupportMultipleSessionsPerRestaurant` - 3 sessions même restaurant
- [x] `shouldRemoveSessionOnClose` - onClose supprime, nettoie Set si vide
- [x] `shouldSendToAllRestaurantSessions` - sendNotificationToRestaurant broadcast
- [x] `shouldDetectConnectedRestaurant` - isRestaurantConnected
- [x] `shouldCountRestaurantSessions` - getRestaurantSessionCount
- [x] `shouldCountConnectedRestaurants` - getConnectedRestaurantsCount
- [x] `shouldCountTotalSessions` - getTotalSessionsCount

---

#### Task 1.3: Créer WebSocketNotificationServiceTest.java

- **File:** `src/test/java/com/oneeats/unit/websocket/WebSocketNotificationServiceTest.java`
- **Action:** Tester le service avec ObjectMapper mocké

**Scénarios implémentés:**
- [x] `shouldSendOrderStatusNotificationWhenUserConnected`
- [x] `shouldSkipOrderStatusNotificationWhenUserDisconnected`
- [x] `shouldSendGeneralNotification`
- [x] `shouldSendNewOrderToRestaurant`
- [x] `shouldSendOrderStatusChangeToRestaurant`
- [x] `shouldHandleJsonProcessingError`

---

### Phase 2: Tests Unitaires Auth (~0.5 jour)

#### Task 2.1: Créer AuthServiceTest.java

- **File:** `src/test/java/com/oneeats/unit/security/AuthServiceTest.java`
- **Action:** Créer tests avec mocks SecurityIdentity et JsonWebToken

```java
package com.oneeats.unit.security;

import com.oneeats.security.application.AuthService;
import com.oneeats.security.infrastructure.repository.JpaRestaurantStaffRepository;
import com.oneeats.user.infrastructure.repository.JpaUserRepository;
import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.junit.jupiter.api.*;
import org.mockito.*;
import static org.mockito.Mockito.*;

@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock SecurityIdentity securityIdentity;
    @Mock JsonWebToken jwt;
    @Mock JpaUserRepository userRepository;
    @Mock JpaRestaurantStaffRepository staffRepository;

    @InjectMocks AuthService authService;

    @Nested
    @DisplayName("Current User Resolution")
    class CurrentUserResolution {
        // Tests: anonymous, existing user, new user creation
    }

    @Nested
    @DisplayName("Role Management")
    class RoleManagement {
        // Tests: getCurrentUserRoles, hasRole
    }

    @Nested
    @DisplayName("Restaurant Access")
    class RestaurantAccess {
        // Tests: hasAccessToRestaurant, getStaffRoleForRestaurant, canManageMenu, canManageStaff
    }
}
```

**Scénarios implémentés:**
- [x] `shouldReturnEmptyForAnonymousUser`
- [x] `shouldReturnExistingUser`
- [x] `shouldCreateNewUserOnFirstLogin`
- [x] `shouldMapKeycloakClaimsToUser`
- [x] `shouldDelegateRolesToSecurityIdentity`
- [x] `shouldCheckRestaurantAccessViaStaffRepository`
- [x] `shouldAllowMenuManagementForOwnerAndManager`
- [x] `shouldAllowStaffManagementOnlyForOwner`
- [x] `shouldBuildCompleteCurrentUserDTO`

---

### Phase 3: Tests Intégration Auth (~0.5 jour)

#### Task 3.1: Créer AuthControllerIT.java

- **File:** `src/test/java/com/oneeats/integration/security/AuthControllerIT.java`
- **Action:** Créer tests d'intégration avec @TestSecurity

```java
package com.oneeats.integration.security;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
@DisplayName("AuthController Integration Tests")
class AuthControllerIT {

    private static final String BASE_PATH = "/api/auth";

    @Nested
    @DisplayName("GET /api/auth/status - Auth Status Check")
    class AuthStatus {
        // Public endpoint - no auth required
    }

    @Nested
    @DisplayName("GET /api/auth/me - Current User Info")
    class CurrentUserInfo {
        // Protected endpoint - requires auth
    }

    @Nested
    @DisplayName("GET /api/auth/restaurants - User Restaurants")
    class UserRestaurants {
        // Protected endpoint - requires auth
    }
}
```

**Scénarios implémentés:**
- [x] `shouldReturnAuthenticatedFalseForAnonymous` - GET /status sans auth
- [x] `shouldReturn401ForUnauthenticatedMe` - GET /me sans auth
- [x] `shouldReturnCurrentUserInfoWhenAuthenticated` - GET /me avec @TestSecurity
- [x] `shouldReturnUserRestaurantsWhenAuthenticated` - GET /restaurants
- [x] `shouldCheckRestaurantAccess` - GET /access/restaurant/{id}

---

### Phase 4: Tests Intégration WebSocket (optionnel, ~0.5 jour)

#### Task 4.1: Créer WebSocketIT.java

- **File:** `src/test/java/com/oneeats/integration/websocket/WebSocketIT.java`
- **Action:** Créer tests WebSocket avec client Java

**Scénarios implémentés:**
- [x] `shouldConnectToNotificationEndpoint`
- [x] `shouldReceiveConnectionConfirmation`
- [x] `shouldRespondToHeartbeat`
- [x] `shouldConnectToRestaurantEndpoint`

---

## Acceptance Criteria

### AC-1: Tests WebSocket Connection
```gherkin
Given le NotificationWebSocket
When un user avec UUID valide "550e8400-e29b-41d4-a716-446655440000" se connecte
Then la session est stockée dans la map sessions
And un message JSON {"type":"connected","message":"WebSocket connected successfully"} est envoyé
And getActiveConnectionsCount() retourne 1
```

### AC-2: Tests WebSocket Invalid UUID
```gherkin
Given le NotificationWebSocket
When un user avec UUID invalide "not-a-uuid" tente de se connecter
Then la session est fermée avec CloseReason CANNOT_ACCEPT
And la map sessions reste vide
```

### AC-3: Tests WebSocket Multi-Session Restaurant
```gherkin
Given le RestaurantWebSocket
When 3 sessions différentes se connectent au restaurant "550e8400-e29b-41d4-a716-446655440000"
Then les 3 sessions sont dans le Set du restaurant
And getRestaurantSessionCount(restaurantId) retourne 3
And getConnectedRestaurantsCount() retourne 1
```

### AC-4: Tests WebSocket Notification Broadcast
```gherkin
Given le RestaurantWebSocket avec 3 sessions connectées au même restaurant
When sendNotificationToRestaurant(restaurantId, notification) est appelé
Then les 3 sessions reçoivent la notification
And le log indique "sent to restaurant... (3 sessions)"
```

### AC-5: Tests Auth Anonymous User
```gherkin
Given un SecurityIdentity anonyme (isAnonymous() = true)
When getCurrentUser() est appelé
Then Optional.empty() est retourné
And aucune interaction avec userRepository
```

### AC-6: Tests Auth New User Creation
```gherkin
Given un token JWT valide avec subject "keycloak-123"
And userRepository.findByKeycloakId() retourne Optional.empty()
When getCurrentUser() est appelé
Then un nouvel UserEntity est créé avec keycloakId "keycloak-123"
And les claims email, given_name, family_name sont mappés
And userRepository.persist() est appelé
```

### AC-7: Tests Auth Controller Unauthorized
```gherkin
Given aucune authentification
When GET /api/auth/me
Then HTTP 401 Unauthorized est retourné
```

### AC-8: Tests Auth Controller Status
```gherkin
Given aucune authentification
When GET /api/auth/status
Then HTTP 200 est retourné
And body contient {"authenticated": false, "email": null}
```

### AC-9: Tests Build Success
```gherkin
Given tous les nouveaux fichiers de test créés
When mvn test est exécuté
Then tous les tests passent (0 failures)
And la couverture des classes testées est >= 80%
```

---

## Additional Context

### Dependencies

**Dépendances existantes (déjà dans pom.xml) - AUCUNE NOUVELLE REQUISE:**
- `quarkus-junit5` - Tests Quarkus
- `rest-assured` - Tests HTTP
- `mockito-core` - Mocking
- `quarkus-test-security` - @TestSecurity annotation

### Testing Strategy

| Type | Fichiers | Commande |
|------|----------|----------|
| Unit | `*Test.java` (4 fichiers) | `mvn test -Dtest="*Test"` |
| Integration | `*IT.java` (2 fichiers) | `mvn verify -Dtest="*IT"` |
| All | Tous | `mvn verify` |

### Mocking Strategy

| Dépendance | Technique | Usage |
|------------|-----------|-------|
| `Session` (WebSocket) | `@Mock` Mockito | Tests unitaires WebSocket |
| `RemoteEndpoint.Async` | `@Mock` Mockito | Vérifier envois messages |
| `SecurityIdentity` | `@Mock` Mockito | Tests unitaires Auth |
| `JsonWebToken` | `@Mock` Mockito | Tests unitaires Auth |
| `JpaUserRepository` | `@Mock` Mockito | Tests unitaires Auth |
| Auth in IT | `@TestSecurity` | Tests intégration Auth |

### Risques et Mitigations

| Risque | Mitigation |
|--------|------------|
| WebSocket static methods difficiles à mocker | Utiliser PowerMock ou refactorer en instance methods |
| Keycloak DevServices slow | Éviter - utiliser @TestSecurity |
| Tests WebSocket IT flaky | Ajouter timeouts et retry logic |

### Notes d'implémentation

1. **WebSocket static methods** : Les méthodes `sendNotificationToUser` et `sendNotificationToRestaurant` sont statiques. Pour les tests unitaires du service, on peut :
   - Option A : Les refactorer en instance methods (recommandé)
   - Option B : Utiliser Mockito `mockStatic()` (plus complexe)

2. **Tests d'intégration Auth** : Utiliser `@TestSecurity(user = "testuser", roles = {"user"})` pour simuler un utilisateur authentifié sans démarrer Keycloak

3. **Ordre d'exécution** : Phase 1 → Phase 2 → Phase 3 → Phase 4 (optionnel)

4. **Structure des packages test** :
   ```
   src/test/java/com/oneeats/
   ├── unit/
   │   ├── websocket/
   │   │   ├── NotificationWebSocketTest.java
   │   │   ├── RestaurantWebSocketTest.java
   │   │   └── WebSocketNotificationServiceTest.java
   │   └── security/
   │       └── AuthServiceTest.java
   └── integration/
       ├── security/
       │   └── AuthControllerIT.java
       └── websocket/
           └── WebSocketIT.java
   ```

---

## Review Notes

**Adversarial review completed: 2026-01-16**

- **Findings total:** 12 (1 Critical, 3 High, 6 Medium, 2 Low)
- **Findings fixed:** 8 (F1, F2, F6, F7, F8, F9, F11, F12)
- **Findings skipped:** 4 (F3, F4, F5, F10 - limitations design ou hors scope MVP)
- **Resolution approach:** Auto-fix

### Corrections appliquées:

1. **F1 (Critical):** Ajout de `@TestMethodOrder` pour éviter l'exécution parallèle des tests manipulant l'état statique
2. **F2 (High):** Remplacement des assertions `anyOf(200, 401)` par des tests significatifs avec explications claires
3. **F6 (Medium):** Ajout de 5 tests pour `addStaffMember` dans AuthServiceTest
4. **F7 (Medium):** Augmentation du timeout à 10s et ajout de vérifications sur les messages consommés
5. **F8 (Medium):** Ajout d'assertions pour `status`, `passwordHash`, et `createdAt` dans le test de création utilisateur
6. **F9 (Low):** Ajout de tests edge cases pour whitespace et caractères spéciaux dans AuthControllerIT
7. **F11 (Medium):** Ajout de tests de rejet UUID invalide dans WebSocketIT
8. **F12 (Medium):** Ajout de tests de validation d'entrée dans AuthControllerIT

### Limitations acceptées:

- **F3 (High):** Les WebSocket acceptent tout UUID sans vérification d'autorisation - limitation du design actuel
- **F4 (High):** WebSocketNotificationServiceTest utilise reflection car les méthodes WebSocket sont statiques
- **F5 (Medium):** Tests de concurrence hors scope MVP
- **F10 (Low):** Tests DTO conservés pour documentation/vérification compilation
