package com.oneeats.menu.infrastructure;

import com.oneeats.menu.api.CreateMenuItemRequest;
import com.oneeats.menu.api.MenuItemDto;
import com.oneeats.menu.api.MenuItemOptionDto;
import com.oneeats.menu.api.MenuItemChoiceDto;
import com.oneeats.menu.domain.MenuItem;
import com.oneeats.menu.domain.MenuItemOption;
import com.oneeats.menu.domain.MenuItemChoice;
import com.oneeats.menu.domain.MenuItemOptionType;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.stream.Collectors;

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
            menuItem.getOptions().stream()
                .map(this::toOptionDto)
                .collect(Collectors.toList()),
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
    
    /**
     * Convertir une option d'entité vers DTO
     */
    public MenuItemOptionDto toOptionDto(MenuItemOption option) {
        if (option == null) {
            return null;
        }
        
        return new MenuItemOptionDto(
            option.getId(),
            option.getMenuItem().getId(),
            option.getName(),
            option.getType().getValue(),
            option.getIsRequired(),
            option.getMaxChoices(),
            option.getDisplayOrder(),
            option.getChoices().stream()
                .map(this::toChoiceDto)
                .collect(Collectors.toList()),
            option.getCreatedAt(),
            option.getUpdatedAt()
        );
    }
    
    /**
     * Convertir un choix d'entité vers DTO
     */
    public MenuItemChoiceDto toChoiceDto(MenuItemChoice choice) {
        if (choice == null) {
            return null;
        }
        
        return new MenuItemChoiceDto(
            choice.getId(),
            choice.getMenuItemOption().getId(),
            choice.getName(),
            choice.getPrice(),
            choice.getDisplayOrder(),
            choice.getIsAvailable(),
            choice.getCreatedAt(),
            choice.getUpdatedAt()
        );
    }
    
    /**
     * Convertir DTO vers entité option
     */
    public MenuItemOption toOptionEntity(MenuItemOptionDto dto, MenuItem menuItem) {
        if (dto == null || menuItem == null) {
            return null;
        }
        
        MenuItemOptionType type = MenuItemOptionType.fromValue(dto.type());
        MenuItemOption option = new MenuItemOption(menuItem, dto.name(), type);
        option.updateInfo(dto.name(), type, dto.isRequired(), dto.maxChoices());
        
        if (dto.choices() != null) {
            dto.choices().forEach(choiceDto -> {
                MenuItemChoice choice = new MenuItemChoice(option, choiceDto.name(), choiceDto.price());
                option.addChoice(choice);
            });
        }
        
        return option;
    }
}