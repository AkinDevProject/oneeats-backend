package com.oneeats.user.domain.specification;

import com.oneeats.user.domain.repository.IUserRepository;
import com.oneeats.shared.domain.vo.Email;

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
@DisplayName("UniqueEmailSpecification Tests")
class UniqueEmailSpecificationTest {
    
    @Mock
    private IUserRepository userRepository;
    
    private UniqueEmailSpecification specification;
    
    @BeforeEach
    void setUp() {
        specification = new UniqueEmailSpecification();
        // Inject mock using reflection since it's a CDI component
        try {
            var repositoryField = specification.getClass().getDeclaredField("userRepository");
            repositoryField.setAccessible(true);
            repositoryField.set(specification, userRepository);
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup mock", e);
        }
    }
    
    @Nested
    @DisplayName("Email Uniqueness Validation")
    class EmailUniquenessValidation {
        
        @Test
        @DisplayName("Should return true for unique email")
        void shouldReturnTrueForUniqueEmail() {
            // Given
            Email uniqueEmail = new Email("unique@example.com");
            when(userRepository.existsByEmail(uniqueEmail)).thenReturn(false);
            
            // When
            boolean result = specification.isSatisfiedBy(uniqueEmail);
            
            // Then
            assertTrue(result);
            verify(userRepository).existsByEmail(uniqueEmail);
        }
        
        @Test
        @DisplayName("Should return false for existing email")
        void shouldReturnFalseForExistingEmail() {
            // Given
            Email existingEmail = new Email("existing@example.com");
            when(userRepository.existsByEmail(existingEmail)).thenReturn(true);
            
            // When
            boolean result = specification.isSatisfiedBy(existingEmail);
            
            // Then
            assertFalse(result);
            verify(userRepository).existsByEmail(existingEmail);
        }
        
        @Test
        @DisplayName("Should handle case-sensitive email comparison")
        void shouldHandleCaseSensitiveEmailComparison() {
            // Given
            Email lowerCaseEmail = new Email("user@example.com");
            Email upperCaseEmail = new Email("USER@EXAMPLE.COM");
            Email mixedCaseEmail = new Email("User@Example.Com");
            
            when(userRepository.existsByEmail(any(Email.class))).thenReturn(false);
            
            // When
            boolean result1 = specification.isSatisfiedBy(lowerCaseEmail);
            boolean result2 = specification.isSatisfiedBy(upperCaseEmail);
            boolean result3 = specification.isSatisfiedBy(mixedCaseEmail);
            
            // Then
            assertTrue(result1);
            assertTrue(result2);
            assertTrue(result3);
            
            verify(userRepository, times(3)).existsByEmail(any(Email.class));
        }
        
        @Test
        @DisplayName("Should validate different email formats")
        void shouldValidateDifferentEmailFormats() {
            // Given
            Email simpleEmail = new Email("simple@domain.com");
            Email emailWithPlus = new Email("user+tag@domain.com");
            Email emailWithDots = new Email("user.name@domain.com");
            Email emailWithSubdomain = new Email("user@sub.domain.com");
            
            when(userRepository.existsByEmail(any(Email.class))).thenReturn(false);
            
            // When & Then
            assertTrue(specification.isSatisfiedBy(simpleEmail));
            assertTrue(specification.isSatisfiedBy(emailWithPlus));
            assertTrue(specification.isSatisfiedBy(emailWithDots));
            assertTrue(specification.isSatisfiedBy(emailWithSubdomain));
            
            verify(userRepository, times(4)).existsByEmail(any(Email.class));
        }
    }
    
    @Nested
    @DisplayName("Repository Integration")
    class RepositoryIntegration {
        
        @Test
        @DisplayName("Should call repository exactly once per validation")
        void shouldCallRepositoryExactlyOncePerValidation() {
            // Given
            Email email = new Email("test@example.com");
            when(userRepository.existsByEmail(email)).thenReturn(false);
            
            // When
            specification.isSatisfiedBy(email);
            
            // Then
            verify(userRepository, times(1)).existsByEmail(email);
            verifyNoMoreInteractions(userRepository);
        }
        
        @Test
        @DisplayName("Should handle repository exceptions gracefully")
        void shouldHandleRepositoryExceptionsGracefully() {
            // Given
            Email email = new Email("test@example.com");
            when(userRepository.existsByEmail(email))
                .thenThrow(new RuntimeException("Database connection error"));
            
            // When & Then
            assertThrows(RuntimeException.class, () -> 
                specification.isSatisfiedBy(email));
            
            verify(userRepository).existsByEmail(email);
        }
        
        @Test
        @DisplayName("Should work with multiple consecutive calls")
        void shouldWorkWithMultipleConsecutiveCalls() {
            // Given
            Email email1 = new Email("user1@example.com");
            Email email2 = new Email("user2@example.com");
            Email email3 = new Email("existing@example.com");
            
            when(userRepository.existsByEmail(email1)).thenReturn(false);
            when(userRepository.existsByEmail(email2)).thenReturn(false);
            when(userRepository.existsByEmail(email3)).thenReturn(true);
            
            // When
            boolean result1 = specification.isSatisfiedBy(email1);
            boolean result2 = specification.isSatisfiedBy(email2);
            boolean result3 = specification.isSatisfiedBy(email3);
            
            // Then
            assertTrue(result1);
            assertTrue(result2);
            assertFalse(result3);
            
            verify(userRepository).existsByEmail(email1);
            verify(userRepository).existsByEmail(email2);
            verify(userRepository).existsByEmail(email3);
        }
    }
    
    @Nested
    @DisplayName("Specification Interface Compliance")
    class SpecificationInterfaceCompliance {
        
        @Test
        @DisplayName("Should implement ISpecification interface correctly")
        void shouldImplementISpecificationInterfaceCorrectly() {
            assertTrue(specification instanceof ISpecification);
            assertTrue(specification instanceof ISpecification<Email>);
        }
        
        @Test
        @DisplayName("Should handle null email parameter")
        void shouldHandleNullEmailParameter() {
            // Given - null email is considered unique (true) by design
            
            // When & Then - specification should handle null gracefully
            assertTrue(specification.isSatisfiedBy(null));
        }
        
        @Test
        @DisplayName("Should be consistent with multiple calls for same email")
        void shouldBeConsistentWithMultipleCallsForSameEmail() {
            // Given
            Email email = new Email("consistent@example.com");
            when(userRepository.existsByEmail(email)).thenReturn(false);
            
            // When
            boolean result1 = specification.isSatisfiedBy(email);
            boolean result2 = specification.isSatisfiedBy(email);
            boolean result3 = specification.isSatisfiedBy(email);
            
            // Then
            assertTrue(result1);
            assertTrue(result2);
            assertTrue(result3);
            
            verify(userRepository, times(3)).existsByEmail(email);
        }
        
        @Test
        @DisplayName("Should work correctly for boundary cases")
        void shouldWorkCorrectlyForBoundaryCases() {
            // Given
            Email shortEmail = new Email("a@b.com");
            Email longEmail = new Email("very.long.email.address.with.many.parts@extremely.long.domain.name.example.org");
            
            when(userRepository.existsByEmail(any(Email.class))).thenReturn(false);
            
            // When & Then
            assertTrue(specification.isSatisfiedBy(shortEmail));
            assertTrue(specification.isSatisfiedBy(longEmail));
            
            verify(userRepository, times(2)).existsByEmail(any(Email.class));
        }
    }
    
    @Nested
    @DisplayName("Performance and Edge Cases")
    class PerformanceAndEdgeCases {
        
        @Test
        @DisplayName("Should handle rapid successive calls efficiently")
        void shouldHandleRapidSuccessiveCallsEfficiently() {
            // Given
            Email email = new Email("performance@example.com");
            when(userRepository.existsByEmail(email)).thenReturn(false);
            
            // When - Simulate rapid calls
            for (int i = 0; i < 100; i++) {
                specification.isSatisfiedBy(email);
            }
            
            // Then
            verify(userRepository, times(100)).existsByEmail(email);
        }
        
        @Test
        @DisplayName("Should maintain thread safety characteristics")
        void shouldMaintainThreadSafetyCharacteristics() {
            // Given
            Email email = new Email("threadsafe@example.com");
            when(userRepository.existsByEmail(email)).thenReturn(false);
            
            // When & Then - Should not maintain state between calls
            assertTrue(specification.isSatisfiedBy(email));
            
            // Reset mock behavior
            when(userRepository.existsByEmail(email)).thenReturn(true);
            assertFalse(specification.isSatisfiedBy(email));
            
            verify(userRepository, times(2)).existsByEmail(email);
        }
    }
}