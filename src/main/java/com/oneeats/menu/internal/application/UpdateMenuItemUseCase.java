package com.oneeats.menu.internal.application;

import com.oneeats.menu.api.cqrs.command.UpdateMenuItemCommand;
import com.oneeats.menu.api.interface_.MenuRepository;
import com.oneeats.menu.internal.entity.MenuItem;
import com.oneeats.restaurant.api.interface_.RestaurantRepository;
import com.oneeats.restaurant.internal.entity.Restaurant;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class UpdateMenuItemUseCase {
    private final MenuRepository menuRepository;
    private final RestaurantRepository restaurantRepository;

    public UpdateMenuItemUseCase(MenuRepository menuRepository, RestaurantRepository restaurantRepository) {
        this.menuRepository = menuRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public boolean handle(UpdateMenuItemCommand command) {
        Optional<MenuItem> optMenuItem = menuRepository.findById(command.getId());
        if (optMenuItem.isEmpty()) {
            return false;
        }
        MenuItem menuItem = optMenuItem.get();
        menuItem.setNom(command.getNom());
        menuItem.setDescription(command.getDescription());
        menuItem.setPrix(command.getPrix());
        menuItem.setDisponible(command.isDisponible());
        menuItem.setCategorie(command.getCategorie());
        if (command.getRestaurantId() != null) {
            Optional<Restaurant> optRestaurant = restaurantRepository.findById(command.getRestaurantId());
            optRestaurant.ifPresent(menuItem::setRestaurant);
        }
        menuRepository.save(menuItem);
        return true;
    }
}
