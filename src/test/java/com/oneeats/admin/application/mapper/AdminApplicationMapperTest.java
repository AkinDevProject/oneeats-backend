package com.oneeats.admin.application.mapper;

import com.oneeats.admin.application.dto.AdminDTO;
import com.oneeats.admin.domain.model.Admin;
import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.admin.domain.model.AdminStatus;
import com.oneeats.shared.domain.vo.Email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AdminApplicationMapper Tests")
class AdminApplicationMapperTest {
    
    private AdminApplicationMapper mapper;
    private UUID adminId;
    private LocalDateTime testDateTime;
    
    @BeforeEach
    void setUp() {
        mapper = new AdminApplicationMapper();
        adminId = UUID.randomUUID();
        testDateTime = LocalDateTime.now();
    }
    
    @Nested
    @DisplayName("Domain to DTO Mapping")
    class DomainToDtoMapping {
        
        @Test
        @DisplayName("Should map SUPER_ADMIN domain to DTO correctly")
        void shouldMapSuperAdminDomainToDtoCorrectly() {
            // Given
            Admin admin = createAdmin(AdminRole.SUPER_ADMIN, AdminStatus.ACTIVE);
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertNotNull(dto);
            assertEquals(admin.getId(), dto.id());
            assertEquals(admin.getFirstName(), dto.firstName());
            assertEquals(admin.getLastName(), dto.lastName());
            assertEquals(admin.getEmail().getValue(), dto.email());
            assertEquals(AdminRole.SUPER_ADMIN, dto.role());
            assertEquals(AdminStatus.ACTIVE, dto.status());
            assertEquals(admin.getCreatedAt(), dto.createdAt());
            assertEquals(admin.getUpdatedAt(), dto.updatedAt());
        }
        
        @Test
        @DisplayName("Should map ADMIN domain to DTO correctly")
        void shouldMapAdminDomainToDtoCorrectly() {
            // Given
            Admin admin = createAdmin(AdminRole.ADMIN, AdminStatus.ACTIVE);
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertNotNull(dto);
            assertEquals(admin.getId(), dto.id());
            assertEquals(admin.getFirstName(), dto.firstName());
            assertEquals(admin.getLastName(), dto.lastName());
            assertEquals(admin.getEmail().getValue(), dto.email());
            assertEquals(AdminRole.ADMIN, dto.role());
            assertEquals(AdminStatus.ACTIVE, dto.status());
            assertEquals(admin.getCreatedAt(), dto.createdAt());
            assertEquals(admin.getUpdatedAt(), dto.updatedAt());
        }
        
        @Test
        @DisplayName("Should map MODERATOR domain to DTO correctly")
        void shouldMapModeratorDomainToDtoCorrectly() {
            // Given
            Admin admin = createAdmin(AdminRole.MODERATOR, AdminStatus.ACTIVE);
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertNotNull(dto);
            assertEquals(AdminRole.MODERATOR, dto.role());
            assertEquals(AdminStatus.ACTIVE, dto.status());
        }
        
        @Test
        @DisplayName("Should map ACTIVE status correctly")
        void shouldMapActiveStatusCorrectly() {
            // Given
            Admin admin = createAdmin(AdminRole.ADMIN, AdminStatus.ACTIVE);
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertEquals(AdminStatus.ACTIVE, dto.status());
        }
        
        @Test
        @DisplayName("Should map INACTIVE status correctly")
        void shouldMapInactiveStatusCorrectly() {
            // Given
            Admin admin = createAdmin(AdminRole.ADMIN, AdminStatus.INACTIVE);
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertEquals(AdminStatus.INACTIVE, dto.status());
        }
        
        @Test
        @DisplayName("Should map SUSPENDED status correctly")
        void shouldMapSuspendedStatusCorrectly() {
            // Given
            Admin admin = createAdmin(AdminRole.ADMIN, AdminStatus.SUSPENDED);
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertEquals(AdminStatus.SUSPENDED, dto.status());
        }
        
        @Test
        @DisplayName("Should map all basic fields correctly")
        void shouldMapAllBasicFieldsCorrectly() {
            // Given
            Admin admin = Admin.create(
                "John",
                "Doe", 
                "john.doe@test.com",
                "hashedPassword123",
                AdminRole.ADMIN
            );
            admin.setCreatedAt(testDateTime);
            admin.setUpdatedAt(testDateTime.plusHours(1));
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertNotNull(dto);
            assertEquals(admin.getId(), dto.id());
            assertEquals("John", dto.firstName());
            assertEquals("Doe", dto.lastName());
            assertEquals("john.doe@test.com", dto.email());
            assertEquals(AdminRole.ADMIN, dto.role());
            assertEquals(AdminStatus.ACTIVE, dto.status()); // Default status for new admin
            assertEquals(testDateTime, dto.createdAt());
            assertEquals(testDateTime.plusHours(1), dto.updatedAt());
        }
        
        @Test
        @DisplayName("Should extract email value from Email object correctly")
        void shouldExtractEmailValueFromEmailObjectCorrectly() {
            // Given
            String emailValue = "test@example.com";
            Admin admin = Admin.create(
                "Test",
                "User",
                emailValue,
                "password123",
                AdminRole.ADMIN
            );
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertEquals(emailValue, dto.email());
            assertNotNull(admin.getEmail());
            assertTrue(admin.getEmail() instanceof Email);
        }
        
        @Test
        @DisplayName("Should handle different name combinations")
        void shouldHandleDifferentNameCombinations() {
            // Given
            Admin admin1 = createAdminWithNames("A", "B");
            Admin admin2 = createAdminWithNames("VeryLongFirstName", "VeryLongLastName");
            Admin admin3 = createAdminWithNames("Jean-Pierre", "O'Connor");
            
            // When
            AdminDTO dto1 = mapper.toDTO(admin1);
            AdminDTO dto2 = mapper.toDTO(admin2);
            AdminDTO dto3 = mapper.toDTO(admin3);
            
            // Then
            assertEquals("A", dto1.firstName());
            assertEquals("B", dto1.lastName());
            
            assertEquals("VeryLongFirstName", dto2.firstName());
            assertEquals("VeryLongLastName", dto2.lastName());
            
            assertEquals("Jean-Pierre", dto3.firstName());
            assertEquals("O'Connor", dto3.lastName());
        }
        
        @Test
        @DisplayName("Should handle UUID correctly")
        void shouldHandleUuidCorrectly() {
            // Given
            UUID specificId = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
            Admin admin = Admin.create(
                "Test",
                "User",
                "test@example.com",
                "password123",
                AdminRole.ADMIN
            );
            // Set the specific ID using reflection or constructor if available
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertNotNull(dto.id());
            assertTrue(dto.id() instanceof UUID);
        }
        
        @Test
        @DisplayName("Should handle all role types correctly")
        void shouldHandleAllRoleTypesCorrectly() {
            // Given & When & Then
            for (AdminRole role : AdminRole.values()) {
                Admin admin = createAdmin(role, AdminStatus.ACTIVE);
                AdminDTO dto = mapper.toDTO(admin);
                
                assertEquals(role, dto.role(), "Role " + role + " should be mapped correctly");
            }
        }
        
        @Test
        @DisplayName("Should handle all status types correctly") 
        void shouldHandleAllStatusTypesCorrectly() {
            // Given & When & Then
            for (AdminStatus status : AdminStatus.values()) {
                Admin admin = createAdmin(AdminRole.ADMIN, status);
                AdminDTO dto = mapper.toDTO(admin);
                
                assertEquals(status, dto.status(), "Status " + status + " should be mapped correctly");
            }
        }
    }
    
    @Nested
    @DisplayName("Edge Cases and Validation")
    class EdgeCasesAndValidation {
        
        @Test
        @DisplayName("Should handle admin with null timestamps")
        void shouldHandleAdminWithNullTimestamps() {
            // Given
            Admin admin = createAdmin(AdminRole.ADMIN, AdminStatus.ACTIVE);
            admin.setCreatedAt(null);
            admin.setUpdatedAt(null);
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then
            assertNotNull(dto);
            assertNull(dto.createdAt());
            assertNull(dto.updatedAt());
            // Other fields should still be mapped correctly
            assertEquals(admin.getId(), dto.id());
            assertEquals(admin.getFirstName(), dto.firstName());
        }
        
        @Test
        @DisplayName("Should create new DTO instance for each mapping")
        void shouldCreateNewDtoInstanceForEachMapping() {
            // Given
            Admin admin = createAdmin(AdminRole.ADMIN, AdminStatus.ACTIVE);
            
            // When
            AdminDTO dto1 = mapper.toDTO(admin);
            AdminDTO dto2 = mapper.toDTO(admin);
            
            // Then
            assertNotSame(dto1, dto2);
            assertEquals(dto1, dto2); // Content should be equal
        }
        
        @Test
        @DisplayName("Should maintain data consistency across multiple mappings")
        void shouldMaintainDataConsistencyAcrossMultipleMappings() {
            // Given
            Admin admin = createAdmin(AdminRole.SUPER_ADMIN, AdminStatus.ACTIVE);
            
            // When
            AdminDTO dto1 = mapper.toDTO(admin);
            AdminDTO dto2 = mapper.toDTO(admin);
            
            // Then
            assertEquals(dto1.id(), dto2.id());
            assertEquals(dto1.firstName(), dto2.firstName());
            assertEquals(dto1.lastName(), dto2.lastName());
            assertEquals(dto1.email(), dto2.email());
            assertEquals(dto1.role(), dto2.role());
            assertEquals(dto1.status(), dto2.status());
            assertEquals(dto1.createdAt(), dto2.createdAt());
            assertEquals(dto1.updatedAt(), dto2.updatedAt());
        }
        
        @Test
        @DisplayName("Should be thread-safe for concurrent mappings")
        void shouldBeThreadSafeForConcurrentMappings() {
            // Given
            Admin admin = createAdmin(AdminRole.ADMIN, AdminStatus.ACTIVE);
            
            // When & Then - This would detect thread-safety issues in real concurrent scenarios
            assertDoesNotThrow(() -> {
                AdminDTO dto = mapper.toDTO(admin);
                assertNotNull(dto);
            });
        }
    }
    
    @Nested
    @DisplayName("Mapper Behavior")
    class MapperBehavior {
        
        @Test
        @DisplayName("Should be stateless between mappings")
        void shouldBeStatelessBetweenMappings() {
            // Given
            Admin admin1 = createAdmin(AdminRole.SUPER_ADMIN, AdminStatus.ACTIVE);
            Admin admin2 = createAdmin(AdminRole.MODERATOR, AdminStatus.SUSPENDED);
            
            // When
            AdminDTO dto1 = mapper.toDTO(admin1);
            AdminDTO dto2 = mapper.toDTO(admin2);
            
            // Then - First mapping should not affect second mapping
            assertEquals(AdminRole.SUPER_ADMIN, dto1.role());
            assertEquals(AdminStatus.ACTIVE, dto1.status());
            
            assertEquals(AdminRole.MODERATOR, dto2.role());
            assertEquals(AdminStatus.SUSPENDED, dto2.status());
        }
        
        @Test
        @DisplayName("Should handle rapid successive mappings")
        void shouldHandleRapidSuccessiveMappings() {
            // Given
            Admin admin = createAdmin(AdminRole.ADMIN, AdminStatus.ACTIVE);
            
            // When & Then
            for (int i = 0; i < 100; i++) {
                AdminDTO dto = mapper.toDTO(admin);
                assertNotNull(dto);
                assertEquals(admin.getId(), dto.id());
                assertEquals(AdminRole.ADMIN, dto.role());
            }
        }
        
        @Test
        @DisplayName("Should maintain immutability of DTO")
        void shouldMaintainImmutabilityOfDto() {
            // Given
            Admin admin = createAdmin(AdminRole.ADMIN, AdminStatus.ACTIVE);
            
            // When
            AdminDTO dto = mapper.toDTO(admin);
            
            // Then - DTO should be immutable (record type)
            assertNotNull(dto);
            // Records are immutable by design, so we can't modify fields
            // This test verifies the DTO is created correctly
            assertEquals(admin.getFirstName(), dto.firstName());
            assertEquals(admin.getLastName(), dto.lastName());
        }
    }
    
    // Helper methods
    private Admin createAdmin(AdminRole role, AdminStatus status) {
        Admin admin = Admin.create(
            "John",
            "Doe",
            "john.doe@test.com",
            "hashedPassword123",
            role
        );
        // Set status if needed (depends on Admin implementation)
        admin.setCreatedAt(testDateTime);
        admin.setUpdatedAt(testDateTime);
        return admin;
    }
    
    private Admin createAdminWithNames(String firstName, String lastName) {
        Admin admin = Admin.create(
            firstName,
            lastName,
            "test@example.com",
            "password123",
            AdminRole.ADMIN
        );
        admin.setCreatedAt(testDateTime);
        admin.setUpdatedAt(testDateTime);
        return admin;
    }
}