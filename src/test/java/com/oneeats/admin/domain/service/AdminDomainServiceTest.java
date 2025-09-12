package com.oneeats.admin.domain.service;

import com.oneeats.admin.domain.repository.IAdminRepository;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.shared.domain.exception.ValidationException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminDomainService Tests")
class AdminDomainServiceTest {
    
    @Mock
    private IAdminRepository adminRepository;
    
    private AdminDomainService adminDomainService;
    
    @BeforeEach
    void setUp() {
        adminDomainService = new AdminDomainService();
        // Inject mock using reflection since it's a domain service with CDI
        try {
            var repositoryField = adminDomainService.getClass().getDeclaredField("adminRepository");
            repositoryField.setAccessible(true);
            repositoryField.set(adminDomainService, adminRepository);
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup mocks", e);
        }
    }
    
    @Nested
    @DisplayName("Admin Creation Validation")
    class AdminCreationValidation {
        
        @Test
        @DisplayName("Should validate successful admin creation with valid data")
        void shouldValidateSuccessfulAdminCreationWithValidData() {
            // Given
            String firstName = "John";
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            when(adminRepository.existsByEmail(any(Email.class))).thenReturn(false);
            
            // When & Then
            assertDoesNotThrow(() -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            verify(adminRepository).existsByEmail(new Email(email));
        }
        
        @Test
        @DisplayName("Should throw ValidationException when first name is null")
        void shouldThrowValidationExceptionWhenFirstNameIsNull() {
            // Given
            String firstName = null;
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            assertEquals("Admin first name cannot be empty", exception.getMessage());
            verify(adminRepository, never()).existsByEmail(any());
        }
        
        @Test
        @DisplayName("Should throw ValidationException when first name is empty")
        void shouldThrowValidationExceptionWhenFirstNameIsEmpty() {
            // Given
            String firstName = "";
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            assertEquals("Admin first name cannot be empty", exception.getMessage());
            verify(adminRepository, never()).existsByEmail(any());
        }
        
        @Test
        @DisplayName("Should throw ValidationException when first name is blank")
        void shouldThrowValidationExceptionWhenFirstNameIsBlank() {
            // Given
            String firstName = "   ";
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            assertEquals("Admin first name cannot be empty", exception.getMessage());
            verify(adminRepository, never()).existsByEmail(any());
        }
        
        @Test
        @DisplayName("Should throw ValidationException when last name is null")
        void shouldThrowValidationExceptionWhenLastNameIsNull() {
            // Given
            String firstName = "John";
            String lastName = null;
            String email = "john.doe@test.com";
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            assertEquals("Admin last name cannot be empty", exception.getMessage());
            verify(adminRepository, never()).existsByEmail(any());
        }
        
        @Test
        @DisplayName("Should throw ValidationException when last name is empty")
        void shouldThrowValidationExceptionWhenLastNameIsEmpty() {
            // Given
            String firstName = "John";
            String lastName = "";
            String email = "john.doe@test.com";
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            assertEquals("Admin last name cannot be empty", exception.getMessage());
            verify(adminRepository, never()).existsByEmail(any());
        }
        
        @Test
        @DisplayName("Should throw ValidationException when last name is blank")
        void shouldThrowValidationExceptionWhenLastNameIsBlank() {
            // Given
            String firstName = "John";
            String lastName = "   ";
            String email = "john.doe@test.com";
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            assertEquals("Admin last name cannot be empty", exception.getMessage());
            verify(adminRepository, never()).existsByEmail(any());
        }
        
        @Test
        @DisplayName("Should throw ValidationException when first name exceeds 50 characters")
        void shouldThrowValidationExceptionWhenFirstNameExceeds50Characters() {
            // Given
            String firstName = "A".repeat(51); // 51 characters
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            assertEquals("Admin first name cannot exceed 50 characters", exception.getMessage());
            verify(adminRepository, never()).existsByEmail(any());
        }
        
        @Test
        @DisplayName("Should throw ValidationException when last name exceeds 50 characters")
        void shouldThrowValidationExceptionWhenLastNameExceeds50Characters() {
            // Given
            String firstName = "John";
            String lastName = "B".repeat(51); // 51 characters
            String email = "john.doe@test.com";
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            assertEquals("Admin last name cannot exceed 50 characters", exception.getMessage());
            verify(adminRepository, never()).existsByEmail(any());
        }
        
        @Test
        @DisplayName("Should allow first name with exactly 50 characters")
        void shouldAllowFirstNameWithExactly50Characters() {
            // Given
            String firstName = "A".repeat(50); // Exactly 50 characters
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            when(adminRepository.existsByEmail(any(Email.class))).thenReturn(false);
            
            // When & Then
            assertDoesNotThrow(() -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            verify(adminRepository).existsByEmail(new Email(email));
        }
        
        @Test
        @DisplayName("Should allow last name with exactly 50 characters")
        void shouldAllowLastNameWithExactly50Characters() {
            // Given
            String firstName = "John";
            String lastName = "B".repeat(50); // Exactly 50 characters
            String email = "john.doe@test.com";
            
            when(adminRepository.existsByEmail(any(Email.class))).thenReturn(false);
            
            // When & Then
            assertDoesNotThrow(() -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            verify(adminRepository).existsByEmail(new Email(email));
        }
        
        @Test
        @DisplayName("Should throw ValidationException when admin with email already exists")
        void shouldThrowValidationExceptionWhenAdminWithEmailAlreadyExists() {
            // Given
            String firstName = "John";
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            when(adminRepository.existsByEmail(any(Email.class))).thenReturn(true);
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            assertEquals("Admin with this email already exists", exception.getMessage());
            verify(adminRepository).existsByEmail(new Email(email));
        }
        
        @Test
        @DisplayName("Should create Email object correctly during validation")
        void shouldCreateEmailObjectCorrectlyDuringValidation() {
            // Given
            String firstName = "John";
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            when(adminRepository.existsByEmail(any(Email.class))).thenReturn(false);
            
            // When
            adminDomainService.validateAdminCreation(firstName, lastName, email);
            
            // Then
            verify(adminRepository).existsByEmail(argThat(emailArg -> 
                emailArg.getValue().equals(email)
            ));
        }
    }
    
    @Nested
    @DisplayName("Admin Deletion Validation")
    class AdminDeletionValidation {
        
        @Test
        @DisplayName("Should allow admin deletion when multiple active admins exist")
        void shouldAllowAdminDeletionWhenMultipleActiveAdminsExist() {
            // Given
            UUID adminId = UUID.randomUUID();
            when(adminRepository.countActiveAdmins()).thenReturn(3L);
            
            // When
            boolean canDelete = adminDomainService.canDeleteAdmin(adminId);
            
            // Then
            assertTrue(canDelete);
            verify(adminRepository).countActiveAdmins();
        }
        
        @Test
        @DisplayName("Should allow admin deletion when exactly 2 active admins exist")
        void shouldAllowAdminDeletionWhenExactly2ActiveAdminsExist() {
            // Given
            UUID adminId = UUID.randomUUID();
            when(adminRepository.countActiveAdmins()).thenReturn(2L);
            
            // When
            boolean canDelete = adminDomainService.canDeleteAdmin(adminId);
            
            // Then
            assertTrue(canDelete);
            verify(adminRepository).countActiveAdmins();
        }
        
        @Test
        @DisplayName("Should prevent admin deletion when only 1 active admin exists")
        void shouldPreventAdminDeletionWhenOnly1ActiveAdminExists() {
            // Given
            UUID adminId = UUID.randomUUID();
            when(adminRepository.countActiveAdmins()).thenReturn(1L);
            
            // When
            boolean canDelete = adminDomainService.canDeleteAdmin(adminId);
            
            // Then
            assertFalse(canDelete);
            verify(adminRepository).countActiveAdmins();
        }
        
        @Test
        @DisplayName("Should prevent admin deletion when no active admins exist")
        void shouldPreventAdminDeletionWhenNoActiveAdminsExist() {
            // Given
            UUID adminId = UUID.randomUUID();
            when(adminRepository.countActiveAdmins()).thenReturn(0L);
            
            // When
            boolean canDelete = adminDomainService.canDeleteAdmin(adminId);
            
            // Then
            assertFalse(canDelete);
            verify(adminRepository).countActiveAdmins();
        }
        
        @Test
        @DisplayName("Should handle edge case with large number of active admins")
        void shouldHandleEdgeCaseWithLargeNumberOfActiveAdmins() {
            // Given
            UUID adminId = UUID.randomUUID();
            when(adminRepository.countActiveAdmins()).thenReturn(100L);
            
            // When
            boolean canDelete = adminDomainService.canDeleteAdmin(adminId);
            
            // Then
            assertTrue(canDelete);
            verify(adminRepository).countActiveAdmins();
        }
    }
    
    @Nested
    @DisplayName("Service Integration")
    class ServiceIntegration {
        
        @Test
        @DisplayName("Should call repository exactly once for validation")
        void shouldCallRepositoryExactlyOnceForValidation() {
            // Given
            String firstName = "John";
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            when(adminRepository.existsByEmail(any(Email.class))).thenReturn(false);
            
            // When
            adminDomainService.validateAdminCreation(firstName, lastName, email);
            
            // Then
            verify(adminRepository, times(1)).existsByEmail(any(Email.class));
        }
        
        @Test
        @DisplayName("Should call repository exactly once for deletion check")
        void shouldCallRepositoryExactlyOnceForDeletionCheck() {
            // Given
            UUID adminId = UUID.randomUUID();
            when(adminRepository.countActiveAdmins()).thenReturn(2L);
            
            // When
            adminDomainService.canDeleteAdmin(adminId);
            
            // Then
            verify(adminRepository, times(1)).countActiveAdmins();
        }
        
        @Test
        @DisplayName("Should validate all constraints before checking email existence")
        void shouldValidateAllConstraintsBeforeCheckingEmailExistence() {
            // Given
            String firstName = ""; // Invalid
            String lastName = "Doe";
            String email = "john.doe@test.com";
            
            // When & Then
            assertThrows(ValidationException.class, 
                () -> adminDomainService.validateAdminCreation(firstName, lastName, email));
            
            // Repository should not be called due to early validation failure
            verify(adminRepository, never()).existsByEmail(any());
        }
    }
}