package com.oneeats.menu.application.mapper;

import com.oneeats.menu.application.dto.MenuItemDTO;
import com.oneeats.menu.application.dto.MenuItemOptionDTO;
import com.oneeats.menu.application.dto.MenuItemChoiceDTO;
import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.model.MenuItemOption;
import com.oneeats.menu.domain.model.MenuItemChoice;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.stream.Collectors;

@ApplicationScoped
public class MenuItemApplicationMapper {
    
    public MenuItemDTO toDTO(MenuItem menuItem) {
        if (menuItem == null) {
            return null;
        }
        
        return new MenuItemDTO(
            menuItem.getId(),
            menuItem.getRestaurantId(),
            menuItem.getName().getValue(),
            menuItem.getDescription(),
            menuItem.getPrice().getAmount(),
            menuItem.getCategory().getValue(),
            menuItem.getImageUrl(),
            menuItem.getIsAvailable(),
            menuItem.getPreparationTimeMinutes(),
            menuItem.getIsVegetarian(),
            menuItem.getIsVegan(),
            menuItem.getAllergens().getValues(),
            menuItem.getOptions() != null ? 
                menuItem.getOptions().stream()
                    .map(this::toOptionDTO)
                    .collect(Collectors.toList()) : null,
            menuItem.getCreatedAt(),
            menuItem.getLastUpdated()
        );
    }
    
    private MenuItemOptionDTO toOptionDTO(MenuItemOption option) {
        if (option == null) {
            return null;
        }
        
        return new MenuItemOptionDTO(
            option.getId(),
            option.getName(),
            option.getDescription(),
            option.getType(),
            option.getIsRequired(),
            option.getMaxChoices(),
            option.getDisplayOrder(),
            option.getChoices() != null ?
                option.getChoices().stream()
                    .map(this::toChoiceDTO)
                    .collect(Collectors.toList()) : null,
            option.getCreatedAt(),
            option.getUpdatedAt()
        );
    }
    
    private MenuItemChoiceDTO toChoiceDTO(MenuItemChoice choice) {
        if (choice == null) {
            return null;
        }
        
        return new MenuItemChoiceDTO(
            choice.getId(),
            choice.getName(),
            choice.getDescription(),
            choice.getAdditionalPrice().getAmount(),
            choice.getDisplayOrder(),
            choice.getIsAvailable(),
            choice.getCreatedAt(),
            choice.getUpdatedAt()
        );
    }
}