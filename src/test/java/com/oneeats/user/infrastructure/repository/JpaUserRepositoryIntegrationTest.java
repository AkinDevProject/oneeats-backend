package com.oneeats.user.infrastructure.repository;

import com.oneeats.shared.domain.vo.Email;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.infrastructure.entity.UserEntity;
import com.oneeats.user.infrastructure.mapper.UserInfrastructureMapper;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("JpaUserRepository Integration Tests")
class JpaUserRepositoryIntegrationTest {
    
    @Inject
    JpaUserRepository repository;
    
    @Inject
    UserInfrastructureMapper mapper;
    
    @BeforeEach
    @Transactional
    void setUp() {
        // Clean up any existing test data
        UserEntity.deleteAll();
    }
    
    @Nested
    @DisplayName("Find Operations")
    class FindOperations {
        
        @Test
        @Transactional
        @DisplayName("Should find user by ID when exists")
        void shouldFindUserByIdWhenExists() {
            // Given
            UUID userId = UUID.randomUUID();
            UserEntity testEntity = new UserEntity(
                userId,
                "John",
                "Doe",
                "john.doe@example.com",
                "hashedPassword",
                UserStatus.ACTIVE,
                null, null, true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            testEntity.persist();
            
            // When
            Optional<User> result = repository.findById(userId);
            
            // Then
            assertTrue(result.isPresent());
            User user = result.get();
            assertEquals(userId, user.getId());
            assertEquals("John", user.getFirstName());
            assertEquals("Doe", user.getLastName());
            assertEquals("john.doe@example.com", user.getEmail().getValue());
            assertEquals(UserStatus.ACTIVE, user.getStatus());
        }
        
        @Test
        @Transactional
        @DisplayName("Should return empty when user not found by ID")
        void shouldReturnEmptyWhenUserNotFoundById() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            
            // When
            Optional<User> result = repository.findById(nonExistentId);
            
            // Then
            assertTrue(result.isEmpty());
        }
        
        @Test
        @Transactional
        @DisplayName("Should find user by email when exists")
        void shouldFindUserByEmailWhenExists() {
            // Given
            String emailValue = "find.by.email@example.com";
            Email email = new Email(emailValue);
            
            UserEntity testEntity = new UserEntity(
                UUID.randomUUID(),
                "Jane",
                "Smith",
                emailValue,
                "hashedPassword",
                UserStatus.ACTIVE,
                null, null, true,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            testEntity.persist();
            
            // When
            Optional<User> result = repository.findByEmail(email);
            
            // Then
            assertTrue(result.isPresent());
            User user = result.get();
            assertEquals("Jane", user.getFirstName());
            assertEquals("Smith", user.getLastName());
            assertEquals(emailValue, user.getEmail().getValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should return empty when user not found by email")
        void shouldReturnEmptyWhenUserNotFoundByEmail() {
            // Given
            Email nonExistentEmail = new Email("nonexistent@example.com");
            
            // When
            Optional<User> result = repository.findByEmail(nonExistentEmail);
            
            // Then
            assertTrue(result.isEmpty());
        }
        
        @Test
        @Transactional
        @DisplayName("Should find all users")
        void shouldFindAllUsers() {
            // Given
            UserEntity user1 = new UserEntity(
                UUID.randomUUID(), "User1", "Lastname1", "user1@example.com",
                "hash1", UserStatus.ACTIVE, null, null, true,
                LocalDateTime.now(), LocalDateTime.now()
            );
            
            UserEntity user2 = new UserEntity(
                UUID.randomUUID(), "User2", "Lastname2", "user2@example.com",
                "hash2", UserStatus.INACTIVE, null, null, true,
                LocalDateTime.now(), LocalDateTime.now()
            );
            
            user1.persist();
            user2.persist();
            
            // When
            List<User> result = repository.findAll();
            
            // Then
            assertEquals(2, result.size());
            assertTrue(result.stream().anyMatch(u -> u.getFirstName().equals("User1")));
            assertTrue(result.stream().anyMatch(u -> u.getFirstName().equals("User2")));
            assertTrue(result.stream().anyMatch(u -> u.getStatus() == UserStatus.ACTIVE));
            assertTrue(result.stream().anyMatch(u -> u.getStatus() == UserStatus.INACTIVE));
        }
        
        @Test
        @Transactional
        @DisplayName("Should return empty list when no users exist")
        void shouldReturnEmptyListWhenNoUsersExist() {
            // When
            List<User> result = repository.findAll();
            
            // Then
            assertTrue(result.isEmpty());
        }
    }
    
    @Nested
    @DisplayName("Save Operations")
    class SaveOperations {
        
        @Test
        @Transactional
        @DisplayName("Should save new user successfully")
        void shouldSaveNewUserSuccessfully() {
            // Given
            User newUser = User.create("New", "User", "new.user@example.com", "password123");
            
            // When
            User savedUser = repository.save(newUser);
            
            // Then
            assertNotNull(savedUser);
            assertNotNull(savedUser.getId());
            assertEquals("New", savedUser.getFirstName());
            assertEquals("User", savedUser.getLastName());
            assertEquals("new.user@example.com", savedUser.getEmail().getValue());
            assertEquals(UserStatus.ACTIVE, savedUser.getStatus());
            
            // Verify it was actually persisted
            Optional<User> foundUser = repository.findById(savedUser.getId());
            assertTrue(foundUser.isPresent());
            assertEquals(savedUser.getId(), foundUser.get().getId());
        }
        
        @Test
        @Transactional
        @DisplayName("Should update existing user successfully")
        void shouldUpdateExistingUserSuccessfully() {
            // Given
            User originalUser = User.create("Original", "User", "original@example.com", "password");
            User savedUser = repository.save(originalUser);
            
            // Modify the user
            savedUser.updateProfile("Updated", "Name");
            
            // When
            User updatedUser = repository.save(savedUser);
            
            // Then
            assertEquals(savedUser.getId(), updatedUser.getId());
            assertEquals("Updated", updatedUser.getFirstName());
            assertEquals("Name", updatedUser.getLastName());
            
            // Verify in database
            Optional<User> foundUser = repository.findById(updatedUser.getId());
            assertTrue(foundUser.isPresent());
            assertEquals("Updated", foundUser.get().getFirstName());
            assertEquals("Name", foundUser.get().getLastName());
        }
        
        @Test
        @Transactional
        @DisplayName("Should handle user with all properties")
        void shouldHandleUserWithAllProperties() {
            // Given
            User user = User.create("Complete", "User", "complete@example.com", "password");
            
            // When
            User savedUser = repository.save(user);
            
            // Then
            assertNotNull(savedUser.getId());
            assertNotNull(savedUser.getCreatedAt());
            assertNotNull(savedUser.getUpdatedAt());
            assertNotNull(savedUser.getHashedPassword());
            assertNotEquals("password", savedUser.getHashedPassword()); // Should be hashed
        }
    }
    
    @Nested
    @DisplayName("Delete Operations")
    class DeleteOperations {
        
        @Test
        @Transactional
        @DisplayName("Should delete user by ID successfully")
        void shouldDeleteUserByIdSuccessfully() {
            // Given
            User user = User.create("ToDelete", "User", "delete@example.com", "password");
            User savedUser = repository.save(user);
            UUID userId = savedUser.getId();
            
            // Verify user exists before deletion
            assertTrue(repository.findById(userId).isPresent());
            
            // When
            repository.deleteById(userId);
            
            // Then
            assertTrue(repository.findById(userId).isEmpty());
        }
        
        @Test
        @Transactional
        @DisplayName("Should delete user entity successfully")
        void shouldDeleteUserEntitySuccessfully() {
            // Given
            User user = User.create("ToDelete", "Entity", "delete.entity@example.com", "password");
            User savedUser = repository.save(user);
            UUID userId = savedUser.getId();
            
            // When
            repository.delete(savedUser);
            
            // Then
            assertTrue(repository.findById(userId).isEmpty());
        }
        
        @Test
        @Transactional
        @DisplayName("Should handle delete of non-existent user gracefully")
        void shouldHandleDeleteOfNonExistentUserGracefully() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            
            // When & Then - Should not throw exception
            assertDoesNotThrow(() -> repository.deleteById(nonExistentId));
        }
    }
    
    @Nested
    @DisplayName("Existence Checks")
    class ExistenceChecks {
        
        @Test
        @Transactional
        @DisplayName("Should return true when user exists by email")
        void shouldReturnTrueWhenUserExistsByEmail() {
            // Given
            String emailValue = "exists@example.com";
            Email email = new Email(emailValue);
            
            UserEntity testEntity = new UserEntity(
                UUID.randomUUID(), "Exists", "User", emailValue,
                "hash", UserStatus.ACTIVE, null, null, true,
                LocalDateTime.now(), LocalDateTime.now()
            );
            testEntity.persist();
            
            // When
            boolean exists = repository.existsByEmail(email);
            
            // Then
            assertTrue(exists);
        }
        
        @Test
        @Transactional
        @DisplayName("Should return false when user does not exist by email")
        void shouldReturnFalseWhenUserDoesNotExistByEmail() {
            // Given
            Email nonExistentEmail = new Email("nonexistent@example.com");
            
            // When
            boolean exists = repository.existsByEmail(nonExistentEmail);
            
            // Then
            assertFalse(exists);
        }
        
        @Test
        @Transactional
        @DisplayName("Should handle case-sensitive email check")
        void shouldHandleCaseSensitiveEmailCheck() {
            // Given
            String emailValue = "Case.Sensitive@Example.Com";
            Email email = new Email(emailValue);
            
            UserEntity testEntity = new UserEntity(
                UUID.randomUUID(), "Case", "Sensitive", emailValue,
                "hash", UserStatus.ACTIVE, null, null, true,
                LocalDateTime.now(), LocalDateTime.now()
            );
            testEntity.persist();
            
            // When
            boolean existsExact = repository.existsByEmail(email);
            boolean existsLowerCase = repository.existsByEmail(new Email("case.sensitive@example.com"));
            
            // Then
            assertTrue(existsExact);
            assertFalse(existsLowerCase); // Should be case-sensitive
        }
    }
    
    @Nested
    @DisplayName("Data Mapping and Consistency")
    class DataMappingAndConsistency {
        
        @Test
        @Transactional
        @DisplayName("Should maintain data consistency between domain and entity")
        void shouldMaintainDataConsistencyBetweenDomainAndEntity() {
            // Given
            User originalUser = User.create("Consistent", "User", "consistent@example.com", "password");
            
            // When
            User savedUser = repository.save(originalUser);
            Optional<User> retrievedUser = repository.findById(savedUser.getId());
            
            // Then
            assertTrue(retrievedUser.isPresent());
            User retrieved = retrievedUser.get();
            assertEquals(savedUser.getFirstName(), retrieved.getFirstName());
            assertEquals(savedUser.getLastName(), retrieved.getLastName());
            assertEquals(savedUser.getEmail().getValue(), retrieved.getEmail().getValue());
            assertEquals(savedUser.getStatus(), retrieved.getStatus());
            assertEquals(savedUser.getHashedPassword(), retrieved.getHashedPassword());
        }
        
        @Test
        @Transactional
        @DisplayName("Should handle special characters in user data")
        void shouldHandleSpecialCharactersInUserData() {
            // Given
            User specialUser = User.create("José-María", "O'Connor", "josé.maría@example.com", "password");
            
            // When
            User savedUser = repository.save(specialUser);
            Optional<User> retrievedUser = repository.findById(savedUser.getId());
            
            // Then
            assertTrue(retrievedUser.isPresent());
            User retrieved = retrievedUser.get();
            assertEquals("José-María", retrieved.getFirstName());
            assertEquals("O'Connor", retrieved.getLastName());
            assertEquals("josé.maría@example.com", retrieved.getEmail().getValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should preserve timestamps correctly")
        void shouldPreserveTimestampsCorrectly() {
            // Given
            User user = User.create("Timestamp", "User", "timestamp@example.com", "password");
            LocalDateTime beforeSave = LocalDateTime.now();
            
            // When
            User savedUser = repository.save(user);
            
            // Then
            assertNotNull(savedUser.getCreatedAt());
            assertNotNull(savedUser.getUpdatedAt());
            assertTrue(savedUser.getCreatedAt().isAfter(beforeSave.minusSeconds(1)));
            assertTrue(savedUser.getUpdatedAt().isAfter(beforeSave.minusSeconds(1)));
        }
    }
    
    @Nested
    @DisplayName("Performance and Concurrency")
    class PerformanceAndConcurrency {
        
        @Test
        @Transactional
        @DisplayName("Should handle multiple users efficiently")
        void shouldHandleMultipleUsersEfficiently() {
            // Given & When
            for (int i = 0; i < 50; i++) {
                User user = User.create("User" + i, "Lastname" + i, "user" + i + "@example.com", "password");
                repository.save(user);
            }
            
            // Then
            List<User> allUsers = repository.findAll();
            assertEquals(50, allUsers.size());
            
            // Verify each user is unique
            long uniqueEmails = allUsers.stream()
                .map(u -> u.getEmail().getValue())
                .distinct()
                .count();
            assertEquals(50, uniqueEmails);
        }
        
        @Test
        @Transactional
        @DisplayName("Should handle rapid save operations")
        void shouldHandleRapidSaveOperations() {
            // Given
            User user = User.create("Rapid", "User", "rapid@example.com", "password");
            
            // When - Save multiple times rapidly
            User savedUser = repository.save(user);
            savedUser.updateProfile("Updated1", "Name1");
            User updated1 = repository.save(savedUser);
            updated1.updateProfile("Updated2", "Name2");
            User updated2 = repository.save(updated1);
            
            // Then
            assertEquals("Updated2", updated2.getFirstName());
            assertEquals("Name2", updated2.getLastName());
            
            // Verify final state in database
            Optional<User> finalUser = repository.findById(updated2.getId());
            assertTrue(finalUser.isPresent());
            assertEquals("Updated2", finalUser.get().getFirstName());
            assertEquals("Name2", finalUser.get().getLastName());
        }
    }
}