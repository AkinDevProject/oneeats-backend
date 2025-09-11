package com.oneeats.menu.application.query;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Requête pour rechercher des items de menu
 */
public record SearchMenuItemsQuery(
    
    @NotNull(message = "Restaurant ID is required")
    UUID restaurantId,
    
    @NotBlank(message = "Search term is required")
    String searchTerm,
    
    Integer page,
    Integer size
    
) {
    
    /**
     * Constructeur avec valeurs par défaut
     */
    public SearchMenuItemsQuery {
        page = page != null ? page : 0;
        size = size != null ? size : 20;
    }
}