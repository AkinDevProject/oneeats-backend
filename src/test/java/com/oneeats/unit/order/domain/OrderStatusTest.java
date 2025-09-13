package com.oneeats.unit.order.domain;

import com.oneeats.order.domain.model.OrderStatus;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES ORDERSTATUS - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'enum OrderStatus
 */
@DisplayName("OrderStatus Unit Tests - Pure Domain Logic")
class OrderStatusTest {
    
    @Nested
    @DisplayName("Status Properties")
    class StatusProperties {
        
        @Test
        @DisplayName("Should have correct descriptions")
        void shouldHaveCorrectDescriptions() {
            // When & Then
            assertEquals("Pending confirmation", OrderStatus.PENDING.getDescription());
            assertEquals("Confirmed", OrderStatus.CONFIRMED.getDescription());
            assertEquals("Being prepared", OrderStatus.PREPARING.getDescription());
            assertEquals("Ready for pickup", OrderStatus.READY.getDescription());
            assertEquals("Completed", OrderStatus.COMPLETED.getDescription());
            assertEquals("Cancelled", OrderStatus.CANCELLED.getDescription());
        }
        
        @Test
        @DisplayName("Should identify final statuses")
        void shouldIdentifyFinalStatuses() {
            // Then - Final statuses
            assertTrue(OrderStatus.COMPLETED.isFinal());
            
            // Non-final statuses
            assertFalse(OrderStatus.PENDING.isFinal());
            assertFalse(OrderStatus.CONFIRMED.isFinal());
            assertFalse(OrderStatus.PREPARING.isFinal());
            assertFalse(OrderStatus.READY.isFinal());
            assertFalse(OrderStatus.CANCELLED.isFinal()); // Can go back to PENDING
        }
        
        @Test
        @DisplayName("Should identify cancellable statuses")
        void shouldIdentifyCancellableStatuses() {
            // Then - Cancellable statuses
            assertTrue(OrderStatus.PENDING.canBeCancelled());
            assertTrue(OrderStatus.CONFIRMED.canBeCancelled());
            assertTrue(OrderStatus.PREPARING.canBeCancelled());
            assertTrue(OrderStatus.READY.canBeCancelled());
            
            // Non-cancellable statuses
            assertFalse(OrderStatus.COMPLETED.canBeCancelled());
            assertFalse(OrderStatus.CANCELLED.canBeCancelled());
        }
    }
    
    @Nested
    @DisplayName("Status Transitions - PENDING")
    class StatusTransitionsPending {
        
        @Test
        @DisplayName("PENDING should allow transition to CONFIRMED, PREPARING, CANCELLED")
        void pendingShouldAllowTransitionToConfirmedPreparingCancelled() {
            // When
            Set<OrderStatus> allowedTransitions = OrderStatus.PENDING.getAllowedTransitions();
            
            // Then
            assertEquals(3, allowedTransitions.size());
            assertTrue(allowedTransitions.contains(OrderStatus.CONFIRMED));
            assertTrue(allowedTransitions.contains(OrderStatus.PREPARING));
            assertTrue(allowedTransitions.contains(OrderStatus.CANCELLED));
        }
        
        @Test
        @DisplayName("PENDING should validate valid transitions")
        void pendingShouldValidateValidTransitions() {
            // When & Then - Valid transitions
            assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.CONFIRMED));
            assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.PREPARING));
            assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.CANCELLED));
            
            // Invalid transitions
            assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.READY));
            assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.COMPLETED));
            assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.PENDING)); // Self-transition
        }
    }
    
    @Nested
    @DisplayName("Status Transitions - CONFIRMED")
    class StatusTransitionsConfirmed {
        
        @Test
        @DisplayName("CONFIRMED should allow transition to PREPARING, CANCELLED")
        void confirmedShouldAllowTransitionToPreparingCancelled() {
            // When
            Set<OrderStatus> allowedTransitions = OrderStatus.CONFIRMED.getAllowedTransitions();
            
            // Then
            assertEquals(2, allowedTransitions.size());
            assertTrue(allowedTransitions.contains(OrderStatus.PREPARING));
            assertTrue(allowedTransitions.contains(OrderStatus.CANCELLED));
        }
        
        @Test
        @DisplayName("CONFIRMED should validate valid transitions")
        void confirmedShouldValidateValidTransitions() {
            // When & Then - Valid transitions
            assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PREPARING));
            assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.CANCELLED));
            
            // Invalid transitions
            assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PENDING));
            assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.READY));
            assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.COMPLETED));
        }
    }
    
    @Nested
    @DisplayName("Status Transitions - PREPARING")
    class StatusTransitionsPreparing {
        
        @Test
        @DisplayName("PREPARING should allow transition to READY, CANCELLED")
        void preparingShouldAllowTransitionToReadyCancelled() {
            // When
            Set<OrderStatus> allowedTransitions = OrderStatus.PREPARING.getAllowedTransitions();
            
            // Then
            assertEquals(2, allowedTransitions.size());
            assertTrue(allowedTransitions.contains(OrderStatus.READY));
            assertTrue(allowedTransitions.contains(OrderStatus.CANCELLED));
        }
        
        @Test
        @DisplayName("PREPARING should validate valid transitions")
        void preparingShouldValidateValidTransitions() {
            // When & Then - Valid transitions
            assertTrue(OrderStatus.PREPARING.canTransitionTo(OrderStatus.READY));
            assertTrue(OrderStatus.PREPARING.canTransitionTo(OrderStatus.CANCELLED));
            
            // Invalid transitions
            assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.PENDING));
            assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.CONFIRMED));
            assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.COMPLETED));
        }
    }
    
    @Nested
    @DisplayName("Status Transitions - READY")
    class StatusTransitionsReady {
        
        @Test
        @DisplayName("READY should allow transition to COMPLETED, CANCELLED")
        void readyShouldAllowTransitionToCompletedCancelled() {
            // When
            Set<OrderStatus> allowedTransitions = OrderStatus.READY.getAllowedTransitions();
            
            // Then
            assertEquals(2, allowedTransitions.size());
            assertTrue(allowedTransitions.contains(OrderStatus.COMPLETED));
            assertTrue(allowedTransitions.contains(OrderStatus.CANCELLED));
        }
        
        @Test
        @DisplayName("READY should validate valid transitions")
        void readyShouldValidateValidTransitions() {
            // When & Then - Valid transitions
            assertTrue(OrderStatus.READY.canTransitionTo(OrderStatus.COMPLETED));
            assertTrue(OrderStatus.READY.canTransitionTo(OrderStatus.CANCELLED));
            
            // Invalid transitions
            assertFalse(OrderStatus.READY.canTransitionTo(OrderStatus.PENDING));
            assertFalse(OrderStatus.READY.canTransitionTo(OrderStatus.CONFIRMED));
            assertFalse(OrderStatus.READY.canTransitionTo(OrderStatus.PREPARING));
        }
    }
    
    @Nested
    @DisplayName("Status Transitions - COMPLETED")
    class StatusTransitionsCompleted {
        
        @Test
        @DisplayName("COMPLETED should allow no transitions (final state)")
        void completedShouldAllowNoTransitions() {
            // When
            Set<OrderStatus> allowedTransitions = OrderStatus.COMPLETED.getAllowedTransitions();
            
            // Then
            assertTrue(allowedTransitions.isEmpty());
            assertTrue(OrderStatus.COMPLETED.isFinal());
        }
        
        @Test
        @DisplayName("COMPLETED should validate no transitions allowed")
        void completedShouldValidateNoTransitionsAllowed() {
            // When & Then - All transitions should be invalid
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.PENDING));
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.CONFIRMED));
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.PREPARING));
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.READY));
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.CANCELLED));
        }
    }
    
    @Nested
    @DisplayName("Status Transitions - CANCELLED")
    class StatusTransitionsCancelled {
        
        @Test
        @DisplayName("CANCELLED should allow transition back to PENDING")
        void cancelledShouldAllowTransitionBackToPending() {
            // When
            Set<OrderStatus> allowedTransitions = OrderStatus.CANCELLED.getAllowedTransitions();
            
            // Then
            assertEquals(1, allowedTransitions.size());
            assertTrue(allowedTransitions.contains(OrderStatus.PENDING));
        }
        
        @Test
        @DisplayName("CANCELLED should validate only PENDING transition")
        void cancelledShouldValidateOnlyPendingTransition() {
            // When & Then - Valid transition
            assertTrue(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.PENDING));
            
            // Invalid transitions
            assertFalse(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.CONFIRMED));
            assertFalse(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.PREPARING));
            assertFalse(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.READY));
            assertFalse(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.COMPLETED));
        }
    }
    
    @Nested
    @DisplayName("Business Logic Validation")
    class BusinessLogicValidation {
        
        @Test
        @DisplayName("Should validate complete order lifecycle")
        void shouldValidateCompleteOrderLifecycle() {
            // When & Then - Normal flow: PENDING → CONFIRMED → PREPARING → READY → COMPLETED
            assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.CONFIRMED));
            assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PREPARING));
            assertTrue(OrderStatus.PREPARING.canTransitionTo(OrderStatus.READY));
            assertTrue(OrderStatus.READY.canTransitionTo(OrderStatus.COMPLETED));
        }
        
        @Test
        @DisplayName("Should validate fast-track flow")
        void shouldValidateFastTrackFlow() {
            // When & Then - Fast flow: PENDING → PREPARING → READY → COMPLETED
            assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.PREPARING));
            assertTrue(OrderStatus.PREPARING.canTransitionTo(OrderStatus.READY));
            assertTrue(OrderStatus.READY.canTransitionTo(OrderStatus.COMPLETED));
        }
        
        @Test
        @DisplayName("Should validate cancellation at any stage")
        void shouldValidateCancellationAtAnyStage() {
            // When & Then - Can cancel from any active status
            assertTrue(OrderStatus.PENDING.canTransitionTo(OrderStatus.CANCELLED));
            assertTrue(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.CANCELLED));
            assertTrue(OrderStatus.PREPARING.canTransitionTo(OrderStatus.CANCELLED));
            assertTrue(OrderStatus.READY.canTransitionTo(OrderStatus.CANCELLED));
            
            // Cannot cancel when already completed
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.CANCELLED));
        }
        
        @Test
        @DisplayName("Should validate order reactivation from cancelled")
        void shouldValidateOrderReactivationFromCancelled() {
            // When & Then - Can reactivate cancelled orders
            assertTrue(OrderStatus.CANCELLED.canTransitionTo(OrderStatus.PENDING));
            
            // But cannot reactivate completed orders
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.PENDING));
        }
        
        @Test
        @DisplayName("Should prevent backwards transitions in normal flow")
        void shouldPreventBackwardsTransitionsInNormalFlow() {
            // When & Then - Cannot go backwards in normal flow
            assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.PENDING));
            assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.CONFIRMED));
            assertFalse(OrderStatus.READY.canTransitionTo(OrderStatus.PREPARING));
            assertFalse(OrderStatus.COMPLETED.canTransitionTo(OrderStatus.READY));
        }
        
        @Test
        @DisplayName("Should prevent skipping statuses inappropriately")
        void shouldPreventSkippingStatusesInappropriately() {
            // When & Then - Cannot skip too many statuses
            assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.READY));
            assertFalse(OrderStatus.PENDING.canTransitionTo(OrderStatus.COMPLETED));
            assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.READY));
            assertFalse(OrderStatus.CONFIRMED.canTransitionTo(OrderStatus.COMPLETED));
            assertFalse(OrderStatus.PREPARING.canTransitionTo(OrderStatus.COMPLETED));
        }
    }
    
    @Nested
    @DisplayName("Invalid Transition Exception")
    class InvalidTransitionException {
        
        @Test
        @DisplayName("Should create exception with descriptive message")
        void shouldCreateExceptionWithDescriptiveMessage() {
            // When
            OrderStatus.InvalidTransitionException exception = 
                new OrderStatus.InvalidTransitionException(OrderStatus.COMPLETED, OrderStatus.PENDING);
            
            // Then
            assertNotNull(exception.getMessage());
            assertTrue(exception.getMessage().contains("Completed"));
            assertTrue(exception.getMessage().contains("Pending confirmation"));
            assertTrue(exception.getMessage().contains("Transition invalide"));
        }
        
        @Test
        @DisplayName("Should be a runtime exception")
        void shouldBeARuntimeException() {
            // When
            OrderStatus.InvalidTransitionException exception = 
                new OrderStatus.InvalidTransitionException(OrderStatus.READY, OrderStatus.PENDING);
            
            // Then
            assertTrue(exception instanceof RuntimeException);
        }
    }
    
    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {
        
        @Test
        @DisplayName("Should handle null transitions gracefully")
        void shouldHandleNullTransitionsGracefully() {
            // When & Then - Should not crash on null
            assertDoesNotThrow(() -> {
                for (OrderStatus status : OrderStatus.values()) {
                    assertFalse(status.canTransitionTo(null));
                }
            });
        }
        
        @Test
        @DisplayName("Should handle self-transitions")
        void shouldHandleSelfTransitions() {
            // When & Then - Self-transitions should generally not be allowed
            for (OrderStatus status : OrderStatus.values()) {
                assertFalse(status.canTransitionTo(status), 
                    "Self-transition should not be allowed for " + status);
            }
        }
        
        @Test
        @DisplayName("Should validate all statuses have descriptions")
        void shouldValidateAllStatusesHaveDescriptions() {
            // When & Then
            for (OrderStatus status : OrderStatus.values()) {
                assertNotNull(status.getDescription());
                assertFalse(status.getDescription().isEmpty());
            }
        }
        
        @Test
        @DisplayName("Should validate all statuses have defined transitions")
        void shouldValidateAllStatusesHaveDefinedTransitions() {
            // When & Then
            for (OrderStatus status : OrderStatus.values()) {
                assertNotNull(status.getAllowedTransitions());
                // Note: Some statuses like COMPLETED may have empty transitions, which is valid
            }
        }
    }
}