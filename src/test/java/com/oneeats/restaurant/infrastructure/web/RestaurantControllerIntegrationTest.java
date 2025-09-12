package com.oneeats.restaurant.infrastructure.web;

import com.oneeats.restaurant.application.command.CreateRestaurantCommand;
import com.oneeats.restaurant.application.command.UpdateRestaurantCommand;
import com.oneeats.restaurant.application.command.ToggleRestaurantStatusCommand;
import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.dto.ScheduleDTO;
import com.oneeats.restaurant.application.dto.ScheduleDTO.DayScheduleDTO;
import com.oneeats.shared.domain.vo.Email;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;

import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("RestaurantController Integration Tests")
class RestaurantControllerIntegrationTest {
    
    @Inject
    EntityManager entityManager;
    
    @Nested
    @DisplayName("Restaurant CRUD Operations")
    class RestaurantCrudOperations {
        
        @Test
        @Transactional
        @DisplayName("Should create restaurant")
        void shouldCreateRestaurant() {
            // Given
            CreateRestaurantCommand command = new CreateRestaurantCommand(
                "New Pizza Place",
                "Best pizza in town",
                "456 Pizza Street",
                "0987654321",
                "info@newpizzaplace.fr",
                "PIZZA"
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(201)
                .body("name", equalTo("New Pizza Place"))
                .body("description", equalTo("Best pizza in town"))
                .body("address", equalTo("456 Pizza Street"))
                .body("phone", equalTo("0987654321"))
                .body("email", equalTo("info@newpizzaplace.fr"))
                .body("cuisineType", equalTo("PIZZA"))
                .body("status", equalTo("PENDING"))
                .body("id", notNullValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should get restaurant by id")
        void shouldGetRestaurantById() {
            // Given - Create a restaurant first
            CreateRestaurantCommand createCommand = new CreateRestaurantCommand(
                "Test Restaurant",
                "Test description",
                "123 Test Street",
                "0123456789",
                "test@restaurant.fr",
                "ITALIAN"
            );
            
            String restaurantId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // When & Then
            given()
            .when()
                .get("/api/restaurants/{id}", restaurantId)
            .then()
                .statusCode(200)
                .body("id", equalTo(restaurantId))
                .body("name", equalTo("Test Restaurant"))
                .body("cuisineType", equalTo("ITALIAN"));
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 404 for non-existent restaurant")
        void shouldReturn404ForNonExistentRestaurant() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            
            // When & Then
            given()
            .when()
                .get("/api/restaurants/{id}", nonExistentId)
            .then()
                .statusCode(404);
        }
        
        @Test
        @Transactional
        @DisplayName("Should get all restaurants")
        void shouldGetAllRestaurants() {
            // Given - Create a couple of restaurants
            CreateRestaurantCommand command1 = new CreateRestaurantCommand(
                "Restaurant 1",
                "Description 1",
                "Address 1",
                "0123456789",
                "restaurant1@test.fr",
                "PIZZA"
            );
            
            CreateRestaurantCommand command2 = new CreateRestaurantCommand(
                "Restaurant 2", 
                "Description 2",
                "Address 2",
                "0987654321",
                "restaurant2@test.fr",
                "ITALIAN"
            );
            
            given().contentType(ContentType.JSON).body(command1).post("/api/restaurants");
            given().contentType(ContentType.JSON).body(command2).post("/api/restaurants");
            
            // When & Then
            given()
            .when()
                .get("/api/restaurants")
            .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(2))
                .body("find { it.name == 'Restaurant 1' }", notNullValue())
                .body("find { it.name == 'Restaurant 2' }", notNullValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should update restaurant basic information")
        void shouldUpdateRestaurantBasicInformation() {
            // Given - Create a restaurant
            CreateRestaurantCommand createCommand = new CreateRestaurantCommand(
                "Original Restaurant",
                "Original description",
                "Original address",
                "0123456789",
                "original@restaurant.fr",
                "PIZZA"
            );
            
            String restaurantId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // When
            UpdateRestaurantCommand updateCommand = new UpdateRestaurantCommand(
                UUID.fromString(restaurantId), // Will be overridden by path param
                "Updated Restaurant",
                "Updated description",
                "Updated address",
                "0987654321",
                "updated@restaurant.fr",
                "ITALIAN",
                null,
                null
            );
            
            // Then
            given()
                .contentType(ContentType.JSON)
                .body(updateCommand)
            .when()
                .put("/api/restaurants/{id}", restaurantId)
            .then()
                .statusCode(200)
                .body("id", equalTo(restaurantId))
                .body("name", equalTo("Updated Restaurant"))
                .body("description", equalTo("Updated description"))
                .body("address", equalTo("Updated address"))
                .body("phone", equalTo("0987654321"))
                .body("email", equalTo("updated@restaurant.fr"))
                .body("cuisineType", equalTo("ITALIAN"));
        }
        
        @Test
        @Transactional
        @DisplayName("Should update restaurant with schedule")
        void shouldUpdateRestaurantWithSchedule() {
            // Given - Create a restaurant
            CreateRestaurantCommand createCommand = new CreateRestaurantCommand(
                "Schedule Test Restaurant",
                "Test description",
                "123 Test Street", 
                "0123456789",
                "schedule@restaurant.fr",
                "PIZZA"
            );
            
            String restaurantId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // When - Update with schedule
            ScheduleDTO schedule = new ScheduleDTO(
                new DayScheduleDTO("09:00", "18:00"), // monday
                new DayScheduleDTO("10:00", "19:00"), // tuesday
                null, // wednesday - closed
                new DayScheduleDTO("09:30", "17:30"), // thursday
                null, // friday
                null, // saturday
                null  // sunday
            );
            
            UpdateRestaurantCommand updateCommand = new UpdateRestaurantCommand(
                UUID.fromString(restaurantId),
                null, null, null, null, null, null, null,
                schedule
            );
            
            // Then
            given()
                .contentType(ContentType.JSON)
                .body(updateCommand)
            .when()
                .put("/api/restaurants/{id}", restaurantId)
            .then()
                .statusCode(200)
                .body("schedule.monday.open", equalTo("09:00"))
                .body("schedule.monday.close", equalTo("18:00"))
                .body("schedule.tuesday.open", equalTo("10:00"))
                .body("schedule.tuesday.close", equalTo("19:00"))
                .body("schedule.wednesday", nullValue())
                .body("schedule.thursday.open", equalTo("09:30"))
                .body("schedule.thursday.close", equalTo("17:30"));
        }
    }
    
    @Nested
    @DisplayName("Restaurant Status Management")
    class RestaurantStatusManagement {
        
        @Test
        @Transactional
        @DisplayName("Should toggle restaurant status to open")
        void shouldToggleRestaurantStatusToOpen() {
            // Given - Create an active restaurant
            CreateRestaurantCommand createCommand = new CreateRestaurantCommand(
                "Toggle Test Restaurant",
                "Test description",
                "123 Test Street",
                "0123456789", 
                "toggle@restaurant.fr",
                "PIZZA"
            );
            
            String restaurantId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // First activate the restaurant
            UpdateRestaurantCommand activateCommand = new UpdateRestaurantCommand(
                UUID.fromString(restaurantId),
                null, null, null, null, null, null,
                false, null // Set to not open first
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(activateCommand)
                .put("/api/restaurants/{id}", restaurantId);
            
            // When - Toggle to open
            ToggleRestaurantStatusCommand toggleCommand = new ToggleRestaurantStatusCommand(
                UUID.fromString(restaurantId),
                true
            );
            
            // Then
            given()
                .contentType(ContentType.JSON)
                .body(toggleCommand)
            .when()
                .patch("/api/restaurants/{id}/toggle-status", restaurantId)
            .then()
                .statusCode(200)
                .body("isOpen", equalTo(true));
        }
        
        @Test
        @Transactional
        @DisplayName("Should toggle restaurant status to closed")
        void shouldToggleRestaurantStatusToClosed() {
            // Given - Create and open a restaurant
            CreateRestaurantCommand createCommand = new CreateRestaurantCommand(
                "Toggle Close Test Restaurant",
                "Test description",
                "123 Test Street",
                "0123456789",
                "toggleclose@restaurant.fr",
                "PIZZA"
            );
            
            String restaurantId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // Open the restaurant first
            ToggleRestaurantStatusCommand openCommand = new ToggleRestaurantStatusCommand(
                UUID.fromString(restaurantId),
                true
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(openCommand)
                .patch("/api/restaurants/{id}/toggle-status", restaurantId);
            
            // When - Toggle to closed
            ToggleRestaurantStatusCommand closeCommand = new ToggleRestaurantStatusCommand(
                UUID.fromString(restaurantId),
                false
            );
            
            // Then
            given()
                .contentType(ContentType.JSON)
                .body(closeCommand)
            .when()
                .patch("/api/restaurants/{id}/toggle-status", restaurantId)
            .then()
                .statusCode(200)
                .body("isOpen", equalTo(false));
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 404 when toggling status of non-existent restaurant")
        void shouldReturn404WhenTogglingStatusOfNonExistentRestaurant() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            ToggleRestaurantStatusCommand command = new ToggleRestaurantStatusCommand(
                nonExistentId,
                true
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .patch("/api/restaurants/{id}/toggle-status", nonExistentId)
            .then()
                .statusCode(404);
        }
    }
    
    @Nested
    @DisplayName("Image Management") 
    class ImageManagement {
        
        @Test
        @Transactional
        @DisplayName("Should upload restaurant image")
        void shouldUploadRestaurantImage() {
            // Given - Create a restaurant
            CreateRestaurantCommand createCommand = new CreateRestaurantCommand(
                "Image Test Restaurant",
                "Test description",
                "123 Test Street",
                "0123456789",
                "image@restaurant.fr",
                "PIZZA"
            );
            
            String restaurantId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // When & Then - Upload image with multipart form data
            byte[] imageData = "fake-image-data".getBytes();
            
            given()
                .multiPart("file", "test-image.jpg", imageData, "image/jpeg")
                .multiPart("filename", "test-image.jpg")
            .when()
                .post("/api/restaurants/{id}/image", restaurantId)
            .then()
                .statusCode(200)
                .body("imageUrl", notNullValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 400 when uploading without file")
        void shouldReturn400WhenUploadingWithoutFile() {
            // Given
            UUID restaurantId = UUID.randomUUID();
            
            // When & Then
            given()
                .multiPart("filename", "test.jpg")
            .when()
                .post("/api/restaurants/{id}/image", restaurantId)
            .then()
                .statusCode(400)
                .body(containsString("File is required"));
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 400 when uploading without filename")
        void shouldReturn400WhenUploadingWithoutFilename() {
            // Given
            UUID restaurantId = UUID.randomUUID();
            byte[] imageData = "fake-image-data".getBytes();
            
            // When & Then
            given()
                .multiPart("file", "test.jpg", imageData, "image/jpeg")
            .when()
                .post("/api/restaurants/{id}/image", restaurantId)
            .then()
                .statusCode(400)
                .body(containsString("Filename is required"));
        }
        
        @Test
        @Transactional
        @DisplayName("Should delete restaurant image")
        void shouldDeleteRestaurantImage() {
            // Given - Create restaurant and upload image
            CreateRestaurantCommand createCommand = new CreateRestaurantCommand(
                "Delete Image Test Restaurant",
                "Test description",
                "123 Test Street",
                "0123456789",
                "deleteimage@restaurant.fr",
                "PIZZA"
            );
            
            String restaurantId = given()
                .contentType(ContentType.JSON)
                .body(createCommand)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(201)
                .extract()
                .path("id");
            
            // Upload image first
            byte[] imageData = "fake-image-data".getBytes();
            given()
                .multiPart("file", "test-image.jpg", imageData, "image/jpeg")
                .multiPart("filename", "test-image.jpg")
                .post("/api/restaurants/{id}/image", restaurantId);
            
            // When & Then - Delete image
            given()
            .when()
                .delete("/api/restaurants/{id}/image", restaurantId)
            .then()
                .statusCode(200)
                .body("imageUrl", anyOf(nullValue(), equalTo("")));
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 404 when deleting image from non-existent restaurant")
        void shouldReturn404WhenDeletingImageFromNonExistentRestaurant() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            
            // When & Then
            given()
            .when()
                .delete("/api/restaurants/{id}/image", nonExistentId)
            .then()
                .statusCode(404);
        }
    }
    
    @Nested
    @DisplayName("Validation and Error Handling")
    class ValidationAndErrorHandling {
        
        @Test
        @Transactional
        @DisplayName("Should return 400 for invalid restaurant creation")
        void shouldReturn400ForInvalidRestaurantCreation() {
            // Given - Invalid command (missing required fields)
            CreateRestaurantCommand invalidCommand = new CreateRestaurantCommand(
                "", // Empty name
                null,
                null, 
                null,
                null, // Invalid email
                null
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(invalidCommand)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(400);
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 400 for invalid email format")
        void shouldReturn400ForInvalidEmailFormat() {
            // Given - Invalid email
            CreateRestaurantCommand command = new CreateRestaurantCommand(
                "Valid Name",
                "Valid description",
                "Valid address",
                "0123456789",
                "invalid-email", // Invalid email format
                "PIZZA"
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(400);
        }
        
        @Test
        @Transactional
        @DisplayName("Should return 404 for update of non-existent restaurant")
        void shouldReturn404ForUpdateOfNonExistentRestaurant() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                nonExistentId,
                "Updated Name",
                null, null, null, null, null, null, null
            );
            
            // When & Then
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .put("/api/restaurants/{id}", nonExistentId)
            .then()
                .statusCode(404);
        }
        
        @Test
        @Transactional
        @DisplayName("Should handle malformed UUID in path parameter")
        void shouldHandleMalformedUuidInPathParameter() {
            // When & Then
            given()
            .when()
                .get("/api/restaurants/{id}", "invalid-uuid")
            .then()
                .statusCode(400);
        }
    }
    
    @Nested
    @DisplayName("Content Type and Media Type Handling")
    class ContentTypeAndMediaTypeHandling {
        
        @Test
        @Transactional
        @DisplayName("Should return JSON content type")
        void shouldReturnJsonContentType() {
            given()
            .when()
                .get("/api/restaurants")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON);
        }
        
        @Test
        @Transactional
        @DisplayName("Should accept JSON content type for POST")
        void shouldAcceptJsonContentTypeForPost() {
            CreateRestaurantCommand command = new CreateRestaurantCommand(
                "Content Type Test",
                "Test description",
                "123 Test Street",
                "0123456789",
                "contenttype@restaurant.fr",
                "PIZZA"
            );
            
            given()
                .contentType(ContentType.JSON)
                .body(command)
            .when()
                .post("/api/restaurants")
            .then()
                .statusCode(201);
        }
        
        @Test
        @Transactional
        @DisplayName("Should accept multipart form data for image upload")
        void shouldAcceptMultipartFormDataForImageUpload() {
            // This is tested in the image upload tests above
            // Just verifying the endpoint accepts the right content type
            UUID restaurantId = UUID.randomUUID();
            byte[] imageData = "fake-image-data".getBytes();
            
            given()
                .multiPart("file", "test.jpg", imageData, "image/jpeg")
                .multiPart("filename", "test.jpg")
            .when()
                .post("/api/restaurants/{id}/image", restaurantId)
            .then()
                .statusCode(anyOf(equalTo(200), equalTo(404))); // 404 if restaurant doesn't exist
        }
    }
}