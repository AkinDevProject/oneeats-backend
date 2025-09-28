package com.oneeats.restaurant.application.query;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GetRestaurantByOwnerQueryHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    RestaurantApplicationMapper mapper;

    public RestaurantDTO handle(GetRestaurantByOwnerQuery query) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(query.ownerId())
            .orElseThrow(() -> new IllegalArgumentException("Restaurant not found for owner id: " + query.ownerId()));

        return mapper.toDTO(restaurant);
    }
}