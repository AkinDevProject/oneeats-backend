package com.oneeats.unit.restaurant.application;

import com.oneeats.restaurant.application.command.UpdateRestaurantCommand;
import com.oneeats.restaurant.application.command.UpdateRestaurantCommandHandler;
import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.shared.domain.vo.Email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.InjectMocks;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * ✅ TESTS UNITAIRES AVEC MOCKS
 * - Utilise @ExtendWith(MockitoExtension.class)
 * - Tous les collaborateurs sont mockés (@Mock)
 * - Aucune vraie base de données
 * - Teste UNIQUEMENT la logique du use case
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UpdateRestaurantCommandHandler Unit Tests - Use Case Logic")
class UpdateRestaurantCommandHandlerTest {
    
    @Mock
    private IRestaurantRepository restaurantRepository;
    
    @Mock
    private RestaurantApplicationMapper mapper;
    
    @InjectMocks
    private UpdateRestaurantCommandHandler handler;
    
    private UUID restaurantId;
    private Restaurant existingRestaurant;
    private UpdateRestaurantCommand command;
    private RestaurantDTO expectedDTO;
    
    @BeforeEach
    void setUp() {
        restaurantId = UUID.randomUUID();
        existingRestaurant = new Restaurant(
            restaurantId,
            "Original Restaurant",
            "Original description",
            "Original address",
            "0123456789",
            new Email("original@restaurant.fr"),
            "PIZZA",
            RestaurantStatus.APPROVED
        );
        
        command = new UpdateRestaurantCommand(
            restaurantId,
            "Updated Restaurant",
            "Updated description",
            "Updated address",
            "0987654321",
            "updated@restaurant.fr",
            "ITALIAN",
            null,
            null
        );
        
        expectedDTO = new RestaurantDTO(
            restaurantId,
            "Updated Restaurant",
            "Updated description",
            "Updated address",
            "0987654321",
            "updated@restaurant.fr",
            "ITALIAN",
            "ITALIAN",  // category field
            0.0,
            null,
            RestaurantStatus.APPROVED,
            false,
            true,  // isActive field
            null,
            null,  // registrationDate
            null,
            null
        );
    }
    
    @Nested
    @DisplayName("Successful Updates")
    class SuccessfulUpdates {
        
        @Test
        @DisplayName("Should update restaurant when valid command")
        void shouldUpdateRestaurantWhenValidCommand() {
            // Given
            when(restaurantRepository.findById(restaurantId))
                .thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class)))
                .thenReturn(expectedDTO);
            
            // When
            RestaurantDTO result = handler.handle(command);
            
            // Then
            assertNotNull(result);
            assertEquals(expectedDTO, result);
            
            // Verify business logic was applied
            assertEquals("Updated Restaurant", existingRestaurant.getName());
            assertEquals("Updated description", existingRestaurant.getDescription());
            assertEquals("Updated address", existingRestaurant.getAddress());
            assertEquals("0987654321", existingRestaurant.getPhone());
            assertEquals("updated@restaurant.fr", existingRestaurant.getEmail().getValue());
            
            // Verify repository interactions
            verify(restaurantRepository).findById(restaurantId);
            verify(restaurantRepository).save(existingRestaurant);
            verify(mapper).toDTO(existingRestaurant);
        }
        
        @Test
        @DisplayName("Should preserve null fields when command has nulls")
        void shouldPreserveNullFieldsWhenCommandHasNulls() {
            // Given
            UpdateRestaurantCommand partialCommand = new UpdateRestaurantCommand(
                restaurantId,
                "New Name",
                null, // Keep existing description
                null, // Keep existing address
                null, // Keep existing phone
                null, // Keep existing email
                null,
                null,
                null
            );
            
            String originalDescription = existingRestaurant.getDescription();
            String originalAddress = existingRestaurant.getAddress();
            String originalPhone = existingRestaurant.getPhone();
            String originalEmail = existingRestaurant.getEmail().getValue();
            
            when(restaurantRepository.findById(restaurantId))
                .thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class)))
                .thenReturn(expectedDTO);
            
            // When
            handler.handle(partialCommand);
            
            // Then
            assertEquals("New Name", existingRestaurant.getName());
            assertEquals(originalDescription, existingRestaurant.getDescription());
            assertEquals(originalAddress, existingRestaurant.getAddress());
            assertEquals(originalPhone, existingRestaurant.getPhone());
            assertEquals(originalEmail, existingRestaurant.getEmail().getValue());
        }
    }
    
    @Nested
    @DisplayName("Error Handling")
    class ErrorHandling {
        
        @Test
        @DisplayName("Should throw exception when restaurant not found")
        void shouldThrowExceptionWhenRestaurantNotFound() {
            // Given
            when(restaurantRepository.findById(restaurantId))
                .thenReturn(Optional.empty());
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class, 
                () -> handler.handle(command)
            );
            
            assertEquals("Restaurant not found with id: " + restaurantId, exception.getMessage());
            
            // Verify no save or mapping occurred
            verify(restaurantRepository, never()).save(any());
            verify(mapper, never()).toDTO(any());
        }
        
        @Test
        @DisplayName("Should propagate repository exceptions")
        void shouldPropagateRepositoryExceptions() {
            // Given
            when(restaurantRepository.findById(restaurantId))
                .thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class)))
                .thenThrow(new RuntimeException("Database error"));
            
            // When & Then
            RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> handler.handle(command)
            );
            
            assertEquals("Database error", exception.getMessage());
            verify(mapper, never()).toDTO(any());
        }
    }
    
    @Nested
    @DisplayName("Interaction Verification")
    class InteractionVerification {
        
        @Test
        @DisplayName("Should call repository and mapper in correct order")
        void shouldCallRepositoryAndMapperInCorrectOrder() {
            // Given
            when(restaurantRepository.findById(restaurantId))
                .thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class)))
                .thenReturn(expectedDTO);
            
            // When
            handler.handle(command);
            
            // Then - Verify interaction order
            var inOrder = inOrder(restaurantRepository, mapper);
            inOrder.verify(restaurantRepository).findById(restaurantId);
            inOrder.verify(restaurantRepository).save(any(Restaurant.class));
            inOrder.verify(mapper).toDTO(any(Restaurant.class));
        }
        
        @Test
        @DisplayName("Should call each method exactly once")
        void shouldCallEachMethodExactlyOnce() {
            // Given
            when(restaurantRepository.findById(restaurantId))
                .thenReturn(Optional.of(existingRestaurant));
            when(restaurantRepository.save(any(Restaurant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
            when(mapper.toDTO(any(Restaurant.class)))
                .thenReturn(expectedDTO);
            
            // When
            handler.handle(command);
            
            // Then
            verify(restaurantRepository, times(1)).findById(restaurantId);
            verify(restaurantRepository, times(1)).save(any(Restaurant.class));
            verify(mapper, times(1)).toDTO(any(Restaurant.class));
        }
    }
}