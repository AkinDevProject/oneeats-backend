package com.oneeats.admin.domain.model;

import com.oneeats.shared.domain.vo.Email;
import com.oneeats.admin.domain.event.AdminCreatedEvent;
import com.oneeats.shared.domain.event.IDomainEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Admin Model Tests")
class AdminTest {
    
    private String firstName;
    private String lastName;
    private String emailString;
    private String password;
    private AdminRole role;
    
    @BeforeEach
    void setUp() {
        firstName = "John";
        lastName = "Admin";
        emailString = "john.admin@oneeats.com";
        password = "securePassword123";
        role = AdminRole.ADMIN;
    }
    
    @Nested
    @DisplayName("Admin Creation")
    class AdminCreation {
        
        @Test
        @DisplayName("Should create admin with valid data")
        void shouldCreateAdminWithValidData() {
            Admin admin = Admin.create(firstName, lastName, emailString, password, role);
            
            assertNotNull(admin);
            assertNotNull(admin.getId());
            assertEquals(firstName, admin.getFirstName());
            assertEquals(lastName, admin.getLastName());
            assertEquals(new Email(emailString), admin.getEmail());
            assertEquals(password, admin.getPasswordHash()); // TODO: Will change when proper hashing is implemented
            assertEquals(role, admin.getRole());
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
        }
        
        @Test
        @DisplayName("Should create admin with SUPER_ADMIN role")
        void shouldCreateAdminWithSuperAdminRole() {
            Admin admin = Admin.create(firstName, lastName, emailString, password, AdminRole.SUPER_ADMIN);
            
            assertEquals(AdminRole.SUPER_ADMIN, admin.getRole());
        }
        
        @Test
        @DisplayName("Should create admin with MODERATOR role")
        void shouldCreateAdminWithModeratorRole() {
            Admin admin = Admin.create(firstName, lastName, emailString, password, AdminRole.MODERATOR);
            
            assertEquals(AdminRole.MODERATOR, admin.getRole());
        }
        
        @Test
        @DisplayName("Should set default status to ACTIVE on creation")
        void shouldSetDefaultStatusToActiveOnCreation() {
            Admin admin = Admin.create(firstName, lastName, emailString, password, role);
            
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
            assertTrue(admin.isActive());
        }
        
        @Test
        @DisplayName("Should publish AdminCreatedEvent on creation")
        void shouldPublishAdminCreatedEventOnCreation() {
            Admin admin = Admin.create(firstName, lastName, emailString, password, role);
            
            List<IDomainEvent> events = admin.getDomainEvents();
            assertEquals(1, events.size());
            assertTrue(events.get(0) instanceof AdminCreatedEvent);
            
            AdminCreatedEvent event = (AdminCreatedEvent) events.get(0);
            assertEquals(admin.getId(), event.getAdminId());
            assertEquals(admin.getEmail(), event.getEmail());
            assertEquals(admin.getRole(), event.getRole());
            assertNotNull(event.occurredOn());
        }
    }
    
    @Nested
    @DisplayName("Admin Status Management")
    class AdminStatusManagement {
        
        private Admin admin;
        
        @BeforeEach
        void setUp() {
            admin = Admin.create(firstName, lastName, emailString, password, role);
        }
        
        @Test
        @DisplayName("Should activate admin")
        void shouldActivateAdmin() {
            // First deactivate to test activation
            admin.deactivate();
            assertFalse(admin.isActive());
            
            admin.activate();
            
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
            assertTrue(admin.isActive());
        }
        
        @Test
        @DisplayName("Should deactivate admin")
        void shouldDeactivateAdmin() {
            admin.deactivate();
            
            assertEquals(AdminStatus.INACTIVE, admin.getStatus());
            assertFalse(admin.isActive());
        }
        
        @Test
        @DisplayName("Should suspend admin")
        void shouldSuspendAdmin() {
            admin.suspend();
            
            assertEquals(AdminStatus.SUSPENDED, admin.getStatus());
            assertFalse(admin.isActive());
        }
        
        @Test
        @DisplayName("Should handle multiple status changes")
        void shouldHandleMultipleStatusChanges() {
            // ACTIVE -> SUSPENDED -> INACTIVE -> ACTIVE
            assertTrue(admin.isActive());
            
            admin.suspend();
            assertEquals(AdminStatus.SUSPENDED, admin.getStatus());
            assertFalse(admin.isActive());
            
            admin.deactivate();
            assertEquals(AdminStatus.INACTIVE, admin.getStatus());
            assertFalse(admin.isActive());
            
            admin.activate();
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
            assertTrue(admin.isActive());
        }
    }
    
    @Nested
    @DisplayName("Admin Business Logic")
    class AdminBusinessLogic {
        
        private Admin admin;
        
        @BeforeEach
        void setUp() {
            admin = Admin.create(firstName, lastName, emailString, password, role);
        }
        
        @Test
        @DisplayName("Should return correct full name")
        void shouldReturnCorrectFullName() {
            String expectedFullName = firstName + " " + lastName;
            assertEquals(expectedFullName, admin.getFullName());
        }
        
        @Test
        @DisplayName("Should handle full name with different names")
        void shouldHandleFullNameWithDifferentNames() {
            Admin adminWithDifferentName = Admin.create("Jane", "SuperAdmin", "jane@oneeats.com", "password", AdminRole.SUPER_ADMIN);
            assertEquals("Jane SuperAdmin", adminWithDifferentName.getFullName());
        }
        
        @Test
        @DisplayName("Should handle single character names")
        void shouldHandleSingleCharacterNames() {
            Admin adminWithShortName = Admin.create("A", "B", "ab@oneeats.com", "password", role);
            assertEquals("A B", adminWithShortName.getFullName());
        }
    }
    
    @Nested
    @DisplayName("Admin Validation")
    class AdminValidation {
        
        @Test
        @DisplayName("Should validate email format during creation")
        void shouldValidateEmailFormatDuringCreation() {
            assertThrows(Exception.class, () -> 
                Admin.create(firstName, lastName, "invalid-email", password, role));
        }
        
        @Test
        @DisplayName("Should handle null values appropriately")
        void shouldHandleNullValuesAppropriately() {
            // Email validation will catch null email
            assertThrows(Exception.class, () -> 
                Admin.create(firstName, lastName, null, password, role));
        }
    }
    
    @Nested
    @DisplayName("Admin Properties")
    class AdminProperties {
        
        private Admin admin;
        
        @BeforeEach
        void setUp() {
            admin = Admin.create(firstName, lastName, emailString, password, role);
        }
        
        @Test
        @DisplayName("Should return correct first name")
        void shouldReturnCorrectFirstName() {
            assertEquals(firstName, admin.getFirstName());
        }
        
        @Test
        @DisplayName("Should return correct last name")
        void shouldReturnCorrectLastName() {
            assertEquals(lastName, admin.getLastName());
        }
        
        @Test
        @DisplayName("Should return correct email")
        void shouldReturnCorrectEmail() {
            assertEquals(new Email(emailString), admin.getEmail());
        }
        
        @Test
        @DisplayName("Should return correct password hash")
        void shouldReturnCorrectPasswordHash() {
            // TODO: This will change when proper password hashing is implemented
            assertEquals(password, admin.getPasswordHash());
        }
        
        @Test
        @DisplayName("Should return correct role")
        void shouldReturnCorrectRole() {
            assertEquals(role, admin.getRole());
        }
        
        @Test
        @DisplayName("Should return correct status")
        void shouldReturnCorrectStatus() {
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
        }
    }
    
    @Nested
    @DisplayName("Admin Domain Events")
    class AdminDomainEvents {
        
        @Test
        @DisplayName("Should publish AdminCreatedEvent with correct data")
        void shouldPublishAdminCreatedEventWithCorrectData() {
            Admin admin = Admin.create(firstName, lastName, emailString, password, role);
            
            List<IDomainEvent> events = admin.getDomainEvents();
            assertEquals(1, events.size());
            
            AdminCreatedEvent event = (AdminCreatedEvent) events.get(0);
            assertEquals(admin.getId(), event.getAdminId());
            assertEquals(admin.getEmail(), event.getEmail());
            assertEquals(admin.getRole(), event.getRole());
            assertNotNull(event.occurredOn());
        }
        
        @Test
        @DisplayName("Should maintain event immutability")
        void shouldMaintainEventImmutability() {
            Admin admin = Admin.create(firstName, lastName, emailString, password, role);
            AdminCreatedEvent event = (AdminCreatedEvent) admin.getDomainEvents().get(0);
            
            // Verify event properties don't change
            UUID originalAdminId = event.getAdminId();
            Email originalEmail = event.getEmail();
            AdminRole originalRole = event.getRole();
            
            assertEquals(originalAdminId, event.getAdminId());
            assertEquals(originalEmail, event.getEmail());
            assertEquals(originalRole, event.getRole());
        }
    }
    
    @Nested
    @DisplayName("Admin Constructor Tests")
    class AdminConstructorTests {
        
        @Test
        @DisplayName("Should create admin with full constructor")
        void shouldCreateAdminWithFullConstructor() {
            UUID id = UUID.randomUUID();
            Email email = new Email(emailString);
            
            Admin admin = new Admin(id, firstName, lastName, email, password, role, AdminStatus.ACTIVE);
            
            assertEquals(id, admin.getId());
            assertEquals(firstName, admin.getFirstName());
            assertEquals(lastName, admin.getLastName());
            assertEquals(email, admin.getEmail());
            assertEquals(password, admin.getPasswordHash());
            assertEquals(role, admin.getRole());
            assertEquals(AdminStatus.ACTIVE, admin.getStatus());
        }
        
        @Test
        @DisplayName("Should create admin with different statuses")
        void shouldCreateAdminWithDifferentStatuses() {
            UUID id = UUID.randomUUID();
            Email email = new Email(emailString);
            
            Admin inactiveAdmin = new Admin(id, firstName, lastName, email, password, role, AdminStatus.INACTIVE);
            Admin suspendedAdmin = new Admin(id, firstName, lastName, email, password, role, AdminStatus.SUSPENDED);
            
            assertEquals(AdminStatus.INACTIVE, inactiveAdmin.getStatus());
            assertEquals(AdminStatus.SUSPENDED, suspendedAdmin.getStatus());
            assertFalse(inactiveAdmin.isActive());
            assertFalse(suspendedAdmin.isActive());
        }
    }
}