package com.oneeats.order.domain.event;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("OrderCreatedEvent Tests")
class OrderCreatedEventTest {
    
    private UUID orderId;
    private String orderNumber;
    private UUID userId;
    private UUID restaurantId;
    
    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        orderNumber = "ORD-20230101120000-123";
        userId = UUID.randomUUID();
        restaurantId = UUID.randomUUID();
    }
    
    @Nested
    @DisplayName("Event Creation")
    class EventCreation {
        
        @Test
        @DisplayName("Should create event with valid data")
        void shouldCreateEventWithValidData() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            OrderCreatedEvent event = new OrderCreatedEvent(orderId, orderNumber, userId, restaurantId);
            
            LocalDateTime afterCreation = LocalDateTime.now();
            
            assertNotNull(event);
            assertEquals(orderId, event.getOrderId());
            assertEquals(orderNumber, event.getOrderNumber());
            assertEquals(userId, event.getUserId());
            assertEquals(restaurantId, event.getRestaurantId());
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation.minusSeconds(1)));
            assertTrue(event.occurredOn().isBefore(afterCreation.plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should set occurrence time automatically")
        void shouldSetOccurrenceTimeAutomatically() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            OrderCreatedEvent event = new OrderCreatedEvent(orderId, orderNumber, userId, restaurantId);
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation) || event.occurredOn().isEqual(beforeCreation));
            assertTrue(event.occurredOn().isBefore(LocalDateTime.now().plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should handle null values gracefully")
        void shouldHandleNullValuesGracefully() {
            // The event constructor should accept null values without throwing exceptions
            // This is a design decision - the event should capture what was provided
            assertDoesNotThrow(() -> new OrderCreatedEvent(null, null, null, null));
            assertDoesNotThrow(() -> new OrderCreatedEvent(orderId, null, userId, restaurantId));
            assertDoesNotThrow(() -> new OrderCreatedEvent(null, orderNumber, null, restaurantId));
        }
    }
    
    @Nested
    @DisplayName("Event Properties")
    class EventProperties {
        
        private OrderCreatedEvent event;
        
        @BeforeEach
        void setUp() {
            event = new OrderCreatedEvent(orderId, orderNumber, userId, restaurantId);
        }
        
        @Test
        @DisplayName("Should return correct order ID")
        void shouldReturnCorrectOrderId() {
            assertEquals(orderId, event.getOrderId());
        }
        
        @Test
        @DisplayName("Should return correct order number")
        void shouldReturnCorrectOrderNumber() {
            assertEquals(orderNumber, event.getOrderNumber());
        }
        
        @Test
        @DisplayName("Should return correct user ID")
        void shouldReturnCorrectUserId() {
            assertEquals(userId, event.getUserId());
        }
        
        @Test
        @DisplayName("Should return correct restaurant ID")
        void shouldReturnCorrectRestaurantId() {
            assertEquals(restaurantId, event.getRestaurantId());
        }
        
        @Test
        @DisplayName("Should return occurrence time")
        void shouldReturnOccurrenceTime() {
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn() instanceof LocalDateTime);
        }
    }
    
    @Nested
    @DisplayName("Event Immutability")
    class EventImmutability {
        
        @Test
        @DisplayName("Should be immutable after creation")
        void shouldBeImmutableAfterCreation() {
            OrderCreatedEvent event = new OrderCreatedEvent(orderId, orderNumber, userId, restaurantId);
            
            // Verify that getters return the same values consistently
            UUID originalOrderId = event.getOrderId();
            String originalOrderNumber = event.getOrderNumber();
            UUID originalUserId = event.getUserId();
            UUID originalRestaurantId = event.getRestaurantId();
            LocalDateTime originalOccurredOn = event.occurredOn();
            
            // Call getters multiple times and verify consistency
            assertEquals(originalOrderId, event.getOrderId());
            assertEquals(originalOrderNumber, event.getOrderNumber());
            assertEquals(originalUserId, event.getUserId());
            assertEquals(originalRestaurantId, event.getRestaurantId());
            assertEquals(originalOccurredOn, event.occurredOn());
        }
        
        @Test
        @DisplayName("Should maintain occurrence time consistency")
        void shouldMaintainOccurrenceTimeConsistency() {
            OrderCreatedEvent event = new OrderCreatedEvent(orderId, orderNumber, userId, restaurantId);
            
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
        @DisplayName("Should handle empty order number")
        void shouldHandleEmptyOrderNumber() {
            OrderCreatedEvent event = new OrderCreatedEvent(orderId, "", userId, restaurantId);
            
            assertEquals("", event.getOrderNumber());
        }
        
        @Test
        @DisplayName("Should handle very long order number")
        void shouldHandleVeryLongOrderNumber() {
            String longOrderNumber = "ORD-".repeat(100) + "VERY-LONG-ORDER-NUMBER-" + "123".repeat(50);
            
            OrderCreatedEvent event = new OrderCreatedEvent(orderId, longOrderNumber, userId, restaurantId);
            
            assertEquals(longOrderNumber, event.getOrderNumber());
        }
        
        @Test
        @DisplayName("Should handle special characters in order number")
        void shouldHandleSpecialCharactersInOrderNumber() {
            String specialOrderNumber = "ORD-@#$%^&*()-2023-123";
            
            OrderCreatedEvent event = new OrderCreatedEvent(orderId, specialOrderNumber, userId, restaurantId);
            
            assertEquals(specialOrderNumber, event.getOrderNumber());
        }
    }
    
    @Nested
    @DisplayName("Multiple Events Comparison")
    class MultipleEventsComparison {
        
        @Test
        @DisplayName("Should create events with different occurrence times")
        void shouldCreateEventsWithDifferentOccurrenceTimes() throws InterruptedException {
            OrderCreatedEvent event1 = new OrderCreatedEvent(orderId, orderNumber, userId, restaurantId);
            
            Thread.sleep(10); // Ensure different timestamps
            
            OrderCreatedEvent event2 = new OrderCreatedEvent(
                UUID.randomUUID(), "ORD-20230101120001-124", 
                UUID.randomUUID(), UUID.randomUUID());
            
            assertTrue(event2.occurredOn().isAfter(event1.occurredOn()));
        }
        
        @Test
        @DisplayName("Should create independent event instances")
        void shouldCreateIndependentEventInstances() {
            OrderCreatedEvent event1 = new OrderCreatedEvent(orderId, orderNumber, userId, restaurantId);
            OrderCreatedEvent event2 = new OrderCreatedEvent(orderId, orderNumber, userId, restaurantId);
            
            // Events should be different instances even with same data
            assertNotSame(event1, event2);
            
            // But they should have the same data (except possibly occurrence time due to timing)
            assertEquals(event1.getOrderId(), event2.getOrderId());
            assertEquals(event1.getOrderNumber(), event2.getOrderNumber());
            assertEquals(event1.getUserId(), event2.getUserId());
            assertEquals(event1.getRestaurantId(), event2.getRestaurantId());
        }
    }
}