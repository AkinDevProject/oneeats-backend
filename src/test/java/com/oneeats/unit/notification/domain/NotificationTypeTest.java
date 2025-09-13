package com.oneeats.unit.notification.domain;

import com.oneeats.notification.domain.model.NotificationType;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES NOTIFICATIONTYPE - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'enum NotificationType
 */
@DisplayName("NotificationType Unit Tests - Pure Domain Logic")
class NotificationTypeTest {
    
    @Nested
    @DisplayName("Enum Values")
    class EnumValues {
        
        @Test
        @DisplayName("Should have all expected notification types")
        void shouldHaveAllExpectedNotificationTypes() {
            // When
            NotificationType[] types = NotificationType.values();
            List<NotificationType> typeList = Arrays.asList(types);
            
            // Then
            assertEquals(7, types.length);
            assertTrue(typeList.contains(NotificationType.ORDER_CONFIRMATION));
            assertTrue(typeList.contains(NotificationType.ORDER_STATUS_UPDATE));
            assertTrue(typeList.contains(NotificationType.ORDER_READY));
            assertTrue(typeList.contains(NotificationType.ORDER_CANCELLED));
            assertTrue(typeList.contains(NotificationType.RESTAURANT_APPROVED));
            assertTrue(typeList.contains(NotificationType.RESTAURANT_REJECTED));
            assertTrue(typeList.contains(NotificationType.SYSTEM_ANNOUNCEMENT));
        }
        
        @Test
        @DisplayName("Should parse type from string")
        void shouldParseTypeFromString() {
            // When & Then
            assertEquals(NotificationType.ORDER_CONFIRMATION, NotificationType.valueOf("ORDER_CONFIRMATION"));
            assertEquals(NotificationType.ORDER_STATUS_UPDATE, NotificationType.valueOf("ORDER_STATUS_UPDATE"));
            assertEquals(NotificationType.ORDER_READY, NotificationType.valueOf("ORDER_READY"));
            assertEquals(NotificationType.ORDER_CANCELLED, NotificationType.valueOf("ORDER_CANCELLED"));
            assertEquals(NotificationType.RESTAURANT_APPROVED, NotificationType.valueOf("RESTAURANT_APPROVED"));
            assertEquals(NotificationType.RESTAURANT_REJECTED, NotificationType.valueOf("RESTAURANT_REJECTED"));
            assertEquals(NotificationType.SYSTEM_ANNOUNCEMENT, NotificationType.valueOf("SYSTEM_ANNOUNCEMENT"));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid type")
        void shouldThrowExceptionForInvalidType() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                NotificationType.valueOf("INVALID_TYPE"));
        }
    }
    
    @Nested
    @DisplayName("Business Category Logic")
    class BusinessCategoryLogic {
        
        @Test
        @DisplayName("Should identify order-related notification types")
        void shouldIdentifyOrderRelatedNotificationTypes() {
            // Given
            List<NotificationType> orderTypes = Arrays.asList(
                NotificationType.ORDER_CONFIRMATION,
                NotificationType.ORDER_STATUS_UPDATE,
                NotificationType.ORDER_READY,
                NotificationType.ORDER_CANCELLED
            );
            
            // When & Then - All order types should start with "ORDER_"
            for (NotificationType type : orderTypes) {
                assertTrue(type.toString().startsWith("ORDER_"),
                    "Order type " + type + " should start with ORDER_");
            }
        }
        
        @Test
        @DisplayName("Should identify restaurant-related notification types")
        void shouldIdentifyRestaurantRelatedNotificationTypes() {
            // Given
            List<NotificationType> restaurantTypes = Arrays.asList(
                NotificationType.RESTAURANT_APPROVED,
                NotificationType.RESTAURANT_REJECTED
            );
            
            // When & Then - All restaurant types should start with "RESTAURANT_"
            for (NotificationType type : restaurantTypes) {
                assertTrue(type.toString().startsWith("RESTAURANT_"),
                    "Restaurant type " + type + " should start with RESTAURANT_");
            }
        }
        
        @Test
        @DisplayName("Should identify system notification types")
        void shouldIdentifySystemNotificationTypes() {
            // Given
            NotificationType systemType = NotificationType.SYSTEM_ANNOUNCEMENT;
            
            // When & Then
            assertTrue(systemType.toString().startsWith("SYSTEM_"),
                "System type should start with SYSTEM_");
        }
        
        @Test
        @DisplayName("Should have consistent string representation")
        void shouldHaveConsistentStringRepresentation() {
            // When & Then
            assertEquals("ORDER_CONFIRMATION", NotificationType.ORDER_CONFIRMATION.toString());
            assertEquals("ORDER_STATUS_UPDATE", NotificationType.ORDER_STATUS_UPDATE.toString());
            assertEquals("ORDER_READY", NotificationType.ORDER_READY.toString());
            assertEquals("ORDER_CANCELLED", NotificationType.ORDER_CANCELLED.toString());
            assertEquals("RESTAURANT_APPROVED", NotificationType.RESTAURANT_APPROVED.toString());
            assertEquals("RESTAURANT_REJECTED", NotificationType.RESTAURANT_REJECTED.toString());
            assertEquals("SYSTEM_ANNOUNCEMENT", NotificationType.SYSTEM_ANNOUNCEMENT.toString());
        }
    }
    
    @Nested
    @DisplayName("Notification Type Classification")
    class NotificationTypeClassification {
        
        @Test
        @DisplayName("Should group types by business domain")
        void shouldGroupTypesByBusinessDomain() {
            // Given
            NotificationType[] allTypes = NotificationType.values();
            int orderCount = 0;
            int restaurantCount = 0;
            int systemCount = 0;
            
            // When
            for (NotificationType type : allTypes) {
                String typeName = type.toString();
                if (typeName.startsWith("ORDER_")) {
                    orderCount++;
                } else if (typeName.startsWith("RESTAURANT_")) {
                    restaurantCount++;
                } else if (typeName.startsWith("SYSTEM_")) {
                    systemCount++;
                }
            }
            
            // Then
            assertEquals(4, orderCount, "Should have 4 order-related types");
            assertEquals(2, restaurantCount, "Should have 2 restaurant-related types");
            assertEquals(1, systemCount, "Should have 1 system-related type");
            assertEquals(7, orderCount + restaurantCount + systemCount, "All types should be categorized");
        }
        
        @Test
        @DisplayName("Should support notification priority logic")
        void shouldSupportNotificationPriorityLogic() {
            // Given - System announcements might have higher priority
            NotificationType systemAnnouncement = NotificationType.SYSTEM_ANNOUNCEMENT;
            NotificationType orderReady = NotificationType.ORDER_READY;
            NotificationType restaurantApproved = NotificationType.RESTAURANT_APPROVED;
            
            // When & Then - All types should be distinguishable for priority logic
            assertNotEquals(systemAnnouncement.ordinal(), orderReady.ordinal());
            assertNotEquals(orderReady.ordinal(), restaurantApproved.ordinal());
            assertNotEquals(systemAnnouncement.ordinal(), restaurantApproved.ordinal());
        }
        
        @Test
        @DisplayName("Should support notification filtering by category")
        void shouldSupportNotificationFilteringByCategory() {
            // Given
            NotificationType[] allTypes = NotificationType.values();
            
            // When - Filter order notifications
            List<NotificationType> orderNotifications = Arrays.stream(allTypes)
                .filter(type -> type.toString().startsWith("ORDER_"))
                .toList();
            
            // Then
            assertEquals(4, orderNotifications.size());
            assertTrue(orderNotifications.contains(NotificationType.ORDER_CONFIRMATION));
            assertTrue(orderNotifications.contains(NotificationType.ORDER_STATUS_UPDATE));
            assertTrue(orderNotifications.contains(NotificationType.ORDER_READY));
            assertTrue(orderNotifications.contains(NotificationType.ORDER_CANCELLED));
        }
    }
}