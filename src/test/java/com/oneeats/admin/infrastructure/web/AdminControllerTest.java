package com.oneeats.admin.infrastructure.web;

import com.oneeats.admin.application.command.CreateAdminCommand;
import com.oneeats.admin.application.command.CreateAdminCommandHandler;
import com.oneeats.admin.application.dto.AdminDTO;
import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.admin.domain.model.AdminStatus;
import com.oneeats.shared.domain.exception.ValidationException;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@QuarkusTest
@DisplayName("AdminController Tests")
class AdminControllerTest {
    
    private static final String BASE_URL = "/api/admins";
    
    @Nested
    @DisplayName("Create Admin Endpoint")
    class CreateAdminEndpoint {
        
        @Test
        @DisplayName("Should create admin successfully with valid SUPER_ADMIN role")
        void shouldCreateAdminSuccessfullyWithValidSuperAdminRole() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "John",
                "Doe",
                "john.doe@test.com",
                "password123",
                AdminRole.SUPER_ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("firstName", equalTo("John"))
                .body("lastName", equalTo("Doe"))
                .body("email", equalTo("john.doe@test.com"))
                .body("role", equalTo("SUPER_ADMIN"))
                .body("id", notNullValue())
                .body("createdAt", notNullValue())
                .body("updatedAt", notNullValue());
        }
        
        @Test
        @DisplayName("Should create admin successfully with valid ADMIN role")
        void shouldCreateAdminSuccessfullyWithValidAdminRole() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Jane",
                "Smith",
                "jane.smith@test.com",
                "securePassword456",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("firstName", equalTo("Jane"))
                .body("lastName", equalTo("Smith"))
                .body("email", equalTo("jane.smith@test.com"))
                .body("role", equalTo("ADMIN"));
        }
        
        @Test
        @DisplayName("Should create admin successfully with valid MODERATOR role")
        void shouldCreateAdminSuccessfullyWithValidModeratorRole() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Bob",
                "Wilson",
                "bob.wilson@test.com",
                "moderatorPass789",
                AdminRole.MODERATOR
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("firstName", equalTo("Bob"))
                .body("lastName", equalTo("Wilson"))
                .body("email", equalTo("bob.wilson@test.com"))
                .body("role", equalTo("MODERATOR"));
        }
        
        @Test
        @DisplayName("Should return 400 when first name is blank")
        void shouldReturn400WhenFirstNameIsBlank() {
            // Given
            String requestBody = """
                {
                    "firstName": "",
                    "lastName": "Doe",
                    "email": "john.doe@test.com",
                    "password": "password123",
                    "role": "ADMIN"
                }
                """;
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(requestBody)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(400);
        }
        
        @Test
        @DisplayName("Should return 400 when last name is blank")
        void shouldReturn400WhenLastNameIsBlank() {
            // Given
            String requestBody = """
                {
                    "firstName": "John",
                    "lastName": "",
                    "email": "john.doe@test.com",
                    "password": "password123",
                    "role": "ADMIN"
                }
                """;
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(requestBody)
                .then()
                .statusCode(400);
        }
        
        @Test
        @DisplayName("Should return 400 when email is invalid")
        void shouldReturn400WhenEmailIsInvalid() {
            // Given
            String requestBody = """
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "invalid-email",
                    "password": "password123",
                    "role": "ADMIN"
                }
                """;
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(requestBody)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(400);
        }
        
        @Test
        @DisplayName("Should return 400 when password is blank")
        void shouldReturn400WhenPasswordIsBlank() {
            // Given
            String requestBody = """
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john.doe@test.com",
                    "password": "",
                    "role": "ADMIN"
                }
                """;
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(requestBody)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(400);
        }
        
        @Test
        @DisplayName("Should return 400 when role is null")
        void shouldReturn400WhenRoleIsNull() {
            // Given
            String requestBody = """
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john.doe@test.com",
                    "password": "password123",
                    "role": null
                }
                """;
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(requestBody)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(400);
        }
        
        @Test
        @DisplayName("Should return 400 when role is invalid")
        void shouldReturn400WhenRoleIsInvalid() {
            // Given
            String requestBody = """
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john.doe@test.com",
                    "password": "password123",
                    "role": "INVALID_ROLE"
                }
                """;
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(requestBody)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(400);
        }
        
        @Test
        @DisplayName("Should return 400 when request body is empty")
        void shouldReturn400WhenRequestBodyIsEmpty() {
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body("{}")
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(400);
        }
        
        @Test
        @DisplayName("Should return 400 when request body is malformed JSON")
        void shouldReturn400WhenRequestBodyIsMalformedJson() {
            // Given
            String malformedJson = """
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "john.doe@test.com",
                    "password": "password123",
                    "role": "ADMIN"
                    // Missing closing brace
                """;
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(malformedJson)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(400);
        }
        
        @Test
        @DisplayName("Should handle duplicate email gracefully")
        void shouldHandleDuplicateEmailGracefully() {
            // Given - Create first admin
            CreateAdminCommand firstCommand = new CreateAdminCommand(
                "First",
                "Admin",
                "duplicate@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(firstCommand)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201);
            
            // When - Try to create second admin with same email
            CreateAdminCommand duplicateCommand = new CreateAdminCommand(
                "Second",
                "Admin",
                "duplicate@test.com",
                "password456",
                AdminRole.MODERATOR
            );
            
            // Then - Should return error
            given()
                .contentType(ContentType.JSON)
                .body(duplicateCommand)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(anyOf(is(400), is(409))); // Bad Request or Conflict
        }
    }
    
    @Nested
    @DisplayName("Get Admin by ID Endpoint")
    class GetAdminByIdEndpoint {
        
        @Test
        @DisplayName("Should return 200 for get admin by ID endpoint (placeholder)")
        void shouldReturn200ForGetAdminByIdEndpoint() {
            // Given
            UUID adminId = UUID.randomUUID();
            
            // When & Then - This is a placeholder endpoint
            given()
                .when()
                .get(BASE_URL + "/" + adminId)
                .then()
                .statusCode(200);
        }
        
        @Test
        @DisplayName("Should accept valid UUID format")
        void shouldAcceptValidUuidFormat() {
            // Given
            UUID validId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
            
            // When & Then
            given()
                .when()
                .get(BASE_URL + "/" + validId)
                .then()
                .statusCode(200);
        }
        
        @Test
        @DisplayName("Should return 400 for invalid UUID format")
        void shouldReturn400ForInvalidUuidFormat() {
            // Given
            String invalidId = "not-a-uuid";
            
            // When & Then
            given()
                .when()
                .get(BASE_URL + "/" + invalidId)
                .then()
                .statusCode(400);
        }
    }
    
    @Nested
    @DisplayName("Content Type and Request Handling")
    class ContentTypeAndRequestHandling {
        
        @Test
        @DisplayName("Should accept application/json content type")
        void shouldAcceptApplicationJsonContentType() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Content",
                "Test",
                "content@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .contentType("application/json")
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201);
        }
        
        @Test
        @DisplayName("Should return 415 for unsupported content type")
        void shouldReturn415ForUnsupportedContentType() {
            // Given
            String xmlBody = """
                <?xml version="1.0"?>
                <admin>
                    <firstName>John</firstName>
                    <lastName>Doe</lastName>
                </admin>
                """;
            
            // When & Then
            given()
                .contentType("application/xml")
                .body(xmlBody)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(415); // Unsupported Media Type
        }
        
        @Test
        @DisplayName("Should return JSON response")
        void shouldReturnJsonResponse() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Response",
                "Test",
                "response@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .contentType(ContentType.JSON);
        }
        
        @Test
        @DisplayName("Should handle missing content type gracefully")
        void shouldHandleMissingContentTypeGracefully() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "NoContent",
                "Type",
                "nocontent@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(anyOf(is(201), is(400), is(415))); // May succeed or fail depending on implementation
        }
    }
    
    @Nested
    @DisplayName("Response Format and Data")
    class ResponseFormatAndData {
        
        @Test
        @DisplayName("Should return all required fields in response")
        void shouldReturnAllRequiredFieldsInResponse() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Complete",
                "Response",
                "complete@response.com",
                "password123",
                AdminRole.SUPER_ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("id", notNullValue())
                .body("firstName", equalTo("Complete"))
                .body("lastName", equalTo("Response"))
                .body("email", equalTo("complete@response.com"))
                .body("role", equalTo("SUPER_ADMIN"))
                .body("status", notNullValue())
                .body("createdAt", notNullValue())
                .body("updatedAt", notNullValue());
        }
        
        @Test
        @DisplayName("Should not return password in response")
        void shouldNotReturnPasswordInResponse() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Secure",
                "Admin",
                "secure@admin.com",
                "secretPassword123",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("password", nullValue())
                .body("passwordHash", nullValue());
        }
        
        @Test
        @DisplayName("Should return valid UUID format for ID")
        void shouldReturnValidUuidFormatForId() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "UUID",
                "Test",
                "uuid@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("id", matchesRegex("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"));
        }
        
        @Test
        @DisplayName("Should return ISO datetime format for timestamps")
        void shouldReturnIsoDatetimeFormatForTimestamps() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Timestamp",
                "Test",
                "timestamp@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("createdAt", matchesRegex("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.*"))
                .body("updatedAt", matchesRegex("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.*"));
        }
    }
    
    @Nested
    @DisplayName("Edge Cases and Error Handling")
    class EdgeCasesAndErrorHandling {
        
        @Test
        @DisplayName("Should handle very long names within limits")
        void shouldHandleVeryLongNamesWithinLimits() {
            // Given - Names with exactly 50 characters (should be allowed)
            String longFirstName = "A".repeat(50);
            String longLastName = "B".repeat(50);
            
            CreateAdminCommand command = new CreateAdminCommand(
                longFirstName,
                longLastName,
                "longname@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("firstName", equalTo(longFirstName))
                .body("lastName", equalTo(longLastName));
        }
        
        @Test
        @DisplayName("Should handle special characters in names")
        void shouldHandleSpecialCharactersInNames() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Jean-Pierre",
                "O'Connor",
                "jeanpierre@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("firstName", equalTo("Jean-Pierre"))
                .body("lastName", equalTo("O'Connor"));
        }
        
        @Test
        @DisplayName("Should handle Unicode characters in names")
        void shouldHandleUnicodeCharactersInNames() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "José",
                "Müller",
                "jose@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
                .when()
                .post(BASE_URL)
                .then()
                .statusCode(201)
                .body("firstName", equalTo("José"))
                .body("lastName", equalTo("Müller"));
        }
    }
}