package com.oneeats.menu;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;

import java.math.BigDecimal;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;

@QuarkusTest
@TestMethodOrder(OrderAnnotation.class)
public class MenuResourceIntegrationTest {

    // Use existing test restaurant from import.sql
    private static final UUID testRestaurantId = UUID.fromString("f47ac10b-58cc-4372-a567-0e02b2c3d481");
    private static UUID createdMenuItemId;

    @Test
    @Order(1)
    void testCreateMenuItem() {
        String menuItemJson = """
            {
                "name": "Test Pizza Margherita",
                "description": "Classic Italian pizza with tomato, mozzarella and basil",
                "price": 12.50,
                "category": "PIZZA",
                "restaurantId": "%s",
                "isVegetarian": true,
                "isVegan": false,
                "preparationTimeMinutes": 15,
                "allergens": ["GLUTEN", "DAIRY"]
            }
        """.formatted(testRestaurantId);

        String createdIdString = given()
            .contentType(ContentType.JSON)
            .body(menuItemJson)
            .when()
            .post("/api/menu-items")
            .then()
            .statusCode(201)
            .body("name", equalTo("Test Pizza Margherita"))
            .body("price", equalTo(12.50f))
            .body("category", equalTo("PIZZA"))
            .body("isVegetarian", equalTo(true))
            .body("isAvailable", equalTo(true))
            .extract()
            .path("id");
        
        createdMenuItemId = UUID.fromString(createdIdString);
    }

    @Test
    @Order(2)
    void testGetMenuItemById() {
        given()
            .when()
            .get("/api/menu-items/" + createdMenuItemId)
            .then()
            .statusCode(200)
            .body("name", equalTo("Test Pizza Margherita"))
            .body("description", containsString("Classic Italian pizza"))
            .body("price", equalTo(12.50f));
    }

    @Test
    @Order(3)
    void testGetMenuItemById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        given()
            .when()
            .get("/api/menu-items/" + nonExistentId)
            .then()
            .statusCode(404);
    }

    @Test
    @Order(4)
    void testGetMenuItemsByRestaurant() {
        given()
            .when()
            .get("/api/menu-items/restaurant/" + testRestaurantId)
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("find { it.name == 'Test Pizza Margherita' }", notNullValue());
    }

    @Test
    @Order(5)
    void testGetAvailableMenuItems() {
        given()
            .when()
            .get("/api/menu-items/restaurant/" + testRestaurantId + "/available")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("find { it.isAvailable == false }", nullValue());
    }

    @Test
    @Order(6)
    void testGetMenuCategories() {
        given()
            .when()
            .get("/api/menu-items/restaurant/" + testRestaurantId + "/categories")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("contains('PIZZA')", equalTo(true));
    }

    @Test
    @Order(7)
    void testGetMenuItemsByCategory() {
        given()
            .when()
            .get("/api/menu-items/restaurant/" + testRestaurantId + "/category/PIZZA")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("find { it.category == 'PIZZA' }", notNullValue());
    }

    @Test
    @Order(8)
    void testUpdateMenuItem() {
        String updateJson = """
            {
                "name": "Updated Pizza Margherita",
                "description": "Updated classic Italian pizza",
                "price": 14.50,
                "category": "PIZZA",
                "restaurantId": "%s",
                "isVegetarian": true,
                "isVegan": false,
                "preparationTimeMinutes": 20,
                "allergens": ["GLUTEN", "DAIRY"]
            }
        """.formatted(testRestaurantId);

        given()
            .contentType(ContentType.JSON)
            .body(updateJson)
            .when()
            .put("/api/menu-items/" + createdMenuItemId)
            .then()
            .statusCode(200)
            .body("name", equalTo("Updated Pizza Margherita"))
            .body("price", equalTo(14.50f))
            .body("preparationTimeMinutes", equalTo(20));
    }

    @Test
    @Order(9)
    void testToggleAvailability() {
        String availabilityJson = """
            {
                "available": false
            }
        """;

        given()
            .contentType(ContentType.JSON)
            .body(availabilityJson)
            .when()
            .put("/api/menu-items/" + createdMenuItemId + "/availability")
            .then()
            .statusCode(200)
            .body("isAvailable", equalTo(false));
    }

    @Test
    @Order(10)
    void testSearchMenuItems() {
        given()
            .queryParam("query", "Updated Pizza")
            .when()
            .get("/api/menu-items/restaurant/" + testRestaurantId + "/search")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    @Order(11)
    void testGetVegetarianItems() {
        given()
            .when()
            .get("/api/menu-items/restaurant/" + testRestaurantId + "/vegetarian")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    @Order(12)
    void testGetVeganItems() {
        given()
            .when()
            .get("/api/menu-items/restaurant/" + testRestaurantId + "/vegan")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(0));
    }

    @Test
    @Order(13)
    void testCreateMenuItem_MissingRequiredFields() {
        String menuItemJson = """
            {
                "name": "Incomplete Item"
            }
        """;

        given()
            .contentType(ContentType.JSON)
            .body(menuItemJson)
            .when()
            .post("/api/menu-items")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(14)
    void testCreateMenuItem_InvalidRestaurantId() {
        UUID nonExistentRestaurantId = UUID.randomUUID();
        String menuItemJson = """
            {
                "name": "Test Pizza",
                "description": "Test pizza",
                "price": 10.00,
                "category": "PIZZA",
                "restaurantId": "%s",
                "isVegetarian": false,
                "isVegan": false,
                "preparationTimeMinutes": 15,
                "allergens": []
            }
        """.formatted(nonExistentRestaurantId);

        given()
            .contentType(ContentType.JSON)
            .body(menuItemJson)
            .when()
            .post("/api/menu-items")
            .then()
            .statusCode(anyOf(equalTo(400), equalTo(404)));
    }

    @Test
    @Order(15)
    void testUpdateMenuItem_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        String updateJson = """
            {
                "name": "Non-existent Item",
                "description": "This should fail",
                "price": 10.00,
                "category": "PIZZA",
                "restaurantId": "%s",
                "isVegetarian": false,
                "isVegan": false,
                "preparationTimeMinutes": 15,
                "allergens": []
            }
        """.formatted(testRestaurantId);

        given()
            .contentType(ContentType.JSON)
            .body(updateJson)
            .when()
            .put("/api/menu-items/" + nonExistentId)
            .then()
            .statusCode(404);
    }

    @Test
    @Order(16)
    void testDeleteMenuItem() {
        given()
            .when()
            .delete("/api/menu-items/" + createdMenuItemId)
            .then()
            .statusCode(204);
    }

    @Test
    @Order(17)
    void testDeleteMenuItem_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        given()
            .when()
            .delete("/api/menu-items/" + nonExistentId)
            .then()
            .statusCode(404);
    }

    @Test
    @Order(18)
    void testGetMenuItemsByNonExistentRestaurant() {
        UUID nonExistentRestaurantId = UUID.randomUUID();
        given()
            .when()
            .get("/api/menu-items/restaurant/" + nonExistentRestaurantId)
            .then()
            .statusCode(200)
            .body("size()", equalTo(0));
    }
}