package com.oneeats.domain.menu.internal.application;

import com.oneeats.domain.menu.api.model.MenuItemDto;
import com.oneeats.domain.menu.api.interface_.MenuRepository;
import com.oneeats.domain.menu.internal.entity.MenuItem;
import com.oneeats.domain.menu.internal.mapper.MenuItemMapper;
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
