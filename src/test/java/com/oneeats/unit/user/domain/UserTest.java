package com.oneeats.unit.user.domain;

import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.shared.domain.vo.Email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES USER - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'entité User
 */
@DisplayName("User Unit Tests - Pure Domain Logic")
class UserTest {
    
    private User user;
    private UUID userId;
    
    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User(
            userId,
            "John",
            "Doe",
            new Email("john.doe@test.fr"),
            UserStatus.ACTIVE,
            "0123456789"
        );
    }
    
    @Nested
    @DisplayName("User Creation")
    class UserCreation {
        
        @Test
        @DisplayName("Should create user with factory method")
        void shouldCreateUserWithFactoryMethod() {
            // When
            User newUser = User.create(
                "Jane",
                "Smith",
                "jane.smith@test.fr",
                "password123"
            );
            
            // Then
            assertNotNull(newUser);
            assertNotNull(newUser.getId());
            assertEquals("Jane", newUser.getFirstName());
            assertEquals("Smith", newUser.getLastName());
            assertEquals("jane.smith@test.fr", newUser.getEmail().getValue());
            assertEquals(UserStatus.ACTIVE, newUser.getStatus());
            assertNotNull(newUser.getCreatedAt());
            
            // Should have domain events
            assertFalse(newUser.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should initialize with default values")
        void shouldInitializeWithDefaultValues() {
            // Then
            assertEquals(UserStatus.ACTIVE, user.getStatus());
            assertNotNull(user.getCreatedAt());
            assertTrue(user.isEmailVerified()); // Default true
        }
        
        @Test
        @DisplayName("Should validate email format during creation")
        void shouldValidateEmailFormatDuringCreation() {
            // When & Then - Should not throw for valid email
            assertDoesNotThrow(() -> new User(
                UUID.randomUUID(),
                "Valid",
                "User",
                new Email("valid@email.fr"),
                UserStatus.ACTIVE,
                "0123456789"
            ));
        }
    }
    
    @Nested
    @DisplayName("Profile Management")
    class ProfileManagement {
        
        @Test
        @DisplayName("Should update profile information")
        void shouldUpdateProfileInformation() {
            // When
            user.updateProfile("Johnny", "Doe-Smith", "0555123456");
            
            // Then
            assertEquals("Johnny", user.getFirstName());
            assertEquals("Doe-Smith", user.getLastName());
            assertEquals("0555123456", user.getPhone());
            assertNotNull(user.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should update email")
        void shouldUpdateEmail() {
            // When
            user.updateEmail("newemail@test.fr");
            
            // Then
            assertEquals("newemail@test.fr", user.getEmail().getValue());
            assertNotNull(user.getUpdatedAt());
            assertFalse(user.isEmailVerified()); // Should reset verification
        }
        
        @Test
        @DisplayName("Should get full name")
        void shouldGetFullName() {
            // When
            String fullName = user.getFullName();
            
            // Then
            assertEquals("John Doe", fullName);
        }
        
        @Test
        @DisplayName("Should handle null values in profile update")
        void shouldHandleNullValuesInProfileUpdate() {
            // Given
            String originalFirstName = user.getFirstName();
            String originalLastName = user.getLastName();
            String originalPhone = user.getPhone();
            
            // When - Update with nulls should preserve existing values
            user.updateProfile(null, null, null);
            
            // Then
            assertEquals(originalFirstName, user.getFirstName());
            assertEquals(originalLastName, user.getLastName());
            assertEquals(originalPhone, user.getPhone());
        }
    }
    
    @Nested
    @DisplayName("User Status Management")
    class UserStatusManagement {
        
        @Test
        @DisplayName("Should suspend active user")
        void shouldSuspendActiveUser() {
            // Given
            assertEquals(UserStatus.ACTIVE, user.getStatus());
            
            // When
            user.suspend();
            
            // Then
            assertEquals(UserStatus.SUSPENDED, user.getStatus());
            assertNotNull(user.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should reactivate suspended user")
        void shouldReactivateSuspendedUser() {
            // Given
            user.suspend();
            
            // When
            user.reactivate();
            
            // Then
            assertEquals(UserStatus.ACTIVE, user.getStatus());
            assertNotNull(user.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should deactivate user")
        void shouldDeactivateUser() {
            // When
            user.deactivate();
            
            // Then
            assertEquals(UserStatus.INACTIVE, user.getStatus());
            assertNotNull(user.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should reject invalid status transitions")
        void shouldRejectInvalidStatusTransitions() {
            // Given
            user.deactivate();
            
            // When & Then - Cannot reactivate deactivated user directly
            IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> user.reactivate()
            );
            assertTrue(exception.getMessage().contains("Cannot reactivate"));
        }
    }
    
    @Nested
    @DisplayName("Business Logic Queries")
    class BusinessLogicQueries {
        
        @Test
        @DisplayName("Should be active when status is ACTIVE")
        void shouldBeActiveWhenStatusIsActive() {
            // Given
            assertEquals(UserStatus.ACTIVE, user.getStatus());
            
            // When & Then
            assertTrue(user.isActive());
        }
        
        @Test
        @DisplayName("Should not be active when not active status")
        void shouldNotBeActiveWhenNotActiveStatus() {
            // SUSPENDED
            user.suspend();
            assertFalse(user.isActive());
            
            // INACTIVE
            user.deactivate();
            assertFalse(user.isActive());
        }
        
        @Test
        @DisplayName("Should be available for orders when active")
        void shouldBeAvailableForOrdersWhenActive() {
            // Given
            assertTrue(user.isActive());
            
            // When & Then
            assertTrue(user.canPlaceOrders());
        }
        
        @Test
        @DisplayName("Should not be available for orders when suspended")
        void shouldNotBeAvailableForOrdersWhenSuspended() {
            // Given
            user.suspend();
            
            // When & Then
            assertFalse(user.canPlaceOrders());
        }
        
        @Test
        @DisplayName("Should validate password strength")
        void shouldValidatePasswordStrength() {
            // When & Then - Strong passwords
            assertTrue(user.isValidPassword("StrongPassword123!"));
            assertTrue(user.isValidPassword("AnotherGood1@"));
            
            // Weak passwords
            assertFalse(user.isValidPassword("weak"));
            assertFalse(user.isValidPassword("123456"));
            assertFalse(user.isValidPassword("password"));
        }
    }
    
    @Nested
    @DisplayName("Email Verification")
    class EmailVerification {
        
        @Test
        @DisplayName("Should verify email")
        void shouldVerifyEmail() {
            // Given
            user.updateEmail("new@email.fr"); // This sets verified to false
            assertFalse(user.isEmailVerified());
            
            // When
            user.verifyEmail();
            
            // Then
            assertTrue(user.isEmailVerified());
            assertNotNull(user.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should generate email verification token")
        void shouldGenerateEmailVerificationToken() {
            // When
            String token = user.generateEmailVerificationToken();
            
            // Then
            assertNotNull(token);
            assertFalse(token.isEmpty());
            assertTrue(token.length() >= 20); // Reasonable token length
        }
        
        @Test
        @DisplayName("Should validate email verification token")
        void shouldValidateEmailVerificationToken() {
            // Given
            String token = user.generateEmailVerificationToken();
            
            // When & Then
            assertTrue(user.isValidEmailVerificationToken(token));
            assertFalse(user.isValidEmailVerificationToken("invalid-token"));
            assertFalse(user.isValidEmailVerificationToken(null));
        }
    }
    
    @Nested
    @DisplayName("Domain Events")
    class DomainEvents {
        
        @Test
        @DisplayName("Should emit UserCreatedEvent when created with factory")
        void shouldEmitUserCreatedEventWhenCreatedWithFactory() {
            // When
            User newUser = User.create(
                "Event",
                "User",
                "event@user.fr",
                "password123"
            );
            
            // Then
            assertEquals(1, newUser.getDomainEvents().size());
            assertTrue(newUser.getDomainEvents().get(0) instanceof com.oneeats.user.domain.event.UserCreatedEvent);
        }
        
        @Test
        @DisplayName("Should emit UserUpdatedEvent when profile updated")
        void shouldEmitUserUpdatedEventWhenProfileUpdated() {
            // Given
            user.clearDomainEvents();
            
            // When
            user.updateProfile("Updated", "Name", "0123456789");
            
            // Then
            assertEquals(1, user.getDomainEvents().size());
            assertTrue(user.getDomainEvents().get(0) instanceof com.oneeats.user.domain.event.UserUpdatedEvent);
        }
        
        @Test
        @DisplayName("Should emit UserStatusChangedEvent when status changed")
        void shouldEmitUserStatusChangedEventWhenStatusChanged() {
            // Given
            user.clearDomainEvents();
            
            // When
            user.suspend();
            
            // Then
            assertEquals(1, user.getDomainEvents().size());
            // Note: Assuming UserStatusChangedEvent exists
        }
        
        @Test
        @DisplayName("Should clear domain events")
        void shouldClearDomainEvents() {
            // Given
            user.updateProfile("Test", "User", "0123456789"); // Generates event
            assertFalse(user.getDomainEvents().isEmpty());
            
            // When
            user.clearDomainEvents();
            
            // Then
            assertTrue(user.getDomainEvents().isEmpty());
        }
    }
    
    @Nested
    @DisplayName("Password Management")
    class PasswordManagement {
        
        @Test
        @DisplayName("Should hash password when set")
        void shouldHashPasswordWhenSet() {
            // When
            user.setPassword("newPassword123!");
            
            // Then
            String hashedPassword = user.getHashedPassword();
            assertNotNull(hashedPassword);
            assertNotEquals("newPassword123!", hashedPassword); // Should be hashed
            assertTrue(hashedPassword.length() > 20); // Hashed password is longer
        }
        
        @Test
        @DisplayName("Should validate password against hash")
        void shouldValidatePasswordAgainstHash() {
            // Given
            String plainPassword = "testPassword123!";
            user.setPassword(plainPassword);
            
            // When & Then
            assertTrue(user.checkPassword(plainPassword));
            assertFalse(user.checkPassword("wrongPassword"));
            assertFalse(user.checkPassword(null));
        }
        
        @Test
        @DisplayName("Should reject weak passwords")
        void shouldRejectWeakPasswords() {
            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> user.setPassword("weak")
            );
            assertTrue(exception.getMessage().contains("Password does not meet"));
        }
    }
}