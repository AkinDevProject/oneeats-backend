package com.oneeats.restaurant.application.mapper;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.domain.model.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class RestaurantApplicationMapper {
    
    public RestaurantDTO toDTO(Restaurant restaurant) {
        return new RestaurantDTO(
            restaurant.getId(),
            restaurant.getName(),
            restaurant.getDescription(),
            restaurant.getAddress(),
            restaurant.getPhone(),
            restaurant.getEmail().getValue(),
            restaurant.getCuisineType(),
            restaurant.getRating(),
            restaurant.getImageUrl(),
            restaurant.getStatus(),
            restaurant.getCreatedAt(),
            restaurant.getUpdatedAt()
        );
    }
}