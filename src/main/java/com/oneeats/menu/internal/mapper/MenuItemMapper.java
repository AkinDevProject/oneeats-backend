package com.oneeats.menu.internal.mapper;

import com.oneeats.menu.internal.entity.MenuItem;
import com.oneeats.menu.api.model.MenuItemDto;

public class MenuItemMapper {
    public static MenuItemDto toDto(MenuItem menuItem) {
        if (menuItem == null) return null;
        MenuItemDto dto = new MenuItemDto();
        dto.setId(menuItem.getId());
        dto.setNom(menuItem.getNom());
        dto.setDescription(menuItem.getDescription());
        dto.setPrix(menuItem.getPrix());
        dto.setDisponible(menuItem.isDisponible());
        dto.setCategorie(menuItem.getCategorie());
        dto.setRestaurantId(menuItem.getRestaurant() != null ? menuItem.getRestaurant().getId() : null);
        return dto;
    }
}

