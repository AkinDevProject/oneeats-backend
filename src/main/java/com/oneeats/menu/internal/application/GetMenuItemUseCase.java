package com.oneeats.menu.internal.application;

import com.oneeats.menu.api.model.MenuItemDto;
import com.oneeats.menu.api.interface_.MenuRepository;
import com.oneeats.menu.internal.entity.MenuItem;
import com.oneeats.menu.internal.mapper.MenuItemMapper;
import java.util.Optional;
import java.util.UUID;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetMenuItemUseCase {
    private final MenuRepository menuRepository;

    public GetMenuItemUseCase(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    public Optional<MenuItemDto> handle(UUID menuItemId) {
        Optional<MenuItem> optMenuItem = menuRepository.findById(menuItemId);
        return optMenuItem.map(MenuItemMapper::toDto);
    }
}
