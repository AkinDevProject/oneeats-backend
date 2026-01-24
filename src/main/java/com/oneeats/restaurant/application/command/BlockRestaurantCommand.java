package com.oneeats.restaurant.application.command;

import java.util.UUID;

public record BlockRestaurantCommand(
    UUID restaurantId,
    String reason,
    boolean cancelPendingOrders  // Si true, annule automatiquement les commandes en cours
) {
    // Constructeur pour compatibilité (sans annulation auto)
    public BlockRestaurantCommand(UUID restaurantId, String reason) {
        this(restaurantId, reason, false);
    }
}
