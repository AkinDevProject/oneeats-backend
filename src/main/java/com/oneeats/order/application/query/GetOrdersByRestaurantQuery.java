package com.oneeats.order.application.query;

import java.util.UUID;

/**
 * Query pour récupérer les commandes d'un restaurant
 */
public class GetOrdersByRestaurantQuery {
    private final UUID restaurantId;

    public GetOrdersByRestaurantQuery(UUID restaurantId) {
        this.restaurantId = restaurantId;
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }
}