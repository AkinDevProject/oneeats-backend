package com.oneeats.menu.application.query;

import com.oneeats.menu.application.dto.MenuItemDTO;
import com.oneeats.menu.application.mapper.MenuItemApplicationMapper;
import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.repository.IMenuItemRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class GetRestaurantMenuQueryHandler {
    
    @Inject
    IMenuItemRepository menuItemRepository;
    
    @Inject
    MenuItemApplicationMapper mapper;
    
    public List<MenuItemDTO> handle(GetRestaurantMenuQuery query) {
        List<MenuItem> menuItems;
        
        if (query.onlyAvailable()) {
            menuItems = menuItemRepository.findAvailableByRestaurantId(query.restaurantId());
        } else {
            menuItems = menuItemRepository.findByRestaurantId(query.restaurantId());
        }
        
        return menuItems.stream()
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }
}