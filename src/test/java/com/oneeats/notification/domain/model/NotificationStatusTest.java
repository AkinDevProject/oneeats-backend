package com.oneeats.notification.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("NotificationStatus Tests")
class NotificationStatusTest {
    
    @Nested
    @DisplayName("Enum Values")
    class EnumValues {
        
        @Test
        @DisplayName("Should have all required status values")
        void shouldHaveAllRequiredStatusValues() {
            NotificationStatus[] statuses = NotificationStatus.values();
            
            assertEquals(4, statuses.length);
            assertTrue(contains(statuses, NotificationStatus.PENDING));
            assertTrue(contains(statuses, NotificationStatus.SENT));
            assertTrue(contains(statuses, NotificationStatus.FAILED));
            assertTrue(contains(statuses, NotificationStatus.READ));
        }
        
        @Test
        @DisplayName("Should have correct string representations")
        void shouldHaveCorrectStringRepresentations() {
            assertEquals("PENDING", NotificationStatus.PENDING.toString());
            assertEquals("SENT", NotificationStatus.SENT.toString());
            assertEquals("FAILED", NotificationStatus.FAILED.toString());
            assertEquals("READ", NotificationStatus.READ.toString());
        }
        
        private boolean contains(NotificationStatus[] statuses, NotificationStatus status) {
            for (NotificationStatus s : statuses) {
                if (s == status) {
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
            assertEquals(0, NotificationStatus.PENDING.ordinal());
            assertEquals(1, NotificationStatus.SENT.ordinal());
            assertEquals(2, NotificationStatus.FAILED.ordinal());
            assertEquals(3, NotificationStatus.READ.ordinal());
        }
        
        @Test
        @DisplayName("Should allow valueOf operations")
        void shouldAllowValueOfOperations() {
            assertEquals(NotificationStatus.PENDING, NotificationStatus.valueOf("PENDING"));
            assertEquals(NotificationStatus.SENT, NotificationStatus.valueOf("SENT"));
            assertEquals(NotificationStatus.FAILED, NotificationStatus.valueOf("FAILED"));
            assertEquals(NotificationStatus.READ, NotificationStatus.valueOf("READ"));
        }
        
        @Test
        @DisplayName("Should handle invalid valueOf gracefully")
        void shouldHandleInvalidValueOfGracefully() {
            assertThrows(IllegalArgumentException.class, () -> 
                NotificationStatus.valueOf("INVALID"));
        }
    }
    
    @Nested
    @DisplayName("Business Logic Implications")
    class BusinessLogicImplications {
        
        @Test
        @DisplayName("Should represent initial state as PENDING")
        void shouldRepresentInitialStateAsPending() {
            // PENDING should be the initial status for new notifications
            assertNotNull(NotificationStatus.PENDING);
            assertEquals("PENDING", NotificationStatus.PENDING.name());
        }
        
        @Test
        @DisplayName("Should represent successful delivery as SENT")
        void shouldRepresentSuccessfulDeliveryAsSent() {
            assertNotNull(NotificationStatus.SENT);
            assertEquals("SENT", NotificationStatus.SENT.name());
        }
        
        @Test
        @DisplayName("Should represent delivery failure as FAILED")
        void shouldRepresentDeliveryFailureAsFailed() {
            assertNotNull(NotificationStatus.FAILED);
            assertEquals("FAILED", NotificationStatus.FAILED.name());
        }
        
        @Test
        @DisplayName("Should represent user acknowledgment as read")
        void shouldRepresentUserAcknowledgmentAsRead() {
            assertNotNull(NotificationStatus.READ);
            assertEquals("READ", NotificationStatus.READ.name());
        }
    }
    
    @Nested
    @DisplayName("Comparison and Equality")
    class ComparisonAndEquality {
        
        @Test
        @DisplayName("Should support equality comparison")
        void shouldSupportEqualityComparison() {
            NotificationStatus status1 = NotificationStatus.PENDING;
            NotificationStatus status2 = NotificationStatus.PENDING;
            NotificationStatus status3 = NotificationStatus.SENT;
            
            assertEquals(status1, status2);
            assertNotEquals(status1, status3);
        }
        
        @Test
        @DisplayName("Should support comparison operations")
        void shouldSupportComparisonOperations() {
            assertTrue(NotificationStatus.PENDING.ordinal() < NotificationStatus.SENT.ordinal());
            assertTrue(NotificationStatus.SENT.ordinal() < NotificationStatus.FAILED.ordinal());
            assertTrue(NotificationStatus.FAILED.ordinal() < NotificationStatus.READ.ordinal());
        }
        
        @Test
        @DisplayName("Should have consistent hashCode")
        void shouldHaveConsistentHashCode() {
            NotificationStatus status1 = NotificationStatus.PENDING;
            NotificationStatus status2 = NotificationStatus.PENDING;
            
            assertEquals(status1.hashCode(), status2.hashCode());
        }
    }
    
    @Nested
    @DisplayName("Serialization")
    class Serialization {
        
        @Test
        @DisplayName("Should be serializable by name")
        void shouldBeSerializableByName() {
            for (NotificationStatus status : NotificationStatus.values()) {
                String serialized = status.name();
                NotificationStatus deserialized = NotificationStatus.valueOf(serialized);
                assertEquals(status, deserialized);
            }
        }
        
        @Test
        @DisplayName("Should handle case sensitivity correctly")
        void shouldHandleCaseSensitivityCorrectly() {
            // Only exact case should work for valueOf
            assertDoesNotThrow(() -> NotificationStatus.valueOf("PENDING"));
            assertDoesNotThrow(() -> NotificationStatus.valueOf("READ"));
            
            assertThrows(IllegalArgumentException.class, () -> 
                NotificationStatus.valueOf("pending"));
            assertThrows(IllegalArgumentException.class, () -> 
                NotificationStatus.valueOf("read"));
        }
    }
    
    @Nested
    @DisplayName("Integration with Switch Statements")
    class IntegrationWithSwitchStatements {
        
        @Test
        @DisplayName("Should work properly in switch statements")
        void shouldWorkProperlyInSwitchStatements() {
            String result = getStatusDescription(NotificationStatus.PENDING);
            assertEquals("Notification is waiting to be sent", result);
            
            result = getStatusDescription(NotificationStatus.SENT);
            assertEquals("Notification has been sent successfully", result);
            
            result = getStatusDescription(NotificationStatus.FAILED);
            assertEquals("Notification delivery failed", result);
            
            result = getStatusDescription(NotificationStatus.READ);
            assertEquals("Notification has been read by recipient", result);
        }
        
        private String getStatusDescription(NotificationStatus status) {
            switch (status) {
                case PENDING:
                    return "Notification is waiting to be sent";
                case SENT:
                    return "Notification has been sent successfully";
                case FAILED:
                    return "Notification delivery failed";
                case READ:
                    return "Notification has been read by recipient";
                default:
                    return "Unknown status";
            }
        }
    }
}