package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.restaurant.domain.model.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DeleteRestaurantCommandHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Transactional
    public void handle(DeleteRestaurantCommand command) {
        Restaurant restaurant = restaurantRepository.findById(command.restaurantId())
            .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + command.restaurantId()));

        restaurantRepository.delete(restaurant);
    }
}