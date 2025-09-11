package com.oneeats.menu.infrastructure.configuration;

import com.oneeats.menu.domain.repository.IMenuItemRepository;
import com.oneeats.menu.infrastructure.persistence.repository.MenuItemRepositoryImpl;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;

@ApplicationScoped
public class MenuConfiguration {
    
    @Inject
    MenuItemRepositoryImpl menuItemRepositoryImpl;
    
    @Produces
    @ApplicationScoped
    public IMenuItemRepository menuItemRepository() {
        return menuItemRepositoryImpl;
    }
}