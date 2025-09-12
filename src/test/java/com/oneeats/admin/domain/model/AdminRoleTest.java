package com.oneeats.admin.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AdminRole Enum Tests")
class AdminRoleTest {
    
    @Nested
    @DisplayName("Admin Role Values")
    class AdminRoleValues {
        
        @Test
        @DisplayName("Should have all expected role values")
        void shouldHaveAllExpectedRoleValues() {
            AdminRole[] roles = AdminRole.values();
            
            assertEquals(3, roles.length);
            assertEquals(AdminRole.SUPER_ADMIN, AdminRole.valueOf("SUPER_ADMIN"));
            assertEquals(AdminRole.ADMIN, AdminRole.valueOf("ADMIN"));
            assertEquals(AdminRole.MODERATOR, AdminRole.valueOf("MODERATOR"));
        }
        
        @Test
        @DisplayName("Should maintain consistent enum ordering")
        void shouldMaintainConsistentEnumOrdering() {
            AdminRole[] roles = AdminRole.values();
            
            assertEquals(AdminRole.SUPER_ADMIN, roles[0]);
            assertEquals(AdminRole.ADMIN, roles[1]);
            assertEquals(AdminRole.MODERATOR, roles[2]);
        }
    }
    
    @Nested
    @DisplayName("Admin Role Hierarchy")
    class AdminRoleHierarchy {
        
        @Test
        @DisplayName("Should identify super admin role correctly")
        void shouldIdentifySuperAdminRoleCorrectly() {
            assertEquals("SUPER_ADMIN", AdminRole.SUPER_ADMIN.name());
            assertEquals(AdminRole.SUPER_ADMIN, AdminRole.SUPER_ADMIN);
        }
        
        @Test
        @DisplayName("Should identify admin role correctly")
        void shouldIdentifyAdminRoleCorrectly() {
            assertEquals("ADMIN", AdminRole.ADMIN.name());
            assertEquals(AdminRole.ADMIN, AdminRole.ADMIN);
        }
        
        @Test
        @DisplayName("Should identify moderator role correctly")
        void shouldIdentifyModeratorRoleCorrectly() {
            assertEquals("MODERATOR", AdminRole.MODERATOR.name());
            assertEquals(AdminRole.MODERATOR, AdminRole.MODERATOR);
        }
        
        @Test
        @DisplayName("Should distinguish between different roles")
        void shouldDistinguishBetweenDifferentRoles() {
            assertNotEquals(AdminRole.SUPER_ADMIN, AdminRole.ADMIN);
            assertNotEquals(AdminRole.ADMIN, AdminRole.MODERATOR);
            assertNotEquals(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR);
        }
    }
    
    @Nested
    @DisplayName("Admin Role Enum Properties")
    class AdminRoleEnumProperties {
        
        @Test
        @DisplayName("Should handle toString correctly")
        void shouldHandleToStringCorrectly() {
            assertEquals("SUPER_ADMIN", AdminRole.SUPER_ADMIN.toString());
            assertEquals("ADMIN", AdminRole.ADMIN.toString());
            assertEquals("MODERATOR", AdminRole.MODERATOR.toString());
        }
        
        @Test
        @DisplayName("Should handle valueOf correctly")
        void shouldHandleValueOfCorrectly() {
            assertEquals(AdminRole.SUPER_ADMIN, AdminRole.valueOf("SUPER_ADMIN"));
            assertEquals(AdminRole.ADMIN, AdminRole.valueOf("ADMIN"));
            assertEquals(AdminRole.MODERATOR, AdminRole.valueOf("MODERATOR"));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid valueOf")
        void shouldThrowExceptionForInvalidValueOf() {
            assertThrows(IllegalArgumentException.class, () -> 
                AdminRole.valueOf("INVALID"));
            assertThrows(IllegalArgumentException.class, () -> 
                AdminRole.valueOf("admin"));
            assertThrows(NullPointerException.class, () -> 
                AdminRole.valueOf(null));
        }
        
        @Test
        @DisplayName("Should handle ordinal values correctly")
        void shouldHandleOrdinalValuesCorrectly() {
            assertEquals(0, AdminRole.SUPER_ADMIN.ordinal());
            assertEquals(1, AdminRole.ADMIN.ordinal());
            assertEquals(2, AdminRole.MODERATOR.ordinal());
        }
    }
}