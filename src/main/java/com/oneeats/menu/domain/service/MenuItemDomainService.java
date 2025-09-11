package com.oneeats.menu.domain.service;

import com.oneeats.shared.domain.exception.ValidationException;
import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.repository.IMenuItemRepository;
import com.oneeats.menu.domain.specification.UniqueMenuItemNameSpecification;
import com.oneeats.menu.domain.vo.Category;
import com.oneeats.menu.domain.vo.Price;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implémentation du service de domaine pour MenuItem
 */
@ApplicationScoped
public class MenuItemDomainService implements IMenuItemDomainService {
    
    private final IMenuItemRepository menuItemRepository;
    private final UniqueMenuItemNameSpecification uniqueNameSpec;
    
    public MenuItemDomainService(IMenuItemRepository menuItemRepository, 
                                UniqueMenuItemNameSpecification uniqueNameSpec) {
        this.menuItemRepository = menuItemRepository;
        this.uniqueNameSpec = uniqueNameSpec;
    }
    
    @Override
    public void validateMenuItemCreation(UUID restaurantId, String name, Price price, String category) {
        // Vérifier l'unicité du nom dans le restaurant
        if (!uniqueNameSpec.isSatisfiedBy(restaurantId, name)) {
            throw new ValidationException("A menu item with name '" + name + "' already exists in this restaurant");
        }
        
        // Vérifier la cohérence du prix avec la catégorie
        validatePriceForCategory(price, Category.of(category));
        
        // Limiter le nombre d'items par restaurant
        long currentCount = menuItemRepository.countByRestaurantId(restaurantId);
        if (currentCount >= 500) { // Limite arbitraire
            throw new ValidationException("Restaurant cannot have more than 500 menu items");
        }
    }
    
    @Override
    public void validateMenuItemUpdate(MenuItem menuItem, String name, Price price, String category) {
        // Vérifier l'unicité du nom (sauf pour l'item actuel)
        if (!menuItem.getName().getValue().equals(name)) {
            if (!uniqueNameSpec.isSatisfiedByExcluding(menuItem.getRestaurantId(), name, menuItem.getId())) {
                throw new ValidationException("A menu item with name '" + name + "' already exists in this restaurant");
            }
        }
        
        // Vérifier la cohérence du prix avec la catégorie
        validatePriceForCategory(price, Category.of(category));
    }
    
    @Override
    public boolean canDeleteMenuItem(MenuItem menuItem) {
        // Un item peut être supprimé s'il n'est pas actuellement dans des commandes en cours
        // Cette logique pourrait nécessiter une vérification avec le domaine Order
        return true; // Simplified logic
    }
    
    @Override
    public Price calculateAveragePrice(List<MenuItem> menuItems) {
        if (menuItems.isEmpty()) {
            return Price.of(0);
        }
        
        BigDecimal total = menuItems.stream()
            .map(item -> item.getPrice().getAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal average = total.divide(BigDecimal.valueOf(menuItems.size()), RoundingMode.HALF_UP);
        return Price.of(average);
    }
    
    @Override
    public List<MenuItem> findSimilarItems(MenuItem menuItem, int limit) {
        // Rechercher des items similaires basés sur la catégorie et le prix
        List<MenuItem> sameCategory = menuItemRepository.findByRestaurantIdAndCategory(
            menuItem.getRestaurantId(), 
            menuItem.getCategory()
        );
        
        Price itemPrice = menuItem.getPrice();
        Price lowerBound = Price.of(itemPrice.getAmount().multiply(BigDecimal.valueOf(0.8)));
        Price upperBound = Price.of(itemPrice.getAmount().multiply(BigDecimal.valueOf(1.2)));
        
        return sameCategory.stream()
            .filter(item -> !item.getId().equals(menuItem.getId()))
            .filter(item -> item.getPrice().getAmount().compareTo(lowerBound.getAmount()) >= 0 &&
                           item.getPrice().getAmount().compareTo(upperBound.getAmount()) <= 0)
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    @Override
    public void validateMenuConsistency(UUID restaurantId) {
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantId(restaurantId);
        
        // Vérifier qu'il n'y a pas de noms dupliqués
        long uniqueNames = menuItems.stream()
            .map(item -> item.getName().getValue())
            .distinct()
            .count();
        
        if (uniqueNames != menuItems.size()) {
            throw new ValidationException("Duplicate menu item names found in restaurant menu");
        }
        
        // Vérifier qu'il y a au moins un item disponible
        boolean hasAvailableItems = menuItems.stream()
            .anyMatch(MenuItem::getIsAvailable);
        
        if (menuItems.size() > 0 && !hasAvailableItems) {
            throw new ValidationException("Restaurant must have at least one available menu item");
        }
    }
    
    @Override
    public double calculateItemPopularityScore(MenuItem menuItem) {
        double score = 0.0;
        
        // Facteurs de popularité
        if (menuItem.getIsVegetarian()) score += 10;
        if (menuItem.getIsVegan()) score += 15;
        if (menuItem.getAllergens().isEmpty()) score += 5;
        if (menuItem.getPreparationTime().isQuick()) score += 10;
        if (menuItem.getPrice().getAmount().compareTo(BigDecimal.valueOf(15)) < 0) score += 5;
        
        return score;
    }
    
    // Méthodes privées d'aide
    
    private void validatePriceForCategory(Price price, Category category) {
        // Règles métier pour les prix par catégorie
        BigDecimal amount = price.getAmount();
        
        switch (category.getValue()) {
            case "BEVERAGE":
                if (amount.compareTo(BigDecimal.valueOf(20)) > 0) {
                    throw new ValidationException("Beverage price cannot exceed 20.00");
                }
                break;
            case "DESSERT":
                if (amount.compareTo(BigDecimal.valueOf(30)) > 0) {
                    throw new ValidationException("Dessert price cannot exceed 30.00");
                }
                break;
            case "PIZZA":
                if (amount.compareTo(BigDecimal.valueOf(50)) > 0) {
                    throw new ValidationException("Pizza price cannot exceed 50.00");
                }
                if (amount.compareTo(BigDecimal.valueOf(8)) < 0) {
                    throw new ValidationException("Pizza price cannot be less than 8.00");
                }
                break;
            // Ajouter d'autres règles selon les besoins
        }
    }
}