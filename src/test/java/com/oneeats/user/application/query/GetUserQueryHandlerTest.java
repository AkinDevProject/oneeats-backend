package com.oneeats.user.application.query;

import com.oneeats.shared.domain.exception.EntityNotFoundException;
import com.oneeats.shared.domain.vo.Email;
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
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetUserQueryHandler Tests")
class GetUserQueryHandlerTest {
    
    @Mock
    private IUserRepository userRepository;
    
    @Mock
    private UserApplicationMapper mapper;
    
    private GetUserQueryHandler handler;
    private UUID userId;
    private User testUser;
    private UserDTO expectedDTO;
    
    @BeforeEach
    void setUp() {
        handler = new GetUserQueryHandler();
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
        
        userId = UUID.randomUUID();
        testUser = User.create("John", "Doe", "john.doe@example.com", "password123");
        // Set ID manually for test
        try {
            var idField = testUser.getClass().getSuperclass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(testUser, userId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set user ID", e);
        }
        
        expectedDTO = new UserDTO(
            userId,
            "John",
            "Doe", 
            "john.doe@example.com",
            UserStatus.ACTIVE,
            LocalDateTime.now(),
            LocalDateTime.now()
        );
    }
    
    @Nested
    @DisplayName("Successful User Retrieval")
    class SuccessfulUserRetrieval {
        
        @Test
        @DisplayName("Should return user when found by ID")
        void shouldReturnUserWhenFoundById() {
            // Given
            GetUserQuery query = new GetUserQuery(userId);
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(mapper.toDTO(testUser)).thenReturn(expectedDTO);
            
            // When
            UserDTO result = handler.handle(query);
            
            // Then
            assertNotNull(result);
            assertEquals(expectedDTO, result);
            verify(userRepository).findById(userId);
            verify(mapper).toDTO(testUser);
        }
        
        @Test
        @DisplayName("Should call repository findById exactly once")
        void shouldCallRepositoryFindByIdExactlyOnce() {
            // Given
            GetUserQuery query = new GetUserQuery(userId);
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(mapper.toDTO(testUser)).thenReturn(expectedDTO);
            
            // When
            handler.handle(query);
            
            // Then
            verify(userRepository, times(1)).findById(userId);
        }
        
        @Test
        @DisplayName("Should call mapper exactly once")
        void shouldCallMapperExactlyOnce() {
            // Given
            GetUserQuery query = new GetUserQuery(userId);
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(mapper.toDTO(testUser)).thenReturn(expectedDTO);
            
            // When
            handler.handle(query);
            
            // Then
            verify(mapper, times(1)).toDTO(testUser);
        }
        
        @Test
        @DisplayName("Should return mapped DTO from repository user")
        void shouldReturnMappedDTOFromRepositoryUser() {
            // Given
            GetUserQuery query = new GetUserQuery(userId);
            
            UserDTO customDTO = new UserDTO(
                userId,
                "Jane",
                "Smith",
                "jane.smith@example.com",
                UserStatus.INACTIVE,
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now()
            );
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(mapper.toDTO(testUser)).thenReturn(customDTO);
            
            // When
            UserDTO result = handler.handle(query);
            
            // Then
            assertEquals(customDTO, result);
            assertEquals("Jane", result.firstName());
            assertEquals("Smith", result.lastName());
            assertEquals("jane.smith@example.com", result.email());
            assertEquals(UserStatus.INACTIVE, result.status());
        }
    }
    
    @Nested
    @DisplayName("User Not Found Scenarios")
    class UserNotFoundScenarios {
        
        @Test
        @DisplayName("Should throw EntityNotFoundException when user not found")
        void shouldThrowEntityNotFoundExceptionWhenUserNotFound() {
            // Given
            GetUserQuery query = new GetUserQuery(userId);
            
            when(userRepository.findById(userId)).thenReturn(Optional.empty());
            
            // When & Then
            EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> handler.handle(query)
            );
            
            assertEquals("User not found with id: " + userId, exception.getMessage());
            verify(userRepository).findById(userId);
            verify(mapper, never()).toDTO(any(User.class));
        }
        
        @Test
        @DisplayName("Should not call mapper when user not found")
        void shouldNotCallMapperWhenUserNotFound() {
            // Given
            GetUserQuery query = new GetUserQuery(userId);
            
            when(userRepository.findById(userId)).thenReturn(Optional.empty());
            
            // When & Then
            assertThrows(EntityNotFoundException.class, () -> handler.handle(query));
            
            verify(mapper, never()).toDTO(any());
        }
        
        @Test
        @DisplayName("Should handle different user IDs for not found case")
        void shouldHandleDifferentUserIdsForNotFoundCase() {
            // Given
            UUID differentUserId = UUID.randomUUID();
            GetUserQuery query = new GetUserQuery(differentUserId);
            
            when(userRepository.findById(differentUserId)).thenReturn(Optional.empty());
            
            // When & Then
            EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> handler.handle(query)
            );
            
            assertTrue(exception.getMessage().contains(differentUserId.toString()));
            verify(userRepository).findById(differentUserId);
        }
    }
    
    @Nested
    @DisplayName("Query Parameter Handling")
    class QueryParameterHandling {
        
        @Test
        @DisplayName("Should handle null user ID gracefully")
        void shouldHandleNullUserIdGracefully() {
            // Given
            GetUserQuery query = new GetUserQuery(null);
            
            when(userRepository.findById(null)).thenReturn(Optional.empty());
            
            // When & Then
            EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> handler.handle(query)
            );
            
            assertTrue(exception.getMessage().contains("null"));
            verify(userRepository).findById(null);
        }
        
        @Test
        @DisplayName("Should pass correct user ID to repository")
        void shouldPassCorrectUserIdToRepository() {
            // Given
            UUID specificUserId = UUID.randomUUID();
            GetUserQuery query = new GetUserQuery(specificUserId);
            
            when(userRepository.findById(specificUserId)).thenReturn(Optional.of(testUser));
            when(mapper.toDTO(testUser)).thenReturn(expectedDTO);
            
            // When
            handler.handle(query);
            
            // Then
            verify(userRepository).findById(eq(specificUserId));
        }
    }
    
    @Nested
    @DisplayName("Integration and Error Handling")
    class IntegrationAndErrorHandling {
        
        @Test
        @DisplayName("Should handle repository exceptions")
        void shouldHandleRepositoryExceptions() {
            // Given
            GetUserQuery query = new GetUserQuery(userId);
            
            when(userRepository.findById(userId)).thenThrow(new RuntimeException("Database connection error"));
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> handler.handle(query)
            );
            
            assertEquals("Database connection error", exception.getMessage());
            verify(userRepository).findById(userId);
            verify(mapper, never()).toDTO(any(User.class));
        }
        
        @Test
        @DisplayName("Should handle mapper exceptions")
        void shouldHandleMapperExceptions() {
            // Given
            GetUserQuery query = new GetUserQuery(userId);
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(mapper.toDTO(testUser)).thenThrow(new RuntimeException("Mapping error"));
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> handler.handle(query)
            );
            
            assertEquals("Mapping error", exception.getMessage());
            verify(userRepository).findById(userId);
            verify(mapper).toDTO(testUser);
        }
        
        @Test
        @DisplayName("Should maintain correct execution order")
        void shouldMaintainCorrectExecutionOrder() {
            // Given
            GetUserQuery query = new GetUserQuery(userId);
            
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(mapper.toDTO(testUser)).thenReturn(expectedDTO);
            
            // When
            handler.handle(query);
            
            // Then - Verify call order
            var inOrder = inOrder(userRepository, mapper);
            inOrder.verify(userRepository).findById(userId);
            inOrder.verify(mapper).toDTO(testUser);
        }
    }
}