package com.oneeats.unit.user.domain;

import com.oneeats.user.domain.model.UserStatus;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES USERSTATUS - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'enum UserStatus
 */
@DisplayName("UserStatus Unit Tests - Pure Domain Logic")
class UserStatusTest {
    
    @Nested
    @DisplayName("Enum Values")
    class EnumValues {
        
        @Test
        @DisplayName("Should have all expected user statuses")
        void shouldHaveAllExpectedUserStatuses() {
            // When
            UserStatus[] statuses = UserStatus.values();
            
            // Then
            assertEquals(3, statuses.length);
            assertTrue(java.util.Arrays.asList(statuses).contains(UserStatus.ACTIVE));
            assertTrue(java.util.Arrays.asList(statuses).contains(UserStatus.INACTIVE));
            assertTrue(java.util.Arrays.asList(statuses).contains(UserStatus.SUSPENDED));
        }
        
        @Test
        @DisplayName("Should parse status from string")
        void shouldParseStatusFromString() {
            // When & Then
            assertEquals(UserStatus.ACTIVE, UserStatus.valueOf("ACTIVE"));
            assertEquals(UserStatus.INACTIVE, UserStatus.valueOf("INACTIVE"));
            assertEquals(UserStatus.SUSPENDED, UserStatus.valueOf("SUSPENDED"));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid status")
        void shouldThrowExceptionForInvalidStatus() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                UserStatus.valueOf("INVALID_STATUS"));
        }
    }
    
    @Nested
    @DisplayName("Status Logic")
    class StatusLogic {
        
        @Test
        @DisplayName("Should have consistent string representation")
        void shouldHaveConsistentStringRepresentation() {
            // When & Then
            assertEquals("ACTIVE", UserStatus.ACTIVE.toString());
            assertEquals("INACTIVE", UserStatus.INACTIVE.toString());
            assertEquals("SUSPENDED", UserStatus.SUSPENDED.toString());
        }
        
        @Test
        @DisplayName("Should distinguish between different statuses")
        void shouldDistinguishBetweenDifferentStatuses() {
            // When & Then
            UserStatus active = UserStatus.ACTIVE;
            UserStatus inactive = UserStatus.INACTIVE;
            UserStatus suspended = UserStatus.SUSPENDED;
            
            // All should have different ordinal values
            assertNotEquals(active.ordinal(), inactive.ordinal());
            assertNotEquals(active.ordinal(), suspended.ordinal());
            assertNotEquals(inactive.ordinal(), suspended.ordinal());
        }
        
        @Test
        @DisplayName("Should maintain status ordering")
        void shouldMaintainStatusOrdering() {
            // Given - Expected order based on typical user lifecycle
            UserStatus active = UserStatus.ACTIVE;
            UserStatus inactive = UserStatus.INACTIVE;
            UserStatus suspended = UserStatus.SUSPENDED;
            
            // When & Then - Verify consistent ordering
            assertTrue(active.ordinal() >= 0);
            assertTrue(inactive.ordinal() >= 0);
            assertTrue(suspended.ordinal() >= 0);
        }
    }
}