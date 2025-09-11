package com.oneeats.menu.application.command;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Commande pour mettre à jour un item de menu existant
 */
public record UpdateMenuItemCommand(
    
    @NotNull(message = "Menu item ID is required")
    UUID id,
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    String description,
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    BigDecimal price,
    
    @NotBlank(message = "Category is required")
    String category,
    
    String imageUrl,
    
    Integer preparationTimeMinutes,
    
    boolean isVegetarian,
    
    boolean isVegan,
    
    boolean isAvailable,
    
    List<String> allergens
    
) {
    
    /**
     * Constructeur avec validation
     */
    public UpdateMenuItemCommand {
        // Appliquer les valeurs par défaut
        allergens = allergens != null ? allergens : List.of();
        
        // Validation de cohérence métier
        if (isVegan && !isVegetarian) {
            throw new IllegalArgumentException("If item is vegan, it must also be vegetarian");
        }
    }
}