package com.oneeats.order.domain.event;

import com.oneeats.order.domain.model.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("OrderStatusChangedEvent Tests")
class OrderStatusChangedEventTest {
    
    private UUID orderId;
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    
    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        previousStatus = OrderStatus.PENDING;
        newStatus = OrderStatus.CONFIRMED;
    }
    
    @Nested
    @DisplayName("Event Creation")
    class EventCreation {
        
        @Test
        @DisplayName("Should create event with valid data")
        void shouldCreateEventWithValidData() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            OrderStatusChangedEvent event = new OrderStatusChangedEvent(orderId, previousStatus, newStatus);
            
            LocalDateTime afterCreation = LocalDateTime.now();
            
            assertNotNull(event);
            assertEquals(orderId, event.getOrderId());
            assertEquals(previousStatus, event.getPreviousStatus());
            assertEquals(newStatus, event.getNewStatus());
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation.minusSeconds(1)));
            assertTrue(event.occurredOn().isBefore(afterCreation.plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should set occurrence time automatically")
        void shouldSetOccurrenceTimeAutomatically() {
            LocalDateTime beforeCreation = LocalDateTime.now();
            
            OrderStatusChangedEvent event = new OrderStatusChangedEvent(orderId, previousStatus, newStatus);
            
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn().isAfter(beforeCreation) || event.occurredOn().isEqual(beforeCreation));
            assertTrue(event.occurredOn().isBefore(LocalDateTime.now().plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should handle null values gracefully")
        void shouldHandleNullValuesGracefully() {
            // The event constructor should accept null values without throwing exceptions
            assertDoesNotThrow(() -> new OrderStatusChangedEvent(null, null, null));
            assertDoesNotThrow(() -> new OrderStatusChangedEvent(orderId, null, newStatus));
            assertDoesNotThrow(() -> new OrderStatusChangedEvent(orderId, previousStatus, null));
        }
    }
    
    @Nested
    @DisplayName("Event Properties")
    class EventProperties {
        
        private OrderStatusChangedEvent event;
        
        @BeforeEach
        void setUp() {
            event = new OrderStatusChangedEvent(orderId, previousStatus, newStatus);
        }
        
        @Test
        @DisplayName("Should return correct order ID")
        void shouldReturnCorrectOrderId() {
            assertEquals(orderId, event.getOrderId());
        }
        
        @Test
        @DisplayName("Should return correct previous status")
        void shouldReturnCorrectPreviousStatus() {
            assertEquals(previousStatus, event.getPreviousStatus());
        }
        
        @Test
        @DisplayName("Should return correct new status")
        void shouldReturnCorrectNewStatus() {
            assertEquals(newStatus, event.getNewStatus());
        }
        
        @Test
        @DisplayName("Should return occurrence time")
        void shouldReturnOccurrenceTime() {
            assertNotNull(event.occurredOn());
            assertTrue(event.occurredOn() instanceof LocalDateTime);
        }
    }
    
    @Nested
    @DisplayName("Status Transitions")
    class StatusTransitions {
        
        @Test
        @DisplayName("Should handle all valid status transitions")
        void shouldHandleAllValidStatusTransitions() {
            // Test PENDING to CONFIRMED
            OrderStatusChangedEvent event1 = new OrderStatusChangedEvent(orderId, OrderStatus.PENDING, OrderStatus.CONFIRMED);
            assertEquals(OrderStatus.PENDING, event1.getPreviousStatus());
            assertEquals(OrderStatus.CONFIRMED, event1.getNewStatus());
            
            // Test CONFIRMED to PREPARING
            OrderStatusChangedEvent event2 = new OrderStatusChangedEvent(orderId, OrderStatus.CONFIRMED, OrderStatus.PREPARING);
            assertEquals(OrderStatus.CONFIRMED, event2.getPreviousStatus());
            assertEquals(OrderStatus.PREPARING, event2.getNewStatus());
            
            // Test PREPARING to READY
            OrderStatusChangedEvent event3 = new OrderStatusChangedEvent(orderId, OrderStatus.PREPARING, OrderStatus.READY);
            assertEquals(OrderStatus.PREPARING, event3.getPreviousStatus());
            assertEquals(OrderStatus.READY, event3.getNewStatus());
            
            // Test READY to COMPLETED
            OrderStatusChangedEvent event4 = new OrderStatusChangedEvent(orderId, OrderStatus.READY, OrderStatus.COMPLETED);
            assertEquals(OrderStatus.READY, event4.getPreviousStatus());
            assertEquals(OrderStatus.COMPLETED, event4.getNewStatus());
            
            // Test any status to CANCELLED
            OrderStatusChangedEvent event5 = new OrderStatusChangedEvent(orderId, OrderStatus.PREPARING, OrderStatus.CANCELLED);
            assertEquals(OrderStatus.PREPARING, event5.getPreviousStatus());
            assertEquals(OrderStatus.CANCELLED, event5.getNewStatus());
            
            // Test CANCELLED to PENDING (reactivation)
            OrderStatusChangedEvent event6 = new OrderStatusChangedEvent(orderId, OrderStatus.CANCELLED, OrderStatus.PENDING);
            assertEquals(OrderStatus.CANCELLED, event6.getPreviousStatus());
            assertEquals(OrderStatus.PENDING, event6.getNewStatus());
        }
        
        @Test
        @DisplayName("Should handle same status transition")
        void shouldHandleSameStatusTransition() {
            OrderStatusChangedEvent event = new OrderStatusChangedEvent(orderId, OrderStatus.PENDING, OrderStatus.PENDING);
            
            assertEquals(OrderStatus.PENDING, event.getPreviousStatus());
            assertEquals(OrderStatus.PENDING, event.getNewStatus());
        }
        
        @Test
        @DisplayName("Should handle invalid status transitions")
        void shouldHandleInvalidStatusTransitions() {
            // The event itself doesn't validate transitions - that's the domain's responsibility
            // It should still capture what was requested
            OrderStatusChangedEvent event = new OrderStatusChangedEvent(orderId, OrderStatus.COMPLETED, OrderStatus.PENDING);
            
            assertEquals(OrderStatus.COMPLETED, event.getPreviousStatus());
            assertEquals(OrderStatus.PENDING, event.getNewStatus());
        }
    }
    
    @Nested
    @DisplayName("Event Immutability")
    class EventImmutability {
        
        @Test
        @DisplayName("Should be immutable after creation")
        void shouldBeImmutableAfterCreation() {
            OrderStatusChangedEvent event = new OrderStatusChangedEvent(orderId, previousStatus, newStatus);
            
            // Verify that getters return the same values consistently
            UUID originalOrderId = event.getOrderId();
            OrderStatus originalPreviousStatus = event.getPreviousStatus();
            OrderStatus originalNewStatus = event.getNewStatus();
            LocalDateTime originalOccurredOn = event.occurredOn();
            
            // Call getters multiple times and verify consistency
            assertEquals(originalOrderId, event.getOrderId());
            assertEquals(originalPreviousStatus, event.getPreviousStatus());
            assertEquals(originalNewStatus, event.getNewStatus());
            assertEquals(originalOccurredOn, event.occurredOn());
        }
        
        @Test
        @DisplayName("Should maintain occurrence time consistency")
        void shouldMaintainOccurrenceTimeConsistency() {
            OrderStatusChangedEvent event = new OrderStatusChangedEvent(orderId, previousStatus, newStatus);
            
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
    @DisplayName("Event with Edge Cases")
    class EventWithEdgeCases {
        
        @Test
        @DisplayName("Should handle all status enum values")
        void shouldHandleAllStatusEnumValues() {
            OrderStatus[] allStatuses = OrderStatus.values();
            
            for (OrderStatus from : allStatuses) {
                for (OrderStatus to : allStatuses) {
                    OrderStatusChangedEvent event = new OrderStatusChangedEvent(orderId, from, to);
                    
                    assertEquals(from, event.getPreviousStatus());
                    assertEquals(to, event.getNewStatus());
                    assertNotNull(event.occurredOn());
                }
            }
        }
        
        @Test
        @DisplayName("Should work with different order IDs")
        void shouldWorkWithDifferentOrderIds() {
            UUID[] orderIds = {
                UUID.randomUUID(),
                UUID.randomUUID(),
                UUID.randomUUID()
            };
            
            for (UUID id : orderIds) {
                OrderStatusChangedEvent event = new OrderStatusChangedEvent(id, previousStatus, newStatus);
                assertEquals(id, event.getOrderId());
            }
        }
    }
    
    @Nested
    @DisplayName("Multiple Events Comparison")
    class MultipleEventsComparison {
        
        @Test
        @DisplayName("Should create events with different occurrence times")
        void shouldCreateEventsWithDifferentOccurrenceTimes() throws InterruptedException {
            OrderStatusChangedEvent event1 = new OrderStatusChangedEvent(orderId, previousStatus, newStatus);
            
            Thread.sleep(10); // Ensure different timestamps
            
            OrderStatusChangedEvent event2 = new OrderStatusChangedEvent(
                UUID.randomUUID(), OrderStatus.CONFIRMED, OrderStatus.PREPARING);
            
            assertTrue(event2.occurredOn().isAfter(event1.occurredOn()));
        }
        
        @Test
        @DisplayName("Should create independent event instances")
        void shouldCreateIndependentEventInstances() {
            OrderStatusChangedEvent event1 = new OrderStatusChangedEvent(orderId, previousStatus, newStatus);
            OrderStatusChangedEvent event2 = new OrderStatusChangedEvent(orderId, previousStatus, newStatus);
            
            // Events should be different instances even with same data
            assertNotSame(event1, event2);
            
            // But they should have the same data (except possibly occurrence time due to timing)
            assertEquals(event1.getOrderId(), event2.getOrderId());
            assertEquals(event1.getPreviousStatus(), event2.getPreviousStatus());
            assertEquals(event1.getNewStatus(), event2.getNewStatus());
        }
        
        @Test
        @DisplayName("Should track multiple status changes for same order")
        void shouldTrackMultipleStatusChangesForSameOrder() {
            UUID sameOrderId = UUID.randomUUID();
            
            OrderStatusChangedEvent event1 = new OrderStatusChangedEvent(
                sameOrderId, OrderStatus.PENDING, OrderStatus.CONFIRMED);
            OrderStatusChangedEvent event2 = new OrderStatusChangedEvent(
                sameOrderId, OrderStatus.CONFIRMED, OrderStatus.PREPARING);
            OrderStatusChangedEvent event3 = new OrderStatusChangedEvent(
                sameOrderId, OrderStatus.PREPARING, OrderStatus.READY);
            
            // All events should have the same order ID but different status changes
            assertEquals(sameOrderId, event1.getOrderId());
            assertEquals(sameOrderId, event2.getOrderId());
            assertEquals(sameOrderId, event3.getOrderId());
            
            // Verify the status change sequence
            assertEquals(OrderStatus.PENDING, event1.getPreviousStatus());
            assertEquals(OrderStatus.CONFIRMED, event1.getNewStatus());
            
            assertEquals(OrderStatus.CONFIRMED, event2.getPreviousStatus());
            assertEquals(OrderStatus.PREPARING, event2.getNewStatus());
            
            assertEquals(OrderStatus.PREPARING, event3.getPreviousStatus());
            assertEquals(OrderStatus.READY, event3.getNewStatus());
        }
    }
}