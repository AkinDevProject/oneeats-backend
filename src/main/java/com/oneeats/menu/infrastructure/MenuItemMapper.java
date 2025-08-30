package com.oneeats.menu.infrastructure;

import com.oneeats.menu.api.CreateMenuItemRequest;
import com.oneeats.menu.api.MenuItemDto;
import com.oneeats.menu.domain.MenuItem;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Mapper pour convertir entre les entités MenuItem et les DTOs
 */
@ApplicationScoped
public class MenuItemMapper {
    
    /**
     * Convertir une entité MenuItem en DTO
     */
    public MenuItemDto toDto(MenuItem menuItem) {
        if (menuItem == null) {
            return null;
        }
        
        return new MenuItemDto(
            menuItem.getId(),
            menuItem.getRestaurantId(),
            menuItem.getName(),
            menuItem.getDescription(),
            menuItem.getPrice(),
            menuItem.getCategory(),
            menuItem.getImageUrl(),
            menuItem.getIsAvailable(),
            menuItem.getPreparationTimeMinutes(),
            menuItem.getIsVegetarian(),
            menuItem.getIsVegan(),
            menuItem.getAllergens(),
            menuItem.getCreatedAt(),
            menuItem.getUpdatedAt()
        );
    }
    
    /**
     * Convertir une requête de création en entité
     */
    public MenuItem toEntity(CreateMenuItemRequest request) {
        if (request == null) {
            return null;
        }
        
        MenuItem menuItem = new MenuItem(
            request.restaurantId(),
            request.name(),
            request.description(),
            request.price(),
            request.category()
        );
        
        if (request.preparationTimeMinutes() != null) {
            menuItem.setPreparationTime(request.preparationTimeMinutes());
        }
        
        if (request.isVegetarian() != null || request.isVegan() != null || request.allergens() != null) {
            menuItem.updateDietaryInfo(
                request.isVegetarian() != null ? request.isVegetarian() : false,
                request.isVegan() != null ? request.isVegan() : false,
                request.allergens()
            );
        }
        
        return menuItem;
    }
    
    /**
     * Mettre à jour une entité existante avec les données d'une requête
     */
    public void updateEntity(MenuItem menuItem, CreateMenuItemRequest request) {
        if (menuItem == null || request == null) {
            return;
        }
        
        menuItem.updateInfo(
            request.name(),
            request.description(),
            request.price(),
            request.category()
        );
        
        if (request.preparationTimeMinutes() != null) {
            menuItem.setPreparationTime(request.preparationTimeMinutes());
        }
        
        if (request.isVegetarian() != null || request.isVegan() != null || request.allergens() != null) {
            menuItem.updateDietaryInfo(
                request.isVegetarian() != null ? request.isVegetarian() : menuItem.getIsVegetarian(),
                request.isVegan() != null ? request.isVegan() : menuItem.getIsVegan(),
                request.allergens() != null ? request.allergens() : menuItem.getAllergens()
            );
        }
    }
}