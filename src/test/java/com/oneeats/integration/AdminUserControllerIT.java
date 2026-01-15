package com.oneeats.integration;

import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.infrastructure.entity.UserEntity;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.restassured.http.ContentType;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;

import java.time.LocalDateTime;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Integration tests for AdminUserController
 * Tests the full HTTP request/response cycle with database
 */
@QuarkusTest
@TestProfile(IntegrationTestProfile.class)
@DisplayName("AdminUserController Integration Tests")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminUserControllerIT {

    private static UUID testUserId;
    private static final String BASE_PATH = "/api/admin/users";

    @BeforeAll
    @Transactional
    static void setup() {
        // Create test users
        testUserId = UUID.randomUUID();
        UserEntity user1 = new UserEntity(
            testUserId,
            "John",
            "Doe",
            "john.doe@test.com",
            "hashed_password",
            UserStatus.ACTIVE,
            "0123456789",
            "123 Test Street",
            LocalDateTime.now(),
            LocalDateTime.now()
        );
        user1.persist();

        UserEntity user2 = new UserEntity(
            UUID.randomUUID(),
            "Jane",
            "Smith",
            "jane.smith@test.com",
            "hashed_password",
            UserStatus.SUSPENDED,
            "0987654321",
            "456 Test Avenue",
            LocalDateTime.now(),
            LocalDateTime.now()
        );
        user2.persist();

        UserEntity user3 = new UserEntity(
            UUID.randomUUID(),
            "Bob",
            "Johnson",
            "bob.johnson@test.com",
            "hashed_password",
            UserStatus.INACTIVE,
            null,
            null,
            LocalDateTime.now(),
            LocalDateTime.now()
        );
        user3.persist();
    }

    @Nested
    @DisplayName("GET /api/admin/users - List Users")
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
                .body("totalElements", greaterThanOrEqualTo(3));
        }

        @Test
        @Order(2)
        @DisplayName("Should filter by search term")
        void shouldFilterBySearchTerm() {
            given()
                .contentType(ContentType.JSON)
                .queryParam("search", "john")
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(200)
                .body("content.size()", greaterThanOrEqualTo(1))
                .body("content[0].firstName", containsStringIgnoringCase("john"));
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
                .queryParam("size", 2)
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(200)
                .body("pageSize", equalTo(2))
                .body("content.size()", lessThanOrEqualTo(2));
        }
    }

    @Nested
    @DisplayName("GET /api/admin/users/{id} - Get User Details")
    class GetUserDetails {

        @Test
        @Order(5)
        @DisplayName("Should return user details with order stats")
        void shouldReturnUserDetails() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH + "/" + testUserId)
            .then()
                .statusCode(200)
                .body("id", equalTo(testUserId.toString()))
                .body("firstName", equalTo("John"))
                .body("lastName", equalTo("Doe"))
                .body("email", equalTo("john.doe@test.com"))
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
    class UpdateUser {

        @Test
        @Order(7)
        @DisplayName("Should update user information")
        void shouldUpdateUser() {
            String updateRequest = """
                {
                    "firstName": "Johnny",
                    "lastName": "Doe-Updated",
                    "phone": "0111222333"
                }
                """;

            given()
                .contentType(ContentType.JSON)
                .body(updateRequest)
            .when()
                .put(BASE_PATH + "/" + testUserId)
            .then()
                .statusCode(200)
                .body("firstName", equalTo("Johnny"))
                .body("lastName", equalTo("Doe-Updated"));
        }

        @Test
        @Order(8)
        @DisplayName("Should validate email uniqueness on update")
        void shouldValidateEmailUniqueness() {
            String updateRequest = """
                {
                    "email": "jane.smith@test.com"
                }
                """;

            given()
                .contentType(ContentType.JSON)
                .body(updateRequest)
            .when()
                .put(BASE_PATH + "/" + testUserId)
            .then()
                .statusCode(400); // Email already exists
        }
    }

    @Nested
    @DisplayName("PATCH /api/admin/users/{id}/status - Change Status")
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
                .patch(BASE_PATH + "/" + testUserId + "/status")
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
                .patch(BASE_PATH + "/" + testUserId + "/status")
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
                .patch(BASE_PATH + "/" + testUserId + "/status")
            .then()
                .statusCode(400);
        }
    }
}
