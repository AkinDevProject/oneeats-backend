package com.oneeats.domain.restaurant.internal.application;

import com.oneeats.domain.restaurant.api.cqrs.command.ValidateRestaurantCommand;
import com.oneeats.domain.restaurant.api.interface_.RestaurantRepository;
import com.oneeats.domain.restaurant.internal.entity.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class ValidateRestaurantUseCase {
    private final RestaurantRepository restaurantRepository;

    public ValidateRestaurantUseCase(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public boolean handle(ValidateRestaurantCommand command) {
        Optional<Restaurant> optRestaurant = restaurantRepository.findById(command.getRestaurantId());
        if (optRestaurant.isEmpty()) {
            return false;
        }
        Restaurant restaurant = optRestaurant.get();
        restaurant.setStatutValidation(command.getStatutValidation());
        // Possibilité d’enregistrer le commentaire dans une future évolution
        restaurantRepository.save(restaurant);
        return true;
    }
}
