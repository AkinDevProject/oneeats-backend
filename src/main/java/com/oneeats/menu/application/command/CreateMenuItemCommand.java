package com.oneeats.menu.application.command;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Commande pour créer un nouvel item de menu
 * Encapsule toutes les données nécessaires à la création
 */
public record CreateMenuItemCommand(
    
    @NotNull(message = "Restaurant ID is required")
    UUID restaurantId,
    
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
     * Constructeur avec valeurs par défaut
     */
    public CreateMenuItemCommand {
        // Appliquer les valeurs par défaut
        allergens = allergens != null ? allergens : List.of();
        
        // Validation de cohérence métier
        if (isVegan && !isVegetarian) {
            throw new IllegalArgumentException("If item is vegan, it must also be vegetarian");
        }
    }
    
    /**
     * Factory method pour création simple
     */
    public static CreateMenuItemCommand create(UUID restaurantId, String name, String description,
                                              BigDecimal price, String category) {
        return new CreateMenuItemCommand(restaurantId, name, description, price, category,
                                        null, null, false, false, true, List.of());
    }
    
    
    /**
     * Obtenir le temps de préparation avec valeur par défaut
     */
    public int getPreparationTimeMinutes() {
        return preparationTimeMinutes != null ? preparationTimeMinutes : 15;
    }
}