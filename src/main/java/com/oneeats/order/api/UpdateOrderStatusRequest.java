package com.oneeats.order.api;

import com.oneeats.order.domain.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Requête pour changer le statut d'une commande
 */
public record UpdateOrderStatusRequest(
    
    @NotNull(message = "Le nouveau statut est obligatoire")
    OrderStatus newStatus,
    
    String reason // Optionnel, pour les annulations par exemple
    
) {}