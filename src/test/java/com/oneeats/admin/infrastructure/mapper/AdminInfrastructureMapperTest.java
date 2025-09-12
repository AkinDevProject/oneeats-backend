package com.oneeats.admin.infrastructure.mapper;

import com.oneeats.admin.domain.model.Admin;
import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.admin.domain.model.AdminStatus;
import com.oneeats.admin.infrastructure.entity.AdminEntity;
import com.oneeats.shared.domain.vo.Email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AdminInfrastructureMapper Tests")
class AdminInfrastructureMapperTest {
    
    private AdminInfrastructureMapper mapper;
    private UUID adminId;
    private LocalDateTime testDateTime;
    
    @BeforeEach
    void setUp() {
        mapper = new AdminInfrastructureMapper();
        adminId = UUID.randomUUID();
        testDateTime = LocalDateTime.now();
    }
    
    @Nested
    @DisplayName("Entity to Domain Mapping")
    class EntityToDomainMapping {
        
        @Test
        @DisplayName("Should map SUPER_ADMIN entity to domain correctly")
        void shouldMapSuperAdminEntityToDomainCorrectly() {
            // Given
            AdminEntity entity = createAdminEntity(AdminRole.SUPER_ADMIN, AdminStatus.ACTIVE);
            
            // When
            Admin domain = mapper.toDomain(entity);
            
            // Then
            assertNotNull(domain);
            assertEquals(entity.getId(), domain.getId());
            assertEquals(entity.getFirstName(), domain.getFirstName());
            assertEquals(entity.getLastName(), domain.getLastName());
            assertEquals(entity.getEmail(), domain.getEmail().getValue());
            assertEquals(entity.getPasswordHash(), domain.getPasswordHash());
            assertEquals(AdminRole.SUPER_ADMIN, domain.getRole());
            assertEquals(AdminStatus.ACTIVE, domain.getStatus());
        }
        
        @Test
        @DisplayName("Should map ADMIN entity to domain correctly")
        void shouldMapAdminEntityToDomainCorrectly() {
            // Given
            AdminEntity entity = createAdminEntity(AdminRole.ADMIN, AdminStatus.ACTIVE);
            
            // When
            Admin domain = mapper.toDomain(entity);
            
            // Then
            assertNotNull(domain);
            assertEquals(AdminRole.ADMIN, domain.getRole());
            assertEquals(AdminStatus.ACTIVE, domain.getStatus());
        }
        
        @Test
        @DisplayName("Should map MODERATOR entity to domain correctly")
        void shouldMapModeratorEntityToDomainCorrectly() {
            // Given
            AdminEntity entity = createAdminEntity(AdminRole.MODERATOR, AdminStatus.SUSPENDED);
            
            // When
            Admin domain = mapper.toDomain(entity);
            
            // Then
            assertNotNull(domain);
            assertEquals(AdminRole.MODERATOR, domain.getRole());
            assertEquals(AdminStatus.SUSPENDED, domain.getStatus());
        }
        
        @Test
        @DisplayName("Should create Email object from entity email string")
        void shouldCreateEmailObjectFromEntityEmailString() {
            // Given
            String emailValue = "test@example.com";
            AdminEntity entity = createAdminEntity(AdminRole.ADMIN, AdminStatus.ACTIVE);
            entity.setEmail(emailValue);
            
            // When
            Admin domain = mapper.toDomain(entity);
            
            // Then
            assertNotNull(domain.getEmail());
            assertTrue(domain.getEmail() instanceof Email);
            assertEquals(emailValue, domain.getEmail().getValue());
        }
        
        @Test
        @DisplayName("Should map all basic entity fields to domain")
        void shouldMapAllBasicEntityFieldsToDomain() {
            // Given
            AdminEntity entity = new AdminEntity(
                adminId,
                "John",
                "Doe",
                "john.doe@test.com",
                "hashedPassword123",
                AdminRole.ADMIN,
                AdminStatus.ACTIVE,
                testDateTime,
                testDateTime.plusHours(1)
            );
            
            // When
            Admin domain = mapper.toDomain(entity);
            
            // Then
            assertEquals(entity.getId(), domain.getId());
            assertEquals(entity.getFirstName(), domain.getFirstName());
            assertEquals(entity.getLastName(), domain.getLastName());
            assertEquals(entity.getEmail(), domain.getEmail().getValue());
            assertEquals(entity.getPasswordHash(), domain.getPasswordHash());
            assertEquals(entity.getRole(), domain.getRole());
            assertEquals(entity.getStatus(), domain.getStatus());
            assertEquals(entity.getCreatedAt(), domain.getCreatedAt());
            assertEquals(entity.getUpdatedAt(), domain.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should handle all role types in entity to domain mapping")
        void shouldHandleAllRoleTypesInEntityToDomainMapping() {
            // Given & When & Then
            for (AdminRole role : AdminRole.values()) {
                AdminEntity entity = createAdminEntity(role, AdminStatus.ACTIVE);
                Admin domain = mapper.toDomain(entity);
                
                assertEquals(role, domain.getRole(), "Role " + role + " should be mapped correctly");
            }
        }
        
        @Test
        @DisplayName("Should handle all status types in entity to domain mapping")
        void shouldHandleAllStatusTypesInEntityToDomainMapping() {
            // Given & When & Then
            for (AdminStatus status : AdminStatus.values()) {
                AdminEntity entity = createAdminEntity(AdminRole.ADMIN, status);
                Admin domain = mapper.toDomain(entity);
                
                assertEquals(status, domain.getStatus(), "Status " + status + " should be mapped correctly");
            }
        }
        
        @Test
        @DisplayName("Should handle entity with different name formats")
        void shouldHandleEntityWithDifferentNameFormats() {
            // Given
            AdminEntity entity1 = createAdminEntityWithNames("A", "B");
            AdminEntity entity2 = createAdminEntityWithNames("Jean-Pierre", "O'Connor");
            AdminEntity entity3 = createAdminEntityWithNames("VeryLongFirstName", "VeryLongLastName");
            
            // When
            Admin domain1 = mapper.toDomain(entity1);
            Admin domain2 = mapper.toDomain(entity2);
            Admin domain3 = mapper.toDomain(entity3);
            
            // Then
            assertEquals("A", domain1.getFirstName());
            assertEquals("B", domain1.getLastName());
            
            assertEquals("Jean-Pierre", domain2.getFirstName());
            assertEquals("O'Connor", domain2.getLastName());
            
            assertEquals("VeryLongFirstName", domain3.getFirstName());
            assertEquals("VeryLongLastName", domain3.getLastName());
        }
    }
    
    @Nested
    @DisplayName("Domain to Entity Mapping")
    class DomainToEntityMapping {
        
        @Test
        @DisplayName("Should map SUPER_ADMIN domain to entity correctly")
        void shouldMapSuperAdminDomainToEntityCorrectly() {
            // Given
            Admin domain = createAdminDomain(AdminRole.SUPER_ADMIN, AdminStatus.ACTIVE);
            
            // When
            AdminEntity entity = mapper.toEntity(domain);
            
            // Then
            assertNotNull(entity);
            assertEquals(domain.getId(), entity.getId());
            assertEquals(domain.getFirstName(), entity.getFirstName());
            assertEquals(domain.getLastName(), entity.getLastName());
            assertEquals(domain.getEmail().getValue(), entity.getEmail());
            assertEquals(domain.getPasswordHash(), entity.getPasswordHash());
            assertEquals(AdminRole.SUPER_ADMIN, entity.getRole());
            assertEquals(AdminStatus.ACTIVE, entity.getStatus());
        }
        
        @Test
        @DisplayName("Should map ADMIN domain to entity correctly")
        void shouldMapAdminDomainToEntityCorrectly() {
            // Given
            Admin domain = createAdminDomain(AdminRole.ADMIN, AdminStatus.INACTIVE);
            
            // When
            AdminEntity entity = mapper.toEntity(domain);
            
            // Then
            assertNotNull(entity);
            assertEquals(AdminRole.ADMIN, entity.getRole());
            assertEquals(AdminStatus.INACTIVE, entity.getStatus());
        }
        
        @Test
        @DisplayName("Should map MODERATOR domain to entity correctly")
        void shouldMapModeratorDomainToEntityCorrectly() {
            // Given
            Admin domain = createAdminDomain(AdminRole.MODERATOR, AdminStatus.SUSPENDED);
            
            // When
            AdminEntity entity = mapper.toEntity(domain);
            
            // Then
            assertNotNull(entity);
            assertEquals(AdminRole.MODERATOR, entity.getRole());
            assertEquals(AdminStatus.SUSPENDED, entity.getStatus());
        }
        
        @Test
        @DisplayName("Should extract email value from Email object correctly")
        void shouldExtractEmailValueFromEmailObjectCorrectly() {
            // Given
            String emailValue = "test@domain.com";
            Admin domain = Admin.create(
                "Test",
                "User",
                emailValue,
                "password123",
                AdminRole.ADMIN
            );
            
            // When
            AdminEntity entity = mapper.toEntity(domain);
            
            // Then
            assertEquals(emailValue, entity.getEmail());
            assertNotNull(domain.getEmail());
            assertTrue(domain.getEmail() instanceof Email);
        }
        
        @Test
        @DisplayName("Should map all basic domain fields to entity")
        void shouldMapAllBasicDomainFieldsToEntity() {
            // Given
            Admin domain = Admin.create(
                "John",
                "Doe",
                "john.doe@test.com",
                "hashedPassword123", 
                AdminRole.ADMIN
            );
            domain.setCreatedAt(testDateTime);
            domain.setUpdatedAt(testDateTime.plusHours(1));
            
            // When
            AdminEntity entity = mapper.toEntity(domain);
            
            // Then
            assertEquals(domain.getId(), entity.getId());
            assertEquals(domain.getFirstName(), entity.getFirstName());
            assertEquals(domain.getLastName(), entity.getLastName());
            assertEquals(domain.getEmail().getValue(), entity.getEmail());
            assertEquals(domain.getPasswordHash(), entity.getPasswordHash());
            assertEquals(domain.getRole(), entity.getRole());
            assertEquals(domain.getStatus(), entity.getStatus());
            assertEquals(domain.getCreatedAt(), entity.getCreatedAt());
            assertEquals(domain.getUpdatedAt(), entity.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should handle all role types in domain to entity mapping")
        void shouldHandleAllRoleTypesInDomainToEntityMapping() {
            // Given & When & Then
            for (AdminRole role : AdminRole.values()) {
                Admin domain = createAdminDomain(role, AdminStatus.ACTIVE);
                AdminEntity entity = mapper.toEntity(domain);
                
                assertEquals(role, entity.getRole(), "Role " + role + " should be mapped correctly");
            }
        }
        
        @Test
        @DisplayName("Should handle all status types in domain to entity mapping")
        void shouldHandleAllStatusTypesInDomainToEntityMapping() {
            // Given & When & Then
            for (AdminStatus status : AdminStatus.values()) {
                Admin domain = createAdminDomain(AdminRole.ADMIN, status);
                AdminEntity entity = mapper.toEntity(domain);
                
                assertEquals(status, entity.getStatus(), "Status " + status + " should be mapped correctly");
            }
        }
        
        @Test
        @DisplayName("Should handle domain with different name formats")
        void shouldHandleDomainWithDifferentNameFormats() {
            // Given
            Admin domain1 = createAdminDomainWithNames("X", "Y");
            Admin domain2 = createAdminDomainWithNames("Marie-Claire", "Van Der Berg");
            Admin domain3 = createAdminDomainWithNames("SuperLongFirstName", "SuperLongLastName");
            
            // When
            AdminEntity entity1 = mapper.toEntity(domain1);
            AdminEntity entity2 = mapper.toEntity(domain2);
            AdminEntity entity3 = mapper.toEntity(domain3);
            
            // Then
            assertEquals("X", entity1.getFirstName());
            assertEquals("Y", entity1.getLastName());
            
            assertEquals("Marie-Claire", entity2.getFirstName());
            assertEquals("Van Der Berg", entity2.getLastName());
            
            assertEquals("SuperLongFirstName", entity3.getFirstName());
            assertEquals("SuperLongLastName", entity3.getLastName());
        }
    }
    
    @Nested
    @DisplayName("Roundtrip Conversion")
    class RoundtripConversion {
        
        @Test
        @DisplayName("Should maintain data integrity in entity->domain->entity conversion")
        void shouldMaintainDataIntegrityInEntityDomainEntityConversion() {
            // Given
            AdminEntity originalEntity = createCompleteAdminEntity();
            
            // When
            Admin domain = mapper.toDomain(originalEntity);
            AdminEntity roundtripEntity = mapper.toEntity(domain);
            
            // Then - Basic fields should be preserved
            assertEquals(originalEntity.getId(), roundtripEntity.getId());
            assertEquals(originalEntity.getFirstName(), roundtripEntity.getFirstName());
            assertEquals(originalEntity.getLastName(), roundtripEntity.getLastName());
            assertEquals(originalEntity.getEmail(), roundtripEntity.getEmail());
            assertEquals(originalEntity.getPasswordHash(), roundtripEntity.getPasswordHash());
            assertEquals(originalEntity.getRole(), roundtripEntity.getRole());
            assertEquals(originalEntity.getStatus(), roundtripEntity.getStatus());
            assertEquals(originalEntity.getCreatedAt(), roundtripEntity.getCreatedAt());
            assertEquals(originalEntity.getUpdatedAt(), roundtripEntity.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should maintain data integrity in domain->entity->domain conversion")
        void shouldMaintainDataIntegrityInDomainEntityDomainConversion() {
            // Given
            Admin originalDomain = createCompleteAdminDomain();
            
            // When
            AdminEntity entity = mapper.toEntity(originalDomain);
            Admin roundtripDomain = mapper.toDomain(entity);
            
            // Then
            assertEquals(originalDomain.getId(), roundtripDomain.getId());
            assertEquals(originalDomain.getFirstName(), roundtripDomain.getFirstName());
            assertEquals(originalDomain.getLastName(), roundtripDomain.getLastName());
            assertEquals(originalDomain.getEmail().getValue(), roundtripDomain.getEmail().getValue());
            assertEquals(originalDomain.getPasswordHash(), roundtripDomain.getPasswordHash());
            assertEquals(originalDomain.getRole(), roundtripDomain.getRole());
            assertEquals(originalDomain.getStatus(), roundtripDomain.getStatus());
        }
        
        @Test
        @DisplayName("Should handle roundtrip conversion for all roles")
        void shouldHandleRoundtripConversionForAllRoles() {
            // Given & When & Then
            for (AdminRole role : AdminRole.values()) {
                AdminEntity originalEntity = createAdminEntity(role, AdminStatus.ACTIVE);
                
                Admin domain = mapper.toDomain(originalEntity);
                AdminEntity roundtripEntity = mapper.toEntity(domain);
                
                assertEquals(originalEntity.getRole(), roundtripEntity.getRole(), 
                    "Roundtrip conversion failed for role: " + role);
            }
        }
        
        @Test
        @DisplayName("Should handle roundtrip conversion for all statuses")
        void shouldHandleRoundtripConversionForAllStatuses() {
            // Given & When & Then
            for (AdminStatus status : AdminStatus.values()) {
                AdminEntity originalEntity = createAdminEntity(AdminRole.ADMIN, status);
                
                Admin domain = mapper.toDomain(originalEntity);
                AdminEntity roundtripEntity = mapper.toEntity(domain);
                
                assertEquals(originalEntity.getStatus(), roundtripEntity.getStatus(), 
                    "Roundtrip conversion failed for status: " + status);
            }
        }
    }
    
    @Nested
    @DisplayName("Edge Cases and Validation")
    class EdgeCasesAndValidation {
        
        @Test
        @DisplayName("Should handle null timestamps in entity")
        void shouldHandleNullTimestampsInEntity() {
            // Given
            AdminEntity entity = createAdminEntity(AdminRole.ADMIN, AdminStatus.ACTIVE);
            entity.setCreatedAt(null);
            entity.setUpdatedAt(null);
            
            // When
            Admin domain = mapper.toDomain(entity);
            
            // Then
            assertNotNull(domain);
            assertNull(domain.getCreatedAt());
            assertNull(domain.getUpdatedAt());
            // Other fields should still be mapped
            assertEquals(entity.getId(), domain.getId());
            assertEquals(entity.getFirstName(), domain.getFirstName());
        }
        
        @Test
        @DisplayName("Should handle null timestamps in domain")
        void shouldHandleNullTimestampsInDomain() {
            // Given
            Admin domain = createAdminDomain(AdminRole.ADMIN, AdminStatus.ACTIVE);
            domain.setCreatedAt(null);
            domain.setUpdatedAt(null);
            
            // When
            AdminEntity entity = mapper.toEntity(domain);
            
            // Then
            assertNotNull(entity);
            assertNull(entity.getCreatedAt());
            assertNull(entity.getUpdatedAt());
            // Other fields should still be mapped
            assertEquals(domain.getId(), entity.getId());
            assertEquals(domain.getFirstName(), entity.getFirstName());
        }
        
        @Test
        @DisplayName("Should create new instances for each mapping")
        void shouldCreateNewInstancesForEachMapping() {
            // Given
            AdminEntity entity = createAdminEntity(AdminRole.ADMIN, AdminStatus.ACTIVE);
            
            // When
            Admin domain1 = mapper.toDomain(entity);
            Admin domain2 = mapper.toDomain(entity);
            
            // Then
            assertNotSame(domain1, domain2);
            assertEquals(domain1.getId(), domain2.getId()); // Content should be equal
        }
        
        @Test
        @DisplayName("Should be stateless between mappings")
        void shouldBeStatelessBetweenMappings() {
            // Given
            AdminEntity entity1 = createAdminEntity(AdminRole.SUPER_ADMIN, AdminStatus.ACTIVE);
            AdminEntity entity2 = createAdminEntity(AdminRole.MODERATOR, AdminStatus.SUSPENDED);
            
            // When
            Admin domain1 = mapper.toDomain(entity1);
            Admin domain2 = mapper.toDomain(entity2);
            
            // Then - First mapping should not affect second mapping
            assertEquals(AdminRole.SUPER_ADMIN, domain1.getRole());
            assertEquals(AdminStatus.ACTIVE, domain1.getStatus());
            
            assertEquals(AdminRole.MODERATOR, domain2.getRole());
            assertEquals(AdminStatus.SUSPENDED, domain2.getStatus());
        }
    }
    
    // Helper methods
    private AdminEntity createAdminEntity(AdminRole role, AdminStatus status) {
        return new AdminEntity(
            adminId,
            "John",
            "Doe",
            "john.doe@test.com",
            "hashedPassword123",
            role,
            status,
            testDateTime,
            testDateTime
        );
    }
    
    private AdminEntity createAdminEntityWithNames(String firstName, String lastName) {
        return new AdminEntity(
            adminId,
            firstName,
            lastName,
            "test@example.com",
            "hashedPassword123",
            AdminRole.ADMIN,
            AdminStatus.ACTIVE,
            testDateTime,
            testDateTime
        );
    }
    
    private AdminEntity createCompleteAdminEntity() {
        return new AdminEntity(
            adminId,
            "Complete",
            "Admin",
            "complete@admin.com",
            "hashedCompletePassword",
            AdminRole.SUPER_ADMIN,
            AdminStatus.ACTIVE,
            testDateTime,
            testDateTime.plusHours(2)
        );
    }
    
    private Admin createAdminDomain(AdminRole role, AdminStatus status) {
        Admin admin = Admin.create(
            "John",
            "Doe",
            "john.doe@test.com",
            "hashedPassword123",
            role
        );
        admin.setCreatedAt(testDateTime);
        admin.setUpdatedAt(testDateTime);
        return admin;
    }
    
    private Admin createAdminDomainWithNames(String firstName, String lastName) {
        Admin admin = Admin.create(
            firstName,
            lastName,
            "test@example.com",
            "hashedPassword123",
            AdminRole.ADMIN
        );
        admin.setCreatedAt(testDateTime);
        admin.setUpdatedAt(testDateTime);
        return admin;
    }
    
    private Admin createCompleteAdminDomain() {
        Admin admin = Admin.create(
            "Complete",
            "Domain",
            "complete@domain.com",
            "hashedCompletePassword",
            AdminRole.SUPER_ADMIN
        );
        admin.setCreatedAt(testDateTime);
        admin.setUpdatedAt(testDateTime.plusHours(3));
        return admin;
    }
}