package com.oneeats.user.domain.model;

import com.oneeats.shared.domain.exception.ValidationException;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.user.domain.event.UserCreatedEvent;
import com.oneeats.user.domain.event.UserUpdatedEvent;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("User Domain Model Tests")
class UserTest {
    
    @Nested
    @DisplayName("User Creation")
    class UserCreation {
        
        @Test
        @DisplayName("Should create user with valid data")
        void shouldCreateUserWithValidData() {
            // When
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            
            // Then
            assertNotNull(user);
            assertEquals("John", user.getFirstName());
            assertEquals("Doe", user.getLastName());
            assertEquals("john.doe@example.com", user.getEmail().getValue());
            assertEquals("hashed_password123", user.getHashedPassword());
            assertEquals(UserStatus.ACTIVE, user.getStatus());
            assertEquals("John Doe", user.getFullName());
            assertNotNull(user.getUpdatedAt());
            
            // Check domain event was published
            assertEquals(1, user.getDomainEvents().size());
            assertTrue(user.getDomainEvents().get(0) instanceof UserCreatedEvent);
            UserCreatedEvent event = (UserCreatedEvent) user.getDomainEvents().get(0);
            assertEquals(user.getId(), event.getUserId());
            assertEquals(user.getEmail(), event.getEmail());
            assertEquals(user.getFullName(), event.getFullName());
        }
        
        @Test
        @DisplayName("Should throw exception for null firstName")
        void shouldThrowExceptionForNullFirstName() {
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                User.create(null, "Doe", "john.doe@example.com", "password123"));
            assertEquals("Name cannot be null or empty", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for empty firstName")
        void shouldThrowExceptionForEmptyFirstName() {
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                User.create("", "Doe", "john.doe@example.com", "password123"));
            assertEquals("Name cannot be null or empty", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for whitespace-only firstName")
        void shouldThrowExceptionForWhitespaceOnlyFirstName() {
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                User.create("   ", "Doe", "john.doe@example.com", "password123"));
            assertEquals("Name cannot be null or empty", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for null lastName")
        void shouldThrowExceptionForNullLastName() {
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                User.create("John", null, "john.doe@example.com", "password123"));
            assertEquals("Name cannot be null or empty", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for firstName too long")
        void shouldThrowExceptionForFirstNameTooLong() {
            String longName = "a".repeat(51);
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                User.create(longName, "Doe", "john.doe@example.com", "password123"));
            assertEquals("Name cannot exceed 50 characters", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for lastName too long")
        void shouldThrowExceptionForLastNameTooLong() {
            String longName = "a".repeat(51);
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                User.create("John", longName, "john.doe@example.com", "password123"));
            assertEquals("Name cannot exceed 50 characters", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for null password")
        void shouldThrowExceptionForNullPassword() {
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                User.create("John", "Doe", "john.doe@example.com", null));
            assertEquals("Password must be at least 6 characters", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for password too short")
        void shouldThrowExceptionForPasswordTooShort() {
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                User.create("John", "Doe", "john.doe@example.com", "12345"));
            assertEquals("Password must be at least 6 characters", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should trim names during creation")
        void shouldTrimNamesDuringCreation() {
            // When
            User user = User.create("  John  ", "  Doe  ", "john.doe@example.com", "password123");
            
            // Then
            assertEquals("John", user.getFirstName());
            assertEquals("Doe", user.getLastName());
        }
    }
    
    @Nested
    @DisplayName("User Profile Updates")
    class UserProfileUpdates {
        
        private User createTestUser() {
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            user.clearDomainEvents(); // Clear creation event for cleaner tests
            return user;
        }
        
        @Test
        @DisplayName("Should update profile with valid data")
        void shouldUpdateProfileWithValidData() {
            // Given
            User user = createTestUser();
            LocalDateTime originalUpdatedAt = user.getUpdatedAt();
            
            // When
            user.updateProfile("Jane", "Smith");
            
            // Then
            assertEquals("Jane", user.getFirstName());
            assertEquals("Smith", user.getLastName());
            assertEquals("Jane Smith", user.getFullName());
            assertTrue(user.getUpdatedAt().isAfter(originalUpdatedAt));
            
            // Check domain event was published
            assertEquals(1, user.getDomainEvents().size());
            assertTrue(user.getDomainEvents().get(0) instanceof UserUpdatedEvent);
            UserUpdatedEvent event = (UserUpdatedEvent) user.getDomainEvents().get(0);
            assertEquals(user.getId(), event.getUserId());
            assertEquals(user.getEmail(), event.getEmail());
        }
        
        @Test
        @DisplayName("Should throw exception when updating profile with null firstName")
        void shouldThrowExceptionWhenUpdatingProfileWithNullFirstName() {
            // Given
            User user = createTestUser();
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                user.updateProfile(null, "Smith"));
            assertEquals("Name cannot be null or empty", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should trim names during profile update")
        void shouldTrimNamesDuringProfileUpdate() {
            // Given
            User user = createTestUser();
            
            // When
            user.updateProfile("  Jane  ", "  Smith  ");
            
            // Then
            assertEquals("Jane", user.getFirstName());
            assertEquals("Smith", user.getLastName());
        }
    }
    
    @Nested
    @DisplayName("User Email Management")
    class UserEmailManagement {
        
        private User createTestUser() {
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            user.clearDomainEvents();
            return user;
        }
        
        @Test
        @DisplayName("Should change email with valid email")
        void shouldChangeEmailWithValidEmail() {
            // Given
            User user = createTestUser();
            LocalDateTime originalUpdatedAt = user.getUpdatedAt();
            
            // When
            user.changeEmail("jane.doe@example.com");
            
            // Then
            assertEquals("jane.doe@example.com", user.getEmail().getValue());
            assertTrue(user.getUpdatedAt().isAfter(originalUpdatedAt));
            
            // Check domain event was published
            assertEquals(1, user.getDomainEvents().size());
            assertTrue(user.getDomainEvents().get(0) instanceof UserUpdatedEvent);
        }
        
        @Test
        @DisplayName("Should throw exception for invalid email format")
        void shouldThrowExceptionForInvalidEmailFormat() {
            // Given
            User user = createTestUser();
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                user.changeEmail("invalid-email"));
            assertEquals("Invalid email format: invalid-email", exception.getMessage());
        }
    }
    
    @Nested
    @DisplayName("User Status Management")
    class UserStatusManagement {
        
        private User createTestUser() {
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            user.clearDomainEvents();
            return user;
        }
        
        @Test
        @DisplayName("Should activate user")
        void shouldActivateUser() {
            // Given
            User user = createTestUser();
            user.deactivate(); // First deactivate
            user.clearDomainEvents();
            LocalDateTime originalUpdatedAt = user.getUpdatedAt();
            
            // When
            user.activate();
            
            // Then
            assertEquals(UserStatus.ACTIVE, user.getStatus());
            assertTrue(user.getUpdatedAt().isAfter(originalUpdatedAt));
            
            // Check domain event was published
            assertEquals(1, user.getDomainEvents().size());
            assertTrue(user.getDomainEvents().get(0) instanceof UserUpdatedEvent);
        }
        
        @Test
        @DisplayName("Should deactivate user")
        void shouldDeactivateUser() {
            // Given
            User user = createTestUser();
            LocalDateTime originalUpdatedAt = user.getUpdatedAt();
            
            // When
            user.deactivate();
            
            // Then
            assertEquals(UserStatus.INACTIVE, user.getStatus());
            assertTrue(user.getUpdatedAt().isAfter(originalUpdatedAt));
            
            // Check domain event was published
            assertEquals(1, user.getDomainEvents().size());
            assertTrue(user.getDomainEvents().get(0) instanceof UserUpdatedEvent);
        }
        
        @Test
        @DisplayName("Should check if user can be deleted when inactive")
        void shouldCheckIfUserCanBeDeletedWhenInactive() {
            // Given
            User user = createTestUser();
            user.deactivate();
            
            // When & Then
            assertTrue(user.canBeDeleted());
        }
        
        @Test
        @DisplayName("Should check if user cannot be deleted when active")
        void shouldCheckIfUserCannotBeDeletedWhenActive() {
            // Given
            User user = createTestUser();
            
            // When & Then
            assertFalse(user.canBeDeleted());
        }
    }
    
    @Nested
    @DisplayName("User Persistence Support")
    class UserPersistenceSupport {
        
        @Test
        @DisplayName("Should create user from persistence data")
        void shouldCreateUserFromPersistenceData() {
            // Given
            UUID id = UUID.randomUUID();
            LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
            LocalDateTime updatedAt = LocalDateTime.now().minusHours(1);
            
            // When
            User user = User.fromPersistence(
                id, "John", "Doe", "john.doe@example.com", 
                "hashed_password123", UserStatus.ACTIVE, createdAt, updatedAt);
            
            // Then
            assertEquals(id, user.getId());
            assertEquals("John", user.getFirstName());
            assertEquals("Doe", user.getLastName());
            assertEquals("john.doe@example.com", user.getEmail().getValue());
            assertEquals("hashed_password123", user.getHashedPassword());
            assertEquals(UserStatus.ACTIVE, user.getStatus());
            assertEquals(createdAt, user.getCreatedAt());
            assertEquals(updatedAt, user.getUpdatedAt());
            
            // No domain events should be generated for persistence reconstruction
            assertTrue(user.getDomainEvents().isEmpty());
        }
    }
    
    @Nested
    @DisplayName("User Business Rules")
    class UserBusinessRules {
        
        @Test
        @DisplayName("Should generate correct full name")
        void shouldGenerateCorrectFullName() {
            // Given
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            
            // When & Then
            assertEquals("John Doe", user.getFullName());
        }
        
        @Test
        @DisplayName("Should handle names with special characters")
        void shouldHandleNamesWithSpecialCharacters() {
            // Given & When
            User user = User.create("Jean-Pierre", "O'Connor", "jean@example.com", "password123");
            
            // Then
            assertEquals("Jean-Pierre", user.getFirstName());
            assertEquals("O'Connor", user.getLastName());
            assertEquals("Jean-Pierre O'Connor", user.getFullName());
        }
    }
    
    @Nested
    @DisplayName("User Equality and Identity")
    class UserEqualityAndIdentity {
        
        @Test
        @DisplayName("Should be equal when IDs are equal")
        void shouldBeEqualWhenIdsAreEqual() {
            // Given
            UUID id = UUID.randomUUID();
            User user1 = User.fromPersistence(id, "John", "Doe", "john@example.com", "hash", UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
            User user2 = User.fromPersistence(id, "Jane", "Smith", "jane@example.com", "hash", UserStatus.INACTIVE, LocalDateTime.now(), LocalDateTime.now());
            
            // When & Then
            assertEquals(user1, user2);
            assertEquals(user1.hashCode(), user2.hashCode());
        }
        
        @Test
        @DisplayName("Should not be equal when IDs are different")
        void shouldNotBeEqualWhenIdsAreDifferent() {
            // Given
            User user1 = User.create("John", "Doe", "john@example.com", "password123");
            User user2 = User.create("John", "Doe", "john@example.com", "password123");
            
            // When & Then
            assertNotEquals(user1, user2);
        }
        
        @Test
        @DisplayName("Should not be equal to null")
        void shouldNotBeEqualToNull() {
            // Given
            User user = User.create("John", "Doe", "john@example.com", "password123");
            
            // When & Then
            assertNotEquals(user, null);
        }
        
        @Test
        @DisplayName("Should not be equal to different type")
        void shouldNotBeEqualToDifferentType() {
            // Given
            User user = User.create("John", "Doe", "john@example.com", "password123");
            
            // When & Then
            assertNotEquals(user, "not a user");
        }
    }
}