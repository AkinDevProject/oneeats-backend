package com.oneeats.order.domain.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("OrderStatus Enum Tests")
class OrderStatusTest {
    
    @Nested
    @DisplayName("Status Descriptions")
    class StatusDescriptions {
        
        @Test
        @DisplayName("Should have correct descriptions")
        void shouldHaveCorrectDescriptions() {
            assertEquals("Pending confirmation", OrderStatus.PENDING.getDescription());
            assertEquals("Confirmed", OrderStatus.CONFIRMED.getDescription());
            assertEquals("Being prepared", OrderStatus.PREPARING.getDescription());
            assertEquals("Ready for pickup", OrderStatus.READY.getDescription());
            assertEquals("Completed", OrderStatus.COMPLETED.getDescription());
            assertEquals("Cancelled", OrderStatus.CANCELLED.getDescription());
        }
    }
    
    @Nested
    @DisplayName("Status Transitions")
    class StatusTransitions {
        
        @Test
        @DisplayName("PENDING should allow transition to CONFIRMED, PREPARING, CANCELLED")
        void pendingShouldAllowCorrectTransitions() {
            Set<OrderStatus> allowed = OrderStatus.PENDING.getAllowedTransitions();
            assertEquals(3, allowed.size());
            assertTrue(allowed.contains(OrderStatus.CONFIRMED));
            assertTrue(allowed.contains(OrderStatus.PREPARING));
            assertTrue(allowed.contains(OrderStatus.CANCELLED));
            
            assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.CONFIRMED));
            assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.PREPARING));
            assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.CANCELLED));
            assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.READY));
            assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.COMPLETED));
        }
        
        @Test
        @DisplayName("CONFIRMED should allow transition to PREPARING, CANCELLED")
        void confirmedShouldAllowCorrectTransitions() {
            Set<OrderStatus> allowed = OrderStatus.CONFIRMED.getAllowedTransitions();
            assertEquals(2, allowed.size());
            assertTrue(allowed.contains(OrderStatus.PREPARING));
            assertTrue(allowed.contains(OrderStatus.CANCELLED));
            
            assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PREPARING));
            assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.CANCELLED));
            assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PENDING));
            assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.READY));
        }
        
        @Test
        @DisplayName("PREPARING should allow transition to READY, CANCELLED")
        void preparingShouldAllowCorrectTransitions() {
            Set<OrderStatus> allowed = OrderStatus.PREPARING.getAllowedTransitions();
            assertEquals(2, allowed.size());
            assertTrue(allowed.contains(OrderStatus.READY));
            assertTrue(allowed.contains(OrderStatus.CANCELLED));
            
            assertTrue(OrderStatus.PREPARING.canTransitionTo(OrderStatus.READY));
            assertTrue(OrderStatus.PREPARING.canTransitionTo(OrderStatus.CANCELLED));
            assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.CONFIRMED));
            assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.COMPLETED));
        }
        
        @Test
        @DisplayName("READY should allow transition to COMPLETED, CANCELLED")
        void readyShouldAllowCorrectTransitions() {
            Set<OrderStatus> allowed = OrderStatus.READY.getAllowedTransitions();
            assertEquals(2, allowed.size());
            assertTrue(allowed.contains(OrderStatus.COMPLETED));
            assertTrue(allowed.contains(OrderStatus.CANCELLED));
            
            assertTrue(OrderStatus.READY.canTransitionTo(OrderStatus.COMPLETED));
            assertTrue(OrderStatus.READY.canTransitionTo(OrderStatus.CANCELLED));
            assertFalse(OrderStatus.READY.canTransitionTo(OrderStatus.PREPARING));
        }
        
        @Test
        @DisplayName("COMPLETED should not allow any transitions")
        void completedShouldNotAllowTransitions() {
            Set<OrderStatus> allowed = OrderStatus.COMPLETED.getAllowedTransitions();
            assertTrue(allowed.isEmpty());
            
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.PENDING));
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.CANCELLED));
            assertTrue(OrderStatus.COMPLETED.isFinal());
        }
        
        @Test
        @DisplayName("CANCELLED should allow transition to PENDING (reactivate)")
        void cancelledShouldAllowTransitionToPending() {
            Set<OrderStatus> allowed = OrderStatus.CANCELLED.getAllowedTransitions();
            assertEquals(1, allowed.size());
            assertTrue(allowed.contains(OrderStatus.PENDING));
            
            assertTrue(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.PENDING));
            assertFalse(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.CONFIRMED));
        }
    }
    
    @Nested
    @DisplayName("Status Properties")
    class StatusProperties {
        
        @Test
        @DisplayName("Should identify final statuses correctly")
        void shouldIdentifyFinalStatusesCorrectly() {
            assertTrue(OrderStatus.COMPLETED.isFinal());
            assertFalse(OrderStatus.PENDING.isFinal());
            assertFalse(OrderStatus.CONFIRMED.isFinal());
            assertFalse(OrderStatus.PREPARING.isFinal());
            assertFalse(OrderStatus.READY.isFinal());
            assertFalse(OrderStatus.CANCELLED.isFinal());
        }
        
        @Test
        @DisplayName("Should identify cancellable statuses correctly")
        void shouldIdentifyCancellableStatusesCorrectly() {
            assertTrue(OrderStatus.PENDING.canBeCancelled());
            assertTrue(OrderStatus.CONFIRMED.canBeCancelled());
            assertTrue(OrderStatus.PREPARING.canBeCancelled());
            assertTrue(OrderStatus.READY.canBeCancelled());
            assertFalse(OrderStatus.COMPLETED.canBeCancelled());
            assertFalse(OrderStatus.CANCELLED.canBeCancelled());
        }
    }
    
    @Nested
    @DisplayName("Invalid Transition Exception")
    class InvalidTransitionException {
        
        @Test
        @DisplayName("Should create exception with correct message")
        void shouldCreateExceptionWithCorrectMessage() {
            OrderStatus.InvalidTransitionException exception = 
                new OrderStatus.InvalidTransitionException(OrderStatus.COMPLETED, OrderStatus.PENDING);
            
            String expectedMessage = "Transition invalide de 'Completed' vers 'Pending confirmation'";
            assertEquals(expectedMessage, exception.getMessage());
        }
        
        @Test
        @DisplayName("Should be a RuntimeException")
        void shouldBeARuntimeException() {
            OrderStatus.InvalidTransitionException exception = 
                new OrderStatus.InvalidTransitionException(OrderStatus.COMPLETED, OrderStatus.PENDING);
            
            assertTrue(exception instanceof RuntimeException);
        }
    }
}