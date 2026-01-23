package com.oneeats.integration.security;

import com.oneeats.integration.IntegrationTestProfile;
import com.oneeats.security.Roles;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Tests d'integration pour la securite RBAC (Role-Based Access Control)
 *
 * Valide les annotations @RolesAllowed, @PermitAll, @Authenticated
 * sur les endpoints des differents controllers.
 *
 * Roles testes:
 * - ADMIN : Acces complet
 * - RESTAURANT : Gestion de son restaurant
 * - USER : Client qui passe des commandes
 *
 * @see ADR-006-rbac-mvp.md
 */
@QuarkusTest
@TestProfile(IntegrationTestProfile.class)
@DisplayName("RBAC Security Integration Tests")
class RbacSecurityIT {

    // ==========================================================================
    // AdminUserController Tests - @RolesAllowed(Roles.ADMIN)
    // ==========================================================================

    @Nested
    @DisplayName("AdminUserController - /api/admin/users (ADMIN ONLY)")
    class AdminUserControllerTests {

        private static final String BASE_PATH = "/api/admin/users";

        @Test
        @DisplayName("Should return 401 for unauthenticated request")
        void shouldReturn401ForUnauthenticated() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(401);
        }

        @Test
        @TestSecurity(user = "client@test.com", roles = {Roles.USER})
        @DisplayName("Should return 403 for USER role")
        void shouldReturn403ForUserRole() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(403);
        }

        @Test
        @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
        @DisplayName("Should return 403 for RESTAURANT role")
        void shouldReturn403ForRestaurantRole() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(403);
        }

        @Test
        @TestSecurity(user = "admin@test.com", roles = {Roles.ADMIN})
        @DisplayName("Should return 200 for ADMIN role")
        void shouldReturn200ForAdminRole() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH)
            .then()
                .statusCode(200);
        }
    }

    // ==========================================================================
    // RestaurantController Tests - Mixed permissions
    // ==========================================================================

    @Nested
    @DisplayName("RestaurantController - /api/restaurants")
    class RestaurantControllerTests {

        private static final String BASE_PATH = "/api/restaurants";
        private static final String VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

        @Nested
        @DisplayName("Public Endpoints (@PermitAll)")
        class PublicEndpoints {

            @Test
            @DisplayName("GET /api/restaurants - Should be public")
            void getAllRestaurantsShouldBePublic() {
                given()
                    .contentType(ContentType.JSON)
                .when()
                    .get(BASE_PATH)
                .then()
                    .statusCode(200);
            }

            @Test
            @DisplayName("GET /api/restaurants/{id} - Should be public")
            void getRestaurantByIdShouldBePublic() {
                given()
                    .contentType(ContentType.JSON)
                .when()
                    .get(BASE_PATH + "/" + VALID_UUID)
                .then()
                    .statusCode(anyOf(equalTo(200), equalTo(404)));
            }

            @Test
            @DisplayName("GET /api/restaurants/active - Should be public")
            void getActiveRestaurantsShouldBePublic() {
                given()
                    .contentType(ContentType.JSON)
                .when()
                    .get(BASE_PATH + "/active")
                .then()
                    .statusCode(200);
            }
        }

        @Nested
        @DisplayName("Protected Endpoints - RESTAURANT + ADMIN")
        class ProtectedEndpoints {

            @Test
            @DisplayName("POST /api/restaurants - Should return 401 for unauthenticated")
            void createRestaurantShouldReturn401() {
                given()
                    .contentType(ContentType.JSON)
                    .body("{\"name\":\"Test Restaurant\"}")
                .when()
                    .post(BASE_PATH)
                .then()
                    .statusCode(401);
            }

            @Test
            @TestSecurity(user = "client@test.com", roles = {Roles.USER})
            @DisplayName("POST /api/restaurants - Should return 403 for USER")
            void createRestaurantShouldReturn403ForUser() {
                given()
                    .contentType(ContentType.JSON)
                    .body("{\"name\":\"Test Restaurant\"}")
                .when()
                    .post(BASE_PATH)
                .then()
                    .statusCode(403);
            }

            @Test
            @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
            @DisplayName("POST /api/restaurants - Should be allowed for RESTAURANT")
            void createRestaurantShouldBeAllowedForRestaurant() {
                var response = given()
                    .contentType(ContentType.JSON)
                    .body("{\"name\":\"Test Restaurant\", \"email\":\"test@example.com\"}")
                .when()
                    .post(BASE_PATH)
                .then()
                    .extract().response();

                // 201 (created) ou 400 (validation error) - pas 401/403
                Assertions.assertTrue(
                    response.statusCode() != 401 && response.statusCode() != 403,
                    "Expected not 401/403, got " + response.statusCode()
                );
            }

            @Test
            @TestSecurity(user = "admin@test.com", roles = {Roles.ADMIN})
            @DisplayName("POST /api/restaurants - Should be allowed for ADMIN")
            void createRestaurantShouldBeAllowedForAdmin() {
                var response = given()
                    .contentType(ContentType.JSON)
                    .body("{\"name\":\"Test Restaurant\", \"email\":\"admin@example.com\"}")
                .when()
                    .post(BASE_PATH)
                .then()
                    .extract().response();

                Assertions.assertTrue(
                    response.statusCode() != 401 && response.statusCode() != 403,
                    "Expected not 401/403, got " + response.statusCode()
                );
            }
        }

        @Nested
        @DisplayName("Admin Only Endpoints")
        class AdminOnlyEndpoints {

            @Test
            @DisplayName("DELETE /api/restaurants/{id} - Should return 401 for unauthenticated")
            void deleteRestaurantShouldReturn401() {
                given()
                    .contentType(ContentType.JSON)
                .when()
                    .delete(BASE_PATH + "/" + VALID_UUID)
                .then()
                    .statusCode(401);
            }

            @Test
            @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
            @DisplayName("DELETE /api/restaurants/{id} - Should return 403 for RESTAURANT")
            void deleteRestaurantShouldReturn403ForRestaurant() {
                given()
                    .contentType(ContentType.JSON)
                .when()
                    .delete(BASE_PATH + "/" + VALID_UUID)
                .then()
                    .statusCode(403);
            }

            @Test
            @TestSecurity(user = "admin@test.com", roles = {Roles.ADMIN})
            @DisplayName("DELETE /api/restaurants/{id} - Should be allowed for ADMIN")
            void deleteRestaurantShouldBeAllowedForAdmin() {
                var response = given()
                    .contentType(ContentType.JSON)
                .when()
                    .delete(BASE_PATH + "/" + VALID_UUID)
                .then()
                    .extract().response();

                // 204 (deleted) ou 404 (not found) - pas 401/403
                Assertions.assertTrue(
                    response.statusCode() != 401 && response.statusCode() != 403,
                    "Expected not 401/403, got " + response.statusCode()
                );
            }

            @Test
            @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
            @DisplayName("PUT /api/restaurants/{id}/status - Should return 403 for RESTAURANT")
            void updateStatusShouldReturn403ForRestaurant() {
                given()
                    .contentType(ContentType.JSON)
                    .queryParam("status", "ACTIVE")
                .when()
                    .put(BASE_PATH + "/" + VALID_UUID + "/status")
                .then()
                    .statusCode(403);
            }
        }
    }

    // ==========================================================================
    // MenuController Tests
    // ==========================================================================

    @Nested
    @DisplayName("MenuController - /api/menu-items")
    class MenuControllerTests {

        private static final String BASE_PATH = "/api/menu-items";
        private static final String VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";
        private static final String RESTAURANT_UUID = "660e8400-e29b-41d4-a716-446655440001";

        @Nested
        @DisplayName("Public Endpoints (@PermitAll)")
        class PublicEndpoints {

            @Test
            @DisplayName("GET /api/menu-items/{id} - Should be public")
            void getMenuItemShouldBePublic() {
                given()
                    .contentType(ContentType.JSON)
                .when()
                    .get(BASE_PATH + "/" + VALID_UUID)
                .then()
                    .statusCode(anyOf(equalTo(200), equalTo(404)));
            }

            @Test
            @DisplayName("GET /api/menu-items/restaurant/{restaurantId} - Should be public")
            void getRestaurantMenuShouldBePublic() {
                given()
                    .contentType(ContentType.JSON)
                .when()
                    .get(BASE_PATH + "/restaurant/" + RESTAURANT_UUID)
                .then()
                    .statusCode(200);
            }

            @Test
            @DisplayName("GET /api/menu-items/search - Should be public")
            void searchMenuItemsShouldBePublic() {
                given()
                    .contentType(ContentType.JSON)
                    .queryParam("q", "pizza")
                .when()
                    .get(BASE_PATH + "/search")
                .then()
                    .statusCode(200);
            }
        }

        @Nested
        @DisplayName("Protected Endpoints - RESTAURANT + ADMIN")
        class ProtectedEndpoints {

            @Test
            @DisplayName("POST /api/menu-items - Should return 401 for unauthenticated")
            void createMenuItemShouldReturn401() {
                given()
                    .contentType(ContentType.JSON)
                    .body("{\"name\":\"Test Item\", \"restaurantId\":\"" + RESTAURANT_UUID + "\"}")
                .when()
                    .post(BASE_PATH)
                .then()
                    .statusCode(401);
            }

            @Test
            @TestSecurity(user = "client@test.com", roles = {Roles.USER})
            @DisplayName("POST /api/menu-items - Should return 403 for USER")
            void createMenuItemShouldReturn403ForUser() {
                given()
                    .contentType(ContentType.JSON)
                    .body("{\"name\":\"Test Item\", \"restaurantId\":\"" + RESTAURANT_UUID + "\"}")
                .when()
                    .post(BASE_PATH)
                .then()
                    .statusCode(403);
            }

            @Test
            @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
            @DisplayName("DELETE /api/menu-items/{id} - Should be allowed for RESTAURANT (with access check)")
            void deleteMenuItemShouldBeAllowedForRestaurant() {
                var response = given()
                    .contentType(ContentType.JSON)
                .when()
                    .delete(BASE_PATH + "/" + VALID_UUID)
                .then()
                    .extract().response();

                // 204 (deleted), 404 (not found), ou 403 (no access to restaurant) - pas 401
                Assertions.assertTrue(
                    response.statusCode() != 401,
                    "Expected not 401, got " + response.statusCode()
                );
            }
        }
    }

    // ==========================================================================
    // OrderController Tests
    // ==========================================================================

    @Nested
    @DisplayName("OrderController - /api/orders")
    class OrderControllerTests {

        private static final String BASE_PATH = "/api/orders";
        private static final String VALID_ORDER_ID = "550e8400-e29b-41d4-a716-446655440000";
        private static final String VALID_RESTAURANT_ID = "660e8400-e29b-41d4-a716-446655440001";
        private static final String VALID_USER_ID = "770e8400-e29b-41d4-a716-446655440002";

        @Nested
        @DisplayName("Create Order - USER Only")
        class CreateOrderTests {

            @Test
            @DisplayName("POST /api/orders - Should return 401 for unauthenticated")
            void createOrderShouldReturn401() {
                given()
                    .contentType(ContentType.JSON)
                    .body("{\"restaurantId\":\"" + VALID_RESTAURANT_ID + "\"}")
                .when()
                    .post(BASE_PATH)
                .then()
                    .statusCode(401);
            }

            @Test
            @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
            @DisplayName("POST /api/orders - Should return 403 for RESTAURANT")
            void createOrderShouldReturn403ForRestaurant() {
                given()
                    .contentType(ContentType.JSON)
                    .body("{\"restaurantId\":\"" + VALID_RESTAURANT_ID + "\"}")
                .when()
                    .post(BASE_PATH)
                .then()
                    .statusCode(403);
            }

            @Test
            @TestSecurity(user = "client@test.com", roles = {Roles.USER})
            @DisplayName("POST /api/orders - Should be allowed for USER")
            void createOrderShouldBeAllowedForUser() {
                var response = given()
                    .contentType(ContentType.JSON)
                    .body("{\"restaurantId\":\"" + VALID_RESTAURANT_ID + "\", \"userId\":\"" + VALID_USER_ID + "\"}")
                .when()
                    .post(BASE_PATH)
                .then()
                    .extract().response();

                // 201 (created) ou 400 (validation) - pas 401/403
                Assertions.assertTrue(
                    response.statusCode() != 401 && response.statusCode() != 403,
                    "Expected not 401/403, got " + response.statusCode()
                );
            }
        }

        @Nested
        @DisplayName("Get Orders - Authenticated")
        class GetOrdersTests {

            @Test
            @DisplayName("GET /api/orders - Should return 401 for unauthenticated")
            void getOrdersShouldReturn401() {
                given()
                    .contentType(ContentType.JSON)
                    .queryParam("userId", VALID_USER_ID)
                .when()
                    .get(BASE_PATH)
                .then()
                    .statusCode(401);
            }

            @Test
            @TestSecurity(user = "client@test.com", roles = {Roles.USER})
            @DisplayName("GET /api/orders - Should be allowed for authenticated USER")
            void getOrdersShouldBeAllowedForUser() {
                var response = given()
                    .contentType(ContentType.JSON)
                    .queryParam("userId", VALID_USER_ID)
                .when()
                    .get(BASE_PATH)
                .then()
                    .extract().response();

                // 200, 400 ou 403 (access check) - pas 401
                Assertions.assertTrue(
                    response.statusCode() != 401,
                    "Expected not 401, got " + response.statusCode()
                );
            }
        }

        @Nested
        @DisplayName("Update Order Status - RESTAURANT + ADMIN")
        class UpdateOrderStatusTests {

            @Test
            @DisplayName("PUT /api/orders/{id}/status - Should return 401 for unauthenticated")
            void updateStatusShouldReturn401() {
                given()
                    .contentType(ContentType.JSON)
                    .body("{\"newStatus\":\"CONFIRMED\"}")
                .when()
                    .put(BASE_PATH + "/" + VALID_ORDER_ID + "/status")
                .then()
                    .statusCode(401);
            }

            @Test
            @TestSecurity(user = "client@test.com", roles = {Roles.USER})
            @DisplayName("PUT /api/orders/{id}/status - Should return 403 for USER")
            void updateStatusShouldReturn403ForUser() {
                given()
                    .contentType(ContentType.JSON)
                    .body("{\"newStatus\":\"CONFIRMED\"}")
                .when()
                    .put(BASE_PATH + "/" + VALID_ORDER_ID + "/status")
                .then()
                    .statusCode(403);
            }

            @Test
            @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
            @DisplayName("PUT /api/orders/{id}/status - Should be allowed for RESTAURANT")
            void updateStatusShouldBeAllowedForRestaurant() {
                var response = given()
                    .contentType(ContentType.JSON)
                    .body("{\"newStatus\":\"CONFIRMED\"}")
                .when()
                    .put(BASE_PATH + "/" + VALID_ORDER_ID + "/status")
                .then()
                    .extract().response();

                // 200, 400, 404 - pas 401/403
                Assertions.assertTrue(
                    response.statusCode() != 401 && response.statusCode() != 403,
                    "Expected not 401/403, got " + response.statusCode()
                );
            }
        }
    }

    // ==========================================================================
    // AnalyticsController Tests
    // ==========================================================================

    @Nested
    @DisplayName("AnalyticsController - /api/analytics")
    class AnalyticsControllerTests {

        private static final String BASE_PATH = "/api/analytics";

        @Test
        @DisplayName("GET /api/analytics/platform - Should return 401 for unauthenticated")
        void platformStatsShouldReturn401() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH + "/platform")
            .then()
                .statusCode(401);
        }

        @Test
        @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
        @DisplayName("GET /api/analytics/platform - Should return 403 for RESTAURANT")
        void platformStatsShouldReturn403ForRestaurant() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH + "/platform")
            .then()
                .statusCode(403);
        }

        @Test
        @TestSecurity(user = "admin@test.com", roles = {Roles.ADMIN})
        @DisplayName("GET /api/analytics/platform - Should return 200 for ADMIN")
        void platformStatsShouldReturn200ForAdmin() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH + "/platform")
            .then()
                .statusCode(200);
        }

        @Test
        @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
        @DisplayName("GET /api/analytics/dashboard - Should be allowed for RESTAURANT")
        void dashboardStatsShouldBeAllowedForRestaurant() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH + "/dashboard")
            .then()
                .statusCode(200);
        }

        @Test
        @TestSecurity(user = "client@test.com", roles = {Roles.USER})
        @DisplayName("GET /api/analytics/dashboard - Should return 403 for USER")
        void dashboardStatsShouldReturn403ForUser() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(BASE_PATH + "/dashboard")
            .then()
                .statusCode(403);
        }
    }

    // ==========================================================================
    // UserFavoriteController Tests
    // ==========================================================================

    @Nested
    @DisplayName("UserFavoriteController - /api/users/{userId}/favorites")
    class UserFavoriteControllerTests {

        private static final String VALID_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
        private static final String VALID_RESTAURANT_ID = "660e8400-e29b-41d4-a716-446655440001";

        private String basePath(String userId) {
            return "/api/users/" + userId + "/favorites";
        }

        @Test
        @DisplayName("GET /api/users/{userId}/favorites - Should return 401 for unauthenticated")
        void getFavoritesShouldReturn401() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(basePath(VALID_USER_ID))
            .then()
                .statusCode(401);
        }

        @Test
        @TestSecurity(user = "restaurant@test.com", roles = {Roles.RESTAURANT})
        @DisplayName("GET /api/users/{userId}/favorites - Should return 403 for RESTAURANT")
        void getFavoritesShouldReturn403ForRestaurant() {
            given()
                .contentType(ContentType.JSON)
            .when()
                .get(basePath(VALID_USER_ID))
            .then()
                .statusCode(403);
        }

        @Test
        @TestSecurity(user = "client@test.com", roles = {Roles.USER})
        @DisplayName("GET /api/users/{userId}/favorites - Should be allowed for USER")
        void getFavoritesShouldBeAllowedForUser() {
            var response = given()
                .contentType(ContentType.JSON)
            .when()
                .get(basePath(VALID_USER_ID))
            .then()
                .extract().response();

            // 200, 403 (not own favorites) ou 404 - pas 401
            Assertions.assertTrue(
                response.statusCode() != 401,
                "Expected not 401, got " + response.statusCode()
            );
        }

        @Test
        @TestSecurity(user = "admin@test.com", roles = {Roles.ADMIN})
        @DisplayName("Admin should be able to access any user's favorites")
        void adminShouldAccessAnyUserFavorites() {
            var response = given()
                .contentType(ContentType.JSON)
            .when()
                .get(basePath(VALID_USER_ID))
            .then()
                .extract().response();

            // Admin devrait pouvoir y acceder - pas 401/403
            Assertions.assertTrue(
                response.statusCode() != 401 && response.statusCode() != 403,
                "Expected not 401/403, got " + response.statusCode()
            );
        }
    }

    // ==========================================================================
    // Cross-Cutting Security Tests
    // ==========================================================================

    @Nested
    @DisplayName("Cross-Cutting Security Validations")
    class CrossCuttingSecurityTests {

        @Test
        @DisplayName("All protected endpoints should reject unauthenticated requests")
        void allProtectedEndpointsShouldRejectUnauthenticated() {
            // Admin endpoints
            given().get("/api/admin/users").then().statusCode(401);

            // Order creation (USER only)
            given()
                .contentType(ContentType.JSON)
                .body("{}")
            .when()
                .post("/api/orders")
            .then()
                .statusCode(401);

            // Analytics platform (ADMIN only)
            given().get("/api/analytics/platform").then().statusCode(401);

            // Favorites (USER only)
            given().get("/api/users/123/favorites").then().statusCode(401);
        }

        @Test
        @DisplayName("Public endpoints should be accessible without authentication")
        void publicEndpointsShouldBeAccessible() {
            // Restaurants list
            given().get("/api/restaurants").then().statusCode(200);

            // Active restaurants
            given().get("/api/restaurants/active").then().statusCode(200);

            // Menu items search
            given()
                .queryParam("q", "test")
            .when()
                .get("/api/menu-items/search")
            .then()
                .statusCode(200);

            // Auth status (public)
            given().get("/api/auth/status").then().statusCode(200);
        }

        @Test
        @TestSecurity(user = "admin@test.com", roles = {Roles.ADMIN})
        @DisplayName("ADMIN role should have access to all protected endpoints")
        void adminShouldHaveAccessToAllEndpoints() {
            // Admin endpoints
            given().get("/api/admin/users").then().statusCode(200);

            // Analytics platform
            given().get("/api/analytics/platform").then().statusCode(200);

            // Analytics dashboard
            given().get("/api/analytics/dashboard").then().statusCode(200);
        }
    }
}
