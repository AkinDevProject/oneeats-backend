package com.oneeats.user.application.query;

import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.application.mapper.UserApplicationMapper;
import com.oneeats.user.domain.model.User;
import com.oneeats.user.domain.model.UserStatus;
import com.oneeats.user.domain.repository.IUserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetAllUsersQueryHandler Tests")
class GetAllUsersQueryHandlerTest {
    
    @Mock
    private IUserRepository userRepository;
    
    @Mock
    private UserApplicationMapper mapper;
    
    private GetAllUsersQueryHandler handler;
    
    @BeforeEach
    void setUp() {
        handler = new GetAllUsersQueryHandler();
        // Inject mocks using reflection since it's an application service
        try {
            var repositoryField = handler.getClass().getDeclaredField("userRepository");
            repositoryField.setAccessible(true);
            repositoryField.set(handler, userRepository);
            
            var mapperField = handler.getClass().getDeclaredField("mapper");
            mapperField.setAccessible(true);
            mapperField.set(handler, mapper);
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup mocks", e);
        }
    }
    
    @Nested
    @DisplayName("Successful Users Retrieval")
    class SuccessfulUsersRetrieval {
        
        @Test
        @DisplayName("Should return all users when users exist")
        void shouldReturnAllUsersWhenUsersExist() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            User user1 = User.create("John", "Doe", "john.doe@example.com", "password");
            User user2 = User.create("Jane", "Smith", "jane.smith@example.com", "password");
            List<User> users = Arrays.asList(user1, user2);
            
            UserDTO dto1 = new UserDTO(
                UUID.randomUUID(), "John", "Doe", "john.doe@example.com",
                UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now()
            );
            UserDTO dto2 = new UserDTO(
                UUID.randomUUID(), "Jane", "Smith", "jane.smith@example.com",
                UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now()
            );
            
            when(userRepository.findAll()).thenReturn(users);
            when(mapper.toDTO(user1)).thenReturn(dto1);
            when(mapper.toDTO(user2)).thenReturn(dto2);
            
            // When
            List<UserDTO> result = handler.handle(query);
            
            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            assertTrue(result.contains(dto1));
            assertTrue(result.contains(dto2));
            verify(userRepository).findAll();
            verify(mapper, times(2)).toDTO(any(User.class));
        }
        
        @Test
        @DisplayName("Should return empty list when no users exist")
        void shouldReturnEmptyListWhenNoUsersExist() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            when(userRepository.findAll()).thenReturn(Collections.emptyList());
            
            // When
            List<UserDTO> result = handler.handle(query);
            
            // Then
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(userRepository).findAll();
            verify(mapper, never()).toDTO(any(User.class));
        }
        
        @Test
        @DisplayName("Should call repository findAll exactly once")
        void shouldCallRepositoryFindAllExactlyOnce() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            when(userRepository.findAll()).thenReturn(Collections.emptyList());
            
            // When
            handler.handle(query);
            
            // Then
            verify(userRepository, times(1)).findAll();
        }
        
        @Test
        @DisplayName("Should map each user to DTO")
        void shouldMapEachUserToDTO() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            User user1 = User.create("Alice", "Johnson", "alice@example.com", "password");
            User user2 = User.create("Bob", "Wilson", "bob@example.com", "password");
            User user3 = User.create("Charlie", "Brown", "charlie@example.com", "password");
            List<User> users = Arrays.asList(user1, user2, user3);
            
            UserDTO dto1 = new UserDTO(UUID.randomUUID(), "Alice", "Johnson", "alice@example.com", 
                                     UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
            UserDTO dto2 = new UserDTO(UUID.randomUUID(), "Bob", "Wilson", "bob@example.com", 
                                     UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
            UserDTO dto3 = new UserDTO(UUID.randomUUID(), "Charlie", "Brown", "charlie@example.com", 
                                     UserStatus.INACTIVE, LocalDateTime.now(), LocalDateTime.now());
            
            when(userRepository.findAll()).thenReturn(users);
            when(mapper.toDTO(user1)).thenReturn(dto1);
            when(mapper.toDTO(user2)).thenReturn(dto2);
            when(mapper.toDTO(user3)).thenReturn(dto3);
            
            // When
            List<UserDTO> result = handler.handle(query);
            
            // Then
            assertEquals(3, result.size());
            verify(mapper).toDTO(user1);
            verify(mapper).toDTO(user2);
            verify(mapper).toDTO(user3);
        }
    }
    
    @Nested
    @DisplayName("Data Consistency and Mapping")
    class DataConsistencyAndMapping {
        
        @Test
        @DisplayName("Should preserve order of users from repository")
        void shouldPreserveOrderOfUsersFromRepository() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            User user1 = User.create("First", "User", "first@example.com", "password");
            User user2 = User.create("Second", "User", "second@example.com", "password");
            User user3 = User.create("Third", "User", "third@example.com", "password");
            List<User> orderedUsers = Arrays.asList(user1, user2, user3);
            
            UserDTO dto1 = new UserDTO(UUID.randomUUID(), "First", "User", "first@example.com", 
                                     UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
            UserDTO dto2 = new UserDTO(UUID.randomUUID(), "Second", "User", "second@example.com", 
                                     UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
            UserDTO dto3 = new UserDTO(UUID.randomUUID(), "Third", "User", "third@example.com", 
                                     UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
            
            when(userRepository.findAll()).thenReturn(orderedUsers);
            when(mapper.toDTO(user1)).thenReturn(dto1);
            when(mapper.toDTO(user2)).thenReturn(dto2);
            when(mapper.toDTO(user3)).thenReturn(dto3);
            
            // When
            List<UserDTO> result = handler.handle(query);
            
            // Then
            assertEquals(3, result.size());
            assertEquals(dto1, result.get(0));
            assertEquals(dto2, result.get(1));
            assertEquals(dto3, result.get(2));
        }
        
        @Test
        @DisplayName("Should handle users with different statuses")
        void shouldHandleUsersWithDifferentStatuses() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            User activeUser = User.create("Active", "User", "active@example.com", "password");
            User inactiveUser = User.create("Inactive", "User", "inactive@example.com", "password");
            List<User> users = Arrays.asList(activeUser, inactiveUser);
            
            UserDTO activeDTO = new UserDTO(UUID.randomUUID(), "Active", "User", "active@example.com", 
                                          UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
            UserDTO inactiveDTO = new UserDTO(UUID.randomUUID(), "Inactive", "User", "inactive@example.com", 
                                            UserStatus.INACTIVE, LocalDateTime.now(), LocalDateTime.now());
            
            when(userRepository.findAll()).thenReturn(users);
            when(mapper.toDTO(activeUser)).thenReturn(activeDTO);
            when(mapper.toDTO(inactiveUser)).thenReturn(inactiveDTO);
            
            // When
            List<UserDTO> result = handler.handle(query);
            
            // Then
            assertEquals(2, result.size());
            assertTrue(result.stream().anyMatch(dto -> dto.status() == UserStatus.ACTIVE));
            assertTrue(result.stream().anyMatch(dto -> dto.status() == UserStatus.INACTIVE));
        }
        
        @Test
        @DisplayName("Should handle single user correctly")
        void shouldHandleSingleUserCorrectly() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            User singleUser = User.create("Only", "User", "only@example.com", "password");
            List<User> users = Collections.singletonList(singleUser);
            
            UserDTO singleDTO = new UserDTO(UUID.randomUUID(), "Only", "User", "only@example.com", 
                                          UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
            
            when(userRepository.findAll()).thenReturn(users);
            when(mapper.toDTO(singleUser)).thenReturn(singleDTO);
            
            // When
            List<UserDTO> result = handler.handle(query);
            
            // Then
            assertEquals(1, result.size());
            assertEquals(singleDTO, result.get(0));
            verify(mapper, times(1)).toDTO(singleUser);
        }
    }
    
    @Nested
    @DisplayName("Error Handling and Edge Cases")
    class ErrorHandlingAndEdgeCases {
        
        @Test
        @DisplayName("Should handle repository exceptions")
        void shouldHandleRepositoryExceptions() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            when(userRepository.findAll()).thenThrow(new RuntimeException("Database connection error"));
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> handler.handle(query)
            );
            
            assertEquals("Database connection error", exception.getMessage());
            verify(userRepository).findAll();
            verify(mapper, never()).toDTO(any(User.class));
        }
        
        @Test
        @DisplayName("Should handle mapper exceptions")
        void shouldHandleMapperExceptions() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            User user = User.create("Test", "User", "test@example.com", "password");
            List<User> users = Collections.singletonList(user);
            
            when(userRepository.findAll()).thenReturn(users);
            when(mapper.toDTO(user)).thenThrow(new RuntimeException("Mapping error"));
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> handler.handle(query)
            );
            
            assertEquals("Mapping error", exception.getMessage());
            verify(userRepository).findAll();
            verify(mapper).toDTO(user);
        }
        
        @Test
        @DisplayName("Should handle partial mapping failures gracefully")
        void shouldHandlePartialMappingFailuresGracefully() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            User user1 = User.create("Success", "User", "success@example.com", "password");
            User user2 = User.create("Failure", "User", "failure@example.com", "password");
            List<User> users = Arrays.asList(user1, user2);
            
            UserDTO dto1 = new UserDTO(UUID.randomUUID(), "Success", "User", "success@example.com", 
                                     UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now());
            
            when(userRepository.findAll()).thenReturn(users);
            when(mapper.toDTO(user1)).thenReturn(dto1);
            when(mapper.toDTO(user2)).thenThrow(new RuntimeException("Mapping failed for user2"));
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> handler.handle(query)
            );
            
            assertEquals("Mapping failed for user2", exception.getMessage());
            verify(mapper).toDTO(user1);
            verify(mapper).toDTO(user2);
        }
    }
    
    @Nested
    @DisplayName("Performance and Stream Processing")
    class PerformanceAndStreamProcessing {
        
        @Test
        @DisplayName("Should process large number of users efficiently")
        void shouldProcessLargeNumberOfUsersEfficiently() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            // Create 100 users for performance test
            List<User> users = java.util.stream.IntStream.range(0, 100)
                .mapToObj(i -> User.create("User" + i, "Lastname" + i, "user" + i + "@example.com", "password"))
                .toList();
            
            // Mock mapper for all users
            when(userRepository.findAll()).thenReturn(users);
            when(mapper.toDTO(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                return new UserDTO(UUID.randomUUID(), user.getFirstName(), user.getLastName(), 
                                 user.getEmail().getValue(), UserStatus.ACTIVE, 
                                 LocalDateTime.now(), LocalDateTime.now());
            });
            
            // When
            List<UserDTO> result = handler.handle(query);
            
            // Then
            assertEquals(100, result.size());
            verify(userRepository).findAll();
            verify(mapper, times(100)).toDTO(any(User.class));
        }
        
        @Test
        @DisplayName("Should maintain stream processing efficiency")
        void shouldMaintainStreamProcessingEfficiency() {
            // Given
            GetAllUsersQuery query = new GetAllUsersQuery();
            
            User user1 = User.create("Stream", "User1", "stream1@example.com", "password");
            User user2 = User.create("Stream", "User2", "stream2@example.com", "password");
            List<User> users = Arrays.asList(user1, user2);
            
            when(userRepository.findAll()).thenReturn(users);
            when(mapper.toDTO(any(User.class))).thenReturn(
                new UserDTO(UUID.randomUUID(), "Stream", "User", "stream@example.com", 
                           UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now())
            );
            
            // When
            List<UserDTO> result = handler.handle(query);
            
            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            // Stream should process all elements
            verify(mapper, times(2)).toDTO(any(User.class));
        }
    }
}