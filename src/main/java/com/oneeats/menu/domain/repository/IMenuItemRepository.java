package com.oneeats.menu.domain.repository;

import com.oneeats.menu.domain.model.MenuItem;
import com.oneeats.menu.domain.vo.Category;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port du repository pour MenuItem - Interface du domaine
 * Définit les opérations de persistence nécessaires au domaine
 */
public interface IMenuItemRepository {
    
    // Opérations CRUD de base
    MenuItem save(MenuItem menuItem);
    Optional<MenuItem> findById(UUID id);
    void deleteById(UUID id);
    boolean existsById(UUID id);
    
    // Requêtes métier spécifiques
    List<MenuItem> findByRestaurantId(UUID restaurantId);
    List<MenuItem> findAvailableByRestaurantId(UUID restaurantId);
    List<MenuItem> findByRestaurantIdAndCategory(UUID restaurantId, Category category);
    List<MenuItem> findVegetarianByRestaurantId(UUID restaurantId);
    List<MenuItem> findVeganByRestaurantId(UUID restaurantId);
    
    // Recherche et filtrage
    List<MenuItem> searchInRestaurant(UUID restaurantId, String searchTerm);
    List<MenuItem> findWithFilters(UUID restaurantId, String category, Boolean vegetarian, 
                                  Boolean vegan, Boolean available, int page, int size);
    
    // Requêtes pour les catégories
    List<String> findCategoriesByRestaurantId(UUID restaurantId);
    
    // Opérations spécialisées
    boolean deleteByIdSafe(UUID id);
    long countByRestaurantId(UUID restaurantId);
    List<MenuItem> findMostPopular(UUID restaurantId, int limit);
    
    // Support pour la recherche globale
    List<MenuItem> search(String searchTerm);
    List<MenuItem> findByPriceRange(UUID restaurantId, Double minPrice, Double maxPrice);
    
    // Opérations de batch
    List<MenuItem> saveAll(List<MenuItem> menuItems);
    void deleteAllByRestaurantId(UUID restaurantId);
}