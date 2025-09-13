package com.oneeats.unit.admin.domain;

import com.oneeats.admin.domain.model.AdminRole;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES ADMINROLE - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'enum AdminRole
 */
@DisplayName("AdminRole Unit Tests - Pure Domain Logic")
class AdminRoleTest {
    
    @Nested
    @DisplayName("Enum Values")
    class EnumValues {
        
        @Test
        @DisplayName("Should have all expected admin roles")
        void shouldHaveAllExpectedAdminRoles() {
            // When
            AdminRole[] roles = AdminRole.values();
            
            // Then
            assertEquals(3, roles.length);
            assertTrue(java.util.Arrays.asList(roles).contains(AdminRole.SUPER_ADMIN));
            assertTrue(java.util.Arrays.asList(roles).contains(AdminRole.ADMIN));
            assertTrue(java.util.Arrays.asList(roles).contains(AdminRole.MODERATOR));
        }
        
        @Test
        @DisplayName("Should parse role from string")
        void shouldParseRoleFromString() {
            // When & Then
            assertEquals(AdminRole.SUPER_ADMIN, AdminRole.valueOf("SUPER_ADMIN"));
            assertEquals(AdminRole.ADMIN, AdminRole.valueOf("ADMIN"));
            assertEquals(AdminRole.MODERATOR, AdminRole.valueOf("MODERATOR"));
        }
        
        @Test
        @DisplayName("Should throw exception for invalid role")
        void shouldThrowExceptionForInvalidRole() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                AdminRole.valueOf("INVALID_ROLE"));
        }
    }
    
    @Nested
    @DisplayName("Role Hierarchy Logic")
    class RoleHierarchyLogic {
        
        @Test
        @DisplayName("Should maintain role hierarchy order")
        void shouldMaintainRoleHierarchyOrder() {
            // Given - Expected hierarchy: SUPER_ADMIN > ADMIN > MODERATOR
            AdminRole superAdmin = AdminRole.SUPER_ADMIN;
            AdminRole admin = AdminRole.ADMIN;
            AdminRole moderator = AdminRole.MODERATOR;
            
            // When & Then - Ordinal values should reflect hierarchy
            assertTrue(superAdmin.ordinal() < admin.ordinal());
            assertTrue(admin.ordinal() < moderator.ordinal());
        }
        
        @Test
        @DisplayName("Should have consistent string representation")
        void shouldHaveConsistentStringRepresentation() {
            // When & Then
            assertEquals("SUPER_ADMIN", AdminRole.SUPER_ADMIN.toString());
            assertEquals("ADMIN", AdminRole.ADMIN.toString());
            assertEquals("MODERATOR", AdminRole.MODERATOR.toString());
        }
    }
}