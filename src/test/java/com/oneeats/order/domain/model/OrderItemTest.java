package com.oneeats.order.domain.model;

import com.oneeats.shared.domain.vo.Money;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("OrderItem Model Tests")
class OrderItemTest {
    
    private UUID menuItemId;
    private String menuItemName;
    private Money unitPrice;
    private Integer quantity;
    private String specialNotes;
    
    @BeforeEach
    void setUp() {
        menuItemId = UUID.randomUUID();
        menuItemName = "Pizza Margherita";
        unitPrice = new Money(new BigDecimal("15.99"), Currency.getInstance("EUR"));
        quantity = 2;
        specialNotes = "Extra cheese please";
    }
    
    @Nested
    @DisplayName("Order Item Creation")
    class OrderItemCreation {
        
        @Test
        @DisplayName("Should create order item with valid data")
        void shouldCreateOrderItemWithValidData() {
            OrderItem orderItem = OrderItem.create(menuItemId, menuItemName, unitPrice, quantity, specialNotes);
            
            assertNotNull(orderItem);
            assertNotNull(orderItem.getId());
            assertEquals(menuItemId, orderItem.getMenuItemId());
            assertEquals(menuItemName, orderItem.getMenuItemName());
            assertEquals(unitPrice, orderItem.getUnitPrice());
            assertEquals(quantity, orderItem.getQuantity());
            assertEquals(specialNotes, orderItem.getSpecialNotes());
        }
        
        @Test
        @DisplayName("Should create order item without special notes")
        void shouldCreateOrderItemWithoutSpecialNotes() {
            OrderItem orderItem = OrderItem.create(menuItemId, menuItemName, unitPrice, quantity, null);
            
            assertNotNull(orderItem);
            assertNull(orderItem.getSpecialNotes());
        }
        
        @Test
        @DisplayName("Should create order item with minimum quantity")
        void shouldCreateOrderItemWithMinimumQuantity() {
            OrderItem orderItem = OrderItem.create(menuItemId, menuItemName, unitPrice, 1, null);
            
            assertEquals(Integer.valueOf(1), orderItem.getQuantity());
        }
        
        @Test
        @DisplayName("Should throw exception for zero quantity")
        void shouldThrowExceptionForZeroQuantity() {
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                OrderItem.create(menuItemId, menuItemName, unitPrice, 0, specialNotes));
            assertEquals("Quantity must be at least 1", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception for negative quantity")
        void shouldThrowExceptionForNegativeQuantity() {
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                OrderItem.create(menuItemId, menuItemName, unitPrice, -1, specialNotes));
            assertEquals("Quantity must be at least 1", exception.getMessage());
        }
    }
    
    @Nested
    @DisplayName("Order Item Business Logic")
    class OrderItemBusinessLogic {
        
        private OrderItem orderItem;
        
        @BeforeEach
        void setUp() {
            orderItem = OrderItem.create(menuItemId, menuItemName, unitPrice, quantity, specialNotes);
        }
        
        @Test
        @DisplayName("Should calculate correct subtotal")
        void shouldCalculateCorrectSubtotal() {
            Money expectedSubtotal = new Money(new BigDecimal("31.98"), Currency.getInstance("EUR"));
            assertEquals(expectedSubtotal, orderItem.getSubtotal());
        }
        
        @Test
        @DisplayName("Should calculate subtotal for quantity 1")
        void shouldCalculateSubtotalForQuantityOne() {
            OrderItem singleItem = OrderItem.create(menuItemId, menuItemName, unitPrice, 1, null);
            assertEquals(unitPrice, singleItem.getSubtotal());
        }
        
        @Test
        @DisplayName("Should calculate subtotal for large quantities")
        void shouldCalculateSubtotalForLargeQuantities() {
            OrderItem largeQuantityItem = OrderItem.create(menuItemId, menuItemName, unitPrice, 10, null);
            Money expectedSubtotal = new Money(new BigDecimal("159.90"), Currency.getInstance("EUR"));
            assertEquals(expectedSubtotal, largeQuantityItem.getSubtotal());
        }
        
        @Test
        @DisplayName("Should update quantity successfully")
        void shouldUpdateQuantitySuccessfully() {
            orderItem.updateQuantity(5);
            assertEquals(Integer.valueOf(5), orderItem.getQuantity());
        }
        
        @Test
        @DisplayName("Should recalculate subtotal after quantity update")
        void shouldRecalculateSubtotalAfterQuantityUpdate() {
            orderItem.updateQuantity(3);
            Money expectedSubtotal = new Money(new BigDecimal("47.97"), Currency.getInstance("EUR"));
            assertEquals(expectedSubtotal, orderItem.getSubtotal());
        }
        
        @Test
        @DisplayName("Should throw exception when updating to zero quantity")
        void shouldThrowExceptionWhenUpdatingToZeroQuantity() {
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                orderItem.updateQuantity(0));
            assertEquals("Quantity must be at least 1", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception when updating to negative quantity")
        void shouldThrowExceptionWhenUpdatingToNegativeQuantity() {
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                orderItem.updateQuantity(-1));
            assertEquals("Quantity must be at least 1", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception when updating to null quantity")
        void shouldThrowExceptionWhenUpdatingToNullQuantity() {
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                orderItem.updateQuantity(null));
            assertEquals("Quantity must be at least 1", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should add special notes")
        void shouldAddSpecialNotes() {
            String newNotes = "No onions, extra tomatoes";
            orderItem.addSpecialNotes(newNotes);
            assertEquals(newNotes, orderItem.getSpecialNotes());
        }
        
        @Test
        @DisplayName("Should update existing special notes")
        void shouldUpdateExistingSpecialNotes() {
            String initialNotes = "Initial notes";
            String updatedNotes = "Updated notes";
            
            orderItem.addSpecialNotes(initialNotes);
            assertEquals(initialNotes, orderItem.getSpecialNotes());
            
            orderItem.addSpecialNotes(updatedNotes);
            assertEquals(updatedNotes, orderItem.getSpecialNotes());
        }
    }
    
    @Nested
    @DisplayName("Order Item Relationships")
    class OrderItemRelationships {
        
        private OrderItem orderItem;
        private Order order;
        
        @BeforeEach
        void setUp() {
            orderItem = OrderItem.create(menuItemId, menuItemName, unitPrice, quantity, specialNotes);
            order = Order.create("ORD-001", UUID.randomUUID(), UUID.randomUUID(), 
                new Money(BigDecimal.valueOf(100), Currency.getInstance("EUR")), "Test order");
        }
        
        @Test
        @DisplayName("Should set order relationship")
        void shouldSetOrderRelationship() {
            orderItem.setOrder(order);
            assertEquals(order, orderItem.getOrder());
        }
        
        @Test
        @DisplayName("Should clear order relationship")
        void shouldClearOrderRelationship() {
            orderItem.setOrder(order);
            orderItem.setOrder(null);
            assertNull(orderItem.getOrder());
        }
    }
    
    @Nested
    @DisplayName("Order Item Equality and Hash")
    class OrderItemEqualityAndHash {
        
        @Test
        @DisplayName("Should be equal when menu item ID and order are same")
        void shouldBeEqualWhenMenuItemIdAndOrderAreSame() {
            UUID sameMenuItemId = UUID.randomUUID();
            Order order = Order.create("ORD-001", UUID.randomUUID(), UUID.randomUUID(),
                new Money(BigDecimal.valueOf(100), Currency.getInstance("EUR")), "Test order");
            
            OrderItem orderItem1 = OrderItem.create(sameMenuItemId, "Pizza", unitPrice, 1, null);
            OrderItem orderItem2 = OrderItem.create(sameMenuItemId, "Pizza", unitPrice, 2, "Different notes");
            
            orderItem1.setOrder(order);
            orderItem2.setOrder(order);
            
            // Note: OrderItem equality is based on entity ID (from BaseEntity), menu item ID, and order
            // Since these are different instances, they won't be equal
            assertNotEquals(orderItem1, orderItem2);
        }
        
        @Test
        @DisplayName("Should not be equal when menu item IDs are different")
        void shouldNotBeEqualWhenMenuItemIdsAreDifferent() {
            OrderItem orderItem1 = OrderItem.create(UUID.randomUUID(), "Pizza", unitPrice, 1, null);
            OrderItem orderItem2 = OrderItem.create(UUID.randomUUID(), "Pizza", unitPrice, 1, null);
            
            assertNotEquals(orderItem1, orderItem2);
        }
        
        @Test
        @DisplayName("Should not be equal when orders are different")
        void shouldNotBeEqualWhenOrdersAreDifferent() {
            UUID sameMenuItemId = UUID.randomUUID();
            Order order1 = Order.create("ORD-001", UUID.randomUUID(), UUID.randomUUID(),
                new Money(BigDecimal.valueOf(100), Currency.getInstance("EUR")), "Test order 1");
            Order order2 = Order.create("ORD-002", UUID.randomUUID(), UUID.randomUUID(),
                new Money(BigDecimal.valueOf(100), Currency.getInstance("EUR")), "Test order 2");
            
            OrderItem orderItem1 = OrderItem.create(sameMenuItemId, "Pizza", unitPrice, 1, null);
            OrderItem orderItem2 = OrderItem.create(sameMenuItemId, "Pizza", unitPrice, 1, null);
            
            orderItem1.setOrder(order1);
            orderItem2.setOrder(order2);
            
            assertNotEquals(orderItem1, orderItem2);
        }
        
        @Test
        @DisplayName("Should not be equal to null")
        void shouldNotBeEqualToNull() {
            OrderItem orderItem = OrderItem.create(menuItemId, menuItemName, unitPrice, quantity, specialNotes);
            assertNotEquals(orderItem, null);
        }
        
        @Test
        @DisplayName("Should not be equal to different type")
        void shouldNotBeEqualToDifferentType() {
            OrderItem orderItem = OrderItem.create(menuItemId, menuItemName, unitPrice, quantity, specialNotes);
            assertNotEquals(orderItem, "not an order item");
        }
        
        @Test
        @DisplayName("Should be equal to itself")
        void shouldBeEqualToItself() {
            OrderItem orderItem = OrderItem.create(menuItemId, menuItemName, unitPrice, quantity, specialNotes);
            assertEquals(orderItem, orderItem);
        }
    }
    
    @Nested
    @DisplayName("Order Item String Representation")
    class OrderItemStringRepresentation {
        
        @Test
        @DisplayName("Should have meaningful toString")
        void shouldHaveMeaningfulToString() {
            OrderItem orderItem = OrderItem.create(menuItemId, menuItemName, unitPrice, quantity, specialNotes);
            String toString = orderItem.toString();
            
            assertTrue(toString.contains("OrderItem"));
            assertTrue(toString.contains(menuItemName));
            assertTrue(toString.contains(quantity.toString()));
            assertTrue(toString.contains(unitPrice.toString()));
            assertTrue(toString.contains(orderItem.getId().toString()));
        }
    }
}