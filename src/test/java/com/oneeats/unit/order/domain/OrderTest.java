package com.oneeats.unit.order.domain;

import com.oneeats.order.domain.model.Order;
import com.oneeats.order.domain.model.OrderItem;
import com.oneeats.order.domain.model.OrderStatus;
import com.oneeats.shared.domain.vo.Money;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Currency;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES ORDER - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'entité Order
 */
@DisplayName("Order Unit Tests - Pure Domain Logic")
class OrderTest {
    
    private Order order;
    private UUID orderId;
    private UUID userId;
    private UUID restaurantId;
    private Money testAmount;
    
    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        userId = UUID.randomUUID();
        restaurantId = UUID.randomUUID();
        testAmount = new Money(new BigDecimal("25.50"), Currency.getInstance("EUR"));
        
        order = Order.create(
            "ORD-001",
            userId,
            restaurantId,
            testAmount,
            "Please make it spicy"
        );
    }
    
    @Nested
    @DisplayName("Order Creation")
    class OrderCreation {
        
        @Test
        @DisplayName("Should create order with factory method")
        void shouldCreateOrderWithFactoryMethod() {
            // When
            Order newOrder = Order.create(
                "ORD-002",
                userId,
                restaurantId,
                Money.euro(new BigDecimal("30.00")),
                "Extra sauce please"
            );
            
            // Then
            assertNotNull(newOrder);
            assertNotNull(newOrder.getId());
            assertEquals("ORD-002", newOrder.getOrderNumber());
            assertEquals(userId, newOrder.getUserId());
            assertEquals(restaurantId, newOrder.getRestaurantId());
            assertEquals(new BigDecimal("30.00"), newOrder.getTotalAmount().getAmount());
            assertEquals("Extra sauce please", newOrder.getSpecialInstructions());
            assertEquals(OrderStatus.PENDING, newOrder.getStatus());
            assertNotNull(newOrder.getCreatedAt());
            
            // Should have domain event
            assertFalse(newOrder.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should initialize with default values")
        void shouldInitializeWithDefaultValues() {
            // Then
            assertEquals(OrderStatus.PENDING, order.getStatus());
            assertNotNull(order.getCreatedAt());
            assertTrue(order.getItems().isEmpty());
            assertNull(order.getEstimatedPickupTime());
            assertNull(order.getActualPickupTime());
        }
        
        @Test
        @DisplayName("Should validate required fields during creation")
        void shouldValidateRequiredFieldsDuringCreation() {
            // When & Then - Null values should be handled properly
            assertDoesNotThrow(() -> Order.create(
                "ORD-VALID",
                userId,
                restaurantId,
                testAmount,
                null // Special instructions can be null
            ));
        }
    }
    
    @Nested
    @DisplayName("Order Status Management")
    class OrderStatusManagement {
        
        @Test
        @DisplayName("Should change status to CONFIRMED from PENDING")
        void shouldChangeStatusToConfirmedFromPending() {
            // Given
            assertEquals(OrderStatus.PENDING, order.getStatus());
            
            // When
            order.changeStatus(OrderStatus.CONFIRMED);
            
            // Then
            assertEquals(OrderStatus.CONFIRMED, order.getStatus());
            assertFalse(order.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should change status to READY and set estimated pickup time")
        void shouldChangeStatusToReadyAndSetEstimatedPickupTime() {
            // Given
            order.changeStatus(OrderStatus.PREPARING);
            assertNull(order.getEstimatedPickupTime());
            
            // When
            order.changeStatus(OrderStatus.READY);
            
            // Then
            assertEquals(OrderStatus.READY, order.getStatus());
            assertNotNull(order.getEstimatedPickupTime());
            assertTrue(order.getEstimatedPickupTime().isAfter(LocalDateTime.now().plusMinutes(4)));
        }
        
        @Test
        @DisplayName("Should change status to COMPLETED and set actual pickup time")
        void shouldChangeStatusToCompletedAndSetActualPickupTime() {
            // Given
            order.changeStatus(OrderStatus.READY);
            assertNull(order.getActualPickupTime());
            
            // When
            order.changeStatus(OrderStatus.COMPLETED);
            
            // Then
            assertEquals(OrderStatus.COMPLETED, order.getStatus());
            assertNotNull(order.getActualPickupTime());
            assertTrue(order.getActualPickupTime().isBefore(LocalDateTime.now().plusSeconds(1)));
        }
        
        @Test
        @DisplayName("Should validate status transitions with updateStatus")
        void shouldValidateStatusTransitionsWithUpdateStatus() {
            // Given
            assertEquals(OrderStatus.PENDING, order.getStatus());
            
            // When & Then - Valid transition
            assertDoesNotThrow(() -> order.updateStatus(OrderStatus.CONFIRMED));
            assertEquals(OrderStatus.CONFIRMED, order.getStatus());
            
            // Invalid transition should throw exception
            assertThrows(IllegalStateException.class, () -> 
                order.updateStatus(OrderStatus.COMPLETED)); // Can't go directly from CONFIRMED to COMPLETED
        }
        
        @Test
        @DisplayName("Should reject invalid status transitions")
        void shouldRejectInvalidStatusTransitions() {
            // Given
            order.changeStatus(OrderStatus.COMPLETED);
            
            // When & Then - Cannot change status from COMPLETED
            assertThrows(IllegalStateException.class, () ->
                order.updateStatus(OrderStatus.PENDING));
        }
    }
    
    @Nested
    @DisplayName("Order Items Management")
    class OrderItemsManagement {
        
        @Test
        @DisplayName("Should add item to order")
        void shouldAddItemToOrder() {
            // Given
            OrderItem item = OrderItem.create(
                UUID.randomUUID(),
                "Margherita Pizza",
                Money.euro(new BigDecimal("12.50")),
                2,
                "Extra cheese"
            );
            
            // When
            order.addItem(item);
            
            // Then
            assertEquals(1, order.getItems().size());
            assertEquals(item, order.getItems().get(0));
            assertEquals(order, item.getOrder());
        }
        
        @Test
        @DisplayName("Should remove item from order")
        void shouldRemoveItemFromOrder() {
            // Given
            OrderItem item = OrderItem.create(
                UUID.randomUUID(),
                "Pepperoni Pizza",
                Money.euro(new BigDecimal("14.00")),
                1,
                null
            );
            order.addItem(item);
            assertEquals(1, order.getItems().size());
            
            // When
            order.removeItem(item);
            
            // Then
            assertEquals(0, order.getItems().size());
            assertNull(item.getOrder());
        }
        
        @Test
        @DisplayName("Should recalculate total when items change")
        void shouldRecalculateTotalWhenItemsChange() {
            // Given
            OrderItem item1 = OrderItem.create(
                UUID.randomUUID(),
                "Pizza",
                Money.euro(new BigDecimal("12.50")),
                2, // 2 × 12.50 = 25.00
                null
            );
            OrderItem item2 = OrderItem.create(
                UUID.randomUUID(),
                "Drink",
                Money.euro(new BigDecimal("3.50")),
                1, // 1 × 3.50 = 3.50
                null
            );
            
            // When
            order.addItem(item1);
            order.addItem(item2);
            
            // Then - Total should be 25.00 + 3.50 = 28.50
            assertEquals(new BigDecimal("28.50"), order.getTotalAmount().getAmount());
            
            // When - Remove one item
            order.removeItem(item2);
            
            // Then - Total should be 25.00
            assertEquals(new BigDecimal("25.00"), order.getTotalAmount().getAmount());
        }
        
        @Test
        @DisplayName("Should reject null item")
        void shouldRejectNullItem() {
            // When & Then
            assertThrows(NullPointerException.class, () ->
                order.addItem(null));
        }
    }
    
    @Nested
    @DisplayName("Business Logic Queries")
    class BusinessLogicQueries {
        
        @Test
        @DisplayName("Should be cancellable when PENDING")
        void shouldBeCancellableWhenPending() {
            // Given
            assertEquals(OrderStatus.PENDING, order.getStatus());
            
            // When & Then
            assertTrue(order.canBeCancelled());
        }
        
        @Test
        @DisplayName("Should be cancellable when CONFIRMED")
        void shouldBeCancellableWhenConfirmed() {
            // Given
            order.changeStatus(OrderStatus.CONFIRMED);
            
            // When & Then
            assertTrue(order.canBeCancelled());
        }
        
        @Test
        @DisplayName("Should not be cancellable when COMPLETED")
        void shouldNotBeCancellableWhenCompleted() {
            // Given
            order.changeStatus(OrderStatus.CONFIRMED);
            order.changeStatus(OrderStatus.PREPARING);
            order.changeStatus(OrderStatus.READY);
            order.changeStatus(OrderStatus.COMPLETED);
            
            // When & Then
            assertFalse(order.canBeCancelled());
        }
        
        @Test
        @DisplayName("Should cancel order when allowed")
        void shouldCancelOrderWhenAllowed() {
            // Given
            assertTrue(order.canBeCancelled());
            
            // When
            order.cancel();
            
            // Then
            assertEquals(OrderStatus.CANCELLED, order.getStatus());
        }
        
        @Test
        @DisplayName("Should reject cancellation when not allowed")
        void shouldRejectCancellationWhenNotAllowed() {
            // Given
            order.changeStatus(OrderStatus.COMPLETED);
            
            // When & Then
            assertThrows(IllegalStateException.class, () ->
                order.cancel());
        }
        
        @Test
        @DisplayName("Should be active when not completed or cancelled")
        void shouldBeActiveWhenNotCompletedOrCancelled() {
            // PENDING
            assertTrue(order.isActive());
            
            // CONFIRMED
            order.changeStatus(OrderStatus.CONFIRMED);
            assertTrue(order.isActive());
            
            // PREPARING
            order.changeStatus(OrderStatus.PREPARING);
            assertTrue(order.isActive());
            
            // READY
            order.changeStatus(OrderStatus.READY);
            assertTrue(order.isActive());
            
            // COMPLETED - Not active
            order.changeStatus(OrderStatus.COMPLETED);
            assertFalse(order.isActive());
        }
        
        @Test
        @DisplayName("Should not be active when cancelled")
        void shouldNotBeActiveWhenCancelled() {
            // Given
            order.cancel();
            
            // When & Then
            assertFalse(order.isActive());
        }
        
        @Test
        @DisplayName("Should calculate minutes since creation")
        void shouldCalculateMinutesSinceCreation() {
            // When
            long minutes = order.getMinutesSinceCreation();
            
            // Then
            assertTrue(minutes >= 0);
            assertTrue(minutes < 5); // Should be very recent
        }
    }
    
    @Nested
    @DisplayName("Order Modifications")
    class OrderModifications {
        
        @Test
        @DisplayName("Should update special instructions")
        void shouldUpdateSpecialInstructions() {
            // When
            order.setSpecialInstructions("Updated instructions");
            
            // Then
            assertEquals("Updated instructions", order.getSpecialInstructions());
        }
        
        @Test
        @DisplayName("Should update estimated pickup time")
        void shouldUpdateEstimatedPickupTime() {
            // Given
            LocalDateTime futureTime = LocalDateTime.now().plusMinutes(30);
            
            // When
            order.setEstimatedPickupTime(futureTime);
            
            // Then
            assertEquals(futureTime, order.getEstimatedPickupTime());
        }
        
        @Test
        @DisplayName("Should handle null special instructions")
        void shouldHandleNullSpecialInstructions() {
            // When
            order.setSpecialInstructions(null);
            
            // Then
            assertNull(order.getSpecialInstructions());
        }
    }
    
    @Nested
    @DisplayName("Domain Events")
    class DomainEvents {
        
        @Test
        @DisplayName("Should emit OrderCreatedEvent when created with factory")
        void shouldEmitOrderCreatedEventWhenCreatedWithFactory() {
            // When
            Order newOrder = Order.create(
                "ORD-EVENT",
                userId,
                restaurantId,
                testAmount,
                "Event test"
            );
            
            // Then
            assertEquals(1, newOrder.getDomainEvents().size());
            assertTrue(newOrder.getDomainEvents().get(0) instanceof com.oneeats.order.domain.event.OrderCreatedEvent);
        }
        
        @Test
        @DisplayName("Should emit OrderStatusChangedEvent when status changes")
        void shouldEmitOrderStatusChangedEventWhenStatusChanges() {
            // Given
            order.clearDomainEvents();
            
            // When
            order.changeStatus(OrderStatus.CONFIRMED);
            
            // Then
            assertEquals(1, order.getDomainEvents().size());
            assertTrue(order.getDomainEvents().get(0) instanceof com.oneeats.order.domain.event.OrderStatusChangedEvent);
        }
        
        @Test
        @DisplayName("Should emit OrderStatusChangedEvent when using updateStatus")
        void shouldEmitOrderStatusChangedEventWhenUsingUpdateStatus() {
            // Given
            order.clearDomainEvents();
            
            // When
            order.updateStatus(OrderStatus.CONFIRMED);
            
            // Then
            assertEquals(1, order.getDomainEvents().size());
            assertTrue(order.getDomainEvents().get(0) instanceof com.oneeats.order.domain.event.OrderStatusChangedEvent);
        }
        
        @Test
        @DisplayName("Should clear domain events")
        void shouldClearDomainEvents() {
            // Given
            order.changeStatus(OrderStatus.CONFIRMED); // Generates event
            assertFalse(order.getDomainEvents().isEmpty());
            
            // When
            order.clearDomainEvents();
            
            // Then
            assertTrue(order.getDomainEvents().isEmpty());
        }
    }
    
    @Nested
    @DisplayName("String Representation")
    class StringRepresentation {
        
        @Test
        @DisplayName("Should have meaningful toString representation")
        void shouldHaveMeaningfulToStringRepresentation() {
            // When
            String toString = order.toString();
            
            // Then
            assertNotNull(toString);
            // Basic verification that toString is implemented and contains order info
            assertTrue(toString.length() > 0);
        }
    }
}