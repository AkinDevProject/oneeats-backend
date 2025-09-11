package com.oneeats.menu.application.query;

import com.oneeats.menu.application.dto.MenuItemDTO;
import com.oneeats.menu.application.mapper.MenuItemApplicationMapper;
import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.repository.IMenuItemRepository;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.UUID;

@ApplicationScoped
public class GetMenuItemQueryHandler {
    
    @Inject
    IMenuItemRepository menuItemRepository;
    
    @Inject
    MenuItemApplicationMapper mapper;
    
    public MenuItemDTO handle(GetMenuItemQuery query) {
        MenuItem menuItem = menuItemRepository.findById(query.id())
            .orElseThrow(() -> new EntityNotFoundException("MenuItem", query.id()));
            
        return mapper.toDTO(menuItem);
    }
}