package com.oneeats.menu.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO pour les items de menu exposés via l'API REST
 */
public record MenuItemDto(
    UUID id,
    
    @NotNull(message = "L'ID du restaurant est obligatoire")
    UUID restaurantId,
    
    @NotBlank(message = "Le nom de l'item est obligatoire")
    String name,
    
    String description,
    
    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être positif")
    BigDecimal price,
    
    @NotBlank(message = "La catégorie est obligatoire")
    String category,
    
    String imageUrl,
    
    @NotNull(message = "La disponibilité est obligatoire")
    Boolean isAvailable,
    
    Integer preparationTimeMinutes,
    
    @NotNull(message = "L'information végétarienne est obligatoire")
    Boolean isVegetarian,
    
    @NotNull(message = "L'information végétalienne est obligatoire")
    Boolean isVegan,
    
    String allergens,
    
    List<MenuItemOptionDto> options,
    
    LocalDateTime createdAt,
    
    LocalDateTime updatedAt
) {
    
    // Constructeur de convenance pour création sans ID
    public MenuItemDto(UUID restaurantId, String name, String description, 
                      BigDecimal price, String category) {
        this(null, restaurantId, name, description, price, category, 
             null, true, null, false, false, null, List.of(), null, null);
    }
}