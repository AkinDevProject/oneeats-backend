package com.oneeats.integration;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Integration tests for AdminUserController
 * Tests the full HTTP request/response cycle with database
 *
 * Note: Uses import.sql for test data. The test user IDs match those in import.sql.
 * - User 1: test@oneeats.com (Test User) - ID: f47ac10b-58cc-4372-a567-0e02b2c3d479
 * - User 2: user2@oneeats.com (User Two) - ID: f47ac10b-58cc-4372-a567-0e02b2c3d480
 */
@QuarkusTest
@TestProfile(IntegrationTestProfile.class)
@DisplayName("AdminUserController Integration Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminUserControllerIT {

    // Uses test user from import.sql
    private static final UUID TEST_USER_ID = UUID.fromString("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    private static final UUID TEST_USER_2_ID = UUID.fromString("f47ac10b-58cc-4372-a567-0e02b2c3d480");
    private static final String BASE_PATH = "/api/admin/users";

    @Nested
    @DisplayName("GET /api/admin/users - List Users")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class ListUsers {

        @Test
        @Order(1)
        @DisplayName("Should return paginated list of users")
        void shouldReturnPaginatedList() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(200)
                .body("content", notNullValue())
                .body("currentPage", equalTo(0))
                .body("pageSize", equalTo(20))
                .body("totalElements", greaterThanOrEqualTo(2));
        }

        @Test
        @Order(2)
        @DisplayName("Should filter by search term")
        void shouldFilterBySearchTerm() {
            given()
                .contentType(ContentType.JSON)
                .queryParam("search", "test")
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(200)
                .body("content.size()", greaterThanOrEqualTo(1));
        }

        @Test
        @Order(3)
        @DisplayName("Should filter by status")
        void shouldFilterByStatus() {
            given()
                .contentType(ContentType.JSON)
                .queryParam("status", "ACTIVE")
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(200)
                .body("content.findAll { it.status == 'ACTIVE' }.size()", greaterThanOrEqualTo(1));
        }

        @Test
        @Order(4)
        @DisplayName("Should support custom pagination")
        void shouldSupportCustomPagination() {
            given()
                .contentType(ContentType.JSON)
                .queryParam("page", 0)
                .queryParam("size", 1)
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(200)
                .body("pageSize", equalTo(1))
                .body("content.size()", lessThanOrEqualTo(1));
        }
    }

    @Nested
    @DisplayName("GET /api/admin/users/{id} - Get User Details")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class GetUserDetails {

        @Test
        @Order(5)
        @DisplayName("Should return user details with order stats")
        void shouldReturnUserDetails() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH + "/" + TEST_USER_ID)
            .then()
                .statusCode(200)
                .body("id", equalTo(TEST_USER_ID.toString()))
                .body("firstName", equalTo("Test"))
                .body("lastName", equalTo("User"))
                .body("email", equalTo("test@oneeats.com"))
                .body("status", equalTo("ACTIVE"))
                .body("orderCount", notNullValue());
        }

        @Test
        @Order(6)
        @DisplayName("Should return 404 for non-existent user")
        void shouldReturn404ForNonExistentUser() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH + "/" + UUID.randomUUID())
            .then()
                .statusCode(404);
        }
    }

    @Nested
    @DisplayName("PUT /api/admin/users/{id} - Update User")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class UpdateUser {

        @Test
        @Order(7)
        @DisplayName("Should update user information")
        void shouldUpdateUser() {
            // Utilise TEST_USER_2_ID pour ne pas affecter les autres tests
            String updateRequest = """
                {
                    "firstName": "User2Updated",
                    "lastName": "TwoUpdated",
                    "phone": "0111222333"
                }
                """;

            given()
                .contentType(ContentType.JSON)
                .body(updateRequest)
            .when()
                .put(BASE_PATH + "/" + TEST_USER_2_ID)
            .then()
                .statusCode(200)
                .body("firstName", equalTo("User2Updated"))
                .body("lastName", equalTo("TwoUpdated"));
        }

        @Test
        @Order(8)
        @DisplayName("Should validate email uniqueness on update")
        void shouldValidateEmailUniqueness() {
            // Essaie de changer l'email de TEST_USER_2 vers celui de TEST_USER
            String updateRequest = """
                {
                    "email": "test@oneeats.com"
                }
                """;

            given()
                .contentType(ContentType.JSON)
                .body(updateRequest)
            .when()
                .put(BASE_PATH + "/" + TEST_USER_2_ID)
            .then()
                .statusCode(400); // Email already exists
        }
    }

    @Nested
    @DisplayName("PATCH /api/admin/users/{id}/status - Change Status")
    @TestMethodOrder(MethodOrderer.OrderAnnotation.class)
    class ChangeStatus {

        @Test
        @Order(9)
        @DisplayName("Should change user status to SUSPENDED")
        void shouldChangeStatusToSuspended() {
            String statusRequest = """
                {
                    "status": "SUSPENDED"
                }
                """;

            given()
                .contentType(ContentType.JSON)
                .body(statusRequest)
            .when()
                .patch(BASE_PATH + "/" + TEST_USER_ID + "/status")
            .then()
                .statusCode(200)
                .body("status", equalTo("SUSPENDED"));
        }

        @Test
        @Order(10)
        @DisplayName("Should change user status back to ACTIVE")
        void shouldChangeStatusBackToActive() {
            String statusRequest = """
                {
                    "status": "ACTIVE"
                }
                """;

            given()
                .contentType(ContentType.JSON)
                .body(statusRequest)
            .when()
                .patch(BASE_PATH + "/" + TEST_USER_ID + "/status")
            .then()
                .statusCode(200)
                .body("status", equalTo("ACTIVE"));
        }

        @Test
        @Order(11)
        @DisplayName("Should return 400 for null status")
        void shouldReturn400ForNullStatus() {
            String statusRequest = """
                {
                    "status": null
                }
                """;

            given()
                .contentType(ContentType.JSON)
                .body(statusRequest)
            .when()
                .patch(BASE_PATH + "/" + TEST_USER_ID + "/status")
            .then()
                .statusCode(400);
        }
    }
}
