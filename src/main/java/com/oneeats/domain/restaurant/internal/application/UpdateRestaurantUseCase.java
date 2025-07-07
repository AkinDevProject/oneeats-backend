package com.oneeats.domain.restaurant.internal.application;

import com.oneeats.domain.restaurant.api.cqrs.command.UpdateRestaurantCommand;
import com.oneeats.domain.restaurant.api.interface_.RestaurantRepository;
import com.oneeats.domain.restaurant.internal.entity.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UpdateRestaurantUseCase {
    private final RestaurantRepository restaurantRepository;

    public UpdateRestaurantUseCase(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public boolean handle(UpdateRestaurantCommand command) {
        Optional<Restaurant> optRestaurant = restaurantRepository.findById(command.getId());
        if (optRestaurant.isEmpty()) {
            return false;
        }
        Restaurant restaurant = optRestaurant.get();
        // Mise à jour des champs
        restaurant.setNom(command.getNom());
        restaurant.setDescription(command.getDescription());
        restaurant.setAdresse(command.getAdresse());
        restaurant.setTelephone(command.getTelephone());
        restaurant.setEmail(command.getEmail());
        // ... autres champs si besoin
        restaurantRepository.save(restaurant);
        return true;
    }
}
