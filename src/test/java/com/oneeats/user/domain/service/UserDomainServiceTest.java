package com.oneeats.user.domain.service;

import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.user.domain.specification.UniqueEmailSpecification;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.shared.domain.exception.ValidationException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserDomainService Tests")
class UserDomainServiceTest {
    
    @Mock
    private IUserRepository userRepository;
    
    @Mock
    private UniqueEmailSpecification uniqueEmailSpec;
    
    private UserDomainService domainService;
    
    @BeforeEach
    void setUp() {
        domainService = new UserDomainService();
        // Inject mocks using reflection since it's an application service
        try {
            var repositoryField = domainService.getClass().getDeclaredField("userRepository");
            repositoryField.setAccessible(true);
            repositoryField.set(domainService, userRepository);
            
            var specField = domainService.getClass().getDeclaredField("uniqueEmailSpec");
            specField.setAccessible(true);
            specField.set(domainService, uniqueEmailSpec);
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup mocks", e);
        }
    }
    
    @Nested
    @DisplayName("User Creation Validation")
    class UserCreationValidation {
        
        @Test
        @DisplayName("Should validate user creation with unique email")
        void shouldValidateUserCreationWithUniqueEmail() {
            // Given
            Email email = new Email("john.doe@example.com");
            when(uniqueEmailSpec.isSatisfiedBy(email)).thenReturn(true);
            
            // When & Then
            assertDoesNotThrow(() -> 
                domainService.validateUserCreation("John", "Doe", email));
            
            // Verify interactions
            verify(uniqueEmailSpec).isSatisfiedBy(email);
        }
        
        @Test
        @DisplayName("Should throw exception for duplicate email")
        void shouldThrowExceptionForDuplicateEmail() {
            // Given
            Email email = new Email("john.doe@example.com");
            when(uniqueEmailSpec.isSatisfiedBy(email)).thenReturn(false);
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                domainService.validateUserCreation("John", "Doe", email));
            
            assertEquals("Email already exists: john.doe@example.com", exception.getMessage());
            verify(uniqueEmailSpec).isSatisfiedBy(email);
        }
        
        @Test
        @DisplayName("Should validate with different email formats")
        void shouldValidateWithDifferentEmailFormats() {
            // Given
            Email email1 = new Email("user+tag@domain.com");
            Email email2 = new Email("user.name@sub.domain.org");
            
            when(uniqueEmailSpec.isSatisfiedBy(any(Email.class))).thenReturn(true);
            
            // When & Then
            assertDoesNotThrow(() -> 
                domainService.validateUserCreation("John", "Doe", email1));
            assertDoesNotThrow(() -> 
                domainService.validateUserCreation("Jane", "Smith", email2));
            
            verify(uniqueEmailSpec, times(2)).isSatisfiedBy(any(Email.class));
        }
    }
    
    @Nested
    @DisplayName("User Update Validation")
    class UserUpdateValidation {
        
        @Test
        @DisplayName("Should validate user update with valid data")
        void shouldValidateUserUpdateWithValidData() {
            // Given
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            
            // When & Then
            assertDoesNotThrow(() -> 
                domainService.validateUserUpdate(user, "Jane", "Smith"));
        }
        
        @Test
        @DisplayName("Should validate user update with same names")
        void shouldValidateUserUpdateWithSameNames() {
            // Given
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            
            // When & Then
            assertDoesNotThrow(() -> 
                domainService.validateUserUpdate(user, "John", "Doe"));
        }
        
        @Test
        @DisplayName("Should accept null parameters for user update validation")
        void shouldAcceptNullParametersForUserUpdateValidation() {
            // Given
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            
            // When & Then - Method should not throw for null parameters
            // (business rules would be implemented here in a real scenario)
            assertDoesNotThrow(() -> 
                domainService.validateUserUpdate(user, null, null));
        }
    }
    
    @Nested
    @DisplayName("User Deletion Rules")
    class UserDeletionRules {
        
        @Test
        @DisplayName("Should allow deletion of inactive user")
        void shouldAllowDeletionOfInactiveUser() {
            // Given
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            user.deactivate();
            
            // When
            boolean canDelete = domainService.canDeleteUser(user);
            
            // Then
            assertTrue(canDelete);
        }
        
        @Test
        @DisplayName("Should not allow deletion of active user")
        void shouldNotAllowDeletionOfActiveUser() {
            // Given
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            
            // When
            boolean canDelete = domainService.canDeleteUser(user);
            
            // Then
            assertFalse(canDelete);
        }
        
        @Test
        @DisplayName("Should not allow deletion of suspended user")
        void shouldNotAllowDeletionOfSuspendedUser() {
            // Given
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            // Since there's no suspend method, we need to create from persistence
            User suspendedUser = User.fromPersistence(
                user.getId(), "John", "Doe", "john.doe@example.com", 
                "password123", UserStatus.SUSPENDED, user.getCreatedAt(), user.getUpdatedAt()
            );
            
            // When
            boolean canDelete = domainService.canDeleteUser(suspendedUser);
            
            // Then
            assertFalse(canDelete);
        }
        
        @Test
        @DisplayName("Should delegate to user domain model for deletion rules")
        void shouldDelegateToUserDomainModelForDeletionRules() {
            // Given
            User activeUser = User.create("John", "Doe", "john.doe@example.com", "password123");
            User inactiveUser = User.create("Jane", "Smith", "jane.smith@example.com", "password123");
            inactiveUser.deactivate();
            
            // When
            boolean canDeleteActive = domainService.canDeleteUser(activeUser);
            boolean canDeleteInactive = domainService.canDeleteUser(inactiveUser);
            
            // Then
            assertFalse(canDeleteActive);
            assertTrue(canDeleteInactive);
            
            // Verify the domain service delegates to the user model
            assertEquals(activeUser.canBeDeleted(), canDeleteActive);
            assertEquals(inactiveUser.canBeDeleted(), canDeleteInactive);
        }
    }
    
    @Nested
    @DisplayName("Integration and Edge Cases")
    class IntegrationAndEdgeCases {
        
        @Test
        @DisplayName("Should handle multiple validation calls")
        void shouldHandleMultipleValidationCalls() {
            // Given
            Email email1 = new Email("user1@example.com");
            Email email2 = new Email("user2@example.com");
            Email email3 = new Email("existing@example.com");
            
            when(uniqueEmailSpec.isSatisfiedBy(email1)).thenReturn(true);
            when(uniqueEmailSpec.isSatisfiedBy(email2)).thenReturn(true);
            when(uniqueEmailSpec.isSatisfiedBy(email3)).thenReturn(false);
            
            // When & Then
            assertDoesNotThrow(() -> 
                domainService.validateUserCreation("User", "One", email1));
            assertDoesNotThrow(() -> 
                domainService.validateUserCreation("User", "Two", email2));
            
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                domainService.validateUserCreation("Existing", "User", email3));
            
            assertEquals("Email already exists: existing@example.com", exception.getMessage());
            
            verify(uniqueEmailSpec, times(3)).isSatisfiedBy(any(Email.class));
        }
        
        @Test
        @DisplayName("Should work with different user statuses")
        void shouldWorkWithDifferentUserStatuses() {
            // Given
            User activeUser = User.fromPersistence(
                java.util.UUID.randomUUID(), "Active", "User", "active@example.com",
                "hash", UserStatus.ACTIVE, java.time.LocalDateTime.now(), java.time.LocalDateTime.now()
            );
            
            User inactiveUser = User.fromPersistence(
                java.util.UUID.randomUUID(), "Inactive", "User", "inactive@example.com",
                "hash", UserStatus.INACTIVE, java.time.LocalDateTime.now(), java.time.LocalDateTime.now()
            );
            
            User suspendedUser = User.fromPersistence(
                java.util.UUID.randomUUID(), "Suspended", "User", "suspended@example.com",
                "hash", UserStatus.SUSPENDED, java.time.LocalDateTime.now(), java.time.LocalDateTime.now()
            );
            
            // When & Then
            assertFalse(domainService.canDeleteUser(activeUser));
            assertTrue(domainService.canDeleteUser(inactiveUser));
            assertFalse(domainService.canDeleteUser(suspendedUser));
        }
    }
}