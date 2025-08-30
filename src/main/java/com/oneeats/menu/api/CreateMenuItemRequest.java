package com.oneeats.menu.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO pour les requêtes de création d'item de menu
 */
public record CreateMenuItemRequest(
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
    
    Integer preparationTimeMinutes,
    
    Boolean isVegetarian,
    
    Boolean isVegan,
    
    String allergens
) {}