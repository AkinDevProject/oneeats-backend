package com.oneeats.menu.domain.specification;

import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.repository.IMenuItemRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

/**
 * Spécification pour vérifier l'unicité du nom d'un item de menu dans un restaurant
 */
@ApplicationScoped
public class UniqueMenuItemNameSpecification {
    
    private final IMenuItemRepository menuItemRepository;
    
    public UniqueMenuItemNameSpecification(IMenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }
    
    /**
     * Vérifie si le nom est unique dans le restaurant
     */
    public boolean isSatisfiedBy(UUID restaurantId, String name) {
        List<MenuItem> existingItems = menuItemRepository.findByRestaurantId(restaurantId);
        
        return existingItems.stream()
            .noneMatch(item -> item.getName().getValue().equalsIgnoreCase(name));
    }
    
    /**
     * Vérifie si le nom est unique dans le restaurant, en excluant un item spécifique
     * (utile pour les mises à jour)
     */
    public boolean isSatisfiedByExcluding(UUID restaurantId, String name, UUID excludeItemId) {
        List<MenuItem> existingItems = menuItemRepository.findByRestaurantId(restaurantId);
        
        return existingItems.stream()
            .filter(item -> !item.getId().equals(excludeItemId))
            .noneMatch(item -> item.getName().getValue().equalsIgnoreCase(name));
    }
}