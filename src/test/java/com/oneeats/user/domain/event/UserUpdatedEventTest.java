package com.oneeats.user.domain.event;

import com.oneeats.shared.domain.vo.Email;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserUpdatedEvent Tests")
class UserUpdatedEventTest {
    
    private UUID userId;
    private Email email;
    
    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        email = new Email("john.doe@example.com");
    }
    
    @Nested
    @DisplayName("Event Creation")
    class EventCreation {
        
        @Test
        @DisplayName("Should create event with valid data")
        void shouldCreateEventWithValidData() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            UserUpdatedEvent event = new UserUpdatedEvent(userId, email);
            
            LocalDateTime afterCreation = LocalDateTime.now();
            
            assertNotNull(event);
            assertEquals(userId, event.getUserId());
            assertEquals(email, event.getEmail());
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation.minusSeconds(1)));
            assertTrue(event.occurredOn().isBefore(afterCreation.plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should set occurrence time automatically")
        void shouldSetOccurrenceTimeAutomatically() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            UserUpdatedEvent event = new UserUpdatedEvent(userId, email);
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation) || event.occurredOn().isEqual(beforeCreation));
            assertTrue(event.occurredOn().isBefore(LocalDateTime.now().plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should handle null values gracefully")
        void shouldHandleNullValuesGracefully() {
            assertDoesNotThrow(() -> new UserUpdatedEvent(null, null));
            assertDoesNotThrow(() -> new UserUpdatedEvent(userId, null));
            assertDoesNotThrow(() -> new UserUpdatedEvent(null, email));
        }
    }
    
    @Nested
    @DisplayName("Event Properties")
    class EventProperties {
        
        private UserUpdatedEvent event;
        
        @BeforeEach
        void setUp() {
            event = new UserUpdatedEvent(userId, email);
        }
        
        @Test
        @DisplayName("Should return correct user ID")
        void shouldReturnCorrectUserId() {
            assertEquals(userId, event.getUserId());
        }
        
        @Test
        @DisplayName("Should return correct email")
        void shouldReturnCorrectEmail() {
            assertEquals(email, event.getEmail());
        }
        
        @Test
        @DisplayName("Should return occurrence time")
        void shouldReturnOccurrenceTime() {
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn() instanceof LocalDateTime);
        }
    }
    
    @Nested
    @DisplayName("Event with Different Data")
    class EventWithDifferentData {
        
        @Test
        @DisplayName("Should handle different email formats")
        void shouldHandleDifferentEmailFormats() {
            Email email1 = new Email("original@test.com");
            Email email2 = new Email("updated.email+tag@domain.co.uk");
            Email email3 = new Email("new-email@organization.org");
            
            UserUpdatedEvent event1 = new UserUpdatedEvent(userId, email1);
            UserUpdatedEvent event2 = new UserUpdatedEvent(userId, email2);
            UserUpdatedEvent event3 = new UserUpdatedEvent(userId, email3);
            
            assertEquals(email1, event1.getEmail());
            assertEquals(email2, event2.getEmail());
            assertEquals(email3, event3.getEmail());
        }
        
        @Test
        @DisplayName("Should handle different user IDs")
        void shouldHandleDifferentUserIds() {
            UUID userId1 = UUID.randomUUID();
            UUID userId2 = UUID.randomUUID();
            UUID userId3 = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            
            UserUpdatedEvent event1 = new UserUpdatedEvent(userId1, email);
            UserUpdatedEvent event2 = new UserUpdatedEvent(userId2, email);
            UserUpdatedEvent event3 = new UserUpdatedEvent(userId3, email);
            
            assertEquals(userId1, event1.getUserId());
            assertEquals(userId2, event2.getUserId());
            assertEquals(userId3, event3.getUserId());
        }
        
        @Test
        @DisplayName("Should handle email address updates")
        void shouldHandleEmailAddressUpdates() {
            Email oldEmail = new Email("old.email@example.com");
            Email newEmail = new Email("new.email@example.com");
            
            UserUpdatedEvent updateEvent = new UserUpdatedEvent(userId, newEmail);
            
            assertEquals(userId, updateEvent.getUserId());
            assertEquals(newEmail, updateEvent.getEmail());
            assertNotEquals(oldEmail, updateEvent.getEmail());
        }
    }
    
    @Nested
    @DisplayName("Event Immutability")
    class EventImmutability {
        
        @Test
        @DisplayName("Should be immutable after creation")
        void shouldBeImmutableAfterCreation() {
            UserUpdatedEvent event = new UserUpdatedEvent(userId, email);
            
            UUID originalUserId = event.getUserId();
            Email originalEmail = event.getEmail();
            LocalDateTime originalOccurredOn = event.occurredOn();
            
            assertEquals(originalUserId, event.getUserId());
            assertEquals(originalEmail, event.getEmail());
            assertEquals(originalOccurredOn, event.occurredOn());
        }
        
        @Test
        @DisplayName("Should maintain occurrence time consistency")
        void shouldMaintainOccurrenceTimeConsistency() {
            UserUpdatedEvent event = new UserUpdatedEvent(userId, email);
            
            LocalDateTime firstCall = event.occurredOn();
            
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
    @DisplayName("Multiple Events Comparison")
    class MultipleEventsComparison {
        
        @Test
        @DisplayName("Should create events with different occurrence times")
        void shouldCreateEventsWithDifferentOccurrenceTimes() throws InterruptedException {
            UserUpdatedEvent event1 = new UserUpdatedEvent(userId, email);
            
            Thread.sleep(10);
            
            UserUpdatedEvent event2 = new UserUpdatedEvent(
                UUID.randomUUID(), 
                new Email("updated.email@example.com"));
            
            assertTrue(event2.occurredOn().isAfter(event1.occurredOn()) || 
                event2.occurredOn().isEqual(event1.occurredOn()));
        }
        
        @Test
        @DisplayName("Should create independent event instances")
        void shouldCreateIndependentEventInstances() {
            UserUpdatedEvent event1 = new UserUpdatedEvent(userId, email);
            UserUpdatedEvent event2 = new UserUpdatedEvent(userId, email);
            
            assertNotSame(event1, event2);
            
            assertEquals(event1.getUserId(), event2.getUserId());
            assertEquals(event1.getEmail(), event2.getEmail());
        }
        
        @Test
        @DisplayName("Should support sequential user updates")
        void shouldSupportSequentialUserUpdates() throws InterruptedException {
            Email email1 = new Email("first.update@example.com");
            Email email2 = new Email("second.update@example.com");
            Email email3 = new Email("final.update@example.com");
            
            UserUpdatedEvent update1 = new UserUpdatedEvent(userId, email1);
            Thread.sleep(1);
            UserUpdatedEvent update2 = new UserUpdatedEvent(userId, email2);
            Thread.sleep(1);
            UserUpdatedEvent update3 = new UserUpdatedEvent(userId, email3);
            
            assertEquals(userId, update1.getUserId());
            assertEquals(userId, update2.getUserId());
            assertEquals(userId, update3.getUserId());
            
            assertEquals(email1, update1.getEmail());
            assertEquals(email2, update2.getEmail());
            assertEquals(email3, update3.getEmail());
            
            assertTrue(update2.occurredOn().isAfter(update1.occurredOn()) || 
                update2.occurredOn().isEqual(update1.occurredOn()));
            assertTrue(update3.occurredOn().isAfter(update2.occurredOn()) || 
                update3.occurredOn().isEqual(update2.occurredOn()));
        }
    }
    
    @Nested
    @DisplayName("Business Context")
    class BusinessContext {
        
        @Test
        @DisplayName("Should represent successful user profile update")
        void shouldRepresentSuccessfulUserProfileUpdate() {
            UUID existingUserId = UUID.randomUUID();
            Email updatedEmail = new Email("updated.user@oneeats.com");
            
            UserUpdatedEvent event = new UserUpdatedEvent(existingUserId, updatedEmail);
            
            assertEquals(existingUserId, event.getUserId());
            assertEquals(updatedEmail, event.getEmail());
            assertNotNull(event.occurredOn());
        }
        
        @Test
        @DisplayName("Should capture user update timestamp accurately")
        void shouldCaptureUserUpdateTimestampAccurately() {
            LocalDateTime updateTime = LocalDateTime.now();
            
            UserUpdatedEvent event = new UserUpdatedEvent(userId, email);
            
            assertTrue(Math.abs(java.time.Duration.between(updateTime, event.occurredOn()).toMillis()) < 100);
        }
        
        @Test
        @DisplayName("Should track email address changes")
        void shouldTrackEmailAddressChanges() {
            Email corporateEmail = new Email("john.doe@company.com");
            Email personalEmail = new Email("john.personal@gmail.com");
            
            UserUpdatedEvent corporateUpdate = new UserUpdatedEvent(userId, corporateEmail);
            UserUpdatedEvent personalUpdate = new UserUpdatedEvent(userId, personalEmail);
            
            assertEquals(corporateEmail, corporateUpdate.getEmail());
            assertEquals(personalEmail, personalUpdate.getEmail());
            assertNotEquals(corporateUpdate.getEmail(), personalUpdate.getEmail());
        }
    }
    
    @Nested
    @DisplayName("Event Temporal Ordering")
    class EventTemporalOrdering {
        
        @Test
        @DisplayName("Should maintain chronological order for multiple updates")
        void shouldMaintainChronologicalOrderForMultipleUpdates() throws InterruptedException {
            UserUpdatedEvent firstUpdate = new UserUpdatedEvent(userId, 
                new Email("first@example.com"));
            
            Thread.sleep(5);
            
            UserUpdatedEvent secondUpdate = new UserUpdatedEvent(userId, 
                new Email("second@example.com"));
            
            Thread.sleep(5);
            
            UserUpdatedEvent thirdUpdate = new UserUpdatedEvent(userId, 
                new Email("third@example.com"));
            
            assertTrue(secondUpdate.occurredOn().isAfter(firstUpdate.occurredOn()) ||
                secondUpdate.occurredOn().isEqual(firstUpdate.occurredOn()));
            assertTrue(thirdUpdate.occurredOn().isAfter(secondUpdate.occurredOn()) ||
                thirdUpdate.occurredOn().isEqual(secondUpdate.occurredOn()));
        }
        
        @Test
        @DisplayName("Should provide precise timestamps for audit trails")
        void shouldProvidePreciseTimestampsForAuditTrails() {
            LocalDateTime beforeUpdate = LocalDateTime.now();
            
            UserUpdatedEvent event = new UserUpdatedEvent(userId, email);
            
            LocalDateTime afterUpdate = LocalDateTime.now();
            
            assertTrue(event.occurredOn().isAfter(beforeUpdate) || 
                event.occurredOn().isEqual(beforeUpdate));
            assertTrue(event.occurredOn().isBefore(afterUpdate) || 
                event.occurredOn().isEqual(afterUpdate));
        }
    }
}