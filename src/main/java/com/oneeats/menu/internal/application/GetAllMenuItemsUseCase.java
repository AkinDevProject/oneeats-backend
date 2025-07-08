package com.oneeats.menu.internal.application;

import com.oneeats.menu.api.model.MenuItemDto;
import com.oneeats.menu.api.interface_.MenuRepository;
import com.oneeats.menu.internal.entity.MenuItem;
import com.oneeats.menu.internal.mapper.MenuItemMapper;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GetAllMenuItemsUseCase {
    private final MenuRepository menuRepository;

    public GetAllMenuItemsUseCase(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }

    public List<MenuItemDto> handle() {
        List<MenuItem> items = menuRepository.findAll();
        return items.stream().map(MenuItemMapper::toDto).collect(Collectors.toList());
    }
}
