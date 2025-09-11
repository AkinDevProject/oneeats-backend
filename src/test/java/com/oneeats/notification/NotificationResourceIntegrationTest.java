package com.oneeats.notification;

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
public class NotificationResourceIntegrationTest {

    private static UUID testUserId;
    private static UUID createdNotificationId;

    @BeforeAll
    static void setupTestData() {
        // Create test user for notifications
        String userJson = """
            {
                "email": "notification@test.com",
                "password": "password123",
                "firstName": "Notification",
                "lastName": "Tester",
                "phone": "+33123456789",
                "address": "123 Notification Street"
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
    }

    @Test
    @Order(1)
    void testSendNotification() {
        String notificationJson = """
            {
                "destinataireId": "%s",
                "titre": "Test Notification",
                "message": "This is a test notification message",
                "type": "ORDER_STATUS"
            }
        """.formatted(testUserId);

        createdNotificationId = UUID.fromString(given()
            .contentType(ContentType.JSON)
            .body(notificationJson)
            .when()
            .post("/notifications")
            .then()
            .statusCode(201)
            .extract()
            .asString()
            .replace("\"", ""));
    }

    @Test
    @Order(2)
    void testGetNotificationById() {
        given()
            .when()
            .get("/notifications/" + createdNotificationId)
            .then()
            .statusCode(200)
            .body("id", equalTo(createdNotificationId.toString()))
            .body("titre", equalTo("Test Notification"))
            .body("message", equalTo("This is a test notification message"))
            .body("type", equalTo("ORDER_STATUS"))
            .body("lu", equalTo(false));
    }

    @Test
    @Order(3)
    void testGetNotificationById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        given()
            .when()
            .get("/notifications/" + nonExistentId)
            .then()
            .statusCode(404);
    }

    @Test
    @Order(4)
    void testGetAllNotifications() {
        given()
            .when()
            .get("/notifications")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("find { it.id == '" + createdNotificationId + "' }", notNullValue());
    }

    @Test
    @Order(5)
    void testGetNotificationsByDestinataire() {
        given()
            .queryParam("destinataireId", testUserId)
            .when()
            .get("/notifications")
            .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("find { it.destinataireId == '" + testUserId + "' }", notNullValue());
    }

    @Test
    @Order(6)
    void testMarkNotificationAsRead() {
        String markAsReadJson = """
            {
                "notificationId": "%s"
            }
        """.formatted(createdNotificationId);

        given()
            .contentType(ContentType.JSON)
            .body(markAsReadJson)
            .when()
            .patch("/notifications/read")
            .then()
            .statusCode(200);

        // Verify notification is marked as read
        given()
            .when()
            .get("/notifications/" + createdNotificationId)
            .then()
            .statusCode(200)
            .body("lu", equalTo(true));
    }

    @Test
    @Order(7)
    void testSendNotification_MissingRequiredFields() {
        String notificationJson = """
            {
                "titre": "Incomplete Notification"
            }
        """;

        given()
            .contentType(ContentType.JSON)
            .body(notificationJson)
            .when()
            .post("/notifications")
            .then()
            .statusCode(400);
    }

    @Test
    @Order(8)
    void testSendNotification_InvalidDestinataire() {
        UUID nonExistentUserId = UUID.randomUUID();
        String notificationJson = """
            {
                "destinataireId": "%s",
                "titre": "Invalid User Notification",
                "message": "This notification should fail",
                "type": "ORDER_STATUS"
            }
        """.formatted(nonExistentUserId);

        given()
            .contentType(ContentType.JSON)
            .body(notificationJson)
            .when()
            .post("/notifications")
            .then()
            .statusCode(anyOf(equalTo(400), equalTo(404)));
    }

    @Test
    @Order(9)
    void testMarkAsRead_InvalidNotificationId() {
        UUID nonExistentId = UUID.randomUUID();
        String markAsReadJson = """
            {
                "notificationId": "%s"
            }
        """.formatted(nonExistentId);

        given()
            .contentType(ContentType.JSON)
            .body(markAsReadJson)
            .when()
            .patch("/notifications/read")
            .then()
            .statusCode(anyOf(equalTo(404), equalTo(400)));
    }

    @Test
    @Order(10)
    void testDeleteNotification() {
        // Create another notification to delete
        String notificationJson = """
            {
                "destinataireId": "%s",
                "titre": "Notification to Delete",
                "message": "This notification will be deleted",
                "type": "GENERAL"
            }
        """.formatted(testUserId);

        UUID notificationToDelete = UUID.fromString(given()
            .contentType(ContentType.JSON)
            .body(notificationJson)
            .when()
            .post("/notifications")
            .then()
            .statusCode(201)
            .extract()
            .asString()
            .replace("\"", ""));

        // Delete the notification
        given()
            .when()
            .delete("/notifications/" + notificationToDelete)
            .then()
            .statusCode(204);

        // Verify notification is deleted
        given()
            .when()
            .get("/notifications/" + notificationToDelete)
            .then()
            .statusCode(404);
    }

    @Test
    @Order(11)
    void testDeleteNotification_NotFound() {
        UUID nonExistentId = UUID.randomUUID();
        given()
            .when()
            .delete("/notifications/" + nonExistentId)
            .then()
            .statusCode(404);
    }

    @Test
    @Order(12)
    void testSendMultipleNotifications() {
        // Send multiple notifications to test bulk operations
        for (int i = 1; i <= 3; i++) {
            String notificationJson = """
                {
                    "destinataireId": "%s",
                    "titre": "Bulk Notification %d",
                    "message": "This is bulk notification number %d",
                    "type": "GENERAL"
                }
            """.formatted(testUserId, i, i);

            given()
                .contentType(ContentType.JSON)
                .body(notificationJson)
                .when()
                .post("/notifications")
                .then()
                .statusCode(201);
        }

        // Verify all notifications are present
        given()
            .queryParam("destinataireId", testUserId)
            .when()
            .get("/notifications")
            .then()
            .statusCode(200)
            .body("size()", greaterThanOrEqualTo(4)); // Original + 3 new ones
    }
}