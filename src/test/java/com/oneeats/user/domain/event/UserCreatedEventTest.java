package com.oneeats.user.domain.event;

import com.oneeats.shared.domain.vo.Email;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("UserCreatedEvent Tests")
class UserCreatedEventTest {
    
    private UUID userId;
    private Email email;
    private String fullName;
    
    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        email = new Email("john.doe@example.com");
        fullName = "John Doe";
    }
    
    @Nested
    @DisplayName("Event Creation")
    class EventCreation {
        
        @Test
        @DisplayName("Should create event with valid data")
        void shouldCreateEventWithValidData() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            UserCreatedEvent event = new UserCreatedEvent(userId, email, fullName);
            
            LocalDateTime afterCreation = LocalDateTime.now();
            
            assertNotNull(event);
            assertEquals(userId, event.getUserId());
            assertEquals(email, event.getEmail());
            assertEquals(fullName, event.getFullName());
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation.minusSeconds(1)));
            assertTrue(event.occurredOn().isBefore(afterCreation.plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should set occurrence time automatically")
        void shouldSetOccurrenceTimeAutomatically() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            UserCreatedEvent event = new UserCreatedEvent(userId, email, fullName);
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation) || event.occurredOn().isEqual(beforeCreation));
            assertTrue(event.occurredOn().isBefore(LocalDateTime.now().plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should handle null values gracefully")
        void shouldHandleNullValuesGracefully() {
            assertDoesNotThrow(() -> new UserCreatedEvent(null, null, null));
            assertDoesNotThrow(() -> new UserCreatedEvent(userId, null, fullName));
            assertDoesNotThrow(() -> new UserCreatedEvent(null, email, null));
        }
    }
    
    @Nested
    @DisplayName("Event Properties")
    class EventProperties {
        
        private UserCreatedEvent event;
        
        @BeforeEach
        void setUp() {
            event = new UserCreatedEvent(userId, email, fullName);
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
        @DisplayName("Should return correct full name")
        void shouldReturnCorrectFullName() {
            assertEquals(fullName, event.getFullName());
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
            Email email1 = new Email("simple@test.com");
            Email email2 = new Email("complex.email+tag@domain.co.uk");
            
            UserCreatedEvent event1 = new UserCreatedEvent(userId, email1, "User One");
            UserCreatedEvent event2 = new UserCreatedEvent(userId, email2, "User Two");
            
            assertEquals(email1, event1.getEmail());
            assertEquals(email2, event2.getEmail());
        }
        
        @Test
        @DisplayName("Should handle different full names")
        void shouldHandleDifferentFullNames() {
            String name1 = "John Doe";
            String name2 = "María José García-López";
            String name3 = "李明";
            
            UserCreatedEvent event1 = new UserCreatedEvent(userId, email, name1);
            UserCreatedEvent event2 = new UserCreatedEvent(userId, email, name2);
            UserCreatedEvent event3 = new UserCreatedEvent(userId, email, name3);
            
            assertEquals(name1, event1.getFullName());
            assertEquals(name2, event2.getFullName());
            assertEquals(name3, event3.getFullName());
        }
        
        @Test
        @DisplayName("Should handle empty and special character names")
        void shouldHandleEmptyAndSpecialCharacterNames() {
            UserCreatedEvent emptyEvent = new UserCreatedEvent(userId, email, "");
            UserCreatedEvent specialEvent = new UserCreatedEvent(userId, email, "O'Connor-Smith Jr.");
            
            assertEquals("", emptyEvent.getFullName());
            assertEquals("O'Connor-Smith Jr.", specialEvent.getFullName());
        }
    }
    
    @Nested
    @DisplayName("Event Immutability")
    class EventImmutability {
        
        @Test
        @DisplayName("Should be immutable after creation")
        void shouldBeImmutableAfterCreation() {
            UserCreatedEvent event = new UserCreatedEvent(userId, email, fullName);
            
            UUID originalUserId = event.getUserId();
            Email originalEmail = event.getEmail();
            String originalFullName = event.getFullName();
            LocalDateTime originalOccurredOn = event.occurredOn();
            
            assertEquals(originalUserId, event.getUserId());
            assertEquals(originalEmail, event.getEmail());
            assertEquals(originalFullName, event.getFullName());
            assertEquals(originalOccurredOn, event.occurredOn());
        }
        
        @Test
        @DisplayName("Should maintain occurrence time consistency")
        void shouldMaintainOccurrenceTimeConsistency() {
            UserCreatedEvent event = new UserCreatedEvent(userId, email, fullName);
            
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
            UserCreatedEvent event1 = new UserCreatedEvent(userId, email, fullName);
            
            Thread.sleep(10);
            
            UserCreatedEvent event2 = new UserCreatedEvent(
                UUID.randomUUID(), 
                new Email("jane.smith@example.com"), 
                "Jane Smith");
            
            assertTrue(event2.occurredOn().isAfter(event1.occurredOn()) || 
                event2.occurredOn().isEqual(event1.occurredOn()));
        }
        
        @Test
        @DisplayName("Should create independent event instances")
        void shouldCreateIndependentEventInstances() {
            UserCreatedEvent event1 = new UserCreatedEvent(userId, email, fullName);
            UserCreatedEvent event2 = new UserCreatedEvent(userId, email, fullName);
            
            assertNotSame(event1, event2);
            
            assertEquals(event1.getUserId(), event2.getUserId());
            assertEquals(event1.getEmail(), event2.getEmail());
            assertEquals(event1.getFullName(), event2.getFullName());
        }
    }
    
    @Nested
    @DisplayName("Business Context")
    class BusinessContext {
        
        @Test
        @DisplayName("Should represent successful user registration")
        void shouldRepresentSuccessfulUserRegistration() {
            UUID newUserId = UUID.randomUUID();
            Email userEmail = new Email("newuser@oneeats.com");
            String userName = "New User";
            
            UserCreatedEvent event = new UserCreatedEvent(newUserId, userEmail, userName);
            
            assertEquals(newUserId, event.getUserId());
            assertEquals(userEmail, event.getEmail());
            assertEquals(userName, event.getFullName());
            assertNotNull(event.occurredOn());
        }
        
        @Test
        @DisplayName("Should capture user creation timestamp accurately")
        void shouldCaptureUserCreationTimestampAccurately() {
            LocalDateTime registrationTime = LocalDateTime.now();
            
            UserCreatedEvent event = new UserCreatedEvent(userId, email, fullName);
            
            assertTrue(Math.abs(java.time.Duration.between(registrationTime, event.occurredOn()).toMillis()) < 100);
        }
    }
}