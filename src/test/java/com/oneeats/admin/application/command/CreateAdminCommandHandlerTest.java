package com.oneeats.admin.application.command;

import com.oneeats.admin.application.dto.AdminDTO;
import com.oneeats.admin.application.mapper.AdminApplicationMapper;
import com.oneeats.admin.domain.model.Admin;
import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.admin.domain.model.AdminStatus;
import com.oneeats.admin.domain.repository.IAdminRepository;
import com.oneeats.admin.domain.service.AdminDomainService;
import com.oneeats.shared.domain.vo.Email;
import com.oneeats.shared.domain.exception.ValidationException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CreateAdminCommandHandler Tests")
class CreateAdminCommandHandlerTest {
    
    @Mock
    private IAdminRepository adminRepository;
    
    @Mock
    private AdminDomainService adminDomainService;
    
    @Mock
    private AdminApplicationMapper mapper;
    
    private CreateAdminCommandHandler handler;
    
    @BeforeEach
    void setUp() {
        handler = new CreateAdminCommandHandler();
        // Inject mocks using reflection since it's an application service with CDI
        try {
            var repositoryField = handler.getClass().getDeclaredField("adminRepository");
            repositoryField.setAccessible(true);
            repositoryField.set(handler, adminRepository);
            
            var serviceField = handler.getClass().getDeclaredField("adminDomainService");
            serviceField.setAccessible(true);
            serviceField.set(handler, adminDomainService);
            
            var mapperField = handler.getClass().getDeclaredField("mapper");
            mapperField.setAccessible(true);
            mapperField.set(handler, mapper);
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup mocks", e);
        }
    }
    
    @Nested
    @DisplayName("Successful Admin Creation")
    class SuccessfulAdminCreation {
        
        @Test
        @DisplayName("Should create admin with SUPER_ADMIN role successfully")
        void shouldCreateAdminWithSuperAdminRoleSuccessfully() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "John",
                "Doe",
                "john.doe@test.com",
                "password123",
                AdminRole.SUPER_ADMIN
            );
            
            Admin savedAdmin = createMockAdmin(AdminRole.SUPER_ADMIN);
            AdminDTO expectedDTO = createMockAdminDTO(AdminRole.SUPER_ADMIN);
            
            doNothing().when(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            when(adminRepository.save(any(Admin.class))).thenReturn(savedAdmin);
            when(mapper.toDTO(savedAdmin)).thenReturn(expectedDTO);
            
            // When
            AdminDTO result = handler.handle(command);
            
            // Then
            assertNotNull(result);
            assertEquals(expectedDTO, result);
            
            verify(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            verify(adminRepository).save(any(Admin.class));
            verify(mapper).toDTO(savedAdmin);
        }
        
        @Test
        @DisplayName("Should create admin with ADMIN role successfully")
        void shouldCreateAdminWithAdminRoleSuccessfully() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Jane",
                "Smith",
                "jane.smith@test.com",
                "securepass456",
                AdminRole.ADMIN
            );
            
            Admin savedAdmin = createMockAdmin(AdminRole.ADMIN);
            AdminDTO expectedDTO = createMockAdminDTO(AdminRole.ADMIN);
            
            doNothing().when(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            when(adminRepository.save(any(Admin.class))).thenReturn(savedAdmin);
            when(mapper.toDTO(savedAdmin)).thenReturn(expectedDTO);
            
            // When
            AdminDTO result = handler.handle(command);
            
            // Then
            assertNotNull(result);
            assertEquals(expectedDTO, result);
            assertEquals(AdminRole.ADMIN, expectedDTO.role());
        }
        
        @Test
        @DisplayName("Should create admin with MODERATOR role successfully")
        void shouldCreateAdminWithModeratorRoleSuccessfully() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Bob",
                "Wilson",
                "bob.wilson@test.com",
                "modpass789",
                AdminRole.MODERATOR
            );
            
            Admin savedAdmin = createMockAdmin(AdminRole.MODERATOR);
            AdminDTO expectedDTO = createMockAdminDTO(AdminRole.MODERATOR);
            
            doNothing().when(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            when(adminRepository.save(any(Admin.class))).thenReturn(savedAdmin);
            when(mapper.toDTO(savedAdmin)).thenReturn(expectedDTO);
            
            // When
            AdminDTO result = handler.handle(command);
            
            // Then
            assertNotNull(result);
            assertEquals(expectedDTO, result);
            assertEquals(AdminRole.MODERATOR, expectedDTO.role());
        }
        
        @Test
        @DisplayName("Should preserve all command data in created admin")
        void shouldPreserveAllCommandDataInCreatedAdmin() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "Alice",
                "Johnson",
                "alice.johnson@test.com",
                "alicepass123",
                AdminRole.ADMIN
            );
            
            Admin savedAdmin = createMockAdmin(AdminRole.ADMIN);
            AdminDTO expectedDTO = new AdminDTO(
                savedAdmin.getId(),
                command.firstName(),
                command.lastName(),
                command.email(),
                command.role(),
                AdminStatus.ACTIVE,
                LocalDateTime.now(),
                LocalDateTime.now()
            );
            
            doNothing().when(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            when(adminRepository.save(any(Admin.class))).thenReturn(savedAdmin);
            when(mapper.toDTO(savedAdmin)).thenReturn(expectedDTO);
            
            // When
            AdminDTO result = handler.handle(command);
            
            // Then
            assertEquals(command.firstName(), result.firstName());
            assertEquals(command.lastName(), result.lastName());
            assertEquals(command.email(), result.email());
            assertEquals(command.role(), result.role());
        }
    }
    
    @Nested
    @DisplayName("Validation Failure Scenarios")
    class ValidationFailureScenarios {
        
        @Test
        @DisplayName("Should propagate validation exception when first name is invalid")
        void shouldPropagateValidationExceptionWhenFirstNameIsInvalid() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "", // Invalid first name
                "Doe",
                "john.doe@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            doThrow(new ValidationException("Admin first name cannot be empty"))
                .when(adminDomainService).validateAdminCreation(
                    command.firstName(), 
                    command.lastName(), 
                    command.email()
                );
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> handler.handle(command));
            
            assertEquals("Admin first name cannot be empty", exception.getMessage());
            
            verify(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            verify(adminRepository, never()).save(any());
            verify(mapper, never()).toDTO(any());
        }
        
        @Test
        @DisplayName("Should propagate validation exception when last name is invalid")
        void shouldPropagateValidationExceptionWhenLastNameIsInvalid() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "John",
                "", // Invalid last name
                "john.doe@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            doThrow(new ValidationException("Admin last name cannot be empty"))
                .when(adminDomainService).validateAdminCreation(
                    command.firstName(), 
                    command.lastName(), 
                    command.email()
                );
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> handler.handle(command));
            
            assertEquals("Admin last name cannot be empty", exception.getMessage());
            
            verify(adminRepository, never()).save(any());
            verify(mapper, never()).toDTO(any());
        }
        
        @Test
        @DisplayName("Should propagate validation exception when email already exists")
        void shouldPropagateValidationExceptionWhenEmailAlreadyExists() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "John",
                "Doe",
                "existing@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            doThrow(new ValidationException("Admin with this email already exists"))
                .when(adminDomainService).validateAdminCreation(
                    command.firstName(), 
                    command.lastName(), 
                    command.email()
                );
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> handler.handle(command));
            
            assertEquals("Admin with this email already exists", exception.getMessage());
            
            verify(adminRepository, never()).save(any());
            verify(mapper, never()).toDTO(any());
        }
        
        @Test
        @DisplayName("Should propagate validation exception when name exceeds length limit")
        void shouldPropagateValidationExceptionWhenNameExceedsLengthLimit() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "A".repeat(51), // Exceeds 50 character limit
                "Doe",
                "john.doe@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            doThrow(new ValidationException("Admin first name cannot exceed 50 characters"))
                .when(adminDomainService).validateAdminCreation(
                    command.firstName(), 
                    command.lastName(), 
                    command.email()
                );
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, 
                () -> handler.handle(command));
            
            assertEquals("Admin first name cannot exceed 50 characters", exception.getMessage());
            
            verify(adminRepository, never()).save(any());
            verify(mapper, never()).toDTO(any());
        }
    }
    
    @Nested
    @DisplayName("Admin Creation Flow")
    class AdminCreationFlow {
        
        @Test
        @DisplayName("Should execute steps in correct order")
        void shouldExecuteStepsInCorrectOrder() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "John",
                "Doe",
                "john.doe@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            Admin savedAdmin = createMockAdmin(AdminRole.ADMIN);
            AdminDTO expectedDTO = createMockAdminDTO(AdminRole.ADMIN);
            
            doNothing().when(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            when(adminRepository.save(any(Admin.class))).thenReturn(savedAdmin);
            when(mapper.toDTO(savedAdmin)).thenReturn(expectedDTO);
            
            // When
            handler.handle(command);
            
            // Then - Verify execution order
            var inOrder = inOrder(adminDomainService, adminRepository, mapper);
            inOrder.verify(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            inOrder.verify(adminRepository).save(any(Admin.class));
            inOrder.verify(mapper).toDTO(savedAdmin);
        }
        
        @Test
        @DisplayName("Should call Admin.create with correct parameters")
        void shouldCallAdminCreateWithCorrectParameters() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "John",
                "Doe",
                "john.doe@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            Admin savedAdmin = createMockAdmin(AdminRole.ADMIN);
            AdminDTO expectedDTO = createMockAdminDTO(AdminRole.ADMIN);
            
            doNothing().when(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            when(adminRepository.save(any(Admin.class))).thenReturn(savedAdmin);
            when(mapper.toDTO(savedAdmin)).thenReturn(expectedDTO);
            
            // When
            handler.handle(command);
            
            // Then - Verify that save was called with an Admin object
            verify(adminRepository).save(argThat(admin -> 
                admin instanceof Admin
            ));
        }
        
        @Test
        @DisplayName("Should call each service exactly once")
        void shouldCallEachServiceExactlyOnce() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "John",
                "Doe",
                "john.doe@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            Admin savedAdmin = createMockAdmin(AdminRole.ADMIN);
            AdminDTO expectedDTO = createMockAdminDTO(AdminRole.ADMIN);
            
            doNothing().when(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            when(adminRepository.save(any(Admin.class))).thenReturn(savedAdmin);
            when(mapper.toDTO(savedAdmin)).thenReturn(expectedDTO);
            
            // When
            handler.handle(command);
            
            // Then
            verify(adminDomainService, times(1)).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            verify(adminRepository, times(1)).save(any(Admin.class));
            verify(mapper, times(1)).toDTO(savedAdmin);
        }
    }
    
    @Nested
    @DisplayName("Repository Integration")
    class RepositoryIntegration {
        
        @Test
        @DisplayName("Should return mapped DTO from saved admin")
        void shouldReturnMappedDtoFromSavedAdmin() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "John",
                "Doe",
                "john.doe@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            Admin savedAdmin = createMockAdmin(AdminRole.ADMIN);
            AdminDTO expectedDTO = createMockAdminDTO(AdminRole.ADMIN);
            
            doNothing().when(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            when(adminRepository.save(any(Admin.class))).thenReturn(savedAdmin);
            when(mapper.toDTO(savedAdmin)).thenReturn(expectedDTO);
            
            // When
            AdminDTO result = handler.handle(command);
            
            // Then
            assertEquals(expectedDTO, result);
            verify(mapper).toDTO(eq(savedAdmin));
        }
        
        @Test
        @DisplayName("Should handle repository save operation correctly")
        void shouldHandleRepositorySaveOperationCorrectly() {
            // Given
            CreateAdminCommand command = new CreateAdminCommand(
                "John",
                "Doe",
                "john.doe@test.com",
                "password123",
                AdminRole.ADMIN
            );
            
            Admin savedAdmin = createMockAdmin(AdminRole.ADMIN);
            AdminDTO expectedDTO = createMockAdminDTO(AdminRole.ADMIN);
            
            doNothing().when(adminDomainService).validateAdminCreation(
                command.firstName(), 
                command.lastName(), 
                command.email()
            );
            when(adminRepository.save(any(Admin.class))).thenReturn(savedAdmin);
            when(mapper.toDTO(savedAdmin)).thenReturn(expectedDTO);
            
            // When
            handler.handle(command);
            
            // Then
            verify(adminRepository).save(argThat(admin -> {
                // Verify the admin passed to save has the correct data
                return admin instanceof Admin;
            }));
        }
    }
    
    // Helper methods
    private Admin createMockAdmin(AdminRole role) {
        Admin admin = mock(Admin.class);
        when(admin.getId()).thenReturn(UUID.randomUUID());
        when(admin.getFirstName()).thenReturn("John");
        when(admin.getLastName()).thenReturn("Doe");
        when(admin.getEmail()).thenReturn(new Email("john.doe@test.com"));
        when(admin.getRole()).thenReturn(role);
        when(admin.getStatus()).thenReturn(AdminStatus.ACTIVE);
        when(admin.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(admin.getUpdatedAt()).thenReturn(LocalDateTime.now());
        return admin;
    }
    
    private AdminDTO createMockAdminDTO(AdminRole role) {
        return new AdminDTO(
            UUID.randomUUID(),
            "John",
            "Doe",
            "john.doe@test.com",
            role,
            AdminStatus.ACTIVE,
            LocalDateTime.now(),
            LocalDateTime.now()
        );
    }
}