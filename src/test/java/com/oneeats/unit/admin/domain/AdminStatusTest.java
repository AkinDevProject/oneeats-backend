package com.oneeats.unit.admin.domain;

import com.oneeats.admin.domain.model.AdminStatus;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES ADMINSTATUS - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'enum AdminStatus
 */
@DisplayName("AdminStatus Unit Tests - Pure Domain Logic")
class AdminStatusTest {
    
    @Nested
    @DisplayName("Enum Values")
    class EnumValues {
        
        @Test
        @DisplayName("Should have all expected admin statuses")
        void shouldHaveAllExpectedAdminStatuses() {
            // When
            AdminStatus[] statuses = AdminStatus.values();
            
            // Then
            assertEquals(3, statuses.length);
            assertTrue(java.util.Arrays.asList(statuses).contains(AdminStatus.ACTIVE));
            assertTrue(java.util.Arrays.asList(statuses).contains(AdminStatus.INACTIVE));
            assertTrue(java.util.Arrays.asList(statuses).contains(AdminStatus.SUSPENDED));
        }
        
        @Test
        @DisplayName("Should parse status from string")
        void shouldParseStatusFromString() {
            // When & Then
            assertEquals(AdminStatus.ACTIVE, AdminStatus.valueOf("ACTIVE"));
            assertEquals(AdminStatus.INACTIVE, AdminStatus.valueOf("INACTIVE"));
            assertEquals(AdminStatus.SUSPENDED, AdminStatus.valueOf("SUSPENDED"));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid status")
        void shouldThrowExceptionForInvalidStatus() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                AdminStatus.valueOf("INVALID_STATUS"));
        }
    }
    
    @Nested
    @DisplayName("Status Logic")
    class StatusLogic {
        
        @Test
        @DisplayName("Should have consistent string representation")
        void shouldHaveConsistentStringRepresentation() {
            // When & Then
            assertEquals("ACTIVE", AdminStatus.ACTIVE.toString());
            assertEquals("INACTIVE", AdminStatus.INACTIVE.toString());
            assertEquals("SUSPENDED", AdminStatus.SUSPENDED.toString());
        }
        
        @Test
        @DisplayName("Should distinguish between active and inactive states")
        void shouldDistinguishBetweenActiveAndInactiveStates() {
            // When & Then - ACTIVE is the only truly active status
            AdminStatus active = AdminStatus.ACTIVE;
            AdminStatus inactive = AdminStatus.INACTIVE;
            AdminStatus suspended = AdminStatus.SUSPENDED;
            
            // All should have different ordinal values
            assertNotEquals(active.ordinal(), inactive.ordinal());
            assertNotEquals(active.ordinal(), suspended.ordinal());
            assertNotEquals(inactive.ordinal(), suspended.ordinal());
        }
    }
}