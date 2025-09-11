package com.oneeats.order.application.query;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Query pour récupérer les statistiques de commandes d'un restaurant pour une date donnée
 */
public class GetRestaurantOrderStatsQuery {
    private final UUID restaurantId;
    private final LocalDate date;

    public GetRestaurantOrderStatsQuery(UUID restaurantId, LocalDate date) {
        this.restaurantId = restaurantId;
        this.date = date;
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public LocalDate getDate() {
        return date;
    }
}