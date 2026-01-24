package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import com.oneeats.restaurant.domain.model.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class BlockRestaurantCommandHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    RestaurantApplicationMapper mapper;

    @Transactional
    public RestaurantDTO handle(BlockRestaurantCommand command) {
        Restaurant restaurant = restaurantRepository.findById(command.restaurantId())
            .orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + command.restaurantId()));

        // Utilise la méthode domain qui valide les règles métier
        restaurant.block(command.reason());

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapper.toDTO(savedRestaurant);
    }
}
