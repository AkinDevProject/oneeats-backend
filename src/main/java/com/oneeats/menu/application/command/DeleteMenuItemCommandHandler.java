package com.oneeats.menu.application.command;

import com.oneeats.menu.domain.repository.IMenuItemRepository;
import com.oneeats.shared.domain.exception.EntityNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DeleteMenuItemCommandHandler {
    
    @Inject
    IMenuItemRepository menuItemRepository;
    
    @Transactional
    public void handle(DeleteMenuItemCommand command) {
        if (!menuItemRepository.existsById(command.id())) {
            throw new EntityNotFoundException("MenuItem", command.id());
        }
        
        menuItemRepository.deleteById(command.id());
    }
}