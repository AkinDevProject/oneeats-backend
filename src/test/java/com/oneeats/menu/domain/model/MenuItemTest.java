package com.oneeats.menu.domain.model;

import com.oneeats.menu.domain.vo.*;
import com.oneeats.menu.domain.event.MenuItemCreatedEvent;
import com.oneeats.menu.domain.event.MenuItemUpdatedEvent;
import com.oneeats.menu.domain.event.MenuItemAvailabilityChangedEvent;
import com.oneeats.shared.domain.exception.ValidationException;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("MenuItem Domain Model Tests")
class MenuItemTest {
    
    @Nested
    @DisplayName("MenuItem Creation")
    class MenuItemCreation {
        
        @Test
        @DisplayName("Should create menu item with valid data")
        void shouldCreateMenuItemWithValidData() {
            // Given
            UUID restaurantId = UUID.randomUUID();
            Price price = Price.of(new BigDecimal("12.99"));
            
            // When
            MenuItem menuItem = MenuItem.create(
                restaurantId, "Margherita Pizza", "Classic tomato and mozzarella", 
                price, "PIZZA");
            
            // Then
            assertNotNull(menuItem);
            assertEquals(restaurantId, menuItem.getRestaurantId());
            assertEquals("Margherita Pizza", menuItem.getName().getValue());
            assertEquals("Classic tomato and mozzarella", menuItem.getDescription());
            assertEquals(price, menuItem.getPrice());
            assertEquals("PIZZA", menuItem.getCategory().getValue());
            assertTrue(menuItem.getIsAvailable()); // Available by default
            assertFalse(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
            assertNotNull(menuItem.getPreparationTime());
            assertNotNull(menuItem.getAllergens());
            assertTrue(menuItem.getOptions().isEmpty());
            assertNotNull(menuItem.getLastUpdated());
            
            // Check domain event was published
            assertEquals(1, menuItem.getDomainEvents().size());
            assertTrue(menuItem.getDomainEvents().get(0) instanceof MenuItemCreatedEvent);
            MenuItemCreatedEvent event = (MenuItemCreatedEvent) menuItem.getDomainEvents().get(0);
            assertEquals(menuItem.getId(), event.getMenuItemId());
            assertEquals(restaurantId, event.getRestaurantId());
        }
        
        @Test
        @DisplayName("Should throw exception for null restaurant ID")
        void shouldThrowExceptionForNullRestaurantId() {
            ValidationException exception = assertThrows(ValidationException.class, () -> 
                MenuItem.create(null, "Pizza", "Description", Price.of(BigDecimal.TEN), "PIZZA"));
            assertEquals("Restaurant ID cannot be null", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should create from persistence data")
        void shouldCreateFromPersistenceData() {
            // Given
            UUID id = UUID.randomUUID();
            UUID restaurantId = UUID.randomUUID();
            Price price = Price.of(new BigDecimal("15.50"));
            LocalDateTime createdAt = LocalDateTime.now().minusDays(1);
            LocalDateTime updatedAt = LocalDateTime.now().minusHours(2);
            
            // When
            MenuItem menuItem = MenuItem.fromPersistence(
                id, restaurantId, "Pepperoni Pizza", "Pizza with pepperoni",
                price, "PIZZA", "pizza.jpg", true, 20, true, false,
                "gluten,dairy", createdAt, updatedAt
            );
            
            // Then
            assertEquals(id, menuItem.getId());
            assertEquals(restaurantId, menuItem.getRestaurantId());
            assertEquals("Pepperoni Pizza", menuItem.getName().getValue());
            assertEquals("pizza.jpg", menuItem.getImageUrl());
            assertTrue(menuItem.getIsAvailable());
            assertEquals(20, menuItem.getPreparationTimeMinutes());
            assertTrue(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
            assertEquals(createdAt, menuItem.getCreatedAt());
            assertEquals(updatedAt, menuItem.getLastUpdated());
            
            // No domain events should be generated for persistence reconstruction
            assertTrue(menuItem.getDomainEvents().isEmpty());
        }
    }
    
    @Nested
    @DisplayName("MenuItem Basic Updates")
    class MenuItemBasicUpdates {
        
        private MenuItem createTestMenuItem() {
            MenuItem item = MenuItem.create(
                UUID.randomUUID(), "Test Item", "Test Description",
                Price.of(BigDecimal.TEN), "TEST"
            );
            item.clearDomainEvents();
            return item;
        }
        
        @Test
        @DisplayName("Should update basic info when changes occur")
        void shouldUpdateBasicInfoWhenChangesOccur() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            LocalDateTime originalLastUpdated = menuItem.getLastUpdated();
            Price newPrice = Price.of(new BigDecimal("15.99"));
            
            // When - Add small delay to ensure timestamp difference
            try { Thread.sleep(10); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            menuItem.updateBasicInfo("Updated Item", "Updated Description", newPrice, "UPDATED");
            
            // Then
            assertEquals("Updated Item", menuItem.getName().getValue());
            assertEquals("Updated Description", menuItem.getDescription());
            assertEquals(newPrice, menuItem.getPrice());
            assertEquals("UPDATED", menuItem.getCategory().getValue());
            assertTrue(menuItem.getLastUpdated().isAfter(originalLastUpdated));
            
            // Check domain event was published
            assertEquals(1, menuItem.getDomainEvents().size());
            assertTrue(menuItem.getDomainEvents().get(0) instanceof MenuItemUpdatedEvent);
        }
        
        @Test
        @DisplayName("Should not publish event when no changes occur")
        void shouldNotPublishEventWhenNoChangesOccur() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            LocalDateTime originalLastUpdated = menuItem.getLastUpdated();
            
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
    }
    
    @Nested
    @DisplayName("MenuItem Dietary Information")
    class MenuItemDietaryInformation {
        
        private MenuItem createTestMenuItem() {
            MenuItem item = MenuItem.create(
                UUID.randomUUID(), "Test Item", "Test Description",
                Price.of(BigDecimal.TEN), "TEST"
            );
            item.clearDomainEvents();
            return item;
        }
        
        @Test
        @DisplayName("Should update dietary info with vegan automatically making vegetarian")
        void shouldUpdateDietaryInfoWithVeganAutomaticallyMakingVegetarian() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            List<String> allergens = Arrays.asList("tree_nuts", "soy");
            
            // When - Set as vegan but not vegetarian
            menuItem.updateDietaryInfo(false, true, allergens);
            
            // Then - Should automatically be vegetarian if vegan
            assertTrue(menuItem.getIsVegetarian());
            assertTrue(menuItem.getIsVegan());
            assertEquals(allergens, menuItem.getAllergens().toStringList());
            
            // Check domain event was published
            assertEquals(1, menuItem.getDomainEvents().size());
            assertTrue(menuItem.getDomainEvents().get(0) instanceof MenuItemUpdatedEvent);
        }
        
        @Test
        @DisplayName("Should update dietary info with null allergens")
        void shouldUpdateDietaryInfoWithNullAllergens() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            
            // When
            menuItem.updateDietaryInfo(true, false, null);
            
            // Then
            assertTrue(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
            assertTrue(menuItem.getAllergens().isEmpty());
        }
        
        @Test
        @DisplayName("Should mark as vegetarian")
        void shouldMarkAsVegetarian() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            
            // When
            menuItem.markAsVegetarian();
            
            // Then
            assertTrue(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
            assertEquals(1, menuItem.getDomainEvents().size());
        }
        
        @Test
        @DisplayName("Should mark as vegan and automatically vegetarian")
        void shouldMarkAsVeganAndAutomaticallyVegetarian() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            
            // When
            menuItem.markAsVegan();
            
            // Then
            assertTrue(menuItem.getIsVegetarian());
            assertTrue(menuItem.getIsVegan());
            assertEquals(1, menuItem.getDomainEvents().size());
        }
        
        @Test
        @DisplayName("Should unmark vegetarian and automatically unmark vegan")
        void shouldUnmarkVegetarianAndAutomaticallyUnmarkVegan() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            menuItem.markAsVegan(); // Make it vegan first
            menuItem.clearDomainEvents();
            
            // When
            menuItem.unmarkAsVegetarian();
            
            // Then
            assertFalse(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
            assertEquals(1, menuItem.getDomainEvents().size());
        }
        
        @Test
        @DisplayName("Should unmark vegan while keeping vegetarian")
        void shouldUnmarkVeganWhileKeepingVegetarian() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            menuItem.markAsVegan(); // Make it vegan first
            menuItem.clearDomainEvents();
            
            // When
            menuItem.unmarkAsVegan();
            
            // Then
            assertTrue(menuItem.getIsVegetarian());
            assertFalse(menuItem.getIsVegan());
            assertEquals(1, menuItem.getDomainEvents().size());
        }
    }
    
    @Nested
    @DisplayName("MenuItem Availability Management")
    class MenuItemAvailabilityManagement {
        
        private MenuItem createTestMenuItem() {
            MenuItem item = MenuItem.create(
                UUID.randomUUID(), "Test Item", "Test Description",
                Price.of(BigDecimal.TEN), "TEST"
            );
            item.clearDomainEvents();
            return item;
        }
        
        @Test
        @DisplayName("Should make available when currently unavailable")
        void shouldMakeAvailableWhenCurrentlyUnavailable() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            menuItem.makeUnavailable(); // First make unavailable
            menuItem.clearDomainEvents();
            
            // When
            menuItem.makeAvailable();
            
            // Then
            assertTrue(menuItem.getIsAvailable());
            assertEquals(1, menuItem.getDomainEvents().size());
            assertTrue(menuItem.getDomainEvents().get(0) instanceof MenuItemAvailabilityChangedEvent);
            MenuItemAvailabilityChangedEvent event = (MenuItemAvailabilityChangedEvent) menuItem.getDomainEvents().get(0);
            assertTrue(event.isAvailable());
        }
        
        @Test
        @DisplayName("Should not publish event when already available")
        void shouldNotPublishEventWhenAlreadyAvailable() {
            // Given
            MenuItem menuItem = createTestMenuItem(); // Already available by default
            
            // When
            menuItem.makeAvailable();
            
            // Then
            assertTrue(menuItem.getIsAvailable());
            assertTrue(menuItem.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should make unavailable when currently available")
        void shouldMakeUnavailableWhenCurrentlyAvailable() {
            // Given
            MenuItem menuItem = createTestMenuItem(); // Available by default
            
            // When
            menuItem.makeUnavailable();
            
            // Then
            assertFalse(menuItem.getIsAvailable());
            assertEquals(1, menuItem.getDomainEvents().size());
            assertTrue(menuItem.getDomainEvents().get(0) instanceof MenuItemAvailabilityChangedEvent);
            MenuItemAvailabilityChangedEvent event = (MenuItemAvailabilityChangedEvent) menuItem.getDomainEvents().get(0);
            assertFalse(event.isAvailable());
        }
    }
    
    @Nested
    @DisplayName("MenuItem Options Management")
    class MenuItemOptionsManagement {
        
        private MenuItem createTestMenuItem() {
            MenuItem item = MenuItem.create(
                UUID.randomUUID(), "Test Item", "Test Description",
                Price.of(BigDecimal.TEN), "TEST"
            );
            item.clearDomainEvents();
            return item;
        }
        
        private MenuItemOption createTestOption(String name) {
            return new MenuItemOption(name, "Test option description", MenuItemOptionType.CHOICE, true, 1, 0);
        }
        
        @Test
        @DisplayName("Should add option when valid")
        void shouldAddOptionWhenValid() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            MenuItemOption option = createTestOption("Size");
            
            // When
            menuItem.addOption(option);
            
            // Then
            assertEquals(1, menuItem.getOptions().size());
            assertEquals("Size", menuItem.getOptions().get(0).getName());
        }
        
        @Test
        @DisplayName("Should throw exception when adding null option")
        void shouldThrowExceptionWhenAddingNullOption() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, () ->
                menuItem.addOption(null));
            assertEquals("Option cannot be null", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should throw exception when adding duplicate option")
        void shouldThrowExceptionWhenAddingDuplicateOption() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            MenuItemOption option1 = createTestOption("Size");
            MenuItemOption option2 = createTestOption("Size");
            menuItem.addOption(option1);
            
            // When & Then
            ValidationException exception = assertThrows(ValidationException.class, () ->
                menuItem.addOption(option2));
            assertEquals("Option with name 'Size' already exists", exception.getMessage());
        }
        
        @Test
        @DisplayName("Should remove option by name")
        void shouldRemoveOptionByName() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            MenuItemOption option = createTestOption("Size");
            menuItem.addOption(option);
            
            // When
            menuItem.removeOption("Size");
            
            // Then
            assertTrue(menuItem.getOptions().isEmpty());
        }
    }
    
    @Nested
    @DisplayName("MenuItem Business Logic")
    class MenuItemBusinessLogic {
        
        private MenuItem createTestMenuItem() {
            MenuItem item = MenuItem.create(
                UUID.randomUUID(), "Test Item", "Test Description",
                Price.of(BigDecimal.TEN), "TEST"
            );
            item.clearDomainEvents();
            return item;
        }
        
        @Test
        @DisplayName("Should calculate total price without options")
        void shouldCalculateTotalPriceWithoutOptions() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            
            // When
            Price totalPrice = menuItem.calculateTotalPrice(Arrays.asList());
            
            // Then
            assertEquals(menuItem.getPrice(), totalPrice);
        }
        
        @Test
        @DisplayName("Should be orderable when available and has price")
        void shouldBeOrderableWhenAvailableAndHasPrice() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            
            // When & Then
            assertTrue(menuItem.canBeOrdered());
        }
        
        @Test
        @DisplayName("Should not be orderable when unavailable")
        void shouldNotBeOrderableWhenUnavailable() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            menuItem.makeUnavailable();
            
            // When & Then
            assertFalse(menuItem.canBeOrdered());
        }
        
        @Test
        @DisplayName("Should not be orderable when price is zero")
        void shouldNotBeOrderableWhenPriceIsZero() {
            // Given
            MenuItem menuItem = MenuItem.create(
                UUID.randomUUID(), "Free Item", "Free Description",
                Price.of(BigDecimal.ZERO), "TEST"
            );
            
            // When & Then
            assertFalse(menuItem.canBeOrdered());
        }
        
        @Test
        @DisplayName("Should get total preparation time")
        void shouldGetTotalPreparationTime() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            menuItem.setPreparationTime(25);
            
            // When
            PreparationTime totalTime = menuItem.getTotalPreparationTime();
            
            // Then
            assertEquals(25, totalTime.getMinutes());
        }
    }
    
    @Nested
    @DisplayName("MenuItem Property Updates")
    class MenuItemPropertyUpdates {
        
        private MenuItem createTestMenuItem() {
            MenuItem item = MenuItem.create(
                UUID.randomUUID(), "Test Item", "Test Description",
                Price.of(BigDecimal.TEN), "TEST"
            );
            item.clearDomainEvents();
            return item;
        }
        
        @Test
        @DisplayName("Should update preparation time")
        void shouldUpdatePreparationTime() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            
            // When
            menuItem.setPreparationTime(30);
            
            // Then
            assertEquals(30, menuItem.getPreparationTimeMinutes());
        }
        
        @Test
        @DisplayName("Should update image URL")
        void shouldUpdateImageUrl() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            
            // When
            menuItem.setImageUrl("new-image.jpg");
            
            // Then
            assertEquals("new-image.jpg", menuItem.getImageUrl());
        }
        
        @Test
        @DisplayName("Should update individual properties and publish events")
        void shouldUpdateIndividualPropertiesAndPublishEvents() {
            // Given
            MenuItem menuItem = createTestMenuItem();
            
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
            
            // Should have published 4 events
            assertEquals(4, menuItem.getDomainEvents().size());
            assertTrue(menuItem.getDomainEvents().stream()
                .allMatch(event -> event instanceof MenuItemUpdatedEvent));
        }
    }
    
    @Nested
    @DisplayName("MenuItem String Representation")
    class MenuItemStringRepresentation {
        
        @Test
        @DisplayName("Should have meaningful toString representation")
        void shouldHaveMeaningfulToStringRepresentation() {
            // Given
            MenuItem menuItem = MenuItem.create(
                UUID.randomUUID(), "Test Pizza", "Delicious pizza",
                Price.of(new BigDecimal("12.99")), "PIZZA"
            );
            
            // When
            String toString = menuItem.toString();
            
            // Then
            assertNotNull(toString);
            assertTrue(toString.contains("Test Pizza"));
            assertTrue(toString.contains("12.99"));
            assertTrue(toString.contains("PIZZA"));
            assertTrue(toString.contains("available=true"));
        }
    }
}