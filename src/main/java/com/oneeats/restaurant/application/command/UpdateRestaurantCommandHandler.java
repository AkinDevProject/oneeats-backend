package com.oneeats.restaurant.application.command;

import com.oneeats.restaurant.application.dto.RestaurantDTO;
import com.oneeats.restaurant.application.mapper.RestaurantApplicationMapper;
import com.oneeats.restaurant.domain.model.Restaurant;
import com.oneeats.restaurant.domain.repository.IRestaurantRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UpdateRestaurantCommandHandler {

    @Inject
    IRestaurantRepository restaurantRepository;

    @Inject
    RestaurantApplicationMapper mapper;

    @Transactional
    public RestaurantDTO handle(UpdateRestaurantCommand command) {
        Restaurant restaurant = restaurantRepository.findById(command.id())
            .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + command.id()));

        // Mettre à jour les informations de base
        restaurant.updateInfo(
            command.name() != null ? command.name() : restaurant.getName(),
            command.description() != null ? command.description() : restaurant.getDescription(),
            command.address() != null ? command.address() : restaurant.getAddress(),
            command.phone() != null ? command.phone() : restaurant.getPhone(),
            command.email() != null ? command.email() : restaurant.getEmail().getValue()
        );

        // Gérer le statut ouvert/fermé si spécifié
        if (command.isOpen() != null) {
            try {
                if (command.isOpen()) {
                    // S'assurer que le restaurant est actif avant de l'ouvrir
                    if (restaurant.getStatus().name().equals("PENDING")) {
                        restaurant.activate();
                    }
                    if (!restaurant.getStatus().name().equals("OPEN")) {
                        restaurant.open();
                    }
                } else {
                    if (restaurant.getStatus().name().equals("OPEN")) {
                        restaurant.close();
                    }
                }
            } catch (IllegalStateException e) {
                // Ignorer les erreurs de transition de statut pour l'instant
                System.out.println("Status transition ignored: " + e.getMessage());
            }
        }

        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        return mapper.toDTO(savedRestaurant);
    }
}