package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.dto.ScheduleDTO;
import com.oneeats.restaurant.application.dto.ScheduleDTO.DayScheduleDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.domain.model.WeeklySchedule;
import com.oneeats.restaurant.domain.model.OpeningHours;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.shared.domain.vo.Email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UpdateRestaurantCommandHandler Tests")
class UpdateRestaurantCommandHandlerTest {
    
    @Mock
    private IRestaurantRepository restaurantRepository;
    
    @Mock
    private RestaurantApplicationMapper mapper;
    
    private UpdateRestaurantCommandHandler handler;
    private UUID restaurantId;
    private Restaurant existingRestaurant;
    
    @BeforeEach
    void setUp() {
        handler = new UpdateRestaurantCommandHandler();
        // Inject mocks using reflection since it's an application service
        try {
            var repositoryField = handler.getClass().getDeclaredField("restaurantRepository");
            repositoryField.setAccessible(true);
            repositoryField.set(handler, restaurantRepository);
            
            var mapperField = handler.getClass().getDeclaredField("mapper");
            mapperField.setAccessible(true);
            mapperField.set(handler, mapper);
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup mocks", e);
        }
        
        restaurantId = UUID.randomUUID();
        existingRestaurant = new Restaurant(
            restaurantId,
            "Pizza Palace",
            "Great pizza restaurant",
            "123 Main Street",
            "0123456789",
            new Email("contact@pizzapalace.fr"),
            "PIZZA",
            RestaurantStatus.ACTIVE
        );
    }
    
    @Nested
    @DisplayName("Restaurant Basic Information Updates")
    class RestaurantBasicInformationUpdates {
        
        @Test
        @DisplayName("Should update restaurant basic information")
        void shouldUpdateRestaurantBasicInformation() {
            // Given
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                "Updated Pizza Palace",
                "Updated description", 
                "456 New Street",
                "0987654321",
                "updated@pizzapalace.fr",
                null, // no cuisineType change
                null, // no isOpen change
                null  // no schedule change
            );
            
            RestaurantDTO expectedDTO = new RestaurantDTO(
                restaurantId,
                "Updated Pizza Palace",
                "Updated description",
                "456 New Street",
                "0987654321",
                "updated@pizzapalace.fr",
                "PIZZA",
                0.0,
                null,
                RestaurantStatus.ACTIVE,
                false,
                null,
                null,
                null
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(expectedDTO);
            
            // When
            RestaurantDTO result = handler.handle(command);
            
            // Then
            assertNotNull(result);
            verify(restaurantRepository).findById(restaurantId);
            verify(restaurantRepository).save(any(Restaurant.class));
            verify(mapper).toDTO(any(Restaurant.class));
            
            // Verify restaurant was updated
            assertEquals("Updated Pizza Palace", existingRestaurant.getName());
            assertEquals("Updated description", existingRestaurant.getDescription());
            assertEquals("456 New Street", existingRestaurant.getAddress());
            assertEquals("0987654321", existingRestaurant.getPhone());
            assertEquals("updated@pizzapalace.fr", existingRestaurant.getEmail().getValue());
        }
        
        @Test
        @DisplayName("Should preserve existing values when command fields are null")
        void shouldPreserveExistingValuesWhenCommandFieldsAreNull() {
            // Given
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                null, // preserve existing name
                null, // preserve existing description
                null, // preserve existing address
                null, // preserve existing phone
                null, // preserve existing email
                null, // no cuisineType change
                null, // no isOpen change
                null  // no schedule change
            );
            
            String originalName = existingRestaurant.getName();
            String originalDescription = existingRestaurant.getDescription();
            String originalAddress = existingRestaurant.getAddress();
            String originalPhone = existingRestaurant.getPhone();
            String originalEmail = existingRestaurant.getEmail().getValue();
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(new RestaurantDTO(
                restaurantId, "Pizza Palace", "Great pizza restaurant", "123 Main Street",
                "0123456789", "contact@pizzapalace.fr", "PIZZA", 0.0, null, RestaurantStatus.ACTIVE, false, null, null, null
            ));
            
            // When
            handler.handle(command);
            
            // Then
            assertEquals(originalName, existingRestaurant.getName());
            assertEquals(originalDescription, existingRestaurant.getDescription());
            assertEquals(originalAddress, existingRestaurant.getAddress());
            assertEquals(originalPhone, existingRestaurant.getPhone());
            assertEquals(originalEmail, existingRestaurant.getEmail().getValue());
        }
        
        @Test
        @DisplayName("Should throw exception when restaurant not found")
        void shouldThrowExceptionWhenRestaurantNotFound() {
            // Given
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                "New Name",
                null, null, null, null, null, null, null
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.empty());
            
            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, () -> handler.handle(command));
            assertEquals("Restaurant not found with id: " + restaurantId, exception.getMessage());
            
            verify(restaurantRepository).findById(restaurantId);
            verify(restaurantRepository, never()).save(any());
            verify(mapper, never()).toDTO(any());
        }
    }
    
    @Nested
    @DisplayName("Restaurant Status Management")
    class RestaurantStatusManagement {
        
        @Test
        @DisplayName("Should open restaurant when isOpen is true")
        void shouldOpenRestaurantWhenIsOpenIsTrue() {
            // Given
            existingRestaurant = new Restaurant(
                restaurantId,
                "Pizza Palace",
                "Great pizza restaurant",
                "123 Main Street",
                "0123456789",
                new Email("contact@pizzapalace.fr"),
                "PIZZA",
                RestaurantStatus.ACTIVE // Start with ACTIVE status
            );
            
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                null, null, null, null, null, null,
                true, // isOpen = true
                null
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(new RestaurantDTO(
                restaurantId, "Pizza Palace", "Great pizza restaurant", "123 Main Street",
                "0123456789", "contact@pizzapalace.fr", "PIZZA", 0.0, null, RestaurantStatus.ACTIVE, false, null, null, null
            ));
            
            // When
            handler.handle(command);
            
            // Then
            assertEquals(RestaurantStatus.OPEN, existingRestaurant.getStatus());
        }
        
        @Test
        @DisplayName("Should close restaurant when isOpen is false")
        void shouldCloseRestaurantWhenIsOpenIsFalse() {
            // Given
            existingRestaurant = new Restaurant(
                restaurantId,
                "Pizza Palace",
                "Great pizza restaurant",
                "123 Main Street",
                "0123456789",
                new Email("contact@pizzapalace.fr"),
                "PIZZA",
                RestaurantStatus.OPEN // Start with OPEN status
            );
            
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                null, null, null, null, null, null,
                false, // isOpen = false
                null
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(new RestaurantDTO(
                restaurantId, "Pizza Palace", "Great pizza restaurant", "123 Main Street",
                "0123456789", "contact@pizzapalace.fr", "PIZZA", 0.0, null, RestaurantStatus.ACTIVE, false, null, null, null
            ));
            
            // When
            handler.handle(command);
            
            // Then
            assertEquals(RestaurantStatus.ACTIVE, existingRestaurant.getStatus());
        }
        
        @Test
        @DisplayName("Should activate pending restaurant before opening")
        void shouldActivatePendingRestaurantBeforeOpening() {
            // Given
            existingRestaurant = new Restaurant(
                restaurantId,
                "Pizza Palace",
                "Great pizza restaurant",
                "123 Main Street",
                "0123456789",
                new Email("contact@pizzapalace.fr"),
                "PIZZA",
                RestaurantStatus.PENDING // Start with PENDING status
            );
            
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                null, null, null, null, null, null,
                true, // isOpen = true
                null
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(new RestaurantDTO(
                restaurantId, "Pizza Palace", "Great pizza restaurant", "123 Main Street",
                "0123456789", "contact@pizzapalace.fr", "PIZZA", 0.0, null, RestaurantStatus.ACTIVE, false, null, null, null
            ));
            
            // When
            handler.handle(command);
            
            // Then
            assertEquals(RestaurantStatus.OPEN, existingRestaurant.getStatus());
        }
        
        @Test
        @DisplayName("Should ignore status transition errors gracefully")
        void shouldIgnoreStatusTransitionErrorsGracefully() {
            // Given - Restaurant already OPEN, trying to open again
            existingRestaurant = new Restaurant(
                restaurantId,
                "Pizza Palace",
                "Great pizza restaurant",
                "123 Main Street",
                "0123456789",
                new Email("contact@pizzapalace.fr"),
                "PIZZA",
                RestaurantStatus.OPEN // Already OPEN
            );
            
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                null, null, null, null, null, null,
                true, // isOpen = true (but already open)
                null
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(new RestaurantDTO(
                restaurantId, "Pizza Palace", "Great pizza restaurant", "123 Main Street",
                "0123456789", "contact@pizzapalace.fr", "PIZZA", 0.0, null, RestaurantStatus.ACTIVE, false, null, null, null
            ));
            
            // When & Then - Should not throw exception
            assertDoesNotThrow(() -> handler.handle(command));
            
            // Status should remain OPEN
            assertEquals(RestaurantStatus.OPEN, existingRestaurant.getStatus());
        }
    }
    
    @Nested
    @DisplayName("Schedule Management")
    class ScheduleManagement {
        
        @Test
        @DisplayName("Should update restaurant schedule")
        void shouldUpdateRestaurantSchedule() {
            // Given
            ScheduleDTO scheduleDTO = new ScheduleDTO(
                new DayScheduleDTO("09:00", "18:00"), // monday
                new DayScheduleDTO("10:00", "19:00"), // tuesday
                null, // wednesday - closed
                null, // thursday
                null, // friday
                null, // saturday
                null  // sunday
            );
            
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                null, null, null, null, null, null, null,
                scheduleDTO
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(new RestaurantDTO(
                restaurantId, "Pizza Palace", "Great pizza restaurant", "123 Main Street",
                "0123456789", "contact@pizzapalace.fr", "PIZZA", 0.0, null, RestaurantStatus.ACTIVE, false, null, null, null
            ));
            
            // When
            handler.handle(command);
            
            // Then
            WeeklySchedule updatedSchedule = existingRestaurant.getSchedule();
            assertNotNull(updatedSchedule);
            
            // Check Monday
            OpeningHours mondayHours = updatedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.MONDAY);
            assertNotNull(mondayHours);
            assertEquals(LocalTime.of(9, 0), mondayHours.getOpenTime());
            assertEquals(LocalTime.of(18, 0), mondayHours.getCloseTime());
            
            // Check Tuesday
            OpeningHours tuesdayHours = updatedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.TUESDAY);
            assertNotNull(tuesdayHours);
            assertEquals(LocalTime.of(10, 0), tuesdayHours.getOpenTime());
            assertEquals(LocalTime.of(19, 0), tuesdayHours.getCloseTime());
            
            // Check Wednesday (should be null/closed)
            OpeningHours wednesdayHours = updatedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.WEDNESDAY);
            assertNull(wednesdayHours);
        }
        
        @Test
        @DisplayName("Should handle all days in schedule update")
        void shouldHandleAllDaysInScheduleUpdate() {
            // Given
            ScheduleDTO scheduleDTO = new ScheduleDTO(
                new DayScheduleDTO("09:00", "18:00"), // monday
                new DayScheduleDTO("09:00", "18:00"), // tuesday
                new DayScheduleDTO("09:00", "18:00"), // wednesday
                new DayScheduleDTO("09:00", "18:00"), // thursday
                new DayScheduleDTO("09:00", "18:00"), // friday
                new DayScheduleDTO("10:00", "17:00"), // saturday
                null  // sunday - closed
            );
            
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                null, null, null, null, null, null, null,
                scheduleDTO
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(new RestaurantDTO(
                restaurantId, "Pizza Palace", "Great pizza restaurant", "123 Main Street",
                "0123456789", "contact@pizzapalace.fr", "PIZZA", 0.0, null, RestaurantStatus.ACTIVE, false, null, null, null
            ));
            
            // When
            handler.handle(command);
            
            // Then
            WeeklySchedule updatedSchedule = existingRestaurant.getSchedule();
            
            // Check all weekdays are open
            for (WeeklySchedule.DayOfWeek day : new WeeklySchedule.DayOfWeek[]{
                WeeklySchedule.DayOfWeek.MONDAY,
                WeeklySchedule.DayOfWeek.TUESDAY,
                WeeklySchedule.DayOfWeek.WEDNESDAY,
                WeeklySchedule.DayOfWeek.THURSDAY,
                WeeklySchedule.DayOfWeek.FRIDAY
            }) {
                OpeningHours hours = updatedSchedule.getDaySchedule(day);
                assertNotNull(hours, day + " should be open");
                assertEquals(LocalTime.of(9, 0), hours.getOpenTime());
                assertEquals(LocalTime.of(18, 0), hours.getCloseTime());
            }
            
            // Check Saturday has different hours
            OpeningHours saturdayHours = updatedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.SATURDAY);
            assertNotNull(saturdayHours);
            assertEquals(LocalTime.of(10, 0), saturdayHours.getOpenTime());
            assertEquals(LocalTime.of(17, 0), saturdayHours.getCloseTime());
            
            // Check Sunday is closed
            assertNull(updatedSchedule.getDaySchedule(WeeklySchedule.DayOfWeek.SUNDAY));
        }
        
        @Test
        @DisplayName("Should preserve existing schedule when no schedule in command")
        void shouldPreserveExistingScheduleWhenNoScheduleInCommand() {
            // Given
            WeeklySchedule originalSchedule = existingRestaurant.getSchedule();
            
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                "New Name",
                null, null, null, null, null, null,
                null // No schedule update
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(new RestaurantDTO(
                restaurantId, "Pizza Palace", "Great pizza restaurant", "123 Main Street",
                "0123456789", "contact@pizzapalace.fr", "PIZZA", 0.0, null, RestaurantStatus.ACTIVE, false, null, null, null
            ));
            
            // When
            handler.handle(command);
            
            // Then
            assertEquals(originalSchedule, existingRestaurant.getSchedule());
        }
    }
    
    @Nested
    @DisplayName("Integration and Persistence")
    class IntegrationAndPersistence {
        
        @Test
        @DisplayName("Should save updated restaurant and return mapped DTO")
        void shouldSaveUpdatedRestaurantAndReturnMappedDTO() {
            // Given
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                "Updated Name",
                null, null, null, null, null, null, null
            );
            
            RestaurantDTO expectedDTO = new RestaurantDTO(
                restaurantId,
                "Updated Name",
                "Great pizza restaurant",
                "123 Main Street",
                "0123456789",
                "contact@pizzapalace.fr",
                "PIZZA",
                0.0,
                null,
                RestaurantStatus.ACTIVE,
                false,
                null,
                null,
                null
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(expectedDTO);
            
            // When
            RestaurantDTO result = handler.handle(command);
            
            // Then
            assertNotNull(result);
            assertEquals(expectedDTO, result);
            
            // Verify interaction order
            var inOrder = inOrder(restaurantRepository, mapper);
            inOrder.verify(restaurantRepository).findById(restaurantId);
            inOrder.verify(restaurantRepository).save(any(Restaurant.class));
            inOrder.verify(mapper).toDTO(any(Restaurant.class));
        }
        
        @Test
        @DisplayName("Should call repository and mapper exactly once")
        void shouldCallRepositoryAndMapperExactlyOnce() {
            // Given
            UpdateRestaurantCommand command = new UpdateRestaurantCommand(
                restaurantId,
                null, null, null, null, null, null, null, null
            );
            
            when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class))).thenReturn(new RestaurantDTO(
                restaurantId, "Pizza Palace", "Great pizza restaurant", "123 Main Street",
                "0123456789", "contact@pizzapalace.fr", "PIZZA", 0.0, null, RestaurantStatus.ACTIVE, false, null, null, null
            ));
            
            // When
            handler.handle(command);
            
            // Then
            verify(restaurantRepository, times(1)).findById(restaurantId);
            verify(restaurantRepository, times(1)).save(any(Restaurant.class));
            verify(mapper, times(1)).toDTO(any(Restaurant.class));
        }
    }
}