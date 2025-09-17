package com.oneeats.integration.menu.web;

import com.oneeats.menu.application.command.CreateMenuItemCommand;
import com.oneeats.menu.application.command.UpdateMenuItemCommand;
import com.oneeats.restaurant.application.command.CreateRestaurantCommand;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import io.restassured.http.ContentType;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.Arrays;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * ✅ TESTS D'INTÉGRATION MENU API REST
 * - Utilise @QuarkusTest (serveur HTTP complet)
 * - Vraies requêtes HTTP via RestAssured
 * - Vraie base de données PostgreSQL
 * - Teste le flux complet : HTTP → Controller → UseCase → Repository → DB
 */
@QuarkusTest
@DisplayName("Menu Controller Integration Tests - End-to-End API")
class MenuControllerIntegrationTest {
    
    @Nested
    @DisplayName("Menu Item Creation API")
    class MenuItemCreationApi {
        
        @Test
        @Transactional
        @DisplayName("Should create menu item via POST /api/menu-items")
        void shouldCreateMenuItemViaPostApi() {
            // Given - Create restaurant first
            String restaurantId = createTestRestaurant("Menu Restaurant");
            
            CreateMenuItemCommand command = new CreateMenuItemCommand(
                UUID.fromString(restaurantId),
                "API Test Pizza",
                "Delicious pizza created via API test",
                new BigDecimal("15.50"),
                "PIZZA",
                "/uploads/api-pizza.jpg",
                25, // preparation time
                true, // vegetarian
                false, // not vegan
                true, // available
                Arrays.asList("GLUTEN", "DAIRY") // allergens
            );
            
            // When & Then - HTTP POST request
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .post("/api/menu-items")
            .then()
                .statusCode(201)
                .contentType(ContentType.JSON)
                .body("name", equalTo("API Test Pizza"))
                .body("description", equalTo("Delicious pizza created via API test"))
                .body("price", equalTo(15.50f))
                .body("category", equalTo("PIZZA"))
                .body("imageUrl", equalTo("/uploads/api-pizza.jpg"))
                .body("isAvailable", equalTo(true))
                .body("preparationTimeMinutes", equalTo(25))
                .body("isVegetarian", equalTo(true))
                .body("isVegan", equalTo(false))
                .body("allergens", hasItems("GLUTEN", "DAIRY"))
                .body("restaurantId", equalTo(restaurantId))
                .body("id", notNullValue())
                .body("createdAt", notNullValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should reject invalid menu item creation")
        void shouldRejectInvalidMenuItemCreation() {
            // Given - Invalid command (empty name, negative price)
            String restaurantId = createTestRestaurant("Invalid Restaurant");
            
            CreateMenuItemCommand invalidCommand = new CreateMenuItemCommand(
                UUID.fromString(restaurantId),
                "", // Invalid: empty name
                "Description",
                new BigDecimal("-5.00"), // Invalid: negative price
                "INVALID_CATEGORY",
                null,
                -10, // Invalid: negative preparation time
                false,
                false,
                true,
                null
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(invalidCommand)
            .when()
                .post("/api/menu-items")
            .then()
                .statusCode(400); // Bad Request
        }
        
        @Test
        @Transactional
        @DisplayName("Should reject menu item for non-existent restaurant")
        void shouldRejectMenuItemForNonExistentRestaurant() {
            // Given - Non-existent restaurant ID
            UUID nonExistentRestaurantId = UUID.randomUUID();
            
            CreateMenuItemCommand command = new CreateMenuItemCommand(
                nonExistentRestaurantId,
                "Orphaned Item",
                "Menu item without restaurant",
                new BigDecimal("10.00"),
                "ORPHANED",
                null,
                15,
                false,
                false,
                true,
                null
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .post("/api/menu-items")
            .then()
                .statusCode(404); // Restaurant not found
        }
    }
    
    @Nested
    @DisplayName("Menu Item Retrieval API")
    class MenuItemRetrievalApi {
        
        @Test
        @Transactional
        @DisplayName("Should get menu item by ID via GET /api/menu-items/{id}")
        void shouldGetMenuItemByIdViaGetApi() {
            // Given - Create restaurant and menu item
            String restaurantId = createTestRestaurant("Retrieval Restaurant");
            String menuItemId = createTestMenuItem(restaurantId, "Retrievable Pizza");
            
            // When & Then - HTTP GET request
            given()
            .when()
                .get("/api/menu-items/{id}", menuItemId)
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(menuItemId))
                .body("name", equalTo("Retrievable Pizza"))
                .body("restaurantId", equalTo(restaurantId))
                .body("isAvailable", equalTo(true));
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 404 for non-existent menu item")
        void shouldReturn404ForNonExistentMenuItem() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            
            // When & Then
            given()
            .when()
                .get("/api/menu-items/{id}", nonExistentId)
            .then()
                .statusCode(404);
        }
        
        @Test
        @Transactional
        @DisplayName("Should get menu items by restaurant via GET /api/menu-items/restaurant/{restaurantId}")
        void shouldGetMenuItemsByRestaurantViaGetApi() {
            // Given - Create restaurant and multiple menu items
            String restaurantId = createTestRestaurant("Menu Restaurant");
            createTestMenuItem(restaurantId, "Pizza Margherita");
            createTestMenuItem(restaurantId, "Pizza Pepperoni");
            createTestMenuItem(restaurantId, "Caesar Salad");
            
            // When & Then - HTTP GET by restaurant
            given()
            .when()
                .get("/api/menu-items/restaurant/{restaurantId}", restaurantId)
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("size()", equalTo(3))
                .body("find { it.name == 'Pizza Margherita' }", notNullValue())
                .body("find { it.name == 'Pizza Pepperoni' }", notNullValue())
                .body("find { it.name == 'Caesar Salad' }", notNullValue())
                .body("every { it.restaurantId == '" + restaurantId + "' }", equalTo(true));
        }
        
        @Test
        @Transactional
        @DisplayName("Should get available menu items only")
        void shouldGetAvailableMenuItemsOnly() {
            // Given - Create restaurant and menu items (some unavailable)
            String restaurantId = createTestRestaurant("Availability Restaurant");
            String availableItemId = createTestMenuItem(restaurantId, "Available Item");
            String unavailableItemId = createTestMenuItem(restaurantId, "Unavailable Item");
            
            // Make one item unavailable
            given()
                .contentType(ContentType.JSON)
                .patch("/api/menu-items/{id}/unavailable", unavailableItemId);
            
            // When & Then - Get only available items
            given()
                .queryParam("available", true)
            .when()
                .get("/api/menu-items/restaurant/{restaurantId}", restaurantId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(1))
                .body("[0].name", equalTo("Available Item"))
                .body("[0].isAvailable", equalTo(true));
        }
        
        @Test
        @Transactional
        @DisplayName("Should search menu items by category")
        void shouldSearchMenuItemsByCategory() {
            // Given - Create restaurant and items in different categories
            String restaurantId = createTestRestaurant("Category Restaurant");
            
            CreateMenuItemCommand pizzaCommand = new CreateMenuItemCommand(
                UUID.fromString(restaurantId), "Margherita", "Pizza desc",
                new BigDecimal("12.00"), "PIZZA", null, 15, true, false, true, null
            );
            CreateMenuItemCommand saladCommand = new CreateMenuItemCommand(
                UUID.fromString(restaurantId), "Caesar", "Salad desc",
                new BigDecimal("8.00"), "SALAD", null, 10, true, false, true, null
            );
            
            given().contentType(ContentType.JSON).body(pizzaCommand).post("/api/menu-items");
            given().contentType(ContentType.JSON).body(saladCommand).post("/api/menu-items");
            
            // When & Then - Filter by PIZZA category
            given()
                .queryParam("category", "PIZZA")
            .when()
                .get("/api/menu-items/restaurant/{restaurantId}", restaurantId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(1))
                .body("[0].name", equalTo("Margherita"))
                .body("[0].category", equalTo("PIZZA"));
        }
    }
    
    @Nested
    @DisplayName("Menu Item Update API")
    class MenuItemUpdateApi {
        
        @Test
        @Transactional
        @DisplayName("Should update menu item via PUT /api/menu-items/{id}")
        void shouldUpdateMenuItemViaPutApi() {
            // Given - Create restaurant and menu item
            String restaurantId = createTestRestaurant("Update Restaurant");
            String menuItemId = createTestMenuItem(restaurantId, "Original Pizza");
            
            // When - Update via HTTP PUT
            UpdateMenuItemCommand updateCommand = new UpdateMenuItemCommand(
                UUID.fromString(menuItemId),
                "Updated Pizza",
                "Updated description with new ingredients",
                new BigDecimal("18.00"),
                "UPDATED_PIZZA",
                "/uploads/updated-pizza.jpg",
                30,
                false,
                true,
                true,
                null,
                Arrays.asList("TREE_NUTS", "SOY"),
                null
            );
            
            // Then
            given()
                .contentType(ContentType.JSON)
                .body(updateCommand)
            .when()
                .put("/api/menu-items/{id}", menuItemId)
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("id", equalTo(menuItemId))
                .body("name", equalTo("Updated Pizza"))
                .body("description", equalTo("Updated description with new ingredients"))
                .body("price", equalTo(18.00f))
                .body("category", equalTo("UPDATED_PIZZA"))
                .body("imageUrl", equalTo("/uploads/updated-pizza.jpg"))
                .body("preparationTimeMinutes", equalTo(30))
                .body("isVegetarian", equalTo(false))
                .body("isVegan", equalTo(true))
                .body("allergens", hasItems("nuts", "soy"))
                .body("updatedAt", notNullValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 404 when updating non-existent menu item")
        void shouldReturn404WhenUpdatingNonExistentMenuItem() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            UpdateMenuItemCommand command = new UpdateMenuItemCommand(
                nonExistentId, "Updated Name", null, null, null, null, null, null, null, null, null, null, null
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .put("/api/menu-items/{id}", nonExistentId)
            .then()
                .statusCode(404);
        }
    }
    
    @Nested
    @DisplayName("Menu Item Availability Management API")
    class MenuItemAvailabilityManagementApi {
        
        @Test
        @Transactional
        @DisplayName("Should make item unavailable via PATCH /api/menu-items/{id}/unavailable")
        void shouldMakeItemUnavailableViaPatchApi() {
            // Given - Create menu item
            String restaurantId = createTestRestaurant("Availability Restaurant");
            String menuItemId = createTestMenuItem(restaurantId, "Available Item");
            
            // When & Then - Make unavailable via HTTP PATCH
            given()
            .when()
                .patch("/api/menu-items/{id}/unavailable", menuItemId)
            .then()
                .statusCode(200)
                .body("isAvailable", equalTo(false));
        }
        
        @Test
        @Transactional
        @DisplayName("Should make item available via PATCH /api/menu-items/{id}/available")
        void shouldMakeItemAvailableViaPatchApi() {
            // Given - Create and make item unavailable
            String restaurantId = createTestRestaurant("Availability Restaurant");
            String menuItemId = createTestMenuItem(restaurantId, "Unavailable Item");
            
            given().patch("/api/menu-items/{id}/unavailable", menuItemId);
            
            // When & Then - Make available
            given()
            .when()
                .patch("/api/menu-items/{id}/available", menuItemId)
            .then()
                .statusCode(200)
                .body("isAvailable", equalTo(true));
        }
        
        @Test
        @Transactional
        @DisplayName("Should toggle availability via PATCH /api/menu-items/{id}/toggle-availability")
        void shouldToggleAvailabilityViaPatchApi() {
            // Given
            String restaurantId = createTestRestaurant("Toggle Restaurant");
            String menuItemId = createTestMenuItem(restaurantId, "Toggle Item");
            
            // When & Then - Toggle (should make unavailable)
            given()
            .when()
                .patch("/api/menu-items/{id}/toggle-availability", menuItemId)
            .then()
                .statusCode(200)
                .body("isAvailable", equalTo(false));
            
            // When & Then - Toggle again (should make available)
            given()
            .when()
                .patch("/api/menu-items/{id}/toggle-availability", menuItemId)
            .then()
                .statusCode(200)
                .body("isAvailable", equalTo(true));
        }
    }
    
    @Nested
    @DisplayName("Menu Item Dietary Information API")
    class MenuItemDietaryInformationApi {
        
        @Test
        @Transactional
        @DisplayName("Should update dietary info via PATCH /api/menu-items/{id}/dietary")
        void shouldUpdateDietaryInfoViaPatchApi() {
            // Given
            String restaurantId = createTestRestaurant("Dietary Restaurant");
            String menuItemId = createTestMenuItem(restaurantId, "Dietary Item");
            
            // When & Then - Update dietary information
            Map<String, Object> dietaryInfo = Map.of(
                "isVegetarian", true,
                "isVegan", false,
                "allergens", Arrays.asList("gluten", "nuts")
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(dietaryInfo)
            .when()
                .patch("/api/menu-items/{id}/dietary", menuItemId)
            .then()
                .statusCode(200)
                .body("isVegetarian", equalTo(true))
                .body("isVegan", equalTo(false))
                .body("allergens", hasItems("gluten", "nuts"));
        }
        
        @Test
        @Transactional
        @DisplayName("Should search vegetarian items")
        void shouldSearchVegetarianItems() {
            // Given - Create items with different dietary properties
            String restaurantId = createTestRestaurant("Dietary Search Restaurant");
            
            CreateMenuItemCommand vegetarianCommand = new CreateMenuItemCommand(
                UUID.fromString(restaurantId), "Veggie Pizza", "Vegetarian pizza",
                new BigDecimal("13.00"), "PIZZA", null, 15, true, false, true, null
            );
            CreateMenuItemCommand meatCommand = new CreateMenuItemCommand(
                UUID.fromString(restaurantId), "Meat Pizza", "Pizza with meat",
                new BigDecimal("15.00"), "PIZZA", null, 15, false, false, true, null
            );
            
            given().contentType(ContentType.JSON).body(vegetarianCommand).post("/api/menu-items");
            given().contentType(ContentType.JSON).body(meatCommand).post("/api/menu-items");
            
            // When & Then - Search vegetarian items
            given()
                .queryParam("vegetarian", true)
            .when()
                .get("/api/menu-items/restaurant/{restaurantId}", restaurantId)
            .then()
                .statusCode(200)
                .body("size()", equalTo(1))
                .body("[0].name", equalTo("Veggie Pizza"))
                .body("[0].isVegetarian", equalTo(true));
        }
    }
    
    @Nested
    @DisplayName("Menu Item Image Management API")
    class MenuItemImageManagementApi {
        
        @Test
        @Transactional
        @DisplayName("Should upload menu item image")
        void shouldUploadMenuItemImage() {
            // Given
            String restaurantId = createTestRestaurant("Image Restaurant");
            String menuItemId = createTestMenuItem(restaurantId, "Image Item");
            
            // When & Then - Upload image with multipart form data
            byte[] imageData = "fake-menu-item-image-data".getBytes();
            
            given()
                .multiPart("file", "menu-item.jpg", imageData, "image/jpeg")
                .multiPart("filename", "menu-item.jpg")
            .when()
                .post("/api/menu-items/{id}/image", menuItemId)
            .then()
                .statusCode(200)
                .body("imageUrl", notNullValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should delete menu item image")
        void shouldDeleteMenuItemImage() {
            // Given - Create item and upload image
            String restaurantId = createTestRestaurant("Delete Image Restaurant");
            String menuItemId = createTestMenuItem(restaurantId, "Delete Image Item");
            
            // Upload image first
            byte[] imageData = "fake-image-data".getBytes();
            given()
                .multiPart("file", "item-image.jpg", imageData, "image/jpeg")
                .multiPart("filename", "item-image.jpg")
                .post("/api/menu-items/{id}/image", menuItemId);
            
            // When & Then - Delete image
            given()
            .when()
                .delete("/api/menu-items/{id}/image", menuItemId)
            .then()
                .statusCode(200)
                .body("imageUrl", anyOf(nullValue(), equalTo("")));
        }
    }
    
    @Nested
    @DisplayName("API Error Handling and Validation")
    class ApiErrorHandlingAndValidation {
        
        @Test
        @Transactional
        @DisplayName("Should return JSON content type")
        void shouldReturnJsonContentType() {
            // Given
            String restaurantId = createTestRestaurant("Content Type Restaurant");
            
            given()
            .when()
                .get("/api/menu-items/restaurant/{restaurantId}", restaurantId)
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
                .get("/api/menu-items/{id}", "not-a-uuid")
            .then()
                .statusCode(400); // Bad Request for malformed UUID
        }
        
        @Test
        @Transactional
        @DisplayName("Should validate price constraints")
        void shouldValidatePriceConstraints() {
            // Given
            String restaurantId = createTestRestaurant("Price Validation Restaurant");
            
            CreateMenuItemCommand invalidPriceCommand = new CreateMenuItemCommand(
                UUID.fromString(restaurantId), "Free Item", "Description",
                BigDecimal.ZERO, // Invalid: zero price
                "FREE", null, 15, false, false, true, null
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(invalidPriceCommand)
            .when()
                .post("/api/menu-items")
            .then()
                .statusCode(400); // Should reject zero/negative prices
        }
    }
    
    // Helper methods
    private String createTestRestaurant(String name) {
        CreateRestaurantCommand command = new CreateRestaurantCommand(
            name, "Test restaurant", "Test address", 
            "0123456789", name.toLowerCase().replace(" ", "") + "@test.fr", "TEST"
        );
        
        return given()
            .contentType(ContentType.JSON)
            .body(command)
        .when()
            .post("/api/restaurants")
        .then()
            .statusCode(201)
            .extract()
            .path("id");
    }
    
    private String createTestMenuItem(String restaurantId, String name) {
        CreateMenuItemCommand command = new CreateMenuItemCommand(
            UUID.fromString(restaurantId), name, "Test description",
            new BigDecimal("12.00"), "TEST", null, 15, false, false, true, null
        );
        
        return given()
            .contentType(ContentType.JSON)
            .body(command)
        .when()
            .post("/api/menu-items")
        .then()
            .statusCode(201)
            .extract()
            .path("id");
    }
}