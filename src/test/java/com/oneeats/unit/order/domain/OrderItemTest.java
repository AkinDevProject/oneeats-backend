package com.oneeats.unit.order.domain;

import com.oneeats.order.domain.model.OrderItem;
import com.oneeats.shared.domain.vo.Money;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES ORDERITEM - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'entité OrderItem
 */
@DisplayName("OrderItem Unit Tests - Pure Domain Logic")
class OrderItemTest {
    
    private OrderItem orderItem;
    private UUID menuItemId;
    private Money unitPrice;
    
    @BeforeEach
    void setUp() {
        menuItemId = UUID.randomUUID();
        unitPrice = new Money(new BigDecimal("12.50"), "EUR");
        
        orderItem = OrderItem.create(
            menuItemId,
            "Margherita Pizza",
            unitPrice,
            2,
            "Extra cheese please"
        );
    }
    
    @Nested
    @DisplayName("OrderItem Creation")
    class OrderItemCreation {
        
        @Test
        @DisplayName("Should create order item with factory method")
        void shouldCreateOrderItemWithFactoryMethod() {
            // When
            OrderItem newItem = OrderItem.create(
                UUID.randomUUID(),
                "Pepperoni Pizza",
                new Money(new BigDecimal("14.00"), "EUR"),
                1,
                "No onions"
            );
            
            // Then
            assertNotNull(newItem);
            assertNotNull(newItem.getId());
            assertEquals("Pepperoni Pizza", newItem.getMenuItemName());
            assertEquals(new BigDecimal("14.00"), newItem.getUnitPrice().getAmount());
            assertEquals(1, newItem.getQuantity());
            assertEquals("No onions", newItem.getSpecialNotes());
            assertNull(newItem.getOrder()); // Not yet assigned to an order
            assertNotNull(newItem.getCreatedAt());
        }
        
        @Test
        @DisplayName("Should initialize with provided values")
        void shouldInitializeWithProvidedValues() {
            // Then
            assertEquals(menuItemId, orderItem.getMenuItemId());
            assertEquals("Margherita Pizza", orderItem.getMenuItemName());
            assertEquals(unitPrice, orderItem.getUnitPrice());
            assertEquals(2, orderItem.getQuantity());
            assertEquals("Extra cheese please", orderItem.getSpecialNotes());
        }
        
        @Test
        @DisplayName("Should validate quantity during creation")
        void shouldValidateQuantityDuringCreation() {
            // When & Then - Zero quantity
            assertThrows(IllegalArgumentException.class, () ->
                OrderItem.create(menuItemId, "Pizza", unitPrice, 0, null));
            
            // Negative quantity
            assertThrows(IllegalArgumentException.class, () ->
                OrderItem.create(menuItemId, "Pizza", unitPrice, -1, null));
            
            // Valid quantity
            assertDoesNotThrow(() ->
                OrderItem.create(menuItemId, "Pizza", unitPrice, 1, null));
        }
        
        @Test
        @DisplayName("Should handle null special notes")
        void shouldHandleNullSpecialNotes() {
            // When
            OrderItem itemWithoutNotes = OrderItem.create(
                menuItemId,
                "Simple Pizza",
                unitPrice,
                1,
                null
            );
            
            // Then
            assertNull(itemWithoutNotes.getSpecialNotes());
        }
    }
    
    @Nested
    @DisplayName("Subtotal Calculation")
    class SubtotalCalculation {
        
        @Test
        @DisplayName("Should calculate correct subtotal")
        void shouldCalculateCorrectSubtotal() {
            // Given
            assertEquals(2, orderItem.getQuantity());
            assertEquals(new BigDecimal("12.50"), orderItem.getUnitPrice().getAmount());
            
            // When
            Money subtotal = orderItem.getSubtotal();
            
            // Then
            assertEquals(new BigDecimal("25.00"), subtotal.getAmount()); // 2 × 12.50
            assertEquals("EUR", subtotal.getCurrency());
        }
        
        @Test
        @DisplayName("Should calculate subtotal for single item")
        void shouldCalculateSubtotalForSingleItem() {
            // Given
            OrderItem singleItem = OrderItem.create(
                menuItemId,
                "Drink",
                new Money(new BigDecimal("3.50"), "EUR"),
                1,
                null
            );
            
            // When
            Money subtotal = singleItem.getSubtotal();
            
            // Then
            assertEquals(new BigDecimal("3.50"), subtotal.getAmount());
        }
        
        @Test
        @DisplayName("Should handle decimal calculations correctly")
        void shouldHandleDecimalCalculationsCorrectly() {
            // Given
            OrderItem item = OrderItem.create(
                menuItemId,
                "Special Item",
                new Money(new BigDecimal("7.33"), "EUR"),
                3,
                null
            );
            
            // When
            Money subtotal = item.getSubtotal();
            
            // Then
            assertEquals(new BigDecimal("21.99"), subtotal.getAmount()); // 3 × 7.33
        }
    }
    
    @Nested
    @DisplayName("Quantity Management")
    class QuantityManagement {
        
        @Test
        @DisplayName("Should update quantity")
        void shouldUpdateQuantity() {
            // Given
            assertEquals(2, orderItem.getQuantity());
            
            // When
            orderItem.updateQuantity(5);
            
            // Then
            assertEquals(5, orderItem.getQuantity());
            assertNotNull(orderItem.getLastModified());
        }
        
        @Test
        @DisplayName("Should reject invalid quantity updates")
        void shouldRejectInvalidQuantityUpdates() {
            // When & Then - Zero quantity
            assertThrows(IllegalArgumentException.class, () ->
                orderItem.updateQuantity(0));
            
            // Negative quantity
            assertThrows(IllegalArgumentException.class, () ->
                orderItem.updateQuantity(-1));
            
            // Null quantity
            assertThrows(IllegalArgumentException.class, () ->
                orderItem.updateQuantity(null));
        }
        
        @Test
        @DisplayName("Should update subtotal after quantity change")
        void shouldUpdateSubtotalAfterQuantityChange() {
            // Given
            assertEquals(new BigDecimal("25.00"), orderItem.getSubtotal().getAmount()); // 2 × 12.50
            
            // When
            orderItem.updateQuantity(3);
            
            // Then
            assertEquals(new BigDecimal("37.50"), orderItem.getSubtotal().getAmount()); // 3 × 12.50
        }
    }
    
    @Nested
    @DisplayName("Special Notes Management")
    class SpecialNotesManagement {
        
        @Test
        @DisplayName("Should add special notes")
        void shouldAddSpecialNotes() {
            // Given
            OrderItem itemWithoutNotes = OrderItem.create(
                menuItemId,
                "Plain Pizza",
                unitPrice,
                1,
                null
            );
            assertNull(itemWithoutNotes.getSpecialNotes());
            
            // When
            itemWithoutNotes.addSpecialNotes("Make it spicy");
            
            // Then
            assertEquals("Make it spicy", itemWithoutNotes.getSpecialNotes());
        }
        
        @Test
        @DisplayName("Should update existing special notes")
        void shouldUpdateExistingSpecialNotes() {
            // Given
            assertEquals("Extra cheese please", orderItem.getSpecialNotes());
            
            // When
            orderItem.addSpecialNotes("No cheese, extra sauce");
            
            // Then
            assertEquals("No cheese, extra sauce", orderItem.getSpecialNotes());
        }
        
        @Test
        @DisplayName("Should handle null special notes")
        void shouldHandleNullSpecialNotes() {
            // When
            orderItem.addSpecialNotes(null);
            
            // Then
            assertNull(orderItem.getSpecialNotes());
        }
    }
    
    @Nested
    @DisplayName("Order Relationship")
    class OrderRelationship {
        
        @Test
        @DisplayName("Should start without order assignment")
        void shouldStartWithoutOrderAssignment() {
            // Then
            assertNull(orderItem.getOrder());
        }
        
        @Test
        @DisplayName("Should accept order assignment")
        void shouldAcceptOrderAssignment() {
            // Given
            var mockOrder = new com.oneeats.order.domain.model.Order(
                UUID.randomUUID(),
                "ORD-001",
                UUID.randomUUID(),
                UUID.randomUUID(),
                new Money(new BigDecimal("30.00"), "EUR"),
                null,
                com.oneeats.order.domain.model.OrderStatus.PENDING
            );
            
            // When
            orderItem.setOrder(mockOrder);
            
            // Then
            assertEquals(mockOrder, orderItem.getOrder());
        }
    }
    
    @Nested
    @DisplayName("Business Logic Queries")
    class BusinessLogicQueries {
        
        @Test
        @DisplayName("Should provide menu item information")
        void shouldProvideMenuItemInformation() {
            // Then
            assertEquals(menuItemId, orderItem.getMenuItemId());
            assertEquals("Margherita Pizza", orderItem.getMenuItemName());
            assertEquals(unitPrice, orderItem.getUnitPrice());
        }
        
        @Test
        @DisplayName("Should calculate different subtotals for different quantities")
        void shouldCalculateDifferentSubtotalsForDifferentQuantities() {
            // Given
            OrderItem item1 = OrderItem.create(menuItemId, "Item", unitPrice, 1, null);
            OrderItem item2 = OrderItem.create(menuItemId, "Item", unitPrice, 2, null);
            OrderItem item3 = OrderItem.create(menuItemId, "Item", unitPrice, 3, null);
            
            // When & Then
            assertEquals(new BigDecimal("12.50"), item1.getSubtotal().getAmount()); // 1 × 12.50
            assertEquals(new BigDecimal("25.00"), item2.getSubtotal().getAmount()); // 2 × 12.50
            assertEquals(new BigDecimal("37.50"), item3.getSubtotal().getAmount()); // 3 × 12.50
        }
    }
    
    @Nested
    @DisplayName("Equality and Hashing")
    class EqualityAndHashing {
        
        @Test
        @DisplayName("Should be equal when same menu item and order")
        void shouldBeEqualWhenSameMenuItemAndOrder() {
            // Given
            OrderItem item1 = OrderItem.create(menuItemId, "Pizza", unitPrice, 1, null);
            OrderItem item2 = OrderItem.create(menuItemId, "Pizza", unitPrice, 2, "Different notes");
            
            // When & Then - Same menu item, no order assigned
            assertEquals(item1, item2);
            assertEquals(item1.hashCode(), item2.hashCode());
        }
        
        @Test
        @DisplayName("Should not be equal when different menu items")
        void shouldNotBeEqualWhenDifferentMenuItems() {
            // Given
            UUID differentMenuItemId = UUID.randomUUID();
            OrderItem item1 = OrderItem.create(menuItemId, "Pizza", unitPrice, 1, null);
            OrderItem item2 = OrderItem.create(differentMenuItemId, "Burger", unitPrice, 1, null);
            
            // When & Then
            assertNotEquals(item1, item2);
        }
        
        @Test
        @DisplayName("Should not be equal to null or different type")
        void shouldNotBeEqualToNullOrDifferentType() {
            // When & Then
            assertNotEquals(orderItem, null);
            assertNotEquals(orderItem, "string");
            assertNotEquals(orderItem, 123);
        }
    }
    
    @Nested
    @DisplayName("String Representation")
    class StringRepresentation {
        
        @Test
        @DisplayName("Should have meaningful toString representation")
        void shouldHaveMeaningfulToStringRepresentation() {
            // When
            String toString = orderItem.toString();
            
            // Then
            assertNotNull(toString);
            assertTrue(toString.contains("Margherita Pizza"));
            assertTrue(toString.contains("2"));
            assertTrue(toString.contains("12.50"));
        }
    }
}