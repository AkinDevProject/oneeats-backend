package com.oneeats.restaurant.internal.application;

import com.oneeats.restaurant.api.model.RestaurantDto;
import com.oneeats.restaurant.api.interface_.RestaurantRepository;
import com.oneeats.restaurant.internal.entity.Restaurant;
import com.oneeats.restaurant.internal.mapper.RestaurantMapper;
import java.util.Optional;
import java.util.UUID;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetRestaurantUseCase {
    private final RestaurantRepository restaurantRepository;

    public GetRestaurantUseCase(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public Optional<RestaurantDto> handle(UUID restaurantId) {
        Optional<Restaurant> optRestaurant = restaurantRepository.findById(restaurantId);
        return optRestaurant.map(RestaurantMapper::toDto);
    }
}
