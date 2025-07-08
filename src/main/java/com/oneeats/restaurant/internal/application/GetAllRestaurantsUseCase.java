package com.oneeats.restaurant.internal.application;

import com.oneeats.restaurant.api.model.RestaurantDto;
import com.oneeats.restaurant.api.interface_.RestaurantRepository;
import com.oneeats.restaurant.internal.entity.Restaurant;
import com.oneeats.restaurant.internal.mapper.RestaurantMapper;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetAllRestaurantsUseCase {
    private final RestaurantRepository restaurantRepository;

    public GetAllRestaurantsUseCase(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public List<RestaurantDto> handle() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        return restaurants.stream()
                .map(RestaurantMapper::toDto)
                .collect(Collectors.toList());
    }
}
