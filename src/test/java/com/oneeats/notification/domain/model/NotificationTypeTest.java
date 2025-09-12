package com.oneeats.notification.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("NotificationType Tests")
class NotificationTypeTest {
    
    @Nested
    @DisplayName("Enum Values")
    class EnumValues {
        
        @Test
        @DisplayName("Should have all required notification types")
        void shouldHaveAllRequiredNotificationTypes() {
            NotificationType[] types = NotificationType.values();
            
            assertEquals(7, types.length);
            assertTrue(contains(types, NotificationType.ORDER_CONFIRMATION));
            assertTrue(contains(types, NotificationType.ORDER_STATUS_UPDATE));
            assertTrue(contains(types, NotificationType.ORDER_READY));
            assertTrue(contains(types, NotificationType.ORDER_CANCELLED));
            assertTrue(contains(types, NotificationType.RESTAURANT_APPROVED));
            assertTrue(contains(types, NotificationType.RESTAURANT_REJECTED));
            assertTrue(contains(types, NotificationType.SYSTEM_ANNOUNCEMENT));
        }
        
        @Test
        @DisplayName("Should have correct string representations")
        void shouldHaveCorrectStringRepresentations() {
            assertEquals("ORDER_CONFIRMATION", NotificationType.ORDER_CONFIRMATION.toString());
            assertEquals("ORDER_STATUS_UPDATE", NotificationType.ORDER_STATUS_UPDATE.toString());
            assertEquals("ORDER_READY", NotificationType.ORDER_READY.toString());
            assertEquals("ORDER_CANCELLED", NotificationType.ORDER_CANCELLED.toString());
            assertEquals("RESTAURANT_APPROVED", NotificationType.RESTAURANT_APPROVED.toString());
            assertEquals("RESTAURANT_REJECTED", NotificationType.RESTAURANT_REJECTED.toString());
            assertEquals("SYSTEM_ANNOUNCEMENT", NotificationType.SYSTEM_ANNOUNCEMENT.toString());
        }
        
        private boolean contains(NotificationType[] types, NotificationType type) {
            for (NotificationType t : types) {
                if (t == type) {
                    return true;
                }
            }
            return false;
        }
    }
    
    @Nested
    @DisplayName("Enum Ordering")
    class EnumOrdering {
        
        @Test
        @DisplayName("Should maintain correct ordinal values")
        void shouldMaintainCorrectOrdinalValues() {
            assertEquals(0, NotificationType.ORDER_CONFIRMATION.ordinal());
            assertEquals(1, NotificationType.ORDER_STATUS_UPDATE.ordinal());
            assertEquals(2, NotificationType.ORDER_READY.ordinal());
            assertEquals(3, NotificationType.ORDER_CANCELLED.ordinal());
            assertEquals(4, NotificationType.RESTAURANT_APPROVED.ordinal());
            assertEquals(5, NotificationType.RESTAURANT_REJECTED.ordinal());
            assertEquals(6, NotificationType.SYSTEM_ANNOUNCEMENT.ordinal());
        }
        
        @Test
        @DisplayName("Should allow valueOf operations")
        void shouldAllowValueOfOperations() {
            assertEquals(NotificationType.ORDER_CONFIRMATION, 
                NotificationType.valueOf("ORDER_CONFIRMATION"));
            assertEquals(NotificationType.ORDER_STATUS_UPDATE, 
                NotificationType.valueOf("ORDER_STATUS_UPDATE"));
            assertEquals(NotificationType.ORDER_READY, 
                NotificationType.valueOf("ORDER_READY"));
            assertEquals(NotificationType.ORDER_CANCELLED, 
                NotificationType.valueOf("ORDER_CANCELLED"));
            assertEquals(NotificationType.RESTAURANT_APPROVED, 
                NotificationType.valueOf("RESTAURANT_APPROVED"));
            assertEquals(NotificationType.RESTAURANT_REJECTED, 
                NotificationType.valueOf("RESTAURANT_REJECTED"));
            assertEquals(NotificationType.SYSTEM_ANNOUNCEMENT, 
                NotificationType.valueOf("SYSTEM_ANNOUNCEMENT"));
        }
        
        @Test
        @DisplayName("Should handle invalid valueOf gracefully")
        void shouldHandleInvalidValueOfGracefully() {
            assertThrows(IllegalArgumentException.class, () -> 
                NotificationType.valueOf("INVALID_TYPE"));
        }
    }
    
    @Nested
    @DisplayName("Business Logic Categories")
    class BusinessLogicCategories {
        
        @Test
        @DisplayName("Should categorize order-related notifications")
        void shouldCategorizeOrderRelatedNotifications() {
            Set<NotificationType> orderTypes = Arrays.stream(NotificationType.values())
                .filter(this::isOrderRelated)
                .collect(Collectors.toSet());
            
            assertEquals(4, orderTypes.size());
            assertTrue(orderTypes.contains(NotificationType.ORDER_CONFIRMATION));
            assertTrue(orderTypes.contains(NotificationType.ORDER_STATUS_UPDATE));
            assertTrue(orderTypes.contains(NotificationType.ORDER_READY));
            assertTrue(orderTypes.contains(NotificationType.ORDER_CANCELLED));
        }
        
        @Test
        @DisplayName("Should categorize restaurant-related notifications")
        void shouldCategorizeRestaurantRelatedNotifications() {
            Set<NotificationType> restaurantTypes = Arrays.stream(NotificationType.values())
                .filter(this::isRestaurantRelated)
                .collect(Collectors.toSet());
            
            assertEquals(2, restaurantTypes.size());
            assertTrue(restaurantTypes.contains(NotificationType.RESTAURANT_APPROVED));
            assertTrue(restaurantTypes.contains(NotificationType.RESTAURANT_REJECTED));
        }
        
        @Test
        @DisplayName("Should categorize system notifications")
        void shouldCategorizeSystemNotifications() {
            Set<NotificationType> systemTypes = Arrays.stream(NotificationType.values())
                .filter(this::isSystemRelated)
                .collect(Collectors.toSet());
            
            assertEquals(1, systemTypes.size());
            assertTrue(systemTypes.contains(NotificationType.SYSTEM_ANNOUNCEMENT));
        }
        
        private boolean isOrderRelated(NotificationType type) {
            return type.name().startsWith("ORDER_");
        }
        
        private boolean isRestaurantRelated(NotificationType type) {
            return type.name().startsWith("RESTAURANT_");
        }
        
        private boolean isSystemRelated(NotificationType type) {
            return type.name().startsWith("SYSTEM_");
        }
    }
    
    @Nested
    @DisplayName("Priority Classification")
    class PriorityClassification {
        
        @Test
        @DisplayName("Should classify high priority notifications")
        void shouldClassifyHighPriorityNotifications() {
            assertTrue(isHighPriority(NotificationType.ORDER_CONFIRMATION));
            assertTrue(isHighPriority(NotificationType.ORDER_READY));
            assertTrue(isHighPriority(NotificationType.ORDER_CANCELLED));
            assertTrue(isHighPriority(NotificationType.RESTAURANT_APPROVED));
            assertTrue(isHighPriority(NotificationType.RESTAURANT_REJECTED));
        }
        
        @Test
        @DisplayName("Should classify medium priority notifications")
        void shouldClassifyMediumPriorityNotifications() {
            assertTrue(isMediumPriority(NotificationType.ORDER_STATUS_UPDATE));
        }
        
        @Test
        @DisplayName("Should classify low priority notifications")
        void shouldClassifyLowPriorityNotifications() {
            assertTrue(isLowPriority(NotificationType.SYSTEM_ANNOUNCEMENT));
        }
        
        private boolean isHighPriority(NotificationType type) {
            return type == NotificationType.ORDER_CONFIRMATION ||
                   type == NotificationType.ORDER_READY ||
                   type == NotificationType.ORDER_CANCELLED ||
                   type == NotificationType.RESTAURANT_APPROVED ||
                   type == NotificationType.RESTAURANT_REJECTED;
        }
        
        private boolean isMediumPriority(NotificationType type) {
            return type == NotificationType.ORDER_STATUS_UPDATE;
        }
        
        private boolean isLowPriority(NotificationType type) {
            return type == NotificationType.SYSTEM_ANNOUNCEMENT;
        }
    }
    
    @Nested
    @DisplayName("Comparison and Equality")
    class ComparisonAndEquality {
        
        @Test
        @DisplayName("Should support equality comparison")
        void shouldSupportEqualityComparison() {
            NotificationType type1 = NotificationType.ORDER_CONFIRMATION;
            NotificationType type2 = NotificationType.ORDER_CONFIRMATION;
            NotificationType type3 = NotificationType.ORDER_READY;
            
            assertEquals(type1, type2);
            assertNotEquals(type1, type3);
        }
        
        @Test
        @DisplayName("Should support comparison operations")
        void shouldSupportComparisonOperations() {
            assertTrue(NotificationType.ORDER_CONFIRMATION.ordinal() < 
                NotificationType.ORDER_STATUS_UPDATE.ordinal());
            assertTrue(NotificationType.ORDER_STATUS_UPDATE.ordinal() < 
                NotificationType.ORDER_READY.ordinal());
        }
        
        @Test
        @DisplayName("Should have consistent hashCode")
        void shouldHaveConsistentHashCode() {
            NotificationType type1 = NotificationType.ORDER_CONFIRMATION;
            NotificationType type2 = NotificationType.ORDER_CONFIRMATION;
            
            assertEquals(type1.hashCode(), type2.hashCode());
        }
    }
    
    @Nested
    @DisplayName("Serialization")
    class Serialization {
        
        @Test
        @DisplayName("Should be serializable by name")
        void shouldBeSerializableByName() {
            for (NotificationType type : NotificationType.values()) {
                String serialized = type.name();
                NotificationType deserialized = NotificationType.valueOf(serialized);
                assertEquals(type, deserialized);
            }
        }
        
        @Test
        @DisplayName("Should handle case sensitivity correctly")
        void shouldHandleCaseSensitivityCorrectly() {
            // Only exact case should work for valueOf
            assertDoesNotThrow(() -> NotificationType.valueOf("ORDER_CONFIRMATION"));
            assertDoesNotThrow(() -> NotificationType.valueOf("SYSTEM_ANNOUNCEMENT"));
            
            assertThrows(IllegalArgumentException.class, () -> 
                NotificationType.valueOf("order_confirmation"));
            assertThrows(IllegalArgumentException.class, () -> 
                NotificationType.valueOf("Order_Confirmation"));
        }
    }
    
    @Nested
    @DisplayName("Integration with Switch Statements")
    class IntegrationWithSwitchStatements {
        
        @Test
        @DisplayName("Should work properly in switch statements")
        void shouldWorkProperlyInSwitchStatements() {
            assertEquals("Order Confirmation", getTypeDisplayName(NotificationType.ORDER_CONFIRMATION));
            assertEquals("Order Status Update", getTypeDisplayName(NotificationType.ORDER_STATUS_UPDATE));
            assertEquals("Order Ready", getTypeDisplayName(NotificationType.ORDER_READY));
            assertEquals("Order Cancelled", getTypeDisplayName(NotificationType.ORDER_CANCELLED));
            assertEquals("Restaurant Approved", getTypeDisplayName(NotificationType.RESTAURANT_APPROVED));
            assertEquals("Restaurant Rejected", getTypeDisplayName(NotificationType.RESTAURANT_REJECTED));
            assertEquals("System Announcement", getTypeDisplayName(NotificationType.SYSTEM_ANNOUNCEMENT));
        }
        
        @Test
        @DisplayName("Should provide appropriate notification channels")
        void shouldProvideAppropriateNotificationChannels() {
            assertEquals("email,push", getNotificationChannels(NotificationType.ORDER_CONFIRMATION));
            assertEquals("push", getNotificationChannels(NotificationType.ORDER_STATUS_UPDATE));
            assertEquals("email,push,sms", getNotificationChannels(NotificationType.ORDER_READY));
            assertEquals("email,push,sms", getNotificationChannels(NotificationType.ORDER_CANCELLED));
            assertEquals("email", getNotificationChannels(NotificationType.RESTAURANT_APPROVED));
            assertEquals("email", getNotificationChannels(NotificationType.RESTAURANT_REJECTED));
            assertEquals("push", getNotificationChannels(NotificationType.SYSTEM_ANNOUNCEMENT));
        }
        
        private String getTypeDisplayName(NotificationType type) {
            switch (type) {
                case ORDER_CONFIRMATION:
                    return "Order Confirmation";
                case ORDER_STATUS_UPDATE:
                    return "Order Status Update";
                case ORDER_READY:
                    return "Order Ready";
                case ORDER_CANCELLED:
                    return "Order Cancelled";
                case RESTAURANT_APPROVED:
                    return "Restaurant Approved";
                case RESTAURANT_REJECTED:
                    return "Restaurant Rejected";
                case SYSTEM_ANNOUNCEMENT:
                    return "System Announcement";
                default:
                    return "Unknown Type";
            }
        }
        
        private String getNotificationChannels(NotificationType type) {
            switch (type) {
                case ORDER_CONFIRMATION:
                    return "email,push";
                case ORDER_STATUS_UPDATE:
                    return "push";
                case ORDER_READY:
                case ORDER_CANCELLED:
                    return "email,push,sms";
                case RESTAURANT_APPROVED:
                case RESTAURANT_REJECTED:
                    return "email";
                case SYSTEM_ANNOUNCEMENT:
                    return "push";
                default:
                    return "none";
            }
        }
    }
}