package com.oneeats.user.infrastructure.mapper;

import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.infrastructure.entity.UserEntity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserInfrastructureMapper Tests")
class UserInfrastructureMapperTest {
    
    private UserInfrastructureMapper mapper;
    
    @BeforeEach
    void setUp() {
        mapper = new UserInfrastructureMapper();
    }
    
    @Nested
    @DisplayName("Entity to Domain Mapping")
    class EntityToDomainMapping {
        
        @Test
        @DisplayName("Should map UserEntity to User domain correctly")
        void shouldMapUserEntityToUserDomainCorrectly() {
            // Given
            UUID userId = UUID.randomUUID();
            LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
            LocalDateTime updatedAt = LocalDateTime.now();
            
            UserEntity entity = new UserEntity(
                userId,
                "John",
                "Doe",
                "john.doe@example.com",
                "hashedPassword123",
                UserStatus.ACTIVE,
                "0123456789",
                "123 Main Street",
                true,
                createdAt,
                updatedAt
            );
            
            // When
            User result = mapper.toDomain(entity);
            
            // Then
            assertNotNull(result);
            assertEquals(userId, result.getId());
            assertEquals("John", result.getFirstName());
            assertEquals("Doe", result.getLastName());
            assertEquals("john.doe@example.com", result.getEmail().getValue());
            assertEquals("hashedPassword123", result.getHashedPassword());
            assertEquals(UserStatus.ACTIVE, result.getStatus());
            assertEquals(createdAt, result.getCreatedAt());
            assertEquals(updatedAt, result.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should handle UserEntity with different status")
        void shouldHandleUserEntityWithDifferentStatus() {
            // Given
            UserEntity activeEntity = new UserEntity(
                UUID.randomUUID(),
                "Active",
                "User",
                "active@example.com",
                "hashedPassword",
                UserStatus.ACTIVE,
                null, null, true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            UserEntity inactiveEntity = new UserEntity(
                UUID.randomUUID(),
                "Inactive",
                "User",
                "inactive@example.com",
                "hashedPassword",
                UserStatus.INACTIVE,
                null, null, false,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            // When
            User activeUser = mapper.toDomain(activeEntity);
            User inactiveUser = mapper.toDomain(inactiveEntity);
            
            // Then
            assertEquals(UserStatus.ACTIVE, activeUser.getStatus());
            assertEquals(UserStatus.INACTIVE, inactiveUser.getStatus());
        }
        
        @Test
        @DisplayName("Should handle UserEntity with null optional fields")
        void shouldHandleUserEntityWithNullOptionalFields() {
            // Given
            UserEntity entity = new UserEntity(
                UUID.randomUUID(),
                "Minimal",
                "User",
                "minimal@example.com",
                "hashedPassword",
                UserStatus.ACTIVE,
                null, // phone is null
                null, // address is null
                true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            // When
            User result = mapper.toDomain(entity);
            
            // Then
            assertNotNull(result);
            assertEquals("Minimal", result.getFirstName());
            assertEquals("User", result.getLastName());
            assertEquals("minimal@example.com", result.getEmail().getValue());
        }
        
        @Test
        @DisplayName("Should create Email value object correctly")
        void shouldCreateEmailValueObjectCorrectly() {
            // Given
            String emailValue = "test.email@example.com";
            UserEntity entity = new UserEntity(
                UUID.randomUUID(),
                "Test",
                "User",
                emailValue,
                "hashedPassword",
                UserStatus.ACTIVE,
                null, null, true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            // When
            User result = mapper.toDomain(entity);
            
            // Then
            assertNotNull(result.getEmail());
            assertEquals(emailValue, result.getEmail().getValue());
        }
    }
    
    @Nested
    @DisplayName("Domain to Entity Mapping")
    class DomainToEntityMapping {
        
        @Test
        @DisplayName("Should map User domain to UserEntity correctly")
        void shouldMapUserDomainToUserEntityCorrectly() {
            // Given
            User user = User.create("Jane", "Smith", "jane.smith@example.com", "password123");
            UUID userId = UUID.randomUUID();
            LocalDateTime createdAt = LocalDateTime.now().minusHours(2);
            LocalDateTime updatedAt = LocalDateTime.now().minusHours(1);
            
            // Set fields using reflection
            try {
                var idField = user.getClass().getSuperclass().getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(user, userId);
                
                var createdAtField = user.getClass().getSuperclass().getDeclaredField("createdAt");
                createdAtField.setAccessible(true);
                createdAtField.set(user, createdAt);
                
                var updatedAtField = user.getClass().getSuperclass().getDeclaredField("updatedAt");
                updatedAtField.setAccessible(true);
                updatedAtField.set(user, updatedAt);
            } catch (Exception e) {
                throw new RuntimeException("Failed to set user fields", e);
            }
            
            // When
            UserEntity result = mapper.toEntity(user);
            
            // Then
            assertNotNull(result);
            assertEquals(userId, result.getId());
            assertEquals("Jane", result.getFirstName());
            assertEquals("Smith", result.getLastName());
            assertEquals("jane.smith@example.com", result.getEmail());
            assertEquals(user.getHashedPassword(), result.getPasswordHash());
            assertEquals(UserStatus.ACTIVE, result.getStatus());
            assertEquals(createdAt, result.getCreatedAt());
            assertEquals(updatedAt, result.getUpdatedAt());
            assertTrue(result.getIsActive());
            assertNull(result.getPhone());
            assertNull(result.getAddress());
        }
        
        @Test
        @DisplayName("Should map user with different statuses")
        void shouldMapUserWithDifferentStatuses() {
            // Given
            User activeUser = User.create("Active", "User", "active@example.com", "password");
            User inactiveUser = User.create("Inactive", "User", "inactive@example.com", "password");
            inactiveUser.deactivate();
            
            // When
            UserEntity activeEntity = mapper.toEntity(activeUser);
            UserEntity inactiveEntity = mapper.toEntity(inactiveUser);
            
            // Then
            assertEquals(UserStatus.ACTIVE, activeEntity.getStatus());
            assertEquals(UserStatus.INACTIVE, inactiveEntity.getStatus());
        }
        
        @Test
        @DisplayName("Should extract email value from Email object")
        void shouldExtractEmailValueFromEmailObject() {
            // Given
            String emailValue = "extract.test@example.com";
            User user = User.create("Extract", "Test", emailValue, "password");
            
            // When
            UserEntity result = mapper.toEntity(user);
            
            // Then
            assertEquals(emailValue, result.getEmail());
        }
        
        @Test
        @DisplayName("Should set default values for optional fields")
        void shouldSetDefaultValuesForOptionalFields() {
            // Given
            User user = User.create("Default", "User", "default@example.com", "password");
            
            // When
            UserEntity result = mapper.toEntity(user);
            
            // Then
            assertTrue(result.getIsActive()); // isActive should be true by default
            assertNull(result.getPhone()); // phone should be null
            assertNull(result.getAddress()); // address should be null
        }
        
        @Test
        @DisplayName("Should preserve hashed password")
        void shouldPreserveHashedPassword() {
            // Given
            User user = User.create("Password", "User", "password@example.com", "plainPassword");
            String hashedPassword = user.getHashedPassword();
            
            // When
            UserEntity result = mapper.toEntity(user);
            
            // Then
            assertEquals(hashedPassword, result.getPasswordHash());
            assertNotEquals("plainPassword", result.getPasswordHash()); // Should be hashed, not plain
        }
    }
    
    @Nested
    @DisplayName("Bidirectional Mapping")
    class BidirectionalMapping {
        
        @Test
        @DisplayName("Should maintain data consistency in round-trip mapping")
        void shouldMaintainDataConsistencyInRoundTripMapping() {
            // Given
            UUID userId = UUID.randomUUID();
            LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
            LocalDateTime updatedAt = LocalDateTime.now();
            
            UserEntity originalEntity = new UserEntity(
                userId,
                "RoundTrip",
                "User",
                "roundtrip@example.com",
                "hashedPassword123",
                UserStatus.ACTIVE,
                "0123456789",
                "123 Test Street",
                true,
                createdAt,
                updatedAt
            );
            
            // When
            User user = mapper.toDomain(originalEntity);
            UserEntity resultEntity = mapper.toEntity(user);
            
            // Then
            assertEquals(originalEntity.getId(), resultEntity.getId());
            assertEquals(originalEntity.getFirstName(), resultEntity.getFirstName());
            assertEquals(originalEntity.getLastName(), resultEntity.getLastName());
            assertEquals(originalEntity.getEmail(), resultEntity.getEmail());
            assertEquals(originalEntity.getPasswordHash(), resultEntity.getPasswordHash());
            assertEquals(originalEntity.getStatus(), resultEntity.getStatus());
            assertEquals(originalEntity.getCreatedAt(), resultEntity.getCreatedAt());
            assertEquals(originalEntity.getUpdatedAt(), resultEntity.getUpdatedAt());
            assertEquals(originalEntity.getIsActive(), resultEntity.getIsActive());
        }
        
        @Test
        @DisplayName("Should handle round-trip with minimal data")
        void shouldHandleRoundTripWithMinimalData() {
            // Given
            UserEntity minimalEntity = new UserEntity(
                UUID.randomUUID(),
                "Min",
                "User",
                "min@example.com",
                "hash",
                UserStatus.ACTIVE,
                null,
                null,
                true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            // When
            User user = mapper.toDomain(minimalEntity);
            UserEntity resultEntity = mapper.toEntity(user);
            
            // Then
            assertEquals(minimalEntity.getFirstName(), resultEntity.getFirstName());
            assertEquals(minimalEntity.getLastName(), resultEntity.getLastName());
            assertEquals(minimalEntity.getEmail(), resultEntity.getEmail());
            assertEquals(minimalEntity.getStatus(), resultEntity.getStatus());
            assertNull(resultEntity.getPhone());
            assertNull(resultEntity.getAddress());
        }
    }
    
    @Nested
    @DisplayName("Error Handling and Edge Cases")
    class ErrorHandlingAndEdgeCases {
        
        @Test
        @DisplayName("Should handle null entity gracefully")
        void shouldHandleNullEntityGracefully() {
            // When & Then
            assertThrows(NullPointerException.class, () -> mapper.toDomain(null));
        }
        
        @Test
        @DisplayName("Should handle null user gracefully")
        void shouldHandleNullUserGracefully() {
            // When & Then
            assertThrows(NullPointerException.class, () -> mapper.toEntity(null));
        }
        
        @Test
        @DisplayName("Should handle entity with null ID")
        void shouldHandleEntityWithNullId() {
            // Given
            UserEntity entity = new UserEntity(
                null, // null ID
                "Null",
                "ID",
                "null@example.com",
                "hashedPassword",
                UserStatus.ACTIVE,
                null, null, true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            // When
            User result = mapper.toDomain(entity);
            
            // Then
            assertNull(result.getId());
        }
        
        @Test
        @DisplayName("Should handle user with null ID")
        void shouldHandleUserWithNullId() {
            // Given
            User user = User.create("Null", "ID", "null@example.com", "password");
            // ID is null by default
            
            // When
            UserEntity result = mapper.toEntity(user);
            
            // Then
            assertNull(result.getId());
        }
        
        @Test
        @DisplayName("Should handle entity with null timestamps")
        void shouldHandleEntityWithNullTimestamps() {
            // Given
            UserEntity entity = new UserEntity(
                UUID.randomUUID(),
                "Null",
                "Timestamps",
                "null.timestamps@example.com",
                "hashedPassword",
                UserStatus.ACTIVE,
                null, null, true,
                null, // null createdAt
                null  // null updatedAt
            );
            
            // When
            User result = mapper.toDomain(entity);
            
            // Then
            assertNull(result.getCreatedAt());
            assertNull(result.getUpdatedAt());
        }
    }
    
    @Nested
    @DisplayName("Special Characters and Data Validation")
    class SpecialCharactersAndDataValidation {
        
        @Test
        @DisplayName("Should handle special characters in names")
        void shouldHandleSpecialCharactersInNames() {
            // Given
            UserEntity entity = new UserEntity(
                UUID.randomUUID(),
                "José-María",
                "O'Connor-Smith",
                "jose.maria@example.com",
                "hashedPassword",
                UserStatus.ACTIVE,
                null, null, true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            // When
            User result = mapper.toDomain(entity);
            
            // Then
            assertEquals("José-María", result.getFirstName());
            assertEquals("O'Connor-Smith", result.getLastName());
        }
        
        @Test
        @DisplayName("Should handle complex email addresses")
        void shouldHandleComplexEmailAddresses() {
            // Given
            String complexEmail = "test.user+tag@sub-domain.example-site.co.uk";
            UserEntity entity = new UserEntity(
                UUID.randomUUID(),
                "Complex",
                "Email",
                complexEmail,
                "hashedPassword",
                UserStatus.ACTIVE,
                null, null, true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            // When
            User result = mapper.toDomain(entity);
            
            // Then
            assertEquals(complexEmail, result.getEmail().getValue());
        }
        
        @Test
        @DisplayName("Should preserve exact data formatting")
        void shouldPreserveExactDataFormatting() {
            // Given
            UserEntity entity = new UserEntity(
                UUID.randomUUID(),
                "  Padded  ",
                "  Names  ",
                "padded@example.com",
                "hashedPassword",
                UserStatus.ACTIVE,
                null, null, true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            // When
            User user = mapper.toDomain(entity);
            UserEntity resultEntity = mapper.toEntity(user);
            
            // Then
            assertEquals("  Padded  ", resultEntity.getFirstName());
            assertEquals("  Names  ", resultEntity.getLastName());
        }
    }
}