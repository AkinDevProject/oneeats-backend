package com.oneeats.order.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Requête pour créer une commande
 */
public record CreateOrderRequest(
    
    @NotNull(message = "L'ID du restaurant est obligatoire")
    UUID restaurantId,
    
    @Size(max = 500, message = "Les instructions spéciales ne peuvent pas dépasser 500 caractères")
    String specialInstructions,
    
    @NotEmpty(message = "La commande doit contenir au moins un article")
    @Valid
    List<CreateOrderItemRequest> items
    
) {
    
    /**
     * Record pour les items de la commande
     */
    public record CreateOrderItemRequest(
        
        @NotNull(message = "L'ID du menu item est obligatoire")
        UUID menuItemId,
        
        @NotNull(message = "Le nom du menu item est obligatoire")
        @Size(min = 1, max = 200, message = "Le nom doit faire entre 1 et 200 caractères")
        String menuItemName,
        
        @NotNull(message = "Le prix unitaire est obligatoire")
        BigDecimal unitPrice,
        
        @NotNull(message = "La quantité est obligatoire")
        @jakarta.validation.constraints.Min(value = 1, message = "La quantité doit être d'au moins 1")
        Integer quantity,
        
        @Size(max = 200, message = "Les notes spéciales ne peuvent pas dépasser 200 caractères")
        String specialNotes
    ) {}
}