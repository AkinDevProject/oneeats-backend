package com.oneeats.menu.application.command;

import com.oneeats.menu.application.dto.MenuItemOptionCommandDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request DTO pour mettre à jour un item de menu (sans ID qui vient du path parameter)
 */
public record UpdateMenuItemRequest(

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

    Boolean isVegetarian,

    Boolean isVegan,

    Boolean isAvailable,

    // Support pour le frontend qui envoie "available"
    Boolean available,

    List<String> allergens,

    @Valid
    List<MenuItemOptionCommandDTO> options

) {

    /**
     * Constructeur avec validation et valeurs par défaut
     */
    public UpdateMenuItemRequest {
        // Support pour les deux formats : "available" du frontend ou "isAvailable" de l'API
        if (isAvailable == null && available != null) {
            isAvailable = available;
        }

        // Appliquer les valeurs par défaut
        allergens = allergens != null ? allergens : List.of();
        options = options != null ? options : List.of();

        // Validation de cohérence métier
        if (isVegan != null && isVegetarian != null && isVegan && !isVegetarian) {
            throw new IllegalArgumentException("If item is vegan, it must also be vegetarian");
        }
    }

    /**
     * Convertir en UpdateMenuItemCommand en ajoutant l'ID
     */
    public UpdateMenuItemCommand toCommand(java.util.UUID id) {
        return new UpdateMenuItemCommand(
            id,
            name,
            description,
            price,
            category,
            imageUrl,
            preparationTimeMinutes,
            isVegetarian,
            isVegan,
            isAvailable,
            available,
            allergens,
            options
        );
    }
}