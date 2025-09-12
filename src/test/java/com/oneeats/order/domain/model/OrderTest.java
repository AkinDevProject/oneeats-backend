package com.oneeats.order.domain.model;

import com.oneeats.shared.domain.vo.Money;
import com.oneeats.order.domain.event.OrderCreatedEvent;
import com.oneeats.order.domain.event.OrderStatusChangedEvent;
import com.oneeats.shared.domain.event.IDomainEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Currency;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Order Model Tests")
class OrderTest {
    
    private String orderNumber;
    private UUID userId;
    private UUID restaurantId;
    private Money totalAmount;
    private String specialInstructions;
    private Currency euroCurrency;
    
    @BeforeEach
    void setUp() {
        orderNumber = "ORD-20230101-001";
        userId = UUID.randomUUID();
        restaurantId = UUID.randomUUID();
        euroCurrency = Currency.getInstance("EUR");
        totalAmount = new Money(new BigDecimal("45.50"), euroCurrency);
        specialInstructions = "Please ring the doorbell twice";
    }
    
    @Nested
    @DisplayName("Order Creation")
    class OrderCreation {
        
        @Test
        @DisplayName("Should create order with valid data")
        void shouldCreateOrderWithValidData() {
            Order order = Order.create(orderNumber, userId, restaurantId, totalAmount, specialInstructions);
            
            assertNotNull(order);
            assertNotNull(order.getId());
            assertEquals(orderNumber, order.getOrderNumber());
            assertEquals(userId, order.getUserId());
            assertEquals(restaurantId, order.getRestaurantId());
            assertEquals(totalAmount, order.getTotalAmount());
            assertEquals(specialInstructions, order.getSpecialInstructions());
            assertEquals(OrderStatus.PENDING, order.getStatus());
            assertNull(order.getEstimatedPickupTime());
            assertNull(order.getActualPickupTime());
            assertTrue(order.getItems().isEmpty());
        }
        
        @Test
        @DisplayName("Should create order without special instructions")
        void shouldCreateOrderWithoutSpecialInstructions() {
            Order order = Order.create(orderNumber, userId, restaurantId, totalAmount, null);
            
            assertNotNull(order);
            assertNull(order.getSpecialInstructions());
        }
        
        @Test
        @DisplayName("Should create order with empty special instructions")
        void shouldCreateOrderWithEmptySpecialInstructions() {
            Order order = Order.create(orderNumber, userId, restaurantId, totalAmount, "");
            
            assertNotNull(order);
            assertEquals("", order.getSpecialInstructions());
        }
        
        @Test
        @DisplayName("Should publish OrderCreatedEvent on creation")
        void shouldPublishOrderCreatedEventOnCreation() {
            Order order = Order.create(orderNumber, userId, restaurantId, totalAmount, specialInstructions);
            
            List<IDomainEvent> events = order.getDomainEvents();
            assertEquals(1, events.size());
            assertTrue(events.get(0) instanceof OrderCreatedEvent);
            
            OrderCreatedEvent event = (OrderCreatedEvent) events.get(0);
            assertEquals(order.getId(), event.getOrderId());
            assertEquals(orderNumber, event.getOrderNumber());
            assertEquals(userId, event.getUserId());
            assertEquals(restaurantId, event.getRestaurantId());
            assertNotNull(event.occurredOn());
        }
    }
    
    @Nested
    @DisplayName("Order Status Management")
    class OrderStatusManagement {
        
        private Order order;
        
        @BeforeEach
        void setUp() {
            order = Order.create(orderNumber, userId, restaurantId, totalAmount, specialInstructions);
            order.clearDomainEvents(); // Clear creation event for cleaner testing
        }
        
        @Test
        @DisplayName("Should change status and publish event")
        void shouldChangeStatusAndPublishEvent() {
            order.changeStatus(OrderStatus.CONFIRMED);
            
            assertEquals(OrderStatus.CONFIRMED, order.getStatus());
            
            List<IDomainEvent> events = order.getDomainEvents();
            assertEquals(1, events.size());
            assertTrue(events.get(0) instanceof OrderStatusChangedEvent);
            
            OrderStatusChangedEvent event = (OrderStatusChangedEvent) events.get(0);
            assertEquals(OrderStatus.PENDING, event.getPreviousStatus());
            assertEquals(OrderStatus.CONFIRMED, event.getNewStatus());
        }
        
        @Test
        @DisplayName("Should set estimated pickup time when status becomes READY")
        void shouldSetEstimatedPickupTimeWhenStatusBecomesReady() {
            LocalDateTime beforeStatusChange = LocalDateTime.now();
            
            order.changeStatus(OrderStatus.READY);
            
            assertNotNull(order.getEstimatedPickupTime());
            assertTrue(order.getEstimatedPickupTime().isAfter(beforeStatusChange));
        }
        
        @Test
        @DisplayName("Should not overwrite existing estimated pickup time when status becomes READY")
        void shouldNotOverwriteExistingEstimatedPickupTimeWhenStatusBecomesReady() {
            LocalDateTime predefinedTime = LocalDateTime.now().plusMinutes(10);
            order.setEstimatedPickupTime(predefinedTime);
            
            order.changeStatus(OrderStatus.READY);
            
            assertEquals(predefinedTime, order.getEstimatedPickupTime());
        }
        
        @Test
        @DisplayName("Should set actual pickup time when status becomes COMPLETED using updateStatus")
        void shouldSetActualPickupTimeWhenStatusBecomesCompleted() {
            LocalDateTime beforeStatusChange = LocalDateTime.now().minusSeconds(1);
            
            // Follow valid state transitions: PENDING -> CONFIRMED -> PREPARING -> READY -> COMPLETED
            order.updateStatus(OrderStatus.CONFIRMED);
            order.updateStatus(OrderStatus.PREPARING);
            order.updateStatus(OrderStatus.READY);
            order.updateStatus(OrderStatus.COMPLETED);
            
            assertNotNull(order.getActualPickupTime());
            assertTrue(order.getActualPickupTime().isAfter(beforeStatusChange));
        }
        
        @Test
        @DisplayName("Should validate status transitions")
        void shouldValidateStatusTransitions() {
            // Valid transition
            order.updateStatus(OrderStatus.CONFIRMED);
            assertEquals(OrderStatus.CONFIRMED, order.getStatus());
            
            // Invalid transition should throw exception
            IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                order.updateStatus(OrderStatus.COMPLETED));
            assertTrue(exception.getMessage().contains("Invalid status transition"));
        }
        
        @Test
        @DisplayName("Should allow valid status transitions")
        void shouldAllowValidStatusTransitions() {
            assertDoesNotThrow(() -> order.updateStatus(OrderStatus.CONFIRMED));
            assertDoesNotThrow(() -> order.updateStatus(OrderStatus.PREPARING));
            assertDoesNotThrow(() -> order.updateStatus(OrderStatus.READY));
            assertDoesNotThrow(() -> order.updateStatus(OrderStatus.COMPLETED));
        }
    }
    
    @Nested
    @DisplayName("Order Item Management")
    class OrderItemManagement {
        
        private Order order;
        private OrderItem orderItem1;
        private OrderItem orderItem2;
        
        @BeforeEach
        void setUp() {
            order = Order.create(orderNumber, userId, restaurantId, totalAmount, specialInstructions);
            
            Money itemPrice1 = new Money(new BigDecimal("12.99"), euroCurrency);
            Money itemPrice2 = new Money(new BigDecimal("8.50"), euroCurrency);
            
            orderItem1 = OrderItem.create(UUID.randomUUID(), "Pizza Margherita", itemPrice1, 2, null);
            orderItem2 = OrderItem.create(UUID.randomUUID(), "Caesar Salad", itemPrice2, 1, null);
        }
        
        @Test
        @DisplayName("Should add item to order")
        void shouldAddItemToOrder() {
            order.addItem(orderItem1);
            
            List<OrderItem> items = order.getItems();
            assertEquals(1, items.size());
            assertTrue(items.contains(orderItem1));
            assertEquals(order, orderItem1.getOrder());
        }
        
        @Test
        @DisplayName("Should add multiple items to order")
        void shouldAddMultipleItemsToOrder() {
            order.addItem(orderItem1);
            order.addItem(orderItem2);
            
            List<OrderItem> items = order.getItems();
            assertEquals(2, items.size());
            assertTrue(items.contains(orderItem1));
            assertTrue(items.contains(orderItem2));
        }
        
        @Test
        @DisplayName("Should recalculate total when adding items")
        void shouldRecalculateTotalWhenAddingItems() {
            order.addItem(orderItem1); // 12.99 * 2 = 25.98
            order.addItem(orderItem2); // 8.50 * 1 = 8.50
            
            // Total should be 25.98 + 8.50 = 34.48
            Money expectedTotal = new Money(new BigDecimal("34.48"), euroCurrency);
            assertEquals(expectedTotal, order.getTotalAmount());
        }
        
        @Test
        @DisplayName("Should throw exception when adding null item")
        void shouldThrowExceptionWhenAddingNullItem() {
            NullPointerException exception = assertThrows(NullPointerException.class, () ->
                order.addItem(null));
            assertEquals("L'item ne peut pas être null", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should remove item from order")
        void shouldRemoveItemFromOrder() {
            order.addItem(orderItem1);
            order.addItem(orderItem2);
            
            order.removeItem(orderItem1);
            
            List<OrderItem> items = order.getItems();
            assertEquals(1, items.size());
            assertFalse(items.contains(orderItem1));
            assertTrue(items.contains(orderItem2));
            assertNull(orderItem1.getOrder());
        }
        
        @Test
        @DisplayName("Should recalculate total when removing items")
        void shouldRecalculateTotalWhenRemovingItems() {
            order.addItem(orderItem1);
            order.addItem(orderItem2);
            order.removeItem(orderItem1);
            
            // Total should be 8.50 (only orderItem2 remains)
            Money expectedTotal = new Money(new BigDecimal("8.50"), euroCurrency);
            assertEquals(expectedTotal, order.getTotalAmount());
        }
        
        @Test
        @DisplayName("Should handle removing non-existent item gracefully")
        void shouldHandleRemovingNonExistentItemGracefully() {
            order.addItem(orderItem1);
            
            // This should not throw exception
            assertDoesNotThrow(() -> order.removeItem(orderItem2));
            
            List<OrderItem> items = order.getItems();
            assertEquals(1, items.size());
            assertTrue(items.contains(orderItem1));
        }
        
        @Test
        @DisplayName("Should return immutable view of items")
        void shouldReturnImmutableViewOfItems() {
            order.addItem(orderItem1);
            
            List<OrderItem> items = order.getItems();
            
            assertThrows(UnsupportedOperationException.class, () ->
                items.add(orderItem2));
        }
    }
    
    @Nested
    @DisplayName("Order Business Rules")
    class OrderBusinessRules {
        
        private Order order;
        
        @BeforeEach
        void setUp() {
            order = Order.create(orderNumber, userId, restaurantId, totalAmount, specialInstructions);
        }
        
        @Test
        @DisplayName("Should identify cancellable orders")
        void shouldIdentifyCancellableOrders() {
            // PENDING orders can be cancelled
            assertTrue(order.canBeCancelled());
            
            // CONFIRMED orders can be cancelled
            order.changeStatus(OrderStatus.CONFIRMED);
            assertTrue(order.canBeCancelled());
            
            // PREPARING orders cannot be cancelled
            order.changeStatus(OrderStatus.PREPARING);
            assertFalse(order.canBeCancelled());
            
            // READY orders cannot be cancelled
            order.changeStatus(OrderStatus.READY);
            assertFalse(order.canBeCancelled());
            
            // COMPLETED orders cannot be cancelled
            order.changeStatus(OrderStatus.COMPLETED);
            assertFalse(order.canBeCancelled());
        }
        
        @Test
        @DisplayName("Should cancel order when allowed")
        void shouldCancelOrderWhenAllowed() {
            order.cancel();
            
            assertEquals(OrderStatus.CANCELLED, order.getStatus());
        }
        
        @Test
        @DisplayName("Should throw exception when cancelling non-cancellable order")
        void shouldThrowExceptionWhenCancellingNonCancellableOrder() {
            order.changeStatus(OrderStatus.PREPARING);
            
            IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                order.cancel());
            assertEquals("Order cannot be cancelled in current state", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should identify active orders")
        void shouldIdentifyActiveOrders() {
            // PENDING, CONFIRMED, PREPARING, READY are active
            assertTrue(order.isActive());
            
            order.changeStatus(OrderStatus.CONFIRMED);
            assertTrue(order.isActive());
            
            order.changeStatus(OrderStatus.PREPARING);
            assertTrue(order.isActive());
            
            order.changeStatus(OrderStatus.READY);
            assertTrue(order.isActive());
            
            // COMPLETED and CANCELLED are not active
            order.changeStatus(OrderStatus.COMPLETED);
            assertFalse(order.isActive());
            
            Order cancelledOrder = Order.create("ORD-002", userId, restaurantId, totalAmount, null);
            cancelledOrder.cancel();
            assertFalse(cancelledOrder.isActive());
        }
        
        @Test
        @DisplayName("Should calculate minutes since creation")
        void shouldCalculateMinutesSinceCreation() {
            long minutes = order.getMinutesSinceCreation();
            
            assertTrue(minutes >= 0);
            assertTrue(minutes <= 1); // Should be very recent
        }
    }
    
    @Nested
    @DisplayName("Order Setters and Updates")
    class OrderSettersAndUpdates {
        
        private Order order;
        
        @BeforeEach
        void setUp() {
            order = Order.create(orderNumber, userId, restaurantId, totalAmount, specialInstructions);
        }
        
        @Test
        @DisplayName("Should update special instructions")
        void shouldUpdateSpecialInstructions() {
            String newInstructions = "Leave at the front door";
            order.setSpecialInstructions(newInstructions);
            assertEquals(newInstructions, order.getSpecialInstructions());
        }
        
        @Test
        @DisplayName("Should set estimated pickup time")
        void shouldSetEstimatedPickupTime() {
            LocalDateTime estimatedTime = LocalDateTime.now().plusMinutes(30);
            order.setEstimatedPickupTime(estimatedTime);
            assertEquals(estimatedTime, order.getEstimatedPickupTime());
        }
        
        @Test
        @DisplayName("Should set status directly")
        void shouldSetStatusDirectly() {
            order.setStatus(OrderStatus.CONFIRMED);
            assertEquals(OrderStatus.CONFIRMED, order.getStatus());
        }
    }
    
    @Nested
    @DisplayName("Order Domain Events")
    class OrderDomainEvents {
        
        @Test
        @DisplayName("Should publish OrderCreatedEvent on creation")
        void shouldPublishOrderCreatedEventOnCreation() {
            Order order = Order.create(orderNumber, userId, restaurantId, totalAmount, specialInstructions);
            
            List<IDomainEvent> events = order.getDomainEvents();
            assertEquals(1, events.size());
            
            OrderCreatedEvent event = (OrderCreatedEvent) events.get(0);
            assertEquals(order.getId(), event.getOrderId());
            assertEquals(orderNumber, event.getOrderNumber());
            assertEquals(userId, event.getUserId());
            assertEquals(restaurantId, event.getRestaurantId());
        }
        
        @Test
        @DisplayName("Should publish OrderStatusChangedEvent on status change")
        void shouldPublishOrderStatusChangedEventOnStatusChange() {
            Order order = Order.create(orderNumber, userId, restaurantId, totalAmount, specialInstructions);
            order.clearDomainEvents(); // Clear creation event
            
            order.changeStatus(OrderStatus.CONFIRMED);
            
            List<IDomainEvent> events = order.getDomainEvents();
            assertEquals(1, events.size());
            
            OrderStatusChangedEvent event = (OrderStatusChangedEvent) events.get(0);
            assertEquals(order.getId(), event.getOrderId());
            assertEquals(OrderStatus.PENDING, event.getPreviousStatus());
            assertEquals(OrderStatus.CONFIRMED, event.getNewStatus());
        }
        
        @Test
        @DisplayName("Should publish multiple events for multiple status changes")
        void shouldPublishMultipleEventsForMultipleStatusChanges() {
            Order order = Order.create(orderNumber, userId, restaurantId, totalAmount, specialInstructions);
            order.clearDomainEvents();
            
            order.changeStatus(OrderStatus.CONFIRMED);
            order.changeStatus(OrderStatus.PREPARING);
            
            List<IDomainEvent> events = order.getDomainEvents();
            assertEquals(2, events.size());
            
            OrderStatusChangedEvent event1 = (OrderStatusChangedEvent) events.get(0);
            assertEquals(OrderStatus.PENDING, event1.getPreviousStatus());
            assertEquals(OrderStatus.CONFIRMED, event1.getNewStatus());
            
            OrderStatusChangedEvent event2 = (OrderStatusChangedEvent) events.get(1);
            assertEquals(OrderStatus.CONFIRMED, event2.getPreviousStatus());
            assertEquals(OrderStatus.PREPARING, event2.getNewStatus());
        }
    }
}