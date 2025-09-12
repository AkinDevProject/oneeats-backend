package com.oneeats.restaurant.domain.model;

import com.oneeats.shared.domain.vo.Email;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Restaurant Domain Model Tests")
class RestaurantTest {
    
    private Restaurant restaurant;
    private UUID restaurantId;
    
    @BeforeEach
    void setUp() {
        restaurantId = UUID.randomUUID();
        restaurant = new Restaurant(
            restaurantId,
            "Pizza Palace",
            "Best pizza in town",
            "123 Main Street",
            "0123456789",
            new Email("contact@pizzapalace.fr"),
            "PIZZA",
            RestaurantStatus.PENDING
        );
    }
    
    @Nested
    @DisplayName("Restaurant Creation")
    class RestaurantCreation {
        
        @Test
        @DisplayName("Should create restaurant with factory method")
        void shouldCreateRestaurantWithFactoryMethod() {
            // When
            Restaurant newRestaurant = Restaurant.create(
                "New Restaurant",
                "Great food",
                "456 Oak Street",
                "0987654321",
                "contact@newrestaurant.fr",
                "ITALIAN"
            );
            
            // Then
            assertNotNull(newRestaurant);
            assertNotNull(newRestaurant.getId());
            assertEquals("New Restaurant", newRestaurant.getName());
            assertEquals("Great food", newRestaurant.getDescription());
            assertEquals("456 Oak Street", newRestaurant.getAddress());
            assertEquals("0987654321", newRestaurant.getPhone());
            assertEquals("contact@newrestaurant.fr", newRestaurant.getEmail().getValue());
            assertEquals("ITALIAN", newRestaurant.getCuisineType());
            assertEquals(RestaurantStatus.PENDING, newRestaurant.getStatus());
            assertEquals(0.0, newRestaurant.getRating());
            assertNotNull(newRestaurant.getSchedule());
            
            // Should have domain event
            assertFalse(newRestaurant.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should initialize with default values")
        void shouldInitializeWithDefaultValues() {
            // Then
            assertEquals(0.0, restaurant.getRating());
            assertNotNull(restaurant.getSchedule());
            assertEquals(RestaurantStatus.PENDING, restaurant.getStatus());
        }
    }
    
    @Nested
    @DisplayName("Restaurant Information Updates")
    class RestaurantInformationUpdates {
        
        @Test
        @DisplayName("Should update restaurant information")
        void shouldUpdateRestaurantInformation() {
            // When
            restaurant.updateInfo(
                "Updated Pizza Palace",
                "Updated description",
                "789 New Street",
                "0555123456",
                "updated@pizzapalace.fr"
            );
            
            // Then
            assertEquals("Updated Pizza Palace", restaurant.getName());
            assertEquals("Updated description", restaurant.getDescription());
            assertEquals("789 New Street", restaurant.getAddress());
            assertEquals("0555123456", restaurant.getPhone());
            assertEquals("updated@pizzapalace.fr", restaurant.getEmail().getValue());
            assertNotNull(restaurant.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should update schedule")
        void shouldUpdateSchedule() {
            // Given
            WeeklySchedule newSchedule = new WeeklySchedule();
            
            // When
            restaurant.updateSchedule(newSchedule);
            
            // Then
            assertEquals(newSchedule, restaurant.getSchedule());
            assertNotNull(restaurant.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should update rating")
        void shouldUpdateRating() {
            // When
            restaurant.updateRating(4.5);
            
            // Then
            assertEquals(4.5, restaurant.getRating());
            assertNotNull(restaurant.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should reject invalid rating")
        void shouldRejectInvalidRating() {
            // Then
            assertThrows(IllegalArgumentException.class, () -> restaurant.updateRating(-1.0));
            assertThrows(IllegalArgumentException.class, () -> restaurant.updateRating(6.0));
        }
        
        @Test
        @DisplayName("Should update image URL")
        void shouldUpdateImageUrl() {
            // When
            restaurant.setImageUrl("/uploads/restaurant123.jpg");
            
            // Then
            assertEquals("/uploads/restaurant123.jpg", restaurant.getImageUrl());
            assertNotNull(restaurant.getUpdatedAt());
        }
    }
    
    @Nested
    @DisplayName("Restaurant Status Management")
    class RestaurantStatusManagement {
        
        @Test
        @DisplayName("Should activate pending restaurant")
        void shouldActivatePendingRestaurant() {
            // Given
            assertEquals(RestaurantStatus.PENDING, restaurant.getStatus());
            
            // When
            restaurant.activate();
            
            // Then
            assertEquals(RestaurantStatus.ACTIVE, restaurant.getStatus());
            assertNotNull(restaurant.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should throw exception when activating already active restaurant")
        void shouldThrowExceptionWhenActivatingAlreadyActiveRestaurant() {
            // Given
            restaurant.activate();
            
            // When & Then
            assertThrows(IllegalStateException.class, () -> restaurant.activate());
        }
        
        @Test
        @DisplayName("Should open active restaurant")
        void shouldOpenActiveRestaurant() {
            // Given
            restaurant.activate();
            
            // When
            restaurant.open();
            
            // Then
            assertEquals(RestaurantStatus.OPEN, restaurant.getStatus());
            assertNotNull(restaurant.getUpdatedAt());
            assertFalse(restaurant.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should throw exception when opening inactive restaurant")
        void shouldThrowExceptionWhenOpeningInactiveRestaurant() {
            // Given - restaurant is PENDING
            
            // When & Then
            assertThrows(IllegalStateException.class, () -> restaurant.open());
        }
        
        @Test
        @DisplayName("Should throw exception when opening already open restaurant")
        void shouldThrowExceptionWhenOpeningAlreadyOpenRestaurant() {
            // Given
            restaurant.activate();
            restaurant.open();
            
            // When & Then
            assertThrows(IllegalStateException.class, () -> restaurant.open());
        }
        
        @Test
        @DisplayName("Should close open restaurant")
        void shouldCloseOpenRestaurant() {
            // Given
            restaurant.activate();
            restaurant.open();
            
            // When
            restaurant.close();
            
            // Then
            assertEquals(RestaurantStatus.ACTIVE, restaurant.getStatus());
            assertNotNull(restaurant.getUpdatedAt());
            assertFalse(restaurant.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should throw exception when closing non-open restaurant")
        void shouldThrowExceptionWhenClosingNonOpenRestaurant() {
            // Given
            restaurant.activate(); // ACTIVE but not OPEN
            
            // When & Then
            assertThrows(IllegalStateException.class, () -> restaurant.close());
        }
        
        @Test
        @DisplayName("Should suspend restaurant")
        void shouldSuspendRestaurant() {
            // When
            restaurant.suspend();
            
            // Then
            assertEquals(RestaurantStatus.SUSPENDED, restaurant.getStatus());
            assertNotNull(restaurant.getUpdatedAt());
        }
    }
    
    @Nested
    @DisplayName("Restaurant Business Logic")
    class RestaurantBusinessLogic {
        
        @Test
        @DisplayName("Should accept orders when open")
        void shouldAcceptOrdersWhenOpen() {
            // Given
            restaurant.activate();
            restaurant.open();
            
            // When & Then
            assertTrue(restaurant.canAcceptOrders());
        }
        
        @Test
        @DisplayName("Should not accept orders when not open")
        void shouldNotAcceptOrdersWhenNotOpen() {
            // Given - restaurant is PENDING
            assertFalse(restaurant.canAcceptOrders());
            
            // Given - restaurant is ACTIVE but not OPEN
            restaurant.activate();
            assertFalse(restaurant.canAcceptOrders());
            
            // Given - restaurant is SUSPENDED
            restaurant.suspend();
            assertFalse(restaurant.canAcceptOrders());
        }
        
        @Test
        @DisplayName("Should be active when status is ACTIVE or OPEN")
        void shouldBeActiveWhenStatusIsActiveOrOpen() {
            // Given - PENDING
            assertFalse(restaurant.isActive());
            
            // Given - ACTIVE
            restaurant.activate();
            assertTrue(restaurant.isActive());
            
            // Given - OPEN
            restaurant.open();
            assertTrue(restaurant.isActive());
            
            // Given - SUSPENDED
            restaurant.suspend();
            assertFalse(restaurant.isActive());
        }
    }
    
    @Nested
    @DisplayName("Domain Events")
    class DomainEvents {
        
        @Test
        @DisplayName("Should emit RestaurantCreatedEvent when created with factory")
        void shouldEmitRestaurantCreatedEventWhenCreatedWithFactory() {
            // When
            Restaurant newRestaurant = Restaurant.create(
                "Test Restaurant",
                "Test description",
                "Test address",
                "0123456789",
                "test@restaurant.fr",
                "TEST"
            );
            
            // Then
            assertEquals(1, newRestaurant.getDomainEvents().size());
            assertTrue(newRestaurant.getDomainEvents().get(0) instanceof com.oneeats.restaurant.domain.event.RestaurantCreatedEvent);
        }
        
        @Test
        @DisplayName("Should emit RestaurantOpenedEvent when opened")
        void shouldEmitRestaurantOpenedEventWhenOpened() {
            // Given
            restaurant.activate();
            restaurant.clearDomainEvents();
            
            // When
            restaurant.open();
            
            // Then
            assertEquals(1, restaurant.getDomainEvents().size());
            assertTrue(restaurant.getDomainEvents().get(0) instanceof com.oneeats.restaurant.domain.event.RestaurantOpenedEvent);
        }
        
        @Test
        @DisplayName("Should emit RestaurantClosedEvent when closed")
        void shouldEmitRestaurantClosedEventWhenClosed() {
            // Given
            restaurant.activate();
            restaurant.open();
            restaurant.clearDomainEvents();
            
            // When
            restaurant.close();
            
            // Then
            assertEquals(1, restaurant.getDomainEvents().size());
            assertTrue(restaurant.getDomainEvents().get(0) instanceof com.oneeats.restaurant.domain.event.RestaurantClosedEvent);
        }
    }
}