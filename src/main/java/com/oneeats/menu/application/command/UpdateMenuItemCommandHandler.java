package com.oneeats.menu.application.command;

import com.oneeats.menu.application.dto.MenuItemDTO;
import com.oneeats.menu.application.dto.MenuItemOptionCommandDTO;
import com.oneeats.menu.application.dto.MenuItemChoiceCommandDTO;
import com.oneeats.menu.application.mapper.MenuItemApplicationMapper;
import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.model.MenuItemOption;
import com.oneeats.menu.domain.model.MenuItemChoice;
import com.oneeats.menu.domain.model.MenuItemOptionType;
import com.oneeats.menu.domain.repository.IMenuItemRepository;
import com.oneeats.menu.domain.vo.Price;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
        
        if (command.isVegetarian() != null) {
            if (command.isVegetarian()) {
                menuItem.markAsVegetarian();
            } else {
                menuItem.unmarkAsVegetarian();
            }
        }

        if (command.isVegan() != null) {
            if (command.isVegan()) {
                menuItem.markAsVegan();
            } else {
                menuItem.unmarkAsVegan();
            }
        }

        if (command.allergens() != null) {
            menuItem.updateAllergens(command.allergens());
        }

        if (command.isAvailable() != null) {
            if (command.isAvailable()) {
                menuItem.makeAvailable();
            } else {
                menuItem.makeUnavailable();
            }
        }

        // Traitement des options
        if (command.options() != null) {
            List<MenuItemOption> domainOptions = command.options().stream()
                .map(this::mapToDomainOption)
                .collect(Collectors.toList());
            menuItem.updateOptions(domainOptions);
        }

        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        return mapper.toDTO(savedMenuItem);
    }

    /**
     * Convertit un DTO d'option de commande en entité domain
     */
    private MenuItemOption mapToDomainOption(MenuItemOptionCommandDTO dto) {
        MenuItemOption option = new MenuItemOption(
            dto.name(),
            null, // description
            MenuItemOptionType.valueOf(dto.type().toUpperCase()),
            dto.isRequired(),
            dto.maxChoices(),
            dto.displayOrder()
        );

        // Ajouter les choix
        dto.choices().forEach(choiceDto -> {
            MenuItemChoice choice = mapToDomainChoice(choiceDto);
            option.addChoice(choice);
        });

        return option;
    }

    /**
     * Convertit un DTO de choix de commande en entité domain
     */
    private MenuItemChoice mapToDomainChoice(MenuItemChoiceCommandDTO dto) {
        MenuItemChoice choice = new MenuItemChoice(
            dto.name(),
            null, // description
            Price.of(dto.additionalPrice()),
            dto.displayOrder()
        );

        // Gérer la disponibilité
        if (!dto.isAvailable()) {
            choice.makeUnavailable();
        }

        return choice;
    }
}