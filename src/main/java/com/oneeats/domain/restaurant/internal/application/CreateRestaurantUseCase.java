package com.oneeats.domain.restaurant.internal.application;

import com.oneeats.domain.restaurant.api.cqrs.command.CreateRestaurantCommand;
import com.oneeats.domain.restaurant.api.interface_.RestaurantRepository;
import com.oneeats.domain.restaurant.internal.entity.Restaurant;
import com.oneeats.domain.user.internal.entity.User;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

/**
 * Cas d’usage pour la création d’un restaurant.
 * Orchestration de la validation des données, de l’association au propriétaire et de la persistance via RestaurantRepository.
 * Utilisé lors de la proposition d’un nouveau restaurant par un restaurateur.
 */
@ApplicationScoped
public class CreateRestaurantUseCase {
    private final RestaurantRepository restaurantRepository;

    public CreateRestaurantUseCase(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public UUID handle(CreateRestaurantCommand command, User proprietaire) {
        // Construction de l'entité Restaurant à partir du command
        Restaurant restaurant = new Restaurant(
            UUID.randomUUID(),
            command.getNom(),
            command.getDescription(),
            command.getAdresse(),
            command.getTelephone(),
            command.getEmail(),
            null, // horaires à initialiser si besoin
            Restaurant.StatutValidation.EN_ATTENTE,
            proprietaire
        );
        restaurantRepository.save(restaurant);
        return restaurant.getId();
    }
}
