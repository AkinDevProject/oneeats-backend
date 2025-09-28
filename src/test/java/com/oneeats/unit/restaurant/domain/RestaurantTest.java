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
        @DisplayName("Should approve pending restaurant")
        void shouldApprovePendingRestaurant() {
            // Given - Restaurant is created with PENDING status
            assertEquals(RestaurantStatus.PENDING, restaurant.getStatus());

            // When - Admin approves the restaurant
            restaurant.approve();

            // Then - Restaurant status changes to APPROVED
            assertEquals(RestaurantStatus.APPROVED, restaurant.getStatus());
            assertNotNull(restaurant.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should prevent reapproval of already approved restaurant")
        void shouldPreventReapprovalOfAlreadyApprovedRestaurant() {
            // Given - Restaurant is already approved
            restaurant.approve();
            assertEquals(RestaurantStatus.APPROVED, restaurant.getStatus());

            // When & Then - Admin re-approves should throw exception
            assertThrows(IllegalStateException.class, () -> restaurant.approve());

            // Restaurant remains approved
            assertEquals(RestaurantStatus.APPROVED, restaurant.getStatus());
        }
        
        @Test
        @DisplayName("Should open approved restaurant")
        void shouldOpenApprovedRestaurant() {
            // Given - Restaurant is approved and can be opened
            restaurant.approve();
            assertFalse(restaurant.isOpen()); // Initially closed

            // When - Restaurant opens for business
            restaurant.open();

            // Then - Restaurant is now open for orders
            assertTrue(restaurant.isOpen());
            assertTrue(restaurant.canAcceptOrders());
        }
        
        @Test
        @DisplayName("Should block restaurant and prevent orders")
        void shouldBlockRestaurantAndPreventOrders() {
            // Given - Restaurant is approved and open (can accept orders)
            restaurant.approve();
            restaurant.open(); // Must be open to accept orders
            assertTrue(restaurant.canAcceptOrders());

            // When - Admin blocks the restaurant
            restaurant.block();

            // Then - Restaurant is blocked and cannot accept orders
            assertEquals(RestaurantStatus.BLOCKED, restaurant.getStatus());
            assertFalse(restaurant.canAcceptOrders());
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

            // When - Update with new name and description, keeping existing contact info
            restaurant.updateInfo(newName, newDescription, null, null, "updated@pizzapalace.fr");

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
        @DisplayName("Should accept orders when approved and open")
        void shouldAcceptOrdersWhenApprovedAndOpen() {
            // Given - Restaurant needs to be approved first
            restaurant.approve();
            restaurant.open();

            // When & Then - Approved and open restaurant can accept orders
            assertTrue(restaurant.canAcceptOrders());
            assertTrue(restaurant.isActive());
        }
        
        @Test
        @DisplayName("Should not accept orders when not open")
        void shouldNotAcceptOrdersWhenNotOpen() {
            // Given - restaurant is PENDING
            
            // When & Then
            assertFalse(restaurant.canAcceptOrders());
        }
        
        @Test
        @DisplayName("Should be active when status is APPROVED or when open")
        void shouldBeActiveWhenStatusIsApprovedOrWhenOpen() {
            // Given - PENDING restaurants are not active
            assertFalse(restaurant.isActive());

            // When - Restaurant is approved
            restaurant.approve();
            // Then - Restaurant becomes active
            assertTrue(restaurant.isActive());

            // When - Restaurant is blocked
            restaurant.block();
            // Then - Restaurant is no longer active
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
            
            // When - Perform business operations that generate events
            restaurant.approve();
            restaurant.open();

            // Then - Domain events should be generated
            assertFalse(restaurant.getDomainEvents().isEmpty());
            assertTrue(restaurant.getDomainEvents().size() >= 1);
        }
        
        @Test
        @DisplayName("Should clear domain events")
        void shouldClearDomainEvents() {
            // Given - Generate domain events through business operations
            restaurant.approve(); // Generates domain event
            assertFalse(restaurant.getDomainEvents().isEmpty());

            // When - Clear all domain events
            restaurant.clearDomainEvents();

            // Then - No domain events should remain
            assertTrue(restaurant.getDomainEvents().isEmpty(),
                      "Domain events should be empty after clearing: " + restaurant.getDomainEvents().size());
        }
    }
}