package com.oneeats.menu.application.query;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Requête pour obtenir tous les items de menu d'un restaurant avec filtres optionnels
 */
public record GetRestaurantMenuQuery(
    
    @NotNull(message = "Restaurant ID is required")
    UUID restaurantId,
    
    String category,
    Boolean available,
    Boolean vegetarian,
    Boolean vegan,
    Integer page,
    Integer size
    
) {
    
    /**
     * Constructeur avec valeurs par défaut pour la pagination
     */
    public GetRestaurantMenuQuery {
        page = page != null ? page : 0;
        size = size != null ? size : 50;
    }
    
    /**
     * Factory method pour requête simple
     */
    public static GetRestaurantMenuQuery forRestaurant(UUID restaurantId) {
        return new GetRestaurantMenuQuery(restaurantId, null, null, null, null, 0, 50);
    }
    
    /**
     * Factory method pour items disponibles seulement
     */
    public static GetRestaurantMenuQuery availableItems(UUID restaurantId) {
        return new GetRestaurantMenuQuery(restaurantId, null, true, null, null, 0, 50);
    }
    
    /**
     * Vérifier si on ne veut que les items disponibles
     */
    public boolean onlyAvailable() {
        return available != null && available;
    }
}