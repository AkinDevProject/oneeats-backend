package com.oneeats.order;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.BeforeAll;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
@TestMethodOrder(OrderAnnotation.class)
public class OrderResourceIntegrationTest {

    private static UUID testUserId;
    private static UUID testRestaurantId;
    private static UUID testMenuItemId;
    private static UUID createdOrderId;

    @BeforeAll
    static void setupTestData() {
        // Create test user
        String userJson = """
            {
                "email": "order@test.com",
                "password": "password123",
                "firstName": "Order",
                "lastName": "Tester",
                "phone": "+33123456789",
                "address": "123 Order Street, Order City"
            }
        """;

        testUserId = UUID.fromString(given()
            .contentType(ContentType.JSON)
            .body(userJson)
            .when()
            .post("/api/users")
            .then()
            .statusCode(201)
            .extract()
            .asString()
            .replace("\"", ""));

        // Create test restaurant
        String restaurantJson = """
            {
                "name": "Order Test Restaurant",
                "description": "A test restaurant for orders",
                "address": "123 Order Street",
                "phone": "+33123456789",
                "email": "order@testrestaurant.com",
                "cuisineType": "ITALIAN",
                "operatingHours": "9:00-22:00"
            }
        """;

        testRestaurantId = given()
            .contentType(ContentType.JSON)
            .body(restaurantJson)
            .when()
            .post("/api/restaurants")
            .then()
            .statusCode(201)
            .extract()
            .path("id");

        // Create test menu item
        String menuItemJson = """
            {
                "name": "Test Pizza for Orders",
                "description": "Pizza for order testing",
                "price": 15.00,
                "category": "PIZZA",
                "restaurantId": "%s",
                "available": true,
                "vegetarian": false,
                "vegan": false,
                "preparationTime": 20,
                "allergens": ["GLUTEN", "DAIRY"]
            }
        """.formatted(testRestaurantId);

        testMenuItemId = given()
            .contentType(ContentType.JSON)
            .body(menuItemJson)
            .when()
            .post("/api/menu-items")
            .then()
            .statusCode(201)
            .extract()
            .path("id");
    }

    @Test
    @Order(1)
    void testCreateOrder() {
        String orderJson = """
            {
                "restaurantId": "%s",
                "totalAmount": 15.00,
                "specialInstructions": "Extra cheese please",
                "items": [
                    {
                        "menuItemId": "%s",
                        "quantity": 1,
                        "unitPrice": 15.00,
                        "specialInstructions": "Well done"
                    }
                ]
            }
        """.formatted(testRestaurantId, testMenuItemId);

        createdOrderId = given()
            .contentType(ContentType.JSON)
            .body(orderJson)
            .header("User-Id", testUserId)
            .when()
            .post("/api/orders")
            .then()
            .statusCode(201)
            .body("restaurantId", equalTo(testRestaurantId.toString()))
            .body("totalAmount", equalTo(15.00f))
            .body("specialInstructions", equalTo("Extra cheese please"))
            .body("status", equalTo("EN_ATTENTE"))
            .extract()
            .path("id");
    }

    @Test
    @Order(2)
    void testCreateOrder_MissingUserHeader() {
        String orderJson = """
            {
                "restaurantId": "%s",
                "totalAmount": 15.00,
                "specialInstructions": "Test order",
                "items": [
                    {
                        "menuItemId": "%s",
                        "quantity": 1,
                        "unitPrice": 15.00,
                        "specialInstructions": ""
                    }
                ]
            }
        """.formatted(testRestaurantId, testMenuItemId);

        given()
            .contentType(ContentType.JSON)
            .body(orderJson)
            .when()
            .post("/api/orders")
            .then()
            .statusCode(400)
            .body(containsString("User-Id requis"));
    }

    @Test
    @Order(3)
    void testGetOrderById() {
        given()
            .when()
            .get("/api/orders/" + createdOrderId)
            .then()
            .statusCode(200)
            .body("id", equalTo(createdOrderId.toString()))
            .body("restaurantId", equalTo(testRestaurantId.toString()))
            .body("status", equalTo("EN_ATTENTE"));
    }

    @Test
    @Order(4)
    void testGetOrderById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        given()
            .when()
            .get("/api/orders/" + nonExistentId)
            .then()
            .statusCode(404);
    }

    @Test
    @Order(5)
    void testGetOrdersByUserId() {
        given()
            .queryParam("userId", testUserId)
            .when()
            .get("/api/orders")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("find { it.id == '" + createdOrderId + "' }", notNullValue());
    }

    @Test
    @Order(6)
    void testGetOrdersByRestaurantId() {
        given()
            .queryParam("restaurantId", testRestaurantId)
            .when()
            .get("/api/orders")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("find { it.restaurantId == '" + testRestaurantId + "' }", notNullValue());
    }

    @Test
    @Order(7)
    void testGetOrdersByRestaurantIdAndStatus() {
        given()
            .queryParam("restaurantId", testRestaurantId)
            .queryParam("status", "EN_ATTENTE")
            .when()
            .get("/api/orders")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("find { it.status == 'EN_ATTENTE' }", notNullValue());
    }

    @Test
    @Order(8)
    void testGetAllOrders_Admin() {
        given()
            .queryParam("page", 0)
            .queryParam("size", 20)
            .when()
            .get("/api/orders")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0));
    }

    @Test
    @Order(9)
    void testConfirmOrder() {
        given()
            .when()
            .put("/api/orders/" + createdOrderId + "/confirm")
            .then()
            .statusCode(200)
            .body("status", equalTo("EN_PREPARATION"));
    }

    @Test
    @Order(10)
    void testUpdateOrderStatus() {
        String statusUpdateJson = """
            {
                "newStatus": "PRETE"
            }
        """;

        given()
            .contentType(ContentType.JSON)
            .body(statusUpdateJson)
            .when()
            .put("/api/orders/" + createdOrderId + "/status")
            .then()
            .statusCode(200)
            .body("status", equalTo("PRETE"));
    }

    @Test
    @Order(11)
    void testMarkOrderReady() {
        // First set status back to EN_PREPARATION
        String statusUpdateJson = """
            {
                "newStatus": "EN_PREPARATION"
            }
        """;

        given()
            .contentType(ContentType.JSON)
            .body(statusUpdateJson)
            .when()
            .put("/api/orders/" + createdOrderId + "/status")
            .then()
            .statusCode(200);

        // Then mark as ready
        given()
            .queryParam("pickupMinutes", 10)
            .when()
            .put("/api/orders/" + createdOrderId + "/ready")
            .then()
            .statusCode(200)
            .body("status", equalTo("PRETE"));
    }

    @Test
    @Order(12)
    void testMarkOrderPickedUp() {
        given()
            .when()
            .put("/api/orders/" + createdOrderId + "/pickup")
            .then()
            .statusCode(200)
            .body("status", equalTo("RECUPEREE"));
    }

    @Test
    @Order(13)
    void testCancelOrder() {
        // Create another order to cancel
        String orderJson = """
            {
                "restaurantId": "%s",
                "totalAmount": 15.00,
                "specialInstructions": "Order to cancel",
                "items": [
                    {
                        "menuItemId": "%s",
                        "quantity": 1,
                        "unitPrice": 15.00,
                        "specialInstructions": ""
                    }
                ]
            }
        """.formatted(testRestaurantId, testMenuItemId);

        UUID orderToCancel = given()
            .contentType(ContentType.JSON)
            .body(orderJson)
            .header("User-Id", testUserId)
            .when()
            .post("/api/orders")
            .then()
            .statusCode(201)
            .extract()
            .path("id");

        // Cancel the order
        given()
            .queryParam("reason", "Customer changed mind")
            .when()
            .put("/api/orders/" + orderToCancel + "/cancel")
            .then()
            .statusCode(200)
            .body("status", equalTo("ANNULEE"));
    }

    @Test
    @Order(14)
    void testGetRestaurantStats() {
        given()
            .when()
            .get("/api/orders/restaurant/" + testRestaurantId + "/stats")
            .then()
            .statusCode(200)
            .body("ordersToday", greaterThanOrEqualTo(0))
            .body("activeOrders", greaterThanOrEqualTo(0))
            .body("overdueOrders", greaterThanOrEqualTo(0));
    }

    @Test
    @Order(15)
    void testGetTodayDetailedStats() {
        given()
            .when()
            .get("/api/orders/restaurant/" + testRestaurantId + "/stats/today")
            .then()
            .statusCode(200)
            .body("total", greaterThanOrEqualTo(0))
            .body("pending", greaterThanOrEqualTo(0))
            .body("preparing", greaterThanOrEqualTo(0))
            .body("ready", greaterThanOrEqualTo(0))
            .body("delivered", greaterThanOrEqualTo(0))
            .body("revenue", greaterThanOrEqualTo(0f))
            .body("avgOrderValue", greaterThanOrEqualTo(0f));
    }

    @Test
    @Order(16)
    void testGetPendingOrders() {
        given()
            .when()
            .get("/api/orders/restaurant/" + testRestaurantId + "/pending")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    @Order(17)
    void testUpdateOrderStatus_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        String statusUpdateJson = """
            {
                "newStatus": "EN_PREPARATION"
            }
        """;

        given()
            .contentType(ContentType.JSON)
            .body(statusUpdateJson)
            .when()
            .put("/api/orders/" + nonExistentId + "/status")
            .then()
            .statusCode(404);
    }

    @Test
    @Order(18)
    void testInvalidStatusTransition() {
        String statusUpdateJson = """
            {
                "newStatus": "EN_ATTENTE"
            }
        """;

        given()
            .contentType(ContentType.JSON)
            .body(statusUpdateJson)
            .when()
            .put("/api/orders/" + createdOrderId + "/status")
            .then()
            .statusCode(anyOf(equalTo(400), equalTo(422)));
    }
}