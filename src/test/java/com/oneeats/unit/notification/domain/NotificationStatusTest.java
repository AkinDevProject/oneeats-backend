package com.oneeats.unit.notification.domain;

import com.oneeats.notification.domain.model.NotificationStatus;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES NOTIFICATIONSTATUS - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'enum NotificationStatus
 */
@DisplayName("NotificationStatus Unit Tests - Pure Domain Logic")
class NotificationStatusTest {
    
    @Nested
    @DisplayName("Enum Values")
    class EnumValues {
        
        @Test
        @DisplayName("Should have all expected notification statuses")
        void shouldHaveAllExpectedNotificationStatuses() {
            // When
            NotificationStatus[] statuses = NotificationStatus.values();
            
            // Then
            assertEquals(4, statuses.length);
            assertTrue(java.util.Arrays.asList(statuses).contains(NotificationStatus.PENDING));
            assertTrue(java.util.Arrays.asList(statuses).contains(NotificationStatus.SENT));
            assertTrue(java.util.Arrays.asList(statuses).contains(NotificationStatus.FAILED));
            assertTrue(java.util.Arrays.asList(statuses).contains(NotificationStatus.READ));
        }
        
        @Test
        @DisplayName("Should parse status from string")
        void shouldParseStatusFromString() {
            // When & Then
            assertEquals(NotificationStatus.PENDING, NotificationStatus.valueOf("PENDING"));
            assertEquals(NotificationStatus.SENT, NotificationStatus.valueOf("SENT"));
            assertEquals(NotificationStatus.FAILED, NotificationStatus.valueOf("FAILED"));
            assertEquals(NotificationStatus.READ, NotificationStatus.valueOf("READ"));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid status")
        void shouldThrowExceptionForInvalidStatus() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                NotificationStatus.valueOf("INVALID_STATUS"));
        }
    }
    
    @Nested
    @DisplayName("Status Workflow Logic")
    class StatusWorkflowLogic {
        
        @Test
        @DisplayName("Should have consistent string representation")
        void shouldHaveConsistentStringRepresentation() {
            // When & Then
            assertEquals("PENDING", NotificationStatus.PENDING.toString());
            assertEquals("SENT", NotificationStatus.SENT.toString());
            assertEquals("FAILED", NotificationStatus.FAILED.toString());
            assertEquals("READ", NotificationStatus.READ.toString());
        }
        
        @Test
        @DisplayName("Should maintain notification lifecycle order")
        void shouldMaintainNotificationLifecycleOrder() {
            // Given - Expected lifecycle: PENDING → SENT → READ (or PENDING → FAILED)
            NotificationStatus pending = NotificationStatus.PENDING;
            NotificationStatus sent = NotificationStatus.SENT;
            NotificationStatus failed = NotificationStatus.FAILED;
            NotificationStatus read = NotificationStatus.READ;
            
            // When & Then - Verify ordinal relationships for typical flow
            assertEquals(0, pending.ordinal()); // Always starts as pending
            assertTrue(sent.ordinal() > pending.ordinal()); // Sent after pending
            assertTrue(failed.ordinal() > pending.ordinal()); // Failed after pending
            assertTrue(read.ordinal() > sent.ordinal()); // Read after sent
        }
        
        @Test
        @DisplayName("Should distinguish between success and failure states")
        void shouldDistinguishBetweenSuccessAndFailureStates() {
            // Given
            NotificationStatus pending = NotificationStatus.PENDING;
            NotificationStatus sent = NotificationStatus.SENT;
            NotificationStatus failed = NotificationStatus.FAILED;
            NotificationStatus read = NotificationStatus.READ;
            
            // When & Then - All statuses should be different
            assertNotEquals(pending, sent);
            assertNotEquals(pending, failed);
            assertNotEquals(pending, read);
            assertNotEquals(sent, failed);
            assertNotEquals(sent, read);
            assertNotEquals(failed, read);
        }
        
        @Test
        @DisplayName("Should support notification retry scenarios")
        void shouldSupportNotificationRetryScenarios() {
            // Given - Failed notifications can be retried (FAILED → PENDING → SENT)
            NotificationStatus failed = NotificationStatus.FAILED;
            NotificationStatus pending = NotificationStatus.PENDING;
            NotificationStatus sent = NotificationStatus.SENT;
            
            // When & Then - Verify all states are available for retry logic
            assertNotNull(failed);
            assertNotNull(pending);
            assertNotNull(sent);
            
            // States should be distinguishable for retry logic
            assertNotEquals(failed.ordinal(), pending.ordinal());
            assertNotEquals(pending.ordinal(), sent.ordinal());
        }
    }
}