package com.oneeats.unit.restaurant.domain;

import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.domain.model.WeeklySchedule;
import com.oneeats.shared.domain.vo.Email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS UNITAIRES PURS
 * - Aucune annotation @QuarkusTest
 * - Aucune injection @Inject
 * - Aucune base de données
 * - Teste UNIQUEMENT la logique métier de l'entité Restaurant
 */
@DisplayName("Restaurant Unit Tests - Pure Domain Logic")
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
    @DisplayName("Business Rules Validation")
    class BusinessRulesValidation {
        
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
        @DisplayName("Should reject activation of already active restaurant")
        void shouldRejectActivationOfAlreadyActiveRestaurant() {
            // Given
            restaurant.activate();
            
            // When & Then
            IllegalStateException exception = assertThrows(
                IllegalStateException.class, 
                () -> restaurant.activate()
            );
            assertEquals("Restaurant is already active", exception.getMessage());
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
            assertFalse(restaurant.getDomainEvents().isEmpty());
        }
        
        @Test
        @DisplayName("Should reject opening of non-active restaurant")
        void shouldRejectOpeningOfNonActiveRestaurant() {
            // Given - restaurant is PENDING
            
            // When & Then
            IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> restaurant.open()
            );
            assertTrue(exception.getMessage().contains("Cannot open"));
        }
    }
    
    @Nested
    @DisplayName("Information Updates")
    class InformationUpdates {
        
        @Test
        @DisplayName("Should update restaurant information")
        void shouldUpdateRestaurantInformation() {
            // Given
            String newName = "Updated Pizza Palace";
            String newDescription = "Even better pizza";
            
            // When
            restaurant.updateInfo(newName, newDescription, null, null, null);
            
            // Then
            assertEquals(newName, restaurant.getName());
            assertEquals(newDescription, restaurant.getDescription());
            assertNotNull(restaurant.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should update rating with valid value")
        void shouldUpdateRatingWithValidValue() {
            // When
            restaurant.updateRating(4.5);
            
            // Then
            assertEquals(4.5, restaurant.getRating());
        }
        
        @Test
        @DisplayName("Should reject invalid rating values")
        void shouldRejectInvalidRatingValues() {
            // When & Then
            assertThrows(IllegalArgumentException.class, () -> restaurant.updateRating(-1.0));
            assertThrows(IllegalArgumentException.class, () -> restaurant.updateRating(6.0));
        }
    }
    
    @Nested
    @DisplayName("Schedule Management")
    class ScheduleManagement {
        
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
    }
    
    @Nested
    @DisplayName("Business Logic Queries")
    class BusinessLogicQueries {
        
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
            
            // When & Then
            assertFalse(restaurant.canAcceptOrders());
        }
        
        @Test
        @DisplayName("Should be active when status is ACTIVE or OPEN")
        void shouldBeActiveWhenStatusIsActiveOrOpen() {
            // PENDING
            assertFalse(restaurant.isActive());
            
            // ACTIVE
            restaurant.activate();
            assertTrue(restaurant.isActive());
            
            // OPEN
            restaurant.open();
            assertTrue(restaurant.isActive());
            
            // SUSPENDED
            restaurant.suspend();
            assertFalse(restaurant.isActive());
        }
    }
    
    @Nested
    @DisplayName("Domain Events")
    class DomainEvents {
        
        @Test
        @DisplayName("Should emit domain events on business operations")
        void shouldEmitDomainEventsOnBusinessOperations() {
            // Given
            restaurant.clearDomainEvents();
            
            // When
            restaurant.activate();
            restaurant.open();
            
            // Then
            assertFalse(restaurant.getDomainEvents().isEmpty());
            assertTrue(restaurant.getDomainEvents().size() >= 1);
        }
        
        @Test
        @DisplayName("Should clear domain events")
        void shouldClearDomainEvents() {
            // Given
            restaurant.activate(); // Generates event
            assertFalse(restaurant.getDomainEvents().isEmpty());
            
            // When
            restaurant.clearDomainEvents();
            
            // Then
            assertTrue(restaurant.getDomainEvents().isEmpty());
        }
    }
}