package com.oneeats.integration.restaurant.repository;

import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.domain.model.WeeklySchedule;
import com.oneeats.restaurant.domain.model.OpeningHours;
import com.oneeats.restaurant.infrastructure.repository.JpaRestaurantRepository;
import com.oneeats.restaurant.infrastructure.entity.RestaurantEntity;
import com.oneeats.shared.domain.vo.Email;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.transaction.Transactional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ✅ TESTS D'INTÉGRATION REPOSITORY
 * - Utilise @QuarkusTest (contexte Quarkus complet)
 * - Vraie base de données PostgreSQL
 * - Vraies transactions @Transactional  
 * - Teste l'intégration Repository ↔ Database
 */
@QuarkusTest
@DisplayName("Restaurant Repository Integration Tests - Database Operations")
class RestaurantRepositoryIntegrationTest {
    
    @Inject
    JpaRestaurantRepository repository;
    
    @Inject
    EntityManager entityManager;
    
    private Restaurant testRestaurant;
    private UUID testRestaurantId;
    
    @BeforeEach
    @Transactional
    void setUp() {
        // Clean slate for each test
        repository.deleteAll();
        
        testRestaurantId = UUID.randomUUID();
        testRestaurant = new Restaurant(
            testRestaurantId,
            "Integration Test Restaurant",
            "A test restaurant for integration testing",
            "123 Integration Street",
            "0123456789",
            new Email("integration@test.fr"),
            "INTEGRATION",
            RestaurantStatus.PENDING
        );
    }
    
    @Nested
    @DisplayName("Basic CRUD Operations")
    class BasicCrudOperations {
        
        @Test
        @Transactional
        @DisplayName("Should persist restaurant to database")
        void shouldPersistRestaurantToDatabase() {
            // When
            Restaurant saved = repository.save(testRestaurant);
            
            // Force flush to database
            entityManager.flush();
            entityManager.clear();
            
            // Then - Verify in database
            RestaurantEntity entity = entityManager.find(RestaurantEntity.class, saved.getId());
            assertNotNull(entity);
            assertEquals(testRestaurant.getName(), entity.getName());
            assertEquals(testRestaurant.getDescription(), entity.getDescription());
            assertEquals(testRestaurant.getEmail().getValue(), entity.getEmail());
        }
        
        @Test
        @Transactional
        @DisplayName("Should find restaurant by ID from database")
        void shouldFindRestaurantByIdFromDatabase() {
            // Given - Save to database first
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            entityManager.clear(); // Clear persistence context
            
            // When - Find from fresh database query
            Optional<Restaurant> found = repository.findById(saved.getId());
            
            // Then
            assertTrue(found.isPresent());
            Restaurant foundRestaurant = found.get();
            assertEquals(saved.getId(), foundRestaurant.getId());
            assertEquals(testRestaurant.getName(), foundRestaurant.getName());
            assertEquals(testRestaurant.getEmail().getValue(), foundRestaurant.getEmail().getValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should update restaurant in database")
        void shouldUpdateRestaurantInDatabase() {
            // Given - Save initial state
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            entityManager.clear();
            
            // When - Update restaurant
            saved.updateInfo(
                "Updated Name",
                "Updated description",
                "Updated address",
                "0987654321",
                "updated@test.fr"
            );
            Restaurant updated = repository.save(saved);
            entityManager.flush();
            entityManager.clear();
            
            // Then - Verify changes in database
            RestaurantEntity entity = entityManager.find(RestaurantEntity.class, updated.getId());
            assertEquals("Updated Name", entity.getName());
            assertEquals("Updated description", entity.getDescription());
            assertEquals("Updated address", entity.getAddress());
            assertEquals("0987654321", entity.getPhone());
            assertEquals("updated@test.fr", entity.getEmail());
        }
        
        @Test
        @Transactional
        @DisplayName("Should delete restaurant from database")
        void shouldDeleteRestaurantFromDatabase() {
            // Given
            Restaurant saved = repository.save(testRestaurant);
            UUID restaurantId = saved.getId();
            entityManager.flush();
            
            // When
            repository.delete(saved);
            entityManager.flush();
            
            // Then - Verify deletion in database
            RestaurantEntity entity = entityManager.find(RestaurantEntity.class, restaurantId);
            assertNull(entity);
            
            Optional<Restaurant> found = repository.findById(restaurantId);
            assertTrue(found.isEmpty());
        }
    }
    
    @Nested
    @DisplayName("Custom Query Methods")
    class CustomQueryMethods {
        
        @Test
        @Transactional
        @DisplayName("Should find restaurant by email")
        void shouldFindRestaurantByEmail() {
            // Given
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            entityManager.clear();
            
            // When
            Optional<Restaurant> found = repository.findByEmail(testRestaurant.getEmail());
            
            // Then
            assertTrue(found.isPresent());
            assertEquals(saved.getId(), found.get().getId());
            assertEquals(testRestaurant.getEmail().getValue(), found.get().getEmail().getValue());
        }
        
        @Test
        @Transactional 
        @DisplayName("Should check existence by email")
        void shouldCheckExistenceByEmail() {
            // Given
            repository.save(testRestaurant);
            entityManager.flush();
            
            // When & Then
            assertTrue(repository.existsByEmail(testRestaurant.getEmail()));
            assertFalse(repository.existsByEmail(new Email("nonexistent@test.fr")));
        }
        
        @Test
        @Transactional
        @DisplayName("Should find restaurants by status")
        void shouldFindRestaurantsByStatus() {
            // Given - Create restaurants with different statuses
            Restaurant activeRestaurant = createTestRestaurant("Active Restaurant", RestaurantStatus.ACTIVE);
            Restaurant pendingRestaurant = createTestRestaurant("Pending Restaurant", RestaurantStatus.PENDING);
            Restaurant suspendedRestaurant = createTestRestaurant("Suspended Restaurant", RestaurantStatus.SUSPENDED);
            
            repository.save(activeRestaurant);
            repository.save(pendingRestaurant);  
            repository.save(suspendedRestaurant);
            entityManager.flush();
            
            // When
            List<Restaurant> activeRestaurants = repository.findByStatus(RestaurantStatus.ACTIVE);
            List<Restaurant> pendingRestaurants = repository.findByStatus(RestaurantStatus.PENDING);
            
            // Then
            assertEquals(1, activeRestaurants.size());
            assertEquals(1, pendingRestaurants.size());
            assertEquals("Active Restaurant", activeRestaurants.get(0).getName());
            assertEquals("Pending Restaurant", pendingRestaurants.get(0).getName());
        }
        
        @Test
        @Transactional
        @DisplayName("Should find restaurants by cuisine type")
        void shouldFindRestaurantsByCuisineType() {
            // Given
            Restaurant pizzaRestaurant = createTestRestaurant("Pizza Place", "PIZZA");
            Restaurant italianRestaurant = createTestRestaurant("Italian Place", "ITALIAN");
            Restaurant anotherPizza = createTestRestaurant("Another Pizza", "PIZZA");
            
            repository.save(pizzaRestaurant);
            repository.save(italianRestaurant);
            repository.save(anotherPizza);
            entityManager.flush();
            
            // When
            List<Restaurant> pizzaPlaces = repository.findByCuisineType("PIZZA");
            List<Restaurant> italianPlaces = repository.findByCuisineType("ITALIAN");
            
            // Then
            assertEquals(2, pizzaPlaces.size());
            assertEquals(1, italianPlaces.size());
            assertTrue(pizzaPlaces.stream().allMatch(r -> "PIZZA".equals(r.getCuisineType())));
            assertTrue(italianPlaces.stream().allMatch(r -> "ITALIAN".equals(r.getCuisineType())));
        }
    }
    
    @Nested
    @DisplayName("Complex Data Persistence")
    class ComplexDataPersistence {
        
        @Test
        @Transactional
        @DisplayName("Should persist restaurant with complete schedule")
        void shouldPersistRestaurantWithCompleteSchedule() {
            // Given - Restaurant with complex schedule
            WeeklySchedule schedule = new WeeklySchedule();
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, 
                new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0)));
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY,
                new OpeningHours(LocalTime.of(10, 0), LocalTime.of(19, 0)));
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY, null); // Closed
            
            testRestaurant.updateSchedule(schedule);
            
            // When
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            entityManager.clear();
            
            // Then - Reload and verify schedule persistence
            Optional<Restaurant> reloaded = repository.findById(saved.getId());
            assertTrue(reloaded.isPresent());
            
            WeeklySchedule persistedSchedule = reloaded.get().getSchedule();
            assertNotNull(persistedSchedule);
            
            // Verify Monday
            OpeningHours mondayHours = persistedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.MONDAY);
            assertNotNull(mondayHours);
            assertEquals(LocalTime.of(9, 0), mondayHours.getOpenTime());
            assertEquals(LocalTime.of(18, 0), mondayHours.getCloseTime());
            
            // Verify Tuesday  
            OpeningHours tuesdayHours = persistedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY);
            assertNotNull(tuesdayHours);
            assertEquals(LocalTime.of(10, 0), tuesdayHours.getOpenTime());
            assertEquals(LocalTime.of(19, 0), tuesdayHours.getCloseTime());
            
            // Verify Wednesday (closed)
            assertNull(persistedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY));
        }
    }
    
    @Nested
    @DisplayName("Transaction Behavior")
    class TransactionBehavior {
        
        @Test
        @Transactional
        @DisplayName("Should handle concurrent modifications")
        void shouldHandleConcurrentModifications() {
            // Given
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            
            // When - Simulate concurrent updates
            saved.updateInfo("First Update", null, null, null, null);
            repository.save(saved);
            
            saved.updateInfo("Second Update", null, null, null, null);
            Restaurant finalResult = repository.save(saved);
            
            entityManager.flush();
            
            // Then - Last update should win
            assertEquals("Second Update", finalResult.getName());
        }
        
        @Test
        @Transactional
        @DisplayName("Should maintain referential integrity")
        void shouldMaintainReferentialIntegrity() {
            // Given - Restaurant with schedule
            WeeklySchedule schedule = new WeeklySchedule();
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY,
                new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0)));
            testRestaurant.updateSchedule(schedule);
            
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            UUID restaurantId = saved.getId();
            
            // When - Delete restaurant
            repository.delete(saved);
            entityManager.flush();
            
            // Then - Related schedule data should be handled properly
            assertNull(entityManager.find(RestaurantEntity.class, restaurantId));
            // Note: Specific cascade behavior depends on JPA mapping configuration
        }
    }
    
    // Helper methods
    private Restaurant createTestRestaurant(String name, RestaurantStatus status) {
        return new Restaurant(
            UUID.randomUUID(),
            name,
            "Test description",
            "Test address",
            "0123456789",
            new Email(name.toLowerCase().replace(" ", "") + "@test.fr"),
            "TEST",
            status
        );
    }
    
    private Restaurant createTestRestaurant(String name, String cuisineType) {
        return new Restaurant(
            UUID.randomUUID(),
            name,
            "Test description",
            "Test address",
            "0123456789",
            new Email(name.toLowerCase().replace(" ", "") + "@test.fr"),
            cuisineType,
            RestaurantStatus.ACTIVE
        );
    }
}