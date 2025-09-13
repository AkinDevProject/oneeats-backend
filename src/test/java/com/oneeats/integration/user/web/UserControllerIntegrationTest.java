package com.oneeats.integration.user.web;

import com.oneeats.user.application.command.CreateUserCommand;
import com.oneeats.user.application.command.UpdateUserCommand;
import com.oneeats.user.application.command.AuthenticateUserCommand;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import io.restassured.http.ContentType;

import java.util.UUID;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * ✅ TESTS D'INTÉGRATION USER API REST
 * - Utilise @QuarkusTest (serveur HTTP complet)
 * - Vraies requêtes HTTP via RestAssured
 * - Vraie base de données PostgreSQL
 * - Teste le flux complet : HTTP → Controller → UseCase → Repository → DB
 */
@QuarkusTest
@DisplayName("User Controller Integration Tests - End-to-End API")
class UserControllerIntegrationTest {
    
    @Nested
    @DisplayName("User Registration API")
    class UserRegistrationApi {
        
        @Test
        @Transactional
        @DisplayName("Should create user via POST /api/users")
        void shouldCreateUserViaPostApi() {
            // Given
            CreateUserCommand command = new CreateUserCommand(
                "API",
                "User",
                "api@user.test.fr",
                "StrongPassword123!"
            );
            
            // When & Then - HTTP POST request
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .post("/api/users")
            .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("firstName", equalTo("API"))
                .body("lastName", equalTo("User"))
                .body("email", equalTo("api@user.test.fr"))
                .body("status", equalTo("ACTIVE"))
                .body("id", notNullValue())
                .body("createdAt", notNullValue())
                .body("hashedPassword", nullValue()); // Should not expose password
        }
        
        @Test
        @Transactional
        @DisplayName("Should reject invalid user creation")
        void shouldRejectInvalidUserCreation() {
            // Given - Invalid command (empty firstName)
            CreateUserCommand invalidCommand = new CreateUserCommand(
                "", // Invalid: empty firstName
                "User",
                "invalid-email", // Invalid email format
                "weak" // Weak password
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(invalidCommand)
            .when()
                .post("/api/users")
            .then()
                .statusCode(400); // Bad Request
        }
        
        @Test
        @Transactional
        @DisplayName("Should reject duplicate email")
        void shouldRejectDuplicateEmail() {
            // Given - Create first user
            CreateUserCommand firstUser = new CreateUserCommand(
                "First", "User", "duplicate@test.fr", "Password123!"
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(firstUser)
                .post("/api/users")
                .then()
                .statusCode(201);
            
            // When - Try to create user with same email
            CreateUserCommand duplicateUser = new CreateUserCommand(
                "Second", "User", "duplicate@test.fr", "Password123!"
            );
            
            // Then
            given()
                .contentType(ContentType.JSON)
                .body(duplicateUser)
            .when()
                .post("/api/users")
            .then()
                .statusCode(409); // Conflict
        }
    }
    
    @Nested
    @DisplayName("User Retrieval API")
    class UserRetrievalApi {
        
        @Test
        @Transactional
        @DisplayName("Should get user by ID via GET /api/users/{id}")
        void shouldGetUserByIdViaGetApi() {
            // Given - Create user first via API
            CreateUserCommand createCommand = new CreateUserCommand(
                "Retrievable", "User", "retrievable@test.fr", "Password123!"
            );
            
            String userId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/users")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // When & Then - HTTP GET request
            given()
            .when()
                .get("/api/users/{id}", userId)
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(userId))
                .body("firstName", equalTo("Retrievable"))
                .body("lastName", equalTo("User"))
                .body("email", equalTo("retrievable@test.fr"))
                .body("hashedPassword", nullValue()); // Should not expose password
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 404 for non-existent user")
        void shouldReturn404ForNonExistentUser() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            
            // When & Then
            given()
            .when()
                .get("/api/users/{id}", nonExistentId)
            .then()
                .statusCode(404);
        }
        
        @Test
        @Transactional
        @DisplayName("Should get all users via GET /api/users")
        void shouldGetAllUsersViaGetApi() {
            // Given - Create multiple users
            CreateUserCommand user1 = new CreateUserCommand(
                "User1", "LastName1", "user1@test.fr", "Password123!"
            );
            CreateUserCommand user2 = new CreateUserCommand(
                "User2", "LastName2", "user2@test.fr", "Password123!"
            );
            
            given().contentType(ContentType.JSON).body(user1).post("/api/users");
            given().contentType(ContentType.JSON).body(user2).post("/api/users");
            
            // When & Then - HTTP GET all
            given()
            .when()
                .get("/api/users")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("size()", greaterThanOrEqualTo(2))
                .body("find { it.firstName == 'User1' }", notNullValue())
                .body("find { it.firstName == 'User2' }", notNullValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should search users by name")
        void shouldSearchUsersByName() {
            // Given - Create users with searchable names
            CreateUserCommand johnUser = new CreateUserCommand(
                "John", "Smith", "john.smith@test.fr", "Password123!"
            );
            CreateUserCommand johnnyUser = new CreateUserCommand(
                "Johnny", "Doe", "johnny.doe@test.fr", "Password123!"
            );
            CreateUserCommand janeUser = new CreateUserCommand(
                "Jane", "Johnson", "jane.johnson@test.fr", "Password123!"
            );
            
            given().contentType(ContentType.JSON).body(johnUser).post("/api/users");
            given().contentType(ContentType.JSON).body(johnnyUser).post("/api/users");
            given().contentType(ContentType.JSON).body(janeUser).post("/api/users");
            
            // When & Then - Search by "John"
            given()
                .queryParam("search", "John")
            .when()
                .get("/api/users/search")
            .then()
                .statusCode(200)
                .body("size()", equalTo(2))
                .body("find { it.firstName == 'John' }", notNullValue())
                .body("find { it.firstName == 'Johnny' }", notNullValue());
        }
    }
    
    @Nested
    @DisplayName("User Update API")
    class UserUpdateApi {
        
        @Test
        @Transactional
        @DisplayName("Should update user via PUT /api/users/{id}")
        void shouldUpdateUserViaPutApi() {
            // Given - Create user first
            CreateUserCommand createCommand = new CreateUserCommand(
                "Original", "Name", "original@test.fr", "Password123!"
            );
            
            String userId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/users")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // When - Update via HTTP PUT
            UpdateUserCommand updateCommand = new UpdateUserCommand(
                UUID.fromString(userId),
                "Updated",
                "User",
                "0987654321"
            );
            
            // Then
            given()
                .contentType(ContentType.JSON)
                .body(updateCommand)
            .when()
                .put("/api/users/{id}", userId)
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(userId))
                .body("firstName", equalTo("Updated"))
                .body("lastName", equalTo("User"))
                .body("phone", equalTo("0987654321"))
                .body("updatedAt", notNullValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 404 when updating non-existent user")
        void shouldReturn404WhenUpdatingNonExistentUser() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            UpdateUserCommand command = new UpdateUserCommand(
                nonExistentId, "Updated", "Name", "0123456789"
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .put("/api/users/{id}", nonExistentId)
            .then()
                .statusCode(404);
        }
    }
    
    @Nested
    @DisplayName("User Status Management API")
    class UserStatusManagementApi {
        
        @Test
        @Transactional
        @DisplayName("Should suspend user via PATCH /api/users/{id}/suspend")
        void shouldSuspendUserViaPatchApi() {
            // Given - Create user
            CreateUserCommand createCommand = new CreateUserCommand(
                "Suspend", "User", "suspend@test.fr", "Password123!"
            );
            
            String userId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/users")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // When & Then - Suspend via HTTP PATCH
            given()
            .when()
                .patch("/api/users/{id}/suspend", userId)
            .then()
                .statusCode(200)
                .body("status", equalTo("SUSPENDED"));
        }
        
        @Test
        @Transactional
        @DisplayName("Should reactivate user via PATCH /api/users/{id}/reactivate")
        void shouldReactivateUserViaPatchApi() {
            // Given - Create and suspend user
            CreateUserCommand createCommand = new CreateUserCommand(
                "Reactivate", "User", "reactivate@test.fr", "Password123!"
            );
            
            String userId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/users")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // Suspend first
            given().patch("/api/users/{id}/suspend", userId);
            
            // When & Then - Reactivate
            given()
            .when()
                .patch("/api/users/{id}/reactivate", userId)
            .then()
                .statusCode(200)
                .body("status", equalTo("ACTIVE"));
        }
        
        @Test
        @Transactional
        @DisplayName("Should delete user via DELETE /api/users/{id}")
        void shouldDeleteUserViaDeleteApi() {
            // Given - Create user
            CreateUserCommand createCommand = new CreateUserCommand(
                "ToDelete", "User", "todelete@test.fr", "Password123!"
            );
            
            String userId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/users")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // When & Then - Delete
            given()
            .when()
                .delete("/api/users/{id}", userId)
            .then()
                .statusCode(204);
            
            // Verify deletion
            given()
            .when()
                .get("/api/users/{id}", userId)
            .then()
                .statusCode(404);
        }
    }
    
    @Nested
    @DisplayName("User Authentication API")
    class UserAuthenticationApi {
        
        @Test
        @Transactional
        @DisplayName("Should authenticate user with valid credentials")
        void shouldAuthenticateUserWithValidCredentials() {
            // Given - Create user
            CreateUserCommand createCommand = new CreateUserCommand(
                "AuthUser", "Test", "authuser@test.fr", "Password123!"
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(createCommand)
                .post("/api/users")
                .then()
                .statusCode(201);
            
            // When & Then - Authenticate
            AuthenticateUserCommand authCommand = new AuthenticateUserCommand(
                "authuser@test.fr", "Password123!"
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(authCommand)
            .when()
                .post("/api/users/authenticate")
            .then()
                .statusCode(200)
                .body("email", equalTo("authuser@test.fr"))
                .body("token", notNullValue())
                .body("expiresAt", notNullValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 401 for invalid credentials")
        void shouldReturn401ForInvalidCredentials() {
            // Given - Create user
            CreateUserCommand createCommand = new CreateUserCommand(
                "AuthUser2", "Test", "authuser2@test.fr", "Password123!"
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(createCommand)
                .post("/api/users")
                .then()
                .statusCode(201);
            
            // When & Then - Try to authenticate with wrong password
            AuthenticateUserCommand authCommand = new AuthenticateUserCommand(
                "authuser2@test.fr", "WrongPassword!"
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(authCommand)
            .when()
                .post("/api/users/authenticate")
            .then()
                .statusCode(401);
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 401 for non-existent user")
        void shouldReturn401ForNonExistentUser() {
            // When & Then
            AuthenticateUserCommand authCommand = new AuthenticateUserCommand(
                "nonexistent@test.fr", "Password123!"
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(authCommand)
            .when()
                .post("/api/users/authenticate")
            .then()
                .statusCode(401);
        }
    }
    
    @Nested
    @DisplayName("Email Management API")
    class EmailManagementApi {
        
        @Test
        @Transactional
        @DisplayName("Should update email via PATCH /api/users/{id}/email")
        void shouldUpdateEmailViaPatchApi() {
            // Given - Create user
            CreateUserCommand createCommand = new CreateUserCommand(
                "EmailUpdate", "User", "original@test.fr", "Password123!"
            );
            
            String userId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/users")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // When & Then - Update email
            Map<String, String> emailUpdate = Map.of("email", "newemail@test.fr");
            
            given()
                .contentType(ContentType.JSON)
                .body(emailUpdate)
            .when()
                .patch("/api/users/{id}/email", userId)
            .then()
                .statusCode(200)
                .body("email", equalTo("newemail@test.fr"))
                .body("emailVerified", equalTo(false)); // Should reset verification
        }
        
        @Test
        @Transactional
        @DisplayName("Should verify email via POST /api/users/{id}/verify-email")
        void shouldVerifyEmailViaPostApi() {
            // Given - Create user and get verification token
            CreateUserCommand createCommand = new CreateUserCommand(
                "VerifyEmail", "User", "verify@test.fr", "Password123!"
            );
            
            String userId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/users")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // Get verification token
            String verificationToken = given()
            .when()
                .post("/api/users/{id}/generate-verification-token", userId)
            .then()
                .statusCode(200)
                .extract()
                .path("token");
            
            // When & Then - Verify email with token
            Map<String, String> verification = Map.of("token", verificationToken);
            
            given()
                .contentType(ContentType.JSON)
                .body(verification)
            .when()
                .post("/api/users/{id}/verify-email", userId)
            .then()
                .statusCode(200)
                .body("emailVerified", equalTo(true));
        }
    }
    
    @Nested
    @DisplayName("API Content Type and Error Handling")
    class ApiContentTypeAndErrorHandling {
        
        @Test
        @Transactional
        @DisplayName("Should return JSON content type")
        void shouldReturnJsonContentType() {
            given()
            .when()
                .get("/api/users")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON);
        }
        
        @Test
        @Transactional
        @DisplayName("Should handle malformed UUID in path")
        void shouldHandleMalformedUuidInPath() {
            given()
            .when()
                .get("/api/users/{id}", "not-a-uuid")
            .then()
                .statusCode(400); // Bad Request for malformed UUID
        }
        
        @Test
        @Transactional
        @DisplayName("Should validate JSON content type for POST")
        void shouldValidateJsonContentTypeForPost() {
            CreateUserCommand command = new CreateUserCommand(
                "JSON", "Test", "json@test.fr", "Password123!"
            );
            
            given()
                .contentType(ContentType.JSON) // Correct content type
                .body(command)
            .when()
                .post("/api/users")
            .then()
                .statusCode(201);
        }
        
        @Test
        @Transactional
        @DisplayName("Should reject non-JSON content type for POST")
        void shouldRejectNonJsonContentTypeForPost() {
            given()
                .contentType("text/plain") // Wrong content type
                .body("some text")
            .when()
                .post("/api/users")
            .then()
                .statusCode(415); // Unsupported Media Type
        }
    }
}