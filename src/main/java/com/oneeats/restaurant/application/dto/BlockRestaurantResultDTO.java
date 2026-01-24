package com.oneeats.restaurant.application.dto;

import java.util.List;
import java.util.UUID;

/**
 * Résultat du blocage d'un restaurant incluant les informations
 * sur les commandes en cours qui ont été annulées
 */
public record BlockRestaurantResultDTO(
    RestaurantDTO restaurant,
    int activeOrdersCount,           // Nombre de commandes actives avant blocage
    int cancelledOrdersCount,        // Nombre de commandes annulées
    List<UUID> cancelledOrderIds,    // IDs des commandes annulées
    boolean hasUncancelledOrders     // True si des commandes n'ont pas pu être annulées
) {
    // Constructeur simple quand pas de commandes à gérer
    public static BlockRestaurantResultDTO simple(RestaurantDTO restaurant) {
        return new BlockRestaurantResultDTO(restaurant, 0, 0, List.of(), false);
    }
}
