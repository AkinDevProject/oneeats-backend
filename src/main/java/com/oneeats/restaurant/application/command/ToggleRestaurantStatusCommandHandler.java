package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class ToggleRestaurantStatusCommandHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    RestaurantApplicationMapper mapper;

    @Transactional
    public RestaurantDTO handle(ToggleRestaurantStatusCommand command) {
        Restaurant restaurant = restaurantRepository.findById(command.id())
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (command.isOpen()) {
            restaurant.open();
        } else {
            restaurant.close();
        }

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapper.toDTO(savedRestaurant);
    }
}