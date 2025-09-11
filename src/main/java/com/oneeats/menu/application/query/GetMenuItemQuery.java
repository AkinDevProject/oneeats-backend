package com.oneeats.menu.application.query;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Requête pour obtenir un item de menu par son ID
 */
public record GetMenuItemQuery(
    
    @NotNull(message = "Menu item ID is required")
    UUID id
    
) {}