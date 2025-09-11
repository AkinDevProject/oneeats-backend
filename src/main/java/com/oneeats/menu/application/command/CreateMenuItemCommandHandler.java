package com.oneeats.menu.application.command;

import com.oneeats.menu.application.dto.MenuItemDTO;
import com.oneeats.menu.application.mapper.MenuItemApplicationMapper;
import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.repository.IMenuItemRepository;
import com.oneeats.menu.domain.service.IMenuItemDomainService;
import com.oneeats.menu.domain.vo.Price;
import com.oneeats.shared.domain.event.DomainEventPublisher;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class CreateMenuItemCommandHandler {
    
    @Inject
    IMenuItemRepository menuItemRepository;
    
    @Inject
    IMenuItemDomainService domainService;
    
    @Inject
    MenuItemApplicationMapper mapper;
    
    @Inject
    DomainEventPublisher eventPublisher;
    
    @Transactional
    public MenuItemDTO handle(CreateMenuItemCommand command) {
        // Validation métier
        Price price = new Price(command.price());
        domainService.validateMenuItemCreation(command.restaurantId(), command.name(), price, command.category());
        
        // Création du MenuItem
        MenuItem menuItem = MenuItem.create(
            command.restaurantId(),
            command.name(),
            command.description(),
            Price.of(command.price()),
            command.category()
        );
        
        // Définir les propriétés optionnelles
        if (command.imageUrl() != null) {
            menuItem.updateImageUrl(command.imageUrl());
        }
        
        if (command.preparationTimeMinutes() != null) {
            menuItem.updatePreparationTime(command.preparationTimeMinutes());
        }
        
        if (command.isVegetarian()) {
            menuItem.markAsVegetarian();
        }
        
        if (command.isVegan()) {
            menuItem.markAsVegan();
        }
        
        if (command.allergens() != null && !command.allergens().isEmpty()) {
            menuItem.updateAllergens(command.allergens());
        }
        
        if (!command.isAvailable()) {
            menuItem.makeUnavailable();
        }
        
        // Sauvegarde
        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        
        // Publication des événements
        savedMenuItem.getDomainEvents().forEach(eventPublisher::publishEvent);
        savedMenuItem.clearDomainEvents();
        
        return mapper.toDTO(savedMenuItem);
    }
}