package com.oneeats.unit.menu.domain;

import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.vo.Price;
import com.oneeats.menu.domain.vo.MenuItemName;
import com.oneeats.menu.domain.vo.MenuItemCategory;
import com.oneeats.menu.domain.vo.PreparationTime;
import com.oneeats.menu.domain.vo.AllergenList;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES MENUITEM - Domain Logic Pure
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'entité MenuItem
 */
@DisplayName("MenuItem Unit Tests - Pure Domain Logic")
class MenuItemTest {
    
    private MenuItem menuItem;
    private UUID menuItemId;
    private UUID restaurantId;
    private Price testPrice;
    
    @BeforeEach
    void setUp() {
        menuItemId = UUID.randomUUID();
        restaurantId = UUID.randomUUID();
        testPrice = Price.of(new BigDecimal("12.50"));
        
        menuItem = MenuItem.create(
            restaurantId,
            "Margherita Pizza",
            "Fresh tomato, mozzarella, and basil",
            testPrice,
            "PIZZA"
        );
    }
    
    @Nested
    @DisplayName("MenuItem Creation")
    class MenuItemCreation {
        
        @Test
        @DisplayName("Should create menu item with factory method")
        void shouldCreateMenuItemWithFactoryMethod() {
            // When
            MenuItem newItem = MenuItem.create(
                restaurantId,
                "Pepperoni Pizza",
                "Pepperoni and mozzarella cheese",
                Price.of(new BigDecimal("14.00")),
                "PIZZA"
            );
            
            // Then
            assertNotNull(newItem);
            assertNotNull(newItem.getId());
            assertEquals(restaurantId, newItem.getRestaurantId());
            assertEquals("Pepperoni Pizza", newItem.getName().getValue());
            assertEquals("Pepperoni and mozzarella cheese", newItem.getDescription());
            assertEquals(new BigDecimal("14.00"), newItem.getPrice().getAmount());
            assertEquals("PIZZA", newItem.getCategory().getValue());
            assertTrue(newItem.getIsAvailable());
            assertNotNull(newItem.getCreatedAt());
            
            // Should have domain event
            assertFalse(newItem.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should initialize with default values")
        void shouldInitializeWithDefaultValues() {
            // Then
            assertTrue(menuItem.getIsAvailable());
            assertFalse(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
            assertNotNull(menuItem.getPreparationTime());
            assertEquals(15, menuItem.getPreparationTimeMinutes()); // Default 15 minutes
            assertNotNull(menuItem.getAllergens());
            assertTrue(menuItem.getAllergens().isEmpty());
        }
        
        @Test
        @DisplayName("Should validate required fields during creation")
        void shouldValidateRequiredFieldsDuringCreation() {
            // When & Then - Null restaurant ID
            assertThrows(IllegalArgumentException.class, () ->
                MenuItem.create(null, "Pizza", "Description", testPrice, "PIZZA"));
            
            // Null or empty name
            assertThrows(IllegalArgumentException.class, () ->
                MenuItem.create(restaurantId, null, "Description", testPrice, "PIZZA"));
            assertThrows(IllegalArgumentException.class, () ->
                MenuItem.create(restaurantId, "", "Description", testPrice, "PIZZA"));
            
            // Null price
            assertThrows(IllegalArgumentException.class, () ->
                MenuItem.create(restaurantId, "Pizza", "Description", null, "PIZZA"));
            
            // Null category
            assertThrows(IllegalArgumentException.class, () ->
                MenuItem.create(restaurantId, "Pizza", "Description", testPrice, null));
        }
        
        @Test
        @DisplayName("Should reject invalid price values")
        void shouldRejectInvalidPriceValues() {
            // When & Then - Negative price
            assertThrows(IllegalArgumentException.class, () ->
                Price.of(new BigDecimal("-5.00")));
            
            // Zero price (business rule: menu items must have positive price)
            assertThrows(IllegalArgumentException.class, () ->
                Price.of(BigDecimal.ZERO));
        }
    }
    
    @Nested
    @DisplayName("Menu Item Information Updates")
    class MenuItemInformationUpdates {
        
        @Test
        @DisplayName("Should update basic information")
        void shouldUpdateBasicInformation() {
            // When
            menuItem.updateBasicInfo(
                "Updated Pizza Name",
                "Updated description with new ingredients",
                Price.of(new BigDecimal("15.00")),
                "UPDATED_CATEGORY"
            );
            
            // Then
            assertEquals("Updated Pizza Name", menuItem.getName().getValue());
            assertEquals("Updated description with new ingredients", menuItem.getDescription());
            assertEquals(new BigDecimal("15.00"), menuItem.getPrice().getAmount());
            assertEquals("UPDATED_CATEGORY", menuItem.getCategory().getValue());
            assertNotNull(menuItem.getLastUpdated());
        }
        
        @Test
        @DisplayName("Should not update when no changes occur")
        void shouldNotUpdateWhenNoChangesOccur() {
            // Given
            var originalLastUpdated = menuItem.getLastUpdated();
            
            // When - Update with same values
            menuItem.updateBasicInfo(
                menuItem.getName().getValue(),
                menuItem.getDescription(),
                menuItem.getPrice(),
                menuItem.getCategory().getValue()
            );
            
            // Then
            assertEquals(originalLastUpdated, menuItem.getLastUpdated());
            assertTrue(menuItem.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should update individual properties")
        void shouldUpdateIndividualProperties() {
            // When
            menuItem.updateName("New Name");
            menuItem.updateDescription("New Description");
            menuItem.updatePrice(Price.of(new BigDecimal("20.00")));
            menuItem.updateCategory("NEW_CATEGORY");
            
            // Then
            assertEquals("New Name", menuItem.getName().getValue());
            assertEquals("New Description", menuItem.getDescription());
            assertEquals(new BigDecimal("20.00"), menuItem.getPrice().getAmount());
            assertEquals("NEW_CATEGORY", menuItem.getCategory().getValue());
            
            // Should have published events for each update
            assertTrue(menuItem.getDomainEvents().size() >= 4);
        }
        
        @Test
        @DisplayName("Should update preparation time")
        void shouldUpdatePreparationTime() {
            // When
            menuItem.setPreparationTime(25);
            
            // Then
            assertEquals(25, menuItem.getPreparationTimeMinutes());
            assertNotNull(menuItem.getLastUpdated());
        }
        
        @Test
        @DisplayName("Should reject invalid preparation time")
        void shouldRejectInvalidPreparationTime() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () ->
                menuItem.setPreparationTime(-1));
            assertThrows(IllegalArgumentException.class, () ->
                menuItem.setPreparationTime(0));
        }
    }
    
    @Nested
    @DisplayName("Dietary Information Management")
    class DietaryInformationManagement {
        
        @Test
        @DisplayName("Should update dietary information")
        void shouldUpdateDietaryInformation() {
            // Given
            List<String> allergens = Arrays.asList("gluten", "dairy");
            
            // When
            menuItem.updateDietaryInfo(true, false, allergens);
            
            // Then
            assertTrue(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
            assertEquals(allergens, menuItem.getAllergens().toStringList());
            assertNotNull(menuItem.getLastUpdated());
        }
        
        @Test
        @DisplayName("Should automatically make vegetarian when vegan")
        void shouldAutomaticallyMakeVegetarianWhenVegan() {
            // When - Set as vegan but not vegetarian
            menuItem.updateDietaryInfo(false, true, null);
            
            // Then - Should automatically be vegetarian if vegan
            assertTrue(menuItem.getIsVegetarian());
            assertTrue(menuItem.getIsVegan());
        }
        
        @Test
        @DisplayName("Should mark as vegetarian")
        void shouldMarkAsVegetarian() {
            // When
            menuItem.markAsVegetarian();
            
            // Then
            assertTrue(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
        }
        
        @Test
        @DisplayName("Should mark as vegan")
        void shouldMarkAsVegan() {
            // When
            menuItem.markAsVegan();
            
            // Then
            assertTrue(menuItem.getIsVegetarian());
            assertTrue(menuItem.getIsVegan());
        }
        
        @Test
        @DisplayName("Should unmark vegetarian and automatically unmark vegan")
        void shouldUnmarkVegetarianAndAutomaticallyUnmarkVegan() {
            // Given
            menuItem.markAsVegan(); // Make it vegan first
            
            // When
            menuItem.unmarkAsVegetarian();
            
            // Then
            assertFalse(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
        }
        
        @Test
        @DisplayName("Should handle allergen management")
        void shouldHandleAllergenManagement() {
            // When
            menuItem.addAllergen("nuts");
            menuItem.addAllergen("shellfish");
            
            // Then
            assertTrue(menuItem.getAllergens().contains("nuts"));
            assertTrue(menuItem.getAllergens().contains("shellfish"));
            assertEquals(2, menuItem.getAllergens().size());
            
            // When - Remove allergen
            menuItem.removeAllergen("nuts");
            
            // Then
            assertFalse(menuItem.getAllergens().contains("nuts"));
            assertTrue(menuItem.getAllergens().contains("shellfish"));
            assertEquals(1, menuItem.getAllergens().size());
        }
    }
    
    @Nested
    @DisplayName("Availability Management")
    class AvailabilityManagement {
        
        @Test
        @DisplayName("Should make item unavailable")
        void shouldMakeItemUnavailable() {
            // Given
            assertTrue(menuItem.getIsAvailable());
            
            // When
            menuItem.makeUnavailable();
            
            // Then
            assertFalse(menuItem.getIsAvailable());
            assertNotNull(menuItem.getLastUpdated());
            assertFalse(menuItem.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should make item available")
        void shouldMakeItemAvailable() {
            // Given
            menuItem.makeUnavailable();
            
            // When
            menuItem.makeAvailable();
            
            // Then
            assertTrue(menuItem.getIsAvailable());
            assertNotNull(menuItem.getLastUpdated());
        }
        
        @Test
        @DisplayName("Should not publish event when availability unchanged")
        void shouldNotPublishEventWhenAvailabilityUnchanged() {
            // Given
            menuItem.clearDomainEvents();
            assertTrue(menuItem.getIsAvailable());
            
            // When - Make available when already available
            menuItem.makeAvailable();
            
            // Then
            assertTrue(menuItem.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should toggle availability")
        void shouldToggleAvailability() {
            // Given
            boolean initialAvailability = menuItem.getIsAvailable();
            
            // When
            menuItem.toggleAvailability();
            
            // Then
            assertEquals(!initialAvailability, menuItem.getIsAvailable());
            assertNotNull(menuItem.getLastUpdated());
        }
    }
    
    @Nested
    @DisplayName("Business Logic Queries")
    class BusinessLogicQueries {
        
        @Test
        @DisplayName("Should be orderable when available and has positive price")
        void shouldBeOrderableWhenAvailableAndHasPositivePrice() {
            // Given
            assertTrue(menuItem.getIsAvailable());
            assertTrue(menuItem.getPrice().getAmount().compareTo(BigDecimal.ZERO) > 0);
            
            // When & Then
            assertTrue(menuItem.canBeOrdered());
        }
        
        @Test
        @DisplayName("Should not be orderable when unavailable")
        void shouldNotBeOrderableWhenUnavailable() {
            // Given
            menuItem.makeUnavailable();
            
            // When & Then
            assertFalse(menuItem.canBeOrdered());
        }
        
        @Test
        @DisplayName("Should calculate total price with base price")
        void shouldCalculateTotalPriceWithBasePrice() {
            // When
            Price totalPrice = menuItem.calculateTotalPrice(Arrays.asList());
            
            // Then
            assertEquals(menuItem.getPrice(), totalPrice);
        }
        
        @Test
        @DisplayName("Should get total preparation time")
        void shouldGetTotalPreparationTime() {
            // Given
            menuItem.setPreparationTime(20);
            
            // When
            PreparationTime totalTime = menuItem.getTotalPreparationTime();
            
            // Then
            assertEquals(20, totalTime.getMinutes());
        }
        
        @Test
        @DisplayName("Should format price correctly")
        void shouldFormatPriceCorrectly() {
            // When
            String formattedPrice = menuItem.getFormattedPrice();
            
            // Then
            assertTrue(formattedPrice.contains("12,50"));
            assertTrue(formattedPrice.contains("€"));
        }
        
        @Test
        @DisplayName("Should check dietary compatibility")
        void shouldCheckDietaryCompatibility() {
            // Given
            menuItem.markAsVegetarian();
            menuItem.addAllergen("gluten");
            
            // When & Then
            assertTrue(menuItem.isCompatibleWith("vegetarian"));
            assertFalse(menuItem.isCompatibleWith("vegan"));
            assertFalse(menuItem.isCompatibleWith("gluten-free"));
            assertTrue(menuItem.isCompatibleWith("dairy-free")); // No dairy allergen
        }
    }
    
    @Nested
    @DisplayName("Image Management")
    class ImageManagement {
        
        @Test
        @DisplayName("Should update image URL")
        void shouldUpdateImageUrl() {
            // When
            menuItem.setImageUrl("/uploads/pizza123.jpg");
            
            // Then
            assertEquals("/uploads/pizza123.jpg", menuItem.getImageUrl());
            assertNotNull(menuItem.getLastUpdated());
        }
        
        @Test
        @DisplayName("Should handle null image URL")
        void shouldHandleNullImageUrl() {
            // When
            menuItem.setImageUrl(null);
            
            // Then
            assertNull(menuItem.getImageUrl());
        }
        
        @Test
        @DisplayName("Should validate image URL format")
        void shouldValidateImageUrlFormat() {
            // When & Then - Valid URLs
            assertDoesNotThrow(() -> menuItem.setImageUrl("/uploads/image.jpg"));
            assertDoesNotThrow(() -> menuItem.setImageUrl("https://example.com/image.png"));
            
            // Invalid URL format should be handled gracefully or validated
            // (depending on business rules)
        }
    }
    
    @Nested
    @DisplayName("Domain Events")
    class DomainEvents {
        
        @Test
        @DisplayName("Should emit MenuItemCreatedEvent when created with factory")
        void shouldEmitMenuItemCreatedEventWhenCreatedWithFactory() {
            // When
            MenuItem newItem = MenuItem.create(
                restaurantId,
                "Event Test Item",
                "Test description",
                Price.of(new BigDecimal("10.00")),
                "TEST"
            );
            
            // Then
            assertEquals(1, newItem.getDomainEvents().size());
            assertTrue(newItem.getDomainEvents().get(0) instanceof com.oneeats.menu.domain.event.MenuItemCreatedEvent);
        }
        
        @Test
        @DisplayName("Should emit MenuItemUpdatedEvent when basic info updated")
        void shouldEmitMenuItemUpdatedEventWhenBasicInfoUpdated() {
            // Given
            menuItem.clearDomainEvents();
            
            // When
            menuItem.updateBasicInfo(
                "Updated Name",
                "Updated Description",
                Price.of(new BigDecimal("15.00")),
                "UPDATED"
            );
            
            // Then
            assertEquals(1, menuItem.getDomainEvents().size());
            assertTrue(menuItem.getDomainEvents().get(0) instanceof com.oneeats.menu.domain.event.MenuItemUpdatedEvent);
        }
        
        @Test
        @DisplayName("Should emit MenuItemAvailabilityChangedEvent when availability changed")
        void shouldEmitMenuItemAvailabilityChangedEventWhenAvailabilityChanged() {
            // Given
            menuItem.clearDomainEvents();
            
            // When
            menuItem.makeUnavailable();
            
            // Then
            assertEquals(1, menuItem.getDomainEvents().size());
            assertTrue(menuItem.getDomainEvents().get(0) instanceof com.oneeats.menu.domain.event.MenuItemAvailabilityChangedEvent);
        }
        
        @Test
        @DisplayName("Should clear domain events")
        void shouldClearDomainEvents() {
            // Given
            menuItem.updateBasicInfo("Test", "Test", testPrice, "TEST"); // Generates event
            assertFalse(menuItem.getDomainEvents().isEmpty());
            
            // When
            menuItem.clearDomainEvents();
            
            // Then
            assertTrue(menuItem.getDomainEvents().isEmpty());
        }
    }
    
    @Nested
    @DisplayName("String Representation")
    class StringRepresentation {
        
        @Test
        @DisplayName("Should have meaningful toString representation")
        void shouldHaveMeaningfulToStringRepresentation() {
            // When
            String toString = menuItem.toString();
            
            // Then
            assertNotNull(toString);
            assertTrue(toString.contains("Margherita Pizza"));
            assertTrue(toString.contains("12.50"));
            assertTrue(toString.contains("PIZZA"));
            assertTrue(toString.contains("available=true"));
        }
    }
}