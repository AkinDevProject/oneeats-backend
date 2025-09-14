package com.oneeats.menu.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * DTO pour les choix d'options de menu item dans les commandes
 */
public record MenuItemChoiceCommandDTO(

    String id,

    @NotBlank(message = "Choice name is required")
    @Size(min = 1, max = 100, message = "Choice name must be between 1 and 100 characters")
    String name,

    BigDecimal additionalPrice,

    // Support pour le frontend qui envoie "price"
    BigDecimal price,

    Integer displayOrder,

    Boolean isAvailable

) {

    public MenuItemChoiceCommandDTO {
        // Support pour les deux formats : "price" du frontend ou "additionalPrice" de l'API
        if (additionalPrice == null && price != null) {
            additionalPrice = price;
        }
        if (additionalPrice == null) {
            additionalPrice = BigDecimal.ZERO;
        }

        // Validation du prix
        if (additionalPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price must be >= 0");
        }

        displayOrder = displayOrder != null ? displayOrder : 0;
        isAvailable = isAvailable != null ? isAvailable : true;
    }
}