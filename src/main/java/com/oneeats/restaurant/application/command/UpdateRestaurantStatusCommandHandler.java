package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.restaurant.domain.model.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UpdateRestaurantStatusCommandHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    RestaurantApplicationMapper mapper;

    @Transactional
    public RestaurantDTO handle(UpdateRestaurantStatusCommand command) {
        Restaurant restaurant = restaurantRepository.findById(command.restaurantId())
            .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + command.restaurantId()));

        restaurant.updateStatus(command.status());

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapper.toDTO(savedRestaurant);
    }
}