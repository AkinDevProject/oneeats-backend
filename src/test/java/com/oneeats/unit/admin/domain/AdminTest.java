package com.oneeats.unit.admin.domain;

import com.oneeats.admin.domain.model.Admin;
import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.admin.domain.model.AdminStatus;
import com.oneeats.shared.domain.vo.Email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES ADMIN - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'entité Admin
 */
@DisplayName("Admin Unit Tests - Pure Domain Logic")
class AdminTest {
    
    private Admin admin;
    private UUID adminId;
    
    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        admin = new Admin(
            adminId,
            "John",
            "Doe",
            new Email("john.doe@admin.fr"),
            "hashedPassword123",
            AdminRole.ADMIN,
            AdminStatus.ACTIVE
        );
    }
    
    @Nested
    @DisplayName("Admin Creation")
    class AdminCreation {
        
        @Test
        @DisplayName("Should create admin with factory method")
        void shouldCreateAdminWithFactoryMethod() {
            // When
            Admin newAdmin = Admin.create(
                "Jane",
                "Smith",
                "jane.smith@admin.fr",
                "password123",
                AdminRole.MODERATOR
            );
            
            // Then
            assertNotNull(newAdmin);
            assertNotNull(newAdmin.getId());
            assertEquals("Jane", newAdmin.getFirstName());
            assertEquals("Smith", newAdmin.getLastName());
            assertEquals("jane.smith@admin.fr", newAdmin.getEmail().getValue());
            assertEquals(AdminRole.MODERATOR, newAdmin.getRole());
            assertEquals(AdminStatus.ACTIVE, newAdmin.getStatus()); // Default status
            assertNotNull(newAdmin.getPasswordHash());
            assertNotNull(newAdmin.getCreatedAt());
            
            // Should have domain events
            assertFalse(newAdmin.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should initialize with provided values")
        void shouldInitializeWithProvidedValues() {
            // Then
            assertEquals(adminId, admin.getId());
            assertEquals("John", admin.getFirstName());
            assertEquals("Doe", admin.getLastName());
            assertEquals("john.doe@admin.fr", admin.getEmail().getValue());
            assertEquals("hashedPassword123", admin.getPasswordHash());
            assertEquals(AdminRole.ADMIN, admin.getRole());
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
        }
        
        @Test
        @DisplayName("Should validate email format during creation")
        void shouldValidateEmailFormatDuringCreation() {
            // When & Then - Should not throw for valid email
            assertDoesNotThrow(() -> Admin.create(
                "Valid",
                "Admin",
                "valid@admin.fr",
                "password123",
                AdminRole.ADMIN
            ));
        }
        
        @Test
        @DisplayName("Should create admin with different roles")
        void shouldCreateAdminWithDifferentRoles() {
            // When
            Admin superAdmin = Admin.create("Super", "Admin", "super@admin.fr", "pass", AdminRole.SUPER_ADMIN);
            Admin moderator = Admin.create("Moderator", "User", "mod@admin.fr", "pass", AdminRole.MODERATOR);
            Admin regularAdmin = Admin.create("Regular", "Admin", "admin@admin.fr", "pass", AdminRole.ADMIN);
            
            // Then
            assertEquals(AdminRole.SUPER_ADMIN, superAdmin.getRole());
            assertEquals(AdminRole.MODERATOR, moderator.getRole());
            assertEquals(AdminRole.ADMIN, regularAdmin.getRole());
        }
    }
    
    @Nested
    @DisplayName("Admin Status Management")
    class AdminStatusManagement {
        
        @Test
        @DisplayName("Should be active by default after creation")
        void shouldBeActiveByDefaultAfterCreation() {
            // Given
            Admin newAdmin = Admin.create("Test", "Admin", "test@admin.fr", "pass", AdminRole.ADMIN);
            
            // Then
            assertTrue(newAdmin.isActive());
            assertEquals(AdminStatus.ACTIVE, newAdmin.getStatus());
        }
        
        @Test
        @DisplayName("Should activate inactive admin")
        void shouldActivateInactiveAdmin() {
            // Given
            admin.deactivate();
            assertFalse(admin.isActive());
            
            // When
            admin.activate();
            
            // Then
            assertTrue(admin.isActive());
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
            assertNotNull(admin.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should deactivate active admin")
        void shouldDeactivateActiveAdmin() {
            // Given
            assertTrue(admin.isActive());
            
            // When
            admin.deactivate();
            
            // Then
            assertFalse(admin.isActive());
            assertEquals(AdminStatus.INACTIVE, admin.getStatus());
            assertNotNull(admin.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should suspend active admin")
        void shouldSuspendActiveAdmin() {
            // Given
            assertTrue(admin.isActive());
            
            // When
            admin.suspend();
            
            // Then
            assertFalse(admin.isActive());
            assertEquals(AdminStatus.SUSPENDED, admin.getStatus());
            assertNotNull(admin.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should reactivate suspended admin")
        void shouldReactivateSuspendedAdmin() {
            // Given
            admin.suspend();
            assertEquals(AdminStatus.SUSPENDED, admin.getStatus());
            
            // When
            admin.activate();
            
            // Then
            assertTrue(admin.isActive());
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
        }
        
        @Test
        @DisplayName("Should handle multiple status transitions")
        void shouldHandleMultipleStatusTransitions() {
            // Initial: ACTIVE
            assertTrue(admin.isActive());
            
            // ACTIVE → SUSPENDED
            admin.suspend();
            assertEquals(AdminStatus.SUSPENDED, admin.getStatus());
            assertFalse(admin.isActive());
            
            // SUSPENDED → INACTIVE
            admin.deactivate();
            assertEquals(AdminStatus.INACTIVE, admin.getStatus());
            assertFalse(admin.isActive());
            
            // INACTIVE → ACTIVE
            admin.activate();
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
            assertTrue(admin.isActive());
        }
    }
    
    @Nested
    @DisplayName("Business Logic Queries")
    class BusinessLogicQueries {
        
        @Test
        @DisplayName("Should be active only when status is ACTIVE")
        void shouldBeActiveOnlyWhenStatusIsActive() {
            // ACTIVE
            admin.activate();
            assertTrue(admin.isActive());
            
            // INACTIVE
            admin.deactivate();
            assertFalse(admin.isActive());
            
            // SUSPENDED
            admin.suspend();
            assertFalse(admin.isActive());
        }
        
        @Test
        @DisplayName("Should provide full name")
        void shouldProvideFullName() {
            // When
            String fullName = admin.getFullName();
            
            // Then
            assertEquals("John Doe", fullName);
        }
        
        @Test
        @DisplayName("Should handle full name with different cases")
        void shouldHandleFullNameWithDifferentCases() {
            // Given
            Admin adminWithDifferentNames = new Admin(
                UUID.randomUUID(),
                "jean-pierre",
                "MARTIN",
                new Email("jp.martin@admin.fr"),
                "hash",
                AdminRole.ADMIN,
                AdminStatus.ACTIVE
            );
            
            // When
            String fullName = adminWithDifferentNames.getFullName();
            
            // Then
            assertEquals("jean-pierre MARTIN", fullName);
        }
        
        @Test
        @DisplayName("Should provide admin information")
        void shouldProvideAdminInformation() {
            // Then
            assertEquals("John", admin.getFirstName());
            assertEquals("Doe", admin.getLastName());
            assertEquals("john.doe@admin.fr", admin.getEmail().getValue());
            assertEquals(AdminRole.ADMIN, admin.getRole());
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
            assertNotNull(admin.getPasswordHash());
        }
    }
    
    @Nested
    @DisplayName("Role-based Behavior")
    class RoleBasedBehavior {
        
        @Test
        @DisplayName("Should create admins with different roles")
        void shouldCreateAdminsWithDifferentRoles() {
            // Given
            Admin superAdmin = Admin.create("Super", "User", "super@admin.fr", "pass", AdminRole.SUPER_ADMIN);
            Admin moderator = Admin.create("Mod", "User", "mod@admin.fr", "pass", AdminRole.MODERATOR);
            Admin regularAdmin = Admin.create("Admin", "User", "admin@admin.fr", "pass", AdminRole.ADMIN);
            
            // Then
            assertEquals(AdminRole.SUPER_ADMIN, superAdmin.getRole());
            assertEquals(AdminRole.MODERATOR, moderator.getRole());
            assertEquals(AdminRole.ADMIN, regularAdmin.getRole());
            
            // All should be active by default
            assertTrue(superAdmin.isActive());
            assertTrue(moderator.isActive());
            assertTrue(regularAdmin.isActive());
        }
        
        @Test
        @DisplayName("Should maintain role after status changes")
        void shouldMaintainRoleAfterStatusChanges() {
            // Given
            Admin moderator = Admin.create("Test", "Mod", "mod@admin.fr", "pass", AdminRole.MODERATOR);
            
            // When - Change status multiple times
            moderator.suspend();
            moderator.activate();
            moderator.deactivate();
            moderator.activate();
            
            // Then - Role should remain unchanged
            assertEquals(AdminRole.MODERATOR, moderator.getRole());
        }
    }
    
    @Nested
    @DisplayName("Password Management")
    class PasswordManagement {
        
        @Test
        @DisplayName("Should store password hash")
        void shouldStorePasswordHash() {
            // Given
            Admin newAdmin = Admin.create("Test", "User", "test@admin.fr", "plainPassword123", AdminRole.ADMIN);
            
            // Then
            assertNotNull(newAdmin.getPasswordHash());
            // Note: In a real implementation, password should be properly hashed
            // For now, it's just stored as-is according to the TODO in the code
        }
        
        @Test
        @DisplayName("Should handle different password lengths")
        void shouldHandleDifferentPasswordLengths() {
            // When & Then - Different password lengths should work
            assertDoesNotThrow(() -> {
                Admin shortPass = Admin.create("User1", "Test", "user1@admin.fr", "abc", AdminRole.ADMIN);
                Admin longPass = Admin.create("User2", "Test", "user2@admin.fr", "very-long-password-123456789", AdminRole.ADMIN);
                
                assertNotNull(shortPass.getPasswordHash());
                assertNotNull(longPass.getPasswordHash());
            });
        }
    }
    
    @Nested
    @DisplayName("Domain Events")
    class DomainEvents {
        
        @Test
        @DisplayName("Should emit AdminCreatedEvent when created with factory")
        void shouldEmitAdminCreatedEventWhenCreatedWithFactory() {
            // When
            Admin newAdmin = Admin.create(
                "Event",
                "Test",
                "event@admin.fr",
                "password",
                AdminRole.SUPER_ADMIN
            );
            
            // Then
            assertEquals(1, newAdmin.getDomainEvents().size());
            assertTrue(newAdmin.getDomainEvents().get(0) instanceof com.oneeats.admin.domain.event.AdminCreatedEvent);
        }
        
        @Test
        @DisplayName("Should not emit events for direct constructor")
        void shouldNotEmitEventsForDirectConstructor() {
            // When
            Admin directAdmin = new Admin(
                UUID.randomUUID(),
                "Direct",
                "Admin",
                new Email("direct@admin.fr"),
                "hash",
                AdminRole.ADMIN,
                AdminStatus.ACTIVE
            );
            
            // Then
            assertTrue(directAdmin.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should clear domain events")
        void shouldClearDomainEvents() {
            // Given
            Admin newAdmin = Admin.create("Test", "Admin", "test@admin.fr", "pass", AdminRole.ADMIN);
            assertFalse(newAdmin.getDomainEvents().isEmpty());
            
            // When
            newAdmin.clearDomainEvents();
            
            // Then
            assertTrue(newAdmin.getDomainEvents().isEmpty());
        }
    }
    
    @Nested
    @DisplayName("Edge Cases and Validation")
    class EdgeCasesAndValidation {
        
        @Test
        @DisplayName("Should handle single character names")
        void shouldHandleSingleCharacterNames() {
            // When & Then
            assertDoesNotThrow(() -> {
                Admin singleChar = new Admin(
                    UUID.randomUUID(),
                    "A",
                    "B",
                    new Email("ab@admin.fr"),
                    "hash",
                    AdminRole.ADMIN,
                    AdminStatus.ACTIVE
                );
                
                assertEquals("A B", singleChar.getFullName());
            });
        }
        
        @Test
        @DisplayName("Should handle names with special characters")
        void shouldHandleNamesWithSpecialCharacters() {
            // Given
            Admin specialNames = new Admin(
                UUID.randomUUID(),
                "Jean-François",
                "O'Connor",
                new Email("jf.oconnor@admin.fr"),
                "hash",
                AdminRole.ADMIN,
                AdminStatus.ACTIVE
            );
            
            // When & Then
            assertEquals("Jean-François O'Connor", specialNames.getFullName());
            assertEquals("Jean-François", specialNames.getFirstName());
            assertEquals("O'Connor", specialNames.getLastName());
        }
        
        @Test
        @DisplayName("Should maintain immutability of role and basic info")
        void shouldMaintainImmutabilityOfRoleAndBasicInfo() {
            // Given
            Admin originalAdmin = Admin.create("Original", "Admin", "orig@admin.fr", "pass", AdminRole.MODERATOR);
            
            // When - Only status should be mutable through public methods
            originalAdmin.suspend();
            
            // Then - Everything else should remain unchanged
            assertEquals("Original", originalAdmin.getFirstName());
            assertEquals("Admin", originalAdmin.getLastName());
            assertEquals("orig@admin.fr", originalAdmin.getEmail().getValue());
            assertEquals(AdminRole.MODERATOR, originalAdmin.getRole());
            // Only status changed
            assertEquals(AdminStatus.SUSPENDED, originalAdmin.getStatus());
        }
        
        @Test
        @DisplayName("Should handle repeated status changes")
        void shouldHandleRepeatedStatusChanges() {
            // When - Multiple identical status changes
            admin.activate();
            admin.activate();
            admin.activate();
            
            // Then - Should remain consistent
            assertTrue(admin.isActive());
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
            
            // When - Multiple deactivations
            admin.deactivate();
            admin.deactivate();
            
            // Then
            assertFalse(admin.isActive());
            assertEquals(AdminStatus.INACTIVE, admin.getStatus());
        }
    }
    
    @Nested
    @DisplayName("String Representation and Basic Operations")
    class StringRepresentationAndBasicOperations {
        
        @Test
        @DisplayName("Should handle toString operation")
        void shouldHandleToStringOperation() {
            // When
            String toString = admin.toString();
            
            // Then
            assertNotNull(toString);
            assertTrue(toString.length() > 0);
        }
        
        @Test
        @DisplayName("Should handle basic object operations")
        void shouldHandleBasicObjectOperations() {
            // When & Then - Should not crash on basic operations
            assertDoesNotThrow(() -> {
                admin.hashCode();
                admin.equals(admin);
                admin.equals(null);
                admin.equals("string");
            });
        }
        
        @Test
        @DisplayName("Should identify same admin correctly")
        void shouldIdentifySameAdminCorrectly() {
            // Given - Same admin instance
            Admin sameAdmin = admin;
            
            // When & Then
            assertTrue(admin.equals(sameAdmin));
            assertEquals(admin.hashCode(), sameAdmin.hashCode());
        }
    }
}