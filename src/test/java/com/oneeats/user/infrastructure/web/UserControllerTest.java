package com.oneeats.user.infrastructure.web;

import com.oneeats.shared.domain.exception.EntityNotFoundException;
import com.oneeats.user.application.command.CreateUserCommand;
import com.oneeats.user.application.command.CreateUserCommandHandler;
import com.oneeats.user.application.dto.UserDTO;
import com.oneeats.user.application.query.GetAllUsersQuery;
import com.oneeats.user.application.query.GetAllUsersQueryHandler;
import com.oneeats.user.application.query.GetUserQuery;
import com.oneeats.user.application.query.GetUserQueryHandler;
import com.oneeats.user.domain.model.UserStatus;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController Tests")
class UserControllerTest {
    
    @Mock
    private CreateUserCommandHandler createUserCommandHandler;
    
    @Mock
    private GetUserQueryHandler getUserQueryHandler;
    
    @Mock
    private GetAllUsersQueryHandler getAllUsersQueryHandler;
    
    private UserController controller;
    
    @BeforeEach
    void setUp() {
        controller = new UserController();
        // Inject mocks using reflection since it's a JAX-RS resource
        try {
            var createHandlerField = controller.getClass().getDeclaredField("createUserCommandHandler");
            createHandlerField.setAccessible(true);
            createHandlerField.set(controller, createUserCommandHandler);
            
            var getHandlerField = controller.getClass().getDeclaredField("getUserQueryHandler");
            getHandlerField.setAccessible(true);
            getHandlerField.set(controller, getUserQueryHandler);
            
            var getAllHandlerField = controller.getClass().getDeclaredField("getAllUsersQueryHandler");
            getAllHandlerField.setAccessible(true);
            getAllHandlerField.set(controller, getAllUsersQueryHandler);
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup mocks", e);
        }
    }
    
    @Nested
    @DisplayName("Create User Endpoint")
    class CreateUserEndpoint {
        
        @Test
        @DisplayName("Should create user successfully")
        void shouldCreateUserSuccessfully() {
            // Given
            CreateUserCommand command = new CreateUserCommand(
                "John",
                "Doe",
                "john.doe@example.com",
                "password123"
            );
            
            UUID userId = UUID.randomUUID();
            UserDTO expectedDTO = new UserDTO(
                userId,
                "John",
                "Doe",
                "john.doe@example.com",
                UserStatus.ACTIVE,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            when(createUserCommandHandler.handle(command)).thenReturn(expectedDTO);
            
            // When
            Response response = controller.createUser(command);
            
            // Then
            assertEquals(Response.Status.CREATED.getStatusCode(), response.getStatus());
            assertEquals(expectedDTO, response.getEntity());
            verify(createUserCommandHandler).handle(command);
        }
        
        @Test
        @DisplayName("Should return 201 status code for successful creation")
        void shouldReturn201StatusCodeForSuccessfulCreation() {
            // Given
            CreateUserCommand command = new CreateUserCommand(
                "Jane",
                "Smith",
                "jane.smith@example.com",
                "securePassword"
            );
            
            UserDTO userDTO = new UserDTO(
                UUID.randomUUID(),
                "Jane",
                "Smith",
                "jane.smith@example.com",
                UserStatus.ACTIVE,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            when(createUserCommandHandler.handle(command)).thenReturn(userDTO);
            
            // When
            Response response = controller.createUser(command);
            
            // Then
            assertEquals(201, response.getStatus());
            assertNotNull(response.getEntity());
        }
        
        @Test
        @DisplayName("Should call command handler exactly once")
        void shouldCallCommandHandlerExactlyOnce() {
            // Given
            CreateUserCommand command = new CreateUserCommand(
                "Test",
                "User",
                "test@example.com",
                "testpassword"
            );
            
            when(createUserCommandHandler.handle(command)).thenReturn(
                new UserDTO(UUID.randomUUID(), "Test", "User", "test@example.com",
                           UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now())
            );
            
            // When
            controller.createUser(command);
            
            // Then
            verify(createUserCommandHandler, times(1)).handle(command);
        }
        
        @Test
        @DisplayName("Should handle command handler exceptions")
        void shouldHandleCommandHandlerExceptions() {
            // Given
            CreateUserCommand command = new CreateUserCommand(
                "Error",
                "User",
                "error@example.com",
                "password"
            );
            
            when(createUserCommandHandler.handle(command))
                .thenThrow(new RuntimeException("User creation failed"));
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> controller.createUser(command)
            );
            
            assertEquals("User creation failed", exception.getMessage());
            verify(createUserCommandHandler).handle(command);
        }
    }
    
    @Nested
    @DisplayName("Get User By ID Endpoint")
    class GetUserByIdEndpoint {
        
        @Test
        @DisplayName("Should get user by ID successfully")
        void shouldGetUserByIdSuccessfully() {
            // Given
            UUID userId = UUID.randomUUID();
            UserDTO expectedDTO = new UserDTO(
                userId,
                "John",
                "Doe",
                "john.doe@example.com",
                UserStatus.ACTIVE,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            when(getUserQueryHandler.handle(any(GetUserQuery.class))).thenReturn(expectedDTO);
            
            // When
            Response response = controller.getUserById(userId);
            
            // Then
            assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
            assertEquals(expectedDTO, response.getEntity());
            verify(getUserQueryHandler).handle(argThat(query -> query.id().equals(userId)));
        }
        
        @Test
        @DisplayName("Should return 200 status code for successful retrieval")
        void shouldReturn200StatusCodeForSuccessfulRetrieval() {
            // Given
            UUID userId = UUID.randomUUID();
            UserDTO userDTO = new UserDTO(
                userId,
                "Found",
                "User",
                "found@example.com",
                UserStatus.ACTIVE,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            when(getUserQueryHandler.handle(any(GetUserQuery.class))).thenReturn(userDTO);
            
            // When
            Response response = controller.getUserById(userId);
            
            // Then
            assertEquals(200, response.getStatus());
            assertNotNull(response.getEntity());
        }
        
        @Test
        @DisplayName("Should create correct GetUserQuery with provided ID")
        void shouldCreateCorrectGetUserQueryWithProvidedId() {
            // Given
            UUID specificUserId = UUID.randomUUID();
            UserDTO userDTO = new UserDTO(
                specificUserId,
                "Specific",
                "User",
                "specific@example.com",
                UserStatus.ACTIVE,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            when(getUserQueryHandler.handle(any(GetUserQuery.class))).thenReturn(userDTO);
            
            // When
            controller.getUserById(specificUserId);
            
            // Then
            verify(getUserQueryHandler).handle(argThat(query -> 
                query.id().equals(specificUserId)
            ));
        }
        
        @Test
        @DisplayName("Should handle user not found exception")
        void shouldHandleUserNotFoundException() {
            // Given
            UUID userId = UUID.randomUUID();
            
            when(getUserQueryHandler.handle(any(GetUserQuery.class)))
                .thenThrow(new EntityNotFoundException("User", userId));
            
            // When & Then
            EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> controller.getUserById(userId)
            );
            
            assertTrue(exception.getMessage().contains(userId.toString()));
            verify(getUserQueryHandler).handle(any(GetUserQuery.class));
        }
        
        @Test
        @DisplayName("Should handle query handler exceptions")
        void shouldHandleQueryHandlerExceptions() {
            // Given
            UUID userId = UUID.randomUUID();
            
            when(getUserQueryHandler.handle(any(GetUserQuery.class)))
                .thenThrow(new RuntimeException("Database connection error"));
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> controller.getUserById(userId)
            );
            
            assertEquals("Database connection error", exception.getMessage());
        }
    }
    
    @Nested
    @DisplayName("Get All Users Endpoint")
    class GetAllUsersEndpoint {
        
        @Test
        @DisplayName("Should get all users successfully")
        void shouldGetAllUsersSuccessfully() {
            // Given
            List<UserDTO> expectedUsers = Arrays.asList(
                new UserDTO(UUID.randomUUID(), "John", "Doe", "john@example.com",
                           UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now()),
                new UserDTO(UUID.randomUUID(), "Jane", "Smith", "jane@example.com",
                           UserStatus.INACTIVE, LocalDateTime.now(), LocalDateTime.now())
            );
            
            when(getAllUsersQueryHandler.handle(any(GetAllUsersQuery.class))).thenReturn(expectedUsers);
            
            // When
            Response response = controller.getAllUsers();
            
            // Then
            assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
            assertEquals(expectedUsers, response.getEntity());
            verify(getAllUsersQueryHandler).handle(any(GetAllUsersQuery.class));
        }
        
        @Test
        @DisplayName("Should return empty list when no users exist")
        void shouldReturnEmptyListWhenNoUsersExist() {
            // Given
            List<UserDTO> emptyList = Collections.emptyList();
            
            when(getAllUsersQueryHandler.handle(any(GetAllUsersQuery.class))).thenReturn(emptyList);
            
            // When
            Response response = controller.getAllUsers();
            
            // Then
            assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
            assertEquals(emptyList, response.getEntity());
            assertTrue(((List<?>) response.getEntity()).isEmpty());
        }
        
        @Test
        @DisplayName("Should return 200 status code for successful retrieval")
        void shouldReturn200StatusCodeForSuccessfulRetrieval() {
            // Given
            List<UserDTO> users = Collections.singletonList(
                new UserDTO(UUID.randomUUID(), "Single", "User", "single@example.com",
                           UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now())
            );
            
            when(getAllUsersQueryHandler.handle(any(GetAllUsersQuery.class))).thenReturn(users);
            
            // When
            Response response = controller.getAllUsers();
            
            // Then
            assertEquals(200, response.getStatus());
            assertNotNull(response.getEntity());
        }
        
        @Test
        @DisplayName("Should call query handler exactly once")
        void shouldCallQueryHandlerExactlyOnce() {
            // Given
            when(getAllUsersQueryHandler.handle(any(GetAllUsersQuery.class)))
                .thenReturn(Collections.emptyList());
            
            // When
            controller.getAllUsers();
            
            // Then
            verify(getAllUsersQueryHandler, times(1)).handle(any(GetAllUsersQuery.class));
        }
        
        @Test
        @DisplayName("Should handle query handler exceptions")
        void shouldHandleQueryHandlerExceptions() {
            // Given
            when(getAllUsersQueryHandler.handle(any(GetAllUsersQuery.class)))
                .thenThrow(new RuntimeException("Failed to retrieve users"));
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> controller.getAllUsers()
            );
            
            assertEquals("Failed to retrieve users", exception.getMessage());
            verify(getAllUsersQueryHandler).handle(any(GetAllUsersQuery.class));
        }
        
        @Test
        @DisplayName("Should handle large user lists efficiently")
        void shouldHandleLargeUserListsEfficiently() {
            // Given
            List<UserDTO> largeUserList = java.util.stream.IntStream.range(0, 100)
                .mapToObj(i -> new UserDTO(
                    UUID.randomUUID(),
                    "User" + i,
                    "Lastname" + i,
                    "user" + i + "@example.com",
                    UserStatus.ACTIVE,
                    LocalDateTime.now(),
                    LocalDateTime.now()
                )).toList();
            
            when(getAllUsersQueryHandler.handle(any(GetAllUsersQuery.class))).thenReturn(largeUserList);
            
            // When
            Response response = controller.getAllUsers();
            
            // Then
            assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
            List<?> responseEntity = (List<?>) response.getEntity();
            assertEquals(100, responseEntity.size());
        }
    }
    
    @Nested
    @DisplayName("Integration and Cross-cutting Concerns")
    class IntegrationAndCrossCuttingConcerns {
        
        @Test
        @DisplayName("Should maintain proper HTTP status codes")
        void shouldMaintainProperHttpStatusCodes() {
            // Given
            CreateUserCommand createCommand = new CreateUserCommand(
                "HTTP", "User", "http@example.com", "password"
            );
            UUID userId = UUID.randomUUID();
            UserDTO userDTO = new UserDTO(
                userId, "HTTP", "User", "http@example.com",
                UserStatus.ACTIVE, LocalDateTime.now(), LocalDateTime.now()
            );
            
            when(createUserCommandHandler.handle(createCommand)).thenReturn(userDTO);
            when(getUserQueryHandler.handle(any(GetUserQuery.class))).thenReturn(userDTO);
            when(getAllUsersQueryHandler.handle(any(GetAllUsersQuery.class)))
                .thenReturn(Collections.singletonList(userDTO));
            
            // When & Then
            Response createResponse = controller.createUser(createCommand);
            assertEquals(201, createResponse.getStatus());
            
            Response getResponse = controller.getUserById(userId);
            assertEquals(200, getResponse.getStatus());
            
            Response getAllResponse = controller.getAllUsers();
            assertEquals(200, getAllResponse.getStatus());
        }
        
        @Test
        @DisplayName("Should handle null parameters gracefully")
        void shouldHandleNullParametersGracefully() {
            // When & Then
            assertThrows(Exception.class, () -> controller.createUser(null));
            assertThrows(Exception.class, () -> controller.getUserById(null));
            // getAllUsers has no parameters, so it should work
            assertDoesNotThrow(() -> {
                when(getAllUsersQueryHandler.handle(any(GetAllUsersQuery.class)))
                    .thenReturn(Collections.emptyList());
                controller.getAllUsers();
            });
        }
        
        @Test
        @DisplayName("Should maintain consistent error handling across endpoints")
        void shouldMaintainConsistentErrorHandlingAcrossEndpoints() {
            // Given
            String errorMessage = "Consistent error";
            CreateUserCommand command = new CreateUserCommand("Error", "User", "error@example.com", "password");
            UUID userId = UUID.randomUUID();
            
            when(createUserCommandHandler.handle(command)).thenThrow(new RuntimeException(errorMessage));
            when(getUserQueryHandler.handle(any(GetUserQuery.class))).thenThrow(new RuntimeException(errorMessage));
            when(getAllUsersQueryHandler.handle(any(GetAllUsersQuery.class))).thenThrow(new RuntimeException(errorMessage));
            
            // When & Then
            RuntimeException createException = assertThrows(RuntimeException.class, 
                () -> controller.createUser(command));
            assertEquals(errorMessage, createException.getMessage());
            
            RuntimeException getException = assertThrows(RuntimeException.class, 
                () -> controller.getUserById(userId));
            assertEquals(errorMessage, getException.getMessage());
            
            RuntimeException getAllException = assertThrows(RuntimeException.class, 
                () -> controller.getAllUsers());
            assertEquals(errorMessage, getAllException.getMessage());
        }
    }
}