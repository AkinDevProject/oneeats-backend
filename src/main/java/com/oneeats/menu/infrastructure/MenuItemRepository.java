package com.oneeats.menu.infrastructure;

import com.oneeats.common.repository.BaseRepository;
import com.oneeats.menu.domain.MenuItem;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

/**
 * Repository pour les items de menu utilisant PanacheRepository
 */
@ApplicationScoped
public class MenuItemRepository extends BaseRepository<MenuItem> {
    
    /**
     * Trouver tous les items d'un restaurant
     */
    public List<MenuItem> findByRestaurantId(UUID restaurantId) {
        return list("restaurantId", restaurantId, Sort.by("category", "name"));
    }
    
    /**
     * Trouver les items disponibles d'un restaurant
     */
    public List<MenuItem> findAvailableByRestaurantId(UUID restaurantId) {
        return find("restaurantId = :restaurantId AND isAvailable = true", 
                   Parameters.with("restaurantId", restaurantId))
               .list();
    }
    
    /**
     * Trouver les items par restaurant et catégorie
     */
    public List<MenuItem> findByRestaurantIdAndCategory(UUID restaurantId, String category) {
        return find("restaurantId = :restaurantId AND category = :category", 
                   Parameters.with("restaurantId", restaurantId).and("category", category))
               .list();
    }
    
    /**
     * Trouver les catégories d'un restaurant
     */
    public List<String> findCategoriesByRestaurantId(UUID restaurantId) {
        return getEntityManager()
                .createQuery("SELECT DISTINCT m.category FROM MenuItem m WHERE m.restaurantId = :restaurantId ORDER BY m.category", String.class)
                .setParameter("restaurantId", restaurantId)
                .getResultList();
    }
    
    /**
     * Trouver les items végétariens d'un restaurant
     */
    public List<MenuItem> findVegetarianByRestaurantId(UUID restaurantId) {
        return find("restaurantId = :restaurantId AND isVegetarian = true AND isAvailable = true", 
                   Parameters.with("restaurantId", restaurantId))
               .list();
    }
    
    /**
     * Trouver les items végétaliens d'un restaurant
     */
    public List<MenuItem> findVeganByRestaurantId(UUID restaurantId) {
        return find("restaurantId = :restaurantId AND isVegan = true AND isAvailable = true", 
                   Parameters.with("restaurantId", restaurantId))
               .list();
    }
    
    /**
     * Recherche textuelle dans les items de menu
     */
    @Override
    public List<MenuItem> search(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findAll().list();
        }
        
        String term = "%" + searchTerm.toLowerCase() + "%";
        return find("LOWER(name) LIKE :term OR LOWER(description) LIKE :term OR LOWER(category) LIKE :term", 
                   Parameters.with("term", term)).list();
    }
    
    /**
     * Recherche dans les items d'un restaurant spécifique
     */
    public List<MenuItem> searchInRestaurant(UUID restaurantId, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findByRestaurantId(restaurantId);
        }
        
        String term = "%" + searchTerm.toLowerCase() + "%";
        return find("restaurantId = :restaurantId AND (LOWER(name) LIKE :term OR LOWER(description) LIKE :term OR LOWER(category) LIKE :term)", 
                   Parameters.with("restaurantId", restaurantId).and("term", term)).list();
    }
    
    /**
     * Compter les items d'un restaurant
     */
    public long countByRestaurantId(UUID restaurantId) {
        return count("restaurantId", restaurantId);
    }
    
    /**
     * Compter les items disponibles d'un restaurant
     */
    public long countAvailableByRestaurantId(UUID restaurantId) {
        return count("restaurantId = :restaurantId AND isAvailable = true", 
                    Parameters.with("restaurantId", restaurantId));
    }
    
    /**
     * Trouver avec filtres
     */
    public List<MenuItem> findWithFilters(UUID restaurantId, String category, 
                                        Boolean isVegetarian, Boolean isVegan, 
                                        Boolean isAvailable, int page, int size) {
        StringBuilder query = new StringBuilder("restaurantId = :restaurantId");
        Parameters params = Parameters.with("restaurantId", restaurantId);
        
        if (category != null && !category.isEmpty()) {
            query.append(" AND category = :category");
            params.and("category", category);
        }
        
        if (isVegetarian != null) {
            query.append(" AND isVegetarian = :isVegetarian");
            params.and("isVegetarian", isVegetarian);
        }
        
        if (isVegan != null) {
            query.append(" AND isVegan = :isVegan");
            params.and("isVegan", isVegan);
        }
        
        if (isAvailable != null) {
            query.append(" AND isAvailable = :isAvailable");
            params.and("isAvailable", isAvailable);
        }
        
        return find(query.toString(), Sort.by("category", "name"), params)
               .page(page, size)
               .list();
    }
}