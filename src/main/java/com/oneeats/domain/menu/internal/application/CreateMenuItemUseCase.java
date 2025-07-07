package com.oneeats.domain.menu.internal.application;

import com.oneeats.domain.menu.api.cqrs.command.CreateMenuItemCommand;
import com.oneeats.domain.menu.api.interface_.MenuRepository;
import com.oneeats.domain.menu.internal.entity.MenuItem;
import com.oneeats.domain.restaurant.api.interface_.RestaurantRepository;
import com.oneeats.domain.restaurant.internal.entity.Restaurant;
import java.util.Optional;
import java.util.UUID;
import java.math.BigDecimal;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Cas d’usage pour la création d’un plat (MenuItem).
 * Orchestration de la validation des données, de l’association au restaurant et de la persistance via MenuRepository.
 * Utilisé lors de l’ajout d’un nouveau plat à la carte d’un restaurant.
 */
@ApplicationScoped
public class CreateMenuItemUseCase {
    private final MenuRepository menuRepository;
    private final RestaurantRepository restaurantRepository;

    public CreateMenuItemUseCase(MenuRepository menuRepository, RestaurantRepository restaurantRepository) {
        this.menuRepository = menuRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public UUID handle(CreateMenuItemCommand command) {
        Optional<Restaurant> optRestaurant = restaurantRepository.findById(command.getRestaurantId());
        if (optRestaurant.isEmpty()) {
            throw new IllegalArgumentException("Restaurant introuvable pour l'id fourni");
        }
        Restaurant restaurant = optRestaurant.get();
        MenuItem menuItem = new MenuItem(
            UUID.randomUUID(),
            command.getNom(),
            command.getDescription(),
            command.getPrix(),
            command.isDisponible(),
            command.getCategorie(),
            restaurant
        );
        menuRepository.save(menuItem);
        return menuItem.getId();
    }
}
