package com.oneeats.restaurant.infrastructure;

import com.oneeats.common.repository.BaseRepository;
import com.oneeats.restaurant.domain.Restaurant;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour les restaurants utilisant PanacheRepository
 */
@ApplicationScoped
public class RestaurantRepository extends BaseRepository<Restaurant> {
    
    /**
     * Trouver tous les restaurants actifs
     */
    public List<Restaurant> findActiveRestaurants() {
        return list("isActive = true", Sort.by("name"));
    }
    
    /**
     * Trouver les restaurants par type de cuisine
     */
    public List<Restaurant> findByCuisineType(String cuisineType) {
        return list("cuisineType", cuisineType, Sort.by("rating").descending());
    }
    
    /**
     * Trouver les restaurants ouverts
     */
    public List<Restaurant> findOpenRestaurants() {
        return list("isOpen = true AND isActive = true", Sort.by("name"));
    }
    
    /**
     * Trouver par email
     */
    public Optional<Restaurant> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }
    
    /**
     * Recherche textuelle dans les restaurants
     */
    @Override
    public List<Restaurant> search(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return findAll().list();
        }
        
        String term = "%" + searchTerm.toLowerCase() + "%";
        return find("LOWER(name) LIKE :term OR LOWER(description) LIKE :term OR LOWER(cuisineType) LIKE :term", 
                   Parameters.with("term", term)).list();
    }
    
    /**
     * Compter les restaurants actifs
     */
    public long countActiveRestaurants() {
        return count("isActive = true");
    }
    
    /**
     * Trouver les restaurants avec pagination et filtres
     */
    public List<Restaurant> findWithFilters(String cuisineType, Boolean isOpen, Boolean isActive,
                                          int page, int size) {
        StringBuilder query = new StringBuilder("1=1");
        Parameters params = Parameters.with("dummy", "value"); // Paramètre initial requis
        
        if (cuisineType != null && !cuisineType.isEmpty()) {
            query.append(" AND cuisineType = :cuisineType");
            params.and("cuisineType", cuisineType);
        }
        
        if (isOpen != null) {
            query.append(" AND isOpen = :isOpen");
            params.and("isOpen", isOpen);
        }
        
        if (isActive != null) {
            query.append(" AND isActive = :isActive");
            params.and("isActive", isActive);
        }
        
        // Si on a ajouté des filtres, utiliser la query, sinon retourner tout
        if (cuisineType != null || isOpen != null || isActive != null) {
            return find(query.toString(), Sort.by("createdAt").descending(), params)
                   .page(page, size)
                   .list();
        } else {
            return findAll(Sort.by("createdAt").descending())
                   .page(page, size)
                   .list();
        }
    }
    
    /**
     * Vérifier si un email existe déjà
     */
    public boolean existsByEmail(String email) {
        return count("email", email) > 0;
    }
}