package com.oneeats.domain.menu.internal.application;

import com.oneeats.domain.menu.api.interface_.MenuRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class DeleteMenuItemUseCase {
    private final MenuRepository menuRepository;

    public DeleteMenuItemUseCase(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    public boolean handle(UUID id) {
        Optional<?> menuItem = menuRepository.findById(id);
        if (menuItem.isPresent()) {
            menuRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
