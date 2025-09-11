package com.oneeats.restaurant.infrastructure.mapper;

import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.infrastructure.entity.RestaurantEntity;
import com.oneeats.shared.domain.vo.Email;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class RestaurantInfrastructureMapper {

    public Restaurant toDomain(RestaurantEntity entity) {
        return new Restaurant(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getAddress(),
            entity.getPhone(),
            new Email(entity.getEmail()),
            entity.getCuisineType(),
            entity.getStatus()
        );
    }

    public RestaurantEntity toEntity(Restaurant restaurant) {
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
            restaurant.getStatus(),
            restaurant.getCreatedAt(),
            restaurant.getUpdatedAt()
        );
    }
}