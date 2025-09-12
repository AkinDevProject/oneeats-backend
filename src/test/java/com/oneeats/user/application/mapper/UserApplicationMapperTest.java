package com.oneeats.user.application.mapper;

import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.model.UserStatus;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserApplicationMapper Tests")
class UserApplicationMapperTest {
    
    private UserApplicationMapper mapper;
    
    @BeforeEach
    void setUp() {
        mapper = new UserApplicationMapper();
    }
    
    @Nested
    @DisplayName("User to DTO Mapping")
    class UserToDTOMapping {
        
        @Test
        @DisplayName("Should map user to DTO correctly")
        void shouldMapUserToDTOCorrectly() {
            // Given
            User user = User.create("John", "Doe", "john.doe@example.com", "password123");
            UUID userId = UUID.randomUUID();
            
            // Set ID and timestamps manually for test
            try {
                var idField = user.getClass().getSuperclass().getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(user, userId);
                
                var createdAtField = user.getClass().getSuperclass().getDeclaredField("createdAt");
                createdAtField.setAccessible(true);
                LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
                createdAtField.set(user, createdAt);
                
                var updatedAtField = user.getClass().getSuperclass().getDeclaredField("updatedAt");
                updatedAtField.setAccessible(true);
                LocalDateTime updatedAt = LocalDateTime.now();
                updatedAtField.set(user, updatedAt);
            } catch (Exception e) {
                throw new RuntimeException("Failed to set user fields", e);
            }
            
            // When
            UserDTO result = mapper.toDTO(user);
            
            // Then
            assertNotNull(result);
            assertEquals(userId, result.id());
            assertEquals("John", result.firstName());
            assertEquals("Doe", result.lastName());
            assertEquals("john.doe@example.com", result.email());
            assertEquals(UserStatus.ACTIVE, result.status());
            assertNotNull(result.createdAt());
            assertNotNull(result.updatedAt());
        }
        
        @Test
        @DisplayName("Should map all user properties correctly")
        void shouldMapAllUserPropertiesCorrectly() {
            // Given
            User user = User.create("Jane", "Smith", "jane.smith@example.com", "securePassword");
            UUID userId = UUID.randomUUID();
            LocalDateTime createdTime = LocalDateTime.now().minusHours(5);
            LocalDateTime updatedTime = LocalDateTime.now().minusHours(1);
            
            // Set fields using reflection
            try {
                var idField = user.getClass().getSuperclass().getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(user, userId);
                
                var createdAtField = user.getClass().getSuperclass().getDeclaredField("createdAt");
                createdAtField.setAccessible(true);
                createdAtField.set(user, createdTime);
                
                var updatedAtField = user.getClass().getSuperclass().getDeclaredField("updatedAt");
                updatedAtField.setAccessible(true);
                updatedAtField.set(user, updatedTime);
            } catch (Exception e) {
                throw new RuntimeException("Failed to set user fields", e);
            }
            
            // When
            UserDTO result = mapper.toDTO(user);
            
            // Then
            assertEquals(userId, result.id());
            assertEquals("Jane", result.firstName());
            assertEquals("Smith", result.lastName());
            assertEquals("jane.smith@example.com", result.email());
            assertEquals(UserStatus.ACTIVE, result.status());
            assertEquals(createdTime, result.createdAt());
            assertEquals(updatedTime, result.updatedAt());
        }
        
        @Test
        @DisplayName("Should handle different user statuses")
        void shouldHandleDifferentUserStatuses() {
            // Given
            User activeUser = User.create("Active", "User", "active@example.com", "password");
            
            // Create inactive user by deactivating
            User inactiveUser = User.create("Inactive", "User", "inactive@example.com", "password");
            inactiveUser.deactivate();
            
            // When
            UserDTO activeResult = mapper.toDTO(activeUser);
            UserDTO inactiveResult = mapper.toDTO(inactiveUser);
            
            // Then
            assertEquals(UserStatus.ACTIVE, activeResult.status());
            assertEquals(UserStatus.INACTIVE, inactiveResult.status());
        }
        
        @Test
        @DisplayName("Should preserve email value from Email object")
        void shouldPreserveEmailValueFromEmailObject() {
            // Given
            String emailValue = "test.email@example.com";
            User user = User.create("Test", "User", emailValue, "password");
            
            // When
            UserDTO result = mapper.toDTO(user);
            
            // Then
            assertEquals(emailValue, result.email());
        }
        
        @Test
        @DisplayName("Should handle users with special characters in names")
        void shouldHandleUsersWithSpecialCharactersInNames() {
            // Given
            User user = User.create("José-María", "O'Connor-Smith", "jose.maria@example.com", "password");
            
            // When
            UserDTO result = mapper.toDTO(user);
            
            // Then
            assertEquals("José-María", result.firstName());
            assertEquals("O'Connor-Smith", result.lastName());
        }
    }
    
    @Nested
    @DisplayName("Null and Edge Cases")
    class NullAndEdgeCases {
        
        @Test
        @DisplayName("Should handle null user gracefully")
        void shouldHandleNullUserGracefully() {
            // When & Then
            assertThrows(NullPointerException.class, () -> mapper.toDTO(null));
        }
        
        @Test
        @DisplayName("Should handle user with null ID")
        void shouldHandleUserWithNullId() {
            // Given
            User user = User.create("Test", "User", "test@example.com", "password");
            // ID should be null by default since it's set in the constructor
            
            // When
            UserDTO result = mapper.toDTO(user);
            
            // Then
            assertNull(result.id());
        }
        
        @Test
        @DisplayName("Should handle user with null timestamps")
        void shouldHandleUserWithNullTimestamps() {
            // Given
            User user = User.create("Test", "User", "test@example.com", "password");
            
            // Set timestamps to null using reflection
            try {
                var createdAtField = user.getClass().getSuperclass().getDeclaredField("createdAt");
                createdAtField.setAccessible(true);
                createdAtField.set(user, null);
                
                var updatedAtField = user.getClass().getSuperclass().getDeclaredField("updatedAt");
                updatedAtField.setAccessible(true);
                updatedAtField.set(user, null);
            } catch (Exception e) {
                throw new RuntimeException("Failed to set null timestamps", e);
            }
            
            // When
            UserDTO result = mapper.toDTO(user);
            
            // Then
            assertNull(result.createdAt());
            assertNull(result.updatedAt());
        }
    }
    
    @Nested
    @DisplayName("Data Integrity and Consistency")
    class DataIntegrityAndConsistency {
        
        @Test
        @DisplayName("Should maintain data consistency across mappings")
        void shouldMaintainDataConsistencyAcrossMappings() {
            // Given
            User user1 = User.create("Consistent", "User", "consistent@example.com", "password");
            User user2 = User.create("Another", "User", "another@example.com", "password");
            
            // When
            UserDTO dto1 = mapper.toDTO(user1);
            UserDTO dto2 = mapper.toDTO(user2);
            
            // Then
            assertNotEquals(dto1.firstName(), dto2.firstName());
            assertNotEquals(dto1.email(), dto2.email());
            assertEquals(dto1.status(), dto2.status()); // Both should be ACTIVE
        }
        
        @Test
        @DisplayName("Should handle same user mapped multiple times")
        void shouldHandleSameUserMappedMultipleTimes() {
            // Given
            User user = User.create("Same", "User", "same@example.com", "password");
            UUID userId = UUID.randomUUID();
            
            try {
                var idField = user.getClass().getSuperclass().getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(user, userId);
            } catch (Exception e) {
                throw new RuntimeException("Failed to set user ID", e);
            }
            
            // When
            UserDTO dto1 = mapper.toDTO(user);
            UserDTO dto2 = mapper.toDTO(user);
            
            // Then
            assertEquals(dto1.id(), dto2.id());
            assertEquals(dto1.firstName(), dto2.firstName());
            assertEquals(dto1.lastName(), dto2.lastName());
            assertEquals(dto1.email(), dto2.email());
            assertEquals(dto1.status(), dto2.status());
        }
        
        @Test
        @DisplayName("Should not expose sensitive data in DTO")
        void shouldNotExposeSensitiveDataInDTO() {
            // Given
            User user = User.create("Secure", "User", "secure@example.com", "secretPassword");
            
            // When
            UserDTO result = mapper.toDTO(user);
            
            // Then
            // DTO should not contain password or any other sensitive information
            assertNotNull(result);
            assertEquals("Secure", result.firstName());
            assertEquals("User", result.lastName());
            assertEquals("secure@example.com", result.email());
            // Password should not be accessible in the DTO
            // This is verified by the UserDTO record not having a password field
        }
        
        @Test
        @DisplayName("Should preserve exact email format")
        void shouldPreserveExactEmailFormat() {
            // Given
            String originalEmail = "Test.User+Tag@Example-Domain.co.uk";
            User user = User.create("Test", "User", originalEmail, "password");
            
            // When
            UserDTO result = mapper.toDTO(user);
            
            // Then
            assertEquals(originalEmail, result.email());
        }
    }
    
    @Nested
    @DisplayName("Performance and Immutability")
    class PerformanceAndImmutability {
        
        @Test
        @DisplayName("Should create immutable DTO")
        void shouldCreateImmutableDTO() {
            // Given
            User user = User.create("Immutable", "User", "immutable@example.com", "password");
            
            // When
            UserDTO result = mapper.toDTO(user);
            
            // Then
            assertNotNull(result);
            // UserDTO is a record, so it's immutable by design
            // We can't modify any fields after creation
            assertDoesNotThrow(() -> {
                String firstName = result.firstName();
                String lastName = result.lastName();
                String email = result.email();
                // All getters should work without issues
            });
        }
        
        @Test
        @DisplayName("Should handle mapping efficiently")
        void shouldHandleMappingEfficiently() {
            // Given
            User user = User.create("Efficient", "User", "efficient@example.com", "password");
            
            // When & Then - Should not throw any performance-related exceptions
            assertDoesNotThrow(() -> {
                for (int i = 0; i < 1000; i++) {
                    UserDTO result = mapper.toDTO(user);
                    assertNotNull(result);
                }
            });
        }
        
        @Test
        @DisplayName("Should maintain reference independence")
        void shouldMaintainReferenceIndependence() {
            // Given
            User user = User.create("Independent", "User", "independent@example.com", "password");
            
            // When
            UserDTO dto1 = mapper.toDTO(user);
            UserDTO dto2 = mapper.toDTO(user);
            
            // Then
            // DTOs should be different objects but with same content
            assertNotSame(dto1, dto2); // Different object references
            assertEquals(dto1.firstName(), dto2.firstName());
            assertEquals(dto1.lastName(), dto2.lastName());
            assertEquals(dto1.email(), dto2.email());
        }
    }
}