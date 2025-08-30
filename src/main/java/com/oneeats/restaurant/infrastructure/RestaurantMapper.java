package com.oneeats.restaurant.infrastructure;

import com.oneeats.restaurant.api.CreateRestaurantRequest;
import com.oneeats.restaurant.api.RestaurantDto;
import com.oneeats.restaurant.api.UpdateRestaurantRequest;
import com.oneeats.restaurant.domain.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Mapper pour convertir entre les entités Restaurant et les DTOs
 */
@ApplicationScoped
public class RestaurantMapper {
    
    /**
     * Convertir une entité Restaurant en DTO
     */
    public RestaurantDto toDto(Restaurant restaurant) {
        if (restaurant == null) {
            return null;
        }
        
        return new RestaurantDto(
            restaurant.getId(),
            restaurant.getName(),
            restaurant.getDescription(),
            restaurant.getAddress(),
            restaurant.getPhone(),
            restaurant.getEmail(),
            restaurant.getCuisineType(),
            restaurant.getImageUrl(),
            restaurant.getIsOpen(),
            restaurant.getIsActive(),
            restaurant.getRating(),
            restaurant.getCreatedAt(),
            restaurant.getUpdatedAt()
        );
    }
    
    /**
     * Convertir une requête de création en entité
     */
    public Restaurant toEntity(CreateRestaurantRequest request) {
        if (request == null) {
            return null;
        }
        
        Restaurant restaurant = new Restaurant(
            request.name(),
            request.description(),
            request.address(),
            request.cuisineType()
        );
        
        restaurant.setPhone(request.phone());
        restaurant.setEmail(request.email());
        
        return restaurant;
    }
    
    /**
     * Mettre à jour une entité existante avec les données d'une requête de mise à jour
     */
    public void updateEntity(Restaurant restaurant, UpdateRestaurantRequest request) {
        if (restaurant == null || request == null) {
            return;
        }
        
        restaurant.updateInfo(
            request.name(),
            request.description(),
            request.address(),
            request.phone(),
            request.email()
        );
        restaurant.setCuisineType(request.cuisineType());
    }
}