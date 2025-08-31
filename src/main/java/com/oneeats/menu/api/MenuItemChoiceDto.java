package com.oneeats.menu.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO pour les choix d'options d'articles de menu exposés via l'API REST
 */
public record MenuItemChoiceDto(
    UUID id,
    
    @NotNull(message = "L'ID de l'option de menu est obligatoire")
    UUID menuItemOptionId,
    
    @NotBlank(message = "Le nom du choix est obligatoire")
    String name,
    
    @DecimalMin(value = "0.0", message = "Le prix ne peut pas être négatif")
    BigDecimal price,
    
    Integer displayOrder,
    
    Boolean isAvailable,
    
    LocalDateTime createdAt,
    
    LocalDateTime updatedAt
) {
    
    // Constructeur de convenance pour création sans ID
    public MenuItemChoiceDto(UUID menuItemOptionId, String name, BigDecimal price) {
        this(null, menuItemOptionId, name, price != null ? price : BigDecimal.ZERO, 
             0, true, null, null);
    }
    
    // Constructeur de convenance pour choix sans prix
    public MenuItemChoiceDto(UUID menuItemOptionId, String name) {
        this(menuItemOptionId, name, BigDecimal.ZERO);
    }
}