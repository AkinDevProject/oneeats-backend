package com.oneeats.notification.domain.event;

import com.oneeats.notification.domain.model.NotificationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("NotificationCreatedEvent Tests")
class NotificationCreatedEventTest {
    
    private UUID notificationId;
    private UUID recipientId;
    private NotificationType type;
    
    @BeforeEach
    void setUp() {
        notificationId = UUID.randomUUID();
        recipientId = UUID.randomUUID();
        type = NotificationType.ORDER_CONFIRMATION;
    }
    
    @Nested
    @DisplayName("Event Creation")
    class EventCreation {
        
        @Test
        @DisplayName("Should create event with valid data")
        void shouldCreateEventWithValidData() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            NotificationCreatedEvent event = new NotificationCreatedEvent(notificationId, recipientId, type);
            
            LocalDateTime afterCreation = LocalDateTime.now();
            
            assertNotNull(event);
            assertEquals(notificationId, event.getNotificationId());
            assertEquals(recipientId, event.getRecipientId());
            assertEquals(type, event.getType());
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation.minusSeconds(1)));
            assertTrue(event.occurredOn().isBefore(afterCreation.plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should set occurrence time automatically")
        void shouldSetOccurrenceTimeAutomatically() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            NotificationCreatedEvent event = new NotificationCreatedEvent(notificationId, recipientId, type);
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation) || event.occurredOn().isEqual(beforeCreation));
            assertTrue(event.occurredOn().isBefore(LocalDateTime.now().plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should handle null values gracefully")
        void shouldHandleNullValuesGracefully() {
            // The event constructor should accept null values without throwing exceptions
            assertDoesNotThrow(() -> new NotificationCreatedEvent(null, null, null));
            assertDoesNotThrow(() -> new NotificationCreatedEvent(notificationId, null, type));
            assertDoesNotThrow(() -> new NotificationCreatedEvent(null, recipientId, null));
        }
    }
    
    @Nested
    @DisplayName("Event Properties")
    class EventProperties {
        
        private NotificationCreatedEvent event;
        
        @BeforeEach
        void setUp() {
            event = new NotificationCreatedEvent(notificationId, recipientId, type);
        }
        
        @Test
        @DisplayName("Should return correct notification ID")
        void shouldReturnCorrectNotificationId() {
            assertEquals(notificationId, event.getNotificationId());
        }
        
        @Test
        @DisplayName("Should return correct recipient ID")
        void shouldReturnCorrectRecipientId() {
            assertEquals(recipientId, event.getRecipientId());
        }
        
        @Test
        @DisplayName("Should return correct notification type")
        void shouldReturnCorrectNotificationType() {
            assertEquals(type, event.getType());
        }
        
        @Test
        @DisplayName("Should return occurrence time")
        void shouldReturnOccurrenceTime() {
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn() instanceof LocalDateTime);
        }
    }
    
    @Nested
    @DisplayName("Event with Different Types")
    class EventWithDifferentTypes {
        
        @Test
        @DisplayName("Should handle ORDER_READY type")
        void shouldHandleOrderReadyType() {
            NotificationCreatedEvent event = new NotificationCreatedEvent(
                notificationId, recipientId, NotificationType.ORDER_READY);
            
            assertEquals(NotificationType.ORDER_READY, event.getType());
        }
        
        @Test
        @DisplayName("Should handle ORDER_CANCELLED type")
        void shouldHandleOrderCancelledType() {
            NotificationCreatedEvent event = new NotificationCreatedEvent(
                notificationId, recipientId, NotificationType.ORDER_CANCELLED);
            
            assertEquals(NotificationType.ORDER_CANCELLED, event.getType());
        }
        
        @Test
        @DisplayName("Should handle RESTAURANT_APPROVED type")
        void shouldHandleRestaurantApprovedType() {
            NotificationCreatedEvent event = new NotificationCreatedEvent(
                notificationId, recipientId, NotificationType.RESTAURANT_APPROVED);
            
            assertEquals(NotificationType.RESTAURANT_APPROVED, event.getType());
        }
        
        @Test
        @DisplayName("Should handle SYSTEM_ANNOUNCEMENT type")
        void shouldHandleSystemAnnouncementType() {
            NotificationCreatedEvent event = new NotificationCreatedEvent(
                notificationId, recipientId, NotificationType.SYSTEM_ANNOUNCEMENT);
            
            assertEquals(NotificationType.SYSTEM_ANNOUNCEMENT, event.getType());
        }
        
        @Test
        @DisplayName("Should handle all notification types")
        void shouldHandleAllNotificationTypes() {
            for (NotificationType notificationType : NotificationType.values()) {
                NotificationCreatedEvent event = new NotificationCreatedEvent(
                    notificationId, recipientId, notificationType);
                
                assertEquals(notificationType, event.getType());
                assertEquals(notificationId, event.getNotificationId());
                assertEquals(recipientId, event.getRecipientId());
            }
        }
    }
    
    @Nested
    @DisplayName("Event Immutability")
    class EventImmutability {
        
        @Test
        @DisplayName("Should be immutable after creation")
        void shouldBeImmutableAfterCreation() {
            NotificationCreatedEvent event = new NotificationCreatedEvent(notificationId, recipientId, type);
            
            // Verify that getters return the same values consistently
            UUID originalNotificationId = event.getNotificationId();
            UUID originalRecipientId = event.getRecipientId();
            NotificationType originalType = event.getType();
            LocalDateTime originalOccurredOn = event.occurredOn();
            
            // Call getters multiple times and verify consistency
            assertEquals(originalNotificationId, event.getNotificationId());
            assertEquals(originalRecipientId, event.getRecipientId());
            assertEquals(originalType, event.getType());
            assertEquals(originalOccurredOn, event.occurredOn());
        }
        
        @Test
        @DisplayName("Should maintain occurrence time consistency")
        void shouldMaintainOccurrenceTimeConsistency() {
            NotificationCreatedEvent event = new NotificationCreatedEvent(notificationId, recipientId, type);
            
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
        @DisplayName("Should handle different UUID formats")
        void shouldHandleDifferentUuidFormats() {
            UUID uuid1 = UUID.randomUUID();
            UUID uuid2 = UUID.randomUUID();
            UUID uuid3 = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
            UUID uuid4 = UUID.fromString("6ba7b810-9dad-11d1-80b4-00c04fd430c8");
            
            NotificationCreatedEvent event1 = new NotificationCreatedEvent(uuid1, uuid2, type);
            NotificationCreatedEvent event2 = new NotificationCreatedEvent(uuid3, uuid4, type);
            
            assertEquals(uuid1, event1.getNotificationId());
            assertEquals(uuid2, event1.getRecipientId());
            assertEquals(uuid3, event2.getNotificationId());
            assertEquals(uuid4, event2.getRecipientId());
        }
        
        @Test
        @DisplayName("Should handle same IDs for notification and recipient")
        void shouldHandleSameIdsForNotificationAndRecipient() {
            UUID sameId = UUID.randomUUID();
            
            NotificationCreatedEvent event = new NotificationCreatedEvent(sameId, sameId, type);
            
            assertEquals(sameId, event.getNotificationId());
            assertEquals(sameId, event.getRecipientId());
        }
    }
    
    @Nested
    @DisplayName("Multiple Events Comparison")
    class MultipleEventsComparison {
        
        @Test
        @DisplayName("Should create events with different occurrence times")
        void shouldCreateEventsWithDifferentOccurrenceTimes() throws InterruptedException {
            NotificationCreatedEvent event1 = new NotificationCreatedEvent(notificationId, recipientId, type);
            
            Thread.sleep(10); // Ensure different timestamps
            
            NotificationCreatedEvent event2 = new NotificationCreatedEvent(
                UUID.randomUUID(), 
                UUID.randomUUID(), 
                NotificationType.ORDER_READY);
            
            assertTrue(event2.occurredOn().isAfter(event1.occurredOn()));
        }
        
        @Test
        @DisplayName("Should create independent event instances")
        void shouldCreateIndependentEventInstances() {
            NotificationCreatedEvent event1 = new NotificationCreatedEvent(notificationId, recipientId, type);
            NotificationCreatedEvent event2 = new NotificationCreatedEvent(notificationId, recipientId, type);
            
            // Events should be different instances even with same data
            assertNotSame(event1, event2);
            
            // But they should have the same data (except possibly occurrence time due to timing)
            assertEquals(event1.getNotificationId(), event2.getNotificationId());
            assertEquals(event1.getRecipientId(), event2.getRecipientId());
            assertEquals(event1.getType(), event2.getType());
        }
    }
    
    @Nested
    @DisplayName("Event Order and Restaurant Context")
    class EventOrderAndRestaurantContext {
        
        @Test
        @DisplayName("Should handle order-related events")
        void shouldHandleOrderRelatedEvents() {
            UUID orderId = UUID.randomUUID();
            UUID customerId = UUID.randomUUID();
            
            NotificationCreatedEvent confirmationEvent = new NotificationCreatedEvent(
                orderId, customerId, NotificationType.ORDER_CONFIRMATION);
            NotificationCreatedEvent updateEvent = new NotificationCreatedEvent(
                orderId, customerId, NotificationType.ORDER_STATUS_UPDATE);
            NotificationCreatedEvent readyEvent = new NotificationCreatedEvent(
                orderId, customerId, NotificationType.ORDER_READY);
            
            assertEquals(NotificationType.ORDER_CONFIRMATION, confirmationEvent.getType());
            assertEquals(NotificationType.ORDER_STATUS_UPDATE, updateEvent.getType());
            assertEquals(NotificationType.ORDER_READY, readyEvent.getType());
            
            assertEquals(customerId, confirmationEvent.getRecipientId());
            assertEquals(customerId, updateEvent.getRecipientId());
            assertEquals(customerId, readyEvent.getRecipientId());
        }
        
        @Test
        @DisplayName("Should handle restaurant-related events")
        void shouldHandleRestaurantRelatedEvents() {
            UUID restaurantId = UUID.randomUUID();
            UUID ownerId = UUID.randomUUID();
            
            NotificationCreatedEvent approvedEvent = new NotificationCreatedEvent(
                restaurantId, ownerId, NotificationType.RESTAURANT_APPROVED);
            NotificationCreatedEvent rejectedEvent = new NotificationCreatedEvent(
                restaurantId, ownerId, NotificationType.RESTAURANT_REJECTED);
            
            assertEquals(NotificationType.RESTAURANT_APPROVED, approvedEvent.getType());
            assertEquals(NotificationType.RESTAURANT_REJECTED, rejectedEvent.getType());
            
            assertEquals(ownerId, approvedEvent.getRecipientId());
            assertEquals(ownerId, rejectedEvent.getRecipientId());
        }
        
        @Test
        @DisplayName("Should handle system-wide events")
        void shouldHandleSystemWideEvents() {
            UUID systemNotificationId = UUID.randomUUID();
            UUID userId = UUID.randomUUID();
            
            NotificationCreatedEvent systemEvent = new NotificationCreatedEvent(
                systemNotificationId, userId, NotificationType.SYSTEM_ANNOUNCEMENT);
            
            assertEquals(NotificationType.SYSTEM_ANNOUNCEMENT, systemEvent.getType());
            assertEquals(userId, systemEvent.getRecipientId());
            assertEquals(systemNotificationId, systemEvent.getNotificationId());
        }
    }
    
    @Nested
    @DisplayName("Event Temporal Properties")
    class EventTemporalProperties {
        
        @Test
        @DisplayName("Should create events within reasonable time bounds")
        void shouldCreateEventsWithinReasonableTimeBounds() {
            LocalDateTime before = LocalDateTime.now().minusSeconds(1);
            
            NotificationCreatedEvent event = new NotificationCreatedEvent(notificationId, recipientId, type);
            
            LocalDateTime after = LocalDateTime.now().plusSeconds(1);
            
            assertTrue(event.occurredOn().isAfter(before));
            assertTrue(event.occurredOn().isBefore(after));
        }
        
        @Test
        @DisplayName("Should maintain event ordering for sequential creation")
        void shouldMaintainEventOrderingForSequentialCreation() throws InterruptedException {
            NotificationCreatedEvent event1 = new NotificationCreatedEvent(
                UUID.randomUUID(), recipientId, NotificationType.ORDER_CONFIRMATION);
                
            Thread.sleep(1); // Minimal delay
            
            NotificationCreatedEvent event2 = new NotificationCreatedEvent(
                UUID.randomUUID(), recipientId, NotificationType.ORDER_STATUS_UPDATE);
                
            Thread.sleep(1); // Minimal delay
            
            NotificationCreatedEvent event3 = new NotificationCreatedEvent(
                UUID.randomUUID(), recipientId, NotificationType.ORDER_READY);
            
            assertTrue(event2.occurredOn().isAfter(event1.occurredOn()) || 
                event2.occurredOn().isEqual(event1.occurredOn()));
            assertTrue(event3.occurredOn().isAfter(event2.occurredOn()) || 
                event3.occurredOn().isEqual(event2.occurredOn()));
        }
    }
}