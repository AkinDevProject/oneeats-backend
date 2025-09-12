package com.oneeats.admin.domain.event;

import com.oneeats.admin.domain.model.AdminRole;
import com.oneeats.shared.domain.vo.Email;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AdminCreatedEvent Tests")
class AdminCreatedEventTest {
    
    private UUID adminId;
    private Email email;
    private AdminRole role;
    
    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        email = new Email("admin@oneeats.com");
        role = AdminRole.ADMIN;
    }
    
    @Nested
    @DisplayName("Event Creation")
    class EventCreation {
        
        @Test
        @DisplayName("Should create event with valid data")
        void shouldCreateEventWithValidData() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            AdminCreatedEvent event = new AdminCreatedEvent(adminId, email, role);
            
            LocalDateTime afterCreation = LocalDateTime.now();
            
            assertNotNull(event);
            assertEquals(adminId, event.getAdminId());
            assertEquals(email, event.getEmail());
            assertEquals(role, event.getRole());
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation.minusSeconds(1)));
            assertTrue(event.occurredOn().isBefore(afterCreation.plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should set occurrence time automatically")
        void shouldSetOccurrenceTimeAutomatically() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            AdminCreatedEvent event = new AdminCreatedEvent(adminId, email, role);
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation) || event.occurredOn().isEqual(beforeCreation));
            assertTrue(event.occurredOn().isBefore(LocalDateTime.now().plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should handle null values gracefully")
        void shouldHandleNullValuesGracefully() {
            // The event constructor should accept null values without throwing exceptions
            assertDoesNotThrow(() -> new AdminCreatedEvent(null, null, null));
            assertDoesNotThrow(() -> new AdminCreatedEvent(adminId, null, role));
            assertDoesNotThrow(() -> new AdminCreatedEvent(null, email, null));
        }
    }
    
    @Nested
    @DisplayName("Event Properties")
    class EventProperties {
        
        private AdminCreatedEvent event;
        
        @BeforeEach
        void setUp() {
            event = new AdminCreatedEvent(adminId, email, role);
        }
        
        @Test
        @DisplayName("Should return correct admin ID")
        void shouldReturnCorrectAdminId() {
            assertEquals(adminId, event.getAdminId());
        }
        
        @Test
        @DisplayName("Should return correct email")
        void shouldReturnCorrectEmail() {
            assertEquals(email, event.getEmail());
        }
        
        @Test
        @DisplayName("Should return correct role")
        void shouldReturnCorrectRole() {
            assertEquals(role, event.getRole());
        }
        
        @Test
        @DisplayName("Should return occurrence time")
        void shouldReturnOccurrenceTime() {
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn() instanceof LocalDateTime);
        }
    }
    
    @Nested
    @DisplayName("Event with Different Roles")
    class EventWithDifferentRoles {
        
        @Test
        @DisplayName("Should handle SUPER_ADMIN role")
        void shouldHandleSuperAdminRole() {
            AdminCreatedEvent event = new AdminCreatedEvent(adminId, email, AdminRole.SUPER_ADMIN);
            
            assertEquals(AdminRole.SUPER_ADMIN, event.getRole());
        }
        
        @Test
        @DisplayName("Should handle MODERATOR role")
        void shouldHandleModeratorRole() {
            AdminCreatedEvent event = new AdminCreatedEvent(adminId, email, AdminRole.MODERATOR);
            
            assertEquals(AdminRole.MODERATOR, event.getRole());
        }
        
        @Test
        @DisplayName("Should handle all role types")
        void shouldHandleAllRoleTypes() {
            for (AdminRole adminRole : AdminRole.values()) {
                AdminCreatedEvent event = new AdminCreatedEvent(adminId, email, adminRole);
                
                assertEquals(adminRole, event.getRole());
                assertEquals(adminId, event.getAdminId());
                assertEquals(email, event.getEmail());
            }
        }
    }
    
    @Nested
    @DisplayName("Event Immutability")
    class EventImmutability {
        
        @Test
        @DisplayName("Should be immutable after creation")
        void shouldBeImmutableAfterCreation() {
            AdminCreatedEvent event = new AdminCreatedEvent(adminId, email, role);
            
            // Verify that getters return the same values consistently
            UUID originalAdminId = event.getAdminId();
            Email originalEmail = event.getEmail();
            AdminRole originalRole = event.getRole();
            LocalDateTime originalOccurredOn = event.occurredOn();
            
            // Call getters multiple times and verify consistency
            assertEquals(originalAdminId, event.getAdminId());
            assertEquals(originalEmail, event.getEmail());
            assertEquals(originalRole, event.getRole());
            assertEquals(originalOccurredOn, event.occurredOn());
        }
        
        @Test
        @DisplayName("Should maintain occurrence time consistency")
        void shouldMaintainOccurrenceTimeConsistency() {
            AdminCreatedEvent event = new AdminCreatedEvent(adminId, email, role);
            
            LocalDateTime firstCall = event.occurredOn();
            
            // Small delay to verify time doesn't change
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            LocalDateTime secondCall = event.occurredOn();
            
            assertEquals(firstCall, secondCall);
        }
    }
    
    @Nested
    @DisplayName("Event with Different Data Types")
    class EventWithDifferentDataTypes {
        
        @Test
        @DisplayName("Should handle different email formats")
        void shouldHandleDifferentEmailFormats() {
            Email email1 = new Email("user@example.com");
            Email email2 = new Email("admin.user@oneeats.co.uk");
            Email email3 = new Email("super+admin@test-domain.org");
            
            AdminCreatedEvent event1 = new AdminCreatedEvent(adminId, email1, role);
            AdminCreatedEvent event2 = new AdminCreatedEvent(adminId, email2, role);
            AdminCreatedEvent event3 = new AdminCreatedEvent(adminId, email3, role);
            
            assertEquals(email1, event1.getEmail());
            assertEquals(email2, event2.getEmail());
            assertEquals(email3, event3.getEmail());
        }
        
        @Test
        @DisplayName("Should handle different UUID formats")
        void shouldHandleDifferentUuidFormats() {
            UUID uuid1 = UUID.randomUUID();
            UUID uuid2 = UUID.randomUUID();
            UUID uuid3 = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            
            AdminCreatedEvent event1 = new AdminCreatedEvent(uuid1, email, role);
            AdminCreatedEvent event2 = new AdminCreatedEvent(uuid2, email, role);
            AdminCreatedEvent event3 = new AdminCreatedEvent(uuid3, email, role);
            
            assertEquals(uuid1, event1.getAdminId());
            assertEquals(uuid2, event2.getAdminId());
            assertEquals(uuid3, event3.getAdminId());
        }
    }
    
    @Nested
    @DisplayName("Multiple Events Comparison")
    class MultipleEventsComparison {
        
        @Test
        @DisplayName("Should create events with different occurrence times")
        void shouldCreateEventsWithDifferentOccurrenceTimes() throws InterruptedException {
            AdminCreatedEvent event1 = new AdminCreatedEvent(adminId, email, role);
            
            Thread.sleep(10); // Ensure different timestamps
            
            AdminCreatedEvent event2 = new AdminCreatedEvent(
                UUID.randomUUID(), 
                new Email("another.admin@oneeats.com"), 
                AdminRole.SUPER_ADMIN);
            
            assertTrue(event2.occurredOn().isAfter(event1.occurredOn()));
        }
        
        @Test
        @DisplayName("Should create independent event instances")
        void shouldCreateIndependentEventInstances() {
            AdminCreatedEvent event1 = new AdminCreatedEvent(adminId, email, role);
            AdminCreatedEvent event2 = new AdminCreatedEvent(adminId, email, role);
            
            // Events should be different instances even with same data
            assertNotSame(event1, event2);
            
            // But they should have the same data (except possibly occurrence time due to timing)
            assertEquals(event1.getAdminId(), event2.getAdminId());
            assertEquals(event1.getEmail(), event2.getEmail());
            assertEquals(event1.getRole(), event2.getRole());
        }
    }
}