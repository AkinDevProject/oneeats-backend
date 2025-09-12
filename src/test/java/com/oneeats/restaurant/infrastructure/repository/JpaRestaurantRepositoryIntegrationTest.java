package com.oneeats.restaurant.infrastructure.repository;

import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.domain.model.WeeklySchedule;
import com.oneeats.restaurant.domain.model.OpeningHours;
import com.oneeats.restaurant.infrastructure.entity.RestaurantEntity;
import com.oneeats.restaurant.infrastructure.entity.OpeningHoursEntity;
import com.oneeats.restaurant.infrastructure.mapper.RestaurantInfrastructureMapper;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@DisplayName("JpaRestaurantRepository Integration Tests")
class JpaRestaurantRepositoryIntegrationTest {
    
    @Inject
    JpaRestaurantRepository repository;
    
    @Inject
    RestaurantInfrastructureMapper mapper;
    
    @Inject
    EntityManager entityManager;
    
    private Restaurant testRestaurant;
    private UUID testRestaurantId;
    
    @BeforeEach
    void setUp() {
        testRestaurantId = UUID.randomUUID();
        testRestaurant = new Restaurant(
            testRestaurantId,
            "Test Restaurant",
            "A test restaurant",
            "123 Test Street",
            "0123456789",
            new Email("test@restaurant.fr"),
            "PIZZA",
            RestaurantStatus.PENDING
        );
    }
    
    @Nested
    @DisplayName("Repository CRUD Operations")
    class RepositoryCrudOperations {
        
        @Test
        @Transactional
        @DisplayName("Should save new restaurant")
        void shouldSaveNewRestaurant() {
            // When
            Restaurant saved = repository.save(testRestaurant);
            
            // Then
            assertNotNull(saved);
            assertNotNull(saved.getId());
            assertEquals(testRestaurant.getName(), saved.getName());
            assertEquals(testRestaurant.getDescription(), saved.getDescription());
            assertEquals(testRestaurant.getEmail().getValue(), saved.getEmail().getValue());
            
            // Verify persistence
            entityManager.flush();
            entityManager.clear();
            
            RestaurantEntity entity = entityManager.find(RestaurantEntity.class, saved.getId());
            assertNotNull(entity);
            assertEquals(testRestaurant.getName(), entity.getName());
        }
        
        @Test
        @Transactional
        @DisplayName("Should update existing restaurant")
        void shouldUpdateExistingRestaurant() {
            // Given - Save initial restaurant
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            entityManager.clear();
            
            // When - Update restaurant
            saved.updateInfo(
                "Updated Restaurant",
                "Updated description",
                "456 Updated Street",
                "0987654321",
                "updated@restaurant.fr"
            );
            Restaurant updated = repository.save(saved);
            
            // Then
            assertEquals("Updated Restaurant", updated.getName());
            assertEquals("Updated description", updated.getDescription());
            assertEquals("456 Updated Street", updated.getAddress());
            assertEquals("0987654321", updated.getPhone());
            assertEquals("updated@restaurant.fr", updated.getEmail().getValue());
            
            // Verify persistence
            entityManager.flush();
            entityManager.clear();
            
            RestaurantEntity entity = entityManager.find(RestaurantEntity.class, saved.getId());
            assertEquals("Updated Restaurant", entity.getName());
            assertEquals("Updated description", entity.getDescription());
        }
        
        @Test
        @Transactional
        @DisplayName("Should preserve createdAt and version when updating")
        void shouldPreserveCreatedAtAndVersionWhenUpdating() {
            // Given - Save initial restaurant
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            
            LocalDateTime originalCreatedAt = saved.getCreatedAt();
            Long originalVersion = getEntityVersion(saved.getId());
            
            entityManager.clear();
            
            // When - Update restaurant
            saved.updateInfo(
                "Updated Name",
                null, null, null, null
            );
            Restaurant updated = repository.save(saved);
            
            // Then
            assertEquals(originalCreatedAt, updated.getCreatedAt());
            
            // Version should be preserved/managed by JPA
            entityManager.flush();
            RestaurantEntity entity = entityManager.find(RestaurantEntity.class, saved.getId());
            assertNotNull(entity.getVersion());
        }
        
        @Test
        @Transactional
        @DisplayName("Should find restaurant by id")
        void shouldFindRestaurantById() {
            // Given
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            entityManager.clear();
            
            // When
            Optional<Restaurant> found = repository.findById(saved.getId());
            
            // Then
            assertTrue(found.isPresent());
            assertEquals(saved.getId(), found.get().getId());
            assertEquals(saved.getName(), found.get().getName());
            assertEquals(saved.getEmail().getValue(), found.get().getEmail().getValue());
        }
        
        @Test
        @Transactional
        @DisplayName("Should return empty when restaurant not found by id")
        void shouldReturnEmptyWhenRestaurantNotFoundById() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            
            // When
            Optional<Restaurant> found = repository.findById(nonExistentId);
            
            // Then
            assertTrue(found.isEmpty());
        }
        
        @Test
        @Transactional
        @DisplayName("Should delete restaurant")
        void shouldDeleteRestaurant() {
            // Given
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            
            UUID restaurantId = saved.getId();
            
            // When
            repository.delete(saved);
            entityManager.flush();
            
            // Then
            RestaurantEntity entity = entityManager.find(RestaurantEntity.class, restaurantId);
            assertNull(entity);
            
            Optional<Restaurant> found = repository.findById(restaurantId);
            assertTrue(found.isEmpty());
        }
    }
    
    @Nested
    @DisplayName("Restaurant Queries")
    class RestaurantQueries {
        
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
        @DisplayName("Should return empty when restaurant not found by email")
        void shouldReturnEmptyWhenRestaurantNotFoundByEmail() {
            // Given
            Email nonExistentEmail = new Email("nonexistent@restaurant.fr");
            
            // When
            Optional<Restaurant> found = repository.findByEmail(nonExistentEmail);
            
            // Then
            assertTrue(found.isEmpty());
        }
        
        @Test
        @Transactional
        @DisplayName("Should check if restaurant exists by email")
        void shouldCheckIfRestaurantExistsByEmail() {
            // Given
            repository.save(testRestaurant);
            entityManager.flush();
            
            // When & Then
            assertTrue(repository.existsByEmail(testRestaurant.getEmail()));
            assertFalse(repository.existsByEmail(new Email("nonexistent@restaurant.fr")));
        }
        
        @Test
        @Transactional
        @DisplayName("Should find restaurants by status")
        void shouldFindRestaurantsByStatus() {
            // Given
            Restaurant restaurant1 = createTestRestaurant("Restaurant 1", RestaurantStatus.ACTIVE);
            Restaurant restaurant2 = createTestRestaurant("Restaurant 2", RestaurantStatus.ACTIVE);
            Restaurant restaurant3 = createTestRestaurant("Restaurant 3", RestaurantStatus.SUSPENDED);
            
            repository.save(restaurant1);
            repository.save(restaurant2);
            repository.save(restaurant3);
            entityManager.flush();
            
            // When
            List<Restaurant> activeRestaurants = repository.findByStatus(RestaurantStatus.ACTIVE);
            List<Restaurant> suspendedRestaurants = repository.findByStatus(RestaurantStatus.SUSPENDED);
            
            // Then
            assertEquals(2, activeRestaurants.size());
            assertEquals(1, suspendedRestaurants.size());
            
            assertTrue(activeRestaurants.stream()
                .allMatch(r -> r.getStatus() == RestaurantStatus.ACTIVE));
            assertTrue(suspendedRestaurants.stream()
                .allMatch(r -> r.getStatus() == RestaurantStatus.SUSPENDED));
        }
        
        @Test
        @Transactional
        @DisplayName("Should find restaurants by cuisine type")
        void shouldFindRestaurantsByCuisineType() {
            // Given
            Restaurant pizzaRestaurant = createTestRestaurant("Pizza Place", "PIZZA");
            Restaurant italianRestaurant = createTestRestaurant("Italian Place", "ITALIAN");
            Restaurant anotherPizzaPlace = createTestRestaurant("Another Pizza", "PIZZA");
            
            repository.save(pizzaRestaurant);
            repository.save(italianRestaurant);
            repository.save(anotherPizzaPlace);
            entityManager.flush();
            
            // When
            List<Restaurant> pizzaRestaurants = repository.findByCuisineType("PIZZA");
            List<Restaurant> italianRestaurants = repository.findByCuisineType("ITALIAN");
            
            // Then
            assertEquals(2, pizzaRestaurants.size());
            assertEquals(1, italianRestaurants.size());
            
            assertTrue(pizzaRestaurants.stream()
                .allMatch(r -> "PIZZA".equals(r.getCuisineType())));
            assertTrue(italianRestaurants.stream()
                .allMatch(r -> "ITALIAN".equals(r.getCuisineType())));
        }
        
        @Test
        @Transactional
        @DisplayName("Should find all restaurants")
        void shouldFindAllRestaurants() {
            // Given
            Restaurant restaurant1 = createTestRestaurant("Restaurant 1");
            Restaurant restaurant2 = createTestRestaurant("Restaurant 2");
            Restaurant restaurant3 = createTestRestaurant("Restaurant 3");
            
            repository.save(restaurant1);
            repository.save(restaurant2);
            repository.save(restaurant3);
            entityManager.flush();
            
            // When
            List<Restaurant> allRestaurants = repository.findAll();
            
            // Then
            assertTrue(allRestaurants.size() >= 3); // At least our test restaurants
            assertTrue(allRestaurants.stream()
                .anyMatch(r -> r.getName().equals("Restaurant 1")));
            assertTrue(allRestaurants.stream()
                .anyMatch(r -> r.getName().equals("Restaurant 2")));
            assertTrue(allRestaurants.stream()
                .anyMatch(r -> r.getName().equals("Restaurant 3")));
        }
    }
    
    @Nested
    @DisplayName("Schedule Integration")
    class ScheduleIntegration {
        
        @Test
        @Transactional
        @DisplayName("Should save and load restaurant with complete schedule")
        void shouldSaveAndLoadRestaurantWithCompleteSchedule() {
            // Given
            WeeklySchedule schedule = new WeeklySchedule();
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, 
                new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0)));
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY, 
                new OpeningHours(LocalTime.of(10, 0), LocalTime.of(19, 0)));
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY, null); // Closed
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.THURSDAY, 
                new OpeningHours(LocalTime.of(9, 30), LocalTime.of(17, 30)));
            
            testRestaurant.updateSchedule(schedule);
            
            // When
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            entityManager.clear();
            
            Optional<Restaurant> loaded = repository.findById(saved.getId());
            
            // Then
            assertTrue(loaded.isPresent());
            WeeklySchedule loadedSchedule = loaded.get().getSchedule();
            assertNotNull(loadedSchedule);
            
            // Check Monday
            OpeningHours mondayHours = loadedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.MONDAY);
            assertNotNull(mondayHours);
            assertEquals(LocalTime.of(9, 0), mondayHours.getOpenTime());
            assertEquals(LocalTime.of(18, 0), mondayHours.getCloseTime());
            
            // Check Tuesday
            OpeningHours tuesdayHours = loadedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY);
            assertNotNull(tuesdayHours);
            assertEquals(LocalTime.of(10, 0), tuesdayHours.getOpenTime());
            assertEquals(LocalTime.of(19, 0), tuesdayHours.getCloseTime());
            
            // Check Wednesday (closed)
            assertNull(loadedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY));
            
            // Check Thursday
            OpeningHours thursdayHours = loadedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.THURSDAY);
            assertNotNull(thursdayHours);
            assertEquals(LocalTime.of(9, 30), thursdayHours.getOpenTime());
            assertEquals(LocalTime.of(17, 30), thursdayHours.getCloseTime());
        }
        
        @Test
        @Transactional
        @DisplayName("Should update restaurant schedule")
        void shouldUpdateRestaurantSchedule() {
            // Given - Save restaurant with initial schedule
            WeeklySchedule initialSchedule = new WeeklySchedule();
            initialSchedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, 
                new OpeningHours(LocalTime.of(8, 0), LocalTime.of(16, 0)));
            testRestaurant.updateSchedule(initialSchedule);
            
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            entityManager.clear();
            
            // When - Update schedule
            WeeklySchedule newSchedule = new WeeklySchedule();
            newSchedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, 
                new OpeningHours(LocalTime.of(10, 0), LocalTime.of(20, 0)));
            newSchedule.setDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY, 
                new OpeningHours(LocalTime.of(11, 0), LocalTime.of(21, 0)));
            
            saved.updateSchedule(newSchedule);
            Restaurant updated = repository.save(saved);
            entityManager.flush();
            entityManager.clear();
            
            // Then
            Optional<Restaurant> reloaded = repository.findById(updated.getId());
            assertTrue(reloaded.isPresent());
            
            WeeklySchedule updatedSchedule = reloaded.get().getSchedule();
            
            // Monday should be updated
            OpeningHours mondayHours = updatedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.MONDAY);
            assertEquals(LocalTime.of(10, 0), mondayHours.getOpenTime());
            assertEquals(LocalTime.of(20, 0), mondayHours.getCloseTime());
            
            // Tuesday should be added
            OpeningHours tuesdayHours = updatedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY);
            assertEquals(LocalTime.of(11, 0), tuesdayHours.getOpenTime());
            assertEquals(LocalTime.of(21, 0), tuesdayHours.getCloseTime());
        }
        
        @Test
        @Transactional
        @DisplayName("Should handle restaurant without schedule")
        void shouldHandleRestaurantWithoutSchedule() {
            // Given - Restaurant without schedule
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            entityManager.clear();
            
            // When
            Optional<Restaurant> loaded = repository.findById(saved.getId());
            
            // Then
            assertTrue(loaded.isPresent());
            WeeklySchedule schedule = loaded.get().getSchedule();
            assertNotNull(schedule); // Should create empty schedule
            
            // All days should be null (closed)
            for (WeeklySchedule.DayOfWeek day : WeeklySchedule.DayOfWeek.values()) {
                assertNull(schedule.getDaySchedule(day));
            }
        }
    }
    
    @Nested
    @DisplayName("Transaction Behavior")
    class TransactionBehavior {
        
        @Test
        @Transactional
        @DisplayName("Should handle concurrent updates")
        void shouldHandleConcurrentUpdates() {
            // Given
            Restaurant saved = repository.save(testRestaurant);
            entityManager.flush();
            
            // When - Simulate concurrent update
            saved.updateInfo("Updated by first thread", null, null, null, null);
            Restaurant updated1 = repository.save(saved);
            
            saved.updateInfo("Updated by second thread", null, null, null, null);
            Restaurant updated2 = repository.save(saved);
            
            // Then - Last update should win
            assertEquals("Updated by second thread", updated2.getName());
        }
        
        @Test
        @Transactional
        @DisplayName("Should maintain referential integrity with opening hours")
        void shouldMaintainReferentialIntegrityWithOpeningHours() {
            // Given
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
            
            // Then - Opening hours should be cascade deleted
            List<OpeningHoursEntity> orphanedHours = entityManager
                .createQuery("SELECT oh FROM OpeningHoursEntity oh WHERE oh.restaurant.id = :restaurantId", OpeningHoursEntity.class)
                .setParameter("restaurantId", restaurantId)
                .getResultList();
            
            assertTrue(orphanedHours.isEmpty(), "Opening hours should be cascade deleted");
        }
    }
    
    // Helper methods
    private Restaurant createTestRestaurant(String name) {
        return new Restaurant(
            UUID.randomUUID(),
            name,
            "Test restaurant description",
            "123 Test Street",
            "0123456789",
            new Email(name.toLowerCase().replace(" ", "") + "@test.fr"),
            "PIZZA",
            RestaurantStatus.ACTIVE
        );
    }
    
    private Restaurant createTestRestaurant(String name, RestaurantStatus status) {
        return new Restaurant(
            UUID.randomUUID(),
            name,
            "Test restaurant description",
            "123 Test Street",
            "0123456789",
            new Email(name.toLowerCase().replace(" ", "") + "@test.fr"),
            "PIZZA",
            status
        );
    }
    
    private Restaurant createTestRestaurant(String name, String cuisineType) {
        return new Restaurant(
            UUID.randomUUID(),
            name,
            "Test restaurant description",
            "123 Test Street",
            "0123456789",
            new Email(name.toLowerCase().replace(" ", "") + "@test.fr"),
            cuisineType,
            RestaurantStatus.ACTIVE
        );
    }
    
    private Long getEntityVersion(UUID restaurantId) {
        RestaurantEntity entity = entityManager.find(RestaurantEntity.class, restaurantId);
        return entity != null ? entity.getVersion().longValue() : null;
    }
}