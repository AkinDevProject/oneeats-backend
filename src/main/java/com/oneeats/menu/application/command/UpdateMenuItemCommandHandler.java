package com.oneeats.menu.application.command;

import com.oneeats.menu.application.dto.MenuItemDTO;
import com.oneeats.menu.application.mapper.MenuItemApplicationMapper;
import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.repository.IMenuItemRepository;
import com.oneeats.menu.domain.vo.Price;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class UpdateMenuItemCommandHandler {
    
    @Inject
    IMenuItemRepository menuItemRepository;
    
    @Inject
    MenuItemApplicationMapper mapper;
    
    @Transactional
    public MenuItemDTO handle(UpdateMenuItemCommand command) {
        MenuItem menuItem = menuItemRepository.findById(command.id())
            .orElseThrow(() -> new EntityNotFoundException("MenuItem", command.id()));
        
        // Mise à jour des propriétés
        if (command.name() != null) {
            menuItem.updateName(command.name());
        }
        
        if (command.description() != null) {
            menuItem.updateDescription(command.description());
        }
        
        if (command.price() != null) {
            menuItem.updatePrice(Price.of(command.price()));
        }
        
        if (command.category() != null) {
            menuItem.updateCategory(command.category());
        }
        
        if (command.imageUrl() != null) {
            menuItem.updateImageUrl(command.imageUrl());
        }
        
        if (command.preparationTimeMinutes() != null) {
            menuItem.updatePreparationTime(command.preparationTimeMinutes());
        }
        
        if (command.isVegetarian()) {
            menuItem.markAsVegetarian();
        } else {
            menuItem.unmarkAsVegetarian();
        }
        
        if (command.isVegan()) {
            menuItem.markAsVegan();
        } else {
            menuItem.unmarkAsVegan();
        }
        
        if (command.allergens() != null) {
            menuItem.updateAllergens(command.allergens());
        }
        
        if (command.isAvailable()) {
            menuItem.makeAvailable();
        } else {
            menuItem.makeUnavailable();
        }
        
        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        return mapper.toDTO(savedMenuItem);
    }
}