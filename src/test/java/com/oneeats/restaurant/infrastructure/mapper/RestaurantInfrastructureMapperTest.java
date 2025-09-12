package com.oneeats.restaurant.infrastructure.mapper;

import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.domain.model.WeeklySchedule;
import com.oneeats.restaurant.domain.model.OpeningHours;
import com.oneeats.restaurant.infrastructure.entity.RestaurantEntity;
import com.oneeats.restaurant.infrastructure.entity.OpeningHoursEntity;
import com.oneeats.shared.domain.vo.Email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;

import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("RestaurantInfrastructureMapper Tests")
class RestaurantInfrastructureMapperTest {
    
    private RestaurantInfrastructureMapper mapper;
    private UUID restaurantId;
    private LocalDateTime testDateTime;
    
    @BeforeEach
    void setUp() {
        mapper = new RestaurantInfrastructureMapper();
        restaurantId = UUID.randomUUID();
        testDateTime = LocalDateTime.now();
    }
    
    @Nested
    @DisplayName("Entity to Domain Mapping")
    class EntityToDomainMapping {
        
        @Test
        @DisplayName("Should map OPEN entity to OPEN domain status")
        void shouldMapOpenEntityToOpenDomainStatus() {
            // Given
            RestaurantEntity entity = createBasicRestaurantEntity();
            entity.setIsOpen(true);
            entity.setIsActive(true);
            
            // When
            Restaurant domain = mapper.toDomain(entity);
            
            // Then
            assertEquals(RestaurantStatus.OPEN, domain.getStatus());
        }
        
        @Test
        @DisplayName("Should map ACTIVE entity to ACTIVE domain status")
        void shouldMapActiveEntityToActiveDomainStatus() {
            // Given
            RestaurantEntity entity = createBasicRestaurantEntity();
            entity.setIsOpen(false);
            entity.setIsActive(true);
            
            // When
            Restaurant domain = mapper.toDomain(entity);
            
            // Then
            assertEquals(RestaurantStatus.ACTIVE, domain.getStatus());
        }
        
        @Test
        @DisplayName("Should map SUSPENDED entity to SUSPENDED domain status")
        void shouldMapSuspendedEntityToSuspendedDomainStatus() {
            // Given
            RestaurantEntity entity = createBasicRestaurantEntity();
            entity.setIsOpen(false);
            entity.setIsActive(false);
            
            // When
            Restaurant domain = mapper.toDomain(entity);
            
            // Then
            assertEquals(RestaurantStatus.SUSPENDED, domain.getStatus());
        }
        
        @Test
        @DisplayName("Should map basic entity fields to domain")
        void shouldMapBasicEntityFieldsToDomain() {
            // Given
            RestaurantEntity entity = createBasicRestaurantEntity();
            
            // When
            Restaurant domain = mapper.toDomain(entity);
            
            // Then
            assertEquals(entity.getId(), domain.getId());
            assertEquals(entity.getName(), domain.getName());
            assertEquals(entity.getDescription(), domain.getDescription());
            assertEquals(entity.getAddress(), domain.getAddress());
            assertEquals(entity.getPhone(), domain.getPhone());
            assertEquals(entity.getEmail(), domain.getEmail().getValue());
            assertEquals(entity.getCuisineType(), domain.getCuisineType());
            assertEquals(entity.getRating(), domain.getRating());
            assertEquals(entity.getImageUrl(), domain.getImageUrl());
            assertEquals(entity.getCreatedAt(), domain.getCreatedAt());
            assertEquals(entity.getUpdatedAt(), domain.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should map entity with opening hours to domain with schedule")
        void shouldMapEntityWithOpeningHoursToDomainWithSchedule() {
            // Given
            RestaurantEntity entity = createBasicRestaurantEntity();
            List<OpeningHoursEntity> openingHours = new ArrayList<>();
            
            // Monday: Open 9-18
            OpeningHoursEntity mondayHours = new OpeningHoursEntity();
            mondayHours.setDayOfWeek(OpeningHoursEntity.DayOfWeek.MONDAY);
            mondayHours.setOpenTime(LocalTime.of(9, 0));
            mondayHours.setCloseTime(LocalTime.of(18, 0));
            mondayHours.setRestaurant(entity);
            openingHours.add(mondayHours);
            
            // Tuesday: Closed (null times)
            OpeningHoursEntity tuesdayHours = new OpeningHoursEntity();
            tuesdayHours.setDayOfWeek(OpeningHoursEntity.DayOfWeek.TUESDAY);
            tuesdayHours.setOpenTime(null);
            tuesdayHours.setCloseTime(null);
            tuesdayHours.setRestaurant(entity);
            openingHours.add(tuesdayHours);
            
            entity.setOpeningHours(openingHours);
            
            // When
            Restaurant domain = mapper.toDomain(entity);
            
            // Then
            WeeklySchedule schedule = domain.getSchedule();
            assertNotNull(schedule);
            
            // Check Monday is open
            OpeningHours mondayDomainHours = schedule.getDaySchedule(WeeklySchedule.DayOfWeek.MONDAY);
            assertNotNull(mondayDomainHours);
            assertTrue(mondayDomainHours.isOpen());
            assertEquals(LocalTime.of(9, 0), mondayDomainHours.getOpenTime());
            assertEquals(LocalTime.of(18, 0), mondayDomainHours.getCloseTime());
            
            // Check Tuesday is closed (null)
            OpeningHours tuesdayDomainHours = schedule.getDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY);
            assertNull(tuesdayDomainHours);
        }
        
        @Test
        @DisplayName("Should handle entity with no opening hours")
        void shouldHandleEntityWithNoOpeningHours() {
            // Given
            RestaurantEntity entity = createBasicRestaurantEntity();
            entity.setOpeningHours(null);
            
            // When
            Restaurant domain = mapper.toDomain(entity);
            
            // Then
            WeeklySchedule schedule = domain.getSchedule();
            assertNotNull(schedule);
            
            // All days should be null (closed)
            for (WeeklySchedule.DayOfWeek day : WeeklySchedule.DayOfWeek.values()) {
                assertNull(schedule.getDaySchedule(day));
            }
        }
        
        @Test
        @DisplayName("Should handle entity with empty opening hours list")
        void shouldHandleEntityWithEmptyOpeningHoursList() {
            // Given
            RestaurantEntity entity = createBasicRestaurantEntity();
            entity.setOpeningHours(new ArrayList<>());
            
            // When
            Restaurant domain = mapper.toDomain(entity);
            
            // Then
            WeeklySchedule schedule = domain.getSchedule();
            assertNotNull(schedule);
            
            // All days should be null (closed)
            for (WeeklySchedule.DayOfWeek day : WeeklySchedule.DayOfWeek.values()) {
                assertNull(schedule.getDaySchedule(day));
            }
        }
    }
    
    @Nested
    @DisplayName("Domain to Entity Mapping")
    class DomainToEntityMapping {
        
        @Test
        @DisplayName("Should map OPEN domain to open entity status")
        void shouldMapOpenDomainToOpenEntityStatus() {
            // Given
            Restaurant domain = createBasicRestaurant(RestaurantStatus.OPEN);
            
            // When
            RestaurantEntity entity = mapper.toEntity(domain);
            
            // Then
            assertTrue(entity.getIsOpen());
            assertTrue(entity.getIsActive());
        }
        
        @Test
        @DisplayName("Should map ACTIVE domain to active entity status")
        void shouldMapActiveDomainToActiveEntityStatus() {
            // Given
            Restaurant domain = createBasicRestaurant(RestaurantStatus.ACTIVE);
            
            // When
            RestaurantEntity entity = mapper.toEntity(domain);
            
            // Then
            assertFalse(entity.getIsOpen());
            assertTrue(entity.getIsActive());
        }
        
        @Test
        @DisplayName("Should map SUSPENDED domain to suspended entity status")
        void shouldMapSuspendedDomainToSuspendedEntityStatus() {
            // Given
            Restaurant domain = createBasicRestaurant(RestaurantStatus.SUSPENDED);
            
            // When
            RestaurantEntity entity = mapper.toEntity(domain);
            
            // Then
            assertFalse(entity.getIsOpen());
            assertFalse(entity.getIsActive());
        }
        
        @Test
        @DisplayName("Should map PENDING domain to inactive entity status")
        void shouldMapPendingDomainToInactiveEntityStatus() {
            // Given
            Restaurant domain = createBasicRestaurant(RestaurantStatus.PENDING);
            
            // When
            RestaurantEntity entity = mapper.toEntity(domain);
            
            // Then
            assertFalse(entity.getIsOpen());
            assertFalse(entity.getIsActive());
        }
        
        @Test
        @DisplayName("Should map basic domain fields to entity")
        void shouldMapBasicDomainFieldsToEntity() {
            // Given
            Restaurant domain = createBasicRestaurant(RestaurantStatus.ACTIVE);
            
            // When
            RestaurantEntity entity = mapper.toEntity(domain);
            
            // Then
            assertEquals(domain.getId(), entity.getId());
            assertEquals(domain.getName(), entity.getName());
            assertEquals(domain.getDescription(), entity.getDescription());
            assertEquals(domain.getAddress(), entity.getAddress());
            assertEquals(domain.getPhone(), entity.getPhone());
            assertEquals(domain.getEmail().getValue(), entity.getEmail());
            assertEquals(domain.getCuisineType(), entity.getCuisineType());
            assertEquals(domain.getRating(), entity.getRating());
            assertEquals(domain.getImageUrl(), entity.getImageUrl());
            assertEquals(domain.getCreatedAt(), entity.getCreatedAt());
            assertEquals(domain.getUpdatedAt(), entity.getUpdatedAt());
        }
        
        @Test
        @DisplayName("Should map domain schedule to entity opening hours")
        void shouldMapDomainScheduleToEntityOpeningHours() {
            // Given
            Restaurant domain = createBasicRestaurant(RestaurantStatus.ACTIVE);
            WeeklySchedule schedule = new WeeklySchedule();
            
            // Monday: Open 9-18
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, 
                new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0)));
            
            // Tuesday: Closed
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY, null);
            
            // Wednesday: Open 10-19
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY, 
                new OpeningHours(LocalTime.of(10, 0), LocalTime.of(19, 0)));
            
            domain.updateSchedule(schedule);
            
            // When
            RestaurantEntity entity = mapper.toEntity(domain);
            
            // Then
            List<OpeningHoursEntity> openingHours = entity.getOpeningHours();
            assertNotNull(openingHours);
            assertEquals(7, openingHours.size()); // Should create entry for each day
            
            // Find Monday entry
            OpeningHoursEntity mondayEntity = findOpeningHoursForDay(openingHours, OpeningHoursEntity.DayOfWeek.MONDAY);
            assertNotNull(mondayEntity);
            assertEquals(LocalTime.of(9, 0), mondayEntity.getOpenTime());
            assertEquals(LocalTime.of(18, 0), mondayEntity.getCloseTime());
            assertEquals(entity, mondayEntity.getRestaurant());
            
            // Find Tuesday entry (closed)
            OpeningHoursEntity tuesdayEntity = findOpeningHoursForDay(openingHours, OpeningHoursEntity.DayOfWeek.TUESDAY);
            assertNotNull(tuesdayEntity);
            assertNull(tuesdayEntity.getOpenTime());
            assertNull(tuesdayEntity.getCloseTime());
            
            // Find Wednesday entry
            OpeningHoursEntity wednesdayEntity = findOpeningHoursForDay(openingHours, OpeningHoursEntity.DayOfWeek.WEDNESDAY);
            assertNotNull(wednesdayEntity);
            assertEquals(LocalTime.of(10, 0), wednesdayEntity.getOpenTime());
            assertEquals(LocalTime.of(19, 0), wednesdayEntity.getCloseTime());
        }
        
        @Test
        @DisplayName("Should handle domain with null schedule")
        void shouldHandleDomainWithNullSchedule() {
            // Given
            Restaurant domain = createBasicRestaurant(RestaurantStatus.ACTIVE);
            domain.updateSchedule(null);
            
            // When
            RestaurantEntity entity = mapper.toEntity(domain);
            
            // Then
            assertNull(entity.getOpeningHours());
        }
        
        @Test
        @DisplayName("Should handle domain with closed opening hours")
        void shouldHandleDomainWithClosedOpeningHours() {
            // Given
            Restaurant domain = createBasicRestaurant(RestaurantStatus.ACTIVE);
            WeeklySchedule schedule = new WeeklySchedule();
            
            // Monday: Closed opening hours (not open)
            OpeningHours closedHours = new OpeningHours(); // No times set
            schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, closedHours);
            
            domain.updateSchedule(schedule);
            
            // When
            RestaurantEntity entity = mapper.toEntity(domain);
            
            // Then
            List<OpeningHoursEntity> openingHours = entity.getOpeningHours();
            OpeningHoursEntity mondayEntity = findOpeningHoursForDay(openingHours, OpeningHoursEntity.DayOfWeek.MONDAY);
            assertNotNull(mondayEntity);
            assertNull(mondayEntity.getOpenTime());
            assertNull(mondayEntity.getCloseTime());
        }
    }
    
    
    @Nested
    @DisplayName("Roundtrip Conversion")
    class RoundtripConversion {
        
        @Test
        @DisplayName("Should maintain data integrity in entity->domain->entity conversion")
        void shouldMaintainDataIntegrityInEntityDomainEntityConversion() {
            // Given
            RestaurantEntity originalEntity = createCompleteRestaurantEntity();
            
            // When
            Restaurant domain = mapper.toDomain(originalEntity);
            RestaurantEntity roundtripEntity = mapper.toEntity(domain);
            
            // Then - Basic fields should be preserved
            assertEquals(originalEntity.getId(), roundtripEntity.getId());
            assertEquals(originalEntity.getName(), roundtripEntity.getName());
            assertEquals(originalEntity.getDescription(), roundtripEntity.getDescription());
            assertEquals(originalEntity.getAddress(), roundtripEntity.getAddress());
            assertEquals(originalEntity.getPhone(), roundtripEntity.getPhone());
            assertEquals(originalEntity.getEmail(), roundtripEntity.getEmail());
            assertEquals(originalEntity.getCuisineType(), roundtripEntity.getCuisineType());
            assertEquals(originalEntity.getIsOpen(), roundtripEntity.getIsOpen());
            assertEquals(originalEntity.getIsActive(), roundtripEntity.getIsActive());
            
            // Schedule should be equivalent (might not be identical due to object creation)
            assertEquals(originalEntity.getOpeningHours().size(), roundtripEntity.getOpeningHours().size());
        }
        
        @Test
        @DisplayName("Should maintain data integrity in domain->entity->domain conversion")
        void shouldMaintainDataIntegrityInDomainEntityDomainConversion() {
            // Given
            Restaurant originalDomain = createCompleteRestaurant();
            
            // When
            RestaurantEntity entity = mapper.toEntity(originalDomain);
            Restaurant roundtripDomain = mapper.toDomain(entity);
            
            // Then
            assertEquals(originalDomain.getId(), roundtripDomain.getId());
            assertEquals(originalDomain.getName(), roundtripDomain.getName());
            assertEquals(originalDomain.getDescription(), roundtripDomain.getDescription());
            assertEquals(originalDomain.getAddress(), roundtripDomain.getAddress());
            assertEquals(originalDomain.getPhone(), roundtripDomain.getPhone());
            assertEquals(originalDomain.getEmail().getValue(), roundtripDomain.getEmail().getValue());
            assertEquals(originalDomain.getCuisineType(), roundtripDomain.getCuisineType());
            assertEquals(originalDomain.getStatus(), roundtripDomain.getStatus());
        }
    }
    
    // Helper methods
    private RestaurantEntity createBasicRestaurantEntity() {
        return new RestaurantEntity(
            restaurantId,
            "Pizza Palace",
            "Great pizza restaurant",
            "123 Main Street",
            "0123456789",
            "contact@pizzapalace.fr",
            "PIZZA",
            4.5,
            "/uploads/pizza-palace.jpg",
            false, // isOpen
            true,  // isActive
            testDateTime,
            testDateTime
        );
    }
    
    private RestaurantEntity createCompleteRestaurantEntity() {
        RestaurantEntity entity = createBasicRestaurantEntity();
        
        List<OpeningHoursEntity> openingHours = new ArrayList<>();
        OpeningHoursEntity mondayHours = new OpeningHoursEntity();
        mondayHours.setDayOfWeek(OpeningHoursEntity.DayOfWeek.MONDAY);
        mondayHours.setOpenTime(LocalTime.of(9, 0));
        mondayHours.setCloseTime(LocalTime.of(18, 0));
        mondayHours.setRestaurant(entity);
        openingHours.add(mondayHours);
        
        entity.setOpeningHours(openingHours);
        return entity;
    }
    
    private Restaurant createBasicRestaurant(RestaurantStatus status) {
        Restaurant restaurant = new Restaurant(
            restaurantId,
            "Pizza Palace",
            "Great pizza restaurant",
            "123 Main Street",
            "0123456789",
            new Email("contact@pizzapalace.fr"),
            "PIZZA",
            status
        );
        restaurant.setCreatedAt(testDateTime);
        restaurant.setUpdatedAt(testDateTime);
        restaurant.setImageUrl("/uploads/pizza-palace.jpg");
        restaurant.updateRating(4.5);
        return restaurant;
    }
    
    private Restaurant createCompleteRestaurant() {
        Restaurant restaurant = createBasicRestaurant(RestaurantStatus.ACTIVE);
        
        WeeklySchedule schedule = new WeeklySchedule();
        schedule.setDaySchedule(WeeklySchedule.DayOfWeek.MONDAY, 
            new OpeningHours(LocalTime.of(9, 0), LocalTime.of(18, 0)));
        restaurant.updateSchedule(schedule);
        
        return restaurant;
    }
    
    private OpeningHoursEntity findOpeningHoursForDay(List<OpeningHoursEntity> openingHours, OpeningHoursEntity.DayOfWeek day) {
        return openingHours.stream()
            .filter(hours -> hours.getDayOfWeek() == day)
            .findFirst()
            .orElse(null);
    }
}