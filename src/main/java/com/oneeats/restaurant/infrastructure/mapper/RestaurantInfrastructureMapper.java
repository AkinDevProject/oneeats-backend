package com.oneeats.restaurant.infrastructure.mapper;

import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.model.RestaurantStatus;
import com.oneeats.restaurant.infrastructure.entity.RestaurantEntity;
import com.oneeats.shared.domain.vo.Email;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class RestaurantInfrastructureMapper {

    public Restaurant toDomain(RestaurantEntity entity) {
        RestaurantStatus status;
        if (entity.getIsOpen()) {
            status = RestaurantStatus.OPEN;
        } else if (entity.getIsActive()) {
            status = RestaurantStatus.ACTIVE;
        } else {
            status = RestaurantStatus.SUSPENDED;
        }
        
        Restaurant restaurant = new Restaurant(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getAddress(),
            entity.getPhone(),
            new Email(entity.getEmail()),
            entity.getCuisineType(),
            status
        );
        
        restaurant.setCreatedAt(entity.getCreatedAt());
        restaurant.setUpdatedAt(entity.getUpdatedAt());
        restaurant.setImageUrl(entity.getImageUrl());
        restaurant.updateRating(entity.getRating());
        
        return restaurant;
    }

    public RestaurantEntity toEntity(Restaurant restaurant) {
        boolean isOpen = restaurant.getStatus() == RestaurantStatus.OPEN;
        boolean isActive = restaurant.getStatus() == RestaurantStatus.ACTIVE || restaurant.getStatus() == RestaurantStatus.OPEN;
        
        return new RestaurantEntity(
            restaurant.getId(),
            restaurant.getName(),
            restaurant.getDescription(),
            restaurant.getAddress(),
            restaurant.getPhone(),
            restaurant.getEmail().getValue(),
            restaurant.getCuisineType(),
            restaurant.getRating(),
            restaurant.getImageUrl(),
            isOpen,
            isActive,
            restaurant.getCreatedAt(),
            restaurant.getUpdatedAt()
        );
    }
}