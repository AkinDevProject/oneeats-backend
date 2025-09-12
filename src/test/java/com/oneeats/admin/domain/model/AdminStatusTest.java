package com.oneeats.admin.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AdminStatus Enum Tests")
class AdminStatusTest {
    
    @Nested
    @DisplayName("Admin Status Values")
    class AdminStatusValues {
        
        @Test
        @DisplayName("Should have all expected status values")
        void shouldHaveAllExpectedStatusValues() {
            AdminStatus[] statuses = AdminStatus.values();
            
            assertEquals(3, statuses.length);
            assertEquals(AdminStatus.ACTIVE, AdminStatus.valueOf("ACTIVE"));
            assertEquals(AdminStatus.INACTIVE, AdminStatus.valueOf("INACTIVE"));
            assertEquals(AdminStatus.SUSPENDED, AdminStatus.valueOf("SUSPENDED"));
        }
        
        @Test
        @DisplayName("Should maintain consistent enum ordering")
        void shouldMaintainConsistentEnumOrdering() {
            AdminStatus[] statuses = AdminStatus.values();
            
            assertEquals(AdminStatus.ACTIVE, statuses[0]);
            assertEquals(AdminStatus.INACTIVE, statuses[1]);
            assertEquals(AdminStatus.SUSPENDED, statuses[2]);
        }
    }
    
    @Nested
    @DisplayName("Admin Status Business Logic")
    class AdminStatusBusinessLogic {
        
        @Test
        @DisplayName("Should identify active status correctly")
        void shouldIdentifyActiveStatusCorrectly() {
            // Could be extended if business logic methods are added to the enum
            assertEquals("ACTIVE", AdminStatus.ACTIVE.name());
            assertEquals(AdminStatus.ACTIVE, AdminStatus.ACTIVE);
        }
        
        @Test
        @DisplayName("Should identify inactive statuses correctly")
        void shouldIdentifyInactiveStatusesCorrectly() {
            assertEquals("INACTIVE", AdminStatus.INACTIVE.name());
            assertEquals("SUSPENDED", AdminStatus.SUSPENDED.name());
            
            assertNotEquals(AdminStatus.ACTIVE, AdminStatus.INACTIVE);
            assertNotEquals(AdminStatus.ACTIVE, AdminStatus.SUSPENDED);
        }
    }
    
    @Nested
    @DisplayName("Admin Status Enum Properties")
    class AdminStatusEnumProperties {
        
        @Test
        @DisplayName("Should handle toString correctly")
        void shouldHandleToStringCorrectly() {
            assertEquals("ACTIVE", AdminStatus.ACTIVE.toString());
            assertEquals("INACTIVE", AdminStatus.INACTIVE.toString());
            assertEquals("SUSPENDED", AdminStatus.SUSPENDED.toString());
        }
        
        @Test
        @DisplayName("Should handle valueOf correctly")
        void shouldHandleValueOfCorrectly() {
            assertEquals(AdminStatus.ACTIVE, AdminStatus.valueOf("ACTIVE"));
            assertEquals(AdminStatus.INACTIVE, AdminStatus.valueOf("INACTIVE"));
            assertEquals(AdminStatus.SUSPENDED, AdminStatus.valueOf("SUSPENDED"));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid valueOf")
        void shouldThrowExceptionForInvalidValueOf() {
            assertThrows(IllegalArgumentException.class, () -> 
                AdminStatus.valueOf("INVALID"));
            assertThrows(IllegalArgumentException.class, () -> 
                AdminStatus.valueOf("active"));
            assertThrows(NullPointerException.class, () -> 
                AdminStatus.valueOf(null));
        }
    }
}